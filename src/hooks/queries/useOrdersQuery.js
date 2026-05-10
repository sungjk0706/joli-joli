import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services';
import { isSupabaseConfigured } from '../../lib/supabase';

const ORDERS_KEY = 'orders';

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: [ORDERS_KEY],
    queryFn: () => orderService.getAll(),
    enabled: isSupabaseConfigured(),
  });
};

export const useOrderQuery = (id) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => orderService.getById(id),
    enabled: isSupabaseConfigured() && !!id,
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => orderService.placeOrderTransaction(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useUpdateTrackingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackingNumber, carrier }) =>
      orderService.updateTrackingNumber(id, trackingNumber, carrier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};
