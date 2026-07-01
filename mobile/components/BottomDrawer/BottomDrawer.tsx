import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Platform,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bottomDrawerStyles, bottomDrawerTokens } from "./BottomDrawer.styles";
import type { BottomDrawerProps } from "./BottomDrawer.types";
import {
  resolveStickyFooterScrollContentStyle,
  useBottomDrawerSheetConfig,
} from "./resolveBottomDrawerConfig";

const DEFAULT_SIZE = "content" as const;
const DEFAULT_FOOTER_BEHAVIOR = "sticky" as const;

function BottomDrawerComponent({
  open,
  size = DEFAULT_SIZE,
  children,
  footer,
  footerBehavior = DEFAULT_FOOTER_BEHAVIOR,
  backgroundColor,
  onClose,
  testID,
}: BottomDrawerProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const hasBeenPresentedRef = useRef(false);
  const [stickyFooterContentHeight, setStickyFooterContentHeight] = useState(0);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const sheetConfig = useBottomDrawerSheetConfig(size);
  const usesStickyFooter = footer != null && footerBehavior === "sticky";

  useEffect(() => {
    if (!open) {
      setStickyFooterContentHeight(0);
    }
  }, [open]);

  useEffect(() => {
    setStickyFooterContentHeight(0);
  }, [footer]);

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
      return;
    }

    if (hasBeenPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
  }, [open]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        hasBeenPresentedRef.current = true;
        return;
      }

      if (index === -1 && hasBeenPresentedRef.current) {
        hasBeenPresentedRef.current = false;
        onClose?.();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={bottomDrawerTokens.backdrop.opacity}
        pressBehavior="close"
        style={bottomDrawerStyles.backdrop}
        accessibilityRole="button"
        accessibilityLabel="Close drawer"
      />
    ),
    [],
  );

  const contentContainerStyle = useMemo<StyleProp<ViewStyle>>(() => {
    const baseStyle = bottomDrawerStyles.contentContainer;

    if (usesStickyFooter) {
      return [
        baseStyle,
        resolveStickyFooterScrollContentStyle(stickyFooterContentHeight),
      ];
    }

    if (!footer) {
      return [baseStyle, { paddingBottom: bottomInset }];
    }

    return baseStyle;
  }, [bottomInset, footer, stickyFooterContentHeight, usesStickyFooter]);

  const backgroundStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      bottomDrawerStyles.background,
      backgroundColor ? { backgroundColor } : null,
    ],
    [backgroundColor],
  );

  const footerContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      bottomDrawerStyles.footerContainer,
      backgroundColor ? { backgroundColor } : null,
    ],
    [backgroundColor],
  );

  const stickyScrollStyle = useMemo(
    () =>
      sheetConfig.enableDynamicSizing
        ? undefined
        : bottomDrawerStyles.stickyScroll,
    [sheetConfig.enableDynamicSizing],
  );

  const handleStickyFooterContentLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      setStickyFooterContentHeight(nativeEvent.layout.height);
    },
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        {...props}
        bottomInset={bottomInset}
        style={footerContainerStyle}
      >
        <View
          style={bottomDrawerStyles.footerContent}
          onLayout={handleStickyFooterContentLayout}
        >
          {footer}
        </View>
      </BottomSheetFooter>
    ),
    [
      bottomInset,
      footer,
      footerContainerStyle,
      handleStickyFooterContentLayout,
    ],
  );

  const renderScrollView = (scrollChildren: ReactNode) => (
    <BottomSheetScrollView
      testID={testID}
      style={stickyScrollStyle}
      contentContainerStyle={contentContainerStyle}
      enableFooterMarginAdjustment={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator
      children={scrollChildren}
    />
  );

  const scrollBody = (
    <>
      {children}
      {footer && footerBehavior === "scroll" ? (
        <View style={[footerContainerStyle, { paddingBottom: bottomInset }]}>
          {footer}
        </View>
      ) : null}
    </>
  );

  const body = usesStickyFooter
    ? renderScrollView(children)
    : sheetConfig.enableDynamicSizing
      ? <BottomSheetView>{renderScrollView(scrollBody)}</BottomSheetView>
      : renderScrollView(scrollBody);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      enableDynamicSizing={sheetConfig.enableDynamicSizing}
      snapPoints={
        sheetConfig.enableDynamicSizing ? undefined : sheetConfig.snapPoints
      }
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableHandlePanningGesture
      keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
      android_keyboardInputMode="adjustResize"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={bottomDrawerStyles.handle}
      backgroundStyle={backgroundStyle}
      containerStyle={bottomDrawerStyles.sheetContainer}
      footerComponent={usesStickyFooter ? renderFooter : undefined}
      accessibilityViewIsModal
      children={body}
    />
  );
}

export const BottomDrawer = memo(BottomDrawerComponent);
BottomDrawer.displayName = "BottomDrawer";
