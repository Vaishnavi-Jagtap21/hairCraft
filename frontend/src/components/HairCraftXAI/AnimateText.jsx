import React, { useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const AnimateText = ({ text = "loading.." }) => {
  const [arrText] = useState(text.split(""));

  useGSAP(() => {
    gsap.to(".text", {
      y: 15,
      stagger: 0.1,
      duration: 1,
      ease: "power1.out",
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <div className="flex text-xl gap-1">
      {arrText.map((txt, i) => (
        <span key={i} className="text inline-block">
          {txt}
        </span>
      ))}
    </div>
  );
};

export default AnimateText;
