import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";

const ChangePassword = () => {
  const { token } = useAuth(); // get token from auth context
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await usersAPI.changePassword(
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        token
      );
      setSuccess("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      // Optionally redirect after success
      // navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <h1>Change Password</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit} className="change-password-form">
        <label>
          Current Password:
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          New Password:
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Confirm New Password:
          <input
            type="password"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
