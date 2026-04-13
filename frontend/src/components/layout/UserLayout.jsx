import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header, Footer } from "../index";
import { fetchCurrentUser } from "../../redux/actions/auth.action";

function UserLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.2),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(251,191,36,0.12),transparent_22%),linear-gradient(180deg,#0f172a_0%,#090d14_55%,#05070b_100%)] text-white">
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
