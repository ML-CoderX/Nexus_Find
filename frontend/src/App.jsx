import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
