import { useState, useEffect } from "react";

export function useAutoRefresh(autoRefresh: boolean, interval = 10000) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
      setLastRefreshTime(new Date());
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, interval]);

  const manualRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setLastRefreshTime(new Date());
  };

  return {
    refreshKey,
    lastRefreshTime,
    manualRefresh,
  };
}