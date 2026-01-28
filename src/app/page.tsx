import Navbar from '@/shared/components/Navbar';
import HomePage from '@/features/home/HomePage';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <HomePage />
      </div>
    </>
  );
}