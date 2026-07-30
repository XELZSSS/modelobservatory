import { useEffect, useRef, useState, type RefObject } from "react";

const DEFAULT_WIDTH = 300;

export function useElementWidth(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.floor(el.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}
