import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, User, Phone, MapPin, Receipt, Send, Loader2, MessageSquare, X, CheckCircle2 } from 'lucide-react';
import InputField from '../components/InputField';
import Dropdown from '../components/Dropdown';
import StatusMessage from '../components/StatusMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AttendanceForm = () => {
  const [vendors, setVendors] = useState(['SKT', 'Blue Wheel', 'Riya', 'Nagar', 'Pooja', 'ERN']);
  const [formData, setFormData] = useState({
    vendor: '',
    vehicleNumber: '',
    driverName: '',
    mobileNumber: '',
    entryPass: '',
    dcdStatus: '',
    vehicleType: '',
  });
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Checking location...');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);

  useEffect(() => {
    fetchVendors();
    requestLocation();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/vendors`);
      setVendors(data.map(v => v.name));
    } catch (err) {
      console.error('Failed to fetch vendors');
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('Location fetched successfully');
      },
      (err) => {
        setLocationStatus('Location access denied');
      }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.driverName) newErrors.driverName = 'Driver name is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.entryPass) newErrors.entryPass = 'Entry pass status is required';
    if (!formData.dcdStatus) newErrors.dcdStatus = 'DCD status is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    

    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
        newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!location) {
      setStatus({ type: 'error', message: 'Location not fetched. Please allow location access.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/attendance`, {
        ...formData,
        location
      });
      setStatus({ type: 'success', message: response.data.message });
      setLastSubmittedData(response.data);
      setShowWhatsAppModal(true);
      setFormData({ vendor: '', vehicleNumber: '', driverName: '', mobileNumber: '', entryPass: '', dcdStatus: '', vehicleType: '' });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSend = () => {
    if (!lastSubmittedData) return;
    const { data, whatsappNumber } = lastSubmittedData;
    
    const message = `*Entry Details:*
📅 Date: ${new Date(data.timestamp).toLocaleDateString('en-GB')}
🏢 Vendor: ${data.vendor}
🚛 Vehicle: ${data.vehicleNumber}
👤 Driver: ${data.driverName}
📱 Mobile: ${data.mobileNumber}
🎫 Pass: ${data.entryPass}
⚡ DCD: ${data.dcdStatus}
🕒 Time: ${new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
    setShowWhatsAppModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 relative">
      {/* WhatsApp Confirmation Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden scale-in">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare size={40} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Send to WhatsApp?</h3>
                <p className="text-slate-500 text-sm font-medium px-4">Would you like to send this entry confirmation to the admin via WhatsApp?</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleWhatsAppSend}
                  className="btn-premium bg-green-500 hover:bg-green-600 shadow-green-200 py-4 flex items-center justify-center gap-3"
                >
                  <MessageSquare size={20} />
                  Send Now
                </button>
                <button 
                  onClick={() => setShowWhatsAppModal(false)}
                  className="py-3 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md glass-card p-8 sm:p-10 space-y-10 fade-in-up">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-950 text-white rounded-2xl shadow-premium mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Truck size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 text-gradient">
            DeliverIt
          </h1>
          <p className="text-slate-500 font-semibold text-sm tracking-wide uppercase">Vehicle Entry Form</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="fade-in-up stagger-1 space-y-6">
            <Dropdown
              label="Vendor Name"
              icon={Truck}
              placeholder="Select Vendor"
              options={vendors}
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              error={errors.vendor}
            />

            <InputField
              label="Vehicle Number"
              icon={Receipt}
              placeholder="HR-55-AB-1234"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              error={errors.vehicleNumber}
            />
          </div>

          <div className="fade-in-up stagger-2 space-y-6">
            <InputField
              label="Driver Name"
              icon={User}
              placeholder="Full Name"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              error={errors.driverName}
            />

            <InputField
              label="Mobile Number"
              icon={Phone}
              placeholder="10-digit number"
              type="tel"
              maxLength="10"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              error={errors.mobileNumber}
            />
          </div>

          <div className="fade-in-up stagger-3 space-y-6">
            <Dropdown
              label="Entry Pass Available"
              icon={MapPin}
              placeholder="Select Status"
              options={['Yes', 'No']}
              value={formData.entryPass}
              onChange={(e) => setFormData({ ...formData, entryPass: e.target.value })}
              error={errors.entryPass}
            />

            <Dropdown
              label="DCD & NON DCD Status"
              icon={Receipt}
              placeholder="Select Status"
              options={['Yes', 'No']}
              value={formData.dcdStatus}
              onChange={(e) => setFormData({ ...formData, dcdStatus: e.target.value })}
              error={errors.dcdStatus}
            />

            <Dropdown
              label="Vehicle Type"
              icon={Truck}
              placeholder="Select Type"
              options={['TATA Ace', 'Bolero', 'Super Carry', 'Eeco', 'L5']}
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              error={errors.vehicleType}
            />

            <div className="flex items-center gap-3 py-2 px-1">
               <div className="relative flex">
                 <div className={`w-3 h-3 rounded-full ${location ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                 <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${location ? 'bg-green-400' : 'bg-amber-400'} opacity-75`} />
               </div>
               <span className={`text-[11px] font-bold uppercase tracking-widest ${location ? 'text-slate-600' : 'text-amber-600'}`}>
                 {locationStatus}
               </span>
            </div>

            <StatusMessage type={status.type} message={status.message} />

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} strokeWidth={3} /> : <Send size={20} strokeWidth={2.5} />}
              {loading ? 'Processing...' : 'Submit Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
