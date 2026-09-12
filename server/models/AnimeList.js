const mongoose = require('mongoose');

const animeItemSchema = new mongoose.Schema({
  malId: { type: Number, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String },
  score: { type: Number },
  episodes: { type: Number },
  synopsis: { type: String },
  addedAt: { type: Date, default: Date.now },
});

const animeListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    anime: [animeItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnimeList', animeListSchema);
