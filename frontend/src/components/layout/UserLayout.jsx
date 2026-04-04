import React from "react";
import { Header, Footer } from "../index";
import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),_transparent_30%),radial-gradient(circle_at_90%_20%,_rgba(251,191,36,0.12),_transparent_22%),linear-gradient(180deg,_#0f172a_0%,_#090d14_55%,_#05070b_100%)] text-white">
      <Header />
      <main>
        {/* main content */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
