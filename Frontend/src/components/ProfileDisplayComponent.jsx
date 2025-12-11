//frontend/src/components/ProfileDisplayComponent.jsx
import React from 'react'
import Loader from './LoaderComponent'

const ProfileDisplayComponent = ({ user,
  isDeleting,
  imageLoaded,
  imageError,
  setImageLoaded,
  setImageError,
  setIsEditing,
  handleLogout,
  handleDelete}) => {
  return (
    <div className="shadow bg-white rounded border-t-4 border-indigo-600 p-10 flex flex-col gap-8 w-full max-w-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <button
          className="text-sm text-indigo-600 hover:underline bg-white border-2 border-gray-300 px-3 rounded btn-press py-1"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
      </div>

      <div className="flex justify-center">
        <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
          {!imageLoaded && !imageError && <span>Img</span>}
          {imageError && <span>Img</span>}
          <img
            src={user.userPfpUrl}
            alt="Profile"
            className={`h-full w-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-gray-700">
          <strong className="font-semibold">User: </strong>
          {user.username}
        </p>
        <p className="text-gray-700">
          <strong className="font-semibold">Email: </strong>
          {user.email}
        </p>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 mt-4"
        >
          Logout
        </button>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 mt-4"
        >
          {isDeleting ? <Loader size={18} color="#ffffff" /> : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}

export default ProfileDisplayComponent