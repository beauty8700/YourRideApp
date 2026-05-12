import React from 'react';
import { motion } from 'motion/react';
import { Gift, Star, Zap, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Rewards = () => {
    const navigate = useNavigate();

    const offers = [
        { id: 1, title: '50% Off Next Ride', code: 'PRO50', type: 'Exclusive', icon: Sparkles, color: 'from-violet-500 to-purple-500' },
        { id: 2, title: 'Free Weekend Trip', code: 'FREEWKND', type: 'Gift', icon: Gift, color: 'from-rose-500 to-pink-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white shadow-sm">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">Your Rewards</h1>
                <div className="w-10"></div>
            </header>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 flex flex-col items-center text-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-6">
                    <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 opacity-20" />
                </div>
                <div className="h-20 w-20 rounded-[32px] bg-yellow-50 flex items-center justify-center mb-6 shadow-inner">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Rating</p>
                <div className="flex items-center gap-2 mb-8">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-4xl font-black">4.92</h2>
                </div>
                
                <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden mb-3">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    ></motion.div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">12 rides until next reward tier</p>
            </motion.div>

            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Active Offers</h3>
            <div className="space-y-6">
                {offers.map((offer) => (
                    <motion.div 
                        key={offer.id}
                        whileHover={{ y: -5 }}
                        className="group relative"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                        <div className="relative bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-6 overflow-hidden">
                            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}>
                                <offer.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{offer.type}</span>
                                <h4 className="font-black text-slate-900 text-lg uppercase leading-tight mb-3">{offer.title}</h4>
                                <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-3 items-center justify-between">
                                    <span className="font-mono font-bold text-blue-600 text-sm tracking-widest">{offer.code}</span>
                                    <button className="text-[8px] font-black uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">Apply</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Rewards;
