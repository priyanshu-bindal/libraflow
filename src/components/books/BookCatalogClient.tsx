"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

const getCategoryColor = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('fiction')) return 'bg-purple-500/20 text-purple-400';
  if (name.includes('tech')) return 'bg-blue-500/20 text-blue-400';
  if (name.includes('science')) return 'bg-green-500/20 text-green-400';
  if (name.includes('history')) return 'bg-amber-500/20 text-amber-400';
  return 'bg-slate-500/20 text-slate-400';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BookCatalogClient({ initialBooks }: { initialBooks: any[] }) {
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const tabs = ['All', 'Available', 'Checked Out'];

  // Get unique categories for dropdown
  const categories = useMemo(() => {
    const cats = new Set(initialBooks.map(b => b.category.name));
    return ['All Categories', ...Array.from(cats)];
  }, [initialBooks]);

  const filteredBooks = useMemo(() => {
    return initialBooks.filter((book) => {
      // 1. Check Category
      const matchesCategory = category === 'All Categories' || book.category.name === category;
      
      // 2. Check Status
      let matchesStatus = true;
      if (status === 'Available') matchesStatus = book.availableCopies > 0;
      if (status === 'Checked Out') matchesStatus = book.availableCopies === 0;
      
      // 3. Check Search Query
      const matchesSearch = search === '' || 
        book.title.toLowerCase().includes(search.toLowerCase()) || 
        book.author.toLowerCase().includes(search.toLowerCase()) || 
        book.isbn.toLowerCase().includes(search.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [initialBooks, category, status, search]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              className="w-full bg-[#111111] border-[#1F1F1F] rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none placeholder:text-slate-600 transition-all border" 
              placeholder="Search by title, author, ISBN..." 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none flex items-center pr-10 pl-4 py-2 bg-[#111111] border border-[#1F1F1F] rounded-lg text-sm text-slate-300 hover:border-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="relative flex items-center bg-[#1F1F1F] p-1 rounded-full w-[300px]">
            {/* The Animated Background Pill */}
            <div 
              className="absolute top-1 bottom-1 w-[33.33%] bg-red-600 rounded-full transition-transform duration-300 ease-out shadow-sm"
              style={{ transform: `translateX(${tabs.indexOf(status) * 100}%)` }}
            />
            {/* The Buttons */}
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`relative z-10 w-1/3 text-center py-1.5 text-sm font-medium transition-colors duration-300 ${status === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Grid / List Layout Toggle */}
          <div className="flex items-center bg-[#111111] border border-[#1F1F1F] rounded-lg overflow-hidden">
            <button className="p-2 bg-white/10 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
            <button className="p-2 text-slate-500 hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
          
          {/* Add Book Button */}
          <Link href="/dashboard/books/new" className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Book</span>
          </Link>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {filteredBooks.map((book) => (
          <Link 
            href={`/dashboard/books/${book.id}`} 
            key={book.id} 
            className="book-card-hover bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden transition-all group flex flex-col hover:border-slate-700 cursor-pointer"
          >
            <div className="aspect-[3/4] bg-[#1A1A1A] relative flex items-center justify-center p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div 
                className="z-10 w-full h-full shadow-2xl rounded-sm transform group-hover:scale-105 transition-transform duration-300 bg-slate-800 bg-cover bg-center" 
                style={{ backgroundImage: `url('${book.coverUrl || ''}')` }}
              ></div>
              <span className={`absolute top-3 right-3 z-20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getCategoryColor(book.category.name)}`}>
                {book.category.name}
              </span>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-white font-bold text-sm line-clamp-1 mb-1">{book.title}</h3>
              <p className="text-slate-500 text-xs mb-0.5">{book.author}</p>
              <p className="text-slate-600 text-[10px] font-mono mb-4">ISBN: {book.isbn}</p>
              
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${book.availableCopies > 0 ? 'bg-green-500' : 'bg-[#DC2626]'}`}></div>
                  <span className={`${book.availableCopies > 0 ? 'text-green-500' : 'text-[#DC2626]'} text-xs font-medium`}>{book.availableCopies > 0 ? 'Available' : 'Checked Out'}</span>
                </div>
                <button className={`px-3 py-1 border text-xs font-bold rounded transition-colors ${
                  book.availableCopies > 0 
                    ? 'border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white' 
                    : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }`}>
                  {book.availableCopies > 0 ? 'Issue' : 'Reserve'}
                </button>
              </div>
            </div>
          </Link>
        ))}
        {filteredBooks.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No books found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}