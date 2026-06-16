import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useApp } from "../../context/AppContext";
import { AsyncStorageService, DateType } from "../../services/AsyncStorageService";
import { GoogleDriveService, BackupFile, GoogleUser } from "../../services/GoogleDriveService";

export const useSettings = () => {
  const { refreshState } = useApp();
  const [types, setTypes] = useState<DateType[]>([]);
  const [loading, setLoading] = useState(false);

  // Google OAuth states
  const [clientId, setClientId] = useState("");
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  // Category modal state
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<DateType | null>(null);
  const [typeName, setTypeName] = useState("");

  // Backup list modal state
  const [showBackupListModal, setShowBackupListModal] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);

  // Load category list and Google settings
  const loadData = async () => {
    try {
      const list = await AsyncStorageService.getTypes();
      setTypes(list);

      const savedClientId = await GoogleDriveService.getClientId();
      setClientId(savedClientId);

      const token = await GoogleDriveService.getAccessToken();
      setGoogleToken(token);

      if (token) {
        const userInfo = await GoogleDriveService.getGoogleUserInfo();
        setGoogleUser(userInfo);
      }
    } catch (e) {
      console.error("Load settings details failed:", e);
    }
  };
  const loadCategories = loadData;

  useEffect(() => {
    loadData();
  }, []);

  const handleGoogleLogin = async () => {
    if (!clientId.trim()) {
      Alert.alert("Yêu cầu", "Vui lòng cấu hình GOOGLE_CLIENT_ID trong file src/services/GoogleDriveService.ts trước khi đăng nhập.");
      return;
    }
    try {
      setLoading(true);
      const userInfo = await GoogleDriveService.loginGoogle();
      setGoogleToken(await GoogleDriveService.getAccessToken());
      setGoogleUser(userInfo);
      Alert.alert("Thành công", "Kết nối tài khoản Google thành công!");
    } catch (e: any) {
      console.error("Google Login Error:", e);
      Alert.alert("Lỗi đăng nhập", e.message || "Không thể kết nối tài khoản Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      setLoading(true);
      await GoogleDriveService.logoutGoogle();
      setGoogleToken(null);
      setGoogleUser(null);
      Alert.alert("Đã đăng xuất", "Đã ngắt kết nối tài khoản Google.");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể đăng xuất.");
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const handleOpenAddType = () => {
    setEditingType(null);
    setTypeName("");
    setShowTypeModal(true);
  };

  const handleOpenEditType = (type: DateType) => {
    setEditingType(type);
    setTypeName(type.name);
    setShowTypeModal(true);
  };

  const handleSaveType = async () => {
    if (!typeName.trim()) {
      Alert.alert("Lỗi", "Tên loại hoạt động không được để trống.");
      return;
    }

    try {
      setLoading(true);
      if (editingType) {
        await AsyncStorageService.updateType(editingType.id, typeName);
      } else {
        await AsyncStorageService.addType(typeName);
      }
      await loadCategories();
      setShowTypeModal(false);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu hoạt động.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn muốn xóa loại hoạt động này? Lịch sử cũ có loại này vẫn được giữ nguyên nhưng loại này sẽ biến mất khỏi danh sách chọn khi thêm mới.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorageService.deleteType(id);
              await loadCategories();
            } catch (e) {
              Alert.alert("Lỗi", "Không thể xóa loại hoạt động.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Perform Manual Backup
  const handleBackupNow = async () => {
    try {
      setLoading(true);
      const fileName = await GoogleDriveService.performBackup();
      Alert.alert("Sao lưu thành công", `Đã lưu bản sao lưu thành file: \n${fileName}`);
    } catch (e: any) {
      Alert.alert("Lỗi sao lưu", e.message || "Không thể thực hiện sao lưu.");
    } finally {
      setLoading(false);
    }
  };

  // List backups to show in modal
  const handleOpenRestoreList = async () => {
    try {
      setLoading(true);
      const list = await GoogleDriveService.listBackups();
      setBackups(list);
      setShowBackupListModal(true);
    } catch (e: any) {
      Alert.alert("Lỗi danh sách", e.message || "Không thể lấy danh sách bản sao lưu.");
    } finally {
      setLoading(false);
    }
  };

  // Restore from a listed file
  const handleRestoreFromList = async (backup: BackupFile) => {
    Alert.alert(
      "Xác nhận khôi phục",
      `Bạn có muốn khôi phục dữ liệu từ bản sao lưu ngày ${new Date(backup.createdTime).toLocaleString("vi-VN")}?\nLƯU Ý: Dữ liệu hiện tại trên app sẽ bị thay thế hoàn toàn.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Khôi phục",
          onPress: async () => {
            try {
              setLoading(true);
              await GoogleDriveService.restoreBackup(backup.id);
              await refreshState();
              setShowBackupListModal(false);
              Alert.alert("Khôi phục hoàn tất", "Dữ liệu ứng dụng đã được khôi phục thành công.");
              router.replace("/(tabs)");
            } catch (e: any) {
              Alert.alert("Lỗi khôi phục", e.message || "Khôi phục thất bại.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Pick a local file using Document Picker and Restore
  const handlePickAndRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFileUri = result.assets[0].uri;
        
        Alert.alert(
          "Xác nhận khôi phục",
          "Bạn có chắc chắn muốn nhập dữ liệu từ file .txt này? Toàn bộ dữ liệu hiện tại sẽ bị ghi đè.",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Khôi phục",
              onPress: async () => {
                try {
                  setLoading(true);
                  await GoogleDriveService.restoreBackup(pickedFileUri);
                  await refreshState();
                  Alert.alert("Khôi phục hoàn tất", "Dữ liệu ứng dụng đã được khôi phục thành công.");
                  router.replace("/(tabs)");
                } catch (e: any) {
                  Alert.alert("Lỗi khôi phục", e.message || "Nhập file thất bại. Vui lòng kiểm tra lại cấu trúc file và mật khẩu mã hóa.");
                } finally {
                  setLoading(false);
                }
              },
            },
          ]
        );
      }
    } catch (e) {
      console.error("Document picking error:", e);
    }
  };

  // Factory reset (wipe all data)
  const handleWipeData = () => {
    Alert.alert(
      "CẢNH BÁO NGUY HIỂM ⚠️",
      "Hành động này sẽ XÓA SẠCH HOÀN TOÀN tất cả lịch sử hẹn hò, danh sách loại hoạt động, và cấu hình người dùng trên máy này!\nDữ liệu đã sao lưu trên Drive sẽ không bị ảnh hưởng. Bạn có chắc muốn tiếp tục?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "XÓA SẠCH DỮ LIỆU",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorageService.clearAll();
              await GoogleDriveService.logoutGoogle();
              await refreshState();
              Alert.alert("Hoàn tất", "Ứng dụng đã được đưa về trạng thái ban đầu.");
              router.replace("/onboarding");
            } catch (e) {
              Alert.alert("Lỗi", "Không thể xóa sạch dữ liệu.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return {
    types,
    loading,
    showTypeModal,
    setShowTypeModal,
    editingType,
    typeName,
    setTypeName,
    showBackupListModal,
    setShowBackupListModal,
    backups,
    handleOpenAddType,
    handleOpenEditType,
    handleSaveType,
    handleDeleteType,
    handleBackupNow,
    handleOpenRestoreList,
    handleRestoreFromList,
    handlePickAndRestore,
    handleWipeData,
    clientId,
    googleToken,
    googleUser,
    handleGoogleLogin,
    handleGoogleLogout,
  };
};
