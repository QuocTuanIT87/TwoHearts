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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEditProfile } from "./useEditProfile";
import { COLORS, SIZES, SHADOWS } from "../../utils/theme";

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
              <Text style={styles.label}>Ngày sinh (YYYY-MM-DD) *</Text>
              <TextInput
                style={[styles.input, errors.birthday ? styles.inputError : null]}
                placeholder="Ví dụ: 1999-12-31"
                placeholderTextColor={COLORS.textMuted}
                value={birthday}
                onChangeText={setBirthday}
              />
              {errors.birthday ? <Text style={styles.errorText}>{errors.birthday}</Text> : null}
            </View>

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
});
