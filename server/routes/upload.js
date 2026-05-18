const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../lib/supabase');

// Bucket name — must match what you created in Supabase Storage dashboard
const BUCKET = 'profile-pictures';

// 5 MB limit, memory storage (same as before)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
  },
});

// ---------------------------------------------------------------------------
// POST /api/upload/profile-picture
// Replaces Cloudinary stream-upload with Supabase Storage upload.
// Returns: { url: "https://..." }  — same response shape as before.
// ---------------------------------------------------------------------------
router.post('/profile-picture', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // Build a unique storage path:  careerforge_profiles/<timestamp>-<originalname>
    const ext      = path.extname(req.file.originalname) || '.jpg';
    const baseName = path.basename(req.file.originalname, ext).replace(/\s+/g, '_');
    const filePath = `careerforge_profiles/${Date.now()}-${baseName}${ext}`;

    // Upload buffer to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert:      false,       // always a fresh unique path so no collisions
      });

    if (uploadError) throw uploadError;

    // Get the permanent public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Supabase Storage upload error:', err);
    return res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;
