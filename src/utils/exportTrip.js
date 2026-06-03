// ── Trip export helpers: print/PDF, calendar (.ics), share, email ──────────────

function pad(n) {
  return String(n).padStart(2, "0");
}

function icsDate(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function escapeICS(s = "") {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// Parse the raw itinerary text into [{ dayNum, theme, body }]
function parseDays(itinerary = "") {
  const blocks = itinerary.split(/(?=\nDay \d+[:\s])/);
  const days = [];
  blocks.forEach((block) => {
    const lines = block.trim().split("\n");
    const idx = lines.findIndex((l) => /^Day \d+/.test(l));
    if (idx === -1) return;
    const m = lines[idx].match(/Day (\d+)[:\s]*(.*)?/);
    if (!m) return;
    days.push({
      dayNum: parseInt(m[1], 10),
      theme: (m[2] || "").replace(/["""'']/g, "").trim(),
      body: lines.slice(idx + 1).join("\n").trim(),
    });
  });
  return days;
}

/**
 * Build an .ics calendar string with one all-day event per itinerary day,
 * starting from `startDate` (default: tomorrow).
 */
export function buildICS(trip, startDate = new Date(Date.now() + 86400000)) {
  const days = parseDays(trip.itinerary);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TripGenie//Travel Planner//EN",
    "CALSCALE:GREGORIAN",
  ];

  const source = days.length
    ? days
    : [{ dayNum: 1, theme: trip.location, body: trip.itinerary || "" }];

  source.forEach((d) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + (d.dayNum - 1));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    lines.push(
      "BEGIN:VEVENT",
      `UID:tripgenie-${trip._id || "local"}-day${d.dayNum}@tripgenie`,
      `DTSTART;VALUE=DATE:${icsDate(start)}`,
      `DTEND;VALUE=DATE:${icsDate(end)}`,
      `SUMMARY:${escapeICS(`Day ${d.dayNum}: ${d.theme || trip.location}`)}`,
      `DESCRIPTION:${escapeICS(d.body)}`,
      `LOCATION:${escapeICS(trip.location)}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(trip) {
  const blob = new Blob([buildICS(trip)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(trip.location || "trip").replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Trigger the browser print dialog (user can "Save as PDF").
export function printTrip() {
  window.print();
}

export function mailtoLink(trip, shareUrl) {
  const subject = `My ${trip.days}-day trip to ${trip.location}`;
  const body = [
    `Here's my ${trip.days}-day itinerary for ${trip.location} (planned with TripGenie):`,
    shareUrl ? `\nView it online: ${shareUrl}\n` : "",
    trip.itinerary || "",
  ].join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
