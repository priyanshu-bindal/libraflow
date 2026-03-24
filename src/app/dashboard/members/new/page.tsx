"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { User, Mail, Lock, Phone, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { createMember } from "@/actions/user.actions";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Name, email, and password are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createMember({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });

      if (result.success) {
        toast.success("Member created successfully!");
        router.push("/dashboard/members");
      } else {
        toast.error(result.error || "Failed to create member.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/dashboard/members"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#111111] border border-[#1F1F1F] text-gray-400 hover:text-white hover:border-[#333] transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Member</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new library member account</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden">

          {/* Form Header */}
          <div className="px-8 py-6 border-b border-[#1F1F1F] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/15 flex items-center justify-center text-red-500">
              <User size={20} />
            </div>
            <div>
              <p className="font-semibold text-white">Member Information</p>
              <p className="text-xs text-gray-500">Fill in the details below to register a new member</p>
            </div>
          </div>

          {/* Fields */}
          <div className="px-8 py-8 space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul@example.com"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all"
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className={`w-full bg-[#0A0A0A] border rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? "border-red-700 focus:border-red-600 focus:ring-red-600/50"
                        : "border-[#1F1F1F] focus:border-red-600 focus:ring-red-600/50"
                    }`}
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1F1F1F] pt-2">
              <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-4">Optional Details</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-3.5 text-gray-500" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 12 MG Road, Bengaluru, Karnataka"
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 border-t border-[#1F1F1F] flex flex-col sm:flex-row justify-end gap-3">
            <Link
              href="/dashboard/members"
              className="px-6 py-2.5 rounded-xl border border-[#1F1F1F] text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all text-sm font-semibold text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Member"
              )}
            </button>
          </div>
        </form>

        {/* Info Note */}
        <p className="text-center text-xs text-gray-600 mt-4">
          The member will receive a unique Membership ID automatically upon creation.
        </p>
      </div>
    </div>
  );
}
