import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Heart,
  ListPlus,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

import { PlayerContext } from "../context/PlayerContext";
import { LibraryContext } from "../context/LibraryContext";

const MusicCard = ({ track, tracks = [] }) => {
  const {
    currentTrack,
    isPlaying,
    playQueue,
    pause,
    play,
    stopTrack,
  } = useContext(PlayerContext);

  const {
    toggleLike,
    removeTrack,
    playlists,
    addTrackToPlaylist,
  } = useContext(LibraryContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const portalMenuRef = useRef(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  useEffect(() => {
    if (!menuOpen) return undefined;

    const updateMenuPosition = () => {
      const button = menuButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = 230;
      const gap = 8;
      const padding = 12;

      let left = rect.right - menuWidth;
      let top = rect.bottom + gap;

      if (left < padding) {
        left = padding;
      }

      if (left + menuWidth > window.innerWidth - padding) {
        left = window.innerWidth - menuWidth - padding;
      }

      const menuHeight = portalMenuRef.current?.offsetHeight || 96;

      if (top + menuHeight > window.innerHeight - padding) {
        top = rect.top - menuHeight - gap;
      }

      if (top < padding) {
        top = padding;
      }

      setMenuPosition({ top, left });
    };

    const handlePointerDown = (event) => {
      const clickedButton =
        menuButtonRef.current?.contains(event.target);

      const clickedMenu =
        portalMenuRef.current?.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        setMenuOpen(false);
        setPlaylistOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setPlaylistOpen(false);
      }
    };

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, playlistOpen]);

  const handlePlay = () => {
    if (isCurrent) {
      if (isPlaying) pause();
      else play();
      return;
    }

    const index = tracks.findIndex(
      (item) => item.id === track.id
    );

    playQueue(
      tracks.length ? tracks : [track],
      index >= 0 ? index : 0
    );
  };

  const handleDelete = async () => {
    setMenuOpen(false);

    const confirmed = window.confirm(
      `Delete "${track.name}" from your library?`
    );

    if (!confirmed) return;

    if (isCurrent) stopTrack();

    try {
      await removeTrack(track.id);
    } catch {
      // LibraryContext already reports the error.
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addTrackToPlaylist(playlistId, track.id);
    } finally {
      setPlaylistOpen(false);
      setMenuOpen(false);
    }
  };

  const artwork = track.cover || track.image || "";

  return (
    <article
      className={`tf-music-card ${
        isCurrent ? "is-current" : ""
      }`}
    >
      <div className="tf-music-art">
        {artwork ? (
          <img
            src={artwork}
            alt={`${track.name} cover`}
            className="tf-music-art-image"
            loading="lazy"
          />
        ) : (
          <div className="tf-music-art-placeholder">
            <span>
              {track.name?.charAt(0)?.toUpperCase() || "T"}
            </span>
          </div>
        )}

        <button
          type="button"
          className="tf-card-play"
          onClick={handlePlay}
          aria-label={
            isCurrentPlaying
              ? `Pause ${track.name}`
              : `Play ${track.name}`
          }
        >
          {isCurrentPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>

        {isCurrentPlaying && (
          <div
            className="tf-playing-indicator"
            aria-label="Currently playing"
          >
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="tf-music-card-info">
        <div className="tf-music-card-text">
          <h3 title={track.name}>{track.name}</h3>
          <p title={track.artist}>
            {track.artist || "Unknown Artist"}
          </p>
        </div>

        <div
          className="tf-music-card-actions"
          ref={menuRef}
        >
          <button
            type="button"
            className={`tf-card-icon ${
              track.liked ? "active" : ""
            }`}
            onClick={() => toggleLike(track.id)}
            aria-label={
              track.liked
                ? `Unlike ${track.name}`
                : `Add to liked`
            }
            title={
              track.liked
                ? "Remove from liked"
                : "Add to liked"
            }
          >
            <Heart
              size={17}
              fill={track.liked ? "currentColor" : "none"}
            />
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            className={`tf-card-icon ${
              menuOpen ? "active" : ""
            }`}
            onClick={() => {
              setMenuOpen((value) => !value);
              setPlaylistOpen(false);
            }}
            aria-label={`More options for ${track.name}`}
            aria-expanded={menuOpen}
            title="More options"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen &&
            createPortal(
              <div
                ref={portalMenuRef}
                className="tf-track-menu tf-track-menu-portal"
                style={{
                  position: "fixed",
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                  width: "230px",
                  minWidth: "230px",
                  maxWidth: "230px",
                  boxSizing: "border-box",
                  zIndex: 2147483647,
                  display: "flex",
                  flexDirection: "column",
                  padding: "6px",
                  margin: 0,
                  borderRadius: "14px",
                  background: "rgba(18, 18, 22, 0.98)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow:
                    "0 24px 70px rgba(0,0,0,0.72)",
                  overflow: "visible",
                }}
              >
                <button
                  type="button"
                  className="tf-track-menu-item"
                  onClick={() =>
                    setPlaylistOpen((value) => !value)
                  }
                  disabled={!playlists?.length}
                  style={{
                    width: "100%",
                    minHeight: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexDirection: "row",
                    padding: "0 11px",
                    boxSizing: "border-box",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ListPlus size={17} />
                  <span>Add to playlist</span>
                </button>

                {playlistOpen && playlists?.length > 0 && (
                  <div
                    className="tf-track-playlist-menu"
                    style={{
                      width: "100%",
                      maxHeight: "220px",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {playlists.map((playlist) => {
                      const alreadyAdded =
                        playlist.trackIds.includes(track.id);

                      return (
                        <button
                          key={playlist.id}
                          type="button"
                          className="tf-track-menu-item"
                          onClick={() =>
                            handleAddToPlaylist(playlist.id)
                          }
                          style={{
                            width: "100%",
                            minHeight: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexDirection: "row",
                            padding: "0 11px",
                            boxSizing: "border-box",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span className="tf-track-playlist-dot">
                            {playlist.cover ? (
                              <img
                                src={playlist.cover}
                                alt=""
                              />
                            ) : (
                              "♪"
                            )}
                          </span>

                          <span
                            style={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {playlist.name}
                          </span>

                          {alreadyAdded && (
                            <Check size={15} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  className="tf-track-menu-item danger"
                  onClick={handleDelete}
                  style={{
                    width: "100%",
                    minHeight: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexDirection: "row",
                    padding: "0 11px",
                    marginTop: "4px",
                    boxSizing: "border-box",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Trash2 size={17} />
                  <span>Delete track</span>
                </button>
              </div>,
              document.body
            )}
        </div>
      </div>
    </article> )}
    export default MusicCard;