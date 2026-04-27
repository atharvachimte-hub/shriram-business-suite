import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, FileText, History as HistoryIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../shriram-logo.png';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Leads', path: '/leads', icon: <UserPlus size={20} /> },
    { name: 'Clients', path: '/clients', icon: <Users size={20} /> },
    { name: 'Quotations', path: '/quotations', icon: <FileText size={20} /> },
    { name: 'History', path: '/history', icon: <HistoryIcon size={20} /> },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed top-0 left-0 border-r border-slate-100 flex flex-col shadow-xl z-50">
      <div className="p-6 flex items-center gap-4 border-b border-slate-50">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }} 
          className="bg-black p-1 rounded-2xl shadow-2xl border-2 border-orange-500 overflow-hidden shrink-0"
        >
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
        </motion.div>
        <div className="overflow-hidden">
          <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic truncate">
            ShriRam
          </h1>
          <p className="text-orange-600 font-bold text-[8px] tracking-[0.2em] uppercase truncate">
            Digital Solutions
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            {item.icon}
            <span className="text-sm uppercase tracking-wider">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atharva Chimte</p>
          <p className="text-xs font-bold text-slate-800">Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
