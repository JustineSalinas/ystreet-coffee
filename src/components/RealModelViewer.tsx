"use client";

import { useEffect } from "react";

export default function RealModelViewer({ src }: { src: string }) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      src={src}
      alt="Interactive 3D walkthrough of Y Street Coffee"
      camera-controls
      auto-rotate
      auto-rotate-delay={2000}
      rotation-per-second="8deg"
      shadow-intensity="0.9"
      exposure="0.95"
      ar
      ar-modes="webxr scene-viewer quick-look"
      reveal="auto"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
