import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔐 ADMIN GUARD */
  useEffect(() => {
    if (localStorage.getItem("admin") !== "true") {
      navigate("/admin-login");
    }
  }, [navigate]);

  /* 📥 FETCH REPORTS */
  const fetchReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reports"));
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setReports(fetched);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* 📧 SEND EMAIL (BACKGROUND) */
  const sendResolvedEmail = (report) => {
    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          email: report.contact, // {{email}}
          item_name: report.name,
          status: "Resolved",
          message: "📌 Your report has been resolved. Thank you for reaching out to us!",

        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .catch((err) => console.error("Email failed:", err));
  };

  /* ✅ RESOLVE REPORT — INSTANT UI */
  const updateStatus = async (id) => {
    try {
      // 1️⃣ Update UI instantly
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "resolved" } : r
        )
      );

      // 2️⃣ Update Firestore
      const reportRef = doc(db, "reports", id);
      await updateDoc(reportRef, { status: "resolved" });

      // 3️⃣ Send email in background
      const resolvedReport = reports.find((r) => r.id === id);
      if (resolvedReport) {
        sendResolvedEmail(resolvedReport);
      }
    } catch (err) {
      console.error("Error resolving report:", err);
      alert("Failed to resolve report.");
    }
  };

  /* 🗑️ DELETE REPORT */
  const deleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const reportRef = doc(db, "reports", id);
      await deleteDoc(reportRef);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Failed to delete report.");
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Reported By</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td data-label="Item">{r.name}</td>
                <td data-label="Description">{r.description}</td>
                <td data-label="Location">{r.location}</td>
                <td data-label="Contact">{r.contact}</td>
                <td data-label="Category">{r.category}</td>

                <td data-label="Reported By">
                  {r.reporterEmail || "N/A"}
                </td>

                <td data-label="Status">
                  <span className={`status-badge status-${r.status}`}>
                    {r.status}
                  </span>
                </td>

                <td data-label="Action">
                  <div className="action-buttons">
                    {r.status !== "resolved" && (
                      <button onClick={() => updateStatus(r.id)}>
                        Resolve
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => deleteReport(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
