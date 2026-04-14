import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Download, Loader2, Table as TableIcon, 
  Search, MapPin, Lock, ShieldCheck, 
  TrendingUp, Users, CheckCircle2, MessageSquare,
  BarChart3, Clock, Truck, User, ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import InputField from '../components/InputField';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_PASSKEY = 'DeliverIt@Admin';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('All');
  
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [date, isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/dashboard?date=${date}`);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (passkey === ADMIN_PASSKEY) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passkey. Access denied.');
    }
  };

  const formatWhatsAppMessage = (record) => {
    const message = `*Entry Details:*
📅 Date: ${new Date(record.timestamp).toLocaleDateString('en-GB')}
🏢 Vendor: ${record.vendor}
🚛 Vehicle: ${record.vehicleNumber}
👤 Driver: ${record.driverName}
📱 Mobile: ${record.mobileNumber}
🎫 Pass: ${record.entryPass}
⚡ DCD: ${record.dcdStatus}
🕒 Time: ${new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return encodeURIComponent(message);
  };

  const sendWhatsApp = (record) => {
    const encoded = formatWhatsAppMessage(record);
    const phone = dashboardData?.whatsappNumber || '917982892220';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const exportToExcel = () => {
    if (!dashboardData?.records) return;
    const tableData = dashboardData.records.map(r => ({
      'Vendor': r.vendor,
      'Vehicle Number': r.vehicleNumber,
      'Driver Name': r.driverName,
      'Mobile': r.mobileNumber,
      'Entry Pass': r.entryPass,
      'DCD Status': r.dcdStatus,
      'Vehicle Type': r.vehicleType,
      'Distance (m)': r.distanceFromOffice,
      'Date': r.date,
      'Time': new Date(r.timestamp).toLocaleTimeString()
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `DeliverIt_Attendance_${date}.xlsx`);
  };

  const filteredRecords = dashboardData?.records?.filter(r => {
    const matchesSearch = r.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = vendorFilter === 'All' || r.vendor === vendorFilter;
    return matchesSearch && matchesVendor;
  }) || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm glass-card p-10 space-y-8 fade-in-up">
          <header className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-950 text-white rounded-2xl shadow-premium mb-2">
              <Lock size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Access</h2>
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Passkey Required</p>
          </header>

          <form onSubmit={handleAuth} className="space-y-6">
            <InputField
              label="Enter Passkey"
              icon={ShieldCheck}
              type="password"
              placeholder="••••••••"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              error={authError}
            />
            <button type="submit" className="btn-premium w-full">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 fade-in-up bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
              <TrendingUp size={14} />
              Operational Insights
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Admin <span className="text-gradient">Center</span>
            </h1>
            <p className="text-slate-500 font-medium">Real-time driver entry overview & statistics</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input
                type="date"
                className="input-premium pl-12 py-3 text-sm w-48 font-bold"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button
              onClick={exportToExcel}
              disabled={loading || !dashboardData?.records?.length}
              className="btn-premium py-3 px-8 shadow-xl flex items-center gap-2 text-sm glow-on-hover"
            >
              <Download size={18} strokeWidth={2.5} />
              Export Excel
            </button>
          </div>
        </header>

        {loading && !dashboardData ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
             <Loader2 className="animate-spin text-slate-300" size={60} strokeWidth={3} />
             <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aggregating Data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Entries', value: dashboardData?.totalEntries || 0, icon: BarChart3, color: 'indigo' },
                { label: `Entries (${date})`, value: dashboardData?.todayEntriesCount || 0, icon: Clock, color: 'blue' },
                { label: 'Pass Issued', value: dashboardData?.passCount || 0, icon: CheckCircle2, color: 'emerald' },
                { label: 'DCD Verified', value: dashboardData?.dcdCount || 0, icon: MessageSquare, color: 'amber' }
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-default">
                  <div className={`p-4 bg-${stat.color}-100 text-${stat.color}-600 rounded-2xl shadow-inner`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-tight">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Vendor Stats & Last Entry */}
              <div className="space-y-10">
                {/* Vendor Summary Cards */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <Truck size={14} /> Vendor Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {dashboardData?.vendorSummary?.map((v, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <span className="text-sm font-bold text-slate-700">{v.vendor}</span>
                        <span className="bg-slate-950 text-white text-[10px] font-black px-2 py-1 rounded-lg tabular-nums">{v.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Entry Profile */}
                {dashboardData?.lastEntry && (
                  <div className="glass-card overflow-hidden bg-slate-900 border-none">
                    <div className="p-6 bg-indigo-600">
                      <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Latest Activity
                      </h3>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Driver Name</p>
                          <h4 className="text-xl font-black text-white">{dashboardData.lastEntry.driverName}</h4>
                        </div>
                        <button 
                          onClick={() => sendWhatsApp(dashboardData.lastEntry)}
                          className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-green-500/20"
                        >
                          <MessageSquare size={22} fill="currentColor" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Vehicle Number</p>
                          <p className="text-slate-200 font-mono font-bold tracking-wider">{dashboardData.lastEntry.vehicleNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Vendor</p>
                          <p className="text-slate-200 font-bold">{dashboardData.lastEntry.vendor}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Time</p>
                          <p className="text-slate-200 font-bold uppercase tabular-nums">
                            {new Date(dashboardData.lastEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                         <div>
                          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Type</p>
                          <p className="text-slate-200 font-bold tabular-nums">{dashboardData.lastEntry.vehicleType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Detailed Table View */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Search Vehicle or Driver..."
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-500 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500/20 min-w-[140px]"
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                  >
                    <option value="All">All Vendors</option>
                    {dashboardData?.vendorSummary?.map((v, i) => (
                      <option key={i} value={v.vendor}>{v.vendor}</option>
                    ))}
                  </select>
                </div>

                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="p-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">Vehicle & Driver</th>
                          <th className="p-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">Status</th>
                          <th className="p-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="p-20 text-center text-slate-300">
                               <Users size={40} className="mx-auto mb-3 opacity-20" />
                               <p className="text-sm font-bold">No entries found for this criteria.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="p-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                    <Truck size={18} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900">{r.vehicleNumber}</p>
                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
                                      {r.driverName} <span className="opacity-20">•</span> {r.vendor}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 space-y-2">
                                <div className="flex gap-2">
                                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${r.entryPass === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    Pass: {r.entryPass}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${r.dcdStatus === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    DCD: {r.dcdStatus}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 tabular-nums">
                                  <Clock size={12} /> {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="p-5 text-right">
                                <button 
                                  onClick={() => sendWhatsApp(r)}
                                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm"
                                  title="Send to WhatsApp"
                                >
                                  <MessageSquare size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
