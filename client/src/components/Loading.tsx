import { Loader } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="loading">
      <Loader className="loading__spinner" />
      <span className="loading__text">Loading...</span>
    </div>
  );
}
