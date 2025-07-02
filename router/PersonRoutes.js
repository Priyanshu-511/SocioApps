const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const { generateTokens, jsonmiddleAuth } = require('../middleware/jwtAuth');

router.get('/', (req, res) => {
    res.render('index', { message: null, error: null });
});

router.get('/home', jsonmiddleAuth, (req, res) => {
    res.render('home', { message: `Welcome, ${req.user.name}!`, error: null });
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

module.exports = router;