import React from "react";
import MusicCard from "./MusicCard";

const MusicGrid = ({ tracks = [] }) => {
  if (!tracks.length) {
    return null;
  }

  return (
    <div className="tf-music-grid">
      {tracks.map((track) => (
        <MusicCard
          key={track.id}
          track={track}
          tracks={tracks}
        />
      ))}
    </div>
  );
};

export default MusicGrid;