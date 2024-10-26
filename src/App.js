
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; 
import TicketDetails from './TicketDetails';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ticket/:id" element={<TicketDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
