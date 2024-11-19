"use client";

import { useEffect, useState } from "react";

export const useCachedState = <T>(key: string, initialValue: T) => {
  // Retrieve the cached value from localStorage, or use the initial value if none exists
  const cachedValue = JSON.parse(localStorage.getItem(key) || "{}");
  const [state, setState] = useState(cachedValue || initialValue);

  // Update localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
