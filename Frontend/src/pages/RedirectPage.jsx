// frontend/src/pages/RedirectPage.jsx
import React, { useEffect, useState , useRef} from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../components/LoaderComponent";

const RedirectPage = () => {
  const { linkId } = useParams(); // matches route /:linkId
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const effectRan = useRef(false);

  useEffect(() => {
    if (!linkId) return;

    if (effectRan.current === true) {
      return; 
    }

    effectRan.current = true;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5163/${linkId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        if (!data.url) {
          throw new Error("Invalid response from server");
        }

        // Now actually redirect the browser
        window.location.replace(data.url);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally{
        setIsLoading(false);
      }
    })();
  }, [linkId]);
  
  return (
    <div className="flex min-h-screen justify-center items-center bg-slate-900 text-white">
      {isLoading ? (
        <Loader size={100} color="#ffffff" />
      ) : error ? (
        <div className="text-center flex flex-col">
          <p className="mb-2 font-semibold">Oops, something went wrong:</p>
          <Link to={"/"} className="bg-white text-black  p-2 btn-press border border-gray-400 hover:bg-gray-50">Home Page</Link>
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <span>Redirecting...</span>
      )}
    </div>
  );
};
export default RedirectPage
