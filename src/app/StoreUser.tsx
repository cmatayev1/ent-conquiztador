"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function StoreUser() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.store);

  useEffect(
    function () {
      if (!isAuthenticated) return;
      storeUser();
    },
    [isAuthenticated, storeUser]
  );

  return null;
}