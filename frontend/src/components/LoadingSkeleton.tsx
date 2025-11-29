import React from 'react'

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900/50">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-xl mb-3"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-3"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
        <div className="flex gap-4 pt-4">
          <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-xl flex-1"></div>
          <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-xl w-32"></div>
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700/50 rounded-lg"></div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'form' | 'chart' | 'table';
}

export default function LoadingSkeleton({ variant = 'page' }: LoadingSkeletonProps) {
  if (variant === 'card') return <CardSkeleton />;
  if (variant === 'form') return <FormSkeleton />;
  if (variant === 'chart') return <ChartSkeleton />;
  if (variant === 'table') return <TableSkeleton />;
  
  // Full page skeleton
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded w-96 mx-auto"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="grid lg:grid-cols-2 gap-8">
        <FormSkeleton />
        <div className="space-y-6">
          <ChartSkeleton />
          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
