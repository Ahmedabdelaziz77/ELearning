"use client";
import Header from "@/components/Header";
import React from "react";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
export default function Page() {
  return (
    <div>
      <Header title="Profile" subtitle="View your profile" />
      <UserProfile
        path="/user/profile"
        routing="path"
        appearance={{
          baseTheme: dark,
          elements: {
            scrollBox: "bg-customgreys-darkGrey",
            navbar: {
              "& > div:nth-child(1)": {
                background: "none",
              },
            },
          },
        }}
      />
    </div>
  );
}
