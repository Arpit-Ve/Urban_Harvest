import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AttendanceForm from './pages/AttendanceForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* Simple Floating Navigation */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 px-8 py-3 rounded-full shadow-2xl z-50 flex items-center gap-8">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Entry Form</Link>
          <div className="w-px h-4 bg-slate-200" />
          <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Admin Dashboard</Link>
        </nav>

        <Routes>
          <Route path="/" element={<AttendanceForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
