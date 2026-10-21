"use client";

import { useState } from "react";
import { ArrowUpRight, Map as MapIcon, MapPin } from "lucide-react";

const QUERY = "Kalyani Neptune, Bannerghatta Road, Bangalore 560076";
const EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&output=embed`;
const OPEN_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(QUERY).replace(/%20/g, "+")}`;

/** Privacy-friendly map: Google Maps only loads when the visitor asks for it. */
export function MapEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="map reveal">
      {loaded ? (
        <iframe
          src={EMBED_SRC}
          title="Map showing Irillic headquarters, Kalyani Neptune, Bannerghatta Road, Bangalore"
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
            <strong>Kalyani Neptune</strong>Bannerghatta Road, Bangalore
          </p>
          <div className="map__actions">
            <button className="pill pill--sm" type="button" onClick={() => setLoaded(true)}>
              <MapIcon className="i" aria-hidden="true" /> Load interactive map
            </button>
            <a className="link" href={OPEN_HREF} target="_blank" rel="noopener">
              Open in Google Maps <ArrowUpRight className="i" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <p className="map__note">The map loads from Google Maps when you choose to view it.</p>
        </div>
      )}
    </div>
  );
}
