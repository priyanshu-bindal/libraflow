import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { updateBookAction } from '@/actions/book.actions';
import BookForm, { BookFormInputs } from '@/components/books/BookForm';

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await db.book.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!book) {
    notFound();
  }

  // Pre-fill the form with book's existing data
  const initialData: Partial<BookFormInputs> = {
    title: book.title,
    author: book.author,
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    publishedYear: book.publishedYear || new Date().getFullYear(),
    categoryId: book.category?.name || '',
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
    description: book.description || '',
  };

  // Create a bound server action or a wrapper for the action to include the ID
  // Because it's a server component importing a client component, the onSubmitAction 
  // needs to be a server action directly if it's passed from server to client
  // Wait, Next.js supports passing Server Actions to Client Components
  const handleUpdate = async (data: BookFormInputs) => {
    "use server";
    await updateBookAction(id, data);
  };

  return <BookForm initialData={initialData} onSubmitAction={handleUpdate} isEditing={true} />;
}
