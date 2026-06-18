import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import { useOnboarding } from "./useOnboarding";
import DateTimePicker from "@react-native-community/datetimepicker";

export const OnboardingView: React.FC = () => {
  const {
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
  } = useOnboarding();

  const [showBirthPicker, setShowBirthPicker] = React.useState(false);
  const [tempBirthDate, setTempBirthDate] = React.useState<Date>(new Date(2002, 0, 1));

  const openBirthPicker = () => {
    const currentBirthStr = activeStep === 1 ? user1.birthday : user2.birthday;
    let currentBirth = new Date(2002, 0, 1);
    if (currentBirthStr) {
      const parsed = new Date(currentBirthStr);
      if (!isNaN(parsed.getTime())) {
        currentBirth = parsed;
      }
    }
    setTempBirthDate(currentBirth);
    setShowBirthPicker(true);
  };

  const user = activeStep === 1 ? user1 : user2;
  const interestStr = activeStep === 1 ? interestStr1 : interestStr2;
  const setInterestStr = activeStep === 1 ? setInterestStr1 : setInterestStr2;
  const dislikeStr = activeStep === 1 ? dislikeStr1 : dislikeStr2;
  const setDislikeStr = activeStep === 1 ? setDislikeStr1 : setDislikeStr2;
  const hateStr = activeStep === 1 ? hateStr1 : hateStr2;
  const setHateStr = activeStep === 1 ? setHateStr1 : setHateStr2;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Two Hearts ❤️</Text>
            <Text style={styles.subtitle}>Ghi lại hành trình yêu thương</Text>
          </View>

          {/* Google Restore Banner */}
          <View style={styles.googleRestoreBanner}>
            <TouchableOpacity
              style={styles.googleRestoreBtn}
              onPress={() => setShowGoogleModal(true)}
            >
              <Ionicons
                name="cloud-download-outline"
                size={18}
                color={COLORS.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.googleRestoreBtnText}>
                Đăng nhập Google / Khôi phục dữ liệu ☁️
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stepper Progress */}
          <View style={styles.stepperContainer}>
            <View
              style={[
                styles.stepDot,
                activeStep === 1
                  ? styles.stepDotActive
                  : styles.stepDotCompleted,
              ]}
            />
            <View style={styles.stepConnector} />
            <View
              style={[
                styles.stepDot,
                activeStep === 2
                  ? styles.stepDotActive
                  : styles.stepDotInactive,
              ]}
            />
          </View>
          <Text style={styles.stepTitle}>
            {activeStep === 1
              ? "Bước 1: Thông tin bạn Nam 🧑"
              : "Bước 2: Thông tin bạn Nữ 👧"}
          </Text>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Name input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ & Tên</Text>
              <TextInput
                style={styles.input}
                placeholder={
                  activeStep === 1
                    ? "Tên bạn nam (VD: Nguyễn Văn A)"
                    : "Tên bạn nữ (VD: Trần Thị B)"
                }
                placeholderTextColor={COLORS.textMuted}
                value={user.name}
                onChangeText={(val) => updateField(activeStep, "name", val)}
              />
            </View>

            {/* Phone input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={user.phone}
                onChangeText={(val) => updateField(activeStep, "phone", val)}
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            {/* Birthday input */}
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
                <Text style={{ fontSize: 15, color: user.birthday ? COLORS.text : COLORS.textMuted }}>
                  {user.birthday ? user.birthday : "Chọn ngày sinh từ lịch"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {errors.birthday ? (
                <Text style={styles.errorText}>{errors.birthday}</Text>
              ) : null}
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
                    updateField(activeStep, "birthday", formatted);
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
                          updateField(activeStep, "birthday", formatted);
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

            {/* Height & Weight row */}
            <View style={styles.row}>
              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginRight: SIZES.paddingSm },
                ]}
              >
                <Text style={styles.label}>Chiều cao (cm) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.height ? styles.inputError : null,
                  ]}
                  placeholder="Chiều cao"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={user.height ? String(user.height) : ""}
                  onChangeText={(val) => updateField(activeStep, "height", val)}
                />
                {errors.height ? (
                  <Text style={styles.errorText}>{errors.height}</Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginLeft: SIZES.paddingSm },
                ]}
              >
                <Text style={styles.label}>Cân nặng (kg) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.weight ? styles.inputError : null,
                  ]}
                  placeholder="Cân nặng"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={user.weight ? String(user.weight) : ""}
                  onChangeText={(val) => updateField(activeStep, "weight", val)}
                />
                {errors.weight ? (
                  <Text style={styles.errorText}>{errors.weight}</Text>
                ) : null}
              </View>
            </View>

            {/* Shoe Size & Shirt Size row */}
            <View style={styles.row}>
              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginRight: SIZES.paddingSm },
                ]}
              >
                <Text style={styles.label}>Size giày</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 41, 37"
                  placeholderTextColor={COLORS.textMuted}
                  value={user.shoeSize || ""}
                  onChangeText={(val) =>
                    updateField(activeStep, "shoeSize", val)
                  }
                />
              </View>
              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginLeft: SIZES.paddingSm },
                ]}
              >
                <Text style={styles.label}>Size áo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: M, L, XL"
                  placeholderTextColor={COLORS.textMuted}
                  value={user.shirtSize || ""}
                  onChangeText={(val) =>
                    updateField(activeStep, "shirtSize", val)
                  }
                />
              </View>
            </View>

            {/* Social credentials */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facebook Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Link trang cá nhân Facebook"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={user.facebook}
                onChangeText={(val) => updateField(activeStep, "facebook", val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiktok Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Link trang cá nhân Tiktok"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={user.tiktok}
                onChangeText={(val) => updateField(activeStep, "tiktok", val)}
              />
            </View>

            {/* Arrays: Interest, Dislike, Hate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Sở thích (Cách nhau bằng dấu phẩy)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Đọc sách, Du lịch, Nấu ăn"
                placeholderTextColor={COLORS.textMuted}
                value={interestStr}
                onChangeText={setInterestStr}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Điều không thích (Cách nhau bằng dấu phẩy)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Thức khuya, Ăn hành"
                placeholderTextColor={COLORS.textMuted}
                value={dislikeStr}
                onChangeText={setDislikeStr}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Điều ghét (Cách nhau bằng dấu phẩy)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Giả dối, Trễ hẹn"
                placeholderTextColor={COLORS.textMuted}
                value={hateStr}
                onChangeText={setHateStr}
              />
            </View>

            {errors.submit ? (
              <Text
                style={[
                  styles.errorText,
                  { marginBottom: 12, textAlign: "center" },
                ]}
              >
                {errors.submit}
              </Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {activeStep === 2 ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                activeStep === 1 ? { flex: 1 } : null,
              ]}
              onPress={activeStep === 1 ? handleNext : handleSubmit}
            >
              <Text style={styles.primaryButtonText}>
                {activeStep === 1 ? "Tiếp tục" : "Hoàn thành"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Login & Restore Modal */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          {loading && (
            <View style={styles.modalLoadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đồng bộ Google Drive ☁️</Text>
              <TouchableOpacity
                onPress={() => setShowGoogleModal(false)}
                style={styles.modalCloseIcon}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {googleToken ? (
                // Google Account Info
                <View style={styles.googleUserCard}>
                  {googleUser?.avatar ? (
                    <Image
                      source={{ uri: googleUser.avatar }}
                      style={styles.googleAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.googleAvatar,
                        styles.googleAvatarPlaceholder,
                      ]}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                  )}
                  <View style={styles.googleUserInfo}>
                    <Text style={styles.googleUserName}>
                      {googleUser?.name || "Người dùng Google"}
                    </Text>
                    <Text style={styles.googleUserEmail} numberOfLines={1}>
                      {googleUser?.email || "Đã kết nối Google"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.logoutMiniBtn}
                    onPress={handleGoogleLogout}
                  >
                    <Text style={styles.logoutMiniBtnText}>Đăng xuất</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Setup & Login Card
                <View style={styles.googleLoginCard}>
                  <Text style={styles.googleCardTitle}>
                    Kết nối Google Drive để khôi phục
                  </Text>

                  <TouchableOpacity
                    style={styles.loginGoogleBtn}
                    onPress={handleGoogleLogin}
                  >
                    <Ionicons
                      name="logo-google"
                      size={18}
                      color={COLORS.surface}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.loginGoogleBtnText}>
                      Đăng nhập Google (Gmail)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Backups List */}
              {googleToken && (
                <View style={styles.backupSection}>
                  <Text style={styles.backupSectionTitle}>
                    Danh sách bản sao lưu trên Drive
                  </Text>
                  {backups.length === 0 ? (
                    <Text style={styles.emptyBackupText}>
                      Không tìm thấy bản sao lưu nào trên tài khoản Google Drive
                      của bạn.
                    </Text>
                  ) : (
                    backups.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.backupItem}
                        onPress={() => handleRestoreBackup(item)}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={24}
                          color={COLORS.primary}
                          style={{ marginRight: 12 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.backupName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.backupDate}>
                            Ngày tạo:{" "}
                            {new Date(item.createdTime).toLocaleString("vi-VN")}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.paddingMd,
    paddingBottom: SIZES.paddingLg * 2,
  },
  header: {
    alignItems: "center",
    marginVertical: SIZES.paddingMd,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SIZES.paddingSm,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stepDotInactive: {
    backgroundColor: COLORS.border,
  },
  stepConnector: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.paddingMd,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    ...SHADOWS.medium,
    marginBottom: SIZES.paddingMd,
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
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  genderButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  genderButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.paddingSm,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.paddingMd,
  },
  backButtonText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "500",
  },
  googleRestoreBanner: {
    marginHorizontal: SIZES.paddingSm,
    marginBottom: SIZES.paddingMd,
    alignItems: "center",
  },
  googleRestoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...SHADOWS.light,
  },
  googleRestoreBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg * 1.5,
    borderTopRightRadius: SIZES.radiusLg * 1.5,
    height: "75%",
    padding: SIZES.paddingMd,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: SIZES.paddingSm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalScrollBody: {
    paddingVertical: SIZES.paddingMd,
  },
  googleUserCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SIZES.paddingMd,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.paddingMd,
  },
  googleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#cbd5e1",
  },
  googleAvatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
  },
  googleUserInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  googleUserName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  googleUserEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutMiniBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutMiniBtnText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: "bold",
  },
  googleLoginCard: {
    backgroundColor: COLORS.background,
    padding: SIZES.paddingMd,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.paddingMd,
  },
  googleCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  clientIdInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  clientIdInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
  },
  saveClientIdBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: SIZES.radiusSm,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clientIdHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: 12,
  },
  loginGoogleBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },
  loginGoogleBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  backupSection: {
    marginTop: SIZES.paddingSm,
  },
  backupSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  emptyBackupText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 18,
  },
  backupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginBottom: SIZES.paddingSm,
    ...SHADOWS.light,
  },
  backupName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  backupDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
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
