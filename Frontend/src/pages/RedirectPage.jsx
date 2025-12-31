// frontend/src/pages/RedirectPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../components/LoaderComponent";

const RedirectPage = () => {
  const { linkId } = useParams(); // Ensure this matches your route path="/:linkId"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const effectRan = useRef(false);

  // 1. Clean up the URL logic to prevent double slashes or missing slashes
  const backendRoot = "https://shortener-1h7u.onrender.com";giu
  //import.meta.env.VITE_API_BASE_URL || ""; 
  
  // This regex removes "/api" and any trailing slashes safely
//  const backendRoot = apiBase.replace(/\/api\/?$/, "");

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (!linkId || effectRan.current) return;
    effectRan.current = true;

    const performRedirect = async () => {
      try {
        const targetUrl = `${backendRoot}/${linkId}`;
        console.log("Attempting to fetch from backend:", targetUrl);

        const res = await fetch(targetUrl);
        
        // If the backend returns 404 or 500
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log("Backend returned data:", data);

        if (!data.url) {
          throw new Error("The link exists, but no destination URL was found.");
        }

        // 2. Perform the actual redirect
        window.location.replace(data.url);

      } catch (err) {
        console.error("Redirect Error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    performRedirect();
  }, [linkId, backendRoot]);
  
  return (
    <div className="flex min-h-screen justify-center items-center bg-slate-900 text-white">
      {isLoading ? (
        <div className="text-center">
           <Loader size={100} color="#ffffff" />
           <p className="mt-4 animate-pulse">Finding your destination...</p>
        </div>
      ) : error ? (
        <div className="text-center flex flex-col items-center bg-slate-800 p-8 rounded-lg shadow-xl border border-red-500/50">
          <p className="mb-4 text-xl font-bold text-red-400">Redirect Failed</p>
          <p className="mb-6 text-gray-300">{error}</p>
          <Link to="/" className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition-colors">
            Return Home
          </Link>
        </div>
      ) : (
        <span>Redirecting...</span>
      )}
    </div>
  );
};

export default RedirectPage;
