import React from "react";

export default function Header({ title, subtitle, rightElement }: HeaderProps) {
  return (
    <div className="header">
      <div>
        <h1 className="header__title">{title}</h1>
        <p className="header__subtitle">{subtitle}</p>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
