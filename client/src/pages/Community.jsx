import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/community')
      .then(({ data }) => setFeed(data.feed))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load community'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = feed.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={styles.center}>Loading community…</div>;
  if (error) return <div style={{ ...styles.center, color: '#f08080' }}>{error}</div>;

  return (
    <main style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Community</h1>
          <p style={styles.sub}>
            {feed.length} member{feed.length !== 1 ? 's' : ''} tracking anime
          </p>
        </div>
        <input
          className="input"
          style={styles.searchBox}
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p style={styles.empty}>No members found.</p>
      )}

      {/* Feed cards */}
      <div style={styles.grid}>
        {filtered.map((entry) => {
          const isYou = entry.username === user?.username;
          return (
            <Link
              to={`/user/${entry.username}`}
              key={entry.userId}
              style={styles.cardLink}
            >
              <div style={styles.card}>
                {/* Card header */}
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {entry.username[0].toUpperCase()}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.username}>
                      @{entry.username}
                      {isYou && <span style={styles.youBadge}>you</span>}
                    </span>
                    <span style={styles.meta}>
                      {entry.animeCount} title{entry.animeCount !== 1 ? 's' : ''} · joined{' '}
                      {new Date(entry.memberSince).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Preview posters */}
                {entry.recentAnime.length > 0 && (
                  <div style={styles.posters}>
                    {entry.recentAnime.map((a) => (
                      <img
                        key={a.malId}
                        src={a.imageUrl}
                        alt={a.title}
                        title={a.title}
                        style={styles.poster}
                        loading="lazy"
                      />
                    ))}
                    {entry.animeCount > 4 && (
                      <div style={styles.more}>+{entry.animeCount - 4}</div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <span style={styles.updated}>
                    Updated{' '}
                    {new Date(entry.updatedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span style={styles.viewLink}>View list →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: { fontSize: '1.8rem', fontWeight: 700 },
  sub: { color: 'var(--text-muted)', marginTop: '4px' },
  searchBox: { width: '220px', flexShrink: 0 },
  center: { textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' },
  empty: { textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  cardLink: { textDecoration: 'none', color: 'inherit' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '16px',
    transition: 'border-color 0.15s, transform 0.15s',
    cursor: 'pointer',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', gap: '3px' },
  username: {
    fontWeight: 600,
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  youBadge: {
    background: 'var(--primary)',
    color: '#fff',
    fontSize: '0.65rem',
    padding: '1px 6px',
    borderRadius: '20px',
    fontWeight: 600,
  },
  meta: { fontSize: '0.78rem', color: 'var(--text-muted)' },
  posters: {
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-end',
  },
  poster: {
    width: '52px',
    height: '72px',
    objectFit: 'cover',
    borderRadius: '6px',
    flexShrink: 0,
  },
  more: {
    width: '52px',
    height: '72px',
    borderRadius: '6px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    flexShrink: 0,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border)',
    paddingTop: '10px',
    marginTop: '2px',
  },
  updated: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  viewLink: { fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 },
};
