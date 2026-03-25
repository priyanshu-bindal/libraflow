// Minimal edge middleware — only JWT token presence is checked here.
// Heavy logic (Prisma, bcrypt) lives inside authorize() with dynamic imports
// and never runs at the edge.
export { auth as middleware } from "@/lib/auth";

export const config = {
  // Only protect dashboard routes — keeps the edge bundle tiny
  matcher: ["/dashboard/:path*"],
};
