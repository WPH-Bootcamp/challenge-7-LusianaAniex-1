import { Suspense } from 'react';
import Navbar from '@/shared/components/Navbar';
import ProfilePage from '@/features/profile/ProfilePage';

export default function Profile() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ProfilePage />
        </Suspense>
      </div>
    </>
  );
}