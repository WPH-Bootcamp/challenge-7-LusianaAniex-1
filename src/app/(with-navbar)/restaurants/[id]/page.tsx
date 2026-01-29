import Navbar from '@/shared/components/Navbar';
import RestaurantDetailPage from '@/features/detail/RestaurantDetailPage';


export default function RestaurantPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <RestaurantDetailPage />
      </div>
    </>
  );
}