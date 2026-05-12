import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DriverDataContext } from '../context/DriverContext';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, Car } from 'lucide-react';
import { toast } from 'sonner';

const DriverLogin = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loading, setLoading ] = useState(false);

    const { setDriver } = useContext(DriverDataContext);
    const navigate = useNavigate();

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/drivers/login', { email, password });
            if (response.status === 200) {
                const data = response.data;
                setDriver(data.driver);
                localStorage.setItem('driver-token', data.token);
                localStorage.setItem('driver', JSON.stringify(data.driver));
                toast.success('Welcome back, Captain!');
                navigate('/driver-dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-10 relative z-10 shadow-3xl border-slate-100"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/40 font-bold text-white text-3xl mb-4">Y</div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">CAPTAIN LOGIN</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Ready to hit the road?</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <input
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input"
                                type="email"
                                placeholder="captain@yourride.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                            <Lock className="w-5 h-5 text-slate-400" />
                            <input
                                className="glass-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full primary-button !from-emerald-600 !to-teal-500 shadow-emerald-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Driving'}
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-500 text-sm font-medium">
                    New partner? <Link to='/driver-signup' className='text-emerald-600 font-black hover:underline'>Join our fleet</Link>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <Link to='/login' className='block w-full text-center py-4 rounded-2xl border border-blue-500/20 bg-blue-50 text-blue-600 font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm'>
                        Sign in as Rider
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default DriverLogin;
