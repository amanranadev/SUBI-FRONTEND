import React, { memo } from "react";

import { Badge } from "@/components/ChipsBadges";

import type { ReviewStatus } from "../TransactionResultDrawer.types";

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
}

export const ReviewStatusBadge = memo(function ReviewStatusBadge({
  status,
}: ReviewStatusBadgeProps) {
  if (status === "done") {
    return <Badge label="Done" variant="success" size="lg" />;
  }

  return <Badge label="Needs Review" variant="warning" size="lg" />;
});

ReviewStatusBadge.displayName = "ReviewStatusBadge";
