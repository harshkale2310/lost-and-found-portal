import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/* Time Ago Helper */
const timeAgo = (timestamp) => {
  if (!timestamp) return "—";
  const time = timestamp.toDate();
  const now = new Date();
  const diff = Math.floor((now - time) / 1000);

  if (diff < 10) return "just now";
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export default function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, total: 0 });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const statCardsRef = useRef([]);

  /* Modal States */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalLocation, setModalLocation] = useState("");
  const [modalEmail, setModalEmail] = useState("");

  /* Auth */
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  /* Firestore realtime */
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(data);

      const lost = data.filter((r) => r.category === "lost").length;
      const found = data.filter((r) => r.category === "found").length;

      setStats({ lost, found, total: data.length });

      statCardsRef.current.forEach((card) => {
        if (card) {
          card.classList.add("pulse");
          setTimeout(() => card.classList.remove("pulse"), 600);
        }
      });
    });
  }, []);

  /* Filter */
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const q = search.toLowerCase();
      const matchText =
        item.name?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);

      const matchCategory = filter === "all" || item.category === filter;
      return matchText && matchCategory;
    });
  }, [reports, search, filter]);

  /* Modal handlers */
  const openModal = (img, title, location, email) => {
    setModalImage(img);
    setModalTitle(title);
    setModalLocation(location);
    setModalEmail(email);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "auto";
  };

  /* Share */
  const shareReport = async (item) => {
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.name,
          text: `Lost & Found Report: ${item.name} at ${item.location}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Homepage link copied!");
      }
    } catch (err) {
      console.log("Share failed:", err);
    }
  };

  const handleReportClick = () => {
    if (!user) return navigate("/login");
    navigate("/add");
  };

  const lostPercent = stats.total ? (stats.lost / stats.total) * 100 : 0;
  const foundPercent = stats.total ? (stats.found / stats.total) * 100 : 0;

  return (
    <div className={`home-container ${modalOpen ? "blur-bg" : ""}`}>
      <div className="home-inner">
        {/* HERO */}
        <section className="home-hero">
          <h1 className="home-title">D.Y.P.T.C Lost & Found Portal</h1>
          <p className="home-subtitle">
            Realtime tracking of lost & found items
          </p>
        </section>

        {/* STATS */}
        <section className="home-stats-section">
          <div className="stats-box">
            <div
              className="stat-card lost"
              ref={(el) => (statCardsRef.current[0] = el)}
            >
              <h2>{stats.lost || "—"}</h2>
              <p>Lost Items</p>
            </div>
            <div
              className="stat-card found"
              ref={(el) => (statCardsRef.current[1] = el)}
            >
              <h2>{stats.found || "—"}</h2>
              <p>Found Items</p>
            </div>
            <div
              className="stat-card total"
              ref={(el) => (statCardsRef.current[2] = el)}
            >
              <h2>{stats.total || "—"}</h2>
              <p>Total Reports</p>
            </div>
          </div>
        </section>

        {/* CHART */}
        <section className="home-chart">
          <h3>Lost vs Found</h3>
          <div className="chart-bars">
            <div className="bar lost-bar">
              <span style={{ height: `${lostPercent}%` }} />
              <label>Lost</label>
            </div>
            <div className="bar found-bar">
              <span style={{ height: `${foundPercent}%` }} />
              <label>Found</label>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="home-search">
          <input
            placeholder="Search item or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </section>

        {/* ACTIVITY */}
        <section className="home-activity">
          <h3>Live Reports</h3>

          <div className="activity-list">
            {filteredReports.slice(0, 8).map((item) => (
              <div key={item.id} className="activity-item">
                {/* IMAGE + BADGE */}
                <div
                  className="activity-image"
                  onClick={() =>
                    openModal(
                      item.imageUrl,
                      item.name,
                      item.location,
                      item.reporterEmail,
                    )
                  }
                >
                  {/* BADGE OVER IMAGE */}
                  <span className={`badge ${item.category}`}>
                    {item.category}
                  </span>

                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="activity-content">
                  <strong>{item.name}</strong>
                  <p>{item.location}</p>
                  <p className="time">{timeAgo(item.createdAt)}</p>
                </div>

                {/* SHARE */}
                <button className="share-btn" onClick={() => shareReport(item)}>
                  🔗 Share
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="home-cta">
          <button className="btn-report" onClick={handleReportClick}>
            Report an Item
          </button>
        </section>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-img-wrap">
              <img src={modalImage} alt="Preview" />
            </div>

            <div className="modal-info">
              <h2>{modalTitle}</h2>
              <p>{modalLocation}</p>
              <p>
                <strong>Reporter:</strong> {modalEmail || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
