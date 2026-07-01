import { colors } from '@/constants/colors'
import { MessageComposedData } from '@/types/message'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface EmailReviewCardProps {
  data?: MessageComposedData;
}

const EmailReviewCard: React.FC<EmailReviewCardProps> = ({ data }) => {
  // Generate initials from contact name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(data?.contact.name || '');

  return (
    <View style={styles.container}>
      <View style={styles.emailReviewCard}>
        <View style={styles.emailReviewCardHeaderContainer}>
          <View style={styles.emailReviewCardHeader}>
            <View style={styles.emailReviewCardHeaderLeft}>
              <View style={styles.emailReviewCardUserIcon}>
                <Text style={styles.emailReviewCardUserIconText}>{initials}</Text>
              </View>
              <Text style={styles.emailReviewCardHeaderTitle}>To: {data?.contact.name}</Text>
            </View>
            <View style={styles.emailReviewCardHeaderRight}>
              <Ionicons name="mail-outline" size={16} color={colors.gray[600]} />
            </View>
          </View>
          <Text style={styles.emailReviewCardHeaderSubtitle}>
            <Text style={styles.emailReviewCardHeaderSubtitleBold}>Subject:</Text>
            <Text style={styles.emailReviewCardHeaderSubtitleLight}> {data?.subject}</Text>
          </Text>
        </View>
        <View style={styles.emailReviewCardBody}>
          <Text style={styles.emailReviewCardBodyText}>{data?.body}</Text>
        </View>
      </View>
    </View>

  )
}

export { EmailReviewCard }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailReviewCard: {
    flexDirection: 'column',
    width: 345,
    minHeight: 218,
    height: 'auto',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    // Shadow configuration from design
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    // For Android
    elevation: 4,
  },
  emailReviewCardHeaderContainer: {
    width: '100%',
    height: 96,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[300],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  emailReviewCardHeader: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emailReviewCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailReviewCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailReviewCardUserIcon: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.poolBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailReviewCardUserIconText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#16B3F2',
    textAlign: 'center',
    lineHeight: 16,
    overflow: 'hidden',
  },
  emailReviewCardHeaderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    lineHeight: 20,
    overflow: 'hidden',
  },
  emailReviewCardHeaderSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    overflow: 'hidden',
  },
  emailReviewCardHeaderSubtitleBold: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
    lineHeight: 16,
  },
  emailReviewCardHeaderSubtitleLight: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 16,
  },
  emailReviewCardBody: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  emailReviewCardBodyText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
})
