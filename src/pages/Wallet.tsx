import React from 'react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, History, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
    const navigate = useNavigate();

    const transactions = [
        { id: 1, type: 'ride', title: 'Ride to Airport', amount: -115.00, date: 'Today, 2:30 PM', icon: ArrowUpRight, color: 'text-rose-500 bg-rose-50' },
        { id: 2, type: 'topup', title: 'Added to Wallet', amount: 500.00, date: 'Yesterday, 10:15 AM', icon: ArrowDownLeft, color: 'text-emerald-500 bg-emerald-50' },
        { id: 3, type: 'ride', title: 'Ride to Mall', amount: -42.50, date: '10 May, 2026', icon: ArrowUpRight, color: 'text-rose-500 bg-rose-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white shadow-sm">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">Your Wallet</h1>
                <div className="w-10"></div>
            </header>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-500/30 mb-8 overflow-hidden relative"
            >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Balance</p>
                    <h2 className="text-5xl font-black mb-10">$1,242.50</h2>
                    <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-white/30 transition-all">
                            <Plus className="w-4 h-4" />
                            Add Cash
                        </button>
                        <button className="flex-1 py-4 bg-white text-blue-600 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all">
                            <CreditCard className="w-4 h-4" />
                            Manage
                        </button>
                    </div>
                </div>
            </motion.div>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Activity</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-3 py-1 bg-blue-50 rounded-full">View All</button>
                </div>

                <div className="space-y-4">
                    {transactions.map((tx) => (
                        <motion.div 
                            key={tx.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer"
                        >
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${tx.color}`}>
                                <tx.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-900 uppercase text-sm truncate">{tx.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{tx.date}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                </p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">USD</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Wallet;
