import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
import { useState, useEffect } from 'react';
import Loader from '../components/LoaderComponent';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function createAccount(e){
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    const Username = formData.get("Username");
    const Email = formData.get("Email");
    const Password = formData.get("Password");
    const ConfirmPassword = formData.get("ConfirmPassword");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    if (Password !== ConfirmPassword){
      alert("passwords not the same");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/createAccount`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          Username: Username,
          Email: Email,
          Password: Password,
        }),
      });
    
      const data = await res.json();

      if (!res.ok) {
        // backend error message (e.g., "Username or Email already in use.")
        const message = data?.message || "Something went wrong.";
        // optionally store it in state to display in the UI
        setError(message);
        // and throw with a proper message
        throw new Error(message);
      }

      alert(data.message || "Account created successfully.");
      e.target.reset(); 
    } catch (err) {
    console.error(err);
    // Use the error message from the thrown Error
    alert(err.message || "An unexpected error occurred.");
    } finally{
      setIsLoading(false)
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
          <form onSubmit={createAccount} method='POST' className='flex flex-col gap-2'  >
            {/* Username */}
            <div className='flex flex-col'>
            <label className='text-gray-700'>Username</label>
            <input
            name='Username'
            required
            placeholder='Alex'
            className='shadow rounded p-2'
            />
            </div>
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
            {/*re-type password */}
            <div className='flex flex-col'>
            <label className='text-gray-700'>Verify Password</label>
            <input
            name='ConfirmPassword'
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
            className='btn-press p-2 bg-indigo-600 rounded hover:bg-indigo-500 text-white'
            >
              {isLoading ? (
                  <Loader size={18} color="#ffffff" />
                ) : (
                  "Create Account"
                )}
            </button>
            <div>Already have an Account?<Link to="/login" className='text-indigo-400'> Login/Sign up</Link></div>
              
          </form>
        </div>
      </main>
    </div>
  )
}

export default CreateAccountPage