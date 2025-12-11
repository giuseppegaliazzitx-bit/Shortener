// Frontend/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage.jsx'
import HomePage from './pages/HomePage.jsx'
import RedirectPage from './pages/RedirectPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CreateAccountPage from './pages/CreateAccountPage.jsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/:linkId' element={<RedirectPage />} />
        <Route path='/login' element={<LoginPage />} /> 
        <Route path='/register' element={<CreateAccountPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
