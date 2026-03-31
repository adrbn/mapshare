"use client";

interface SpotifyEmbedProps {
  readonly url: string;
}

function getSpotifyEmbedUrl(url: string): string | null {
  // Handle various Spotify URL formats
  // open.spotify.com/track/xxx, open.spotify.com/album/xxx, etc.
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const [, type, id] = match;
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}

export default function SpotifyEmbed({ url }: SpotifyEmbedProps) {
  const embedUrl = getSpotifyEmbedUrl(url);
  if (!embedUrl) return null;

  const isCompact = url.includes("/track/");

  return (
    <div className="spotify-embed max-w-lg mx-auto px-4 mb-6">
      <iframe
        src={embedUrl}
        width="100%"
        height={isCompact ? 80 : 152}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-2xl"
        style={{ border: "none" }}
      />
    </div>
  );
}
