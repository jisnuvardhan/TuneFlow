import React, { useRef, useState } from "react";
import { FileAudio, Upload, X } from "lucide-react";
import { useContext } from "react";

import { LibraryContext } from "../context/LibraryContext";

const MusicUploader = ({ onClose }) => {
  const {
    addTracks,
    uploadProgress,
  } = useContext(LibraryContext);

  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleFiles = async (files) => {
    if (!files?.length) {
      return;
    }

    try {
      setIsAdding(true);
      await addTracks(files);
      onClose?.();
    } finally {
      setIsAdding(false);
    }
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className="tf-uploader-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="tf-uploader"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tf-uploader-title"
      >
        <div className="tf-uploader-header">
          <div>
            <span className="tf-eyebrow">
              LOCAL LIBRARY
            </span>

            <h2 id="tf-uploader-title">
              Add music
            </h2>

            <p>
              Your music stays on this device.
            </p>
          </div>

          <button
            type="button"
            className="tf-icon-button"
            onClick={onClose}
            aria-label="Close upload window"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <button
          type="button"
          className={`tf-dropzone ${
            isDragging ? "dragging" : ""
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isAdding}
        >
          <div className="tf-dropzone-icon">
            {isAdding ? (
              <FileAudio size={28} />
            ) : (
              <Upload size={28} />
            )}
          </div>

          <strong>
            {isAdding
              ? "Adding music..."
              : "Drop your music here"}
          </strong>

          <span>
            {isAdding
              ? uploadProgress?.total
                ? `Processing ${uploadProgress.current} of ${uploadProgress.total} songs`
                : "Preparing your music..."
              : "or choose audio files from your device"}
          </span>

          {isAdding && (
            <div
              className="tf-upload-progress"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={uploadProgress?.percent || 0}
              aria-label="Music upload progress"
            >
              <div className="tf-upload-progress-track">
                <div
                  className="tf-upload-progress-fill"
                  style={{
                    width: `${uploadProgress?.percent || 0}%`,
                  }}
                />
              </div>

              <div className="tf-upload-progress-meta">
                <span>
                  {uploadProgress?.percent || 0}%
                </span>
              </div>
            </div>
          )}

          {!isAdding && (
            <small>
              MP3, WAV, OGG, AAC and other browser-supported
              audio formats
            </small>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={handleInputChange}
        />
      </section>
    </div>
  );
};

export default MusicUploader;