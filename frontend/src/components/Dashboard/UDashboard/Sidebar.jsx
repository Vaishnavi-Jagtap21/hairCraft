import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useStore } from "../../../Store/Store";


const tabs = [
  { id: 1, label: "Book Appointment" },
  { id: 2, label: "My Appointments" },
  { id: 3, label: "User Profile" },
];

const Sidebar = () => {
  const [active, setActive] = useState(1); 
  const indicatorRef = useRef(null);
  const containerRef = useRef(null);

  const {setOpenTabId} = useStore()


  useEffect(() => {
    if (!containerRef.current) return;
    setOpenTabId(active)
    const activeEl = containerRef.current.querySelector(
      `[data-id="${active}"]`
    );

    if (activeEl && indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="fixed px-3 text-md w-[90vw] md:w-[50vw] h-[60px]
                 flex items-center justify-between
                 bg-gray-300/80 backdrop-blur-md
                 rounded-full bottom-[10%]
                 left-1/2 -translate-x-1/2
                 shadow-lg"
    >
      {/* SLIDING ACTIVE INDICATOR */}
      <div
        ref={indicatorRef}
        className="absolute left-0 h-[80%] bg-black rounded-full"
        style={{ top: "10%" }}
      />

      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-id={tab.id} 
          onClick={() => setActive(tab.id)}
          className={`relative z-10 text-[12px] md:text-sm  px-6 h-full
                      flex items-center justify-center
                      rounded-full transition-colors duration-300
                      ${
                        active === tab.id
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
