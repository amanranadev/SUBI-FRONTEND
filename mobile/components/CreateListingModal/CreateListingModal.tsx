import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { forwardRef } from "react";

import type { CreateListingModalProps } from "./types";

/**
 * Listing creation is disabled. PSA creation uses the Home upload flow.
 * The full CreateListingModal wizard is retained in git history.
 */
const CreateListingModal = forwardRef<BottomSheetModal, CreateListingModalProps>(
  (_props, _ref) => {
    return null;
  },
);

CreateListingModal.displayName = "CreateListingModal";

export default CreateListingModal;
