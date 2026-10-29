const express = require('express');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit contact form — public
router.post('/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contact messages — admin only
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin sends response
router.put('/respond/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { adminResponse } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { adminResponse },
      { new: true }
    );
    res.json({ message: 'Response sent', contact });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check response by name+email
router.post('/check-response', async (req, res) => {
  try {
    const { name, email } = req.body;
    const contact = await Contact.findOne({ name, email }).sort({ createdAt: -1 });
    if (!contact) {
      return res.status(404).json({ message: 'No message found' });
    }
    res.json({ adminResponse: contact.adminResponse || '', found: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact message (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;