import { Outlet } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <div className="viewport">
      <Header />
      <div className="container">
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default App;
