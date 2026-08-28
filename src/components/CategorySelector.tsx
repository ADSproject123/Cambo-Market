"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { formatCategoryName } from "@/lib/format";

interface CategorySelectorProps {
  categories: string[];
}

export function CategorySelector({ categories }: CategorySelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (category: string) => {
    setIsOpen(false);
    router.push(`/categories/${encodeURIComponent(category)}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center justify-between gap-3 min-w-[160px] rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <span>All Categories</span>
        <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 max-h-80 w-56 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl animate-[fade-in-up_0.2s_ease-out] dark:border-neutral-800 dark:bg-neutral-950 sm:left-0 sm:right-auto">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">No categories</div>
          ) : (
            <div className="flex flex-col">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelect(c)}
                  className="flex items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-light"
                >
                  {formatCategoryName(c)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
