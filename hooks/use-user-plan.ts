import { useState, useEffect, useCallback } from "react";
import type { UserPlanResponse } from "@/app/api/user/plan/route";

type UseUserPlanReturn = {
  plan: UserPlanResponse["plan"];
  subscription: UserPlanResponse["subscription"];
  isFreePlan: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useUserPlan(): UseUserPlanReturn {
  const [plan, setPlan] = useState<UserPlanResponse["plan"]>(null);
  const [subscription, setSubscription] = useState<UserPlanResponse["subscription"]>(null);
  const [isFreePlan, setIsFreePlan] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/plan");

      if (!response.ok) {
        throw new Error("Error al obtener el plan");
      }

      const data: UserPlanResponse = await response.json();

      setPlan(data.plan);
      setSubscription(data.subscription);
      setIsFreePlan(data.isFreePlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    plan,
    subscription,
    isFreePlan,
    isLoading,
    error,
    refetch: fetchPlan,
  };
}
