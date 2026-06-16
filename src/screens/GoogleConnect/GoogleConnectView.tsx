import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGoogleConnect } from "./useGoogleConnect";
import { COLORS, SIZES, SHADOWS } from "../../utils/theme";

export const GoogleConnectView: React.FC = () => {
  const {
    googleToken,
    googleUser,
    backups,
    loading,
    handleGoogleLogin,
    handleGoogleLogout,
    handleRestoreBackup,
    handleProceedToOnboarding,
  } = useGoogleConnect();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Illustration */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-done-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Đồng bộ Google Drive ☁️</Text>
          <Text style={styles.subtitle}>
            Tự động sao lưu và bảo mật các kỷ niệm cũng như cột mốc tình yêu của hai bạn.
          </Text>
        </View>

        {/* Card containing Google Sign In/User detail */}
        <View style={styles.card}>
          {googleToken ? (
            // Connected Account View
            <View style={styles.googleUserCard}>
              {googleUser?.avatar ? (
                <Image source={{ uri: googleUser.avatar }} style={styles.googleAvatar} />
              ) : (
                <View style={[styles.googleAvatar, styles.googleAvatarPlaceholder]}>
                  <Ionicons name="person" size={24} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.googleUserInfo}>
                <Text style={styles.googleUserName}>
                  {googleUser?.name || "Người dùng Google"}
                </Text>
                <Text style={styles.googleUserEmail} numberOfLines={1}>
                  {googleUser?.email || "Đã kết nối"}
                </Text>
              </View>
              <TouchableOpacity style={styles.logoutMiniBtn} onPress={handleGoogleLogout}>
                <Text style={styles.logoutMiniBtnText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Sign-in Promotion View
            <View style={styles.googleLoginCard}>
              <Text style={styles.googleCardTitle}>
                Kết nối tài khoản của bạn
              </Text>
              <Text style={styles.googleCardDesc}>
                Đăng nhập bằng tài khoản Google (Gmail) để lưu trữ dữ liệu an toàn trên Drive cá nhân. Bạn sẽ không bao giờ lo bị mất nhật ký hẹn hò khi đổi thiết bị.
              </Text>

              <TouchableOpacity style={styles.loginGoogleBtn} onPress={handleGoogleLogin}>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={COLORS.surface}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.loginGoogleBtnText}>
                  Đăng nhập Google (Gmail)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cloud Backups list if logged in */}
        {googleToken && (
          <View style={styles.backupSection}>
            <Text style={styles.backupSectionTitle}>
              Bản sao lưu khả dụng trên Drive
            </Text>
            {backups.length === 0 ? (
              <View style={styles.emptyBackupCard}>
                <Ionicons name="document-text-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyBackupText}>
                  Không tìm thấy bản sao lưu nào. Bạn có thể tiến hành thiết lập mới dưới đây.
                </Text>
              </View>
            ) : (
              backups.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.backupItem}
                  onPress={() => handleRestoreBackup(item)}
                >
                  <View style={styles.backupItemLeft}>
                    <Ionicons
                      name="cloud-download-outline"
                      size={24}
                      color={COLORS.primary}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.backupName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.backupDate}>
                        {new Date(item.createdTime).toLocaleString("vi-VN")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.restoreBtn}>
                    <Text style={styles.restoreBtnText}>Khôi phục</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Footer Navigation Action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={handleProceedToOnboarding}
          >
            <Text style={styles.proceedBtnText}>
              {googleToken ? "Tiếp tục thiết lập mới ➡️" : "Bỏ qua & Thiết lập sau"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            * Bạn có thể kết nối tài khoản Google bất kỳ lúc nào tại màn hình Cài đặt.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: SIZES.paddingMd,
    paddingBottom: SIZES.paddingLg * 2,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginVertical: SIZES.paddingLg,
    paddingHorizontal: SIZES.paddingSm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.paddingMd,
    ...SHADOWS.light,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SIZES.paddingSm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
    marginBottom: SIZES.paddingLg,
  },
  googleUserCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  googleAvatarPlaceholder: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  googleUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  googleUserName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
  },
  googleUserEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutMiniBtn: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutMiniBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "bold",
  },
  googleLoginCard: {
    alignItems: "center",
    paddingVertical: SIZES.paddingSm,
  },
  googleCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  googleCardDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: SIZES.paddingLg,
  },
  loginGoogleBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SIZES.paddingLg,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    ...SHADOWS.light,
  },
  loginGoogleBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "bold",
  },
  backupSection: {
    marginBottom: SIZES.paddingLg,
  },
  backupSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.paddingMd,
    paddingHorizontal: 4,
  },
  emptyBackupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.paddingLg,
    alignItems: "center",
  },
  emptyBackupText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  backupItem: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.paddingMd,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SIZES.paddingSm,
    ...SHADOWS.light,
  },
  backupItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backupName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  backupDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  restoreBtn: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restoreBtnText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    marginTop: SIZES.paddingSm,
  },
  proceedBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: SIZES.paddingMd,
  },
  proceedBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
  footerNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
