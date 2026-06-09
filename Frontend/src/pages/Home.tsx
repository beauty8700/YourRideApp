import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Navigation, History, Star, Wallet, Bell, Menu, X, Clock, ChevronUp, ChevronDown, Locate, ArrowRight, User, Settings, LogOut, Info, Gift, Zap } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { api } from '../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { initializeSocket, receiveMessage, sendMessage, stopReceivingMessage } from '../services/socketService';

const Home = () => {
    const { user } = useContext(UserDataContext);
    const navigate = useNavigate();
    const [ pickup, setPickup ] = useState('');
    const [ destination, setDestination ] = useState('');
    const [ panelOpen, setPanelOpen ] = useState(false);
    const [ vehiclePanel, setVehiclePanel ] = useState(false);
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false);
    const [ lookingForDriver, setLookingForDriver ] = useState(false);
    const [ waitingForDriver, setWaitingForDriver ] = useState(false);
    const [ assignedDriver, setAssignedDriver ] = useState<any>(null);
    const [ driverLocation, setDriverLocation ] = useState<[number, number] | undefined>(undefined);
    const [ sidebarOpen, setSidebarOpen ] = useState(false);
    const [ rideOtp, setRideOtp ] = useState<string>('');
    const [ showOtpScreen, setShowOtpScreen ] = useState(false);
    const [ noDriverFound, setNoDriverFound ] = useState(false);
    const [ selectedVehicle, setSelectedVehicle ] = useState<'bike' | 'auto' | 'mini' | 'sedan'>('mini');
    const [ currentRide, setCurrentRide ] = useState<any>(null);
    const [ estimatedDistance, setEstimatedDistance ] = useState(0);
    const [ estimatedDuration, setEstimatedDuration ] = useState(0);
    
    // Search states
    const [ suggestions, setSuggestions ] = useState<any[]>([]);
    const [ isFetchingSuggestions, setIsFetchingSuggestions ] = useState(false);
    const [ activeInputField, setActiveInputField ] = useState<'pickup' | 'destination' | null>(null);
    const [ pickupCoords, setPickupCoords ] = useState<[number, number] | undefined>(undefined);
    const [ destinationCoords, setDestinationCoords ] = useState<[number, number] | undefined>(undefined);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const toRadians = (value: number) => value * (Math.PI / 180);
    const haversineKm = (a: [number, number], b: [number, number]) => {
        const R = 6371;
        const dLat = toRadians(b[0] - a[0]);
        const dLon = toRadians(b[1] - a[1]);
        const lat1 = toRadians(a[0]);
        const lat2 = toRadians(b[0]);

        const x = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
        return R * y;
    };

    const vehicleMultiplier: Record<'bike' | 'auto' | 'mini' | 'sedan', number> = {
        bike: 0.8,
        auto: 1,
        mini: 1.3,
        sedan: 1.8
    };

    const getFareForVehicle = (vehicle: 'bike' | 'auto' | 'mini' | 'sedan') => {
        const base = 25;
        const perKm = 12;
        const fare = base + (estimatedDistance * perKm * vehicleMultiplier[vehicle]);
        return Number(fare.toFixed(2));
    };

    useEffect(() => {
        if (!pickupCoords || !destinationCoords) {
            setEstimatedDistance(0);
            setEstimatedDuration(0);
            return;
        }

        const distance = haversineKm(pickupCoords, destinationCoords);
        setEstimatedDistance(Number(distance.toFixed(2)));

        const avgCitySpeedKmPerMin = 0.5;
        setEstimatedDuration(Math.max(5, Math.round(distance / avgCitySpeedKmPerMin)));
    }, [pickupCoords, destinationCoords]);

    useEffect(() => {
        if (user?._id) {
            initializeSocket(user._id, 'user');

            const onRideAccepted = (data: any) => {
                if (currentRide?._id && data.rideId && String(data.rideId) !== String(currentRide._id)) {
                    return;
                }

                setLookingForDriver(false);
                setWaitingForDriver(true);
                setAssignedDriver(data.driver);
                toast.success(`Driver ${data.driver.fullname.firstname} is on the way!`);
            };

            const onDriverLocation = (data: any) => {
                if (currentRide?._id && data.rideId && String(data.rideId) !== String(currentRide._id)) {
                    return;
                }

                setDriverLocation(data.coords);
            };

            const onRideCancelled = (data: any) => {
                if (currentRide?._id && data.rideId && String(data.rideId) !== String(currentRide._id)) {
                    return;
                }

                toast.error(data.message || 'Ride was cancelled');
                setWaitingForDriver(false);
                setLookingForDriver(false);
                setAssignedDriver(null);
                setCurrentRide(null);
                setRideOtp('');
            };

            const onRideStarted = (data: any) => {
                if (currentRide?._id && data.rideId && String(data.rideId) !== String(currentRide._id)) {
                    return;
                }
                toast.success('Ride has started. Have a safe trip!');
            };

            const onRideCompleted = (data: any) => {
                if (currentRide?._id && data.rideId && String(data.rideId) !== String(currentRide._id)) {
                    return;
                }
                toast.success('Ride completed successfully');
                setWaitingForDriver(false);
                setAssignedDriver(null);
                setCurrentRide(null);
                setRideOtp('');
            };

            receiveMessage('ride-accepted', onRideAccepted);
            receiveMessage('driver-location-update', onDriverLocation);
            receiveMessage('ride-cancelled', onRideCancelled);
            receiveMessage('ride-started', onRideStarted);
            receiveMessage('ride-completed', onRideCompleted);

            return () => {
                stopReceivingMessage('ride-accepted', onRideAccepted);
                stopReceivingMessage('driver-location-update', onDriverLocation);
                stopReceivingMessage('ride-cancelled', onRideCancelled);
                stopReceivingMessage('ride-started', onRideStarted);
                stopReceivingMessage('ride-completed', onRideCompleted);
            };
        }
    }, [user, currentRide]);

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        
        setIsFetchingSuggestions(true);
        try {
            // Using OSM Nominatim for autocomplete suggestions
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
            setSuggestions(res.data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsFetchingSuggestions(false);
        }
    };

    const handleInputChange = (field: 'pickup' | 'destination', value: string) => {
        if (field === 'pickup') {
            setPickup(value);
            if (!value) setPickupCoords(undefined);
        } else {
            setDestination(value);
            if (!value) setDestinationCoords(undefined);
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500);
    };

    const handleSuggestionClick = (sug: any) => {
        const coords: [number, number] = [ parseFloat(sug.lat), parseFloat(sug.lon) ];
        if (activeInputField === 'pickup') {
            setPickup(sug.display_name);
            setPickupCoords(coords);
        } else {
            setDestination(sug.display_name);
            setDestinationCoords(coords);
        }
        setSuggestions([]);
        setActiveInputField(null);
        setPanelOpen(false); // Close panel after selection
    };

    const findTrip = () => {
        if (!pickupCoords || !destinationCoords) {
            toast.error("Please select both locations properly from the suggestions");
            return;
        }
        setVehiclePanel(true);
        setPanelOpen(false);
    };

    const handleCategoryClick = (cat: string) => {
        if (!pickupCoords) {
            toast.info("Please select pickup location first");
            setPanelOpen(true);
            setActiveInputField('pickup');
            return;
        }
        if (!destinationCoords) {
            toast.info("Please select destination");
            setPanelOpen(true);
            setActiveInputField('destination');
            return;
        }
        setVehiclePanel(true);
    };

    const startFindingDriver = async () => {
        if (!pickup || !destination || !pickupCoords || !destinationCoords) {
            toast.error('Pickup and destination are required');
            return;
        }

        try {
            const fare = getFareForVehicle(selectedVehicle);
            const response = await api.post('/rides/create', {
                pickup,
                destination,
                fare,
                vehicleType: selectedVehicle,
                distance: estimatedDistance,
                duration: estimatedDuration,
            });

            const ride = response.data;
            setCurrentRide(ride);
            setRideOtp(ride?.otp || '');
            setLookingForDriver(true);
            setConfirmRidePanel(false);
            setNoDriverFound(false);

            sendMessage('ride-request', {
                rideId: ride._id,
                userId: user?._id,
                user: {
                    name: `${user?.fullname?.firstname || ''} ${user?.fullname?.lastname || ''}`.trim(),
                    rating: '4.8'
                },
                pickup,
                destination,
                pickupCoords,
                destinationCoords,
                fare,
                vehicleType: selectedVehicle,
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Unable to create ride request');
        }
    };

    const cancelCurrentRide = async () => {
        if (!currentRide?._id) {
            setLookingForDriver(false);
            return;
        }

        try {
            const response = await api.post('/rides/cancel', {
                rideId: currentRide._id,
                reason: 'Cancelled from user app before pickup'
            });

            sendMessage('ride-cancelled', {
                rideId: currentRide._id,
                userId: user?._id,
                driverId: response.data?.driver,
                message: 'Rider cancelled the trip'
            });

            setLookingForDriver(false);
            setWaitingForDriver(false);
            setAssignedDriver(null);
            setCurrentRide(null);
            toast.success('Ride request cancelled');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Unable to cancel ride');
        }
    };

    const clearInput = (field: 'pickup' | 'destination') => {
        if (field === 'pickup') {
            setPickup('');
            setPickupCoords(undefined);
        } else {
            setDestination('');
            setDestinationCoords(undefined);
        }
        setSuggestions([]);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.info("Fetching your location...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setPickupCoords([latitude, longitude]);
                try {
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    setPickup(res.data.display_name || "Current Location");
                    toast.success("Location updated");
                } catch (error) {
                    setPickup("Current Location");
                }
            },
            (error) => {
                toast.error("Unable to retrieve your location");
                console.error(error);
            }
        );
    };

    return (
        <div className="h-screen w-full relative overflow-hidden bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="h-12 w-12 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center hover:scale-105 transition-all active:scale-95 border-2 border-white"
                    >
                        <Menu className="w-6 h-6 text-slate-600" />
                    </button>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/30 font-bold text-white text-2xl ml-2">Y</div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight hidden sm:block uppercase ml-2">YourRide</span>
                </div>
                
                <div className="flex items-center gap-4 pointer-events-auto">
                    <motion.div 
                        whileHover={{ y: -2 }}
                        onClick={() => navigate('/wallet')}
                        className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-xl shadow-slate-200/40 cursor-pointer"
                    >
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Balance</span>
                            <span className="font-mono font-bold text-slate-900 leading-tight">${user?.walletBalance?.toFixed(2) || '42.50'}</span>
                        </div>
                    </motion.div>
                    
                    <div className="h-12 w-12 rounded-2xl border-2 border-white bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform active:scale-95">
                        <User className="w-6 h-6 text-slate-400" />
                    </div>
                </div>
            </header>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white z-[101] shadow-2xl p-8 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <User className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none">{user?.fullname?.firstname || 'User'}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Prime Member</p>
                                    </div>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-slate-50 text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-2 flex-1">
                                {[
                                    { name: 'My Rides', icon: History, path: '/history' },
                                    { name: 'Wallet', icon: Wallet, path: '/wallet' },
                                    { name: 'Rewards', icon: Gift, path: '/rewards' },
                                    { name: 'Safety', icon: Info, path: '/safety' },
                                    { name: 'Settings', icon: Settings, path: '/settings' },
                                ].map((item) => (
                                    <button 
                                        key={item.name} 
                                        onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-blue-600 transition-all group"
                                    >
                                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        {item.name}
                                    </button>
                                ))}
                            </nav>

                            <button onClick={() => navigate('/login')} className="flex items-center gap-4 p-4 rounded-2xl text-rose-500 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all mt-auto border-t border-slate-50 pt-8">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <MapComponent 
                    pickup={pickupCoords} 
                    destination={destinationCoords} 
                    assignedDriverLocation={driverLocation}
                />
            </div>

            {/* Main Action Panel */}
            <div className={`absolute bottom-0 left-0 right-0 md:top-24 md:left-10 md:bottom-auto md:w-[420px] z-30 flex flex-col gap-4 p-4 md:p-0`}>
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="glass-card p-6 w-full shadow-2xl shadow-slate-900/5 border-white/40"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Where are you going?</h2>
                    </div>

                    <div className="relative space-y-4">
                        {/* Connecting Line */}
                        <div className="absolute left-[22px] top-10 bottom-10 w-[2px] bg-slate-100 flex flex-col justify-between py-1">
                            <div className="w-full h-1/3 bg-gradient-to-b from-blue-500 to-transparent"></div>
                            <div className="w-full h-1/3 bg-gradient-to-t from-cyan-500 to-transparent"></div>
                        </div>
                        
                        {/* Pickup Input */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <div className="h-4 w-4 rounded-full border-4 border-blue-100 bg-blue-600 shadow-lg shadow-blue-500/20"></div>
                            </div>
                            <input
                                value={pickup}
                                onChange={(e) => handleInputChange('pickup', e.target.value)}
                                onFocus={() => { setPanelOpen(true); setActiveInputField('pickup'); }}
                                className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-semibold ${activeInputField === 'pickup' ? 'border-blue-500/50 bg-white ring-4 ring-blue-50' : 'border-slate-100 focus:border-blue-500/30'}`}
                                placeholder="Pickup Location"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {pickup && (
                                    <button onClick={() => clearInput('pickup')} className="p-1.5 text-slate-400 hover:text-slate-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={useCurrentLocation}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Use Current Location"
                                >
                                    <Locate className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Destination Input */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <div className="h-4 w-4 rounded bg-cyan-600 border-4 border-cyan-100 shadow-lg shadow-cyan-500/20"></div>
                            </div>
                            <input
                                value={destination}
                                onChange={(e) => handleInputChange('destination', e.target.value)}
                                onFocus={() => { setPanelOpen(true); setActiveInputField('destination'); }}
                                className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-semibold ${activeInputField === 'destination' ? 'border-cyan-500/50 bg-white ring-4 ring-cyan-50' : 'border-slate-100 focus:border-cyan-500/30'}`}
                                placeholder="Where to?"
                            />
                            {destination && (
                                <button onClick={() => clearInput('destination')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {panelOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="pt-2"
                                >
                                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 max-h-[300px] overflow-y-auto">
                                        {isFetchingSuggestions && (
                                            <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Searching...</p>
                                            </div>
                                        )}
                                        
                                        {!isFetchingSuggestions && suggestions.length === 0 && (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                                    <Locate className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400">{activeInputField === 'pickup' ? 'Enter pickup point' : 'Enter destination'}</p>
                                            </div>
                                        )}

                                        {suggestions.map((sug: any, i: number) => (
                                            <motion.div 
                                                key={i} 
                                                whileHover={{ backgroundColor: '#F8FAFC' }}
                                                onClick={() => handleSuggestionClick(sug)}
                                                className="flex items-center gap-4 p-4 cursor-pointer border-b border-slate-50 last:border-none transition-colors"
                                            >
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                    <MapPin className={`w-5 h-5 ${activeInputField === 'pickup' ? 'text-blue-500' : 'text-cyan-500'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{sug.display_name.split(',')[0]}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 truncate">{sug.display_name}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setPanelOpen(false)}
                                        className="w-full mt-4 py-3 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                    >
                                        Close Search
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {pickupCoords && destinationCoords && !vehiclePanel && (
                        <motion.button 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={findTrip}
                            className="mt-6 w-full primary-button !py-4 shadow-blue-500/30 flex items-center justify-center gap-3 uppercase tracking-widest z-50"
                        >
                            <Search className="w-5 h-5" />
                            {panelOpen ? 'Confirm Locations' : 'Find Rides'}
                        </motion.button>
                    )}
                </motion.div>

                {/* Rapido-style Categories */}
                {!panelOpen && !vehiclePanel && !lookingForDriver && !waitingForDriver && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="glass-card p-4 grid grid-cols-3 gap-4 border-white/40">
                            {[
                                { name: 'Bike', icon: '🚲', color: 'bg-yellow-50 text-yellow-600' },
                                { name: 'Auto', icon: '🛺', color: 'bg-emerald-50 text-emerald-600' },
                                { name: 'Cab', icon: '🚗', color: 'bg-blue-50 text-blue-600' },
                            ].map((cat) => (
                                <div key={cat.name} onClick={() => handleCategoryClick(cat.name)} className="flex flex-col items-center gap-2 cursor-pointer group">
                                    <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card p-4 flex items-center gap-4 border-white/40 cursor-pointer hover:bg-white transition-colors">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                <History className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Search</p>
                                <p className="text-sm font-bold text-slate-900 truncate">Railway Station, Entrance 1</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Vehicle Selection Drawer */}
            <AnimatePresence>
                {vehiclePanel && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-white md:bg-white/95 md:backdrop-blur-2xl rounded-t-[40px] border-t border-slate-100 p-6 md:p-8 pb-12 max-w-5xl mx-auto shadow-[0_-20px_60px_rgba(0,0,0,0.12)]"
                    >
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Select your ride</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Captains nearby • 3 min away</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setVehiclePanel(false)}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Safety Banner */}
                        <div className="mb-8 p-4 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Safety First</p>
                                <p className="text-[11px] text-blue-900 font-bold leading-tight">All rides are insured and monitored for your safety.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { id: 'bike', icon: '🚲', name: 'Moto', price: getFareForVehicle('bike'), eta: '2 min', desc: 'Saves time' },
                                { id: 'auto', icon: '🛺', name: 'Auto', price: getFareForVehicle('auto'), eta: '4 min', desc: 'Pocket-friendly' },
                                { id: 'mini', icon: '🚗', name: 'Mini', price: getFareForVehicle('mini'), eta: '5 min', recommended: true, desc: 'AC Comfort' },
                                { id: 'sedan', icon: '🚘', name: 'Sedan', price: getFareForVehicle('sedan'), eta: '3 min', desc: 'Premium luxury' },
                            ].map((v) => (
                                <motion.div 
                                    key={v.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelectedVehicle(v.id as 'bike' | 'auto' | 'mini' | 'sedan');
                                        setConfirmRidePanel(true);
                                    }}
                                    className={`relative p-5 rounded-[32px] border-2 transition-all cursor-pointer group ${selectedVehicle === v.id ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/10' : 'bg-slate-50/50 border-slate-50 hover:border-slate-200 hover:bg-white'}`}
                                >
                                    {v.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-[8px] font-black uppercase text-white px-3 py-1 rounded-full whitespace-nowrap tracking-widest shadow-lg">Most popular</div>
                                    )}
                                    
                                    <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                                        <div className="text-5xl mb-2 group-hover:scale-110 transition-transform origin-left">{v.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{v.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{v.desc}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-baseline">
                                            <span className="text-sm font-black text-slate-900">$</span>
                                            <span className="text-xl font-black text-slate-900">{v.price.toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-black">{v.eta}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <div className="flex-1 flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                                    <p className="text-sm font-bold text-slate-900">Your Wallet</p>
                                </div>
                            </div>
                            <div className="flex-[2] flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="p-2 rounded-xl bg-white shadow-sm font-mono font-bold text-[10px] text-blue-600">SAVE40</div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promo Code</p>
                                    <p className="text-sm font-bold text-slate-900">40% OFF applied</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ride Confirmation Dialog */}
            <AnimatePresence>
                {confirmRidePanel && !lookingForDriver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="w-full max-md bg-white rounded-[40px] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.15)] border border-slate-100"
                        >
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                                    <Navigation className="w-10 h-10 text-blue-600 shadow-xl shadow-blue-500/20" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Confirm Booking</h3>
                                <p className="text-slate-500 text-sm font-medium">Verify your trip details before we look for drivers</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                                    <p className="text-sm font-bold text-slate-700 truncate leading-relaxed">{pickup}</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                                    <p className="text-sm font-bold text-slate-700 truncate leading-relaxed">{destination}</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trip Estimate</p>
                                    <p className="text-sm font-bold text-slate-700 truncate leading-relaxed">{estimatedDistance.toFixed(1)} km • {estimatedDuration} mins • ${getFareForVehicle(selectedVehicle).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setConfirmRidePanel(false)} 
                                    className="flex-1 py-5 rounded-[24px] bg-white border-2 border-slate-100 font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={startFindingDriver} 
                                    className="flex-[1.5] py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/30 text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Looking for Driver State */}
            <AnimatePresence>
                {lookingForDriver && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[40px] p-10 pb-16 max-w-md mx-auto text-center shadow-[0_-30px_60px_rgba(0,0,0,0.1)] border-t border-slate-50"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-10">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-blue-500 rounded-full"
                            />
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Locate className="w-10 h-10 text-blue-600 animate-spin-slow" />
                                </div>
                            </div>
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">Finding your Captain</h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">We're searching for the best nearby partner to pick you up in minutes.</p>
                        
                        <button 
                            onClick={cancelCurrentRide}
                            className="w-full py-5 rounded-3xl border-2 border-rose-100 bg-rose-50 text-rose-600 font-black uppercase tracking-widest hover:bg-rose-100 hover:border-rose-200 transition-all shadow-sm active:scale-95"
                        >
                            Cancel Request
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Waiting for Driver State (Active Trip) */}
            <AnimatePresence>
                {waitingForDriver && assignedDriver && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[40px] p-8 pb-12 max-w-lg mx-auto shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-50"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Driver Found</span>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">Captain is arriving</h3>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl text-white">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span className="font-mono font-bold">4 min</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 border-slate-100 shadow-sm flex items-center gap-6 mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    <User className="w-10 h-10 text-slate-400" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-black border-2 border-white">
                                    {assignedDriver.rating || '4.9'} ★
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-black text-slate-900 uppercase leading-none">{assignedDriver.fullname.firstname} {assignedDriver.fullname.lastname}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-md">{assignedDriver.vehicle.plate || 'ABC-1234'}</span>
                                    <span className="text-xs font-bold text-slate-400 truncate">{assignedDriver.vehicle.color} {assignedDriver.vehicle.vehicleType}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowOtpScreen(true)}
                                className="flex-1 p-5 rounded-3xl bg-slate-50 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                            >
                                Start Ride
                            </button>
                            <button className="flex-1 p-5 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all">Call Captain</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OTP Screen */}
            <AnimatePresence>
                {showOtpScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Ride OTP</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Share this with your captain</p>
                            
                            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 mb-10">
                                <span className="text-4xl font-black tracking-[0.2em] text-slate-900">{rideOtp || '------'}</span>
                            </div>

                            <button 
                                onClick={() => setShowOtpScreen(false)}
                                className="w-full py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Driver Not Found State */}
            <AnimatePresence>
                {noDriverFound && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[40px] p-10 pb-16 max-w-md mx-auto text-center shadow-[0_-30px_60px_rgba(0,0,0,0.1)] border-t border-slate-50"
                    >
                        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-8">
                            <Info className="w-10 h-10 text-rose-500" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">No drivers found</h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">All our captains are currently busy. Try again in a few minutes or choose a different ride type.</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setNoDriverFound(false); setVehiclePanel(true); }}
                                className="flex-1 py-5 rounded-3xl bg-slate-50 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                            >
                                Change Ride
                            </button>
                            <button 
                                onClick={() => setNoDriverFound(false)}
                                className="flex-1 py-5 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
