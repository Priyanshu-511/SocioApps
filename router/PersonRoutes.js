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
        // Get latest uploads from ALL users, not just the current user
        const uploads = await Upload.find({})
            .populate('userId', 'name email') // Get user info for each upload
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.render('home', { 
            userMessage: `Name: ${req.user.name}`, 
            userEmail:`Email: ${req.user.email}`,
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
        console.log('Upload request received');
        console.log('User:', req.user);
        console.log('File:', req.file);
        console.log('Body:', req.body);
        
        if (!req.file) {
            console.log('No file uploaded');
            const uploads = await Upload.find({})
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(10);
            return res.render('home', { 
                message: `Welcome, ${req.user.name}!`, 
                error: 'No file uploaded or invalid file type', 
                files: uploads 
            });
        }
        
        const { title, description } = req.body;
        if (!title || !description) {
            console.log('Missing title or description');
            const uploads = await Upload.find({})
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(10);
            return res.render('home', { 
                message: `Welcome, ${req.user.name}!`, 
                error: 'Title and description are required', 
                files: uploads 
            });
        }

        // Create the upload entry
        const uploadEntry = new Upload({
            userId: req.user.id, // Use req.user.id instead of req.user._id
            filename: req.file.filename,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: path.extname(req.file.filename).toLowerCase().replace('.', ''),
            title: title.trim(),
            description: description.trim()
        });

        console.log('Creating upload entry:', uploadEntry);
        await uploadEntry.save();
        console.log('Upload saved successfully');
        
        // Redirect to home to show the updated list
        res.redirect('/home');
        
    } catch (err) {
        console.error('Upload error:', err);
        console.error('Error stack:', err.stack);
        
        try {
            const uploads = await Upload.find({})
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(10);
            res.render('home', { 
                message: `Welcome, ${req.user.name}!`, 
                error: `Error uploading file: ${err.message}`, 
                files: uploads 
            });
        } catch (renderErr) {
            console.error('Error rendering home page:', renderErr);
            res.status(500).send('Server error');
        }
    }
});
router.get('/search', async (req, res) => {
  try {
    const { query, type } = req.query;
    let results = [];
    
    console.log('Search request:', { query, type });
    
    if (query) {
      if (type === 'users' || !type) {
        // Search for users by name or email (fixed field names)
        const users = await User.find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }).select('name email createdAt');
        
        console.log('Found users:', users.length);
        
        results = users.map(user => ({
          type: 'user',
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }));
      }
      
      if (type === 'uploads' || !type) {
        // Search for uploads by title or description
        const uploads = await Upload.find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        }).populate('userId', 'name email');
        
        console.log('Found uploads:', uploads.length);
        
        const uploadResults = uploads.map(upload => ({
          type: 'upload',
          id: upload._id,
          title: upload.title,
          description: upload.description,
          fileUrl: upload.fileUrl,
          filename: upload.filename,
          fileType: upload.fileType,
          uploadedBy: upload.userId ? upload.userId.name : 'Unknown',
          uploadedById: upload.userId ? upload.userId._id : null,
          createdAt: upload.createdAt
        }));
        
        results = [...results, ...uploadResults];
      }
    }
    
    console.log('Total results:', results.length);
    res.json({ success: true, results, totalFound: results.length });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Search failed', details: error.message });
  }
});

// Get user profile and their uploads (fixed field names)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Getting user profile for:', userId);
    
    // Get user details
    const user = await User.findById(userId).select('name email createdAt');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get user's uploads
    const uploads = await Upload.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log('Found uploads for user:', uploads.length);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      uploads: uploads.map(upload => ({
        id: upload._id,
        title: upload.title,
        description: upload.description,
        fileUrl: upload.fileUrl,
        filename: upload.filename,
        fileType: upload.fileType,
        createdAt: upload.createdAt
      })),
      totalUploads: uploads.length
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to load user profile', details: error.message });
  }
});


// Add these debug routes to your PersonRoutes.js (temporary for debugging)

// Debug route to check uploads in database
router.get('/debug/uploads', jsonmiddleAuth, async (req, res) => {
    try {
        const uploads = await Upload.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            totalUploads: uploads.length,
            uploads: uploads,
            currentUser: req.user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Debug route to check users in database
router.get('/debug/users', jsonmiddleAuth, async (req, res) => {
    try {
        const users = await User.find({}).select('name email createdAt');
        res.json({
            totalUsers: users.length,
            users: users,
            currentUser: req.user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Debug route to check file system
router.get('/debug/files', jsonmiddleAuth, (req, res) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    try {
        const files = fs.readdirSync(uploadDir);
        res.json({
            uploadDirectory: uploadDir,
            filesInDirectory: files,
            directoryExists: fs.existsSync(uploadDir)
        });
    } catch (err) {
        res.json({
            uploadDirectory: uploadDir,
            error: err.message,
            directoryExists: fs.existsSync(uploadDir)
        });
    }
});

// Add this debug route to your PersonRoutes.js

router.get('/debug/search-test', jsonmiddleAuth, async (req, res) => {
    try {
        // Get all users
        const allUsers = await User.find({}).select('name email createdAt');
        
        // Get all uploads
        const allUploads = await Upload.find({}).populate('userId', 'name email');
        
        // Test search functionality
        const testQuery = 'test'; // Change this to test different queries
        
        const userResults = await User.find({
            $or: [
                { name: { $regex: testQuery, $options: 'i' } },
                { email: { $regex: testQuery, $options: 'i' } }
            ]
        }).select('name email createdAt');
        
        const uploadResults = await Upload.find({
            $or: [
                { title: { $regex: testQuery, $options: 'i' } },
                { description: { $regex: testQuery, $options: 'i' } }
            ]
        }).populate('userId', 'name email');
        
        res.json({
            database_status: {
                totalUsers: allUsers.length,
                totalUploads: allUploads.length,
                users: allUsers.map(u => ({ id: u._id, name: u.name, email: u.email })),
                uploads: allUploads.map(u => ({ 
                    id: u._id, 
                    title: u.title, 
                    description: u.description,
                    uploader: u.userId ? u.userId.name : 'No user'
                }))
            },
            search_test: {
                query: testQuery,
                foundUsers: userResults.length,
                foundUploads: uploadResults.length,
                userResults: userResults.map(u => ({ name: u.name, email: u.email })),
                uploadResults: uploadResults.map(u => ({ 
                    title: u.title, 
                    description: u.description,
                    uploader: u.userId ? u.userId.name : 'No user'
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});


module.exports = router;