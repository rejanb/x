import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../context/AuthContext";
import { registerSchema } from "../schemas/authSchemas";
import "./Register.css";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Add auth-page class to body for light theme
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      // In a real app, you would make an API call to register the user
      // For now, we'll simulate a successful registration and log them in
      const result = await login({
        username: data.username,
        email: data.email,
      });

      if (result.success) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="logo">X</h1>
          <h2>Join X today</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              className={`form-input ${errors.username ? "error" : ""}`}
              {...register("username")}
            />
            {errors.username && (
              <span className="error-text">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              className={`form-input ${errors.email ? "error" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              className={`form-input ${errors.password ? "error" : ""}`}
              {...register("password")}
            />
            {errors.password && (
              <span className="error-text">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="error-text">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-button">
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
