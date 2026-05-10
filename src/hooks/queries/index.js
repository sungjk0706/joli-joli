export {
  useProductsQuery,
  useProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleStockMutation,
  useUploadImageMutation,
} from './useProductsQuery';

export {
  useOrdersQuery,
  useOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateTrackingMutation,
  useDeleteOrderMutation,
} from './useOrdersQuery';

export {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from './useCategoriesQuery';

export {
  useConfigsQuery,
  useRawConfigsQuery,
  useUpdateConfigMutation,
  useUpdateConfigsMutation,
} from './useConfigsQuery';
