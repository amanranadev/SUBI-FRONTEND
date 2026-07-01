import type { IconName } from "@/assets/icon-system";
import type { PersonInfo } from "@/components/PersonInfoList";
import { buttonTokens } from "@/components/PrimaryButton/tokens";

import type {
  ReviewStatusState,
  TransactionResultState,
  TransactionTask,
} from "./TransactionResultDrawer.types";

export const DRAWER_BACKGROUND_COLOR = buttonTokens.colors.surfaceCard;

export const DRAWER_TITLE = "All Done! 👍";
export const DRAWER_HEADING = "Review and edit the information extracted from your document";
export const DRAWER_SUBHEADING =
  "Our AI did the heavy lifting, but it may not be perfect. Please double-check each section below to make sure everything looks right.";

export const AI_RESULT_LABEL = "AI Result";
export const REPORT_ISSUE_LABEL = "Report Issue";
export const LOOKS_GOOD_LABEL = "Looks Good";
export const DISCARD_DRAFT_LABEL = "Discard Draft";
export const SAVE_TRANSACTION_LABEL = "Save Transaction";

export const SECTION_TITLES = {
  transactionSummary: "TRANSACTION SUMMARY",
  clientInformation: "CLIENT INFORMATION",
  propertyInformation: "PROPERTY INFORMATION",
  formsAndTasks: "FORMS AND TASKS",
} as const;

export const CLIENT_SUBHEADINGS = {
  buyers: "BUYERS",
  buyerAgent: "BUYER AGENT",
  sellerAgent: "SELLER AGENT",
} as const;

export const CHECKLIST_SUBHEADING = "CHECKLIST";

const DEFAULT_TRANSACTION_LABEL = "742 Evergreen Terrace - New";

export function createDefaultTransactionTasks(
  transactionName: string = DEFAULT_TRANSACTION_LABEL,
): TransactionTask[] {
  return [
    {
      id: "task-earnest-money",
      transactionName,
      taskName: "Earnest Money Delivery",
      dueDate: new Date("2026-06-15"),
      status: "pending",
    },
    {
      id: "task-home-inspection",
      transactionName,
      taskName: "Order Home Inspection",
      dueDate: new Date("2026-06-20"),
      status: "pending",
    },
  ];
}

export const CHECKLIST_ACTIONS = [
  {
    id: "standard",
    title: "Standard Checklist",
    description: "Use a predefined checklist",
    iconName: "check-circle" as const satisfies IconName,
  },
  {
    id: "create",
    title: "Create Checklist",
    description: "Build from scratch",
    iconName: "add" as const satisfies IconName,
  },
  {
    id: "upload",
    title: "Upload Checklist",
    description: "Import from CSV file",
    iconName: "document-upload" as const satisfies IconName,
  },
  {
    id: "templates",
    title: "Saved Templates",
    description: "Reuse saved templates",
    iconName: "document" as const satisfies IconName,
  },
] as const;

const DEFAULT_REVIEW_STATUS: ReviewStatusState = {
  transactionSummary: "needs-review",
  clientInformation: "needs-review",
  propertyInformation: "needs-review",
  formsAndTasks: "needs-review",
};

export const DEFAULT_MICHELLE: PersonInfo = {
  id: "buyer-1",
  firstName: "Michelle",
  lastName: "Schubert",
  email: "michelle@oksubi.com",
  phone: "(509)-494-9408",
};

export const DEFAULT_JORDAN: PersonInfo = {
  id: "buyer-2",
  firstName: "Jordan",
  lastName: "Lee",
  email: "jordan.lee@example.com",
  phone: "(206)-555-0182",
};

export const DEFAULT_AGENT: PersonInfo = {
  id: "agent-1",
  firstName: "Taylor",
  lastName: "Brooks",
  email: "taylor.brooks@example.com",
  phone: "(509)-555-0100",
};

export function createEmptyTransactionResultState(): TransactionResultState {
  return {
    transactionSummary: {
      propertyAddress: "",
      purchasePrice: "",
      psaType: "",
      earnestMoney: "",
    },
    clientInformation: {
      buyers: [],
      buyerAgent: [],
      sellerAgent: [],
    },
    propertyInformation: {
      city: "",
      state: "",
      country: "",
      parcelNumber: "",
      titleCompany: "",
      closingAgent: "",
      escrowEmail: "",
      lender: "",
      itemsThatStay: [],
    },
    formsAndTasks: {
      tasks: [],
      selectedChecklistId: null,
    },
    reviewStatus: {
      transactionSummary: "needs-review",
      clientInformation: "needs-review",
      propertyInformation: "needs-review",
      formsAndTasks: "needs-review",
    },
  };
}

export function createDefaultTransactionResultState(): TransactionResultState {
  return {
    transactionSummary: {
      propertyAddress: "742 Evergreen Terrace, Seattle, WA 98101",
      purchasePrice: "$875,000",
      psaType: "Residential PSA",
      earnestMoney: "$25,000",
      closingDate: new Date("2026-07-15"),
      mutualAcceptance: new Date("2026-06-01"),
    },
    clientInformation: {
      buyers: [DEFAULT_MICHELLE],
      buyerAgent: [DEFAULT_AGENT],
      sellerAgent: [
        {
          id: "seller-agent-1",
          firstName: "Riley",
          lastName: "Nguyen",
          email: "riley.nguyen@example.com",
          phone: "(425)-555-0199",
        },
      ],
    },
    propertyInformation: {
      city: "Seattle",
      state: "WA",
      country: "United States",
      parcelNumber: "123456-7890",
      titleCompany: "Pacific Northwest Title",
      closingAgent: "Jordan Kim",
      escrowEmail: "escrow@pnwtitle.com",
      lender: "First Horizon Lending",
      itemsThatStay: ["Microwave", "Refrigerator"],
    },
    formsAndTasks: {
      tasks: createDefaultTransactionTasks(DEFAULT_TRANSACTION_LABEL),
      selectedChecklistId: "standard",
    },
    reviewStatus: { ...DEFAULT_REVIEW_STATUS },
  };
}

export function createAllDoneReviewStatus(): ReviewStatusState {
  return {
    transactionSummary: "done",
    clientInformation: "done",
    propertyInformation: "done",
    formsAndTasks: "done",
  };
}

export function createAllDoneState(): TransactionResultState {
  return {
    ...createDefaultTransactionResultState(),
    reviewStatus: createAllDoneReviewStatus(),
  };
}

export function createMultipleBuyersState(): TransactionResultState {
  return {
    ...createDefaultTransactionResultState(),
    clientInformation: {
      ...createDefaultTransactionResultState().clientInformation,
      buyers: [DEFAULT_MICHELLE, DEFAULT_JORDAN],
    },
  };
}

export function createLongDataState(): TransactionResultState {
  const base = createDefaultTransactionResultState();

  return {
    ...base,
    transactionSummary: {
      ...base.transactionSummary,
      propertyAddress:
        "742 Evergreen Terrace, Unit 12B, Capitol Hill Neighborhood, Seattle, Washington 98101-1234",
      purchasePrice: "$1,250,000.00 with seller concessions and closing cost credits",
      psaType: "Residential Purchase and Sale Agreement with Addenda",
      earnestMoney: "$75,000 held in escrow with extended release terms",
    },
    propertyInformation: {
      ...base.propertyInformation,
      city: "Seattle Metropolitan Area",
      titleCompany: "Pacific Northwest Title and Escrow Services LLC",
      closingAgent: "Jordan Kim, Senior Closing Coordinator",
      escrowEmail: "escrow-team-notifications@pnwtitle.example.com",
      lender: "First Horizon Lending Group, NMLS #123456",
      itemsThatStay: [
        "Built-in double oven with convection and self-cleaning mode",
        "Energy Star certified side-by-side refrigerator with ice maker",
      ],
    },
    formsAndTasks: {
      ...base.formsAndTasks,
      tasks: createDefaultTransactionTasks(
        "742 Evergreen Terrace, Unit 12B - New",
      ),
    },
  };
}
