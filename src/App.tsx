import { IpodPlayer } from './components/iPod/IpodPlayer';

export function App() {
  return (
    <div className="h-[100dvh] w-full bg-neutral-950 flex items-center justify-center select-none overflow-hidden touch-none">
      <IpodPlayer />
    </div>
  );
}

export default App;
