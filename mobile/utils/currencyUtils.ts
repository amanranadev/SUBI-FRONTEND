/**
 * Currency formatting and parsing utilities
 * Handles conversion between currency strings ($1,234.56) and numbers
 */

/**
 * Formats a number or string as currency
 * @param value - Value to format (number, string, null, or undefined)
 * @returns Formatted currency string (e.g., "$1,234.56") or empty string if invalid
 */
export function formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return "";

    let numValue: number;

    if (typeof value === "string") {
        // Remove currency symbols and commas
        const cleaned = value.replace(/[$,\s]/g, "");
        numValue = parseFloat(cleaned);
    } else {
        numValue = value;
    }

    if (isNaN(numValue)) {
        return "";
    }

    // Handle negative values
    const isNegative = numValue < 0;
    const absValue = Math.abs(numValue);

    try {
        const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(absValue);

        return isNegative ? `-${formatted}` : formatted;
    } catch (error) {
        console.error("❌ Error formatting currency:", error);
        return "";
    }
}

/**
 * Parses a currency string to a number
 * @param value - Currency string (e.g., "$1,234.56" or "1234.56")
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(value: string | null | undefined): number {
    if (!value) return 0;

    try {
        // Remove currency symbols, commas, and whitespace
        const cleaned = value.toString().replace(/[$,\s]/g, "");
        const parsed = parseFloat(cleaned);

        if (isNaN(parsed)) {
            return 0;
        }

        return parsed;
    } catch (error) {
        console.error("❌ Error parsing currency:", error);
        return 0;
    }
}

/**
 * Formats a number as currency without the dollar sign
 * @param value - Value to format
 * @returns Formatted string without $ (e.g., "1,234.56")
 */
export function formatCurrencyWithoutSymbol(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return "";

    let numValue: number;

    if (typeof value === "string") {
        const cleaned = value.replace(/[$,\s]/g, "");
        numValue = parseFloat(cleaned);
    } else {
        numValue = value;
    }

    if (isNaN(numValue)) {
        return "";
    }

    try {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Math.abs(numValue));
    } catch (error) {
        console.error("❌ Error formatting currency without symbol:", error);
        return "";
    }
}

/**
 * Validates that a currency value is positive
 * @param value - Value to validate
 * @returns true if value is positive, false otherwise
 */
export function isPositiveCurrency(value: number | string | null | undefined): boolean {
    const parsed = parseCurrency(value?.toString() || "");
    return parsed > 0;
}

/**
 * Validates that a currency value is non-negative
 * @param value - Value to validate
 * @returns true if value is >= 0, false otherwise
 */
export function isNonNegativeCurrency(value: number | string | null | undefined): boolean {
    if (value === null || value === undefined) {
        return false;
    }

    const cleaned = value.toString().trim().replace(/[$,\s]/g, "");
    if (!cleaned || !/^\d+(\.\d+)?$/.test(cleaned)) {
        return false;
    }

    const parsed = parseCurrency(value.toString());
    return Number.isFinite(parsed) && parsed >= 0;
}
