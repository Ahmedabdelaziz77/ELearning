"use client";
import React from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";
export default function Signin() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const isChecoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const signUpUrl = isChecoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";
  const getRedirectUrl = () => {
    if (isChecoutPage) {
      return `/checkout?step=2&id=${courseId}`;
    }
    const userType = user?.publicMetadata?.userType as string;
    return userType === "student" ? "/user/courses" : "/teacher/courses";
  };
  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: "flex justify-center items-center py-5",
          cardBox: "shadow-none",
          card: "bg-customgreys-secondarybg w-full !shadow-none",
          footer: {
            background: "#25262f",
            padding: "0rem 2.5rem",
            "& > div > div:nth-child(1)": {
              background: "#25262f",
            },
          },
          formFieldLabel: "text-white-50 font-normal",
          formButtonPrimary:
            "bg-primary-700 text-white-100 hover:bg-primary-600 !shadow-none",
          formFieldInput: "bg-black/30 text-white-50 !shadow-none",
          footerActionLink: "text-primary-750 hover:text-primary-600",
        },
      }}
      signUpUrl={signUpUrl}
      forceRedirectUrl={getRedirectUrl()}
      routing="hash"
      afterSignOutUrl="/"
    />
  );
}
