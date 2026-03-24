import React from 'react';
import { createBookLive } from '@/actions/book.actions';
import BookForm, { BookFormInputs } from '@/components/books/BookForm';
import { redirect } from 'next/navigation';

export default function AddNewBookPage() {
  const handleCreate = async (data: BookFormInputs) => {
    "use server";
    await createBookLive(data);
    redirect('/dashboard/books');
  };

  return <BookForm onSubmitAction={handleCreate} isEditing={false} />;
}
