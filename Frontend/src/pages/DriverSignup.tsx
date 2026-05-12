import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/utils';
import { DriverDataContext } from '../context/DriverContext';
import { motion } from 'motion/react';
import { User, Mail, Lock, Car, Loader2, Palette, Hash, Users } from 'lucide-react';
import { toast } from 'sonner';

const DriverSignup = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ firstName, setFirstName ] = useState('');
    const [ lastName, setLastName ] = useState('');
    const [ vehicleColor, setVehicleColor ] = useState('');
    const [ vehiclePlate, setVehiclePlate ] = useState('');
    const [ vehicleCapacity, setVehicleCapacity ] = useState('');
    const [ vehicleType, setVehicleType ] = useState('');
    const [ loading, setLoading ] = useState(false);

    const navigate = useNavigate();
    const { setDriver } = useContext(DriverDataContext);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const driverData = {
                fullname: {
                    firstname: firstName,
                    lastname: lastName
                },
                email: email,
                password: password,
                vehicle: {
                    color: vehicleColor,
                    plate: vehiclePlate,
                    capacity: vehicleCapacity,
                    vehicleType: vehicleType
                }
            };

            const response = await api.post('/drivers/register', driverData);

            if (response.status === 201) {
                const data = response.data;
                setDriver(data.driver);
                localStorage.setItem('driver-token', data.token);
                localStorage.setItem('driver', JSON.stringify(data.driver));
                toast.success('Registration successful! Welcome to the team.');
                navigate('/driver-dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden py-12">
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/2 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl glass-card p-10 relative z-10 shadow-3xl border-slate-100"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/40 font-bold text-white text-3xl mb-4">Y</div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">JOIN AS PARTNER</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Earn more with every mile you drive</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <input required className="glass-input" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <input required className="glass-input" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <input required className="glass-input" type="email" placeholder="captain@yourride.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                <Lock className="w-5 h-5 text-slate-400" />
                                <input required className="glass-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Vehicle Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Color</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                    <Palette className="w-5 h-5 text-slate-400" />
                                    <input required className="glass-input" type="text" placeholder="e.g. Silver" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                    <Hash className="w-5 h-5 text-slate-400" />
                                    <input required className="glass-input" type="text" placeholder="ABC-1234" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passenger Capacity</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                    <Users className="w-5 h-5 text-slate-400" />
                                    <input required className="glass-input" type="number" placeholder="4" value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                    <Car className="w-5 h-5 text-slate-400" />
                                    <select 
                                        required 
                                        className="glass-input appearance-none [&>option]:bg-white [&>option]:text-slate-900 shadow-none border-none outline-none" 
                                        value={vehicleType} 
                                        onChange={(e) => setVehicleType(e.target.value)}
                                    >
                                        <option value="" disabled>Select Type</option>
                                        <option value="bike">Bike</option>
                                        <option value="auto">Auto</option>
                                        <option value="car">Car (Mini/Sedan/SUV)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        disabled={loading}
                        className="w-full primary-button !from-emerald-600 !to-teal-500 shadow-emerald-500/30 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register as Captain'}
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-500 text-sm font-medium">
                    Already a partner? <Link to='/driver-login' className='text-emerald-600 font-black hover:underline'>Login here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default DriverSignup;
