import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import api from '../api/axios';

const ANILIST_URL = 'https://graphql.anilist.co';

// GraphQL query — returns id, idMal, title, cover image, score, episodes, format, description
const SEARCH_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        idMal
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        episodes
        format
        description(asHtml: false)
        status
        seasonYear
      }
    }
  }
`;

/** Strip HTML tags that AniList occasionally leaves in descriptions */
function stripHtml(str) {
  return str ? str.replace(/<[^>]*>/g, '') : '';
}

/** Prefer English title, fall back to romaji */
function getTitle(title) {
  return title.english || title.romaji || 'Unknown';
}

/** AniList scores are 0-100; convert to a 1-decimal x/10 string */
function fmtScore(score) {
  if (!score) return null;
  return (score / 10).toFixed(1);
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [adding, setAdding] = useState({}); // { [id]: 'loading' | 'done' | 'exists' }
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const { data } = await axios.post(
        ANILIST_URL,
        {
          query: SEARCH_QUERY,
          variables: { search: q, page: 1, perPage: 12 },
        },
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
      );
      setResults(data?.data?.Page?.media || []);
    } catch {
      setSearchError('Search failed. Please check your connection and try again.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleAdd = async (anime) => {
    // Use AniList id as our malId (idMal can be null for some titles)
    const malId = anime.idMal ?? anime.id;
    setAdding((a) => ({ ...a, [anime.id]: 'loading' }));
    try {
      const synopsis = stripHtml(anime.description);
      await api.post('/list', {
        malId,
        title: getTitle(anime.title),
        imageUrl: anime.coverImage?.large || '',
        score: anime.averageScore ? parseFloat(fmtScore(anime.averageScore)) : null,
        episodes: anime.episodes,
        synopsis: synopsis.length > 500 ? synopsis.slice(0, 500) + '…' : synopsis,
      });
      setAdding((a) => ({ ...a, [anime.id]: 'done' }));
    } catch (err) {
      if (err.response?.status === 409) {
        setAdding((a) => ({ ...a, [anime.id]: 'exists' }));
      } else {
        setAdding((a) => ({ ...a, [anime.id]: null }));
        alert(err.response?.data?.message || 'Failed to add anime');
      }
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Find your next anime</h1>
        <p style={styles.heroSub}>Search from thousands of titles and add them to your list</p>
        <div style={styles.searchBar}>
          <input
            className="input"
            style={styles.searchInput}
            type="text"
            placeholder="e.g. Attack on Titan, Demon Slayer…"
            value={query}
            onChange={handleInput}
            autoFocus
          />
          {searching && <span style={styles.spinner}>⏳</span>}
        </div>
      </div>

      {searchError && <p style={styles.errorMsg}>{searchError}</p>}

      {results.length > 0 && (
        <div style={styles.grid}>
          {results.map((anime) => {
            const status = adding[anime.id];
            const isAdded = status === 'done' || status === 'exists';
            const title = getTitle(anime.title);
            const score = fmtScore(anime.averageScore);
            const synopsis = stripHtml(anime.description);
            return (
              <div key={anime.id} style={styles.card}>
                <img
                  src={anime.coverImage?.large}
                  alt={title}
                  style={styles.poster}
                  loading="lazy"
                />
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{title}</h3>
                  <div style={styles.meta}>
                    {score && <span style={styles.badge}>⭐ {score}</span>}
                    {anime.episodes && (
                      <span style={styles.badge}>{anime.episodes} eps</span>
                    )}
                    {anime.format && (
                      <span style={styles.badge}>{anime.format.replace(/_/g, ' ')}</span>
                    )}
                    {anime.seasonYear && (
                      <span style={styles.badge}>{anime.seasonYear}</span>
                    )}
                  </div>
                  {synopsis && (
                    <p style={styles.synopsis}>
                      {synopsis.length > 120 ? synopsis.slice(0, 120) + '…' : synopsis}
                    </p>
                  )}
                  <button
                    className={`btn ${isAdded ? 'btn-ghost' : 'btn-primary'}`}
                    style={styles.addBtn}
                    onClick={() => handleAdd(anime)}
                    disabled={isAdded || status === 'loading'}
                  >
                    {status === 'loading'
                      ? 'Adding…'
                      : status === 'done'
                      ? '✓ Added'
                      : status === 'exists'
                      ? '✓ In list'
                      : '+ Add to list'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searching && query && results.length === 0 && !searchError && (
        <p style={styles.empty}>No results found for "{query}"</p>
      )}

      {!query && (
        <p style={styles.hint}>Start typing to search anime powered by AniList</p>
      )}
    </main>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },
  hero: { textAlign: 'center', marginBottom: '36px' },
  heroTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '8px' },
  heroSub: { color: 'var(--text-muted)', marginBottom: '24px' },
  searchBar: {
    position: 'relative',
    maxWidth: '560px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchInput: { fontSize: '1rem', padding: '13px 16px' },
  spinner: { fontSize: '1.2rem', flexShrink: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.15s',
  },
  poster: { width: '100%', aspectRatio: '2/3', objectFit: 'cover' },
  cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  cardTitle: { fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 },
  meta: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  badge: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  synopsis: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    flex: 1,
  },
  addBtn: { marginTop: 'auto', width: '100%' },
  empty: { textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' },
  hint: { textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' },
  errorMsg: {
    textAlign: 'center',
    color: '#f08080',
    background: '#3b1a1a',
    border: '1px solid var(--danger)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '24px',
  },
};
