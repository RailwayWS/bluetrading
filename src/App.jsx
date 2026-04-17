import { Routes, Route } from 'react-router-dom'
import Hero from './components/Hero/hero'
import Products from './components/Products/products'
import Details from './components/Details/details'
import './App.css'

function HomePage() {
  return (
    <>
      <Hero />
      <Products />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<Details />} />
      </Routes>
    </div>
  )
}

export default App
