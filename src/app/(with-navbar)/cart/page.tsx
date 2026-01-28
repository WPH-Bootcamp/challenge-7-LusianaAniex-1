import Navbar from '@/shared/components/Navbar';
import MyCartPage from '@/features/myCart/MyCartPage';

export default function CartPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <MyCartPage />
      </div>
    </>
  );
}