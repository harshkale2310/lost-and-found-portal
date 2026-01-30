import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../index.css";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [adminLogged, setAdminLogged] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  /* 🔐 Admin check */
  useEffect(() => {
    const checkAdmin = () => {
      setAdminLogged(localStorage.getItem("admin") === "true");
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    return () => window.removeEventListener("storage", checkAdmin);
  }, []);

  /* 👤 Firebase auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  /* 📱 MOBILE SAFE SCROLL LOCK (NO GLITCH) */
  useEffect(() => {
    if (window.innerWidth > 768) return;

    if (menuOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, [menuOpen]);

  /* 🧭 DESKTOP SCROLL EFFECT ONLY */
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 769) return;

      const navbar = document.querySelector(".dyptc-navbar");
      if (!navbar) return;

      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* 🚨 Guard report */
  const handleReportClick = () => {
    if (!user) {
      alert("You must login first!");
      navigate("/login");
      return;
    }
    navigate("/add");
    setMenuOpen(false);
  };

  /* 👤 User logout */
  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  /* 🔐 Admin logout */
  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    setAdminLogged(false);
    setMenuOpen(false);
    navigate("/admin-login");
  };

  if (authLoading) return null;

  return (
    <nav className="dyptc-navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          D.Y.P.T.C Lost & Found Portal
        </Link>
      </div>

      {/* ===== Desktop Nav ===== */}
      <ul className="navbar-list desktop-only">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><button onClick={handleReportClick}>Report</button></li>
        {adminLogged && (
          <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
        )}
      </ul>

      <div className="nav-right desktop-only">
        {!adminLogged ? (
          <Link to="/admin-login">Admin</Link>
        ) : (
          <button className="logout" onClick={logoutAdmin}>
            Admin Logout
          </button>
        )}
        {user ? (
          <button className="logout" onClick={logoutUser}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>

      {/* ===== Hamburger ===== */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* ===== Overlay ===== */}
      {menuOpen && (
        <div
          className="menu-overlay show"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ===== Mobile Menu ===== */}
      <aside className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <ul>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><button onClick={handleReportClick}>Report</button></li>

          {adminLogged && (
            <li>
              <Link
                to="/admin-dashboard"
                onClick={() => setMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="mobile-actions">
          {!adminLogged ? (
            <Link to="/admin-login" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          ) : (
            <button className="logout" onClick={logoutAdmin}>
              Admin Logout
            </button>
          )}

          {user ? (
            <button className="logout" onClick={logoutUser}>
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </aside>
    </nav>
  );
}