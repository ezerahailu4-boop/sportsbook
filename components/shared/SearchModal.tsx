"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Trophy, Flame, ChevronRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api-client";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  isLive: boolean;
  sportKey: string;
  commenceTime: string;
}

export function SearchModal() {
  const { isSearchModalOpen, closeSearchModal } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Search teams, leagues, or tournaments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <button
            onClick={closeSearchModal}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching sports fixtures found for "{query}".
            </div>
          )}

          {results.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Matches & Events
              </div>
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/events/${r.id}`}
                  onClick={closeSearchModal}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-800/60 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition">
                      {r.isLive ? <Flame className="h-4 w-4 text-red-500 animate-pulse" /> : <Trophy className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition">
                          {r.title}
                        </span>
                        {r.isLive && (
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                            LIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{r.subtitle}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition" />
                </Link>
              ))}
            </div>
          )}

          {query.length < 2 && (
            <div className="p-6 text-center text-xs text-slate-500">
              Type at least 2 characters to search across all sports and leagues.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
