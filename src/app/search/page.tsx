"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<{ topics: any[]; exams: any[] }>({ topics: [], exams: [] });

  useEffect(() => {
    if (!query) return;
    const q = `%${query}%`;
    Promise.all([
      supabase.from("topics").select("*, subjects!inner(title, exams!inner(title))").ilike("title", q).limit(10),
      supabase.from("exams").select("*").ilike("title", q).limit(5),
    ]).then(([topicsRes, examsRes]) => {
      setResults({ topics: topicsRes.data ?? [], exams: examsRes.data ?? [] });
    });
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-3xl px-4 py-12">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Search topics, exams..."
              className="flex-1 rounded-lg border px-4 py-3 text-lg focus:ring-2 focus:ring-primary" autoFocus />
            <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-white">Search</button>
          </div>
        </form>

        {query && (
          <div className="space-y-8">
            {results.exams.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Exams</h2>
                <div className="space-y-2">
                  {results.exams.map(e => (
                    <Link key={e.id} href={`/exams/${e.slug}`} className="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md">
                      <h3 className="font-medium">{e.title}</h3>
                      <p className="text-sm text-gray-500">{e.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.topics.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Topics</h2>
                <div className="space-y-2">
                  {results.topics.map((t: any) => (
                    <Link key={t.id} href={`/practice/${t.id}`} className="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md">
                      <h3 className="font-medium">{t.title}</h3>
                      <p className="text-sm text-gray-500">{t.subjects?.exams?.title} → {t.subjects?.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.exams.length === 0 && results.topics.length === 0 && (
              <p className="text-center text-gray-500">No results found for "{query}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SearchContent />
    </Suspense>
  );
}
