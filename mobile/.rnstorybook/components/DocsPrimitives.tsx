import React, { type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const palette = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#ECECEC",
  borderStrong: "#CFCFCF",
  text: "#2C2C2C",
  textMuted: "#6B6B6B",
  textSubtle: "#9A9A9A",
  accent: "#F5821E",
  codeBg: "#F4F4F4",
  doBg: "#E7F6ED",
  doText: "#1B6B3F",
  dontBg: "#FEE2E2",
  dontText: "#991B1B",
  tableHeader: "#F6F6F6",
} as const;

export interface DocScreenProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function DocScreen({ children, contentContainerStyle }: DocScreenProps) {
  return (
    <ScrollView
      style={docStyles.screen}
      contentContainerStyle={[docStyles.screenContent, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
}

export function DocTitle({ children }: { children: string }) {
  return <Text style={docStyles.title}>{children}</Text>;
}

export function DocSubtitle({ children }: { children: string }) {
  return <Text style={docStyles.subtitle}>{children}</Text>;
}

export function DocSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={docStyles.section}>
      <DocHeading level={2}>{title}</DocHeading>
      {children}
    </View>
  );
}

export function DocHeading({
  level,
  children,
}: {
  level: 2 | 3 | 4;
  children: string;
}) {
  const style =
    level === 2
      ? docStyles.h2
      : level === 3
        ? docStyles.h3
        : docStyles.h4;
  return <Text style={style}>{children}</Text>;
}

export function DocParagraph({ children }: { children: string }) {
  return <Text style={docStyles.paragraph}>{children}</Text>;
}

export function DocBulletList({ items }: { items: string[] }) {
  return (
    <View style={docStyles.bulletList}>
      {items.map((item) => (
        <View key={item} style={docStyles.bulletRow}>
          <Text style={docStyles.bulletMarker}>•</Text>
          <Text style={docStyles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function DocCodeBlock({ code }: { code: string }) {
  return (
    <View style={docStyles.codeBlock}>
      <Text style={docStyles.codeText}>{code}</Text>
    </View>
  );
}

export interface PropDefinition {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
  required?: boolean;
}

export function DocPropsTable({ rows }: { rows: PropDefinition[] }) {
  return (
    <View style={docStyles.table}>
      <View style={[docStyles.tableRow, docStyles.tableHeaderRow]}>
        <Text style={[docStyles.tableCell, docStyles.tableHeaderCell, docStyles.colName]}>
          Property
        </Text>
        <Text style={[docStyles.tableCell, docStyles.tableHeaderCell, docStyles.colType]}>
          Type
        </Text>
        <Text style={[docStyles.tableCell, docStyles.tableHeaderCell, docStyles.colDefault]}>
          Default
        </Text>
      </View>
      {rows.map((row) => (
        <View key={row.name} style={docStyles.tableRow}>
          <View style={docStyles.colName}>
            <Text style={docStyles.propName}>{row.name}</Text>
            {row.required ? (
              <Text style={docStyles.requiredBadge}>required</Text>
            ) : null}
          </View>
          <Text style={[docStyles.tableCell, docStyles.colType, docStyles.typeText]}>
            {row.type}
          </Text>
          <Text style={[docStyles.tableCell, docStyles.colDefault, docStyles.defaultText]}>
            {row.defaultValue}
          </Text>
          <Text style={docStyles.propDescription}>{row.description}</Text>
        </View>
      ))}
    </View>
  );
}

export function DocPreviewCard({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <View style={docStyles.previewCard}>
      {label ? <Text style={docStyles.previewLabel}>{label}</Text> : null}
      <View style={docStyles.previewBody}>{children}</View>
    </View>
  );
}

export function DocGalleryGrid({ children }: { children: ReactNode }) {
  return <View style={docStyles.galleryGrid}>{children}</View>;
}

export function DocGalleryItem({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <View style={[docStyles.previewCard, docStyles.previewCardInGrid]}>
      {label ? <Text style={docStyles.previewLabel}>{label}</Text> : null}
      <View style={docStyles.previewBody}>{children}</View>
    </View>
  );
}

export function DocCallout({
  variant,
  title,
  items,
}: {
  variant: "do" | "dont";
  title: string;
  items: string[];
}) {
  const containerStyle =
    variant === "do" ? docStyles.calloutDo : docStyles.calloutDont;
  const titleStyle =
    variant === "do" ? docStyles.calloutDoTitle : docStyles.calloutDontTitle;
  return (
    <View style={[docStyles.callout, containerStyle]}>
      <Text style={titleStyle}>{title}</Text>
      <DocBulletList items={items} />
    </View>
  );
}

export function DocTokenGroup({
  title,
  items,
}: {
  title: string;
  items: { token: string; value: string; usage?: string }[];
}) {
  return (
    <View style={docStyles.tokenGroup}>
      <DocHeading level={3}>{title}</DocHeading>
      {items.map((item) => (
        <View key={item.token} style={docStyles.tokenRow}>
          <Text style={docStyles.tokenName}>{item.token}</Text>
          <Text style={docStyles.tokenValue}>{item.value}</Text>
          {item.usage ? (
            <Text style={docStyles.tokenUsage}>{item.usage}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const docStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screenContent: {
    padding: 20,
    paddingBottom: 48,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textMuted,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
    gap: 12,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 4,
  },
  h3: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.text,
    marginTop: 8,
  },
  h4: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.textMuted,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.textMuted,
  },
  bulletList: {
    gap: 6,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
  },
  bulletMarker: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.accent,
    width: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: palette.textMuted,
  },
  codeBlock: {
    backgroundColor: palette.codeBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
    color: palette.text,
  },
  table: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: palette.surface,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    padding: 12,
    gap: 6,
  },
  tableHeaderRow: {
    backgroundColor: palette.tableHeader,
    flexDirection: "row",
    gap: 8,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.textSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 12,
  },
  colName: {
    flex: 1.2,
  },
  colType: {
    flex: 1.4,
  },
  colDefault: {
    flex: 1,
  },
  propName: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.text,
    fontFamily: "monospace",
  },
  requiredBadge: {
    fontSize: 10,
    color: palette.accent,
    marginTop: 2,
  },
  typeText: {
    color: "#7A2AE0",
    fontFamily: "monospace",
  },
  defaultText: {
    color: palette.textSubtle,
    fontFamily: "monospace",
  },
  propDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.textMuted,
  },
  previewCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 12,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewBody: {
    alignSelf: "stretch",
    width: "100%",
    minWidth: 0,
    alignItems: "flex-start",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 12,
    rowGap: 12,
  },
  previewCardInGrid: {
    minWidth: 148,
    flexGrow: 0,
    flexShrink: 0,
  },
  callout: {
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  calloutDo: {
    backgroundColor: palette.doBg,
  },
  calloutDont: {
    backgroundColor: palette.dontBg,
  },
  calloutDoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.doText,
  },
  calloutDontTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.dontText,
  },
  tokenGroup: {
    gap: 8,
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  tokenRow: {
    gap: 2,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  tokenName: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "monospace",
    color: palette.text,
  },
  tokenValue: {
    fontSize: 12,
    fontFamily: "monospace",
    color: palette.textSubtle,
  },
  tokenUsage: {
    fontSize: 12,
    color: palette.textMuted,
    fontStyle: "italic",
  },
});
