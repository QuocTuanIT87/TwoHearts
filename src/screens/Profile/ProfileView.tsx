import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateOnly, formatDateTime } from "../../utils/dateUtils";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import { useProfile } from "./useProfile";

export const ProfileView: React.FC = () => {
  const {
    users,
    milestones,
    duration,
    loading,
    updatingAvatar,
    handleUpdateAvatar,
  } = useProfile();

  const calculateAge = (birthdayStr: string): number => {
    if (!birthdayStr) return 0;
    try {
      const birthDate = new Date(birthdayStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return 0;
    }
  };

  const renderChipList = (
    items: string[],
    type: "interest" | "dislike" | "hate",
  ) => {
    if (!items || items.length === 0) {
      return <Text style={styles.noChipsText}>Trống</Text>;
    }

    let chipBg = COLORS.primaryLight;
    let chipText = COLORS.primary;

    if (type === "dislike") {
      chipBg = "#fef3c7"; // yellow
      chipText = "#d97706";
    } else if (type === "hate") {
      chipBg = "#fee2e2"; // red
      chipText = "#dc2626";
    }

    return (
      <View style={styles.chipsRow}>
        {items.map((item, idx) => (
          <View
            key={idx}
            style={[styles.miniChip, { backgroundColor: chipBg }]}
          >
            <Text style={[styles.miniChipText, { color: chipText }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Get user details
  const boy = users.find((u) => u.gender === "Nam");
  const girl = users.find((u) => u.gender === "Nữ");

  return (
    <SafeAreaView style={styles.container}>
      {updatingAvatar && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang cập nhật ảnh đại diện...</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Anniversary Countdown Card */}
        <View style={styles.anniversaryCard}>
          <Text style={styles.anniversaryLabel}>Thời gian bên nhau 💕</Text>
          <View style={styles.heartContainer}>
            <Image
              source={require("../../../assets/images/passion.gif")}
              style={{ width: 180, height: 180, resizeMode: "contain" }}
            />
          </View>
          <Text style={styles.daysCounter}>{duration.days} ngày</Text>

          <View style={styles.timerSubTextContainer}>
            <Text style={styles.timerSubText}>
              {String(duration.hours).padStart(2, "0")} giờ :{" "}
              {String(duration.minutes).padStart(2, "0")} phút :{" "}
              {String(duration.seconds).padStart(2, "0")} giây
            </Text>
          </View>
        </View>

        {/* Linked Avatars Section */}
        <View style={styles.avatarsSection}>
          <View style={styles.avatarsWrapper}>
            {/* Wave connection line behind */}
            <View style={styles.waveConnectorContainer}>
              <Image
                source={require("../../../assets/images/connect.png")}
                style={styles.connectImage}
              />
            </View>

            {/* Left Avatar: Boy */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpdateAvatar("Nam")}
              style={[styles.avatarCircle, { borderColor: COLORS.accent }]}
            >
              {boy && boy.avatar ? (
                <Image
                  source={{ uri: boy.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: COLORS.primaryLight },
                  ]}
                >
                  <Ionicons name="male" size={48} color={COLORS.accent} />
                </View>
              )}
            </TouchableOpacity>

            {/* Right Avatar: Girl */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpdateAvatar("Nữ")}
              style={[styles.avatarCircle, { borderColor: COLORS.primary }]}
            >
              {girl && girl.avatar ? (
                <Image
                  source={{ uri: girl.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: "#fce7f3" },
                  ]}
                >
                  <Ionicons name="female" size={48} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Milestones timeline */}
        {milestones && (
          <View style={styles.milestoneSection}>
            <Text style={styles.sectionTitle}>Cột mốc thời gian ⏳</Text>

            <View style={styles.timeline}>
              <View style={styles.timelineLine} />

              {/* Acquainted milestone */}
              <View style={styles.timelineNode}>
                <View style={styles.nodeIconWrapper}>
                  <Ionicons name="hand-left" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.nodeContent}>
                  <Text style={styles.nodeTitle}>Ngày đầu quen biết 🤝</Text>
                  <Text style={styles.nodeDate}>
                    {formatDateTime(milestones.acquaintedDay)}
                  </Text>
                </View>
              </View>

              {/* Confession milestone */}
              <View style={styles.timelineNode}>
                <View
                  style={[
                    styles.nodeIconWrapper,
                    { backgroundColor: COLORS.accent },
                  ]}
                >
                  <Ionicons name="rose" size={16} color={COLORS.surface} />
                </View>
                <View style={styles.nodeContent}>
                  <Text style={styles.nodeTitle}>Chính thức hẹn hò 💑</Text>
                  <Text style={styles.nodeDate}>
                    {formatDateTime(milestones.confessionDay)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* User sheets */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Chi tiết 🧑‍🤝‍🧑</Text>

          {/* Render Boy */}
          {boy && (
            <View style={styles.profileSheet}>
              <View
                style={[
                  styles.profileHeader,
                  {
                    borderLeftColor: COLORS.accent,
                    justifyContent: "space-between",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="male" size={20} color={COLORS.accent} />
                  <Text style={styles.profileName}>{boy.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/edit-profile",
                      params: { userId: boy.id },
                    })
                  }
                  style={styles.editProfileBtn}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.profileBody}>
                <View style={styles.profileRow}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Ngày sinh 🎂</Text>
                    <Text style={styles.profileVal}>
                      {formatDateOnly(boy.birthday)} (
                      {calculateAge(boy.birthday)} tuổi)
                    </Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>
                      Chiều cao / Cân nặng 📏
                    </Text>
                    <Text style={styles.profileVal}>
                      {boy.height}cm / {boy.weight}kg
                    </Text>
                  </View>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Size giày 👟</Text>
                    <Text style={styles.profileVal}>
                      {boy.shoeSize || "Chưa cập nhật"}
                    </Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Size áo 👕</Text>
                    <Text style={styles.profileVal}>
                      {boy.shirtSize || "Chưa cập nhật"}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Số điện thoại 📞</Text>
                    <Text style={styles.profileVal}>{boy.phone}</Text>
                  </View>
                </View>

                {boy.facebook || boy.tiktok ? (
                  <View style={styles.profileRow}>
                    {boy.facebook ? (
                      <View style={styles.profileItem}>
                        <Text style={styles.profileLabel}>Facebook 🌐</Text>
                        <Text style={styles.profileLink} numberOfLines={1}>
                          {boy.facebook}
                        </Text>
                      </View>
                    ) : null}
                    {boy.tiktok ? (
                      <View style={styles.profileItem}>
                        <Text style={styles.profileLabel}>Tiktok 🎵</Text>
                        <Text style={styles.profileLink} numberOfLines={1}>
                          {boy.tiktok}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.tagsContainer}>
                  <Text style={styles.tagLabelHeader}>Sở thích 🌟</Text>
                  {renderChipList(boy.interest, "interest")}
                </View>

                <View style={styles.tagsContainer}>
                  <Text style={styles.tagLabelHeader}>Không thích 🚫</Text>
                  {renderChipList(boy.dislike, "dislike")}
                </View>

                <View style={styles.tagsContainer}>
                  <Text style={styles.tagLabelHeader}>Điều ghét ❌</Text>
                  {renderChipList(boy.hate, "hate")}
                </View>
              </View>
            </View>
          )}

          {/* Render Girl */}
          {girl && (
            <View style={[styles.profileSheet, { marginTop: SIZES.paddingMd }]}>
              <View
                style={[
                  styles.profileHeader,
                  {
                    borderLeftColor: COLORS.primary,
                    justifyContent: "space-between",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="female" size={20} color={COLORS.primary} />
                  <Text style={styles.profileName}>{girl.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/edit-profile",
                      params: { userId: girl.id },
                    })
                  }
                  style={styles.editProfileBtn}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.profileBody}>
                <View style={styles.profileRow}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Ngày sinh 🎂</Text>
                    <Text style={styles.profileVal}>
                      {formatDateOnly(girl.birthday)} (
                      {calculateAge(girl.birthday)} tuổi)
                    </Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>
                      Chiều cao / Cân nặng 📏
                    </Text>
                    <Text style={styles.profileVal}>
                      {girl.height}cm / {girl.weight}kg
                    </Text>
                  </View>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Size giày 👟</Text>
                    <Text style={styles.profileVal}>
                      {girl.shoeSize || "Chưa cập nhật"}
                    </Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Size áo 👕</Text>
                    <Text style={styles.profileVal}>
                      {girl.shirtSize || "Chưa cập nhật"}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Số điện thoại 📞</Text>
                    <Text style={styles.profileVal}>{girl.phone}</Text>
                  </View>
                </View>

                {girl.facebook || girl.tiktok ? (
                  <View style={styles.profileRow}>
                    {girl.facebook ? (
                      <View style={styles.profileItem}>
                        <Text style={styles.profileLabel}>Facebook 🌐</Text>
                        <Text style={styles.profileLink} numberOfLines={1}>
                          {girl.facebook}
                        </Text>
                      </View>
                    ) : null}
                    {girl.tiktok ? (
                      <View style={styles.profileItem}>
                        <Text style={styles.profileLabel}>Tiktok 🎵</Text>
                        <Text style={styles.profileLink} numberOfLines={1}>
                          {girl.tiktok}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.tagsContainer}>
                  <Text style={styles.tagLabelHeader}>Sở thích 🌟</Text>
                  {renderChipList(girl.interest, "interest")}
                </View>

                <View style={styles.tagsContainer}>
                  <Text style={styles.tagLabelHeader}>Không thích 🚫</Text>
                  {renderChipList(girl.dislike, "dislike")}
                </View>

                <View style={styles.tagsContainer}>
                  <Text style={styles.tagLabelHeader}>Điều ghét ❌</Text>
                  {renderChipList(girl.hate, "hate")}
                </View>
              </View>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.paddingMd,
    paddingBottom: SIZES.paddingLg * 2,
  },
  anniversaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
    marginBottom: SIZES.paddingLg,
  },
  anniversaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  heartContainer: {
    marginVertical: 12,
  },
  daysCounter: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
  },
  timerSubTextContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  timerSubText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.paddingMd,
  },
  milestoneSection: {
    marginBottom: SIZES.paddingLg,
  },
  timeline: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 28,
    top: 32,
    bottom: 32,
    width: 2,
    backgroundColor: COLORS.border,
  },
  timelineNode: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  nodeIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    zIndex: 10,
  },
  nodeContent: {
    flex: 1,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  nodeDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  usersSection: {
    marginBottom: SIZES.paddingMd,
  },
  profileSheet: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
    overflow: "hidden",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: SIZES.paddingMd,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  profileBody: {
    padding: SIZES.paddingMd,
  },
  profileRow: {
    flexDirection: "row",
    marginBottom: SIZES.paddingSm,
  },
  profileItem: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  profileVal: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  profileLink: {
    fontSize: 12,
    color: COLORS.primaryDark,
    textDecorationLine: "underline",
  },
  tagsContainer: {
    marginTop: SIZES.paddingSm,
  },
  tagLabelHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  miniChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  noChipsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  editProfileBtn: {
    padding: 4,
  },
  avatarsSection: {
    marginVertical: SIZES.paddingMd,
    alignItems: "center",
    width: "100%",
  },
  avatarsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    position: "relative",
  },
  waveConnectorContainer: {
    position: "absolute",
    left: 60,
    right: 60,
    top: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  connectImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...SHADOWS.light,
  },
  avatarImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  avatarPlaceholder: {
    width: 114,
    height: 114,
    borderRadius: 57,
    justifyContent: "center",
    alignItems: "center",
  },
  genderLabelBadge: {
    position: "absolute",
    bottom: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    ...SHADOWS.light,
  },
  genderLabelText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: "bold",
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
