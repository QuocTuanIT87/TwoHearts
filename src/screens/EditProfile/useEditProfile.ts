import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AsyncStorageService, DateUser } from "../../services/AsyncStorageService";
import { useApp } from "../../context/AppContext";

export const useEditProfile = () => {
  const { refreshState } = useApp();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const [user, setUser] = useState<DateUser | null>(null);
  const [allUsers, setAllUsers] = useState<DateUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [shoeSize, setShoeSize] = useState("");
  const [shirtSize, setShirtSize] = useState("");
  const [interestStr, setInterestStr] = useState("");
  const [dislikeStr, setDislikeStr] = useState("");
  const [hateStr, setHateStr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const users = await AsyncStorageService.getUsers();
        setAllUsers(users);
        const targetUser = users.find(u => u.id === userId);
        if (targetUser) {
          setUser(targetUser);
          setName(targetUser.name);
          setPhone(targetUser.phone);
          setBirthday(targetUser.birthday);
          setHeight(String(targetUser.height));
          setWeight(String(targetUser.weight));
          setFacebook(targetUser.facebook || "");
          setTiktok(targetUser.tiktok || "");
          setShoeSize(targetUser.shoeSize || "");
          setShirtSize(targetUser.shirtSize || "");
          setInterestStr(targetUser.interest ? targetUser.interest.join(", ") : "");
          setDislikeStr(targetUser.dislike ? targetUser.dislike.join(", ") : "");
          setHateStr(targetUser.hate ? targetUser.hate.join(", ") : "");
        } else {
          Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
          router.back();
        }
      } catch (error) {
        console.error("Load edit user failed:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc";
    }
    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (!birthday.trim()) {
      newErrors.birthday = "Ngày sinh là bắt buộc";
    } else {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(birthday.trim())) {
        newErrors.birthday = "Định dạng ngày sinh phải là YYYY-MM-DD";
      }
    }
    
    const heightNum = Number(height);
    if (!height || isNaN(heightNum) || heightNum <= 0) {
      newErrors.height = "Chiều cao phải là số dương";
    }

    const weightNum = Number(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = "Cân nặng phải là số dương";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const updatedUser: DateUser = {
        ...user,
        name: name.trim(),
        phone: phone.trim(),
        birthday: birthday.trim(),
        height: heightNum,
        weight: weightNum,
        facebook: facebook.trim(),
        tiktok: tiktok.trim(),
        shoeSize: shoeSize.trim(),
        shirtSize: shirtSize.trim(),
        interest: interestStr.split(",").map(i => i.trim()).filter(Boolean),
        dislike: dislikeStr.split(",").map(i => i.trim()).filter(Boolean),
        hate: hateStr.split(",").map(i => i.trim()).filter(Boolean),
      };

      const user1 = user.id === "user_1" ? updatedUser : allUsers.find(u => u.id === "user_1")!;
      const user2 = user.id === "user_2" ? updatedUser : allUsers.find(u => u.id === "user_2")!;

      await AsyncStorageService.saveUsers(user1, user2);
      await refreshState();
      Alert.alert(
        "Thành công",
        "Đã cập nhật thông tin thành công!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Save profile failed:", error);
      Alert.alert("Lỗi", "Không thể lưu chỉnh sửa thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return {
    user,
    loading,
    name,
    setName,
    phone,
    setPhone,
    birthday,
    setBirthday,
    height,
    setHeight,
    weight,
    setWeight,
    facebook,
    setFacebook,
    tiktok,
    setTiktok,
    shoeSize,
    setShoeSize,
    shirtSize,
    setShirtSize,
    interestStr,
    setInterestStr,
    dislikeStr,
    setDislikeStr,
    hateStr,
    setHateStr,
    errors,
    handleSave,
    handleCancel,
  };
};
