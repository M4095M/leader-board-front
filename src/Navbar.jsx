import React, { useState } from "react";
import Countdown from "react-countdown";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

function NavBar() {
  const [activeLink, setActiveLink] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Countdown Renderer
  const renderer = ({ days, hours, minutes, seconds }) => {
    return (
      <div className="flex flex-wrap justify-center items-center   font-bold text-pink-400 text-sm md:text-lg">
        <div className="mx-4 md:mx-2">
          <span>{String(days).padStart(2, "0")}</span>
          <span className="text-white"> Days</span>
        </div>
        <span className="text-white mx-4 sm:mx-2">:</span>
        <div className="mx-4 md:mx-2">
          <span>{String(hours).padStart(2, "0")}</span>
          <span className="text-white"> Hours</span>
        </div>
        <span className="text-white mx-4 sm:mx-2">:</span>
        <div className="mx-4 md:mx-2">
          <span>{String(minutes).padStart(2, "0")}</span>
          <span className="text-white"> Minutes</span>
        </div>
        <span className="text-white mx-4 sm:mx-2">:</span>
        <div className="mx-4 md:mx-2">
          <span>{String(seconds).padStart(2, "0")}</span>
          <span className="text-white"> Seconds</span>
        </div>
      </div>
    );
  };
  

  return (
    <div className="p-4 w-[90%] text-white md:flex items-center  justify-between ml-2 md:ml-10">
      <div className="flex items-center justify-between w-full md:w-[40%]">
        {/* Logo */}
        <img src="/ADC.png" alt="Logo" className="h-20 md:h-40" />

        {/* Hamburger Menu (small screens) */}
        <button className="md:hidden block" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="text-white h-8 w-8" />
        </button>

        {/* Navigation Links (Large Screens) */}
        <div className="hidden md:flex space-x-6 ml-20 font-bold">
          <Link
            to="/"
            className={`hover:text-pink-500 transition-all ${activeLink === "welcome" ? "text-pink-500" : ""}`}
            onClick={() => setActiveLink("welcome")}
          >
            Leaderboard
          </Link>
     

        </div>
      </div>

      {/* Countdown Timer */}
      <div className="mt-4 md:mt-0 md:flex md:justify-center">
        <Countdown date={new Date("2025-05-10T13:00:00")} renderer={renderer} />
      </div>


    </div>
  );
}

export default NavBar;
