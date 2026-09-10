import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';

export const AdminEventInfoModal = ({ isOpen, onClose, token, onUpdated }) => {
  const [timeline, setTimeline] = useState([]);
  const [prizePool, setPrizePool] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDates, setEventDates] = useState('');
  const [eventFormat, setEventFormat] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/event-info');
      setTimeline(data.timeline || []);
      setPrizePool(data.prizePool || '');
      setLocation(data.location || '');
      setVenue(data.venue || '');
      setEventDates(data.eventDates || '');
      setEventFormat(data.eventFormat || '');
    } catch {
      setError('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchEventInfo();
  }, [isOpen]);

  const handleAddTimelineItem = () => {
    setTimeline([...timeline, { time: '12:00 PM', activity: 'New Schedule Milestone' }]);
  };

  const handleRemoveTimelineItem = (index) => {
    setTimeline(timeline.filter((_, idx) => idx !== index));
  };

  const handleTimelineChange = (index, field, value) => {
    const updated = [...timeline];
    updated[index][field] = value;
    setTimeline(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiRequest('/admin/event-info', {
        method: 'PUT',
        data: {
          timeline,
          prizePool: prizePool.trim(),
          location: location.trim(),
          venue: venue.trim(),
          eventDates: eventDates.trim(),
          eventFormat: eventFormat.trim(),
        },
        token,
      });

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event info');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#121212] border border-[var(--border)] hud-frame w-full max-w-2xl p-5 sm:p-6 shadow-2xl relative text-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--red)] text-white flex items-center justify-center font-bold rounded">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white">
                Edit Event Info &amp; Schedule
              </h3>
              <p className="text-xs text-neutral-400 mono">Global Hackathon Metadata &amp; Timeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center mono dim text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--red2)]" />
            Loading event configuration...
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs mono flex items-start gap-2 rounded mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="overflow-y-auto overflow-x-hidden space-y-5 flex-1 pr-1 modal-scroll py-2">
              {/* General Info */}
              <div className="bg-black/40 p-4 border border-[var(--border)] rounded space-y-4">
                <div className="mono text-xs font-bold uppercase text-[var(--red2)]">
                  [ 01 / PUBLIC METADATA ]
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mono dim text-xs block mb-1">PRIZE POOL SUMMARY</label>
                    <input
                      type="text"
                      required
                      value={prizePool}
                      onChange={(e) => setPrizePool(e.target.value)}
                      placeholder="e.g. ₹10,000+ Prizes + Placement Opportunities"
                      className="w-full p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="mono dim text-xs block mb-1">OFFLINE VENUE / LOCATION</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. AIMT, Lucknow"
                      className="w-full p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* NOC Official Document Settings */}
              <div className="bg-black/40 p-4 border border-[var(--border)] rounded space-y-4">
                <div className="mono text-xs font-bold uppercase text-[var(--red2)]">
                  [ 02 / OFFICIAL NOC DOCUMENT SETTINGS ]
                </div>
                <p className="dim text-[11px] mono">
                  These values dynamically populate the official No Objection Certificate (NOC) PDF downloaded by finalist teams and administrators.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="mono dim text-xs block mb-1">EVENT FORMAT</label>
                    <input
                      type="text"
                      value={eventFormat}
                      onChange={(e) => setEventFormat(e.target.value)}
                      placeholder="e.g. In-Person Hackathon"
                      className="w-full p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mono dim text-xs block mb-1">EVENT DATES</label>
                      <input
                        type="text"
                        value={eventDates}
                        onChange={(e) => setEventDates(e.target.value)}
                        placeholder="e.g. 16 September 2026"
                        className="w-full p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="mono dim text-xs block mb-1">SPECIFIC VENUE / AUDITORIUM</label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g. SRMCEM, Lucknow"
                        className="w-full p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Milestones */}
              <div className="bg-black/40 p-4 border border-[var(--border)] rounded space-y-4">
                <div className="flex items-center justify-between">
                  <div className="mono text-xs font-bold uppercase text-[var(--red2)]">
                    [ 03 / TIMELINE SCHEDULE ({timeline.length} ITEMS) ]
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTimelineItem}
                    className="btn btn-ghost text-[10px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Milestone
                  </button>
                </div>

                <div className="space-y-3">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={item.time}
                        onChange={(e) => handleTimelineChange(idx, 'time', e.target.value)}
                        placeholder="e.g. 10:00 AM"
                        className="w-32 p-2 text-xs shrink-0 mono"
                      />
                      <input
                        type="text"
                        required
                        value={item.activity}
                        onChange={(e) => handleTimelineChange(idx, 'activity', e.target.value)}
                        placeholder="Activity / Milestone"
                        className="flex-1 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTimelineItem(idx)}
                        className="p-2 text-neutral-400 hover:text-[var(--red2)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)] shrink-0">
              <button type="button" onClick={onClose} className="btn btn-ghost text-xs">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary text-xs">
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Event Info →'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
