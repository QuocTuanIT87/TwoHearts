import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { GoogleDriveService, BackupFile, GoogleUser } from "../../services/GoogleDriveService";

export const useGoogleConnect = () => {
  const { refreshState } = useApp();
  
  const [clientId, setClientId] = useState("");
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initGoogle = async () => {
      try {
        const id = await GoogleDriveService.getClientId();
        setClientId(id);
        const token = await GoogleDriveService.getAccessToken();
        setGoogleToken(token);
        if (token) {
          const info = await GoogleDriveService.getGoogleUserInfo();
          setGoogleUser(info);
          const list = await GoogleDriveService.listBackups();
          setBackups(list);
        }
      } catch (e) {
        console.warn("Init Google in connect screen failed:", e);
      }
    };
    initGoogle();
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
      
      // Load backups
      const list = await GoogleDriveService.listBackups();
      setBackups(list);
      
      Alert.alert("Thành công", "Đã kết nối tài khoản Google thành công!");
    } catch (e: any) {
      console.error("Google Connect Login error:", e);
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
      setBackups([]);
      Alert.alert("Đã ngắt kết nối", "Đã ngắt kết nối tài khoản Google.");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể ngắt kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupFile) => {
    Alert.alert(
      "Xác nhận khôi phục",
      `Bạn có muốn khôi phục dữ liệu từ bản sao lưu ngày ${new Date(backup.createdTime).toLocaleString("vi-VN")}?\nLƯU Ý: Toàn bộ dữ liệu hiện tại trên máy sẽ bị ghi đè.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Khôi phục",
          onPress: async () => {
            try {
              setLoading(true);
              await GoogleDriveService.restoreBackup(backup.id);
              await refreshState();
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

  const handleProceedToOnboarding = () => {
    router.replace("/onboarding");
  };

  return {
    clientId,
    googleToken,
    googleUser,
    backups,
    loading,
    handleGoogleLogin,
    handleGoogleLogout,
    handleRestoreBackup,
    handleProceedToOnboarding,
  };
};
