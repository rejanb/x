import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

const EditProfile = () => {
  const { user, updateUser, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    preferences: {
      theme: user?.preferences?.theme || "light",
      language: user?.preferences?.language || "en",
      notifications: user?.preferences?.notifications ?? true
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name in form.preferences) {
      setForm((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: type === "checkbox" ? checked : value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const updatedUser = await usersAPI.updateProfile(form, token);
    updateUser(updatedUser); 
    navigate("/profile"); 
  } catch (err) {
    console.error(err);
    setError("Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="edit-profile-page">
      <h1>Edit Profile</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <label>
          Display Name:
          <input
            type="text"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
          />
        </label>

        <label>
          Bio:
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
          />
        </label>

        <label>
          Theme:
          <select
            name="theme"
            value={form.preferences.theme}
            onChange={handleChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label>
          Language:
          <select
            name="language"
            value={form.preferences.language}
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>

        <label>
          Notifications:
          <input
            type="checkbox"
            name="notifications"
            checked={form.preferences.notifications}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
