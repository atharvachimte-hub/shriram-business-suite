import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('All');
  const [groupByType, setGroupByType] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const clientTypes = ['All', 'Real Estate', 'Digital Marketing', 'Dentist', 'Coaching', 'AI Course', 'Generic'];
  const [currentClient, setCurrentClient] = useState({ id: '', name: '', company: '', phone: '', address: '', gst: '', clientType: 'Generic' });
  const navigate = useNavigate();

  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem('srd_clients') || '[]');
    setClients(savedClients);
  }, []);

  const saveClients = (newClients) => {
    setClients(newClients);
    localStorage.setItem('srd_clients', JSON.stringify(newClients));
  };

  const handleSave = () => {
    if (!currentClient.name || !currentClient.company) return alert("Name and Company are required!");
    
    let newClients;
    if (currentClient.id) {
      newClients = clients.map(c => c.id === currentClient.id ? currentClient : c);
    } else {
      newClients = [{ ...currentClient, id: Date.now().toString(), dateAdded: new Date().toLocaleDateString() }, ...clients];
    }
    
    saveClients(newClients);
    setShowModal(false);
    setCurrentClient({ id: '', name: '', company: '', phone: '', address: '', gst: '', clientType: 'Generic' });
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this client?')) {
      saveClients(clients.filter(c => c.id !== id));
    }
  };

  const createQuoteForClient = (client) => {
    // Save client info to current draft and navigate to quotes
    const draft = JSON.parse(localStorage.getItem('srd_pro_db') || '{}');
    const newDraft = {
      ...draft,
      name: client.name,
      company: client.company,
      phone: client.phone,
      address: client.address,
      gst: client.gst || draft.gst,
      docId: `SD-${Math.floor(100000 + Math.random() * 900000)}`
    };
    localStorage.setItem('srd_pro_db', JSON.stringify(newDraft));
    navigate('/quotations');
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = clientTypeFilter === 'All' || c.clientType === clientTypeFilter;
    return matchesSearch && matchesType;
  });

  const renderTable = (clientsData) => (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-50">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
            <th className="pb-4 px-4 pt-4">Client Info</th>
            <th className="pb-4 px-4 pt-4">Contact</th>
            <th className="pb-4 px-4 pt-4">GST No</th>
            <th className="pb-4 px-4 pt-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clientsData.length === 0 ? (
            <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold">No clients found.</td></tr>
          ) : (
            clientsData.map(client => (
              <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4">
                  <p className="font-black text-slate-800 text-lg uppercase italic">{client.company}</p>
                  <p className="text-xs font-bold text-slate-500">{client.name}</p>
                </td>
                <td className="py-4 px-4 font-bold text-slate-600">{client.phone || '-'}</td>
                <td className="py-4 px-4 font-bold text-slate-600 uppercase">{client.gst || '-'}</td>
                <td className="py-4 px-4 flex justify-end gap-2">
                  <button onClick={() => createQuoteForClient(client)} className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors" title="Create Quote">
                    <FileText size={16} />
                  </button>
                  <button onClick={() => { setCurrentClient(client); setShowModal(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
            Clients <span className="text-orange-600">.</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-2">Manage Customer Profiles</p>
        </div>
        <button 
          onClick={() => { setCurrentClient({ id: '', name: '', company: '', phone: '', address: '', gst: '', clientType: 'Generic' }); setShowModal(true); }}
          className="bg-black text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-slate-200 uppercase hover:scale-105 transition-all"
        >
          <Plus size={16} /> New Client
        </button>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
          <div className="flex-1 flex items-center gap-4">
            <Search className="text-slate-400 ml-2" size={20} />
            <input 
              type="text" 
              placeholder="Search clients by name or company..." 
              className="bg-transparent border-none outline-none w-full font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {clientTypes.map(type => {
            const count = type === 'All' ? clients.length : clients.filter(c => c.clientType === type).length;
            const isSelected = clientTypeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setClientTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
                  isSelected 
                    ? 'bg-black text-white border border-slate-800' 
                    : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {type}
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          
          <div className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={groupByType} onChange={e => setGroupByType(e.target.checked)} className="w-4 h-4 accent-black" />
              Group View
            </label>
          </div>
        </div>

        {groupByType ? (
          <div className="space-y-8">
            {clientTypes.filter(type => type !== 'All').filter(type => clientTypeFilter === 'All' || clientTypeFilter === type).map(type => {
              const typeClients = filteredClients.filter(c => c.clientType === type);
              if (typeClients.length === 0) return null;
              return (
                <div key={type} className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <h3 className="text-lg font-black text-slate-700 uppercase italic mb-4 flex items-center gap-2">
                    {type} <span className="bg-white text-slate-400 text-xs px-2 py-1 rounded-lg border border-slate-100 not-italic shadow-sm">{typeClients.length}</span>
                  </h3>
                  {renderTable(typeClients)}
                </div>
              );
            })}
          </div>
        ) : (
          renderTable(filteredClients)
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic mb-6">
              {currentClient.id ? 'Edit Client' : 'Add New Client'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                  <input type="text" value={currentClient.company} onChange={e => setCurrentClient({...currentClient, company: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Person</label>
                  <input type="text" value={currentClient.name} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <input type="text" value={currentClient.phone} onChange={e => setCurrentClient({...currentClient, phone: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GST No</label>
                  <input type="text" value={currentClient.gst} onChange={e => setCurrentClient({...currentClient, gst: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold uppercase" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Type</label>
                <select value={currentClient.clientType || 'Generic'} onChange={e => setCurrentClient({...currentClient, clientType: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold">
                  {clientTypes.filter(t => t !== 'All').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                <textarea value={currentClient.address} onChange={e => setCurrentClient({...currentClient, address: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold resize-none h-24" />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 p-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
              <button onClick={handleSave} className="flex-1 p-4 bg-black text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">Save Client</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Clients;
