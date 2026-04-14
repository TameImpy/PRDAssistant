"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useIsAnalyst(): { isAnalyst: boolean; isLoading: boolean } {
  const { data: session } = useSession();
  const [isAnalyst, setIsAnalyst] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) {
      setIsAnalyst(false);
      setIsLoading(false);
      return;
    }

    fetch("/api/analysts/check")
      .then((res) => res.json())
      .then((data) => setIsAnalyst(data.isAnalyst))
      .catch(() => setIsAnalyst(false))
      .finally(() => setIsLoading(false));
  }, [session?.user?.email]);

  return { isAnalyst, isLoading };
}
