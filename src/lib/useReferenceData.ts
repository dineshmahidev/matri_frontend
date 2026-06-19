import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ReferenceItem = { id: number; name: string };
export type CasteItem = ReferenceItem & { religion_id: number };
export type CityItem = ReferenceItem & { state_id: number };

export function useReligions() {
  return useQuery<ReferenceItem[]>({
    queryKey: ["reference-religions"],
    queryFn: () => api.get<ReferenceItem[]>("/reference/religions"),
    staleTime: 1000 * 60 * 60,
  });
}

export function useCastes(religionId: number | null) {
  return useQuery<CasteItem[]>({
    queryKey: ["reference-castes", religionId],
    queryFn: () =>
      api.get<CasteItem[]>(
        religionId ? `/reference/castes?religion_id=${religionId}` : "/reference/castes"
      ),
    enabled: religionId !== null,
    staleTime: 1000 * 60 * 60,
  });
}

export function useStates() {
  return useQuery<ReferenceItem[]>({
    queryKey: ["reference-states"],
    queryFn: () => api.get<ReferenceItem[]>("/reference/states"),
    staleTime: 1000 * 60 * 60,
  });
}

export function useCities(stateId: number | null) {
  return useQuery<CityItem[]>({
    queryKey: ["reference-cities", stateId],
    queryFn: () =>
      api.get<CityItem[]>(
        stateId ? `/reference/cities?state_id=${stateId}` : "/reference/cities"
      ),
    enabled: stateId !== null,
    staleTime: 1000 * 60 * 60,
  });
}
