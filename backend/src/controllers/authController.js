const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const nodemailer = require('nodemailer');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: email === 'admin@admin.com' || email === 'admin' || email === 'nathanchandraa6@gmail.com' || email === 'nathanspace.co@gmail.com' ? 'ADMIN' : 'USER',
      }
    });

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // User registered via Google, doesn't have a password
    if (!user.password) {
      return res.status(400).json({ error: 'Akun ini terdaftar via Google. Gunakan tombol "Masuk dengan Google".' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID token is required' });

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid: googleId, email, name, picture } = decodedToken;

    // Find user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (user) {
      // Link Google if user existed by email but not yet linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: picture },
        });
      }
    } else {
      // New user — create without password
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          avatarUrl: picture,
          role: 'USER',
        },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed', details: error.message });
  }
};

exports.getMe = async (req, res) => {  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan di sistem' });
    }

    // Generate 6 digit OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Valid for 15 minutes
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode, resetCodeExpiry }
    });

    const mailOptions = {
      from: `"Bengkel Mouse" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: 'Kode OTP Reset Password - Bengkel Mouse',
      text: `Halo ${user.name},\n\nKode OTP kamu untuk mereset password adalah: ${resetCode}\n\nKode ini akan kedaluwarsa dalam 15 menit.\nJika kamu tidak meminta reset password, abaikan email ini.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Kode OTP telah dikirim ke email kamu' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: 'Gagal mengirim email reset password', details: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    if (user.resetCode !== otp) {
      return res.status(400).json({ error: 'Kode OTP salah' });
    }

    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ error: 'Kode OTP sudah kedaluwarsa' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      }
    });

    res.json({ message: 'Password berhasil diubah. Silakan login dengan password baru.' });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: 'Gagal mengubah password', details: error.message });
  }
};
