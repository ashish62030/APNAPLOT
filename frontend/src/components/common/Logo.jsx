import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineLibrary } from "react-icons/hi";
import { logoStyles as s } from "../../assets/dummyStyles";

const Logo = ({
  fontSize = "1.5rem",
  iconSize = 24,
  showText = true,
  ...props
}) => {
  return (
    <Link
      to="/"
      {...props}
      className={`${s.link} ${props.className || ""}`}
      style={{ fontSize, ...props.style }}
    >
      <div className={s.iconWrapper}>
        <HiOutlineLibrary size={iconSize} />
      </div>
      {showText && <span className={s.text}>ApnaPlot</span>}
    </Link>
  );
};

export default Logo;

