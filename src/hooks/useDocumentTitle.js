import { useEffect } from "react";

// Custom hooks hold reusable stateful React behavior.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
