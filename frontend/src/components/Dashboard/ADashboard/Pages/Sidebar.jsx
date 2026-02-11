import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useStore } from "../../../../Store/Store";

const tabs = [
  { id: 1, label: "Overview" },
  { id: 2, label: "Services" },
  { id: 3, label: "History" },
  { id: 4, label: "Users" },
  { id: 5, label: "Messages" },
  { id: 6, label: "Appointments" },
  { id: 7, label: "Offers" },
  { id: 8, label: "Stylists Schedule" },
  { id: 9, label: "Manage Stylists" },
];

const Sidebar = () => {
  const indicatorRef = useRef(null);
  const containerRef = useRef(null);

  const { openTabId, setOpenTabId } = useStore();

  useEffect(() => {
    if (!containerRef.current || !indicatorRef.current) return;

    const activeEl = containerRef.current.querySelector(
      `[data-id="${openTabId}"]`
    );

    if (!activeEl) return;

    gsap.to(indicatorRef.current, {
      x: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [openTabId]);

  return (
    <div
      ref={containerRef}
      className="fixed px-3 w-[90vw] md:w-fit h-[60px]
                 flex items-center gap-2 overflow-x-auto no-scrollbar
                 bg-gray-300/80 backdrop-blur-md
                 rounded-full bottom-[10%]
                 left-1/2 -translate-x-1/2
                 shadow-lg"
    >
      {/* Sliding Indicator */}
      <div
        ref={indicatorRef}
        className="absolute left-0 h-[80%] bg-black rounded-full"
        style={{ top: "10%" }}
      />

      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-id={tab.id}
          onClick={() => setOpenTabId(tab.id)}
          className={`relative z-10 px-6 h-[80%] my-auto text-sm rounded-full transition whitespace-nowrap flex-shrink-0 flex items-center justify-center
            ${openTabId === tab.id
              ? "text-white"
              : "text-gray-700 hover:text-black"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
