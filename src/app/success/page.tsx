import { Suspense } from 'react';
import PaymentSuccessPage from '@/features/paymentSuccess/PaymentSuccessPage';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}