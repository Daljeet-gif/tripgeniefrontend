import { useState } from "react";
import {
  getPackingListAPI,
  getLocalInfoAPI,
  shareTripAPI,
  unshareTripAPI,
} from "../services/api";
import { downloadICS, printTrip, mailtoLink, copyToClipboard } from "../utils/exportTrip";

function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#161616] border border-white/[0.08] rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] tracking-[.18em] uppercase text-white/35 font-medium font-body mb-1">{sub}</p>
      <h2 className="font-display text-2xl font-light text-white">{children}</h2>
    </div>
  );
}

// ─── Packing list ─────────────────────────────────────────────────────────────
export function PackingList({ tripId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`packing_${tripId}`) || "{}");
    } catch {
      return {};
    }
  });

  const load = async (refresh = false) => {
    if (!tripId) return;
    setLoading(true);
    setError("");
    try {
      const { data: res } = await getPackingListAPI(tripId, refresh);
      setData(res.packingList);
    } catch {
      setError("Couldn't generate the packing list.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(`packing_${tripId}`, JSON.stringify(next));
  };

  if (!data) {
    return (
      <Card>
        <SectionTitle sub="Smart List">Packing List</SectionTitle>
        <p className="text-white/40 text-sm font-body mb-4">
          Generate a packing list tailored to your destination, weather and activities.
        </p>
        {error && <p className="text-red-400 text-[13px] font-body mb-3">{error}</p>}
        <button
          onClick={() => load(false)}
          disabled={loading}
          style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
          className="px-5 py-3 rounded-xl text-[14px] font-medium text-[#0d0d0d] font-body disabled:opacity-50"
        >
          {loading ? "Generating…" : "🎒 Generate Packing List"}
        </button>
      </Card>
    );
  }

  const total = (data.categories || []).reduce((n, c) => n + (c.items?.length || 0), 0);
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <SectionTitle sub="Smart List">Packing List</SectionTitle>
        <span className="text-[12px] text-gold font-body">{done}/{total} packed</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(data.categories || []).map((cat) => (
          <div key={cat.name} className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-body mb-3">{cat.name}</p>
            <div className="space-y-2">
              {(cat.items || []).map((item) => {
                const key = `${cat.name}:${item}`;
                return (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                      className="accent-gold w-4 h-4 rounded"
                    />
                    <span
                      className={`text-[13px] font-body transition-colors ${
                        checked[key] ? "text-white/30 line-through" : "text-white/75"
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {data.notes?.length > 0 && (
        <div className="mt-4 bg-gold/[0.06] border border-gold/20 rounded-xl p-4">
          {data.notes.map((n, i) => (
            <p key={i} className="text-[12px] text-white/60 font-body">💡 {n}</p>
          ))}
        </div>
      )}

      <button
        onClick={() => load(true)}
        disabled={loading}
        className="mt-4 text-[12px] text-white/40 hover:text-gold font-body transition-colors"
      >
        {loading ? "Regenerating…" : "↻ Regenerate"}
      </button>
    </Card>
  );
}

// ─── Local info ───────────────────────────────────────────────────────────────
export function LocalInfo({ tripId }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!tripId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await getLocalInfoAPI(tripId);
      setInfo(data.localInfo);
    } catch {
      setError("Couldn't load destination info.");
    } finally {
      setLoading(false);
    }
  };

  if (!info) {
    return (
      <Card>
        <SectionTitle sub="Know Before You Go">Local Info</SectionTitle>
        <p className="text-white/40 text-sm font-body mb-4">
          Currency, key phrases, emergency numbers, visa notes and etiquette tips.
        </p>
        {error && <p className="text-red-400 text-[13px] font-body mb-3">{error}</p>}
        <button
          onClick={load}
          disabled={loading}
          style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
          className="px-5 py-3 rounded-xl text-[14px] font-medium text-[#0d0d0d] font-body disabled:opacity-50"
        >
          {loading ? "Loading…" : "🌍 Get Local Info"}
        </button>
      </Card>
    );
  }

  const Pill = ({ label, value }) =>
    value ? (
      <div className="bg-white/[0.03] rounded-xl p-3">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-body mb-1">{label}</p>
        <p className="text-white/80 text-[13px] font-body">{value}</p>
      </div>
    ) : null;

  return (
    <Card>
      <SectionTitle sub="Know Before You Go">Local Info</SectionTitle>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Pill label="Currency" value={info.currency && `${info.currency.name} (${info.currency.code})`} />
        <Pill label="Tipping" value={info.currency?.tipping} />
        <Pill label="Language" value={info.language?.primary} />
        <Pill label="Best time to visit" value={info.bestTimeToVisit} />
        <Pill label="Visa" value={info.visa} />
        <Pill
          label="Emergency"
          value={
            info.emergency &&
            [
              info.emergency.police && `Police ${info.emergency.police}`,
              info.emergency.ambulance && `Ambulance ${info.emergency.ambulance}`,
              info.emergency.general && `General ${info.emergency.general}`,
            ]
              .filter(Boolean)
              .join(" · ")
          }
        />
      </div>

      {info.language?.phrases?.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-body mb-2">Useful Phrases</p>
          <div className="flex flex-wrap gap-2">
            {info.language.phrases.map((p, i) => (
              <div key={i} className="bg-gold/[0.06] border border-gold/20 rounded-lg px-3 py-1.5">
                <span className="text-white/50 text-[12px] font-body">{p.en}: </span>
                <span className="text-gold text-[12px] font-body font-medium">{p.local}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {info.tips?.length > 0 && (
        <div className="space-y-1.5">
          {info.tips.map((t, i) => (
            <p key={i} className="text-[12px] text-white/60 font-body">• {t}</p>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Share & export bar ───────────────────────────────────────────────────────
export function ShareExportBar({ trip }) {
  const [shareUrl, setShareUrl] = useState(
    trip.shareId ? `${window.location.origin}/shared/${trip.shareId}` : ""
  );
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!trip._id) return;
    setBusy(true);
    try {
      const { data } = await shareTripAPI(trip._id);
      const url = `${window.location.origin}/shared/${data.shareId}`;
      setShareUrl(url);
      const ok = await copyToClipboard(url);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const handleUnshare = async () => {
    if (!trip._id) return;
    setBusy(true);
    try {
      await unshareTripAPI(trip._id);
      setShareUrl("");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const btn =
    "px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/75 text-[13px] font-body transition-all hover:border-gold/40 hover:text-white flex items-center gap-2";

  return (
    <div className="bg-[#161616] border border-white/[0.08] rounded-2xl p-5 print:hidden">
      <p className="text-[10px] tracking-[.18em] uppercase text-white/35 font-medium font-body mb-3">
        Share & Export
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button onClick={printTrip} className={btn}>🖨️ Save as PDF</button>
        <button onClick={() => downloadICS(trip)} className={btn}>📅 Add to Calendar</button>
        <a href={mailtoLink(trip, shareUrl)} className={btn}>✉️ Email</a>
        {!shareUrl ? (
          <button onClick={handleShare} disabled={busy || !trip._id} className={btn}>
            {busy ? "…" : "🔗 Create Share Link"}
          </button>
        ) : (
          <button onClick={handleShare} className={btn}>
            {copied ? "✓ Link copied!" : "🔗 Copy Share Link"}
          </button>
        )}
        {shareUrl && (
          <button onClick={handleUnshare} disabled={busy} className={btn}>
            🚫 Make Private
          </button>
        )}
      </div>

      {shareUrl && (
        <p className="mt-3 text-[12px] text-white/40 font-body break-all">
          Public link:{" "}
          <a href={shareUrl} className="text-gold hover:underline">{shareUrl}</a>
        </p>
      )}
    </div>
  );
}
