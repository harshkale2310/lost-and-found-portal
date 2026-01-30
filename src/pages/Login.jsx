import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import "../index.css";

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({});

  // Show/Hide Password
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    validateField(e.target.name, e.target.value);
  };

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      username: "",
      phone: "",
      email: "",
      password: "",
    });
    setMessage({ type: "", text: "" });
    setErrors({});
  };

  // EmailJS send function
  const sendEmail = async (type) => {
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          email: formData.email,
          name: formData.firstname,
          type: type,
          message:
            type === "signup"
              ? "Welcome! Your account has been created."
              : "You have successfully logged in.",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  };

  // Validation rules
  const validateField = (name, value) => {
    let error = "";

    if (name === "firstname" || name === "lastname") {
      if (!value.trim()) error = "This field is required";
      else if (value.trim().length < 3)
        error = "Minimum 3 characters required";
    }

    if (name === "username") {
      const usernameRegex = /^[a-zA-Z0-9]{6,}$/;
      if (!value.trim()) error = "Username is required";
      else if (!usernameRegex.test(value))
        error = "Username must be at least 6 characters";
    }

    if (name === "phone") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!value.trim()) error = "Phone number is required";
      else if (!phoneRegex.test(value))
        error = "Phone number must be 10 digits";
    }

    if (name === "email") {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!value.trim()) error = "Email is required";
      else if (!emailRegex.test(value))
        error = "Enter a valid email address";
    }

    if (name === "password") {
      // EXACTLY 8 characters, must contain letter + number + symbol
      const passRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8}$/;
      if (!value.trim()) error = "Password is required";
      else if (!passRegex.test(value))
        error =
          "Password must be exactly 8 characters with letters, numbers & symbol";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Check if form is valid
  const isFormValid = () => {
    if (isSignup) {
      return (
        formData.firstname.trim().length >= 3 &&
        formData.lastname.trim().length >= 3 &&
        /^[a-zA-Z0-9]{6,}$/.test(formData.username) &&
        /^[0-9]{10}$/.test(formData.phone) &&
        /\S+@\S+\.\S+/.test(formData.email) &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8}$/.test(
          formData.password
        ) &&
        Object.values(errors).every((e) => e === "")
      );
    } else {
      return (
        /\S+@\S+\.\S+/.test(formData.email) &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8}$/.test(
          formData.password
        ) &&
        Object.values(errors).every((e) => e === "")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      if (!isFormValid()) {
        setMessage({
          type: "error",
          text: "Please fix the errors before submitting.",
        });
        setLoading(false);
        return;
      }

      if (isSignup) {
        localStorage.setItem("isSigningUp", "true");

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          firstname: formData.firstname,
          lastname: formData.lastname,
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          createdAt: new Date(),
        });

        await signOut(auth);
        localStorage.removeItem("isSigningUp");

        // Send signup email
        await sendEmail("signup");

        setMessage({
          type: "success",
          text: "Account created! Please login.",
        });

        setIsSignup(false);
        resetForm();
      } else {
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Send login email
        await sendEmail("login");

        setMessage({ type: "success", text: "Login Successful!" });
        resetForm();
        navigate("/");
      }
    } catch (err) {
      localStorage.removeItem("isSigningUp");
      setMessage({
        type: "error",
        text: isSignup ? err.message : "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {message.text && (
          <p className={`auth-msg ${message.type}`}>{message.text}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <>
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              {errors.firstname && (
                <p className="field-error">{errors.firstname}</p>
              )}

              <input
                type="text"
                name="lastname"
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
              {errors.lastname && (
                <p className="field-error">{errors.lastname}</p>
              )}

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && (
                <p className="field-error">{errors.username}</p>
              )}

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="field-error">{errors.email}</p>}

          {/* PASSWORD FIELD WITH SHOW/HIDE */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {errors.password && <p className="field-error">{errors.password}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? isSignup
                ? "Signing Up..."
                : "Logging In..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        <p
          className="toggle-auth"
          onClick={() => {
            setIsSignup(!isSignup);
            resetForm();
          }}
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}
