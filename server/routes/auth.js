const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Profile = require('../models/Profile');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Create a base profile for the user
    const profile = new Profile({
      userId: user._id,
      full_name: `${firstName} ${lastName}`,
      email: email,
      skills: [],
      experience: [],
      education: [],
      certifications: []
    });
    await profile.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, userId: user._id, user: { email, firstName, lastName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user._id, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: 'Google Client ID not configured on server' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: profilePicture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profilePicture) user.profilePicture = profilePicture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email,
        googleId,
        firstName,
        lastName,
        profilePicture
      });
      await user.save();

      // Create profile
      const profile = new Profile({
        userId: user._id,
        full_name: `${firstName} ${lastName}`,
        email: email,
        profile_picture_url: profilePicture,
        skills: [],
        experience: [],
        education: [],
        certifications: []
      });
      await profile.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user._id, user: { email: user.email, firstName: user.firstName, lastName: user.lastName, profilePicture: user.profilePicture } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

module.exports = router;
