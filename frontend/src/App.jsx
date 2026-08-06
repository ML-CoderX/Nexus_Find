import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import ReportItem from './pages/ReportItem';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/report" element={<ReportItem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
