import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../utils/theme";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export type AlertType = "info" | "success" | "error" | "warning";

export interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: { cancelable?: boolean };
  type?: AlertType;
}

let globalSetAlertConfig: ((config: AlertConfig | null) => void) | null = null;

export const CustomAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean },
    type?: AlertType
  ) => {
    let inferredType: AlertType = type || "info";

    if (!type) {
      const textToSearch = `${title} ${message || ""}`.toLowerCase();
      if (
        textToSearch.includes("lỗi") ||
        textToSearch.includes("thất bại") ||
        textToSearch.includes("không thể") ||
        textToSearch.includes("hỏng") ||
        textToSearch.includes("error") ||
        textToSearch.includes("failed")
      ) {
        inferredType = "error";
      } else if (
        textToSearch.includes("thành công") ||
        textToSearch.includes("hoàn tất") ||
        textToSearch.includes("hoàn thành") ||
        textToSearch.includes("success") ||
        textToSearch.includes("completed")
      ) {
        inferredType = "success";
      } else if (
        textToSearch.includes("yêu cầu") ||
        textToSearch.includes("cảnh báo") ||
        textToSearch.includes("xác nhận") ||
        textToSearch.includes("xóa") ||
        textToSearch.includes("ngắt kết nối") ||
        textToSearch.includes("chú ý") ||
        textToSearch.includes("warning") ||
        textToSearch.includes("delete")
      ) {
        inferredType = "warning";
      }
    }

    if (globalSetAlertConfig) {
      globalSetAlertConfig({
        title,
        message,
        buttons,
        options,
        type: inferredType,
      });
    } else {
      console.warn("CustomAlert has not been initialized. Please mount CustomAlertProvider at the root of your app.");
    }
  },

  success: (title: string, message?: string, buttons?: AlertButton[], options?: { cancelable?: boolean }) => {
    CustomAlert.alert(title, message, buttons, options, "success");
  },

  error: (title: string, message?: string, buttons?: AlertButton[], options?: { cancelable?: boolean }) => {
    CustomAlert.alert(title, message, buttons, options, "error");
  },

  warning: (title: string, message?: string, buttons?: AlertButton[], options?: { cancelable?: boolean }) => {
    CustomAlert.alert(title, message, buttons, options, "warning");
  },

  info: (title: string, message?: string, buttons?: AlertButton[], options?: { cancelable?: boolean }) => {
    CustomAlert.alert(title, message, buttons, options, "info");
  },
};

export const CustomAlertProvider: React.FC = () => {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    globalSetAlertConfig = setConfig;
    return () => {
      globalSetAlertConfig = null;
    };
  }, []);

  useEffect(() => {
    if (config) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [config]);

  if (!config) return null;

  const handleDismiss = (onPress?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setConfig(null);
      if (onPress) {
        onPress();
      }
    });
  };

  const getThemeDetails = () => {
    switch (config.type) {
      case "success":
        return {
          iconName: "checkmark-circle" as const,
          iconColor: COLORS.success,
          primaryColor: COLORS.success,
          bgColor: "#e6fbf3",
        };
      case "error":
        return {
          iconName: "close-circle" as const,
          iconColor: COLORS.danger,
          primaryColor: COLORS.danger,
          bgColor: "#fef2f2",
        };
      case "warning":
        return {
          iconName: "warning" as const,
          iconColor: COLORS.warning,
          primaryColor: COLORS.warning,
          bgColor: "#fffbeb",
        };
      case "info":
      default:
        return {
          iconName: "information-circle" as const,
          iconColor: COLORS.primary,
          primaryColor: COLORS.primary,
          bgColor: "#e9f2fc",
        };
    }
  };

  const theme = getThemeDetails();
  const cancelable = config.options?.cancelable ?? true;
  const buttonsList = config.buttons && config.buttons.length > 0 ? config.buttons : [{ text: "OK" }];

  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      onRequestClose={() => {
        if (cancelable) handleDismiss();
      }}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (cancelable) handleDismiss();
        }}
      >
        <Animated.View
          style={[
            styles.overlayBg,
            {
              opacity: fadeAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.alertBox,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header/Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.bgColor }]}>
            <Ionicons name={theme.iconName} size={38} color={theme.iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{config.title}</Text>

          {/* Message */}
          {config.message ? <Text style={styles.message}>{config.message}</Text> : null}

          {/* Buttons */}
          <View
            style={[
              styles.buttonContainer,
              buttonsList.length > 2 ? styles.buttonContainerStacked : styles.buttonContainerRow,
            ]}
          >
            {buttonsList.map((btn, index) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";

              let btnBgColor = theme.primaryColor;
              let textColor = "#FFFFFF";

              if (isCancel) {
                btnBgColor = COLORS.background;
                textColor = COLORS.textMuted;
              } else if (isDestructive) {
                btnBgColor = COLORS.danger;
                textColor = "#FFFFFF";
              }

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    { backgroundColor: btnBgColor },
                    isCancel && { borderWidth: 1, borderColor: COLORS.border },
                    buttonsList.length <= 2 && styles.buttonFlex,
                    index > 0 && (buttonsList.length > 2 ? { marginTop: 10 } : { marginLeft: 10 }),
                  ]}
                  onPress={() => handleDismiss(btn.onPress)}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  overlayBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.overlay,
  },
  alertBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: 24,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  buttonContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainerStacked: {
    flexDirection: "column",
  },
  button: {
    height: 44,
    borderRadius: SIZES.radiusMd,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
