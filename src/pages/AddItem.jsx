// src/pages/AddItem.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";
import emailjs from "@emailjs/browser";
import "../index.css";

export default function AddItem() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
    category: "lost",
  });

  /* 🔐 AUTH */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
      else setLoggedUser(user.email);
    });
    return unsub;
  }, [navigate]);

  const sanitize = (v) => v.replace(/[<>]/g, "");
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  /* VALIDATION */
  const validateField = (name, value) => {
    let error = "";
    const val = value.trim();

    if (!val) error = "This field is required";
    else {
      if (name === "name" && val.length < 3)
        error = "Item name must be at least 3 characters";
      if (name === "description" && val.length < 10)
        error = "Description must be at least 10 characters";
      if (name === "contact" && !isValidEmail(val))
        error = "Enter a valid email";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitize(value) });
    validateField(name, value);
    setSuccessMessage("");
  };

  /* IMAGE */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Only image files allowed" }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const isFormValid = () =>
    formData.name.trim().length >= 3 &&
    formData.description.trim().length >= 10 &&
    formData.location.trim() !== "" &&
    isValidEmail(formData.contact) &&
    Object.values(errors).every((e) => e === "");

  /* 📧 SEND EMAIL (background) */
  const sendReportEmail = (data) => {
    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          email: data.contact,
          item_name: data.name,
          status: "Pending",
         message: "📩 Your report has been submitted successfully. Our team will review it and get back to you soon.",

        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .catch((err) => console.error("Email failed:", err));
  };

  /* 🚀 SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedUser) return;

    Object.keys(formData).forEach((field) =>
      validateField(field, formData[field])
    );
    if (!isFormValid()) return;

    setLoading(true);

    try {
      let imageUrl = "";

      // 🔥 IMPORTANT: Upload image (if any) BEFORE saving
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      // 1️⃣ Save report (fast)
      await addDoc(collection(db, "reports"), {
        ...formData,
        imageUrl,
        reporterEmail: loggedUser,
        status: "pending",
        createdAt: new Date(),
      });

      // 2️⃣ Show success instantly
      setSuccessMessage("Report submitted successfully!");
      setFormData({
        name: "",
        description: "",
        location: "",
        contact: "",
        category: "lost",
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});

      // 3️⃣ Send email in background (non-blocking)
      sendReportEmail(formData);

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Failed to submit report" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-item-container">
      <h2>Report Lost / Found Item</h2>

      {errors.submit && <p className="auth-msg error">{errors.submit}</p>}
      {successMessage && <p className="auth-msg success">{successMessage}</p>}

      {imagePreview && (
        <div className="image-preview-box">
          <img src={imagePreview} alt="Preview" />
        </div>
      )}

      <div className="form-group">
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {errors.image && <p className="field-error">{errors.image}</p>}
      </div>

      <form onSubmit={handleSubmit} className="add-item-form">
        <input
          name="name"
          placeholder="Item Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="field-error">{errors.name}</p>}

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="field-error">{errors.description}</p>
        )}

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        {errors.location && <p className="field-error">{errors.location}</p>}

        <input
          name="contact"
          placeholder="Contact Email"
          value={formData.contact}
          onChange={handleChange}
        />
        {errors.contact && <p className="field-error">{errors.contact}</p>}

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <button disabled={loading || !isFormValid()}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
