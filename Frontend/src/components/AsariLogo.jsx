import React from "react";
import logoAsari from "../../logo_asari.png";

export const AsariLogo = ({
  className = "h-8",
  showText = true,
  textClassName = "text-white",
  subtitleClassName = "text-emerald-400",
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Official ASARI Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src={logoAsari}
          alt="ASARI Logo"
          className={`${className} w-auto object-contain drop-shadow-md`}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div
            className={`font-black tracking-tight leading-none text-base sm:text-lg ${textClassName}`}
          >
            ASARI{" "}
            <span className={subtitleClassName}>
              Sample Tracking
            </span>
          </div>

          <div className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mt-0.5">
            UM6P • Agriculture & Sustainability
          </div>
        </div>
      )}
    </div>
  );
};

export default AsariLogo;