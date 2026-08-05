import { useLayoutEffect, useRef, useState, type RefObject } from "react";

// Start at 0 so consumers can guard rendering (charts render at 0 width) and
// measure synchronously before first paint via useLayoutEffect to avoid a
// wrong-size flash.
export function useElementWidth(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
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
