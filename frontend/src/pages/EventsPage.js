import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function formatDateTime(str) {
  const d = new Date(str?.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString();
}

export default function EventsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const apiBase = useMemo(() => `${getApiBase()}/events`, []);

  const [allEvents, setAllEvents] = useState([]);
  const [viewMode, setViewMode] = useState('view');
  const [filters, setFilters] = useState({ search: '', category: '', date: '' });
  const [uploading, setUploading] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch(apiBase);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setAllEvents([]);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadEvents();
  }, [user, navigate, loadEvents]);

  const filteredEvents = allEvents.filter((e) => {
    const search = filters.search.trim().toLowerCase();
    const category = filters.category;
    const dateFilter = filters.date;
    const now = new Date();

    const searchable = `${e.title} ${e.venue} ${e.organizerName} ${e.category} ${e.description}`.toLowerCase();
    if (search && !searchable.includes(search)) return false;
    if (category && e.category !== category) return false;

    const start = new Date(e.eventStartDateTime?.replace(' ', 'T'));
    if (dateFilter === 'today') return start.toDateString() === now.toDateString();
    if (dateFilter === 'week') {
      const week = new Date();
      week.setDate(now.getDate() + 7);
      return start >= now && start <= week;
    }
    if (dateFilter === 'upcoming') return start > now;
    return true;
  });

  const submitEvent = async (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    setUploading(true);
    try {
      const res = await fetch(apiBase, { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      evt.target.reset();
      setViewMode('view');
      await loadEvents();
    } catch (err) {
      alert('Failed to add event');
    } finally {
      setUploading(false);
    }
  };

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="📅 Campus Events" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <div className="tab-switcher" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button className="header-btn" type="button" onClick={() => setViewMode('view')}>
            View Events
          </button>
          <button className="header-btn" type="button" onClick={() => setViewMode('add')}>
            Add Event
          </button>
        </div>

        {viewMode === 'view' && (
          <section id="viewEventsSection" className="card">
            <h2>Upcoming Events</h2>
            <div className="filter-bar" style={{ display: 'grid', gap: '12px', gridTemplateColumns: '2fr 1fr 1fr' }}>
              <input
                id="searchInput"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select
                id="categoryFilter"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All categories</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="MEETUP">Meetup</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="SEMINAR">Seminar</option>
              </select>
              <select id="dateFilter" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })}>
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="week">Next 7 days</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            <div id="events-container" style={{ marginTop: '18px' }}>
              {filteredEvents.length === 0 && <p style={{ opacity: 0.7, textAlign: 'center' }}>No matching events found</p>}
              {filteredEvents.map((e) => (
                <div key={e.id} className="event-card">
                  <div className="event-title">{e.title}</div>
                  <div className="event-meta">📍 {e.venue}</div>
                  <div className="event-meta">📅 {formatDateTime(e.eventStartDateTime)}</div>
                  <div className="event-meta">⏰ {formatDateTime(e.eventEndDateTime)}</div>
                  <div className="event-desc">{e.description}</div>
                  <div className="event-footer">
                    <span className="event-badge">{e.category}</span>
                    {e.posterUrl ? (
                      <a href={e.posterUrl} target="_blank" rel="noreferrer" className="event-poster-btn">
                        🎟 Poster
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {viewMode === 'add' && (
          <section id="addEventSection" className="card">
            <h2>Add Event</h2>
            <form id="eventForm" onSubmit={submitEvent} style={{ display: 'grid', gap: '12px' }}>
              <input name="title" placeholder="Title" required />
              <input name="venue" placeholder="Venue" required />
              <select name="category" required>
                <option value="">Select category</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="MEETUP">Meetup</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="SEMINAR">Seminar</option>
              </select>
              <input name="eventStartDateTime" placeholder="Start (YYYY-MM-DD HH:mm)" required />
              <input name="eventEndDateTime" placeholder="End (YYYY-MM-DD HH:mm)" required />
              <textarea name="description" placeholder="Description" required />
              <input name="organizerName" placeholder="Organizer Name" required />
              <input name="posterUrl" placeholder="Poster URL (optional)" />
              <button type="submit" disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Event'}
              </button>
            </form>
          </section>
        )}
      </main>
      <Footer text="© 2025 Campus Connect | Events" />
    </>
  );
}
