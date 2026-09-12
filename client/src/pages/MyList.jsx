import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function MyList() {
  const { user } = useAuth();
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    const fetchList = async () => {
      try {
        const { data } = await api.get('/list');
        setAnime(data.anime);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your list');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const handleRemove = async (malId) => {
    setRemoving((r) => ({ ...r, [malId]: true }));
    try {
      const { data } = await api.delete(`/list/${malId}`);
      setAnime(data.anime);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove anime');
    } finally {
      setRemoving((r) => ({ ...r, [malId]: false }));
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading your list…</div>;
  }

  if (error) {
    return <div style={{ ...styles.center, color: '#f08080' }}>{error}</div>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Anime List</h1>
          <p style={styles.sub}>
            {anime.length === 0
              ? 'Your list is empty'
              : `${anime.length} title${anime.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          + Search Anime
        </Link>
      </div>

      {anime.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🎌</p>
          <p style={styles.emptyText}>Nothing here yet.</p>
          <p style={styles.emptySub}>Search for an anime and click "Add to list".</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Anime
          </Link>
        </div>
      ) : (
        <div style={styles.list}>
          {anime
            .slice()
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .map((item) => (
              <div key={item.malId} style={styles.row}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={styles.thumb}
                  loading="lazy"
                />
                <div style={styles.info}>
                  <h3 style={styles.rowTitle}>{item.title}</h3>
                  <div style={styles.meta}>
                    {item.score && <span style={styles.badge}>⭐ {item.score}</span>}
                    {item.episodes && (
                      <span style={styles.badge}>{item.episodes} eps</span>
                    )}
                    <span style={styles.dateAdded}>
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.synopsis && (
                    <p style={styles.synopsis}>
                      {item.synopsis.length > 180
                        ? item.synopsis.slice(0, 180) + '…'
                        : item.synopsis}
                    </p>
                  )}
                </div>
                <button
                  className="btn btn-danger"
                  style={styles.removeBtn}
                  onClick={() => handleRemove(item.malId)}
                  disabled={removing[item.malId]}
                  aria-label={`Remove ${item.title} from list`}
                >
                  {removing[item.malId] ? '…' : 'Remove'}
                </button>
              </div>
            ))}
        </div>
      )}
    </main>
  );
}

const styles = {
  page: { maxWidth: '860px', margin: '0 auto', padding: '32px 20px' },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: { fontSize: '1.8rem', fontWeight: 700 },
  sub: { color: 'var(--text-muted)', marginTop: '4px' },
  center: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--text-muted)',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: '12px' },
  emptyText: { fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' },
  emptySub: { color: 'var(--text-muted)' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    display: 'flex',
    gap: '16px',
    padding: '14px',
    alignItems: 'flex-start',
  },
  thumb: {
    width: '70px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '6px' },
  meta: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
  badge: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  dateAdded: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  synopsis: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  removeBtn: { flexShrink: 0, alignSelf: 'center', padding: '7px 14px' },
};
