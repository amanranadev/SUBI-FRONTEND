"use client"

import * as React from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { fetchContacts } from "@/features/contacts/api"
import { CONTACT_QUERY_KEYS } from "@/features/contacts/constants"
import type { ContactResult } from "@/features/contacts/types"
import { Input } from "@/shared/ui/input"
import { MaskedInput } from "@/shared/ui/masked-input"
import { cn } from "@/lib/utils"

type ContactAutocompleteField = "email" | "phone"

type ContactAutocompleteProps = {
  field: ContactAutocompleteField
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function getContactField(contact: ContactResult, field: ContactAutocompleteField): string | undefined {
  return field === "email" ? contact.email : contact.phone_number
}

function displayName(c: ContactResult) {
  return c.display_name ?? c.individual_name ?? c.company_name ?? ""
}

export function ContactAutocomplete({
  field,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
}: ContactAutocompleteProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: CONTACT_QUERY_KEYS.list(debouncedSearch, "all"),
    queryFn: () => fetchContacts({ search: debouncedSearch || undefined }),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: isFocused && value.trim().length > 0,
  })

  const suggestions = React.useMemo(() => {
    if (!data?.contacts || !value.trim()) return []
    const query = value.toLowerCase()
    return data.contacts
      .filter((c: ContactResult) => {
        const fieldValue = getContactField(c, field)
        if (!fieldValue) return false
        const name = displayName(c).toLowerCase()
        if (field === "phone") {
          const digits = value.replace(/\D/g, "")
          return fieldValue.replace(/\D/g, "").includes(digits) || name.includes(value.toLowerCase())
        }
        return fieldValue.toLowerCase().includes(value.toLowerCase()) || name.includes(value.toLowerCase())
      })
      .slice(0, 6)
  }, [data?.contacts, value, field])

  const selectedValue = getContactField(suggestions[0] ?? {}, field)?.toLowerCase()
  const normalizedValue = field === "phone" ? value.replace(/\D/g, "") : value.trim().toLowerCase()
  const normalizedSelected = field === "phone" ? (selectedValue ?? "").replace(/\D/g, "") : (selectedValue ?? "")
  const isExactMatch = suggestions.length === 1 && normalizedSelected === normalizedValue
  const showDropdown = isFocused && suggestions.length > 0 && !isExactMatch

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(value.trim()), 300)
    return () => clearTimeout(timer)
  }, [value])

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSelect = (contact: ContactResult) => {
    onChange(getContactField(contact, field) ?? "")
  }

  return (
    <div ref={wrapperRef} className="relative">
      {field === "phone" ? (
        <MaskedInput
          value={value}
          mask="phone"
          onValueChange={onChange}
          onBlur={() => setTimeout(() => onBlur?.(), 150)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder ?? "(555) 555-5555"}
          className={className}
          disabled={disabled}
          autoComplete="one-time-code"
          name="contact-search-nofill"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => onBlur?.(), 150)}
          placeholder={placeholder ?? "Email"}
          className={className}
          disabled={disabled}
          autoComplete="one-time-code"
          name="contact-search-nofill"
        />
      )}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-black/5 bg-white shadow-lg overflow-hidden">
          {suggestions.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(contact)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.03]"
            >
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {displayName(contact).charAt(0).toUpperCase() || "@"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-bold truncate", !displayName(contact) && "opacity-40")}>
                  {displayName(contact) || "No name"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {getContactField(contact, field)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Convenience wrappers
export function ContactEmailAutocomplete(props: Omit<ContactAutocompleteProps, "field">) {
  return <ContactAutocomplete field="email" {...props} />
}

export function ContactPhoneAutocomplete(props: Omit<ContactAutocompleteProps, "field">) {
  return <ContactAutocomplete field="phone" {...props} />
}
