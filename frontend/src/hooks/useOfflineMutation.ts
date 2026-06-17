import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useOffline } from 'contexts/OfflineContext';
import { apiClient } from '../lib/apiClient';
import { SyncOperation } from '../lib/db';

interface OfflineMutationParams<TData, TVariables> {
  method: SyncOperation;
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
}

/**
 * A wrapper around useMutation that supports offline queuing.
 * If online: executes normally.
 * If offline: adds to Dexie syncQueue and returns success (optimistic).
 */
export function useOfflineMutation<TData = unknown, TVariables = any>(
  params: OfflineMutationParams<TData, TVariables>
) {
  const { isOnline, enqueueRequest } = useOffline();

  return useMutation({
    ...params.mutationOptions,
    mutationFn: async (variables: TVariables) => {
      if (isOnline) {
        // Online: Use API
        if (params.method === 'POST') {return apiClient.post<TData>(params.url, variables);}
        if (params.method === 'PUT') {return apiClient.put<TData>(params.url, variables);}
        if (params.method === 'PATCH') {return apiClient.patch<TData>(params.url, variables);}
        if (params.method === 'DELETE') {return apiClient.delete<TData>(params.url);}
        throw new Error(`Unsupported method: ${params.method}`);
      } else {
        // Offline: Enqueue
        await enqueueRequest(params.method, params.url, variables as any);
        // Return a mock success response for optimistic UI
        return { offline: true } as any as TData;
      }
    }
  });
}
