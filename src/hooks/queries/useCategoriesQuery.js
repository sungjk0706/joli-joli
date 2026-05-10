import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services';
import { isSupabaseConfigured } from '../../lib/supabase';

const CATEGORIES_KEY = 'categories';

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: () => categoryService.getAll(),
    enabled: isSupabaseConfigured(),
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => categoryService.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
};
