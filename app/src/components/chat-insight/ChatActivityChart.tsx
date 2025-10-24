"use client"

import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { ChatActivity, ChatConversation } from '@/types/chat-insight'
import { ChatDetailModal } from './ChatDetailModal'

interface ChatActivityChartProps {
  data: ChatActivity | null;
  loading: boolean;
  startDate: string;
  endDate: string;
}

export function ChatActivityChart({ data, loading, startDate, endDate }: ChatActivityChartProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    day: string
    hour: number
    count: number
  } | null>(null)

  const handleCellClick = (dayIndex: number, hourIndex: number, count: number) => {
    if (count > 0) {
      const dayName = getDayName(dayIndex)
      setSelectedTimeSlot({
        day: dayName,
        hour: hourIndex,
        count: count
      })
      setModalOpen(true)
    }
  }
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-muted animate-pulse rounded"></div>
          <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const getMaxActivity = () => {
    if (!data?.hourlyHeatmap) return 1;
    return Math.max(...data.hourlyHeatmap.flat());
  };

  const getIntensity = (value: number) => {
    const max = getMaxActivity();
    const intensity = value / max;

    if (intensity === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 0.75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-300';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="activity" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Chat Activity</h3>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Activity Heatmap */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Hourly Activity Pattern</h4>
            <div className="space-y-1">
              {/* Hour labels */}
              <div className="flex items-center gap-1">
                <div className="w-6"></div> {/* Empty space for day labels */}
                <div className="grid grid-cols-24 gap-1">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="text-xs text-muted-foreground text-center w-5">
                      {i.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap rows */}
              {data.hourlyHeatmap.map((dayData, dayIndex) => (
                <div key={dayIndex} className="flex items-center gap-1">
                  <div className="w-6 text-xs text-muted-foreground font-medium">
                    {getDayName(dayIndex)}
                  </div>
                  <div className="grid grid-cols-24 gap-1">
                    {dayData.map((value, hourIndex) => (
                      <div
                        key={hourIndex}
                        className={`h-5 w-5 rounded border border-border/20 ${getIntensity(value)} hover:scale-110 hover:border-primary transition-all duration-200 cursor-pointer flex items-center justify-center ${value > 0 ? 'hover:ring-2 hover:ring-primary/50' : ''}`}
                        title={`${getDayName(dayIndex)} ${hourIndex}:00 - ${value} chats${value > 0 ? ' (Click to view details)' : ''}`}
                        onClick={() => handleCellClick(dayIndex, hourIndex, value)}
                      >
                        {value > 0 && (
                          <span className="text-[10px] font-bold text-white dark:text-black opacity-80">
                            {value > 99 ? '99+' : value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-muted/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/40 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/60 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/80 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Weekly Pattern</h4>
            <div className="grid grid-cols-7 gap-2">
              {data.weeklyPattern.map((day) => (
                <div key={day.dayOfWeek} className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    {getDayName(day.dayOfWeek)}
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {day.avgActivity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Peak: {day.peakHour}:00
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{data.summary.peakDay}</div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{data.summary.peakHour}:00</div>
              <div className="text-xs text-muted-foreground">Peak Hour</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{data.summary.averageDaily}</div>
              <div className="text-xs text-muted-foreground">Avg Daily</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{(data.summary.weekendRatio * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Weekend Ratio</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="activity" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No activity data available</p>
        </div>
      )}

      {/* Chat Detail Modal */}
      <ChatDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        timeSlot={selectedTimeSlot}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}