"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { 
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadDropzone } from '@/utils/uploadthing';

export interface BookFormInputs {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishedYear: number;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverUrl?: string;
}

interface BookFormProps {
  initialData?: Partial<BookFormInputs>;
  onSubmitAction: (data: BookFormInputs) => Promise<void>;
  isEditing?: boolean;
}

export default function BookForm({ initialData, onSubmitAction, isEditing = false }: BookFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookFormInputs>({
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      isbn: initialData?.isbn || '',
      publisher: initialData?.publisher || '',
      publishedYear: initialData?.publishedYear || new Date().getFullYear(),
      categoryId: initialData?.categoryId || '',
      totalCopies: initialData?.totalCopies || 1,
      availableCopies: initialData?.availableCopies || 1,
      description: initialData?.description || '',
      coverUrl: initialData?.coverUrl || '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchTitle = watch("title", "Untitled Masterpiece");
  const watchAuthor = watch("author", "Unknown Author");
  const watchCoverUrl = watch("coverUrl");

  const onSubmit: SubmitHandler<BookFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmitAction(data);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A] p-8">
      <div className="max-w-[1000px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <p className="text-[#4B5563] text-xs font-medium tracking-wide">
            Dashboard / Books / <span className="text-[#DC2626]">{isEditing ? 'Edit Book' : 'Add New Book'}</span>
          </p>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-white text-3xl font-bold font-headline tracking-tight">{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
            <p className="text-[#6B7280] mt-1">{isEditing ? 'Update the details of this book' : 'Fill in the details to add a book to the catalogue'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => router.back()}
              className="h-10 px-6 border border-[#1F1F1F] text-[#6B7280] font-semibold rounded-lg hover:bg-[#1F1F1F] hover:text-white transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-10 px-6 bg-gradient-to-br from-[#DC2626] to-[#93000b] text-white font-bold rounded-lg shadow-lg shadow-red-900/30 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Book' : 'Save Book')}
            </button>
          </div>
        </div>

        {/* Form Grid Layout */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Form Details (60%) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-7 space-y-8">
            <section className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 shadow-sm">
              <div className="border-b border-[#1F1F1F] pb-3 mb-8">
                <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Book Information</h3>
              </div>
              
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Book Title</label>
                  <input 
                    {...register("title", { required: true })}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                    placeholder="Enter book title..." 
                    type="text"
                  />
                  {errors.title && <span className="text-red-500 text-xs text-left">This field is required</span>}
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Author</label>
                  <input 
                    {...register("author", { required: true })}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                    placeholder="Full name of author..." 
                    type="text"
                  />
                </div>

                {/* ISBN & Publisher Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">ISBN</label>
                    <input 
                      {...register("isbn")}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                      placeholder="978-3-16..." 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Publisher</label>
                    <input 
                      {...register("publisher")}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                      placeholder="Publisher name..." 
                      type="text"
                    />
                  </div>
                </div>

                {/* Year & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Published Year</label>
                    <input 
                      {...register("publishedYear", { valueAsNumber: true })}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                      placeholder="YYYY" 
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select 
                        {...register("categoryId")}
                        className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
                        defaultValue=""
                      >
                        <option disabled value="">Select category</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Technology">Technology</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                        <option value="Mathematics">Mathematics</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Total Copies</label>
                    <input 
                      {...register("totalCopies", { valueAsNumber: true })}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] h-12 rounded-xl px-4 text-white font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                      type="number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Available Copies</label>
                    <input 
                      {...register("availableCopies", { valueAsNumber: true })}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] h-12 rounded-xl px-4 text-[#6B7280] font-medium cursor-not-allowed focus:outline-none" 
                      readOnly={!isEditing} 
                      type="number" 
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Description</label>
                  <textarea 
                    {...register("description")}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 text-white font-medium transition-all min-h-[120px] resize-none focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]" 
                    placeholder="Write a brief summary of the book content..."
                  ></textarea>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Media & Meta (40%) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-6">
            
            {/* Cover Upload Card */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 shadow-sm">
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">Book Cover</h3>
              <div className="w-full relative">
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setValue("coverUrl", res[0].url, { shouldValidate: true, shouldDirty: true });
                      toast.success('Cover uploaded successfully!');
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                  className="w-full border-2 border-dashed border-[#2A2A2A] bg-[#0D0D0D] rounded-xl hover:border-[#DC2626]/40 transition-all text-white ut-label:text-white ut-button:bg-[#DC2626] ut-button:font-bold ut-button:ut-readying:bg-[#DC2626]/50 ut-cloud-icon:text-[#DC2626]"
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3">
                <span className="px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold rounded uppercase">Preview Mode</span>
              </div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">Preview</h3>
              
              {/* Book Card Component */}
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 flex gap-4 hover:shadow-2xl hover:shadow-black transition-all">
                <div className="w-24 h-32 rounded-lg bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#1F1F1F] relative block">
                  {watchCoverUrl ? (
                    <img src={watchCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-[#2A2A2A] w-8 h-8 opacity-40" />
                  )}
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <p className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest mb-1">{isEditing ? 'Existing Entry' : 'New Entry'}</p>
                    <h4 className="text-white font-bold leading-tight line-clamp-2 font-headline">{watchTitle || "Untitled Masterpiece"}</h4>
                    <p className="text-[#6B7280] text-xs mt-1 italic">{watchAuthor || "Unknown Author"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-tighter">Available for loan</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1F1F1F] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#4B5563] font-bold uppercase">Visibility</span>
                  <span className="text-white text-xs font-semibold">Public Catalogue</span>
                </div>
                <button type="button" className="text-[#DC2626] text-xs font-bold hover:underline">Edit Policy</button>
              </div>
            </div>

            {/* Helpful Tips */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F]">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="text-[#DC2626] w-5 h-5" />
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">Librarian Tip</h4>
              </div>
              <p className="text-[#6B7280] text-xs leading-relaxed">
                Always include the <span className="text-white font-medium underline decoration-[#DC2626]">ISBN-13</span> for accurate metadata fetching in future updates. Covers look best with a 2:3 aspect ratio.
              </p>
            </div>
            
          </div>
        </form>
      </div>
    </main>
  );
}
