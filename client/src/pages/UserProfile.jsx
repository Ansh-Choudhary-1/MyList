import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { username } = useParams();
  const { user: me } = useAuth();

  const [profile, setProfile] = useState(null);
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = me?.username === username;

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/community/users/${username}`)
      .then(({ data }) => {
        setProfile(data.profile);
        setAnime(data.anime);
      })
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? `User @${username} doesn't exist.`
            : err.response?.data?.message || 'Failed to load profile'
        );
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div style={styles.center}>Loading profile…</div>;
  if (error) return (
    <div style={styles.center}>
      <p style={{ color: '#f08080', marginBottom: '16px' }}>{error}</p>
      <Link to="/community" className="btn btn-ghost">← Back to Community</Link>
    </div>
  );

  return (
    <main style={styles.page}>
      {/* Profile header */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarLarge}>
          {profile.username[0].toUpperCase()}
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.nameRow}>
            <h1 style={styles.profileName}>@{profile.username}</h1>
            {isOwnProfile && (
              <Link to="/mylist" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Edit my list
              </Link>
            )}
          </div>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>{profile.animeCount}</span>
              <span style={styles.statLabel}>Anime saved</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>
                {new Date(profile.memberSince).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span style={styles.statLabel}>Member since</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link to="/community" style={styles.back}>← Community</Link>

      {/* Anime list */}
      {anime.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🎌</p>
          <p style={styles.emptyText}>
            {isOwnProfile ? "You haven't added any anime yet." : `@${profile.username} hasn't added any anime yet.`}
          </p>
          {isOwnProfile && (
            <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Search Anime
            </Link>
          )}
        </div>
      ) : (
        <>
          <h2 style={styles.sectionTitle}>
            {isOwnProfile ? 'Your list' : `${profile.username}'s list`}
            <span style={styles.count}>{anime.length}</span>
          </h2>
          <div style={styles.list}>
            {anime.map((item) => (
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
                    {item.score && (
                      <span style={styles.badge}>⭐ {item.score}</span>
                    )}
                    {item.episodes && (
                      <span style={styles.badge}>{item.episodes} eps</span>
                    )}
                    <span style={styles.dateAdded}>
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.synopsis && (
                    <p style={styles.synopsis}>
                      {item.synopsis.length > 200
                        ? item.synopsis.slice(0, 200) + '…'
                        : item.synopsis}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

const styles = {
  page: { maxWidth: '860px', margin: '0 auto', padding: '32px 20px' },
  center: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--text-muted)',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  avatarLarge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  profileInfo: { display: 'flex', flexDirection: 'column', gap: '10px' },
  nameRow: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  profileName: { fontSize: '1.6rem', fontWeight: 700 },
  stats: { display: 'flex', alignItems: 'center', gap: '16px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statNum: { fontSize: '1.1rem', fontWeight: 700 },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  statDivider: {
    width: '1px',
    height: '32px',
    background: 'var(--border)',
  },
  back: {
    display: 'inline-block',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textDecoration: 'none',
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  count: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '1px 10px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
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
  empty: {
    textAlign: 'center',
    padding: '50px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '10px' },
  emptyText: { color: 'var(--text-muted)' },
};
