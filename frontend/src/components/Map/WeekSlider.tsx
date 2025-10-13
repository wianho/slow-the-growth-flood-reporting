import React from 'react';

interface WeekSliderProps {
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  maxWeeks?: number;
}

export function WeekSlider({ weekOffset, onWeekChange, maxWeeks = 12 }: WeekSliderProps) {
  const getWeekLabel = (offset: number) => {
    if (offset === 0) return 'This Week';
    if (offset === 1) return 'Last Week';
    return `${offset} Weeks Ago`;
  };

  const getWeekDateRange = (offset: number) => {
    const now = new Date();
    const weeksAgo = offset * 7;
    const endDate = new Date(now.getTime() - weeksAgo * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg z-[1000] p-4 max-w-md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Time Travel</h3>
            <p className="text-xs text-gray-500">View reports from past weeks</p>
          </div>
        </div>

        {/* Week Label */}
        <div className="text-center">
          <p className="text-lg font-bold text-primary-600">{getWeekLabel(weekOffset)}</p>
          <p className="text-xs text-gray-500">{getWeekDateRange(weekOffset)}</p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <input
            type="range"
            min="0"
            max={maxWeeks}
            value={weekOffset}
            onChange={(e) => onWeekChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Now</span>
            <span>{maxWeeks}w ago</span>
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onWeekChange(0)}
            disabled={weekOffset === 0}
            className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => onWeekChange(1)}
            disabled={weekOffset === 1}
            className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Last Week
          </button>
          <button
            onClick={() => onWeekChange(4)}
            disabled={weekOffset === 4}
            className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            1 Month
          </button>
        </div>

        {weekOffset > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            📅 Viewing archived reports from {getWeekDateRange(weekOffset)}
          </div>
        )}
      </div>
    </div>
  );
}
