import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ImagePlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const MAX_COVER_SIZE = 10 * 1024 * 1024;

const CreatePlaylist = ({
  open = false,
  playlist = null,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const fileInputRef = useRef(null);

  const isEditing = Boolean(playlist);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [clearCover, setClearCover] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /*
   * Load playlist data when opening/editing.
   */
  useEffect(() => {
    if (!open) return;

    setName(playlist?.name || "");
    setDescription(playlist?.description || "");

    setCoverFile(null);
    setCoverPreview(playlist?.cover || "");
    setClearCover(false);

    setError("");
    setSaving(false);
  }, [open, playlist]);

  /*
   * Clean temporary preview URLs.
   */
  useEffect(() => {
    return () => {
      if (
        coverPreview &&
        coverPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  /*
   * Escape closes modal.
   */
  useEffect(() => {
    if (!open || saving) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  /*
   * Upload playlist cover.
   *
   * The actual File object is passed to LibraryContext.
   * LibraryContext already converts it to a data URL and
   * stores it in IndexedDB.
   */
  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type?.startsWith("image/")) {
      setError(
        "Please choose a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_COVER_SIZE) {
      setError(
        "Playlist cover must be smaller than 10 MB."
      );

      event.target.value = "";
      return;
    }

    /*
     * Revoke previous temporary preview.
     */
    if (
      coverPreview &&
      coverPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(coverPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setCoverFile(file);
    setCoverPreview(previewUrl);

    /*
     * New cover means we are no longer clearing it.
     */
    setClearCover(false);

    event.target.value = "";
  };

  /*
   * Remove existing/new cover.
   */
  const handleRemoveCover = () => {
    if (
      coverPreview &&
      coverPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(null);
    setCoverPreview("");

    /*
     * Only matters for editing an existing playlist.
     */
    if (isEditing) {
      setClearCover(true);
    }
  };

  /*
   * Create or update playlist.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setError(
        "Please enter a playlist name."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        /*
         * Matches LibraryContext.updatePlaylist():
         *
         * updatePlaylist(id, {
         *   name,
         *   description,
         *   coverFile,
         *   clearCover
         * })
         */
        await onUpdate?.(
          playlist.id,
          {
            name: cleanName,
            description: cleanDescription,
            coverFile,
            clearCover,
          }
        );
      } else {
        /*
         * Matches LibraryContext.createPlaylist():
         *
         * createPlaylist({
         *   name,
         *   description,
         *   coverFile
         * })
         */
        await onCreate?.({
          name: cleanName,
          description: cleanDescription,
          coverFile,
        });
      }

      onClose?.();
    } catch (err) {
      console.error(
        "Unable to save playlist:",
        err
      );

      setError(
        err?.message ||
          "Unable to save playlist."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Delete existing playlist.
   */
  const handleDelete = async () => {
    if (!playlist?.id || !onDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${playlist.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onDelete(
        playlist.id
      );

      onClose?.();
    } catch (err) {
      console.error(
        "Unable to delete playlist:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete playlist."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Close when clicking outside modal.
   */
  const handleBackdropClick = (
    event
  ) => {
    if (
      event.target === event.currentTarget &&
      !saving
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="tf-modal-backdrop"
      role="presentation"
      onMouseDown={
        handleBackdropClick
      }
    >
      <section
        className="tf-playlist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="playlist-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="tf-modal-heading">
          <div>
            <span className="tf-eyebrow">
              PLAYLIST
            </span>

            <h2 id="playlist-modal-title">
              {isEditing
                ? "Edit playlist"
                : "Create playlist"}
            </h2>

            <p className="tf-modal-description">
              {isEditing
                ? "Update your playlist details."
                : "Create your own playlist with a custom cover."}
            </p>
          </div>

          <button
            type="button"
            className="tf-icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >
          {/* COVER */}

          <div className="tf-playlist-cover-editor">
            <button
              type="button"
              className="tf-playlist-cover-upload"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={saving}
              aria-label="Choose playlist cover"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Playlist cover preview"
                />
              ) : (
                <span>
                  <ImagePlus size={28} />

                  <small>
                    Choose cover
                  </small>
                </span>
              )}
            </button>

            <div className="tf-playlist-cover-actions">
              <button
                type="button"
                className="tf-primary-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={saving}
              >
                <ImagePlus size={16} />

                {coverPreview
                  ? "Change cover"
                  : "Upload cover"}
              </button>

              {coverPreview && (
                <button
                  type="button"
                  className="tf-text-button"
                  onClick={
                    handleRemoveCover
                  }
                  disabled={saving}
                >
                  Remove cover
                </button>
              )}

              <small>
                JPG, PNG, WEBP, GIF and other
                browser-supported image formats.
                <br />
                Maximum size: 10 MB.
              </small>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={
                handleCoverChange
              }
            />
          </div>

          {/* NAME */}

          <label className="tf-form-field">
            <span>
              Playlist name
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="My playlist"
              maxLength={100}
              autoFocus
              disabled={saving}
            />
          </label>

          {/* DESCRIPTION */}

          <label className="tf-form-field">
            <span>
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Tell people what this playlist is about..."
              maxLength={500}
              rows={4}
              disabled={saving}
            />
          </label>

          {/* ERROR */}

          {error && (
            <p className="tf-form-error">
              {error}
            </p>
          )}

          {/* ACTIONS */}

          <div className="tf-modal-actions">
            {isEditing && (
              <button
                type="button"
                className="tf-icon-button danger"
                onClick={
                  handleDelete
                }
                disabled={saving}
                title="Delete playlist"
              >
                <Trash2 size={16} />

                <span>
                  Delete
                </span>
              </button>
            )}

            <div className="tf-modal-actions-right">
              <button
                type="button"
                className="tf-secondary-button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="tf-primary-button"
                disabled={
                  saving ||
                  !name.trim()
                }
              >
                {isEditing ? (
                  <>
                    <Pencil size={15} />

                    Save changes
                  </>
                ) : (
                  <>
                    <Check size={15} />

                    Create playlist
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreatePlaylist;