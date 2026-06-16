import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateTime } from "../../utils/dateUtils";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import { RangeFilter, useStats } from "./useStats";

const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const StatsView: React.FC = () => {
  const {
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
  } = useStats();

  const handleRangeSelect = (filter: RangeFilter) => {
    setRangeFilter(filter);
  };

  const adjustYear = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleCustomStartChange = (event: any, date: Date) => {
    setShowStartPicker(false);
    setCustomStart(date);
  };

  const handleCustomStartDismiss = () => {
    setShowStartPicker(false);
  };

  const handleCustomEndChange = (event: any, date: Date) => {
    setShowEndPicker(false);
    setCustomEnd(date);
  };

  const handleCustomEndDismiss = () => {
    setShowEndPicker(false);
  };

  const renderEventItem = ({ item }: { item: (typeof filteredEvents)[0] }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTypeName}>{item.type}</Text>
        <Text style={styles.eventTimeText}>{formatDateTime(item.time)}</Text>
      </View>
      {item.note ? (
        <Text style={styles.eventNoteText} numberOfLines={2}>
          {item.note}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Filter Control Header */}
      <View style={styles.filterSection}>
        {/* Horizontal scroll of primary range filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rangeChipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.rangeChip,
              rangeFilter === "all" ? styles.rangeChipActive : null,
            ]}
            onPress={() => handleRangeSelect("all")}
          >
            <Text
              style={[
                styles.rangeChipText,
                rangeFilter === "all" ? styles.rangeChipTextActive : null,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeChip,
              rangeFilter === "today" ? styles.rangeChipActive : null,
            ]}
            onPress={() => handleRangeSelect("today")}
          >
            <Text
              style={[
                styles.rangeChipText,
                rangeFilter === "today" ? styles.rangeChipTextActive : null,
              ]}
            >
              Hôm nay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeChip,
              rangeFilter === "month" ? styles.rangeChipActive : null,
            ]}
            onPress={() => handleRangeSelect("month")}
          >
            <Text
              style={[
                styles.rangeChipText,
                rangeFilter === "month" ? styles.rangeChipTextActive : null,
              ]}
            >
              Theo tháng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeChip,
              rangeFilter === "year" ? styles.rangeChipActive : null,
            ]}
            onPress={() => handleRangeSelect("year")}
          >
            <Text
              style={[
                styles.rangeChipText,
                rangeFilter === "year" ? styles.rangeChipTextActive : null,
              ]}
            >
              Theo năm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeChip,
              rangeFilter === "custom" ? styles.rangeChipActive : null,
            ]}
            onPress={() => handleRangeSelect("custom")}
          >
            <Text
              style={[
                styles.rangeChipText,
                rangeFilter === "custom" ? styles.rangeChipTextActive : null,
              ]}
            >
              Tùy chọn 📅
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sub-controllers based on selected range filter */}
        {rangeFilter === "month" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subChipsContainer}
            style={styles.subScroll}
          >
            {MONTHS.map((m, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.subChip,
                  selectedMonth === idx ? styles.subChipActive : null,
                ]}
                onPress={() => setSelectedMonth(idx)}
              >
                <Text
                  style={[
                    styles.subChipText,
                    selectedMonth === idx ? styles.subChipTextActive : null,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {rangeFilter === "year" && (
          <View style={styles.yearSelector}>
            <TouchableOpacity
              onPress={() => adjustYear("prev")}
              style={styles.adjustBtn}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.yearText}>Năm {selectedYear}</Text>
            <TouchableOpacity
              onPress={() => adjustYear("next")}
              style={styles.adjustBtn}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        )}

        {rangeFilter === "custom" && (
          <View style={styles.customPickerRow}>
            <TouchableOpacity
              style={styles.customDateBtn}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.customDateBtnLabel}>Từ:</Text>
              <Text style={styles.customDateBtnVal}>
                {customStart.toLocaleDateString("vi-VN")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.customDateBtn}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.customDateBtnLabel}>Đến:</Text>
              <Text style={styles.customDateBtnVal}>
                {customEnd.toLocaleDateString("vi-VN")}
              </Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={customStart}
                mode="date"
                onValueChange={handleCustomStartChange}
                onDismiss={handleCustomStartDismiss}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={customEnd}
                mode="date"
                onValueChange={handleCustomEndChange}
                onDismiss={handleCustomEndDismiss}
              />
            )}
          </View>
        )}

        {/* Category horizontal filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContainer}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.catChip,
              typeFilter === "Tất cả" ? styles.catChipActive : null,
            ]}
            onPress={() => setTypeFilter("Tất cả")}
          >
            <Text
              style={[
                styles.catChipText,
                typeFilter === "Tất cả" ? styles.catChipTextActive : null,
              ]}
            >
              Tất cả hoạt động
            </Text>
          </TouchableOpacity>
          {types.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.catChip,
                typeFilter === t.name ? styles.catChipActive : null,
              ]}
              onPress={() => setTypeFilter(t.name)}
            >
              <Text
                style={[
                  styles.catChipText,
                  typeFilter === t.name ? styles.catChipTextActive : null,
                ]}
              >
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Stats and List View */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Category Breakdown Progress bars */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Phân tích hoạt động 📊</Text>
              {categoryBreakdown.length === 0 || filteredEvents.length === 0 ? (
                <Text style={styles.noDataText}>
                  Không có dữ liệu trong khoảng thời gian này
                </Text>
              ) : (
                categoryBreakdown.map((item, idx) => (
                  <View key={idx} style={styles.breakdownRow}>
                    <View style={styles.breakdownLabelRow}>
                      <Text style={styles.breakdownLabelName}>{item.name}</Text>
                      <Text style={styles.breakdownLabelCount}>
                        {item.count} lần ({Math.round(item.percentage)}%)
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${item.percentage}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Header for matching list */}
            {filteredEvents.length > 0 && (
              <Text style={styles.matchingListHeader}>
                Danh sách sự kiện khớp ({filteredEvents.length})
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={COLORS.textMuted}
              style={{ opacity: 0.5 }}
            />
            <Text style={styles.emptyText}>Không tìm thấy sự kiện nào.</Text>
            <Text style={styles.emptySubtext}>
              Hãy đổi bộ lọc thời gian hoặc phân loại hoạt động.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.paddingSm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.light,
  },
  rangeChipsContainer: {
    paddingHorizontal: SIZES.paddingMd,
    paddingBottom: SIZES.paddingSm,
  },
  rangeChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  rangeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rangeChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  rangeChipTextActive: {
    color: COLORS.surface,
    fontWeight: "bold",
  },
  subScroll: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  subChipsContainer: {
    paddingHorizontal: SIZES.paddingMd,
    paddingBottom: 4,
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  subChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  subChipText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  subChipTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  adjustBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginHorizontal: 24,
  },
  customPickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.paddingMd,
    marginVertical: 4,
  },
  customDateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  customDateBtnLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginRight: 4,
  },
  customDateBtnVal: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text,
  },
  categoryScroll: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    marginTop: 4,
  },
  categoryChipsContainer: {
    paddingHorizontal: SIZES.paddingMd,
    paddingBottom: 4,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  catChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  catChipTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  listContainer: {
    padding: SIZES.paddingMd,
  },
  totalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  totalIconContainer: {
    backgroundColor: COLORS.primaryLight,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.paddingMd,
  },
  totalTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  totalCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 2,
  },
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
    marginBottom: SIZES.paddingLg,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.paddingMd,
  },
  noDataText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 13,
    paddingVertical: 12,
  },
  breakdownRow: {
    marginBottom: SIZES.paddingMd,
  },
  breakdownLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  breakdownLabelName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  breakdownLabelCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  matchingListHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.paddingSm,
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingMd,
    marginBottom: SIZES.paddingSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  eventTypeName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  eventTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  eventNoteText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});
