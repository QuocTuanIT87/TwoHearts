import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import { useSettings } from "./useSettings";

export const SettingsView: React.FC = () => {
  const {
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
  } = useSettings();

  const renderTypeItem = ({ item }: { item: (typeof types)[0] }) => (
    <View style={styles.typeRow}>
      <Text style={styles.typeName}>{item.name}</Text>
      <View style={styles.typeActions}>
        <TouchableOpacity
          onPress={() => handleOpenEditType(item)}
          style={styles.actionIconButton}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteType(item.id)}
          style={styles.actionIconButton}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.lightGray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Types Management Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động 🏷️</Text>
            <TouchableOpacity
              style={styles.addTypeBtn}
              onPress={handleOpenAddType}
            >
              <Ionicons name="add" size={18} color={COLORS.surface} />
              <Text style={styles.addTypeBtnText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={types}
            renderItem={renderTypeItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Chưa có loại hình nào. Vui lòng bấm nút thêm mới.
              </Text>
            }
          />
        </View>

        {/* Statistics Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Báo cáo & Thống kê 📊</Text>
          <Text style={styles.syncCardDescription}>
            Xem chi tiết thống kê tần suất hẹn hò và biểu đồ hoạt động của hai
            bạn.
          </Text>
          <TouchableOpacity
            style={styles.statsNavBtn}
            onPress={() => router.push("/(tabs)/stats")}
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={COLORS.surface}
              style={styles.statsNavIcon}
            />
            <Text style={styles.statsNavText}>Xem thống kê kỷ niệm</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.surface}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>

        {/* Sync Settings Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sao lưu & Khôi phục ☁️</Text>

          <View style={styles.googleAuthContainer}>
            {googleToken ? (
              // Logged In status card
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
                    <Ionicons name="person" size={20} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.googleUserInfo}>
                  <Text style={styles.googleUserName}>
                    {googleUser?.name || "Người dùng Google"}
                  </Text>
                  <Text style={styles.googleUserEmail} numberOfLines={1}>
                    {googleUser?.email || "Chưa kết nối email"}
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
              // Logged Out login card
              <View style={styles.googleLoginCard}>
                <Text style={styles.googleCardTitle}>Kết nối Google Drive</Text>

                <View style={styles.authButtonsRow}>
                  <TouchableOpacity
                    style={styles.loginGoogleBtn}
                    onPress={handleGoogleLogin}
                  >
                    <Ionicons
                      name="logo-google"
                      size={16}
                      color={COLORS.surface}
                    />
                    <Text style={styles.loginGoogleBtnText}>
                      Đăng nhập Google
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Action Sync Buttons */}
          <TouchableOpacity style={styles.syncBtn} onPress={handleBackupNow}>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={COLORS.surface}
              style={styles.syncBtnIcon}
            />
            <Text style={styles.syncBtnText}>Sao lưu dữ liệu lên Drive</Text>
          </TouchableOpacity>

          <View style={styles.restoreRow}>
            <TouchableOpacity
              style={[styles.syncBtn, styles.restoreListBtn]}
              onPress={handleOpenRestoreList}
            >
              <Ionicons
                name="list-outline"
                size={20}
                color={COLORS.primary}
                style={styles.syncBtnIcon}
              />
              <Text style={[styles.syncBtnText, { color: COLORS.primary }]}>
                Danh sách sao lưu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncBtn, styles.restorePickBtn]}
              onPress={handlePickAndRestore}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={COLORS.primary}
                style={styles.syncBtnIcon}
              />
              <Text style={[styles.syncBtnText, { color: COLORS.primary }]}>
                Chọn file .txt
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone Reset Section */}
        <View style={[styles.sectionCard, styles.dangerCard]}>
          <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
            Khu vực nguy hiểm ⚠️
          </Text>
          <Text style={styles.dangerDesc}>
            Các thao tác tại khu vực này sẽ tác động trực tiếp đến tính toàn vẹn
            của ứng dụng. Hãy cẩn thận khi sử dụng.
          </Text>
          <TouchableOpacity style={styles.wipeBtn} onPress={handleWipeData}>
            <Ionicons
              name="trash"
              size={20}
              color={COLORS.surface}
              style={styles.syncBtnIcon}
            />
            <Text style={styles.wipeBtnText}>
              Xóa sạch toàn bộ dữ liệu ứng dụng
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add/Edit Category Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalCentered}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingType ? "Chỉnh sửa hoạt động ✏️" : "Thêm hoạt động mới 🏷️"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập tên hoạt động"
              placeholderTextColor={COLORS.textMuted}
              value={typeName}
              onChangeText={setTypeName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowTypeModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveType}
              >
                <Text style={styles.modalSaveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Select Backup File List Modal */}
      <Modal
        visible={showBackupListModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBackupListModal(false)}
      >
        <View style={styles.modalCentered}>
          <View style={[styles.modalCard, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Bản sao lưu có sẵn 📂</Text>

            <FlatList
              data={backups}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              style={styles.backupList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.backupRow}
                  onPress={() => handleRestoreFromList(item)}
                >
                  <Ionicons
                    name="document-attach-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                  <View style={styles.backupDetails}>
                    <Text style={styles.backupName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.backupDate}>
                      {new Date(item.createdTime).toLocaleString("vi-VN")}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={[
                    styles.emptyText,
                    { textAlign: "center", marginVertical: 32 },
                  ]}
                >
                  Chưa có file sao lưu nào được tạo.
                </Text>
              }
            />

            <TouchableOpacity
              style={styles.modalCloseListBtn}
              onPress={() => setShowBackupListModal(false)}
            >
              <Text style={styles.modalCloseListBtnText}>Đóng</Text>
            </TouchableOpacity>
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: SIZES.paddingMd,
    paddingBottom: SIZES.paddingLg * 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    marginBottom: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  syncCardDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  dangerCard: {
    borderColor: "#fee2e2",
    backgroundColor: "#fffdfd",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.paddingMd,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...SHADOWS.light,
  },
  addTypeBtnText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  typeName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  typeActions: {
    flexDirection: "row",
  },
  actionIconButton: {
    padding: 6,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginVertical: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: SIZES.paddingSm,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  switchDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    borderRadius: SIZES.radiusMd,
    marginVertical: SIZES.paddingSm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  syncBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SIZES.paddingSm,
    ...SHADOWS.light,
  },
  syncBtnIcon: {
    marginRight: 8,
  },
  syncBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  restoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  restoreListBtn: {
    flex: 1.1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 4,
  },
  restorePickBtn: {
    flex: 0.9,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginLeft: 4,
  },
  dangerDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SIZES.paddingMd,
  },
  wipeBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.danger,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },
  wipeBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  modalCentered: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.paddingLg,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.paddingLg,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.paddingMd,
    paddingVertical: 16,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SIZES.paddingLg,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    marginRight: SIZES.paddingSm,
  },
  modalCancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    marginLeft: SIZES.paddingSm,
  },
  modalSaveBtnText: {
    color: COLORS.surface,
    fontWeight: "bold",
  },
  backupList: {
    marginVertical: SIZES.paddingSm,
  },
  backupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  backupDetails: {
    marginLeft: 12,
    flex: 1,
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
  modalCloseListBtn: {
    marginTop: SIZES.paddingMd,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
  },
  modalCloseListBtnText: {
    color: COLORS.text,
    fontWeight: "bold",
  },
  googleAuthContainer: {
    marginVertical: SIZES.paddingSm,
    padding: SIZES.paddingMd,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleUserCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: "100%",
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
    paddingVertical: 6,
    fontSize: 12,
    color: COLORS.text,
  },
  saveClientIdBtn: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: SIZES.radiusSm,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clientIdHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    marginBottom: 10,
  },
  authButtonsRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  loginGoogleBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    alignItems: "center",
    justifyContent: "center",
  },
  loginGoogleBtnText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
  },
  statsNavBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: SIZES.paddingSm,
    ...SHADOWS.light,
  },
  statsNavIcon: {
    marginRight: 10,
  },
  statsNavText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
});
