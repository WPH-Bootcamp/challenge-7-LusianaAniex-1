import { Suspense } from 'react';
import Navbar from '@/shared/components/Navbar';
import CategoryPage from '@/features/category/CategoryPage';

export default function CategoryDetailPage({ 
  params: _params 
}: { 
  params: { category: string } 
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <CategoryPage />
        </Suspense>
      </div>
    </>
  );
}