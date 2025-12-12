// Frontend/src/pages/DashboardPage.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react";
import ShortenedLinkEditStatsComponent from '../components/ShortenedLinkEditStatsComponenet';
import Loader from '../components/LoaderComponent';
import ClickedAnalyticDisplayComponent from '../components/ClickedAnalyticDisplayComponent';

const DashboardPage = () => {
  const [error, setError] = useState(null);
  const [link, setLink] = useState(null);
  const [links, setLinks] = useState([]);
  const [token, setToken] = useState(null);
  const [ClickedAnalyticLinkInfo, setClickedAnalyticLinkInfo] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  
  //loading variables
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingLinkCreating, setIsLoadingLinkCreation] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  //get Token
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) setToken(storedToken);
  }, []);

  //Get links
  useEffect(() => {
    if (!token) return;
    setIsLoadingLinks(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/link/getLinks`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });

        const resBody = await res.json().catch(() => null);
        console.log("getLinks response:", res.status, resBody);

        if (!res.ok) {
          alert(resBody?.message || `Failed to load links: ${res.status}`);
          return;
        }

        // Accept either an array or { data: [...] }
        const fetchedLinks = Array.isArray(resBody) ? resBody : resBody?.data ?? [];
        const normalized = fetchedLinks.map(l => ({
          ...l,
          shortenedURL: l?.shortenedURL ?? (l?.slug ? `${window.location.protocol}//${window.location.host}/${l.slug}` : undefined)
        }));

        setLinks(normalized);
      } catch (e) {
        console.error(e);
        alert("Failed to load links");
      } finally{
        setIsLoadingLinks(false)
      }
    })();
  }, [token]);

  //create shortened Link
  async function shortenLink(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const OriginalUrl = formData.get("OriginalUrl");
    const CustomSlug = formData.get("CustomSlug")?.toString().trim() || null;

    setIsLoadingLinkCreation(true)
    try {
      const res = await fetch(`${API_BASE_URL}/link/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          originalUrl: OriginalUrl,
          customSlug: CustomSlug,
        }),
      });

      const resBody = await res.json().catch(() => null);
      console.log("create response:", res.status, resBody);

      if (!res.ok) {
        alert(resBody.message);
        const msg = resBody?.message || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      const createdLink = resBody?.data;
      if (!createdLink || !createdLink.slug) {
        throw new Error("Server did not return a valid created link (missing slug).");
      }

      const shortenedURL = createdLink.shortenedURL ?? `${window.location.protocol}//${window.location.host}/${createdLink.slug}`;
      const linkWithUrl = { ...createdLink, shortenedURL };

      setLink(linkWithUrl);
      setLinks((prevLinks) => [linkWithUrl, ...prevLinks]);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Something went wrong creating the link");
    } finally{
      setIsLoadingLinkCreation(false)
    }
  }

  //handle slug change
async function handleSave(e) {
  e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawSlug = formData.get("newSlug");

    if (typeof rawSlug !== "string") {
    // field missing or not a text input
    return;
    }

    const newSlug = rawSlug.trim();

    if (!newSlug) {
    // empty after trimming
    return;
    }

  if (newSlug === selectedLink.slug) {
    alert("Slug can't be the same");
    return; // Stop execution here
  }

  try {
    const res = await fetch(`${API_BASE_URL}/link/edit/${selectedLink.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        newSlug: newSlug,
      }),
    });

    const resBody = await res.json();

    if (!res.ok) {
      throw new Error(resBody.message || "Something went wrong");
    }

    const newShortenedURL = `${window.location.protocol}//${window.location.host}/${newSlug}`;

    setLinks(prevLinks =>
      prevLinks.map(item =>
        item.id === selectedLink.id
          ? {
              ...item,
              slug: newSlug,
              shortenedURL: newShortenedURL // <-- CRITICAL FIX: Recalculate and set this
            }
          : item // Keep other links as they are
      )
    );

    if (link && link.id === selectedLink.id) {
      setLink(prev => ({
        ...prev,
        slug: newSlug,
        shortenedURL: newShortenedURL
      }));
    }

    setSelectedLink(prev => ({
      ...prev,
      slug: newSlug,
      shortenedURL: newShortenedURL // Also update this for the selectedLink itself
    }));

    alert(resBody.message); // Displays "Slug updated successfully."
    e.target.reset(); // Clears the input field after successful save

  } catch (err) {
    // --- ERROR HANDLING HERE ---
    alert(err.message); // Alerts: "The new slug is already in use."
  }
}

  //handle analytic/edit click
    const handleEditClick = async (linkId) => {
    try {

      //Fetch the analytics from the API
      const res = await fetch(`${API_BASE_URL}/analytic/${linkId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // specific syntax for Bearer token
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        }
      });

      if (!res.ok) {
        // 1. Parse the response body as JSON
        const errorData = await res.json();
        alert(errorData.message);
        // 2. Throw the error using the message from the server
        // Note: Adjust 'errorData.message' to match your server's key (e.g., errorData.error)
        throw new Error(errorData.message || "Failed to fetch analytics");
      }

      const { link, analytics } = await res.json(); 

      setClickedAnalyticLinkInfo(analytics); 
      setSelectedLink(link);
    } catch (err) {
      console.error(err);
      alert("Error loading stats: " + err.message);
    }
  };

  //anndle deleete of a link
const handleDelete = async () => {
  if (!selectedLink) {
    alert("No link selected");
    return;
  }

  const id = selectedLink.id;
  alert(id);

  try {
    const res = await fetch(`${API_BASE_URL}/link/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let msg = "Failed to delete link";
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch (err) {
        console.error(err.message)
      }
      alert(msg);
      return;
    }
    setLink((prev) => (prev && prev.id === id ? null : prev));
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
    setSelectedLink((prev) => (prev && prev.id === id ? null : prev));

  } catch (err) {
    console.error(err);
    alert("Error deleting link");
  }
};


  return (
    <div>
      {/* navigation */}
      <nav className="w-full bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
        <div className="text-xl font-bold text-indigo-600">LinkShortener</div>
        <div><Link to="/dashboard">Dashboard</Link></div>
        <div><Link to="/profile">Profile</Link></div>
      </nav>

      {/* main Content (form shortener+ links) + analytics */}
      {/* This is the main flex container for the two columns */}
      <div className="h-full w-full flex flex-col md:flex-row p-4 gap-4 grow"> {/* Added padding and gap */}

        {/* Left Side, Form and Links List (takes full width on small, half on medium+) */}
        <div className="w-full h-full grow md:w-1/2 flex flex-col gap-4 flex-1 min-h-0"> {/* Added flex-col and gap for vertical stacking */}
          
          {/* Form Shortener */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shorten a new link</h2>
            <form onSubmit={shortenLink} method="POST" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                <input name="OriginalUrl" type="url" required placeholder="https://..." className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Slug <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm select-none">localhost:3000/</span>
                  <input name="CustomSlug" placeholder="summer-sale" className="block w-full rounded-r-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>

              <button 
              type="submit" 
              className=" btn-press flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:animate-[press-bounce_0.15s_ease-out]"
              disabled = {isLoadingLinkCreating}
              >
                {isLoadingLinkCreating ? (
                  <Loader size={20} color='#ffffff'/>
                ):(
                  "Create Link"
                )}
              </button>
            </form>

            {/* Display newly created link (below form) */}
            <div>
              {link ? (
                <div className="mt-4">
                  {link.shortenedURL ? (
                    <div className='flex justify-between items-center'>
                      <div className='flex-col'>
                        <Link to={link.shortenedURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline"> {`${API_BASE_URL}/${link.slug}`}</Link>
                        <div className="text-sm text-gray-500">Original: {link.originalUrl}</div>
                      </div>
                      <button 
                        type='button'
                        className="btn-press shrink-0 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50"
                        onClick={() => {
                          navigator.clipboard.writeText(link.shortenedURL);
                        }}
                      >
                      copy
                      </button> {/* Add actual copy functionality here */}
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">Created link is missing a URL</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Links List */}
          {/* Removed w-full md:w-1/2 here as its parent controls the width */}
          <div className="bg-white p-4 shadow rounded flex-1 flex flex-col min-h-0">
            <label className="font-bold text-indigo-600 mb-2">Your Links</label>
            {/* <div className='overflow-y-auto pr-2 space-y-2 max-h-full'> */}
            <div className={`flex-1 overflow-y-auto pr-2 space-y-2 ${ link ? "min-h-54" : "min-h-69" }`}>
            {isLoadingLinks ? (
              <Loader size={40} color="#ffffff" />
              ) : (
              <>
                {links.length === 0 && (
                  <div className="text-sm text-gray-500">No links yet</div>
                )}

                {links.map((l) => (
                  <ShortenedLinkEditStatsComponent
                    key={l.id ?? l.slug ?? JSON.stringify(l)}
                    linkId={l.id}
                    ShortenedURL={
                      l.shortenedURL ??
                      (l.slug ? `${window.location.protocol}//${window.location.host}/${l.slug}` : "")
                    }
                    originalUrl={l.originalUrl}
                    totalClicks={l.totalClicks}
                    createdOn={l.createdOn}
                    onClick={handleEditClick}
                  />
                ))}
              </>
            )}
            </div>
          </div>

        </div> {/* End of Left Side Column */}

        {/* Analytic Right Side (takes full width on small, half on medium+) */}
        <div className="overflow-y-auto max-h-161 bg-amber-50 w-full md:w-1/2 p-4 border-l">
          {/* CRITICAL FIX: Check if selectedLink is null to control display */}
          { !selectedLink ? ( // <-- THIS IS THE CORRECT CONDITION!
            <div className="text-center text-gray-500 mt-10">
              <p>Click a link to see analytics</p>
            </div>
          ) : (
            // ELSE (selectedLink has data)
            <div className='flex flex-col'>
              <h2 className="text-xl font-bold mb-4">Link Analytics</h2>
              <div><Link className='hover:text-cyan-600 text-cyan-700'><strong className='text-black'>Original:</strong> {selectedLink.originalUrl}</Link></div>
              {/* Correct template literal (this was already okay) */}
              <div><Link className='hover:text-cyan-600 text-cyan-700' to={`${API_BASE_URL}/${selectedLink.slug}`}><strong className='text-black'>Shortened:</strong> {`http://localhost:3000/${selectedLink.slug}`}</Link></div>

              {/* slug */}
              <div className="flex items-center gap-3">
                <strong>Slug:</strong>
                {/* slug change form */}
                <form onSubmit={handleSave} method='PATCH' className='flex gap-3'>
                  <input
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm"
                    name="newSlug"
                    placeholder={'edit slug: ' + selectedLink.slug}
                  />
                  <button
                    type="submit"
                    className="btn-press shrink-0 bg-white border border-gray-300 text-gray-700 px-2 py-0.25 rounded text-sm font-medium hover:bg-gray-50"
                  >
                    edit
                  </button>
                </form>
              </div>
              <p><strong>Total Clicks:</strong> {selectedLink.totalClicks}</p>
              {/* Correct handling of Date objects */}
              <p><strong>Created On:</strong> {new Date(selectedLink.createdOn).toLocaleDateString()}</p>

              {/* FIX: Handle nullable LastClickedOn gracefully */}
              <p><strong>Last Clicked On:</strong>
                 {selectedLink.lastClickedOn
                    ? new Date(selectedLink.lastClickedOn).toLocaleDateString()
                    : " Never"} {/* Added " Never" for better display */}
              </p>
                  <button
                    onClick={handleDelete}
                    className=" flex self-end bg-red-700 text-white font-bold px-1.5 rounded border-gray-600 border-2"
                  >
                    Delete
                  </button>
              <hr></hr>
                <ClickedAnalyticDisplayComponent 
                  linkInfo = {selectedLink}         // This is your `selectedLink` from the parent
                  analyticsData = {ClickedAnalyticLinkInfo}
                />
            </div>
          )}
        </div>
      </div> {/* End of main Content */}
    </div>
  )
}

export default DashboardPage;
