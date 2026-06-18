import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEditProfile } from "./useEditProfile";
import { COLORS, SIZES, SHADOWS } from "../../utils/theme";
import DateTimePicker from "@react-native-community/datetimepicker";

export const EditProfileView: React.FC = () => {
  const {
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
  } = useEditProfile();

  const [showBirthPicker, setShowBirthPicker] = React.useState(false);
  const [tempBirthDate, setTempBirthDate] = React.useState<Date>(new Date(2002, 0, 1));

  const openBirthPicker = () => {
    let currentBirth = new Date(2002, 0, 1);
    if (birthday) {
      const parsed = new Date(birthday);
      if (!isNaN(parsed.getTime())) {
        currentBirth = parsed;
      }
    }
    setTempBirthDate(currentBirth);
    setShowBirthPicker(true);
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Accent color is determined by gender
  const isBoy = user.gender === "Nam";
  const themeColor = isBoy ? COLORS.primary : COLORS.accent;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Chỉnh sửa thông tin {isBoy ? "bạn Nam 🧑" : "bạn Nữ 👧"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ & Tên</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Nhập họ và tên"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh *</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  errors.birthday ? styles.inputError : null,
                  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }
                ]}
                onPress={openBirthPicker}
              >
                <Text style={{ fontSize: 15, color: birthday ? COLORS.text : COLORS.textMuted }}>
                  {birthday ? birthday : "Chọn ngày sinh từ lịch"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {errors.birthday ? <Text style={styles.errorText}>{errors.birthday}</Text> : null}
            </View>

            {showBirthPicker && Platform.OS === "android" && (
              <DateTimePicker
                value={tempBirthDate}
                mode="date"
                maximumDate={new Date()}
                accentColor={COLORS.primary}
                onValueChange={(event, selectedDate) => {
                  setShowBirthPicker(false);
                  if (selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                    const day = String(selectedDate.getDate()).padStart(2, "0");
                    const formatted = `${year}-${month}-${day}`;
                    setBirthday(formatted);
                  }
                }}
              />
            )}

            {showBirthPicker && Platform.OS === "ios" && (
              <Modal
                visible={showBirthPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowBirthPicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowBirthPicker(false)}
                >
                  <View style={styles.iosPickerContainer}>
                    <View style={styles.iosPickerHeader}>
                      <TouchableOpacity onPress={() => setShowBirthPicker(false)}>
                        <Text style={styles.iosPickerCancelText}>Hủy bỏ</Text>
                      </TouchableOpacity>
                      <Text style={styles.iosPickerTitle}>Chọn ngày sinh</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowBirthPicker(false);
                          const year = tempBirthDate.getFullYear();
                          const month = String(tempBirthDate.getMonth() + 1).padStart(2, "0");
                          const day = String(tempBirthDate.getDate()).padStart(2, "0");
                          const formatted = `${year}-${month}-${day}`;
                          setBirthday(formatted);
                        }}
                      >
                        <Text style={styles.iosPickerConfirmText}>Xác nhận</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempBirthDate}
                      mode="date"
                      display="spinner"
                      maximumDate={new Date()}
                      accentColor={COLORS.primary}
                      onValueChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setTempBirthDate(selectedDate);
                        }
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Chiều cao (cm) *</Text>
                <TextInput
                  style={[styles.input, errors.height ? styles.inputError : null]}
                  placeholder="Chiều cao"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
                {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Cân nặng (kg) *</Text>
                <TextInput
                  style={[styles.input, errors.weight ? styles.inputError : null]}
                  placeholder="Cân nặng"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
                {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Size giày</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 41, 37"
                  placeholderTextColor={COLORS.textMuted}
                  value={shoeSize}
                  onChangeText={setShoeSize}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Size áo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: M, L, XL"
                  placeholderTextColor={COLORS.textMuted}
                  value={shirtSize}
                  onChangeText={setShirtSize}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facebook Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Link trang cá nhân Facebook"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={facebook}
                onChangeText={setFacebook}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiktok Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Link trang cá nhân Tiktok"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={tiktok}
                onChangeText={setTiktok}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sở thích (Cách nhau bằng dấu phẩy)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Đọc sách, Du lịch, Nấu ăn"
                placeholderTextColor={COLORS.textMuted}
                value={interestStr}
                onChangeText={setInterestStr}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Điều không thích (Cách nhau bằng dấu phẩy)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Thức khuya, Ăn hành"
                placeholderTextColor={COLORS.textMuted}
                value={dislikeStr}
                onChangeText={setDislikeStr}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Điều ghét (Cách nhau bằng dấu phẩy)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Giả dối, Trễ hẹn"
                placeholderTextColor={COLORS.textMuted}
                value={hateStr}
                onChangeText={setHateStr}
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: themeColor }]} 
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.paddingMd,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  scrollContent: {
    padding: SIZES.paddingMd,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  inputGroup: {
    marginBottom: SIZES.paddingMd,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.paddingMd,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.paddingLg,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    marginLeft: 8,
    ...SHADOWS.light,
  },
  saveBtnText: {
    color: COLORS.surface,
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  iosPickerContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    paddingBottom: 40,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iosPickerCancelText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  iosPickerConfirmText: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
