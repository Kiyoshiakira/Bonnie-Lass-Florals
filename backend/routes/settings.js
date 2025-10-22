const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const firebaseAdminAuth = require('../middleware/firebaseAdminAuth');

// Helper function to validate hex color
function isValidHex(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Helper function to validate theme object
function validateTheme(theme) {
  const requiredKeys = ['primary', 'primary2', 'accent', 'green', 'cream'];
  for (const key of requiredKeys) {
    if (!theme[key] || !isValidHex(theme[key])) {
      return false;
    }
  }
  return true;
}

// GET /api/settings/theme - Public endpoint to retrieve saved theme
router.get('/theme', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'site_theme' });
    if (!setting) {
      return res.json({ theme: null });
    }
    res.json({ theme: setting.value });
  } catch (err) {
    console.error('Error fetching theme:', err);
    res.status(500).json({ error: 'Failed to fetch theme.' });
  }
});

// POST /api/settings/theme - Admin-only endpoint to save theme
router.post('/theme', firebaseAdminAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme || !validateTheme(theme)) {
      return res.status(400).json({ 
        error: 'Invalid theme. Required keys: primary, primary2, accent, green, cream (all valid hex colors)' 
      });
    }

    // Upsert the theme setting
    const setting = await Setting.findOneAndUpdate(
      { key: 'site_theme' },
      { key: 'site_theme', value: theme, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Theme saved successfully!', theme: setting.value });
  } catch (err) {
    console.error('Error saving theme:', err);
    res.status(500).json({ error: 'Failed to save theme.' });
  }
});

// GET /api/settings/presets - Public endpoint to retrieve presets
router.get('/presets', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'palette_presets' });
    if (!setting) {
      return res.json({ presets: [] });
    }
    res.json({ presets: setting.value || [] });
  } catch (err) {
    console.error('Error fetching presets:', err);
    res.status(500).json({ error: 'Failed to fetch presets.' });
  }
});

// POST /api/settings/presets - Admin-only endpoint to add a preset
router.post('/presets', firebaseAdminAuth, async (req, res) => {
  try {
    const { preset } = req.body;
    
    if (!preset || !preset.name || !preset.colors || !validateTheme(preset.colors)) {
      return res.status(400).json({ 
        error: 'Invalid preset. Required: name (string) and colors (object with primary, primary2, accent, green, cream)' 
      });
    }

    // Get existing presets or initialize empty array
    let setting = await Setting.findOne({ key: 'palette_presets' });
    let presets = setting ? setting.value : [];
    
    // Add new preset with generated ID and timestamp
    const newPreset = {
      _id: Date.now().toString(),
      name: preset.name,
      colors: preset.colors,
      createdAt: new Date()
    };
    
    presets.push(newPreset);

    // Save updated presets
    setting = await Setting.findOneAndUpdate(
      { key: 'palette_presets' },
      { key: 'palette_presets', value: presets, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Preset saved successfully!', preset: newPreset });
  } catch (err) {
    console.error('Error saving preset:', err);
    res.status(500).json({ error: 'Failed to save preset.' });
  }
});

// DELETE /api/settings/presets/:id - Admin-only endpoint to delete a preset
router.delete('/presets/:id', firebaseAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const setting = await Setting.findOne({ key: 'palette_presets' });
    if (!setting) {
      return res.status(404).json({ error: 'No presets found.' });
    }

    let presets = setting.value || [];
    const initialLength = presets.length;
    presets = presets.filter(p => p._id !== id);

    if (presets.length === initialLength) {
      return res.status(404).json({ error: 'Preset not found.' });
    }

    // Save updated presets
    await Setting.findOneAndUpdate(
      { key: 'palette_presets' },
      { key: 'palette_presets', value: presets, updatedAt: Date.now() }
    );

    res.json({ message: 'Preset deleted successfully!' });
  } catch (err) {
    console.error('Error deleting preset:', err);
    res.status(500).json({ error: 'Failed to delete preset.' });
  }
});

module.exports = router;
