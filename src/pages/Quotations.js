import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Send, Trash2, Plus, 
  Search, FileSpreadsheet, Printer, X, RefreshCw, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx'; 

// Default logo import
import logo from '../shriram-logo.png'; 

const defaultTerms = `1. 50% advance payment is required before project commencement.
2. Remaining 50% payment must be completed within 7 days from project commencement date.
3. Source files will be delivered only after full payment is received.
4. Maximum 3 revision rounds are included in this quotation.
5. This quotation is valid for 15 days from the date of issue.`;

const generateAutoDocId = () => {
  const history = JSON.parse(localStorage.getItem('srd_history') || '[]');
  const count = history.length + 1;
  const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };
  return `QT-${new Date().getFullYear()}-${pad(count, 4)}`;
};

const Quotations = () => {
  const [activeTab, setActiveTab] = useState('Quotation');
  const [showPreview, setShowPreview] = useState(false);
  const [showConvertMenu, setShowConvertMenu] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [clients, setClients] = useState([]);
  
  const myProfile = {
    company: "ShriRam Digital Solutions",
    companyFull: "SHRIRAM DIGITAL SOLUTIONS",
    owner: "Atharva Chimte",
    location: "Pune, Maharashtra",
    email: "shriramdigitalsolution79@gmail.com",
    phone: "+91 9860726613"
  };

  const [clientData, setClientData] = useState(() => {
    const saved = localStorage.getItem('srd_pro_db');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        name: '', company: '', phone: '', address: '',
        date: new Date().toISOString().split('T')[0],
        items: [{ desc: '', qty: 1, rate: 0 }],
        gst: 18, advance: 0,
        discount: 0,
        discountType: '%',
        terms: defaultTerms,
        logoUrl: '',
        signatureType: 'type',
        signatureText: 'Atharva Chimte',
        signatureFont: 'font-dancing',
        signatureDrawData: '',
        signatureUploadUrl: '',
        status: 'Draft',
        clientGst: '',
        ...parsed
      };
    }
    return {
      name: '', company: '', phone: '', address: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ desc: '', qty: 1, rate: 0 }],
      gst: 18, advance: 0,
      discount: 0,
      discountType: '%',
      terms: defaultTerms,
      logoUrl: '',
      signatureType: 'type',
      signatureText: 'Atharva Chimte',
      signatureFont: 'font-dancing',
      signatureDrawData: '',
      signatureUploadUrl: '',
      status: 'Draft',
      clientGst: '',
      docId: generateAutoDocId()
    }
  });

  useEffect(() => {
    localStorage.setItem('srd_pro_db', JSON.stringify(clientData));
  }, [clientData]);

  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem('srd_clients') || '[]');
    setClients(savedClients);
  }, []);

  const saveBill = () => {
    const history = JSON.parse(localStorage.getItem('srd_history') || '[]');
    const index = history.findIndex(b => b.docId === clientData.docId);
    if (index > -1) history[index] = clientData;
    else history.push(clientData);
    localStorage.setItem('srd_history', JSON.stringify(history));

    if (clientData.name && clientData.company) {
      const savedClients = JSON.parse(localStorage.getItem('srd_clients') || '[]');
      const clientExists = savedClients.find(c => c.name.toLowerCase() === clientData.name.toLowerCase() && c.company.toLowerCase() === clientData.company.toLowerCase());
      if (!clientExists) {
        const newClient = {
          id: Date.now().toString(),
          name: clientData.name,
          company: clientData.company,
          phone: clientData.phone || '',
          address: clientData.address || '',
          gst: clientData.clientGst || '',
          dateAdded: new Date().toLocaleDateString()
        };
        savedClients.push(newClient);
        localStorage.setItem('srd_clients', JSON.stringify(savedClients));
        setClients(savedClients);
      }
    }

    alert("दस्तावेज यशस्वीरित्या जतन केला आहे! ✅");
  };

  const loadBill = () => {
    const history = JSON.parse(localStorage.getItem('srd_history') || '[]');
    const found = history.find(b => b.docId === searchId);
    if(found) {
      setClientData({
        discount: 0,
        discountType: '%',
        terms: defaultTerms,
        logoUrl: '',
        signatureType: 'type',
        signatureText: 'Atharva Chimte',
        signatureFont: 'font-dancing',
        signatureDrawData: '',
        signatureUploadUrl: '',
        status: 'Draft',
        clientGst: '',
        ...found
      });
    } else {
      alert("हा आयडी सापडला नाही! ❌");
    }
  };

  const resetForm = () => {
    if (window.confirm("सर्व डेटा रिसेट करायचा आहे का?")) {
      setClientData({
        name: '', company: '', phone: '', address: '',
        date: new Date().toISOString().split('T')[0],
        items: [{ desc: '', qty: 1, rate: 0 }],
        gst: 18, advance: 0,
        discount: 0,
        discountType: '%',
        terms: defaultTerms,
        logoUrl: '',
        signatureType: 'type',
        signatureText: 'Atharva Chimte',
        signatureFont: 'font-dancing',
        signatureDrawData: '',
        signatureUploadUrl: '',
        status: 'Draft',
        clientGst: '',
        docId: generateAutoDocId()
      });
    }
  };

  const addItem = () => setClientData({...clientData, items: [...clientData.items, { desc: '', qty: 1, rate: 0 }]});
  
  const updateItem = (index, field, value) => {
    const newItems = [...clientData.items];
    newItems[index][field] = value;
    setClientData({...clientData, items: newItems});
  };

  const removeItem = (index) => {
    if (clientData.items.length === 1) return;
    const newItems = clientData.items.filter((_, i) => i !== index);
    setClientData({...clientData, items: newItems});
  };

  const calculateTotal = () => {
    const subtotal = clientData.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
    const discountVal = Number(clientData.discount || 0);
    const discountAmount = Math.round(clientData.discountType === '%' ? (subtotal * discountVal) / 100 : discountVal);
    const taxableValue = subtotal - discountAmount;
    const tax = Math.round((taxableValue * Number(clientData.gst || 0)) / 100);
    const finalTotal = (taxableValue + tax) - Number(clientData.advance || 0);
    return { subtotal, discountAmount, taxableValue, tax, finalTotal };
  };

  const { subtotal, discountAmount, taxableValue, tax, finalTotal } = calculateTotal();

  const exportToExcel = () => {
    const excelData = clientData.items.map((item, index) => ({
      "Sr No": index + 1, "Description": item.desc, "Qty": item.qty, "Rate": item.rate, "Total": item.qty * item.rate
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${clientData.name}_${activeTab}.xlsx`);
  };

  // Canvas signature logic
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasSignature();
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setClientData(prev => ({ ...prev, signatureDrawData: dataUrl }));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setClientData(prev => ({ ...prev, signatureDrawData: '' }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setClientData(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setClientData(prev => ({ ...prev, signatureUploadUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const sendWhatsApp = () => {
    const formattedServices = clientData.items
      .map(item => `- ${item.desc} (${item.qty} x ₹${item.rate})`)
      .join('\n');
      
    const message = `Dear ${clientData.name},

Please find the summary of your *${activeTab}* from *${myProfile.company}*:

*Document ID:* #${clientData.docId}
*Date:* ${clientData.date}

*Services:*
${formattedServices}

*Subtotal:* ₹${subtotal.toLocaleString()}
${clientData.discount > 0 ? `*Discount (${clientData.discount}${clientData.discountType}):* -₹${discountAmount.toLocaleString()}\n` : ''}*Taxable Value:* ₹${taxableValue.toLocaleString()}
*GST (${clientData.gst}%):* +₹${tax.toLocaleString()}
*Advance Paid:* -₹${clientData.advance.toLocaleString()}
---------------------------------
*Net Balance Due:* *₹${finalTotal.toLocaleString()}*

Thank you for choosing *${myProfile.company}*! Please let us know if you have any questions.`;

    const encoded = encodeURIComponent(message);
    const phone = clientData.phone ? clientData.phone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full bg-[#f8fafc] p-4 md:p-8 font-sans">
      
      {/* 3D Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 no-print">
        <div className="flex items-center gap-5">
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="bg-black p-2 rounded-2xl shadow-xl border-2 border-orange-500 overflow-hidden w-16 h-16 flex items-center justify-center shrink-0">
            <img src={clientData.logoUrl || logo} alt="Logo" className="w-full h-full object-contain" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">{myProfile.company}</h1>
            <p className="text-orange-600 font-bold text-[10px] tracking-[0.3em] uppercase underline decoration-orange-200 decoration-2">Agency CRM Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 md:mt-0 relative">
          <div className="relative group">
            <input type="text" placeholder="ID सर्च..." className="bg-slate-50 border border-slate-100 rounded-2xl p-3 pl-10 text-xs font-bold outline-none w-32 focus:w-48 transition-all" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <button onClick={loadBill} className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-lg text-[8px] font-bold transition">LOAD</button>
          </div>
          
          <div className="relative">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConvertMenu(!showConvertMenu)} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-200 uppercase">
              <RefreshCw size={14} /> Convert <ChevronDown size={14} />
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        <div className="lg:col-span-3 space-y-3">
          {['Quotation', 'Purchase Order', 'Proforma Invoice', 'Payment Receipt', 'Tax Invoice'].map((tab) => (
            <motion.button whileHover={{ x: 5 }} key={tab} onClick={() => setActiveTab(tab)} className={`w-full p-5 rounded-[2rem] text-left flex items-center gap-4 transition-all ${activeTab === tab ? 'bg-white shadow-xl text-orange-600 border border-orange-100' : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-600'}`}>
              <div className={`p-2 rounded-xl ${activeTab === tab ? 'bg-orange-600 text-white shadow-lg' : 'bg-white shadow-sm'}`}> <FileText size={18} /> </div>
              <span className="font-black text-xs uppercase tracking-tighter">{tab}</span>
            </motion.button>
          ))}
        </div>

        <motion.div layout className="lg:col-span-9 bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-50">
          <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic"> {activeTab} <span className="text-orange-600">.</span> </h2>
            <div className="flex gap-2">
              <select
                value={clientData.status}
                onChange={e => setClientData({...clientData, status: e.target.value})}
                className="text-[10px] font-black bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-full cursor-pointer outline-none"
              >
                {['Draft', 'Sent', 'Won', 'Lost'].map(st => (
                  <option key={st} value={st}>{st.toUpperCase()}</option>
                ))}
              </select>
              <button onClick={saveBill} className="text-[10px] font-black bg-blue-50 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm">SAVE DOCUMENT</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Auto Quotation Number & Date */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Doc / Quote Number</label>
              <input type="text" value={clientData.docId} onChange={(e) => setClientData({...clientData, docId: e.target.value})} className="w-full p-5 rounded-3xl bg-slate-50 border-none font-bold outline-none shadow-inner" placeholder="E.g. QT-2026-0001" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Document Date</label>
              <input type="date" value={clientData.date} onChange={(e)=>setClientData({...clientData, date: e.target.value})} className="w-full p-5 rounded-3xl bg-slate-50 border-none font-bold outline-none shadow-inner text-slate-500" title="Quotation Date" />
            </div>
          </div>

          {/* Client Details Lookup and Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lookup Existing Client</label>
              <select 
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (!selectedId) return;
                  const cl = clients.find(c => c.id === selectedId);
                  if (cl) {
                    setClientData(prev => ({
                      ...prev,
                      name: cl.name,
                      company: cl.company,
                      phone: cl.phone,
                      address: cl.address || '',
                      clientGst: cl.gst || ''
                    }));
                  }
                }}
                className="w-full p-5 rounded-3xl bg-white border border-slate-100 font-bold outline-none cursor-pointer text-slate-600 appearance-none shadow-sm"
              >
                <option value="">-- Choose Client Profile --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Person Name</label>
              <input type="text" placeholder="कस्टमरचे नाव" value={clientData.name} onChange={(e)=>setClientData({...clientData, name: e.target.value})} className="w-full p-5 rounded-3xl bg-white border border-slate-100 font-bold outline-none shadow-sm" />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
              <input type="text" placeholder="कंपनीचे नाव" value={clientData.company} onChange={(e)=>setClientData({...clientData, company: e.target.value})} className="w-full p-5 rounded-3xl bg-white border border-slate-100 font-bold outline-none shadow-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
              <input type="text" placeholder="फोन नंबर" value={clientData.phone} onChange={(e)=>setClientData({...clientData, phone: e.target.value})} className="w-full p-5 rounded-3xl bg-white border border-slate-100 font-bold outline-none shadow-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client GSTIN (Optional)</label>
              <input type="text" placeholder="Client GST No" value={clientData.clientGst} onChange={(e)=>setClientData({...clientData, clientGst: e.target.value})} className="w-full p-5 rounded-3xl bg-white border border-slate-100 font-bold outline-none shadow-sm uppercase" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Address</label>
              <textarea placeholder="कस्टमरचा पत्ता" value={clientData.address} onChange={(e)=>setClientData({...clientData, address: e.target.value})} className="w-full p-5 rounded-3xl bg-white border border-slate-100 font-bold outline-none shadow-sm resize-none h-20" />
            </div>
          </div>

          {/* Service Table */}
          <div className="bg-slate-50/50 rounded-[3rem] p-6 md:p-8 mb-8 border border-slate-100">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Service & Project Items</label>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3">
                    <th className="pb-3 px-2 w-[45%] text-orange-600">Service Description</th>
                    <th className="pb-3 text-center w-[15%]">Qty</th>
                    <th className="pb-3 text-center w-[20%]">Rate (₹)</th>
                    <th className="pb-3 text-right pr-6 w-[20%]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100/50 group">
                      <td className="py-3 px-2"> 
                        <input type="text" placeholder="E.g. Web Development, SEO, Ads management" value={item.desc} onChange={(e)=>updateItem(idx, 'desc', e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-slate-100 shadow-sm font-bold outline-none text-slate-700" /> 
                      </td>
                      <td className="py-3 text-center"> 
                        <input type="number" value={item.qty} onChange={(e)=>updateItem(idx, 'qty', e.target.value)} className="w-16 p-4 rounded-2xl bg-white border border-slate-100 text-center font-black outline-none shadow-sm" /> 
                      </td>
                      <td className="py-3 text-center"> 
                        <input type="number" value={item.rate} onChange={(e)=>updateItem(idx, 'rate', e.target.value)} className="w-28 p-4 rounded-2xl bg-white border border-slate-100 text-center font-black text-orange-600 outline-none shadow-sm" /> 
                      </td>
                      <td className="py-3 text-right font-black text-slate-800 pr-6 text-lg tracking-tighter flex items-center justify-end gap-3 h-[80px]"> 
                        <span>₹{(item.qty * item.rate).toLocaleString()}</span>
                        <button onClick={() => removeItem(idx)} className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition" title="Delete Row">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} className="mt-6 flex items-center gap-2 text-orange-600 font-black text-[10px] bg-white px-8 py-3 rounded-full border border-orange-100 shadow-lg uppercase tracking-widest hover:scale-105 transition-all"> <Plus size={16} /> Add Service Row </button>
          </div>

          {/* Company Logo Customization and Digital Signature Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Custom Logo Upload */}
            <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Logo</label>
              <div className="flex items-center gap-4">
                <div className="bg-black p-2 rounded-2xl w-20 h-20 flex items-center justify-center border-2 border-orange-500 overflow-hidden shrink-0">
                  <img src={clientData.logoUrl || logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="logo-upload" 
                    onChange={handleLogoUpload} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="logo-upload" 
                    className="px-4 py-2.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-slate-50 transition text-center shadow-sm"
                  >
                    Upload logo
                  </label>
                  {clientData.logoUrl && (
                    <button 
                      onClick={() => setClientData(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-[9px] font-black uppercase text-red-500 hover:underline text-left"
                    >
                      Reset default logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature (Authorized Signatory)</label>
              
              <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full">
                {['type', 'draw', 'upload'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setClientData(prev => ({ ...prev, signatureType: type }))}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition ${clientData.signatureType === type ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {clientData.signatureType === 'type' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Signatory Name</label>
                    <input 
                      type="text" 
                      value={clientData.signatureText} 
                      onChange={e => setClientData(prev => ({ ...prev, signatureText: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-white border border-slate-100 font-bold outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Signature Font Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'font-dancing', name: 'Dancing Script', style: { fontFamily: "'Dancing Script', cursive" } },
                        { id: 'font-alex', name: 'Alex Brush', style: { fontFamily: "'Alex Brush', cursive" } },
                        { id: 'font-vibes', name: 'Great Vibes', style: { fontFamily: "'Great Vibes', cursive" } },
                        { id: 'font-reenie', name: 'Reenie Beanie', style: { fontFamily: "'Reenie Beanie', cursive" } }
                      ].map(font => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setClientData(prev => ({ ...prev, signatureFont: font.id }))}
                          className={`p-3 border rounded-xl font-bold transition flex items-center justify-between ${clientData.signatureFont === font.id ? 'border-orange-500 bg-orange-50/50 text-orange-600' : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'}`}
                        >
                          <span className="text-[10px]">{font.name}</span>
                          <span style={font.style} className="text-sm truncate max-w-[80px]">{clientData.signatureText || 'Sign'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {clientData.signatureType === 'draw' && (
                <div className="flex flex-col gap-2 items-center w-full">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={120}
                    className="border border-slate-200 bg-white rounded-2xl cursor-crosshair shadow-inner w-full touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="flex gap-4 w-full">
                    <button 
                      type="button"
                      onClick={clearCanvas}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-[9px] uppercase tracking-wider"
                    >
                      Clear Signature
                    </button>
                    {clientData.signatureDrawData && (
                      <span className="text-[8px] font-black text-green-500 uppercase tracking-widest self-center">Saved ✓</span>
                    )}
                  </div>
                </div>
              )}

              {clientData.signatureType === 'upload' && (
                <div className="space-y-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="signature-image-upload" 
                    onChange={handleSignatureUpload} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="signature-image-upload" 
                    className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer p-4 transition text-center shadow-sm"
                  >
                    {clientData.signatureUploadUrl ? (
                      <div className="w-full h-16 flex items-center justify-center overflow-hidden">
                        <img src={clientData.signatureUploadUrl} alt="Signature Upload" className="max-h-full object-contain" />
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Signature Image</span>
                        <span className="text-[8px] text-slate-400">PNG format recommended (transparent)</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Discount & GST & Advance Form */}
          <div className="p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Discount Box */}
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center gap-2">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 mb-1 uppercase">Discount</label> 
                  <input type="number" value={clientData.discount || 0} onChange={(e)=>setClientData({...clientData, discount: e.target.value})} className="w-12 text-center font-black outline-none" />
                </div>
                <select 
                  value={clientData.discountType || '%'} 
                  onChange={e => setClientData({...clientData, discountType: e.target.value})}
                  className="bg-slate-50 p-1.5 rounded-lg text-xs font-black text-slate-600 cursor-pointer border-none outline-none"
                >
                  <option value="%">%</option>
                  <option value="Flat">₹</option>
                </select>
              </div>

              {/* GST Box */}
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100"> 
                <label className="block text-[8px] font-black text-slate-400 mb-1 uppercase">GST (%)</label> 
                <input type="number" value={clientData.gst} onChange={(e)=>setClientData({...clientData, gst: e.target.value})} className="w-12 text-center font-black outline-none" /> 
              </div>

              {/* Advance Paid Box */}
              <div className="p-4 bg-green-50 rounded-3xl border border-green-100 shadow-sm"> 
                <label className="block text-[8px] font-black text-green-400 mb-1 uppercase tracking-widest">Advance (₹)</label> 
                <input type="number" value={clientData.advance} onChange={(e)=>setClientData({...clientData, advance: e.target.value})} className="w-24 bg-transparent font-black text-green-700 outline-none text-center" /> 
              </div>
            </div>

            <div className="text-right">
              <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] mb-1 italic">Net Balance Due</p>
              <h4 className="text-6xl font-black text-slate-900 tracking-tighter italic">₹{finalTotal.toLocaleString()}</h4>
            </div>
          </div>

          {/* Customizable Terms and Conditions */}
          <div className="mt-8">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</label>
            <textarea 
              value={clientData.terms} 
              onChange={e => setClientData(prev => ({ ...prev, terms: e.target.value }))}
              className="w-full p-5 rounded-3xl bg-slate-50 border-none font-bold outline-none resize-none h-32 shadow-inner text-sm text-slate-600"
              placeholder="E.g. Payment milestones, project schedule..."
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <button onClick={resetForm} className="p-5 rounded-3xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-wider transition"> <Trash2 size={18} /> Reset </button>
            <button onClick={exportToExcel} className="p-5 rounded-3xl bg-slate-100 hover:bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-wider transition"> <FileSpreadsheet size={18} /> Excel </button>
            <button onClick={() => setShowPreview(true)} className="p-6 rounded-[2.5rem] bg-black text-white font-black shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-4 text-xs uppercase tracking-widest"> <Printer size={20} /> Preview Proposal </button>
            <button onClick={sendWhatsApp} className="p-6 rounded-[2.5rem] bg-[#25D366] text-white font-black shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-4 text-xs uppercase tracking-widest"> <Send size={20} /> Share WhatsApp </button>
          </div>
        </motion.div>
      </div>

      {/* PDF Export / Premium Proposal Preview Dialog */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative my-auto print-container">
              <button onClick={() => setShowPreview(false)} className="absolute top-8 right-8 p-4 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition no-print"> <X size={24} /> </button>
              
              <div className="p-12 md:p-16" id="print-area">
                
                {/* PDF Header */}
                <div className="flex justify-between items-start mb-10 border-b-4 border-orange-600 pb-8">
                  <div className="flex items-center gap-6">
                    <img src={clientData.logoUrl || logo} alt="Logo" className="w-[240px] h-auto object-contain" />
                    <div> 
                      <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">{myProfile.companyFull}</h2> 
                      <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1">{myProfile.location}</p> 
                      <p className="text-[9px] text-slate-400 font-bold">{myProfile.email} | {myProfile.phone}</p>
                    </div>
                  </div>
                  <div className="text-right"> 
                    <h3 className="text-4xl font-black text-orange-600/15 uppercase italic tracking-tighter mb-1">{activeTab}</h3> 
                    <p className="text-[10px] font-black text-slate-800 tracking-widest">#{clientData.docId}</p>
                    <p className="text-[9px] font-bold text-slate-500">DATE: {new Date(clientData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      clientData.status === 'Won' ? 'bg-green-100 text-green-700 border-green-200' :
                      clientData.status === 'Sent' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {clientData.status}
                    </span>
                  </div>
                </div>

                {/* Premium Client Information Card */}
                <div className="mb-10 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-[2rem] border border-slate-200 overflow-hidden">
                  <div className="bg-slate-800 px-6 py-3">
                    <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">Client Information</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contact Person</p>
                        <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase italic">{clientData.name || '---'}</h4>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Company / Organization</p>
                        <h4 className="font-black text-slate-700 text-lg tracking-tight uppercase">{clientData.company || '---'}</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Phone</p>
                        <p className="text-[11px] font-bold text-slate-600">{clientData.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">GSTIN</p>
                        <p className="text-[11px] font-bold text-slate-600 uppercase">{clientData.clientGst || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Address</p>
                        <p className="text-[10px] font-bold text-slate-600 leading-relaxed whitespace-pre-line">{clientData.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Item Table */}
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-left bg-slate-50">
                      <th className="py-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</th>
                      <th className="py-4 text-[9px] font-black text-slate-500 uppercase text-center w-20">Qty</th>
                      <th className="py-4 text-[9px] font-black text-slate-500 uppercase text-center w-32">Rate</th>
                      <th className="py-4 text-[9px] font-black text-slate-500 uppercase text-right pr-6 w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-5 px-4 font-black text-slate-700 text-lg italic tracking-tight uppercase">{item.desc || 'Digital Agency Services'}</td>
                        <td className="py-5 font-black text-slate-600 text-center text-lg">{item.qty}</td>
                        <td className="py-5 font-black text-slate-600 text-center text-lg">₹{Number(item.rate).toLocaleString()}</td>
                        <td className="py-5 font-black text-slate-900 text-right pr-6 text-xl tracking-tighter italic">₹{(item.qty * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pricing Summary */}
                <div className="flex justify-end mb-8">
                  <div className="w-full md:w-80 p-6 bg-slate-50 rounded-[2rem] space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"> 
                      <span>Subtotal</span> 
                      <span>₹{subtotal.toLocaleString()}</span> 
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-rose-500 uppercase tracking-widest"> 
                        <span>Discount ({clientData.discount}{clientData.discountType})</span> 
                        <span>-₹{discountAmount.toLocaleString()}</span> 
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"> 
                        <span>Taxable Value</span> 
                        <span>₹{taxableValue.toLocaleString()}</span> 
                      </div>
                    )}

                    {Number(clientData.gst) > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2"> 
                        <span>GST ({clientData.gst}%)</span> 
                        <span>₹{tax.toLocaleString()}</span> 
                      </div>
                    )}

                    {Number(clientData.advance) > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest pb-2 border-b border-slate-200"> 
                        <span>Advance Paid</span> 
                        <span>-₹{Number(clientData.advance).toLocaleString()}</span> 
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-2xl font-black text-slate-900 tracking-tighter italic"> 
                      <span>Balance Due</span> 
                      <span className="text-orange-600">₹{finalTotal.toLocaleString()}</span> 
                    </div>
                  </div>
                </div>

                {/* Premium Terms Layout: Validity, Payment, Delivery */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 text-center">
                    <p className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Quotation Validity</p>
                    <p className="text-[14px] font-black text-orange-700">15 Days</p>
                    <p className="text-[8px] text-orange-400 font-bold">from date of issue</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Payment Terms</p>
                    <p className="text-[14px] font-black text-blue-700">50% Advance</p>
                    <p className="text-[8px] text-blue-400 font-bold">balance on delivery</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Delivery Timeline</p>
                    <p className="text-[14px] font-black text-emerald-700">7–15 Days</p>
                    <p className="text-[8px] text-emerald-400 font-bold">post confirmation</p>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mb-6">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Terms & Conditions</h5>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">{clientData.terms}</p>
                </div>

                {/* Signature Block — compact */}
                <div className="flex justify-between items-end border-t border-slate-200 pt-5">
                  <div className="text-[10px] text-slate-400 font-bold">
                    <p>Thank you for choosing {myProfile.companyFull}!</p>
                    <p>For support: {myProfile.email}</p>
                  </div>

                  {/* Digital Signature Render */}
                  <div className="text-right flex flex-col items-end w-56">
                    <div className="h-12 flex items-center justify-end mb-1 w-full">
                      {clientData.signatureType === 'type' && (
                        <span className={`text-2xl text-slate-800 ${clientData.signatureFont} select-none`}>
                          {clientData.signatureText}
                        </span>
                      )}

                      {clientData.signatureType === 'draw' && clientData.signatureDrawData && (
                        <img src={clientData.signatureDrawData} alt="Signature" className="max-h-full max-w-full object-contain pointer-events-none" />
                      )}

                      {clientData.signatureType === 'upload' && clientData.signatureUploadUrl && (
                        <img src={clientData.signatureUploadUrl} alt="Signature Upload" className="max-h-full max-w-full object-contain pointer-events-none" />
                      )}
                    </div>
                    <div className="border-t border-slate-300 pt-1 w-44">
                      <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{clientData.signatureText || myProfile.owner}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-slate-50 p-6 flex justify-center gap-4 rounded-b-[3rem] no-print">
                <button onClick={() => window.print()} className="bg-black hover:bg-slate-800 text-white px-12 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-4 shadow-xl hover:scale-105 transition-all"> <Printer size={18} /> Print / Save PDF </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          @media print {
            /* 1. Hide everything by default */
            body * {
              visibility: hidden;
            }

            /* 2. Show only the quotation print area and its children */
            #print-area,
            #print-area * {
              visibility: visible !important;
            }

            /* 3. Reset body for clean print */
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }

            /* 4. Hide sidebar and CRM navigation completely */
            nav, .w-64, [class*="sidebar"], .no-print {
              display: none !important;
            }

            /* 5. Force all ancestors of #print-area into normal flow */
            #root,
            #root > *,
            #root > * > *,
            #root > * > * > *,
            #root > * > * > * > *,
            #root > * > * > * > * > * {
              position: static !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              display: block !important;
              background: white !important;
              border: none !important;
              box-shadow: none !important;
              min-height: 0 !important;
              height: auto !important;
              margin-left: 0 !important;
              border-radius: 0 !important;
            }

            /* 6. Style the quotation print area */
            #print-area {
              width: 100% !important;
              padding: 6mm 4mm !important;
              overflow: visible !important;
            }

            #print-area img {
              max-width: 100% !important;
              page-break-inside: avoid;
            }

            /* 7. A4 page setup */
            @page { size: A4; margin: 12mm 10mm; }
          }
          
          /* Font styles for Cursive typing signatures */
          .font-dancing {
            font-family: 'Dancing Script', cursive;
          }
          .font-alex {
            font-family: 'Alex Brush', cursive;
          }
          .font-vibes {
            font-family: 'Great Vibes', cursive;
          }
          .font-reenie {
            font-family: 'Reenie Beanie', cursive;
          }
        `}
      </style>
    </motion.div>
  );
};

export default Quotations;
