import { useEffect, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "maplibre-gl/dist/maplibre-gl.css";
import { FREE_MAP_STYLE_URL, koreanMapStyle } from "../utils/mapStyle";

const ATTRIBUTION = '<a href="https://openfreemap.org/">OpenFreeMap</a> | &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export default function KoreanMapLayer() {
  const map = useMap();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let layer;
    let gl;
    let timeout;

    const removeLayer = () => {
      if (!layer) return;
      gl?.off("error", fallback);
      gl?.off("webglcontextlost", fallback);
      // A failed WebGL constructor may leave a partially attached Leaflet layer.
      if (!gl) layer.onRemove = () => layer.getContainer()?.remove();
      layer.remove();
      layer = undefined;
    };
    const fallback = () => {
      if (disposed) return;
      clearTimeout(timeout);
      controller.abort();
      removeLayer();
      setReady(false);
    };

    timeout = setTimeout(fallback, 15000);
    async function initialize() {
      try {
        const [response] = await Promise.all([
          fetch(FREE_MAP_STYLE_URL, { signal: controller.signal }),
          import("@maplibre/maplibre-gl-leaflet"),
        ]);
        if (!response.ok) throw new Error(`Map style: ${response.status}`);
        const style = koreanMapStyle(await response.json());
        if (disposed || controller.signal.aborted) return;
        layer = L.maplibreGL({
          style,
          interactive: false,
          attributionControl: { customAttribution: ATTRIBUTION },
        });
        layer.addTo(map);
        gl = layer.getMaplibreMap();
        gl.once("load", () => {
          if (disposed || controller.signal.aborted) return;
          clearTimeout(timeout);
          setReady(true);
        });
        gl.on("error", fallback);
        gl.on("webglcontextlost", fallback);
      } catch {
        fallback();
      }
    }
    initialize();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
      removeLayer();
    };
  }, [map]);

  return ready ? null : <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  />;
}
