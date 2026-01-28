import Navbar from '@/shared/components/Navbar';
import ProfilePage from '@/features/profile/ProfilePage';

export default function Profile() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <ProfilePage />
      </div>
    </>
  );
}