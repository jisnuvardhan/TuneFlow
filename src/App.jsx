import React, { useMemo, useState } from "react";

import LibraryContextProvider from "./context/LibraryContext";
import PlayerContextProvider from "./context/PlayerContext";

import IntroScreen from "./components/IntroScreen";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import MusicGrid from "./components/MusicGrid";
import MusicUploader from "./components/MusicUploader";
import EmptyLibrary from "./components/EmptyLibrary";
import PlaylistLibrary from "./components/PlaylistLibrary";
import Player from "./components/Player";

import { useLibrary } from "./hooks/useLibrary";

const AppContent = () => {
  const {
    tracks,
    likedTracks,
    isLoading,
    removeAllTracks,
  } = useLibrary();

  const [activePage, setActivePage] =
    useState("home");

  const [search, setSearch] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [showUploader, setShowUploader] =
    useState(false);

  const displayedTracks = useMemo(() => {
    let result = tracks;

    if (activePage === "liked") {
      result = likedTracks;
    }

    if (activePage === "recent") {
      result = [...result].sort(
        (a, b) =>
          (b.lastPlayedAt || 0) -
          (a.lastPlayedAt || 0)
      );
    }

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return result;
    }

    return result.filter((track) => {
      const name =
        track.name?.toLowerCase() || "";

      const artist =
        track.artist?.toLowerCase() || "";

      const album =
        track.album?.toLowerCase() || "";

      return (
        name.includes(query) ||
        artist.includes(query) ||
        album.includes(query)
      );
    });
  }, [
    tracks,
    likedTracks,
    activePage,
    search,
  ]);

  const handleNavigation = (page) => {
    setActivePage(page);
    setSearch("");
  };

  const handleDeleteAllMusic = async () => {
    if (!tracks.length) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all uploaded music?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeAllTracks();

      setSearch("");
      setActivePage("home");
    } catch (error) {
      console.error(
        "Failed to delete all music:",
        error
      );

      window.alert(
        "Could not delete all music. Please try again."
      );
    }
  };

  const pageTitle = {
    home: "Your sound. Your flow.",
    library: "Your Library",
    liked: "Liked Songs",
    recent: "Recently Played",
  };

  const pageDescription = {
    home:
      "Your personal music space.",

    library:
      "Everything you've added to TuneFlow.",

    liked:
      "The tracks you've chosen to keep close.",

    recent:
      "Your recently played music.",
  };

  return (
    <div className="tf-app">
      <div
        className={`tf-layout ${
          sidebarOpen
            ? "sidebar-open"
            : "sidebar-collapsed"
        }`}
      >
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigation}
          isOpen={sidebarOpen}
          onToggle={() =>
            setSidebarOpen(
              (value) => !value
            )
          }
          onAddMusic={() =>
            setShowUploader(true)
          }
        />

        <main className="tf-main">
          <TopBar
            search={search}
            onSearch={setSearch}
            onClearSearch={() =>
              setSearch("")
            }
          />

          <section className="tf-content">
            {activePage === "library" ? (
              <PlaylistLibrary />
            ) : (
              <>
                <div className="tf-page-heading">
                  <div>
                    <span className="tf-eyebrow">
                      {activePage === "home"
                        ? "TUNEFLOW"
                        : activePage
                            .replace(
                              "-",
                              " "
                            )
                            .toUpperCase()}
                    </span>

                    <h1>
                      {pageTitle[activePage]}
                    </h1>

                    <p>
                      {
                        pageDescription[
                          activePage
                        ]
                      }
                    </p>
                  </div>

                  {activePage === "home" && (
                    <div className="tf-home-actions">
                      <button
                        type="button"
                        className="tf-primary-button"
                        onClick={() =>
                          setShowUploader(true)
                        }
                      >
                        Add music
                      </button>

                      {tracks.length > 0 && (
                        <button
                          type="button"
                          className="tf-primary-button"
                          onClick={
                            handleDeleteAllMusic
                          }
                        >
                          Delete all music
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="tf-loading-state">
                    Loading your library...
                  </div>
                ) : displayedTracks.length >
                  0 ? (
                  <section className="tf-section">
                    <div className="tf-section-heading">
                      <div>
                        <h2>
                          {search
                            ? "Search results"
                            : activePage ===
                                "liked"
                              ? "Liked tracks"
                              : activePage ===
                                  "recent"
                                ? "Recently played"
                                : "Your music"}
                        </h2>

                        <span>
                          {
                            displayedTracks.length
                          }{" "}
                          {displayedTracks.length ===
                          1
                            ? "track"
                            : "tracks"}
                        </span>
                      </div>
                    </div>

                    <MusicGrid
                      tracks={displayedTracks}
                    />
                  </section>
                ) : (
                  <EmptyLibrary
                    onAddMusic={() =>
                      setShowUploader(true)
                    }
                  />
                )}
              </>
            )}
          </section>
        </main>
      </div>

      <Player />

      {showUploader && (
        <MusicUploader
          onClose={() =>
            setShowUploader(false)
          }
        />
      )}
    </div>
  );
};

const App = () => {
  const [showIntro, setShowIntro] =
    useState(true);

  if (showIntro) {
    return (
      <IntroScreen
        onComplete={() =>
          setShowIntro(false)
        }
      />
    );
  }

  return (
    <LibraryContextProvider>
      <PlayerContextProvider>
        <AppContent />
      </PlayerContextProvider>
    </LibraryContextProvider>
  );
};

export default App;