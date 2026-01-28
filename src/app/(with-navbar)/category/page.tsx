'use client';

import { redirect } from 'next/navigation';
import { useLayoutEffect } from 'react';

export default function CategoryRedirectPage() {
  useLayoutEffect(() => {
    redirect('/category/all');
  }, []);

  return null;
}
