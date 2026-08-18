import React from "react";
import { FolderPlus, Upload } from "lucide-react";

const EmptyLibrary = ({ onAddMusic }) => {
  return (
    <section className="tf-empty-library">
      <div className="tf-empty-library-icon">
        <FolderPlus size={28} strokeWidth={1.7} />
      </div>

      <div className="tf-empty-library-content">
        <span className="tf-eyebrow">
          YOUR LIBRARY
        </span>

        <h2>Your music starts here</h2>

        <p>
          Add music from your device and build your
          personal TuneFlow library.
        </p>

        <button
          type="button"
          className="tf-primary-button"
          onClick={onAddMusic}
        >
          <Upload size={17} />
          <span>Add music</span>
        </button>
      </div>
    </section>
  );
};

export default EmptyLibrary;