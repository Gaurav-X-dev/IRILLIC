"use client";

import { useState } from "react";
import { ArrowUpRight, Map as MapIcon, MapPin } from "lucide-react";

/** Privacy-friendly map: Google Maps only loads when the visitor asks for it. */
export function MapEmbed({ query, label }: { query: string; label: string }) {
  const [loaded, setLoaded] = useState(false);
  const encodedQuery = encodeURIComponent(query);
  const embedSrc = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
  const openHref = `https://www.google.com/maps/search/?api=1&query=${encodedQuery.replace(/%20/g, "+")}`;

  return (
    <div className="map reveal">
      {loaded ? (
        <iframe
          src={embedSrc}
          title={`Map showing ${label}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="map__placeholder">
          <span className="map__pin" aria-hidden="true">
            <MapPin className="i" />
          </span>
          <p>
            <strong>{label}</strong>
            {query}
          </p>
          <div className="map__actions">
            <button
              className="pill pill--sm"
              type="button"
              onClick={() => setLoaded(true)}
            >
              <MapIcon className="i" aria-hidden="true" /> Load interactive map
            </button>
            <a className="link" href={openHref} target="_blank" rel="noopener">
              Open in Google Maps{" "}
              <ArrowUpRight className="i" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <p className="map__note">
            The map loads from Google Maps when you choose to view it.
          </p>
        </div>
      )}
    </div>
  );
}
