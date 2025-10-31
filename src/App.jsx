import { useState } from 'react'
import './App.css'
import Header from './assets/components/Header'
import SideBar from './assets/components/SideBar'

// import Home from 'src/assets/components/Home/Home.jsx'
import Home from './pages/Home'
import Colaboradores from './pages/Colaboradores'
import Tarefas from './pages/Tarefas'
import Alimentos from './pages/Alimentos'
import Gastronomia from './pages/Gastronomia'
import Xml from './pages/Xml'
import Estoque from './pages/Estoque'
import Login from './pages/Login.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'colaboradores':
        return <Colaboradores />
      case 'tarefas':
        return <Tarefas />
      case 'alimentos':
        return <Alimentos />
      case 'gastronomia':
        return <Gastronomia />
      case 'xml':
        return <Xml />
      case 'estoque':
        return <Estoque />
      case 'home':
      default:
        return <Home />
    }
  }

  if (sessionStorage.getItem("userEmail")) {
    return (
      <div>
        <Header />

        <div style={{ display: 'flex' }}>
          <SideBar onNavigate={(key) => setCurrentPage(key)} />
          <div style={{ flex: 1, padding: 20, paddingTop: 0 }}>
            {renderPage()}
          </div>
        </div>

      </div>
    )
  } else {
    return (
      <Login />
    )
  }

}

export default App
