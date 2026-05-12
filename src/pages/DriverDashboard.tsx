import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, MapPin, Navigation, DollarSign, Star, TrendingUp, Bell, MessageSquare, Menu, X, Check, XCircle } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { DriverDataContext } from '../context/DriverContext';
import axios from 'axios';
import { toast } from 'sonner';
import { initializeSocket, receiveMessage, sendMessage } from '../services/socketService';

const DriverDashboard = () => {
    const { driver } = useContext(DriverDataContext);
    const [ isOnline, setIsOnline ] = useState(false);
    const [ currentRideRequest, setCurrentRideRequest ] = useState<any>(null);
    const [ activeRide, setActiveRide ] = useState<any>(null);
    const [ otp, setOtp ] = useState('');

    useEffect(() => {
        if (driver?._id) {
            initializeSocket(driver._id);

            receiveMessage('new-ride-request', (data) => {
                if (isOnline && !currentRideRequest && !activeRide) {
                    setCurrentRideRequest(data);
                    toast.info("New ride request received!");
                }
            });
        }
    }, [driver, isOnline, currentRideRequest, activeRide]);

    useEffect(() => {
        let locationInterval: any;
        if (isOnline && activeRide) {
            locationInterval = setInterval(() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        sendMessage('update-location', {
                            rideId: activeRide.id,
                            driverId: driver?._id,
                            coords: [pos.coords.latitude, pos.coords.longitude]
                        });
                    });
                }
            }, 3000);
        }
        return () => clearInterval(locationInterval);
    }, [isOnline, activeRide, driver]);

    const acceptRide = () => {
        sendMessage('accept-ride', {
            driverId: driver?._id,
            driver: driver,
            userSocketId: currentRideRequest.socketId,
            rideId: currentRideRequest.id || 'RIDE_' + Date.now()
        });
        setActiveRide(currentRideRequest);
        setCurrentRideRequest(null);
        toast.success("Ride accepted. Head to pickup location.");
    };

    const rejectRide = () => {
        setCurrentRideRequest(null);
        toast.error("Ride request rejected.");
    };

    const completeRide = () => {
        setActiveRide(null);
        toast.success("Ride completed! Payment received.");
    };

    return (
        <div className="h-screen w-full relative overflow-hidden bg-slate-50">
            <header className="absolute top-0 left-0 right-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 font-bold text-white text-xl">Y</div>
                    <span className="text-20 font-black text-slate-800 tracking-tight hidden sm:block uppercase">Captain</span>
                </div>
                
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="hidden sm:flex items-center gap-6 px-6 py-2 rounded-full border border-slate-200 bg-white shadow-xl shadow-slate-200/50 backdrop-blur-md">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Earnings</span>
                            <span className="font-mono font-bold text-emerald-600">$342.80</span>
                        </div>
                        <div className="w-px h-6 bg-slate-100"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                            <span className="font-mono font-bold text-amber-500">4.92 ★</span>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <div 
                        onClick={() => setIsOnline(!isOnline)}
                        className={`group flex items-center gap-3 px-4 py-2 rounded-full border cursor-pointer transition-all shadow-sm ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}
                    >
                        <Power className={`w-4 h-4 ${isOnline ? 'animate-pulse' : ''}`} />
                        <span className="text-xs font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </header>

            <div className="absolute inset-0 z-0">
                <MapComponent />
            </div>

            <AnimatePresence>
                {currentRideRequest && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="absolute inset-0 z-50 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-sm glass-card border-emerald-500/20 overflow-hidden shadow-3xl">
                            <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Incoming Request</span>
                                <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full animate-pulse font-bold">New</span>
                            </div>
                            <div className="p-8 bg-white">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl border border-slate-100">👤</div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-xl uppercase leading-none">{currentRideRequest.user.name}</h3>
                                        <div className="flex items-center gap-2 text-amber-500 text-xs mt-1">
                                            <Star className="w-3 h-3 fill-amber-500" />
                                            <span className="font-bold">{currentRideRequest.user.rating} Agent Rating</span>
                                        </div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fare</p>
                                        <p className="text-xl font-black text-emerald-600 leading-none">${currentRideRequest.fare.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 text-left">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                            <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>
                                            <div className="w-2.5 h-2.5 rounded shadow-[0_0_0_4px_rgba(37,99,235,0.05)] bg-blue-600"></div>
                                        </div>
                                        <div className="flex-1 space-y-4 pb-2">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pickup</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{currentRideRequest.pickup}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{currentRideRequest.destination}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={rejectRide} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-sm">Ignore</button>
                                    <button onClick={acceptRide} className="flex-1 primary-button shadow-blue-500/20 text-sm !py-4 uppercase font-black">Accept Ride</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeRide && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="absolute bottom-6 left-6 right-6 z-40 glass-card rounded-[32px] border-slate-100 shadow-3xl p-8 max-w-4xl mx-auto"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 w-full text-left">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 rounded-2xl border-2 border-emerald-100 p-1 bg-emerald-50 shadow-sm">
                                        <div className="h-full w-full rounded-xl bg-white flex items-center justify-center text-2xl">👤</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ongoing Trip</p>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">{activeRide.user.name}</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-1 truncate max-w-xs">{activeRide.destination}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-72 flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="OTP" 
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 !rounded-2xl p-4 text-center text-xl font-black tracking-[0.2em] focus:border-blue-500/50 outline-none transition-all shadow-sm"
                                    />
                                    {otp.length === 6 && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />}
                                </div>
                                <button 
                                    onClick={completeRide}
                                    className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl transition-all ${otp.length === 6 ? 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/40 opacity-100 scale-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 scale-95'}`}
                                    disabled={otp.length !== 6}
                                >
                                    Finish
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOnline && (
                <div className="absolute inset-0 z-20 bg-white/20 backdrop-blur-md flex items-center justify-center p-6 pointer-events-none">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center pointer-events-auto glass-card shadow-3xl p-12 border-slate-100 flex flex-col items-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                            <Power className="w-10 h-10 text-rose-500" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">You are Offline</h2>
                        <p className="text-slate-500 font-medium mb-8">Go online to start receiving ride requests</p>
                        <button 
                            onClick={() => setIsOnline(true)}
                            className="px-12 py-5 primary-button shadow-blue-500/30 scale-110"
                        >
                            Go Online
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
