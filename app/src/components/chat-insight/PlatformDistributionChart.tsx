"use client"

import { Icon } from '@/components/ui/icon'
import { PlatformAnalysis } from '@/types/chat-insight'

interface PlatformDistributionChartProps {
  data: PlatformAnalysis | null;
  loading: boolean;
}

export function PlatformDistributionChart({ data, loading }: PlatformDistributionChartProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-muted animate-pulse rounded"></div>
          <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getTotalByPlatform = () => {
    if (!data) return { web: 0, mobile: 0, api: 0 };

    return {
      web: data.platforms.web.desktop + data.platforms.web.tablet,
      mobile: data.platforms.mobile.ios + data.platforms.mobile.android + data.platforms.mobile.pwa,
      api: data.platforms.api.direct + data.platforms.api.webhook + data.platforms.api.integration
    };
  };

  const totals = getTotalByPlatform();
  const grandTotal = totals.web + totals.mobile + totals.api;

  const getPercentage = (value: number) => {
    return grandTotal > 0 ? (value / grandTotal * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="monitor" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Platform Distribution</h3>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Platform Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <Icon name="monitor" size={24} className="text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{getPercentage(totals.web)}%</div>
              <div className="text-sm text-muted-foreground">Web</div>
              <div className="text-xs text-muted-foreground">({totals.web.toLocaleString()})</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <Icon name="smartphone" size={24} className="text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{getPercentage(totals.mobile)}%</div>
              <div className="text-sm text-muted-foreground">Mobile</div>
              <div className="text-xs text-muted-foreground">({totals.mobile.toLocaleString()})</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <Icon name="code" size={24} className="text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{getPercentage(totals.api)}%</div>
              <div className="text-sm text-muted-foreground">API</div>
              <div className="text-xs text-muted-foreground">({totals.api.toLocaleString()})</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Detailed Breakdown</h4>

            {/* Web Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="monitor" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-foreground">Web Platform</span>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Desktop</span>
                  <span className="font-medium text-foreground">{data.platforms.web.desktop}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tablet</span>
                  <span className="font-medium text-foreground">{data.platforms.web.tablet}</span>
                </div>
              </div>
            </div>

            {/* Mobile Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="smartphone" size={16} className="text-green-600" />
                <span className="text-sm font-medium text-foreground">Mobile Platform</span>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">iOS</span>
                  <span className="font-medium text-foreground">{data.platforms.mobile.ios}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Android</span>
                  <span className="font-medium text-foreground">{data.platforms.mobile.android}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">PWA</span>
                  <span className="font-medium text-foreground">{data.platforms.mobile.pwa}</span>
                </div>
              </div>
            </div>

            {/* API Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="code" size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-foreground">API Access</span>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Direct</span>
                  <span className="font-medium text-foreground">{data.platforms.api.direct}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Webhook</span>
                  <span className="font-medium text-foreground">{data.platforms.api.webhook}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Integration</span>
                  <span className="font-medium text-foreground">{data.platforms.api.integration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Browser Distribution</h4>
            <div className="space-y-2">
              {Object.entries(data.browsers).map(([browser, count]) => {
                const percentage = grandTotal > 0 ? (count / grandTotal * 100).toFixed(1) : '0.0';
                return (
                  <div key={browser} className="flex items-center justify-between">
                    <span className="text-sm text-foreground capitalize">{browser}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                      <span className="text-sm font-medium text-foreground">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usage Patterns */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Usage Patterns</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Mobile Peak Hours</div>
                <div className="text-sm font-medium text-foreground">
                  {data.timePatterns.mobileHours.slice(0, 3).join(', ')}:00
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Desktop Peak Hours</div>
                <div className="text-sm font-medium text-foreground">
                  {data.timePatterns.desktopHours.slice(0, 3).join(', ')}:00
                </div>
              </div>
            </div>
            <div className="text-center bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Weekend Mobile Usage</div>
              <div className="text-lg font-bold text-foreground">
                {((data.timePatterns.weekendMobileRatio ?? 0) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">higher than weekdays</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="monitor" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No platform data available</p>
        </div>
      )}
    </div>
  );
}