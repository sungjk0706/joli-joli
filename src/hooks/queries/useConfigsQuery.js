import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '../../services';
import { isSupabaseConfigured } from '../../lib/supabase';

const CONFIGS_KEY = 'configs';
const SHOP_CONFIG_KEY = 'shopConfig';

export const useConfigsQuery = () => {
  return useQuery({
    queryKey: [SHOP_CONFIG_KEY],
    queryFn: () => configService.getShopConfig(),
    enabled: isSupabaseConfigured(),
  });
};

export const useRawConfigsQuery = () => {
  return useQuery({
    queryKey: [CONFIGS_KEY],
    queryFn: () => configService.getAll(),
    enabled: isSupabaseConfigured(),
  });
};

export const useUpdateConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }) => configService.upsert(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHOP_CONFIG_KEY] });
    },
  });
};

export const useUpdateConfigsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configs) => configService.upsertMultiple(configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHOP_CONFIG_KEY] });
    },
  });
};
