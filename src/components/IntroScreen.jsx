import React, { useState } from "react";
import { ArrowRight, AudioLines } from "lucide-react";
import AuroraBars from "./AuroraBars";

const IntroScreen = ({ onComplete }) => {
  const [leaving, setLeaving] = useState(false);

  const handleEnter = () => {
    if (leaving) return;

    setLeaving(true);

    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      className={`tf-intro ${
        leaving ? "is-leaving" : ""
      }`}
    >
      <AuroraBars
        barCount={24}
        colors={[
          "#ffd6eb",
          "#ff9acb",
          "#ff5aa6",
          "#ff2d78",
          "#00000000",
        ]}
        maxHeightRatio={0.90}
        minHeightRatio={0.16}
        speed={0.5}
        gap={3}
      />

<div className="tf-intro-content">
        <div className="tf-intro-logo">
          <AudioLines
            size={28}
            strokeWidth={1.7}
          />
        </div>

      

        <h1>TuneFlow</h1>

        <p>
          Your music  .  
          Your library  .
          Your flow
        </p>

        <button
          type="button"
          className="tf-intro-enter"
          onClick={handleEnter}
        >
          <span>Enter TuneFlow</span>

          <span className="tf-intro-enter-icon">
            <ArrowRight size={16} />
          </span>
        </button>
      </div>

      <div className="tf-intro-bottom">
        LOCAL-FIRST MUSIC PLAYER
      </div>
    </div>
  );
};

export default IntroScreen;