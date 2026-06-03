import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

// Geoapify dark style if a key is present, otherwise free OSM raster tiles.
function buildStyle() {
  if (GEOAPIFY_KEY) {
    return `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${GEOAPIFY_KEY}`;
  }
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  };
}

export default function InteractiveMap({ center, markers = [], height = 380 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !center) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(),
      center: [center.lon, center.lat],
      zoom: 11,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const valid = markers.filter((m) => m.lat && m.lon);

    map.on("load", () => {
      const bounds = new maplibregl.LngLatBounds();

      valid.forEach((m, i) => {
        const el = document.createElement("div");
        el.style.cssText = [
          "width:26px", "height:26px", "border-radius:50%",
          "background:linear-gradient(135deg,#c99b5a,#a87c3e)",
          "color:#0d0d0d", "font:700 12px/26px 'DM Sans',sans-serif",
          "text-align:center", "box-shadow:0 2px 8px rgba(0,0,0,.5)",
          "border:2px solid #0d0d0d", "cursor:pointer",
        ].join(";");
        el.textContent = String(m.markerIndex ?? i + 1);

        const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
          `<div style="font:500 13px 'DM Sans',sans-serif;color:#161616">
             <strong>${m.name || "Place"}</strong>
             ${m.city ? `<br/><span style="color:#888">${m.city}</span>` : ""}
           </div>`
        );

        new maplibregl.Marker({ element: el })
          .setLngLat([m.lon, m.lat])
          .setPopup(popup)
          .addTo(map);

        bounds.extend([m.lon, m.lat]);
      });

      if (valid.length > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 0 });
    });

    return () => map.remove();
  }, [center, markers]);

  if (!center) return null;

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-white/[0.08]"
    />
  );
}
