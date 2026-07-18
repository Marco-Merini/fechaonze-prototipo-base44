import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a58de6b489bfc4d5fc5352c/219598cd6_image.png";

export default function Logo({ size = 40, className = "", rounded = true }) {
  return (
    <img
      src={LOGO_URL}
      alt="FechaOnze"
      className={`object-cover ${rounded ? "rounded-xl" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}