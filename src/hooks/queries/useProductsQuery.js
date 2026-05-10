import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services';
import { isSupabaseConfigured } from '../../lib/supabase';

const PRODUCTS_KEY = 'products';

export const useProductsQuery = () => {
  return useQuery({
    queryKey: [PRODUCTS_KEY],
    queryFn: () => productService.getAll(),
    enabled: isSupabaseConfigured(),
  });
};

export const useProductQuery = (id) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productService.getById(id),
    enabled: isSupabaseConfigured() && !!id,
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => productService.create(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.id] });
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
};

export const useToggleStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isOutOfStock }) => productService.toggleStock(id, isOutOfStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
};

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: (file) => productService.uploadImage(file),
  });
};
