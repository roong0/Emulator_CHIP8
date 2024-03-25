import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Vite + React</h1>
      <p>https://tobiasvl.github.io/blog/write-a-chip-8-emulator/</p>
      <p>http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#2.2</p>
    </>
  )
}

export default App
