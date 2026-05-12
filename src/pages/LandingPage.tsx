import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Clock, MapPin, Star } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="h-full w-full opacity-30" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/50 font-bold text-white text-xl">Y</div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight uppercase">YourRide</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Login</Link>
                    <Link to="/signup" className="primary-button !py-2 !px-6 !text-xs">Sign Up</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
                        MOVING PEOPLE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">BEYOND BOUNDARIES</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
                        Experience the next generation of urban mobility. Fast, reliable, and premium rides at your fingertips.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/signup" className="primary-button group">
                            Book a Ride
                            <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/driver-login" className="glass-panel p-6 flex items-center gap-4 hover:bg-slate-50 transition-all border-slate-200 shadow-xl shadow-slate-200/40">
                            <span className="text-3xl">🚗</span>
                            <div className="text-left">
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Drive with us</p>
                                <p className="text-sm font-bold text-slate-900">Join as a Partner</p>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-24 w-full max-w-6xl"
                >
                    {[
                        { icon: <Clock className="w-6 h-6" />, title: 'Fast Arrival', desc: 'Drivers arriving in minutes' },
                        { icon: <Shield className="w-6 h-6" />, title: 'Safe Rides', desc: 'Verified partners & SOS' },
                        { icon: <MapPin className="w-6 h-6" />, title: 'Live Tracking', desc: 'Watch your ride in real-time' },
                        { icon: <Star className="w-6 h-6" />, title: 'Premium Fleet', desc: 'Choose your level of comfort' }
                    ].map((f, i) => (
                        <div key={i} className="glass-panel p-8 text-left hover:border-blue-300 transition-all hover:scale-[1.03] active:scale-[0.97] group bg-white shadow-lg shadow-slate-100/50">
                            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white transition-all shadow-sm">
                                {f.icon}
                            </div>
                            <h3 className="font-black text-slate-900 mb-2 uppercase tracking-tight">{f.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 mt-20 py-10 px-6 border-t border-slate-200 text-center">
                <p className="text-slate-400 text-sm font-medium">© 2026 YourRide Mobility Inc. Modern Startup Gradient Design.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
