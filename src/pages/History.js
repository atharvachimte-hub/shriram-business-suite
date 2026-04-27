import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('srd_history') || '[]');
    // Sort by date descending
    savedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    setHistory(savedHistory);
  }, []);

  const handleDelete = (docId) => {
    if(window.confirm('Are you sure you want to delete this document from history?')) {
      const newHistory = history.filter(h => h.docId !== docId);
      setHistory(newHistory);
      localStorage.setItem('srd_history', JSON.stringify(newHistory));
    }
  };

  const loadDocument = (doc) => {
    localStorage.setItem('srd_pro_db', JSON.stringify(doc));
    navigate('/quotations');
  };

  const filteredHistory = history.filter(h => 
    (h.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.docId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = (items, gst, advance) => {
    const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
    const tax = (subtotal * Number(gst || 0)) / 100;
    return (subtotal + tax) - Number(advance || 0);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
            History <span className="text-orange-600">.</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-2">Saved Quotations & Invoices</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Search by client name, company or ID..." 
            className="bg-transparent border-none outline-none w-full font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4 px-4">Document Details</th>
                <th className="pb-4 px-4">Client Info</th>
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4 text-right">Amount</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-bold">No history found.</td></tr>
              ) : (
                filteredHistory.map(doc => (
                  <tr key={doc.docId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-black text-slate-800 text-sm uppercase italic">#{doc.docId}</p>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{doc.items.length} Items</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-700">{doc.company || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{doc.name || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-600">
                      {new Date(doc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-black text-slate-800 text-lg italic tracking-tight">₹{calculateTotal(doc.items, doc.gst, doc.advance).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4 flex justify-end gap-2">
                      <button onClick={() => loadDocument(doc)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 font-bold text-xs uppercase" title="Load into Editor">
                        Load <ArrowRight size={14} />
                      </button>
                      <button onClick={() => handleDelete(doc.docId)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default History;
