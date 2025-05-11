import React from "react";
import "./CenteredContainer.css";

const CenteredContainer = ({ children }) => {
  return <div className="centered-container">{children}</div>;
};

export default CenteredContainer;