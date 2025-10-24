"use client"

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { LanguageStats } from '@/types/insight'
import { getLanguageDisplayName } from '@/lib/language-utils'
import { useState } from 'react'

interface FilterPanelProps {
  selectedLanguages?: string[];
  onLanguagesChange?: (languages: string[]) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  languageStats?: LanguageStats[];
}

export function FilterPanel({
  selectedLanguages = [],
  onLanguagesChange,
  dateRange,
  onDateRangeChange,
  languageStats = []
}: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Get available languages from languageStats
  const availableLanguages = languageStats?.map(stat => stat.lang).filter(Boolean) || [
    'Korean', 'English', 'Japanese', 'Chinese', 'Spanish', 'Portuguese', 'Indonesian', 'Thai', 'Vietnamese'
  ]

  const handleLanguageToggle = (language: string) => {
    if (!onLanguagesChange) return

    if (selectedLanguages?.includes(language)) {
      onLanguagesChange(selectedLanguages.filter(l => l !== language))
    } else {
      onLanguagesChange([...(selectedLanguages || []), language])
    }
  }

  const handleDatePreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    onDateRangeChange({ start, end })
  }

  const clearAllFilters = () => {
    onLanguagesChange?.([])
    onDateRangeChange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days instead of 7
      end: new Date()
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name={collapsed ? "chevron-down" : "chevron-up"} size={16} />
        </Button>
      </div>

      {!collapsed && (
        <>
          {/* Date Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Date Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={dateRange.start.getDate() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getDate() ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(7)}
                className="text-xs"
              >
                Last 7 days
              </Button>
              <Button
                variant={dateRange.start.getDate() === new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getDate() ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(14)}
                className="text-xs"
              >
                Last 14 days
              </Button>
              <Button
                variant={dateRange.start.getDate() === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getDate() ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(30)}
                className="text-xs"
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDatePreset(90)}
                className="text-xs"
              >
                Last 90 days
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </div>
          </div>


          {/* Languages */}
          {languageStats && languageStats.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Languages</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLanguagesChange?.([])}
                  className="text-xs text-muted-foreground hover:text-foreground h-auto p-1"
                >
                  Clear all
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableLanguages.map(language => {
                  const stats = languageStats.find(s => s.lang === language)
                  const isSelected = selectedLanguages?.includes(language) || false

                  return (
                    <div
                      key={language}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded border-2 flex-shrink-0 ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {isSelected && (
                            <Icon name="check" size={8} className="text-primary-foreground m-0.5" />
                          )}
                        </div>
                        <span className={`text-sm ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {getLanguageDisplayName(language)}
                        </span>
                      </div>
                      {stats && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{stats.videoCount}</span>
                          <Icon name="video" size={12} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {(selectedLanguages && selectedLanguages.length > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Active Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground h-auto p-1"
                >
                  <Icon name="x" size={12} className="mr-1" />
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedLanguages && selectedLanguages.map(language => (
                  <span
                    key={`lang-${language}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent-foreground rounded text-xs"
                  >
                    🌐 {getLanguageDisplayName(language)}
                    <Icon
                      name="x"
                      size={10}
                      className="cursor-pointer hover:text-accent/70"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLanguageToggle(language)
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/30 rounded p-2 text-center">
                <p className="font-semibold text-foreground">
                  {languageStats.reduce((sum, stat) => sum + stat.videoCount, 0).toLocaleString()}
                </p>
                <p className="text-muted-foreground">Total Videos</p>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <p className="font-semibold text-foreground">
                  {languageStats.length}
                </p>
                <p className="text-muted-foreground">Active Languages</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}