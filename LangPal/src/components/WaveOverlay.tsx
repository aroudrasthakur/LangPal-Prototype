import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

export type WaveOverlayStartRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WaveOverlayProps = {
  startRect: WaveOverlayStartRect;
  color?: string; // default orange
  durationMs?: number; // each phase (expand/collapse)
  reducedMotion?: boolean;
  onCovered: () => void; // called at peak cover
  onDone: () => void; // called after collapse finishes
};

export default function WaveOverlay({
  startRect,
  color = "#FF8C00",
  durationMs = 550,
  reducedMotion = false,
  onCovered,
  onDone,
}: WaveOverlayProps) {
  const expand = useRef(new Animated.Value(0)).current; // 0 -> 1 expand, then 1 -> 0 collapse opacity/scale
  const phase = useRef<"expand" | "collapse">("expand");

  const { centerX, centerY, initialSize, endScale } = useMemo(() => {
    const { width: vw, height: vh } = Dimensions.get("window");

    const cx = startRect.x + startRect.width / 2;
    const cy = startRect.y + startRect.height / 2;

    // farthest corner distance
    const distances = [
      dist(cx, cy, 0, 0),
      dist(cx, cy, vw, 0),
      dist(cx, cy, vw, vh),
      dist(cx, cy, 0, vh),
    ];
    const maxDist = Math.max(...distances);

    const diameter = Math.max(startRect.width, startRect.height);
    const radius = diameter / 2;
    const scale = Math.max(1, maxDist / radius);

    return {
      centerX: cx,
      centerY: cy,
      initialSize: diameter,
      endScale: scale,
    };
  }, [startRect]);

  useEffect(() => {
    if (reducedMotion) {
      onCovered();
      const t = setTimeout(onDone, 50);
      return () => clearTimeout(t);
    }

    Animated.timing(expand, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (phase.current === "expand") {
        onCovered();
        phase.current = "collapse";
        Animated.timing(expand, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(() => onDone());
      }
    });
  }, [durationMs, expand, onCovered, onDone, reducedMotion]);

  if (reducedMotion) return null;

  const scale = expand.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, endScale], // start slightly small for a smoother in
  });
  const opacity = expand.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View pointerEvents="auto" style={StyleSheet.absoluteFill}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.circle,
          {
            left: centerX,
            top: centerY,
            width: initialSize,
            height: initialSize,
            backgroundColor: color,
            transform: [
              { translateX: -initialSize / 2 },
              { translateY: -initialSize / 2 },
              { scale },
            ],
            opacity,
          },
        ]}
      />
    </View>
  );
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.hypot(dx, dy);
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    borderRadius: 9999,
    zIndex: 9999,
  },
});
