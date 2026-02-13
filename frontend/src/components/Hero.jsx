import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import main from "../assets/image/main.jpg";
import main1 from "../assets/image/main1.jpg";
import { useNavigate } from "react-router-dom";
import VideoOpener from "./VideoOpener";
// import AIHairstyleModal from "../components/AIHairstyleModal";

const Hero = () => {
const heroRef = useRef(null);
const [showAI, setShowAI] = useState(false);
const [open, setOpen] = useState(false);
const navigate = useNavigate();

useEffect(() => {
if (!heroRef.current) return;


const ctx = gsap.context(() => {

  // LEFT TEXT ANIMATION
  const leftItems = document.querySelectorAll(".hero-left > *");
  if (leftItems.length) {
    gsap.from(leftItems, {
      opacity: 0,
      y: 60,
      duration: 1,
      stagger: 0.25,
      ease: "power3.out",
    });
  }

  // OFFER CARD
  const offer = document.querySelector(".offer-card");
  if (offer) {
    gsap.from(offer, {
      opacity: 0,
      x: -60,
      duration: 1,
      ease: "power3.out",
      delay: 0.4,
    });
  }

  // MAIN IMAGE
  const image = document.querySelector(".hero-image");
  if (image) {
    gsap.from(image, {
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2,
    });
  }

  // FLOATING CARDS
  const floatCards = document.querySelectorAll(".float-card");
  if (floatCards.length) {
    gsap.from(floatCards, {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.8,
      stagger: 0.25,
      ease: "power3.out",
      delay: 0.6,
    });
  }

}, heroRef);

return () => ctx.revert();


}, []);

return (
<> 
<section
     ref={heroRef}
     className="relative bg-[#f9f7f4] overflow-hidden"
   > <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">


      {/* LEFT CONTENT */}
      <div className="space-y-8 relative z-10 hero-left">

        <h1 className="text-5xl leading-tight font-serif text-gray-900 stylish-font">
          CARE FOR YOUR SKIN,<br />
          CARE FOR YOUR BEAUTY
        </h1>

        <p className="max-w-md text-gray-600">
          Our skin care clinic offers premium aesthetic and beauty services.
        </p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/Booking")}
            className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition"
          >
            Book Now <span>↗</span>
          </button>

          <button
            className="text-gray-800 font-medium hover:underline"
            onClick={() => setOpen(true)}
          >
            Watch Video
          </button>
        </div>

        {/* OFFER CARD */}
        <div
          onClick={() => navigate("/offers")}
          className="relative w-[260px] rounded-3xl overflow-hidden shadow-xl offer-card cursor-pointer hover:scale-105 transition-transform duration-300"
        >
          <img src={main} alt="offer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
            <span className="bg-white/30 px-4 py-1 rounded-full text-sm w-fit">
              Special Offer
            </span>

            <div>
              <h2 className="text-3xl font-bold">Upto 20% off</h2>
              <p className="text-sm mt-2">Save this holiday season</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="relative">
        <img
          src={main1}
          alt="model"
          className="rounded-[40px] w-full max-w-md mx-auto object-cover h-[500px] hero-image"
        />

        {/* REVIEW CARD */}
        <div className="absolute left-5 top-[60%] bg-white rounded-2xl p-4 shadow-lg w-[260px] float-card">
          <div className="flex items-center gap-3">
            <img src={main1} alt="avatar" className="w-10 h-10 rounded-full" />
            <p className="text-sm text-gray-600">
              "Crafting Beauty, Creating Confidence."
            </p>
          </div>
        </div>

        {/* PRODUCT CARD */}
        <div className="absolute right-0 bottom-10 bg-white rounded-2xl p-4 shadow-lg w-[200px] float-card">
          <img src={main1} alt="product" className="w-full h-32 object-contain" />
          <h4 className="font-medium mt-2">Style Glow Confidence with</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold">HairCraft</span>
            <span className="text-yellow-500">★★★★★</span>
          </div>
        </div>
      </div>
    </div>

    {showAI && (
      <AIHairstyleModal onClose={() => setShowAI(false)} />
    )}
  </section>

  <VideoOpener isOpen={open} onClose={() => setOpen(false)} />
</>


);
};

export default Hero;
