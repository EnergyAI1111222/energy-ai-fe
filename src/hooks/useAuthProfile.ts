import { useQuery } from '@tanstack/react-query';
import { energyApi } from '@/api/client';

export interface UserProfileResponse {
  principal_id: string;
  plan: 'guest' | 'free' | 'basic' | 'professional' | 'enterprise';
  effective_limits: {
    history_days: number;
    max_export_rows: number;
    max_api_requests_per_month: number;
  };
  capabilities: {
    can_export: boolean;
    can_use_api_keys: boolean;
    can_access_forecast: boolean;
  };
  current_usage: {
    api_requests: number;
    data_points: number;
    exports: number;
    reset_date: string;
  };
}

export function useAuthProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: ['auth', 'me'],
    queryFn: () => energyApi.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Do not retry on 401
  });
}
