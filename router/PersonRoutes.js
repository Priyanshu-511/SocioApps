const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const Upload = require('../models/uploadSchema');
const { generateTokens, jsonmiddleAuth } = require('../middleware/jwtAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|mp4|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb('Error: Images, videos, or text files only!');
    }
});

router.get('/', (req, res) => {
    res.render('index', { message: null, error: null });
});

router.get('/home', jsonmiddleAuth, async (req, res) => {
    try {
        const uploads = await Upload.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.render('home', { 
            message: `Welcome, ${req.user.name}!`, 
            error: null, 
            files: uploads 
        });
    } catch (err) {
        console.error('Home page error:', err);
        res.render('home', { 
            message: `Welcome, ${req.user.name}!`, 
            error: 'Error loading uploads', 
            files: [] 
        });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.render('index', { 
                message: null, 
                error: 'User with this email already exists' 
            });
        }
        
        const user = new User({ 
            name, 
            email, 
            password 
        });
        
        await user.save();
        
        const token = generateTokens(user);
        
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000
        });
        
        res.redirect('/home');
        
    } catch (err) {
        console.error('Signup error:', err);
        res.render('index', { 
            message: null, 
            error: `Error creating user: ${err.message}` 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.render('index', { 
                message: null, 
                error: 'Invalid email or password' 
            });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for email:', email);
            return res.render('index', { 
                message: null, 
                error: 'Invalid email or password' 
            });
        }
        
        const token = generateTokens(user);
        
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });
        
        res.redirect('/home');
        
    } catch (err) {
        console.error('Login error:', err);
        res.render('index', { 
            message: null, 
            error: `Error logging in: ${err.message}` 
        });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/');
});

router.post('/upload', jsonmiddleAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.render('home', { 
                message: `Welcome, ${req.user.name}!`, 
                error: 'No file uploaded or invalid file type', 
                files: await Upload.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10) 
            });
        }
        const { title, description } = req.body;
        if (!title || !description) {
            return res.render('home', { 
                message: `Welcome, ${req.user.name}!`, 
                error: 'Title and description are required', 
                files: await Upload.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10) 
            });
        }

        const uploadEntry = new Upload({
            userId: req.user._id,
            filename: req.file.filename,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: path.extname(req.file.filename).toLowerCase().replace('.', ''),
            title,
            description
        });

        await uploadEntry.save();
        res.redirect('/home');
    } catch (err) {
        console.error('Upload error:', err);
        res.render('home', { 
            message: `Welcome, ${req.user.name}!`, 
            error: `Error uploading file: ${err.message}`, 
            files: await Upload.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10) 
        });
    }
});

module.exports = router;