import { useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import React from "react";
import { CustomAlert } from "../../components/CustomAlert";
import * as ImagePicker from "expo-image-picker";
import { AsyncStorageService, DateUser, DateStartTime } from "../../services/AsyncStorageService";
import { GoogleDriveService } from "../../services/GoogleDriveService";
import { getDurationSince, DurationDetails } from "../../utils/dateUtils";

export const useProfile = () => {
  const [users, setUsers] = useState<DateUser[]>([]);
  const [milestones, setMilestones] = useState<DateStartTime | null>(null);
  const [duration, setDuration] = useState<DurationDetails>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const handleUpdateAvatar = async (gender: "Nam" | "Nữ") => {
    try {
      const connected = await GoogleDriveService.isLoggedIn();
      if (!connected) {
        CustomAlert.alert(
          "Chưa kết nối Google",
          "Ảnh hồ sơ cần được lưu trên Google Drive. Vui lòng kết nối tài khoản Google trong phần Cài đặt."
        );
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        CustomAlert.alert("Quyền truy cập", "Ứng dụng cần quyền thư viện ảnh để chọn ảnh.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUpdatingAvatar(true);
        const localUri = result.assets[0].uri;

        // Upload new avatar to Google Drive
        const driveUrl = await GoogleDriveService.uploadAvatar(localUri, gender);

        // Update database
        const userList = await AsyncStorageService.getUsers();
        const boyUser = userList.find((u) => u.gender === "Nam");
        const girlUser = userList.find((u) => u.gender === "Nữ");

        if (gender === "Nam" && boyUser) {
          boyUser.avatar = driveUrl;
        } else if (gender === "Nữ" && girlUser) {
          girlUser.avatar = driveUrl;
        }

        if (boyUser && girlUser) {
          await AsyncStorageService.saveUsers(boyUser, girlUser);
        }

        // Reload data
        await loadData();
        CustomAlert.alert("Thành công", "Đã cập nhật ảnh đại diện.");
      }
    } catch (error: any) {
      console.error("Update avatar error:", error);
      CustomAlert.alert("Lỗi", error.message || "Không thể cập nhật ảnh đại diện.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  // Load profiles and milestones
  const loadData = async () => {
    try {
      setLoading(true);
      const userList = await AsyncStorageService.getUsers();
      const startTime = AsyncStorageService.getStartTime();
      
      setUsers(userList);
      setMilestones(startTime);
      
      // Calculate initial duration
      if (startTime && startTime.confessionDay) {
        setDuration(getDurationSince(startTime.confessionDay));
      }
    } catch (error) {
      console.error("Load profiles failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run on tab screen focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Setup live timer ticking every second for the anniversary counter
  useEffect(() => {
    if (!milestones || !milestones.confessionDay) return;

    const interval = setInterval(() => {
      setDuration(getDurationSince(milestones.confessionDay));
    }, 1000);

    return () => clearInterval(interval);
  }, [milestones]);

  return {
    users,
    milestones,
    duration,
    loading,
    loadData,
    updatingAvatar,
    handleUpdateAvatar,
  };
};
