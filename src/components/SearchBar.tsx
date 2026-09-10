"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full flex-1 items-center flex">
      <Search className="absolute left-3 h-4 w-4 text-neutral-400" />
      <input
        type="search"
        placeholder="Search digital products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full border border-border bg-background/50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/20 dark:text-neutral-100 dark:focus:border-brand dark:focus:bg-neutral-900"
      />
    </form>
  );
}
