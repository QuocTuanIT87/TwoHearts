import { useState } from "react";
import { CustomAlert } from "../../components/CustomAlert";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { AsyncStorageService, DateUser } from "../../services/AsyncStorageService";

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

  const [loading, setLoading] = useState(false);

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
        setLoading(true);
        // Save both users securely to Firebase RTDB (through the new service implementation)
        await AsyncStorageService.saveUsers(user1, parsedUser2);
        // Refresh context to load profiles
        await refreshState();
        // Redirect to tabs dashboard
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Save onboarding profiles failed:", error);
        setErrors({ submit: "Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại." });
      } finally {
        setLoading(false);
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
    loading,
  };
};
