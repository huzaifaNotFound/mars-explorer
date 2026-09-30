import { useState } from "react";
import DesktopOnly from "./components/desktopOnly";
import MarsGlobe from "./components/Globe";
import WelcomeScreen from "./components/WelcomeScreen";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <DesktopOnly>
      {showWelcome && (
        <WelcomeScreen onClose={() => setShowWelcome(false)} />
      )}

      <main className="w-screen h-screen overflow-hidden bg-bg-primary">
        <MarsGlobe keyboardEnabled={!showWelcome} />
      </main>
    </DesktopOnly>
  );
}

export default App;