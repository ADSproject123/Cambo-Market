"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { Filter, X } from "lucide-react";

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const applyFilters = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (verifiedOnly) params.set("verified", "true");
    else params.delete("verified");
    
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  }, [minPrice, maxPrice, verifiedOnly, router, searchParams]);
  
  const activeFiltersCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (verifiedOnly ? 1 : 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <Filter size={16} />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 origin-top-right rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl animate-[fade-in-up_0.2s_ease-out] dark:border-neutral-800 dark:bg-neutral-950 sm:left-0 sm:right-auto sm:origin-top-left">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Filter Results</h3>
            <button type="button" onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={applyFilters} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Price Range</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-brand"
                />
                <span className="text-neutral-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-brand"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Verified Sellers Only</span>
            </label>

            <button 
              type="submit" 
              className="mt-2 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand dark:bg-white dark:text-neutral-900 dark:hover:bg-brand dark:hover:text-white"
            >
              Apply Filters
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
