import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_HEIGHT - 60;

interface ZoomableImageProps {
  uri: string;
  onZoomStateChange?: (isZoomed: boolean) => void;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  onZoomStateChange,
}) => {
  return (
    <View style={styles.container}>
      <ImageZoom
        source={{ uri }}
        minScale={1}
        maxScale={4}
        onZoomStart={() => onZoomStateChange?.(true)}
        onZoomEnd={() => onZoomStateChange?.(false)}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
});
