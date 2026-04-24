import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Form, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import PlanTrip from './pages/PlanTrip'

function App() {


  return (
<Routes>
  <Route path='/' element={<Home></Home>}> </Route>
  <Route path='/result' element={<PlanTrip></PlanTrip>}> </Route>
</Routes>
  )
}

export default App
