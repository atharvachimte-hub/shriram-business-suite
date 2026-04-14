import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, FileText, Send, Trash2, Plus, 
  Search, FileSpreadsheet, LayoutDashboard,
  ArrowRightLeft, Wallet, Printer, X, RefreshCw, ChevronDown
} from 'lucide-react';

// लोगो इम्पोर्ट (तुमच्या फोल्डरनुसार .png सेट केला आहे)
import logo from './shriram-logo.png'; 

const App = () => {
  const [activeTab, setActiveTab] = useState('Quotation');
  const [showPreview, setShowPreview] = useState(false);
  const [showConvertMenu, setShowConvertMenu] = useState(false);
  const [searchId, setSearchId] = useState('');
  
  const myProfile = {
    company: "ShriRam Digital Solutions",
    owner: "Atharva Chimte",
    location: "Pune, Maharashtra",
  };

  // डेटाबेस लॉजिक
  const [clientData, setClientData] = useState(() => {
    const saved = localStorage.getItem('srd_pro_db');
    return saved ? JSON.parse(saved) : {
      name: '', company: '', phone: '', address: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ desc: '', qty: 1, rate: 0 }],
      gst: 0, advance: 0,
      docId: `SD-${Math.floor(100000 + Math.random() * 900000)}`
    }
  });

  useEffect(() => {
    localStorage.setItem('srd_pro_db', JSON.stringify(clientData));
  }, [clientData]);

  const saveBill = () => {
    const history = JSON.parse(localStorage.getItem('srd_history') || '[]');
    const index = history.findIndex(b => b.docId === clientData.docId);
    if (index > -1) history[index] = clientData;
    else history.push(clientData);
    localStorage.setItem('srd_history', JSON.stringify(history));
    alert("डेटा यशस्वीरित्या पीसीमध्ये सेव्ह झाला! ✅");
  };

  const loadBill = () => {
    const history = JSON.parse(localStorage.getItem('srd_history') || '[]');
    const found = history.find(b => b.docId === searchId);
    if(found) setClientData(found);
    else alert("हा आयडी सापडला नाही! ❌");
  };

  const addItem = () => setClientData({...clientData, items: [...clientData.items, { desc: '', qty: 1, rate: 0 }]});
  const updateItem = (index, field, value) => {
    const newItems = [...clientData.items];
    newItems[index][field] = value;
    setClientData({...clientData, items: newItems});
  };

  const calculateTotal = () => {
    const subtotal = clientData.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
    const tax = (subtotal * Number(clientData.gst)) / 100;
    const finalTotal = (subtotal + tax) - Number(clientData.advance);
    return { subtotal, tax, finalTotal };
  };

  const { subtotal, tax, finalTotal } = calculateTotal();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans">
      
      {/* ३D प्रीमियम हेडर */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-white">
        <div className="flex items-center gap-5">
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="bg-black p-1 rounded-2xl shadow-2xl border-2 border-orange-500 overflow-hidden">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">{myProfile.company}</h1>
            <p className="text-orange-600 font-bold text-[10px] tracking-[0.3em] uppercase underline decoration-orange-200 decoration-2">Premium Digital Partner</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 md:mt-0 relative">
          <div className="relative group">
            <input type="text" placeholder="ID सर्च..." className="bg-slate-100 border-none rounded-2xl p-3 pl-10 text-xs font-bold outline-none w-32 focus:w-48 transition-all" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <button onClick={loadBill} className="absolute right-2 top-2 bg-blue-600 text-white p-1 rounded-lg text-[8px] font-bold">LOAD</button>
          </div>
          
          <div className="relative">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConvertMenu(!showConvertMenu)} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-200">
              <RefreshCw size={14} /> CONVERT <ChevronDown size={14} />
            </motion.button>

            <AnimatePresence>
              {showConvertMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-50 z-[100] p-2">
                  {['Quotation', 'Purchase Order', 'Proforma Invoice', 'Payment Receipt', 'Tax Invoice'].map((type) => (
                    <button key={type} onClick={() => { setActiveTab(type); setShowConvertMenu(false); }} className="w-full p-3 text-left text-[11px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all"> {type} </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-3">
          {['Quotation', 'Purchase Order', 'Proforma Invoice', 'Payment Receipt', 'Tax Invoice'].map((tab) => (
            <motion.button whileHover={{ x: 10 }} key={tab} onClick={() => setActiveTab(tab)} className={`w-full p-5 rounded-[2rem] text-left flex items-center gap-4 transition-all ${activeTab === tab ? 'bg-white shadow-2xl text-orange-600 ring-2 ring-orange-50' : 'bg-transparent text-slate-400'}`}>
              <div className={`p-2 rounded-xl ${activeTab === tab ? 'bg-orange-600 text-white shadow-lg' : 'bg-white shadow-sm'}`}> <FileText size={18} /> </div>
              <span className="font-black text-xs uppercase tracking-tighter">{tab}</span>
            </motion.button>
          ))}
        </div>

        <motion.div layout className="lg:col-span-9 bg-white rounded-[4rem] p-10 shadow-2xl shadow-slate-200 border border-white">
          <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic"> {activeTab} <span className="text-orange-600">.</span> </h2>
            <button onClick={saveBill} className="text-[10px] font-black bg-blue-50 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm">SAVE TO PC</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <input type="text" placeholder="कस्टमरचे नाव" value={clientData.name} onChange={(e)=>setClientData({...clientData, name: e.target.value})} className="w-full p-5 rounded-3xl bg-slate-50 border-none font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all shadow-inner" />
            <input type="text" placeholder="कंपनीचे नाव" value={clientData.company} onChange={(e)=>setClientData({...clientData, company: e.target.value})} className="w-full p-5 rounded-3xl bg-slate-50 border-none font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all shadow-inner" />
          </div>

          <div className="bg-slate-50/50 rounded-[3rem] p-8 mb-8 border border-slate-100 shadow-inner overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="pb-5 px-4 text-orange-600 tracking-tighter">Item Description (तपशील)</th>
                  <th className="pb-5 text-center">Nag (Qty)</th>
                  <th className="pb-5 text-center">Dar (Rate)</th>
                  <th className="pb-3 text-right pr-6">Ekun (Amount)</th>
                </tr>
              </thead>
              <tbody>
                {clientData.items.map((item, idx) => (
                  <tr key={idx} className="animate-in slide-in-from-bottom-2">
                    <td className="py-4 px-2"> <input type="text" placeholder="Service Name" value={item.desc} onChange={(e)=>updateItem(idx, 'desc', e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-slate-100 shadow-sm font-bold outline-none" /> </td>
                    <td className="py-4 w-24 text-center"> <input type="number" value={item.qty} onChange={(e)=>updateItem(idx, 'qty', e.target.value)} className="w-16 p-4 rounded-2xl bg-white border border-slate-100 text-center font-black outline-none shadow-sm" /> </td>
                    <td className="py-4 w-32 text-center"> <input type="number" value={item.rate} onChange={(e)=>updateItem(idx, 'rate', e.target.value)} className="w-24 p-4 rounded-2xl bg-white border border-slate-100 text-center font-black text-orange-600 outline-none shadow-sm" /> </td>
                    <td className="py-4 text-right font-black text-slate-800 pr-6 text-xl tracking-tighter italic"> ₹{Number(item.qty) * Number(item.rate)} </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addItem} className="mt-8 flex items-center gap-2 text-orange-600 font-black text-[10px] bg-white px-8 py-3 rounded-full border border-orange-100 shadow-lg uppercase tracking-widest"> <Plus size={16} /> Add Row </motion.button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-50 gap-10">
            <div className="flex gap-4">
               <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100"> <label className="block text-[8px] font-black text-slate-400 mb-1 uppercase">GST (%)</label> <input type="number" value={clientData.gst} onChange={(e)=>setClientData({...clientData, gst: e.target.value})} className="w-12 text-center font-black outline-none" /> </div>
               <div className="p-4 bg-green-50 rounded-3xl border border-green-100 shadow-sm"> <label className="block text-[8px] font-black text-green-400 mb-1 uppercase tracking-widest">Advance Paid</label> <input type="number" value={clientData.advance} onChange={(e)=>setClientData({...clientData, advance: e.target.value})} className="w-24 bg-transparent font-black text-green-700 outline-none text-center" /> </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] mb-1 italic">Final Balance</p>
              <h4 className="text-7xl font-black text-slate-900 tracking-tighter italic">₹{finalTotal.toLocaleString()}</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <motion.button whileHover={{ y: -5 }} onClick={() => setClientData({...clientData, items:[{desc:'',qty:1,rate:0}], name:'', company:''})} className="p-5 rounded-3xl bg-slate-100 text-slate-400 font-bold flex items-center justify-center gap-2 transition-all"> <Trash2 size={18} /> Reset </motion.button>
            <motion.button whileHover={{ y: -5 }} className="p-5 rounded-3xl bg-slate-100 text-slate-400 font-bold flex items-center justify-center gap-2 transition-all"> <FileSpreadsheet size={18} /> Excel </motion.button>
            <motion.button whileHover={{ y: -5, scale: 1.02 }} onClick={() => setShowPreview(true)} className="p-6 rounded-[2.5rem] bg-black text-white font-black shadow-2xl flex items-center justify-center gap-4"> <Printer size={20} /> Preview Bill </motion.button>
            <motion.button whileHover={{ y: -5, scale: 1.02 }} onClick={() => window.open(`https://wa.me/?text=नमस्कार ${clientData.name}, तुमच्या ${activeTab} ची एकूण रक्कम ₹${finalTotal} आहे. - श्री राम डिजिटल`)} className="p-6 rounded-[2.5rem] bg-[#25D366] text-white font-black shadow-2xl flex items-center justify-center gap-4"> <Send size={20} /> WhatsApp </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[2000] flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl relative my-auto">
              <button onClick={() => setShowPreview(false)} className="absolute top-10 right-10 p-4 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"> <X size={24} /> </button>
              <div className="p-20" id="print-bill">
                <div className="flex justify-between items-center mb-16 border-b-8 border-slate-50 pb-12">
                  <div className="flex items-center gap-8">
                    <img src={logo} alt="Logo" className="w-24 h-24 object-contain bg-black rounded-3xl p-1 shadow-2xl border-2 border-orange-500" />
                    <div> <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">{myProfile.company}</h2> <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">{myProfile.location}</p> </div>
                  </div>
                  <div className="text-right"> <h3 className="text-6xl font-black text-orange-600/10 uppercase italic tracking-tighter mb-[-10px]">{activeTab}</h3> <p className="text-sm font-black text-slate-800 tracking-widest">#{clientData.docId} | {clientData.date}</p> </div>
                </div>

                <div className="mb-12 grid grid-cols-2 gap-10">
                    <div className="p-10 bg-slate-50 rounded-[3rem] border-l-[15px] border-orange-600">
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-[0.3em]">Client Bill To:</p>
                        <h4 className="font-black text-slate-800 text-3xl tracking-tight uppercase italic">{clientData.name || '---'}</h4>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{clientData.company}</p>
                    </div>
                </div>

                <table className="w-full mb-16">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-left">
                      <th className="py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Description</th>
                      <th className="py-6 text-[11px] font-black text-slate-400 uppercase text-center">Nag</th>
                      <th className="py-6 text-[11px] font-black text-slate-400 uppercase text-center">Rate</th>
                      <th className="py-6 text-[11px] font-black text-slate-400 uppercase text-right pr-6">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-8 font-black text-slate-700 text-2xl italic tracking-tight uppercase">{item.desc || 'Services'}</td>
                        <td className="py-8 font-black text-slate-600 text-center text-xl">{item.qty}</td>
                        <td className="py-8 font-black text-slate-600 text-center text-xl">₹{item.rate}</td>
                        <td className="py-8 font-black text-slate-900 text-right pr-6 text-3xl tracking-tighter italic">₹{item.qty * item.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-96 p-10 bg-slate-50 rounded-[3.5rem] space-y-4 shadow-inner">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"> <span>Subtotal</span> <span>₹{subtotal}</span> </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"> <span>Tax ({clientData.gst}%)</span> <span>₹{tax}</span> </div>
                    <div className="flex justify-between pt-6 border-t-4 border-slate-200 text-4xl font-black text-slate-900 tracking-tighter italic"> <span>Net Total</span> <span className="text-orange-600 font-black">₹{finalTotal}</span> </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-10 flex justify-center">
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => window.print()} className="bg-black text-white px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-5 shadow-2xl"> <Printer size={20} /> PRINT OR SAVE PDF </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;