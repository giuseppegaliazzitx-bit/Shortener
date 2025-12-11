import React from 'react'
import { Link } from 'react-router-dom'

const ShortenedLinkEditStatsComponenet = ({ShortenedURL, linkId, onClick}) => {
  return (
    <div>
      <div className="p-2 border rounded mb-2 flex justify-between">
        <a href={ShortenedURL} target="_blank" rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 break-all">
          {ShortenedURL}
        </a>
        {/* Copy Button */}
        {/* Edit/Stats Button*/}
        <div className='flex gap-10'>
          <button 
            type='button'
            className="btn-press shrink-0 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50"
            onClick={() => {
              navigator.clipboard.writeText(ShortenedURL);
            }}
          >
          copy
          </button>
          <button 
            onClick={() => onClick(linkId)}
            className="btn-press shrink-0 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50"
          >
            Edit/Statistics
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShortenedLinkEditStatsComponenet