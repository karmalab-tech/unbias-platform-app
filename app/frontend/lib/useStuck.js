import { useEffect, useRef, useState } from "react";

// Tells a `position: sticky` element whether it is currently pinned, by watching
// a zero-height sentinel rendered just above it. `offset` is the sticky top
// inset, so the state flips exactly when the element pins.
export default function useStuck(offset = 0) {
  const sentinel = useRef(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: `-${offset}px 0px 0px 0px` }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [offset]);

  return [sentinel, stuck];
}
