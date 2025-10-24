"use client"

import { useState, useCallback, forwardRef } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface TokenSearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const TokenSearchInput = forwardRef<HTMLInputElement, TokenSearchInputProps>(({
  placeholder = "Search tokens...",
  value = "",
  onChange,
  onClear,
  className = "",
  size = 'md',
  disabled = false
}, ref) => {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange?.("");
    onClear?.();
  }, [onChange, onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className={cn(
      "relative flex items-center",
      className
    )}>
      {/* 검색 아이콘 */}
      <div className="absolute left-3 flex items-center pointer-events-none">
        <Icon
          name="search"
          size={iconSizes[size]}
          className="text-muted-foreground"
        />
      </div>

      {/* 검색 입력 필드 */}
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full pl-10 pr-10 border border-border rounded-lg",
          "bg-background text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-colors duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          focused && "ring-2 ring-primary/20 border-primary"
        )}
      />

      {/* 클리어 버튼 */}
      {value && (
        <button
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            "absolute right-3 flex items-center justify-center",
            "hover:bg-muted rounded-full transition-colors p-1",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Clear search"
        >
          <Icon
            name="x"
            size={iconSizes[size] - 2}
            className="text-muted-foreground hover:text-foreground"
          />
        </button>
      )}
    </div>
  );
});

TokenSearchInput.displayName = "TokenSearchInput";

export default TokenSearchInput;