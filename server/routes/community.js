const express = require('express');
const AnimeList = require('../models/AnimeList');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();

// GET /api/community — all users' lists (requires auth so we know who "you" are)
router.get('/', protect, async (req, res) => {
  try {
    const lists = await AnimeList.find({ 'anime.0': { $exists: true } })
      .populate('user', 'username createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Shape: [{ userId, username, memberSince, animeCount, recentAnime[] }]
    const feed = lists
      .filter((l) => l.user) // skip orphaned docs
      .map((l) => ({
        userId: l.user._id,
        username: l.user.username,
        memberSince: l.user.createdAt,
        animeCount: l.anime.length,
        // 4 most recently added for preview
        recentAnime: l.anime
          .slice()
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
          .slice(0, 4),
        updatedAt: l.updatedAt,
      }));

    res.json({ feed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/community/users/:username — public profile + full list
router.get('/users/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    }).select('username createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const list = await AnimeList.findOne({ user: user._id }).lean();
    const anime = list
      ? list.anime
          .slice()
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      : [];

    res.json({
      profile: {
        userId: user._id,
        username: user.username,
        memberSince: user.createdAt,
        animeCount: anime.length,
      },
      anime,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
