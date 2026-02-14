"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildPageUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 1; // pages around current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
      {/* Results info */}
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-semibold text-gray-700">{start}–{end}</span> de{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> becas
      </p>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <span className="p-2 rounded-lg text-gray-300 cursor-not-allowed">
            <ChevronLeft size={18} />
          </span>
        )}

        {/* Page numbers */}
        {getPageNumbers().map((pageNum, i) =>
          pageNum === "..." ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <Link
              key={pageNum}
              href={buildPageUrl(pageNum)}
              className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                pageNum === currentPage
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {pageNum}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className="p-2 rounded-lg text-gray-300 cursor-not-allowed">
            <ChevronRight size={18} />
          </span>
        )}
      </div>
    </div>
  );
}
