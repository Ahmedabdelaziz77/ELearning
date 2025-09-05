import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <div className="footer">
      <p>&copy; 2025 ELZOZ; All Rights Reserved.</p>
      <div className="footer__links">
        {["About", "Privacy Policy", "Licensing", "Contact"].map((item) => (
          <Link
            scroll={false}
            href={`/${item.toLowerCase().replace(" ", "-")}`}
            key={item}
            className="footer__link"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
