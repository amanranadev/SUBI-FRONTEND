import { useCallback, useState } from "react";

export function useCollapsibleSectionLooksGood(
  onLooksGood: () => void,
  defaultExpanded = true,
) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleLooksGood = useCallback(() => {
    onLooksGood();
    setExpanded(false);
  }, [onLooksGood]);

  return {
    expanded,
    onExpandedChange: setExpanded,
    handleLooksGood,
  };
}
