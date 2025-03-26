import dynamic from 'next/dynamic';

const FingerScene = dynamic(() => import('./components/FingerScene'), {
  ssr: false
});

export default function Home() {
  return (
    <main className="min-h-screen">
      <FingerScene />
    </main>
  );
}
