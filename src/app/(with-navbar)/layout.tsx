// app/(with-navbar)/layout.tsx
import Navbar from '@/shared/components/Navbar';

export default function WithNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        {children}
      </div>
    </>
  );
}