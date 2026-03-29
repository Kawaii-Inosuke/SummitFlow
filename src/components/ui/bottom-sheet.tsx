"use client";

import { useState, useEffect, useRef } from "react";

interface BottomSheetProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  defaultHeight?: number;
}

export function BottomSheet({ onClose, title, children, defaultHeight = 75 }: BottomSheetProps) {
  const [height, setHeight] = useState(defaultHeight);
  const dragState = useRef({ active: false, startY: 0, startHeight: defaultHeight });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!dragState.current.active) return;
      const delta = dragState.current.startY - clientY;
      const newHeight = Math.min(92, Math.max(20, dragState.current.startHeight + (delta / window.innerHeight) * 100));
      setHeight(newHeight);
    };

    const handleEnd = () => {
      if (!dragState.current.active) return;
      dragState.current.active = false;
      setHeight((prev) => {
        if (prev < 25) setTimeout(() => onCloseRef.current(), 0);
        return prev;
      });
    };

    const onMM = (e: MouseEvent) => handleMove(e.clientY);
    const onTM = (e: TouchEvent) => handleMove(e.touches[0].clientY);

    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", onTM, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", handleEnd);
    };
  }, []);

  const startDrag = (clientY: number) => {
    dragState.current = { active: true, startY: clientY, startHeight: height };
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] flex flex-col overflow-hidden"
        style={{ height: `${height}vh` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientY); }}
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
        >
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
