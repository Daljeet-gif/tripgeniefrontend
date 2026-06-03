// Parse the raw LLM itinerary text into structured days/slots/items.
export function parseItinerary(raw) {
  if (!raw) return [];
  const days = [];
  const dayBlocks = raw.split(/(?=\nDay \d+[:\s])/);

  dayBlocks.forEach((block) => {
    const lines = block.trim().split("\n");
    const titleLineIndex = lines.findIndex((l) => /^Day \d+/.test(l));
    if (titleLineIndex === -1) return;

    const titleLine = lines[titleLineIndex];
    const dayMatch = titleLine.match(/Day (\d+)[:\s]*(.*)?/);
    if (!dayMatch) return;

    const dayNum = parseInt(dayMatch[1], 10);
    const theme = dayMatch[2]?.replace(/["""'']/g, "").trim() || "";

    const slots = [];
    let currentSlot = null;

    lines.slice(titleLineIndex + 1).forEach((line) => {
      const slotMatch = line.match(/(Morning|Afternoon|Evening):/);
      if (slotMatch) {
        if (currentSlot) slots.push(currentSlot);
        currentSlot = { label: slotMatch[1], items: [] };
      } else if (currentSlot && line.trim().startsWith("-")) {
        const clean = line.replace(/^\s*-\s*/, "").trim();
        if (clean) currentSlot.items.push(clean);
      }
    });

    if (currentSlot) slots.push(currentSlot);
    days.push({ dayNum, theme, slots });
  });

  return days;
}

export const SLOT_ICONS = { Morning: "🌅", Afternoon: "☀️", Evening: "🌙" };
export const SLOT_COLORS = {
  Morning: "from-amber-500/10 to-transparent border-amber-500/20",
  Afternoon: "from-orange-400/10 to-transparent border-orange-400/20",
  Evening: "from-indigo-400/10 to-transparent border-indigo-400/20",
};
