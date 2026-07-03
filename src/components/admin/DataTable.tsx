"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
  };
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  searchable,
  searchPlaceholder = "Search...",
  onSearch,
  onSort,
  pagination,
  keyExtractor,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const direction = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(direction);
    onSort?.(key, direction);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const visibleColumns = useMemo(() => {
    if (typeof window === "undefined") return columns;
    return columns;
  }, [columns]);

  const renderSkeletonRow = (rowIndex: number) => (
    <tr key={`skeleton-${rowIndex}`} className="border-b border-[#ECEFF5]">
      {visibleColumns.map((col) => (
        <td key={col.key} className={cn("py-3 px-3", col.hideOnMobile && "hidden md:table-cell")}>
          <Skeleton className={cn("h-4", rowIndex % 2 === 0 ? "w-3/4" : "w-1/2")} />
        </td>
      ))}
    </tr>
  );

  const renderMobileCard = (item: T, index: number) => (
    <motion.div
      key={keyExtractor(item)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="portal-card p-4 space-y-3 md:hidden"
    >
      {columns.map((col) => {
        if (col.hideOnMobile) return null;
        const value = col.render
          ? col.render(item)
          : String((item as Record<string, unknown>)[col.key] ?? "");
        return (
          <div key={col.key} className="flex items-center justify-between">
            <span className="text-xs text-[#667085]">{col.header}</span>
            <span className="text-sm text-[#101828] font-medium">{value}</span>
          </div>
        );
      })}
    </motion.div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="hidden md:block">
            <div className="portal-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ECEFF5]">
                    {visibleColumns.map((col) => (
                      <th key={col.key} className={cn("text-left py-4 px-3 text-sm font-medium text-[#667085]", col.hideOnMobile && "hidden md:table-cell")}>
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => renderSkeletonRow(i))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-3 md:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="portal-card p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        emptyState || (
          <div className="portal-card p-12 text-center">
            <svg className="w-12 h-12 text-[#98A2B3] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-[#101828] mb-1">No data found</h3>
            <p className="text-sm text-[#667085]">Try adjusting your search or filters.</p>
          </div>
        )
      ) : (
        <>
          <div className="hidden md:block">
            <div className="portal-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ECEFF5]">
                      {visibleColumns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => col.sortable && handleSort(col.key)}
                          className={cn(
                            "text-left py-4 px-3 text-sm font-medium text-[#667085] transition-colors",
                            col.hideOnMobile && "hidden md:table-cell",
                            col.sortable && "cursor-pointer hover:text-[#101828]"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.header}
                            {col.sortable && sortKey === col.key && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {sortDirection === "asc" ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                )}
                              </svg>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {data.map((item, index) => (
                        <motion.tr
                          key={keyExtractor(item)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-[#ECEFF5] hover:bg-gray-50 transition-colors last:border-b-0"
                        >
                          {visibleColumns.map((col) => (
                            <td
                              key={col.key}
                              className={cn(
                                "py-3 px-3 text-sm text-[#101828]",
                                col.className,
                                col.hideOnMobile && "hidden md:table-cell"
                              )}
                            >
                              {col.render
                                ? col.render(item)
                                : String((item as Record<string, unknown>)[col.key] ?? "")}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {data.map((item, index) => renderMobileCard(item, index))}
          </div>

          {pagination && pagination.lastPage > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-[#667085]">
                Page {pagination.currentPage} of {pagination.lastPage}
                <span className="ml-2">({pagination.total} total)</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#667085] hover:text-[#101828] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = pagination.currentPage;
                    return page === 1 || page === pagination.lastPage || (page >= current - 1 && page <= current + 1);
                  })
                  .map((page, index, arr) => (
                    <span key={page} className="flex items-center">
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-1 text-[#98A2B3]">...</span>
                      )}
                      <button
                        onClick={() => pagination.onPageChange(page)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          pagination.currentPage === page
                            ? "bg-[#5B4CF0]/10 text-[#5B4CF0]"
                            : "text-[#667085] hover:text-[#101828] hover:bg-gray-100"
                        )}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
                <button
                  disabled={pagination.currentPage >= pagination.lastPage}
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#667085] hover:text-[#101828] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
