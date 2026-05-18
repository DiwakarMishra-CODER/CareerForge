const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../lib/supabase');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ---------------------------------------------------------------------------
// Helper: map a Supabase users row → the shape the frontend already expects
// ---------------------------------------------------------------------------
function mapUser(row) {
  return {
    _id:            row.id,          // legacy field name the frontend may use
    id:             row.id,
    email:          row.email,
    firstName:      row.first_name,
    lastName:       row.last_name,
    profilePicture: row.profile_picture,
    googleId:       row.google_id,
    createdAt:      row.created_at,
  };
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password (mirrors the Mongoose pre-save hook)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert({
        email:      email.toLowerCase().trim(),
        password:   hashedPassword,
        first_name: firstName,
        last_name:  lastName,
      })
      .select()
      .single();

    if (userErr) throw userErr;

    // Create baseline profile for the new user
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({
        user_id:   user.id,
        full_name: `${firstName} ${lastName}`,
        email:     user.email,
        skills:    [],
        certifications: [],
      });

    if (profileErr) throw profileErr;

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      userId: user.id,
      user: { email: user.email, firstName: user.first_name, lastName: user.last_name },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Google-only users have no password
    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      userId: user.id,
      user: { email: user.email, firstName: user.first_name, lastName: user.last_name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/google
// Frontend sends { idToken } — this does NOT change.
// We only replace the Mongoose DB calls with Supabase equivalents.
// ---------------------------------------------------------------------------
router.post('/google', async (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Client ID not configured on server' });
    }

    const { idToken } = req.body;

    // --- Step 1: Verify the Google ID token (UNCHANGED) ---
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const {
      sub:          googleId,
      email,
      given_name:   firstName,
      family_name:  lastName,
      picture:      profilePicture,
    } = payload;

    // --- Step 2: Look up existing user by email ---
    let { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (user) {
      // User exists — patch google_id / profile_picture if missing
      const updates = {};
      if (!user.google_id)       updates.google_id       = googleId;
      if (!user.profile_picture) updates.profile_picture = profilePicture;

      if (Object.keys(updates).length > 0) {
        const { data: updated, error: updateErr } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        user = updated;
      }
    } else {
      // New user — create user row
      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert({
          email:           email.toLowerCase().trim(),
          google_id:       googleId,
          first_name:      firstName,
          last_name:       lastName,
          profile_picture: profilePicture,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      user = newUser;

      // Create baseline profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({
          user_id:             user.id,
          full_name:           `${firstName} ${lastName}`,
          email:               user.email,
          profile_picture_url: profilePicture,
          skills:              [],
          certifications:      [],
        });

      if (profileErr) throw profileErr;
    }

    // --- Step 3: Sign our own JWT (UNCHANGED logic) ---
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      userId: user.id,
      user: {
        email:          user.email,
        firstName:      user.first_name,
        lastName:       user.last_name,
        profilePicture: user.profile_picture,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(400).json({ message: 'Google authentication failed' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_picture, google_id, created_at')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(mapUser(user));
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
});

module.exports = router;
