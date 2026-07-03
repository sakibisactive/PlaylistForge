const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/encryption');
const spotifyService = require('../services/spotifyService');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'playlistforge_jwt_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      passwordHash
    });

    const token = generateToken(user._id);
    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        spotifyId: user.spotifyId,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    logger.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide credentials' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        spotifyId: user.spotifyId,
        spotifyLinked: !!user.spotifyAccessToken,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Initiate Spotify OAuth 2.0 PKCE Flow
// @route   POST /api/auth/spotify
exports.initiateSpotifyAuth = async (req, res) => {
  try {
    const { verifier, challenge } = spotifyService.generatePKCE();
    
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-modify-private',
      'playlist-modify-public'
    ].join(' ');

    const clientId = process.env.SPOTIFY_CLIENT_ID || 'mock_client_id';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/auth/spotify/callback';

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${challenge}`;

    res.json({
      authUrl,
      codeVerifier: verifier
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating Spotify Auth' });
  }
};

// @desc    Spotify OAuth Callback
// @route   GET /api/auth/spotify/callback
exports.spotifyCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Handle mock token exchange if in mock mode
    let spotifyId = 'spotify_user_' + Date.now();
    let accessToken = 'mock_spotify_access_token';
    let refreshToken = 'mock_spotify_refresh_token';

    if (!spotifyService.isMockMode() && code) {
      // Perform token exchange with Spotify REST API
      const tokenRes = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token;
    }

    // Encrypt tokens before storing in database
    const encryptedAccess = encrypt(accessToken);
    const encryptedRefresh = encrypt(refreshToken);

    // If req.user exists (logged in user linking Spotify account)
    let user;
    if (req.user) {
      user = await User.findById(req.user._id);
      user.spotifyId = spotifyId;
      user.spotifyAccessToken = encryptedAccess;
      user.spotifyRefreshToken = encryptedRefresh;
      await user.save();
    } else {
      // Find or create user via Spotify login
      user = await User.findOne({ spotifyId });
      if (!user) {
        user = await User.create({
          username: `spotify_${spotifyId.substring(0, 8)}`,
          email: `${spotifyId}@spotify.user`,
          passwordHash: await bcrypt.hash('spotify_oauth_pass', 10),
          spotifyId,
          spotifyAccessToken: encryptedAccess,
          spotifyRefreshToken: encryptedRefresh
        });
      }
    }

    const token = generateToken(user._id);
    const clientRedirect = `${process.env.CLIENT_URL || 'http://localhost:5173'}?token=${token}&spotifyLinked=true`;
    
    res.redirect(clientRedirect);
  } catch (error) {
    logger.error('Spotify callback error:', error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=spotify_auth_failed`);
  }
};

// @desc    Get Current Logged In User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        spotifyId: user.spotifyId,
        spotifyLinked: !!user.spotifyAccessToken,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
