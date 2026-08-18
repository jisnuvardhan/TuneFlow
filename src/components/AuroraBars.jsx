import React, { useEffect, useMemo, useRef } from "react";
import "./AuroraBars.css";

/*
 * TuneFlow — Aurora Bars
 *
 * Motion model is based on the Aurora Bars code supplied by the user:
 *   arch + two sine waves
 *
 * The implementation below keeps the same visual math but animates the
 * DOM directly with requestAnimationFrame. That avoids React re-rendering
 * 24 bars on every frame and gives the movement a cleaner, steadier feel.
 */

function barHeight(index, total, time, minH, maxH) {
  const norm = total <= 1 ? 0.5 : index / (total - 1);

  // Broad centre arch: tall in the middle, low at both edges.
  const arch = Math.sin(norm * Math.PI);

  const phase1 = (index / total) * Math.PI * 2;
  const phase2 = (index / total) * Math.PI * 5.3;

  // The two slow waves create the organic movement from the reference.
  const wave =
    0.5 +
    0.25 * Math.sin(time * 1.1 + phase1) +
    0.25 * Math.sin(time * 0.7 + phase2);

  const blended = arch * 0.65 + wave * 0.35;

  return minH + blended * (maxH - minH);
}

const AuroraBars = ({
  barCount = 24,
  colors = [
    "#ffd6eb",
    "#ff9acb",
    "#ff5aa6",
    "#ff2d78",
    "#00000000",
  ],
  maxHeightRatio = 0.90,
  minHeightRatio = 0.16,
  speed = 0.5,
  gap = 3,
  blur = 0,
  background = "#000000",
}) => {
  const barsRef = useRef([]);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const lastTimestampRef = useRef(0);

  const gradient = useMemo(
    () =>
      `linear-gradient(to top, ${colors
        .map(
          (color, index) =>
            `${color} ${Math.round(
              (index / Math.max(colors.length - 1, 1)) * 100,
            )}%`,
        )
        .join(", ")})`,
    [colors],
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let mounted = true;

    const animate = (timestamp) => {
      if (!mounted) return;

      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      // Clamp large frame gaps so returning to the tab never causes
      // the Aurora to jump suddenly.
      const delta = Math.min(
        timestamp - lastTimestampRef.current,
        34,
      );

      lastTimestampRef.current = timestamp;

      if (!reducedMotion) {
        timeRef.current += (delta / 1000) * speed;
      }

      const time = timeRef.current;

      for (let index = 0; index < barCount; index += 1) {
        const bar = barsRef.current[index];
        if (!bar) continue;

        const target = barHeight(
          index,
          barCount,
          time,
          minHeightRatio,
          maxHeightRatio,
        );

        /*
         * A tiny interpolation layer makes the wave feel fluid instead
         * of exposing every numerical change directly.
         */
        const previous =
          Number(bar.dataset.height || target);

        const next =
          previous + (target - previous) * 0.16;

        bar.dataset.height = String(next);

        bar.style.height = `${next * 100}%`;
      }

      frameRef.current =
        requestAnimationFrame(animate);
    };

    frameRef.current =
      requestAnimationFrame(animate);

    return () => {
      mounted = false;
      cancelAnimationFrame(frameRef.current);
      lastTimestampRef.current = 0;
    };
  }, [
    barCount,
    speed,
    minHeightRatio,
    maxHeightRatio,
  ]);

  return (
    <div
      className="tf-aurora-bars"
      style={{ background }}
      aria-hidden="true"
    >
      <div className="tf-aurora-bars-inner">
        {Array.from({ length: barCount }).map(
          (_, index) => (
            <div
              key={index}
              className="tf-aurora-bar-slot"
              style={{
                paddingLeft: `${gap / 2}px`,
                paddingRight: `${gap / 2}px`,
              }}
            >
              <div
                ref={(element) => {
                  barsRef.current[index] = element;
                }}
                className="tf-aurora-bar"
                data-height={String(
                  barHeight(
                    index,
                    barCount,
                    0,
                    minHeightRatio,
                    maxHeightRatio,
                  ),
                )}
                style={{
                  height: `${barHeight(
                    index,
                    barCount,
                    0,
                    minHeightRatio,
                    maxHeightRatio,
                  ) * 100}%`,
                  background: gradient,
                  filter: `blur(${blur}px)`,
                }}
              />
            </div>
          ),
        )}
      </div>

      <div className="tf-aurora-content-shield" />
      <div className="tf-aurora-vignette" />
    </div>
  );
};

export default AuroraBars;
