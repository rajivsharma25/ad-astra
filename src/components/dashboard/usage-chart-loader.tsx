"use client";

import dynamic from "next/dynamic";

const UsageChart = dynamic(() => import("@/components/dashboard/usage-chart"), {
  loading: () => <div aria-label="Loading usage chart" className="h-[330px] animate-pulse rounded-lg border border-app-line bg-app-panel" />,
});

export function UsageChartLoader() {
  return <UsageChart />;
}
