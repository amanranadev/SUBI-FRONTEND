export const CHECKLIST_LIMITS = {
  TASK_NAME: 100,
  TASK_LABEL: 50,
} as const;

export const CHECKLIST_PATTERNS = {
  TASK_NAME: /^[\p{L}\p{N} .,&'-]+$/u,
  TASK_LABEL: /^[\p{L}\p{N} .'-]+$/u,
} as const;

export const STANDARD_CHECKLIST_DATA: Array<{ label: string; tasks: string[] }> = [
  {
    label: "Initial Listing & Agency",
    tasks: [
      "Signed Exclusive Listing Agreement",
      "Agency Disclosure Statement",
      "Seller Disclosure (Property Condition)",
      "Lead-Based Paint Disclosure (pre-1978)",
      "MLS Input Sheet verification",
    ],
  },
  {
    label: "Marketing & Property Access",
    tasks: [
      "Professional Photos & Video",
      "Yard Signage Installation",
      "Electronic Lockbox (Supra/SentriLock)",
      "Social Media Blast",
      "Virtual Tour Upload",
    ],
  },
  {
    label: "Offer & Contract Management",
    tasks: [
      "Executed Purchase & Sale Agreement",
      "Earnest Money Receipt (verified)",
      "Pre-Approval Letter Review",
      "Financing Addendum (Form 22A)",
    ],
  },
];
