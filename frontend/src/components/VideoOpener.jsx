import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import vid from "../assets/video/Salon.mp4";

const VideoOpener = ({ isOpen = false, onClose = ()=>null }) => {
  const modalRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        }
      );
      videoRef.current.play();
    }
  }, [isOpen]);

  const closeModal = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.4,
      ease: "power3.in",
      onComplete: onClose,
    });
    videoRef.current.pause();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-[70%] h-[60%]  max-w-4xl rounded-2xl bg-black shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-lg hover:scale-110 transition"
        >
          ✕
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          className="w-full h-full object-cover rounded-2xl"
        >
          <source src={vid} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default VideoOpener;
