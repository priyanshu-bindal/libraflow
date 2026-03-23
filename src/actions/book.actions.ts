'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBookLive(data: any) {
  try {
    // 1. Look up or create the category since the frontend sends category name
    let category = await db.category.findUnique({
      where: { name: data.categoryId }
    });
    
    if (!category) {
      category = await db.category.create({
        data: { name: data.categoryId }
      });
    }

    // 2. Insert the new book into the live Postgres database
    await db.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        publisher: data.publisher,
        // Make sure we handle publishedYear securely
        publishedYear: parseInt(data.publishedYear, 10),
        description: data.description,
        totalCopies: parseInt(data.totalCopies, 10),
        availableCopies: parseInt(data.availableCopies, 10),
        categoryId: category.id, 
      },
    });
  } catch (error) {
    console.error("Failed to create book:", error);
    throw new Error("Failed to create book in database.");
  }

  // 2. Clear Next.js cache so the catalogue fetches the fresh data
  revalidatePath('/dashboard/books');
  
  // 3. Send the user back to the catalogue
  redirect('/dashboard/books');
}
