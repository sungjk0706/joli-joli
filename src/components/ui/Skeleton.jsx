import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => (
  <div className="p-3 bg-white rounded-3xl border border-gray-100">
    <Skeleton className="w-full aspect-square rounded-2xl mb-2" />
    <Skeleton className="h-4 w-3/4 mb-1" />
    <Skeleton className="h-5 w-1/2" />
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="p-8 bg-white rounded-3xl border border-gray-100 space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export default Skeleton;
