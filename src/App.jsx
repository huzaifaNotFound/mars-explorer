import DesktopOnly from "./components/desktopOnly";
import MarsGlobe from "./components/Globe";

function App() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-bg-primary">
      
      <DesktopOnly>
          <MarsGlobe/>
      </DesktopOnly>
    </main>
  );
}

export default App;