import React, { useEffect, useRef, useState } from "react";
import "../index.css";
import collegeImg from "../assets/college.jpg";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

export default function About() {
  const visionRef = useRef(null);
  const imageRef = useRef(null);
  const missionRef = useRef(null);

  const [showVision, setShowVision] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showMission, setShowMission] = useState(false);

  const [items, setItems] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === visionRef.current && entry.isIntersecting)
            setShowVision(true);
          if (entry.target === imageRef.current && entry.isIntersecting)
            setShowImage(true);
          if (entry.target === missionRef.current && entry.isIntersecting)
            setShowMission(true);
        });
      },
      { threshold: 0.5 }
    );

    if (visionRef.current) observer.observe(visionRef.current);
    if (imageRef.current) observer.observe(imageRef.current);
    if (missionRef.current) observer.observe(missionRef.current);

    return () => observer.disconnect();
  }, []);

  // Firestore real-time listener
  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });

    return () => unsubscribe();
  }, []);

  // Duplicate items to create continuous slider
  const sliderItems = [...items, ...items];

  return (
    <div className="about-page">
      <section className="section about-top about-top-bg">
        <div className="container">
          <h1 className="about-title">About D.Y.P.T.C Lost & Found Portal</h1>
          <p className="about-text">
            The D.Y.P.T.C Lost & Found Portal helps students and faculty
            efficiently report, track, and recover misplaced belongings within
            the campus.
          </p>
        </div>
      </section>

      <section className="section about-vision">
        <div className="container vision-layout">
          <div
            ref={visionRef}
            className={`vision-content ${showVision ? "vision-visible" : ""}`}
          >
            <h2 className="about-subtitle">Our Vision</h2>
            <p className="about-text">
              D.Y. Patil Technical Campus envisions a digitally connected
              academic environment that promotes responsibility, innovation, and
              ethical ownership.
            </p>
          </div>

          <div
            ref={imageRef}
            className={`vision-image ${showImage ? "image-visible" : ""}`}
          >
            <img src={collegeImg} alt="Campus" />
          </div>
        </div>
      </section>

      <section className="section lost-slider-section">
        <h2 className="about-subtitle center">Recently Reported Lost Items</h2>

        <div className="lost-slider">
          <div className="lost-slider-track">
            {sliderItems.length === 0 ? (
              <div className="lost-card">
                <h4>No Reports Yet</h4>
              </div>
            ) : (
              sliderItems.map((item, index) => (
                <div className="lost-card" key={index}>
                  <img src={item.imageUrl} alt={item.name} />
                  <h4>{item.name}</h4>
                  <span
                    className={
                      item.category === "found" ? "found-badge" : "lost-badge"
                    }
                  >
                    {item.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section about-mission">
        <div
          ref={missionRef}
          className={`mission-content ${showMission ? "mission-visible" : ""}`}
        >
          <div className="container">
            <h2 className="about-subtitle center">Our Mission</h2>
            <div className="mission-cards">
              <div className="mission-card">
                <h3>Efficiency</h3>
                <p>
                  Streamline lost and found processes for students and faculty.
                </p>
              </div>
              <div className="mission-card">
                <h3>Transparency</h3>
                <p>
                  Ensure all reports and claims are tracked securely and openly.
                </p>
              </div>
              <div className="mission-card">
                <h3>Collaboration</h3>
                <p>
                  Encourage students and staff to actively participate and help
                  each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
