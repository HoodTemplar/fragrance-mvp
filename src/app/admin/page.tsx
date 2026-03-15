/**
 * Admin page - placeholder for future admin features.
 * Use this to manage sponsored recommendations, view analytics, etc.
 * Later: protect with auth and add real admin UI.
 */

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-charcoal mb-2">
        Admin
      </h1>
      <p className="text-charcoal/70 mb-6">
        Future: manage sponsored recommendations, view saved results, and
        analytics. For MVP this page is a placeholder; add auth and Supabase
        later.
      </p>
      <ul className="list-disc list-inside text-sm text-charcoal/80 space-y-1 mb-6">
        <li>Sponsored fragrance IDs are in src/lib/mockData.ts (SPONSORED_IDS)</li>
        <li>When you add a database, store sponsored flags in a table and toggle them here</li>
      </ul>
      <Link
        href="/"
        className="text-gold hover:underline text-sm"
      >
        ← Back to home
      </Link>
    </div>
  );
}
