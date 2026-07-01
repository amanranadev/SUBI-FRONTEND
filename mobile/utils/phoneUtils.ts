export const formatPhoneNumber = (value: string): string => {
    if (!value) return ''

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')

    // Limit to 10 digits (USA phone numbers only)
    const digits = cleaned.slice(0, 10)

    // Format as (xxx)-xxx-xxxx
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
}

/**
 * Strips formatting and returns only 10 digits for API
 * Removes country codes (like +1, 1) and returns last 10 digits
 * @param value - Formatted phone number string (may include country code)
 * @returns 10 digits exactly (xxxxxxxxxx) - no country codes
 */
export const stripPhoneNumber = (value: string): string => {
    if (!value) return ''
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')

    // If more than 10 digits (has country code like +1), take last 10 digits
    // Otherwise, take first 10 digits
    if (cleaned.length > 10) {
        return cleaned.slice(-10) // Last 10 digits (removes country code)
    }
    return cleaned.slice(0, 10) // First 10 digits
}

/**
 * Validates if phone number has exactly 10 digits
 */
export const isValidUSAPhoneNumber = (value: string): boolean => {
    const digits = stripPhoneNumber(value)
    return digits.length === 10
}
