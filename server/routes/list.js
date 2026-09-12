const express = require('express');
const protect = require('../middleware/auth');
const AnimeList = require('../models/AnimeList');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/list — get the current user's anime list
router.get('/', async (req, res) => {
  try {
    let list = await AnimeList.findOne({ user: req.user.id });
    if (!list) {
      list = await AnimeList.create({ user: req.user.id, anime: [] });
    }
    res.json({ anime: list.anime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/list — add an anime to the list
router.post('/', async (req, res) => {
  const { malId, title, imageUrl, score, episodes, synopsis } = req.body;

  if (!malId || !title) {
    return res.status(400).json({ message: 'malId and title are required' });
  }

  try {
    let list = await AnimeList.findOne({ user: req.user.id });
    if (!list) {
      list = await AnimeList.create({ user: req.user.id, anime: [] });
    }

    const alreadyAdded = list.anime.some((a) => a.malId === malId);
    if (alreadyAdded) {
      return res.status(409).json({ message: 'Anime already in your list' });
    }

    list.anime.push({ malId, title, imageUrl, score, episodes, synopsis });
    await list.save();

    res.status(201).json({ anime: list.anime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/list/:malId — remove an anime from the list
router.delete('/:malId', async (req, res) => {
  const malId = parseInt(req.params.malId, 10);

  try {
    const list = await AnimeList.findOne({ user: req.user.id });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const before = list.anime.length;
    list.anime = list.anime.filter((a) => a.malId !== malId);

    if (list.anime.length === before) {
      return res.status(404).json({ message: 'Anime not found in your list' });
    }

    await list.save();
    res.json({ anime: list.anime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
