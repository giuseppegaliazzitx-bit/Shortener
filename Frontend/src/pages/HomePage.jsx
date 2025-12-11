// Frontend/src/pages/HomePage.jsx
import { Link, useNavigate} from 'react-router-dom';
import { useState, useEffect} from 'react';
import Loader from '../components/LoaderComponent.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null); // State to hold error messages
  const [isLoading, setIsLoading] = useState(false); // State for isLindicator
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  //if token exist auto move them to dashboard
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);


  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true); // Indicate isLstate

    const formData = new FormData(e.currentTarget);
    const originalUrl = formData.get("OriginalUrl"); // Use camelCase for consistency
    const customSlug = formData.get("CustomSlug")?.toString().trim() || null;
    try {
      const res = await fetch(`${API_BASE_URL}/link/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: originalUrl, // Match backend property name (likely camelCase in C# DTO)
          customSlug: customSlug,
        }),
      });
      
      const data = await res.json();
      

      if (!res.ok) {
        alert(data.messsage);
        setError(data.messsage);
        throw new Error();
      }
      const shortenedURL = `${window.location.origin}/${data.slug}`;

      // store the created link (include shortenedURL)
      setLink({
        shortenedURL: shortenedURL,
        originalUrl: data.originalUrl,
        slug: data.slug
      });
      // Optionally clear the form fields after successful submission
      e.target.reset(); 
      
    } catch (err) {
      console.error("Error creating link:", err);
      alert(error)
      setLink(null); // Clear any previously displayed link on error
    } finally {
      setIsLoading(false); // Always stop isL whether success or failure
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- Navbar --- */}
      <nav className="w-full bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
        <div className="text-xl font-bold text-indigo-600">
          LinkShortener
        </div>

        <Link 
          to="/login" 
          className="btn-press bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Login / Sign-Up
        </Link>
      </nav>

      {/* --- Main Content --- */}
      <main className="grow flex flex-col items-center justify-center p-6">
        
        {/* Container */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start justify-center">

          {/* The Form Section */}
          <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shorten a new link</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                <input 
                  name="OriginalUrl" 
                  type="url"
                  required
                  placeholder="https://www.example.com/very-long-url" 
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                />
              </div>

              {/* Slug Input Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Slug <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm select-none">
                    {window.location.host}/
                  </span>
                  <input 
                    name="CustomSlug" 
                    placeholder="summer-sale" 
                    className="block w-full rounded-r-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className=" btn-press flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
              >
                {isLoading ? (
                  <Loader size={18} color="#ffffff" />
                ) : (
                  "Create Link"
                )}
              </button>
            </form>

            {/* Display newly created link (below form) */}
            <div className="mt-6">
              {link && link.shortenedURL ? (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="overflow-hidden">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Success!</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Link 
                        to={link.shortenedURL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 font-bold text-lg hover:underline truncate"
                      >
                        {link.shortenedURL}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                      Original: {link.originalUrl}
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(link.shortenedURL);
                    }}
                    className="btn-press shrink-0 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage;
