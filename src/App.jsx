import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import PlanTrip from './pages/PlanTrip'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import RecentTrips from './pages/RecentTrips'
import SharedTrip from './pages/SharedTrip'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/shared/:shareId" element={<SharedTrip />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/recent-trips" element={
        <ProtectedRoute>
          <RecentTrips />
        </ProtectedRoute>
      } />
      <Route path='/result' element={
        <ProtectedRoute>
          <PlanTrip />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App
