import Navbar from '@/shared/components/Navbar';
import CheckoutPage from '@/features/checkOut/CheckoutPage';

export default function Checkout() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <CheckoutPage />
      </div>
    </>
  );
}