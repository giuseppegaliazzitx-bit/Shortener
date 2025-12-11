//frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Removed Form, redirect as they aren't used for navigation
import Loader from '../components/LoaderComponent'
import ProfileCard from '../components/ProfileDisplayComponent'

const ProfilePage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("authToken")); // Initialize directly
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGettingProfile, setIsGettingProfile] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Handle Auth Redirect
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);
  
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }
    localStorage.removeItem('authToken'); 
    // Update state so the useEffect above triggers the redirect
    setToken(null); 
    alert('You have been logged out.'); 
  };

  const handleDelete = async () => {
    const password = window.prompt("Please enter your password to confirm deletion:");
    if (!password) {
      alert("Account deletion cancelled.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/deleteUser`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Password: password }), // Important
      });

      const text = await res.text();
      console.log("Status:", res.status);
      console.log("Raw body:", text);

      // Try to parse JSON if possible
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (res.ok) {
        alert("Account deleted successfully.");
        localStorage.removeItem('authToken');
        setToken(null);
        navigate('/');
      } else {
        console.error("Delete error:", data);
        alert(
          (data && data.message) ||
          (typeof data === "string" ? data : "Failed to delete account.")
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while deleting the account.");
    } finally{
      setIsDeleting(false)
    }
  };


  const handleProfileChanges = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const avatarUrl = form.get("avatarUrl");
    const username = form.get("username");
    const email = form.get("email");
    const newPassword = form.get("newPassword");
    const confirmNewPassword = form.get("confirmNewPassword");
    const currentPassword = form.get("currentPassword");

    // If user typed a new password, make sure it matches
    if (newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match.");
        return;
      }
    }

    const payload = {
      UserPfpUrl: avatarUrl,
      Username: username,
      Email: email,
      NewPassword: newPassword,
      Password: currentPassword,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/profile/updateUser`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to update profile.");
        return;
      }

      alert("Changes applied!");
      navigate(0);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // 2. Handle Data Fetching
  useEffect(() => {
    // Define the function inside the effect
    const fetchProfile = async () => {
      setIsGettingProfile(true);
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        });
    
        const data = await res.json();
        
        if (!res.ok) {
          // If unauthorized, maybe logout?
          if (res.status === 401) handleLogout();
          console.error(data.message);
          return;
        }
    
        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Failed to load profile");
      } finally {
        setIsGettingProfile(false)
      }
    };

    // Only fetch if we have a token
    if (token) {
      fetchProfile();
    }
  }, [token, API_BASE_URL]); // Dependency array prevents infinite loop
  
  if(isEditing){
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar with back button */}
      <div className="p-4">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          onClick={() => setIsEditing(false)}
        >
          ← Back
        </button>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleProfileChanges}
          method="PATCH"
          className="w-full max-w-md shadow-2xl rounded-lg border-y-4 border-blue-500 bg-gray-50 p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Edit Profile
          </h2>

          {/* Profile picture URL */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Profile picture URL (optional)
            </label>
            <input
              type="url"
              name="avatarUrl"
              placeholder="https://example.com/image.png"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Username (Optional)
            </label>
            <input
              type="text"
              name="username"
              placeholder="New username"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Email(Optional)
            </label>
            <input
              type="email"
              name="email"
              placeholder="New Email"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              New password (Optional)
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Confirm new password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Confirm new password (Optional)
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm new password"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Current / old password (for verification) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Current password (Required)
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              placeholder="Current password"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className=" btn-press w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );

  }
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="w-full bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
        <div className="text-xl font-bold text-indigo-600">LinkShortener</div>
        <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
                Dashboard
            </Link>
            <Link 
              to="/profile" 
              className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1"
            >
                Profile
            </Link>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className='flex justify-center items-center min-h-[calc(100vh-4rem)]'>
        {isGettingProfile || !user ?  (
          <Loader size={200} color="#fffff" />
        ) : (
          <ProfileCard
            user={user}
            isDeleting={isDeleting}
            imageLoaded={imageLoaded}
            imageError={imageError}
            setImageLoaded={setImageLoaded}
            setImageError={setImageError}
            setIsEditing={setIsEditing}
            handleLogout={handleLogout}
            handleDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
