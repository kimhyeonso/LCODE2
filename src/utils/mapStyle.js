export const FREE_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Keep road numbers and other non-name labels intact.
function usesName(value) {
  return Array.isArray(value) && (
    (value[0] === "get" && /^name(?::|_|$)/.test(value[1]))
    || value.some(usesName)
  );
}

export function koreanMapStyle(style) {
  return {
    ...style,
    layers: style.layers.map((layer) => {
      if (!usesName(layer.layout?.["text-field"])) return layer;
      return {
        ...layer,
        layout: {
          ...layer.layout,
          "text-field": ["coalesce",
            ["get", "name:ko"], ["get", "name"],
            ["get", "name:latin"], ["get", "name:en"], ""],
        },
      };
    }),
  };
}
