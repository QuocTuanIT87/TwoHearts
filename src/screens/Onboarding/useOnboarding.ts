import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { AsyncStorageService, DateUser } from "../../services/AsyncStorageService";
import { GoogleDriveService, BackupFile, GoogleUser } from "../../services/GoogleDriveService";

// Helper to create empty user state
const createEmptyUser = (id: string, gender: "Nam" | "Nữ"): DateUser => ({
  id,
  name: "",
  phone: "",
  facebook: "",
  tiktok: "",
  interest: [],
  dislike: [],
  hate: [],
  height: 0,
  weight: 0,
  birthday: "",
  gender,
  shoeSize: "",
  shirtSize: "",
});

export const useOnboarding = () => {
  const { refreshState } = useApp();
  const [activeStep, setActiveStep] = useState<1 | 2>(1); // Step 1 for User 1, Step 2 for User 2
  
  // Temporary string input holders for comma-separated arrays
  const [interestStr1, setInterestStr1] = useState("");
  const [dislikeStr1, setDislikeStr1] = useState("");
  const [hateStr1, setHateStr1] = useState("");

  const [interestStr2, setInterestStr2] = useState("");
  const [dislikeStr2, setDislikeStr2] = useState("");
  const [hateStr2, setHateStr2] = useState("");

  const [user1, setUser1] = useState<DateUser>(createEmptyUser("user_1", "Nam"));
  const [user2, setUser2] = useState<DateUser>(createEmptyUser("user_2", "Nữ"));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Google Sign-in & Backup list states
  const [clientId, setClientId] = useState("");
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

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
        console.warn("Init Google in onboarding failed:", e);
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
      console.error("Onboarding Google Login error:", e);
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
              setShowGoogleModal(false);
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

  const validateUser = (user: DateUser, step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name (optional but highly recommended, we provide a placeholder if empty)
    const nameVal = user.name.trim();

    if (!user.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (!user.birthday.trim()) {
      newErrors.birthday = "Ngày sinh là bắt buộc";
    }
    if (!user.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }
    
    const heightNum = Number(user.height);
    if (!user.height || isNaN(heightNum) || heightNum <= 0) {
      newErrors.height = "Chiều cao phải là số dương";
    }

    const weightNum = Number(user.weight);
    if (!user.weight || isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = "Cân nặng phải là số dương";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // Process comma separated lists for user 1
    const parsedUser1 = {
      ...user1,
      name: user1.name.trim() || "Bạn Nam",
      interest: interestStr1.split(",").map(i => i.trim()).filter(Boolean),
      dislike: dislikeStr1.split(",").map(i => i.trim()).filter(Boolean),
      hate: hateStr1.split(",").map(i => i.trim()).filter(Boolean),
      height: Number(user1.height),
      weight: Number(user1.weight),
    };
    setUser1(parsedUser1);

    if (validateUser(parsedUser1, 1)) {
      setErrors({});
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(1);
  };

  const handleSubmit = async () => {
    // Process comma separated lists for user 2
    const parsedUser2 = {
      ...user2,
      name: user2.name.trim() || "Bạn Nữ",
      interest: interestStr2.split(",").map(i => i.trim()).filter(Boolean),
      dislike: dislikeStr2.split(",").map(i => i.trim()).filter(Boolean),
      hate: hateStr2.split(",").map(i => i.trim()).filter(Boolean),
      height: Number(user2.height),
      weight: Number(user2.weight),
    };
    setUser2(parsedUser2);

    if (validateUser(parsedUser2, 2)) {
      try {
        setErrors({});
        // Save both users securely to AsyncStorage (encrypted automatically)
        await AsyncStorageService.saveUsers(user1, parsedUser2);
        // Refresh context to load profiles
        await refreshState();
        // Redirect to tabs dashboard
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Save onboarding profiles failed:", error);
        setErrors({ submit: "Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại." });
      }
    }
  };

  const updateField = (step: number, field: keyof DateUser, value: any) => {
    if (step === 1) {
      setUser1(prev => ({ ...prev, [field]: value }));
    } else {
      setUser2(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for field if being edited
    if (errors[field as string]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  return {
    activeStep,
    user1,
    user2,
    errors,
    interestStr1,
    setInterestStr1,
    dislikeStr1,
    setDislikeStr1,
    hateStr1,
    setHateStr1,
    interestStr2,
    setInterestStr2,
    dislikeStr2,
    setDislikeStr2,
    hateStr2,
    setHateStr2,
    updateField,
    handleNext,
    handleBack,
    handleSubmit,
    // Google Integration
    clientId,
    googleToken,
    googleUser,
    backups,
    loading,
    showGoogleModal,
    setShowGoogleModal,
    handleGoogleLogin,
    handleGoogleLogout,
    handleRestoreBackup,
  };
};
