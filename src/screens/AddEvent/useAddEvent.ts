import React, { useState, useEffect, useCallback } from "react";
import { CustomAlert } from "../../components/CustomAlert";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, router } from "expo-router";
import { AsyncStorageService, DateHistory, DateType } from "../../services/AsyncStorageService";
import { GoogleDriveService } from "../../services/GoogleDriveService";
import { toLocalISOString } from "../../utils/dateUtils";

export const useAddEvent = () => {
  const [history, setHistory] = useState<DateHistory[]>([]);
  const [allHistory, setAllHistory] = useState<DateHistory[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [types, setTypes] = useState<DateType[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [time, setTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [note, setNote] = useState("");
  const [imageList, setImageList] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  // Action sheet/Modal state for 3-dots menu
  const [menuEvent, setMenuEvent] = useState<DateHistory | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);

  // Load history list and date types
  const loadData = async (preserveLimit = false) => {
    try {
      setLoading(true);
      const list = await AsyncStorageService.getHistory();
      const loadedTypes = await AsyncStorageService.getTypes();
      
      // Sort by time descending (newest first). Equal times remain in any order.
      const sorted = list.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      });

      setAllHistory(sorted);
      setTypes(loadedTypes);

      const limit = preserveLimit ? displayLimit : 20;
      if (!preserveLimit) {
        setDisplayLimit(20);
      }
      setHistory(sorted.slice(0, limit));

      if (loadedTypes.length > 0 && !selectedType) {
        setSelectedType(loadedTypes[0].name);
      }
    } catch (error) {
      CustomAlert.alert("Lỗi", "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [])
  );

  const handleLoadMore = () => {
    if (history.length >= allHistory.length) return;
    const newLimit = displayLimit + 20;
    setDisplayLimit(newLimit);
    setHistory(allHistory.slice(0, newLimit));
  };

  // Image selection
  const handleSelectImage = async () => {
    try {
      // Enforce Google connection first
      const connected = await GoogleDriveService.isLoggedIn();
      if (!connected) {
        CustomAlert.alert(
          "Chưa kết nối Google",
          "Hình ảnh cần được lưu trữ trên Google Drive. Vui lòng vào mục Cài đặt kết nối tài khoản Google trước."
        );
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        CustomAlert.alert("Quyền truy cập", "Ứng dụng cần quyền thư viện ảnh để thêm ảnh.");
        return;
      }

      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        allowsEditing: false,
        selectionLimit: 0,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUris = result.assets.map(asset => asset.uri);
        setImageList(prev => [...prev, ...localUris]);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      CustomAlert.alert("Lỗi chọn ảnh", "Không thể chọn ảnh.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const targetUrl = imageList[index];
    setImageList(prev => prev.filter((_, i) => i !== index));

    if (targetUrl.startsWith("http")) {
      setRemovedImages(prev => [...prev, targetUrl]);
    }
  };

  // Triggered when 3-dots button is pressed on a card
  const handleOpenMenu = (event: DateHistory) => {
    setMenuEvent(event);
    setShowMenuModal(true);
  };

  // Edit action from menu
  const triggerEdit = () => {
    if (!menuEvent) return;
    setShowMenuModal(false);

    setEditingId(menuEvent.id);
    setTime(new Date(menuEvent.time));
    setSelectedType(menuEvent.type);
    setNote(menuEvent.note || "");
    setImageList(menuEvent.imageList || []);
    setRemovedImages([]);
    setReason(menuEvent.reason || "");
    setShowForm(true);
    setMenuEvent(null);
  };

  // Delete action from menu
  const triggerDelete = () => {
    if (!menuEvent) return;
    setShowMenuModal(false);
    const id = menuEvent.id;
    const imagesToDelete = menuEvent.imageList || [];

    CustomAlert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa hoàn toàn sự kiện này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorageService.deleteHistoryItem(id);

              // Delete all associated images from Google Drive
              for (const url of imagesToDelete) {
                const fileId = GoogleDriveService.getFileIdFromUrl(url);
                if (fileId) {
                  try {
                    await GoogleDriveService.deleteFile(fileId);
                  } catch (err) {
                    console.warn("Failed to delete image from Google Drive during deletion:", err);
                  }
                }
              }

              await loadData(true);
              setMenuEvent(null);
            } catch (error: any) {
              CustomAlert.alert("Lỗi", error.message || "Không thể xóa sự kiện.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Cancel form and reset states
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTime(new Date());
    setNote("");
    setImageList([]);
    setReason("");
    setRemovedImages([]);
    if (types.length > 0) {
      setSelectedType(types[0].name);
    }
  };

  // Save / Update form submit
  const handleSaveEvent = async () => {
    if (!selectedType) {
      CustomAlert.alert("Lỗi", "Vui lòng chọn loại hẹn hò.");
      return;
    }

    if (!note.trim()) {
      CustomAlert.alert("Yêu cầu", "Vui lòng nhập Ghi chú kỉ niệm trước khi lưu.");
      return;
    }

    try {
      setLoading(true);

      // Separate local URIs and existing Drive URLs
      const localUris = imageList.filter(uri => !uri.startsWith("http"));
      const existingUrls = imageList.filter(uri => uri.startsWith("http"));

      const uploadedUrls: string[] = [];
      setUploadingImage(true);
      try {
        for (const localUri of localUris) {
          const uploadedUrl = await GoogleDriveService.uploadImage(localUri);
          uploadedUrls.push(uploadedUrl);
        }
      } catch (uploadError: any) {
        throw new Error(`Tải ảnh lên Google Drive thất bại: ${uploadError.message || uploadError}`);
      } finally {
        setUploadingImage(false);
      }

      const finalImageList = [...existingUrls, ...uploadedUrls];
      const isoTime = toLocalISOString(time);
      const payload = {
        time: isoTime,
        type: selectedType,
        note: note.trim(),
        imageList: finalImageList,
        reason: reason.trim(),
      };

      if (editingId) {
        // Enforce 14-day rule
        await AsyncStorageService.updateHistoryItem(editingId, payload);
      } else {
        await AsyncStorageService.addHistoryItem(payload);
      }

      await loadData();
      
      // Delete removed original images from Google Drive
      for (const url of removedImages) {
        const fileId = GoogleDriveService.getFileIdFromUrl(url);
        if (fileId) {
          try {
            await GoogleDriveService.deleteFile(fileId);
          } catch (err) {
            console.warn("Failed to delete removed original image:", err);
          }
        }
      }

      handleCancelForm();
    } catch (error: any) {
      CustomAlert.alert("Lỗi khi lưu", error.message || "Lưu thông tin thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // Date and Time picker handlers
  const handleDateChange = (event: any, selectedDate: Date) => {
    setShowDatePicker(false);
    const newTime = new Date(time);
    newTime.setFullYear(selectedDate.getFullYear());
    newTime.setMonth(selectedDate.getMonth());
    newTime.setDate(selectedDate.getDate());
    setTime(newTime);
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  const handleTimeChange = (event: any, selectedTime: Date) => {
    setShowTimePicker(false);
    const newTime = new Date(time);
    newTime.setHours(selectedTime.getHours());
    newTime.setMinutes(selectedTime.getMinutes());
    setTime(newTime);
  };

  const handleTimeDismiss = () => {
    setShowTimePicker(false);
  };

  const handleOpenForm = () => {
    if (types.length === 0) {
      CustomAlert.alert(
        "Chưa có loại hình hẹn hò",
        "Bạn chưa có loại hình hẹn hò nào. Vui lòng thêm loại hình hẹn hò trước khi lưu nhật ký.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Thêm loại hình",
            onPress: () => {
              router.push("/(tabs)/settings");
            },
          },
        ],
        { cancelable: true }
      );
      return;
    }
    setShowForm(true);
  };

  return {
    history,
    types,
    loading,
    showForm,
    setShowForm,
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
    handleOpenForm,
    handleLoadMore,
    hasMore: history.length < allHistory.length,
  };
};
