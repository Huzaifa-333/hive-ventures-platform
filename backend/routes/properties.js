const express = require('express');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all properties (public)
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single property by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN ONLY ROUTES ==========

// Admin: Add new property
router.post('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Admin: Update property — saves currentValue for profit recalculation
// Admin: Update property
router.put('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // DEBUG — log exactly what body arrives
    console.log('PUT body received:', req.body);
    console.log('currentValue received:', req.body.currentValue);
    
    const { title, location, price, currentValue, status } = req.body;
    const parsedPrice = parseInt(price);
    const parsedCurrentValue = currentValue !== undefined && currentValue !== '' 
      ? parseInt(currentValue) 
      : parsedPrice;

    console.log('parsedCurrentValue:', parsedCurrentValue);

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { title, location, price: parsedPrice, currentValue: parsedCurrentValue, status } },
      { new: true }
    );

    console.log('saved property currentValue:', property.currentValue);
    res.json(property);
  } catch (error) {
    console.log('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Admin: Delete property
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;