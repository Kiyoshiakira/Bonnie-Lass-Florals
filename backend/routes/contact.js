const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Rate limiter for contact form - 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many contact form submissions, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Helper function to send email notifications
async function sendEmailNotification(messageData) {
  // Check if SMTP environment variables are configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.EMAIL_FROM;
  const adminEmails = process.env.ADMIN_EMAILS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailFrom || !adminEmails) {
    logger.info('SMTP not fully configured. Skipping email notification.');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Parse admin emails
    const recipients = adminEmails.split(',').map(email => email.trim());

    // Send email
    await transporter.sendMail({
      from: emailFrom,
      to: recipients,
      subject: `New Contact Form Submission from ${messageData.name}`,
      text: `You have received a new contact form submission:\n\nName: ${messageData.name}\nEmail: ${messageData.email}\n\nMessage:\n${messageData.message}\n\nSubmitted at: ${new Date().toLocaleString()}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${messageData.name}</p>
        <p><strong>Email:</strong> ${messageData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${messageData.message.replace(/\n/g, '<br>')}</p>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `
    });

    logger.info('Email notification sent successfully');
  } catch (error) {
    logger.error('Failed to send email notification:', error);
    // Don't throw - email failure shouldn't block the contact form submission
  }
}

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields required.' });
    }

    // Basic email validation - simplified to avoid ReDoS
    if (!email.includes('@') || email.length < 3 || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Save to database
    const newMessage = new Message({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });

    await newMessage.save();
    logger.info('Contact message saved to database:', newMessage._id);

    // Send email notification asynchronously (don't wait for it)
    sendEmailNotification({
      name: newMessage.name,
      email: newMessage.email,
      message: newMessage.message
    }).catch(err => logger.error('Email notification error:', err));

    res.json({ message: 'Message sent! Thank you for contacting us.' });
  } catch (error) {
    logger.error('Error processing contact form:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
