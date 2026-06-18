import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ZoomableImage } from "../../components/ZoomableImage";
import { formatDateTime } from "../../utils/dateUtils";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import { useAddEvent } from "./useAddEvent";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const AddEventView: React.FC = () => {
  const {
    history,
    types,
    loading,
    showForm,
    handleOpenForm,
    editingId,
    time,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    selectedType,
    setSelectedType,
    note,
    setNote,
    imageList,
    reason,
    setReason,
    uploadingImage,
    showMenuModal,
    setShowMenuModal,
    handleSelectImage,
    handleRemoveImage,
    handleOpenMenu,
    triggerEdit,
    triggerDelete,
    handleCancelForm,
    handleSaveEvent,
    handleDateChange,
    handleDateDismiss,
    handleTimeChange,
    handleTimeDismiss,
    handleLoadMore,
    hasMore,
  } = useAddEvent();

  const [viewerImages, setViewerImages] = React.useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = React.useState<number>(0);
  const [showViewer, setShowViewer] = React.useState<boolean>(false);

  // Render a single history card
  const renderHistoryItem = ({ item }: { item: (typeof history)[0] }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type}</Text>
          </View>
          <View style={styles.headerRightContainer}>
            <Text style={styles.cardTime}>{formatDateTime(item.time)}</Text>
            <TouchableOpacity
              onPress={() => handleOpenMenu(item)}
              style={styles.threeDotsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {item.note ? <Text style={styles.cardNote}>{item.note}</Text> : null}

        {item.reason ? (
          <View style={styles.reasonContainer}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.cardReason}>
              <Text style={styles.boldText}>Dịp: </Text>
              {item.reason}
            </Text>
          </View>
        ) : null}

        {item.imageList && item.imageList.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
          >
            {item.imageList.map((imgUri, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  setViewerImages(item.imageList);
                  setViewerIndex(index);
                  setShowViewer(true);
                }}
              >
                <Image source={{ uri: imgUri }} style={styles.cardImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {uploadingImage && (
            <Text style={styles.loadingText}>
              Upload ảnh chất lượng sẽ diễn ra hơi lâu. Vui lòng chờ trong giây
              lát...
            </Text>
          )}
        </View>
      )}

      {showForm ? (
        // Event Add/Edit Form
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.formTitle}>
              {editingId
                ? "Cập nhật khoảnh khắc ✏️"
                : "Ghi lại khoảnh khắc mới ❤️"}
            </Text>

            {/* Date & Time Input */}
            <Text style={styles.label}>Ngày và Giờ diễn ra *</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.pickerIcon}
                />
                <Text style={styles.pickerButtonText}>
                  {time.toLocaleDateString("vi-VN")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.pickerIcon}
                />
                <Text style={styles.pickerButtonText}>
                  {time.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker Component */}
            {showDatePicker && (
              <DateTimePicker
                value={time}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onValueChange={handleDateChange}
                onDismiss={handleDateDismiss}
                accentColor={COLORS.primary}
              />
            )}

            {/* Time Picker Component */}
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onValueChange={handleTimeChange}
                onDismiss={handleTimeDismiss}
                accentColor={COLORS.primary}
              />
            )}

            {/* Type Picker Chips */}
            <Text style={styles.label}>Loại hoạt động *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContainer}
            >
              {types.map((t) => {
                const selected = selectedType === t.name;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typeChip,
                      selected ? styles.typeChipSelected : null,
                    ]}
                    onPress={() => setSelectedType(t.name)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        selected ? styles.typeChipTextSelected : null,
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Note input */}
            <Text style={styles.label}>Ghi chú kỉ niệm</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Hôm nay hai đứa làm gì cùng nhau?..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={note}
              onChangeText={setNote}
            />

            {/* Reason input */}
            <Text style={styles.label}>Dịp</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Kỉ niệm tròn 1 tháng, Ngày nghỉ lễ..."
              placeholderTextColor={COLORS.textMuted}
              value={reason}
              onChangeText={setReason}
            />

            {/* Images Picker */}
            <Text style={styles.label}>Hình ảnh kỷ niệm</Text>
            <View style={styles.imageSelectorContainer}>
              <TouchableOpacity
                style={styles.addImageBtn}
                onPress={handleSelectImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={24}
                      color={COLORS.primary}
                    />
                    <Text style={styles.addImageText}>Chọn ảnh</Text>
                  </>
                )}
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.formImageScroll}
              >
                {imageList.map((uri, index) => (
                  <View key={index} style={styles.formImageWrapper}>
                    <Image source={{ uri }} style={styles.formThumbnail} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close" size={16} color={COLORS.surface} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Action buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  uploadingImage ? { opacity: 0.5 } : null,
                ]}
                onPress={handleCancelForm}
                disabled={uploadingImage}
              >
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  uploadingImage ? { opacity: 0.5 } : null,
                ]}
                onPress={handleSaveEvent}
                disabled={uploadingImage}
              >
                <Text style={styles.saveBtnText}>Lưu kỉ niệm</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        // History List Dashboard
        <View style={{ flex: 1 }}>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Dòng thời gian yêu 💕</Text>
                <Text style={styles.listSubtitle}>
                  Khoảnh khắc ngọt ngào đã được lưu giữ
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="heart-half-outline"
                  size={64}
                  color={COLORS.primary}
                  style={{ opacity: 0.6 }}
                />
                <Text style={styles.emptyText}>
                  Chưa có sự kiện nào được ghi lại.
                </Text>
                <Text style={styles.emptySubtext}>
                  Hãy bấm vào dấu cộng để bắt đầu lưu kỉ niệm đầu tiên của hai
                  bạn nhé!
                </Text>
              </View>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              hasMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : null
            }
          />

          {/* Floating Action Button (FAB) to Add Event */}
          <TouchableOpacity style={styles.fab} onPress={handleOpenForm}>
            <Ionicons name="add" size={32} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      )}

      {/* 3-Dots Action Sheet Modal */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Tùy chọn kỉ niệm</Text>

            <TouchableOpacity style={styles.menuItem} onPress={triggerEdit}>
              <Ionicons
                name="create-outline"
                size={20}
                color={COLORS.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuItemText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={triggerDelete}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={COLORS.danger}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuItemText, { color: COLORS.danger }]}>
                Xóa hoàn toàn sự kiện
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCloseBtn}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={styles.menuCloseBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen Image Viewer Modal */}
      <ImageViewerModal
        visible={showViewer}
        images={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setShowViewer(false)}
      />
    </SafeAreaView>
  );
};

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  // Sync index and scroll state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setScrollEnabled(true);
    }
  }, [visible, initialIndex]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.viewerContainer}>
          {/* Header row with index indicator and close button */}
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerIndicator}>
              {currentIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity
              style={styles.viewerCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              scrollEnabled={scrollEnabled}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => i.toString()}
              initialScrollIndex={initialIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                );
                setCurrentIndex(index);
              }}
              renderItem={({ item: imgUri }) => (
                <View style={styles.viewerImageWrapper}>
                  <ZoomableImage
                    uri={
                      imgUri.includes("googleusercontent.com")
                        ? imgUri.replace(/=s\d+$/, "=s0")
                        : imgUri
                    }
                    onZoomStateChange={(zoomed) => setScrollEnabled(!zoomed)}
                  />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
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
  listContainer: {
    padding: SIZES.paddingMd,
    paddingBottom: 80,
  },
  listHeader: {
    marginBottom: SIZES.paddingMd,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  listSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    marginBottom: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.paddingSm,
  },
  typeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  typeBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 6,
  },
  threeDotsButton: {
    padding: 4,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
  },
  lockText: {
    fontSize: 10,
    color: COLORS.lock,
    marginLeft: 4,
    fontWeight: "500",
  },
  cardNote: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SIZES.paddingSm,
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.paddingSm,
  },
  cardReason: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 6,
    flex: 1,
  },
  boldText: {
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  imageScroll: {
    marginTop: SIZES.paddingSm,
  },
  imageScrollContent: {
    paddingRight: 16,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: SIZES.radiusMd,
    marginRight: 8,
    backgroundColor: "#e2e8f0",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: SIZES.paddingLg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    padding: SIZES.paddingMd,
    paddingBottom: 140, // Tăng thêm padding bottom lớn để lướt được qua các nút Lưu/Hủy khi bàn phím hiện
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.paddingLg,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.paddingMd,
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    paddingHorizontal: SIZES.paddingSm,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  pickerIcon: {
    marginRight: 6,
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  chipsScroll: {
    marginBottom: SIZES.paddingMd,
  },
  chipsContainer: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  typeChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    ...SHADOWS.light,
  },
  typeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  typeChipTextSelected: {
    color: COLORS.surface,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.paddingMd,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SIZES.paddingMd,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  imageSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.paddingLg,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.paddingMd,
  },
  addImageText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  formImageScroll: {
    flex: 1,
  },
  formImageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  formThumbnail: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusMd,
    backgroundColor: "#cbd5e1",
  },
  removeImageBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.paddingSm,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SIZES.paddingSm,
    ...SHADOWS.light,
  },
  saveBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  menuContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    paddingBottom: Platform.OS === "ios" ? 40 : SIZES.paddingLg,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.paddingMd,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  menuCloseBtn: {
    marginTop: SIZES.paddingMd,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
  },
  menuCloseBtnText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 15,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  viewerHeader: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  viewerIndicator: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewerCloseBtn: {
    padding: 4,
  },
  viewerImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 60,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerFullImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  imageHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontStyle: "italic",
  },
});
