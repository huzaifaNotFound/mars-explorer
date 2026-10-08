import { useEffect, useState } from "react";

const MIN_WIDTH = 1024;

export default function DesktopOnly({ children }) {
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth < MIN_WIDTH
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < MIN_WIDTH);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isSmallScreen) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-6">
  <div className="w-full max-w-lg">
    <div className="font-mono text-xs text-text-muted mb-8">
      MARS EXPLORER
    </div>

    <h1 className="font-space text-4xl mb-4">
      Larger screen required.
    </h1>

    <p className="text-text-muted leading-7 max-w-md">
      This experience is designed for laptop and desktop screens.
      Please switch to a larger screen to explore Mars.
    </p>

  </div>
</div>
    );
  }

  return children;
}