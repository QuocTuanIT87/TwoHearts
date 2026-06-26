import { useState, useEffect } from "react";
import { CustomAlert } from "../../components/CustomAlert";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { AsyncStorageService, DateType } from "../../services/AsyncStorageService";
import { GoogleDriveService, GoogleUser } from "../../services/GoogleDriveService";

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
      CustomAlert.alert("Yêu cầu", "Vui lòng cấu hình GOOGLE_CLIENT_ID trong file src/services/GoogleDriveService.ts trước khi đăng nhập.");
      return;
    }
    try {
      setLoading(true);
      const userInfo = await GoogleDriveService.loginGoogle();
      setGoogleToken(await GoogleDriveService.getAccessToken());
      setGoogleUser(userInfo);
      CustomAlert.alert("Thành công", "Kết nối tài khoản Google thành công!");
    } catch (e: any) {
      console.error("Google Login Error:", e);
      CustomAlert.alert("Lỗi đăng nhập", e.message || "Không thể kết nối tài khoản Google.");
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
      CustomAlert.alert("Đã đăng xuất", "Đã ngắt kết nối tài khoản Google.");
    } catch (e) {
      CustomAlert.alert("Lỗi", "Không thể đăng xuất.");
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
      CustomAlert.alert("Lỗi", "Tên loại hoạt động không được để trống.");
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
      CustomAlert.alert("Lỗi", "Không thể lưu hoạt động.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    CustomAlert.alert(
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
              CustomAlert.alert("Lỗi", "Không thể xóa loại hoạt động.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Perform Manual Backup to Google Drive
  const handleBackupNow = async () => {
    try {
      setLoading(true);
      const fileName = await GoogleDriveService.performBackup();
      CustomAlert.alert("Sao lưu thành công", `Đã lưu bản sao lưu thành file JSON trên Google Drive: \n${fileName}`);
    } catch (e: any) {
      CustomAlert.alert("Lỗi sao lưu", e.message || "Không thể thực hiện sao lưu.");
    } finally {
      setLoading(false);
    }
  };

  // Factory reset (wipe all data)
  const handleWipeData = () => {
    CustomAlert.alert(
      "CẢNH BÁO NGUY HIỂM ⚠️",
      "Hành động này sẽ XÓA SẠCH HOÀN TOÀN tất cả lịch sử hẹn hò, danh sách loại hoạt động, và cấu hình người dùng trên máy và trên Firebase Realtime Database!\nDữ liệu đã sao lưu trên Drive sẽ không bị ảnh hưởng. Bạn có chắc muốn tiếp tục?",
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
              CustomAlert.alert("Hoàn tất", "Ứng dụng đã được đưa về trạng thái ban đầu.");
              router.replace("/onboarding");
            } catch (e) {
              CustomAlert.alert("Lỗi", "Không thể xóa sạch dữ liệu.");
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
    handleOpenAddType,
    handleOpenEditType,
    handleSaveType,
    handleDeleteType,
    handleBackupNow,
    handleWipeData,
    clientId,
    googleToken,
    googleUser,
    handleGoogleLogin,
    handleGoogleLogout,
  };
};
