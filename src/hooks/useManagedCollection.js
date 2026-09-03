import { useEffect, useMemo, useState } from "react";
import { subscribeAdminManagementItems } from "../services/firestoreService";

const normalizeItem = (type, item) => {
  if (type === "packages") return { ...item, title: item.name || item.title };
  if (type === "coupons") {
    return {
      type: "L:CODE",
      expiry: "VALID UNTIL 별도 공지",
      ...item,
      title: item.discount || item.title || item.name,
      description: item.name || item.description || "L:CODE 쿠폰",
      used: item.active === false || item.used === true,
    };
  }
  return item;
};

const mergeItems = (type, defaults, remoteItems) => {
  const remoteById = new Map(remoteItems.map((item) => [String(item.id), item]));
  const defaultIds = new Set(defaults.map((item) => String(item.id)));
  const mergedDefaults = defaults
    .map((item) => ({ ...item, ...(remoteById.get(String(item.id)) || {}) }))
    .filter((item) => !item._deleted);
  const addedItems = remoteItems.filter(
    (item) => !defaultIds.has(String(item.id)) && !item._deleted,
  );
  return [...mergedDefaults, ...addedItems].map((item) => normalizeItem(type, item));
};

export function useManagedCollectionState(type, defaults) {
  const [remoteItems, setRemoteItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeAdminManagementItems(
      type,
      (items) => {
        setRemoteItems(items);
        setLoading(false);
      },
      () => {
        setRemoteItems([]);
        setLoading(false);
      },
    );
  }, [type]);

  const items = useMemo(() => mergeItems(type, defaults, remoteItems), [defaults, remoteItems, type]);
  return { items, loading };
}

export function useManagedCollection(type, defaults) {
  return useManagedCollectionState(type, defaults).items;
}
