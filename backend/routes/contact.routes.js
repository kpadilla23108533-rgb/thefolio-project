const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // 1. Ensure this path and casing are correct

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 2. CREATE and SAVE to MongoDB
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save(); 

    console.log('Message saved to DB:', newContact);
    res.status(200).json({ message: 'Message received! We will get back to you soon.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
