import React from 'react';
import { db } from '@/lib/db';
import BookCatalogClient from '@/components/books/BookCatalogClient';

export default async function BooksPage() {
  const books = await db.book.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
  return (
    <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-8">
      <BookCatalogClient initialBooks={books} />
    </main>
  );
}


