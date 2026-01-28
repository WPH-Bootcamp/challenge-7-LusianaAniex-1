import Navbar from '@/shared/components/Navbar';
import CategoryPage from '@/features/category/CategoryPage';

export default function CategoryDetailPage({ 
  params 
}: { 
  params: { category: string } 
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
        <CategoryPage />
      </div>
    </>
  );
}