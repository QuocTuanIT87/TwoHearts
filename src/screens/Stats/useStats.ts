import { useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import React from "react";
import { AsyncStorageService, DateHistory, DateType } from "../../services/AsyncStorageService";

export type RangeFilter = "today" | "month" | "year" | "custom" | "all";

export const useStats = () => {
  const [history, setHistory] = useState<DateHistory[]>([]);
  const [types, setTypes] = useState<DateType[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [customStart, setCustomStart] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 1 week ago
  const [customEnd, setCustomEnd] = useState<Date>(new Date());
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");

  // Custom date picker visibilities
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Load database lists
  const loadData = async () => {
    try {
      setLoading(true);
      const list = await AsyncStorageService.getHistory();
      const loadedTypes = await AsyncStorageService.getTypes();
      setHistory(list);
      setTypes(loadedTypes);
    } catch (error) {
      console.error("Load stats failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reload statistics whenever the tab screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Filtered Events computed logic
  const getFilteredEvents = (): DateHistory[] => {
    return history.filter((item) => {
      const itemDate = new Date(item.time);
      const now = new Date();

      // 1. Time range check
      let matchesRange = false;
      switch (rangeFilter) {
        case "today": {
          matchesRange =
            itemDate.getDate() === now.getDate() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
          break;
        }
        case "month": {
          matchesRange =
            itemDate.getMonth() === selectedMonth &&
            itemDate.getFullYear() === now.getFullYear(); // limit to current year
          break;
        }
        case "year": {
          matchesRange = itemDate.getFullYear() === selectedYear;
          break;
        }
        case "custom": {
          // Normalise custom boundary times to match day ranges accurately
          const startBoundary = new Date(customStart);
          startBoundary.setHours(0, 0, 0, 0);
          
          const endBoundary = new Date(customEnd);
          endBoundary.setHours(23, 59, 59, 999);

          matchesRange = itemDate >= startBoundary && itemDate <= endBoundary;
          break;
        }
        case "all":
        default:
          matchesRange = true;
          break;
      }

      if (!matchesRange) return false;

      // 2. Category / Type check
      if (typeFilter === "Tất cả") return true;
      return item.type === typeFilter;
    });
  };

  const filteredEvents = getFilteredEvents();

  // Aggregate stats: Count percentages per category type
  const getCategoryBreakdown = () => {
    const counts: Record<string, number> = {};
    
    // Seed counts with 0 for all existing types
    types.forEach(t => {
      counts[t.name] = 0;
    });

    let total = 0;
    filteredEvents.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
      total++;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count); // Most frequent first
  };

  const categoryBreakdown = getCategoryBreakdown();

  return {
    filteredEvents,
    categoryBreakdown,
    types,
    loading,
    rangeFilter,
    setRangeFilter,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    typeFilter,
    setTypeFilter,
    showStartPicker,
    setShowStartPicker,
    showEndPicker,
    setShowEndPicker,
    loadData,
  };
};
