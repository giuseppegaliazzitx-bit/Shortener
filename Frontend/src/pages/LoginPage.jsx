import React from 'react'
import Loader from '../components/LoaderComponent'
import { useState ,useEffect } from 'react'
import { Link, useNavigate} from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading ] = useState(false);
  const [error, setError] = useState(null); 
  
  const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function Login(e){
    e.preventDefault()
    const formData = new FormData(e.currentTarget); 
    const Email = formData.get("Email");
    const Password = formData.get("Password");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    setError(null);
    setIsLoading(true);
    //send login information
    try{
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email,
          Password,
        }),
      });
    
      const data = await res.json();

      //if somethign went wrong read message
      if(!res.ok){
        const message = data?.message || "Something went wrong.";
        navigate("/404")
        // optionally set state for UI display
        setError?.(message);
        throw new Error(message);
      }

      if (!data.token) {
        alert("No token received from server.");
        return;
      }

      // 1) Store token (example: localStorage)
      localStorage.setItem("authToken", data.token);
      
      //redirect to page
      window.location.replace(`${APP_BASE_URL}/dashboard`);

    }catch(err){
      console.error(err);
      // show the actual error message from the caught Error
      alert(err?.message || "An unexpected error occurred.");
    } finally{
      setIsLoading(false);
    }
  }
  return (
    <div>
      <nav className="w-full bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
        {/* Logo Placeholder */}
        <div className="text-xl font-bold text-indigo-600">
          LinkShortener
        </div>
      </nav>
      
      {/*Login/Sign In*/}
      <main className='flex flex-grow flex-col items-center justify-center p-10'>
        {/* LOGIN-SIGNIN */}
        <div className='shadow rounded-2xl flex flex-col gap-5 p-10'>
          {/* title */}
          <h2 className='text-lg font-bold text-indigo-600'>Login/Sign in</h2>
          {/* email + pass form*/}
          <form onSubmit={Login} method='POST' className='flex flex-col gap-2'  >
            {/* email */}
            <div className='flex flex-col'>
              <label className='text-gray-700'>Email</label>
              <input
              name='Email'
              type='email'
              required
              placeholder='123@gmail.com'
              className='shadow rounded p-2'
              />
            </div>

            {/* password */}
            <div className='flex flex-col'>
            <label className='text-gray-700'>Password</label>
            <input
            name='Password'
            type='password'
            required
            placeholder='supersecretpassword'
            className='shadow rounded p-2'
            />
            </div>

            {/* Login/SignIn */}
            <button 
            type='submit' 
            disabled={isLoading}
            className=' items-center  flex justify-center btn-press p-2 bg-indigo-600 rounded hover:bg-indigo-500 text-white'
            >
              {isLoading ? (
                <Loader size={20} color='#ffffff'/>
              ):(
                "Login"
              )}
            </button>
            <div>Don't have an account?<Link to="/register" className='text-indigo-400'> Create account.</Link></div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default LoginPage