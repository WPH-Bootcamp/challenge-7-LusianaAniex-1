'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function CategoryRedirectPage() {
  useEffect(() => {
    redirect('/category/all');
  }, []);

  return null;
}