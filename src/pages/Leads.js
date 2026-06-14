import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit, MessageCircle, Calendar, LayoutGrid, List, Download, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('All');
  const [groupByType, setGroupByType] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const clientTypes = ['All', 'Real Estate', 'Digital Marketing', 'Dentist', 'Coaching', 'AI Course', 'Generic'];
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'
  const [currentLead, setCurrentLead] = useState({ 
    id: '', name: '', phone: '', status: 'New Lead', notes: '', 
    nextFollowUp: '', lastContacted: '', clientType: 'Generic', leadSource: 'Organic', priority: 'Warm', messageTemplate: 'Intro', service: '', offer: '', customMessage: ''
  });

  const getSmartTemplate = (lead) => {
    const type = lead.clientType || 'Generic';
    const templateType = lead.messageTemplate || 'Intro';
    
    const smartTemplates = {
      'Real Estate': {
        'Intro': `नमस्कार {name}, आम्ही तुमच्या रियल इस्टेट बिझनेसला {service} च्या माध्यमातून ग्रो करण्यासाठी मदत करू शकतो. सध्या {offer} उपलब्ध आहे.`,
        'Follow-up': `नमस्कार {name}, आमच्या मागील संभाषणाच्या संदर्भात, आपण {service} साठी कधी भेटू शकतो? पुढील माहितीसाठी {followup_date} रोजी संपर्क करू.`,
        'Proposal': `नमस्कार {name}, तुमच्या प्रॉपर्टी प्रोजेक्टसाठी आमचे {service} प्रपोजल तयार आहे.`,
        'Closing': `नमस्कार {name}, प्रोजेक्ट सुरु करण्यासाठी आम्ही तयार आहोत. पुढील प्रक्रिया करूया?`
      },
      'Digital Marketing': {
        'Intro': `नमस्कार {name}, आम्ही तुमच्या बिझनेसची ऑनलाइन उपस्थिती वाढवण्यासाठी {service} सेवा देतो. सध्या {offer} सुरु आहे.`,
        'Follow-up': `नमस्कार {name}, आमच्या मागील संभाषणाच्या संदर्भात, तुमचा {service} प्लान ठरला का?`,
        'Proposal': `नमस्कार {name}, तुमच्या बिझनेससाठी आमचा कस्टम {service} प्लान तयार आहे.`,
        'Closing': `नमस्कार {name}, {service} कॅम्पेन सुरु करण्यासाठी आम्ही तयार आहोत.`
      },
      'Dentist': {
        'Intro': `नमस्कार {name}, आम्ही डेंटिस्ट क्लिनिकसाठी पेशंट्स वाढवण्यासाठी {service} कॅम्पेन्स चालवतो. {offer} उपलब्ध आहे.`,
        'Follow-up': `नमस्कार {name}, आमच्या मागील संभाषणाच्या संदर्भात, क्लिनिकच्या {service} बद्दल पुढे काय ठरलं?`,
        'Proposal': `नमस्कार {name}, तुमच्या क्लिनिकसाठी आमचे {service} प्रपोजल तयार आहे.`,
        'Closing': `नमस्कार {name}, {service} सुरु करून पेशंट्स वाढवायला सुरुवात करूया?`
      },
      'Coaching': {
        'Intro': `नमस्कार {name}, आम्ही तुमच्या कोचिंग क्लाससाठी नवीन विद्यार्थी मिळवण्यासाठी {service} ची मदत करू शकतो. {offer} चा लाभ घ्या.`,
        'Follow-up': `नमस्कार {name}, आमच्या मागील संभाषणाच्या संदर्भात, {service} ऍडमिशन कॅम्पेनबद्दल काय ठरलं?`,
        'Proposal': `नमस्कार {name}, विद्यार्थ्यांचे ऍडमिशन वाढवण्यासाठी आमचा {service} प्लान तयार आहे.`,
        'Closing': `नमस्कार {name}, {service} कॅम्पेन सुरु करण्यासाठी आम्ही तयार आहोत.`
      },
      'AI Course': {
        'Intro': `नमस्कार {name}, आम्ही {service} च्या मार्केटिंगसाठी आणि सेल्स वाढवण्यासाठी मदत करतो. सध्या {offer} सुरु आहे.`,
        'Follow-up': `नमस्कार {name}, आमच्या मागील संभाषणाच्या संदर्भात, {service} च्या मार्केटिंगबद्दल काय ठरलं?`,
        'Proposal': `नमस्कार {name}, तुमच्या {service} साठी आमचे मार्केटिंग प्रपोजल तयार आहे.`,
        'Closing': `नमस्कार {name}, {service} कॅम्पेन सुरु करण्यासाठी आम्ही तयार आहोत.`
      },
      'Generic': {
        'Intro': `नमस्कार {name}, श्री राम डिजिटल सोल्युशन्समध्ये आपले स्वागत आहे! आम्ही {service} मध्ये आपल्याला मदत करू शकतो. {offer} ची माहिती घ्या.`,
        'Follow-up': `नमस्कार {name}, {service} संदर्भात आपला काही निर्णय झाला आहे का? {followup_date} रोजी संपर्क करू.`,
        'Proposal': `नमस्कार {name}, आपल्या {service} रिक्वायरमेंटनुसार प्रपोजल तयार आहे.`,
        'Closing': `नमस्कार {name}, प्रोजेक्ट सुरु करण्यासाठी आम्ही तयार आहोत.`
      }
    };
    
    let rawTemplate = smartTemplates[type]?.[templateType] || smartTemplates['Generic']['Intro'];
    
    return rawTemplate
      .replace(/{name}/g, lead.name || '[नाव]')
      .replace(/{service}/g, lead.service || '[सर्व्हिस]')
      .replace(/{offer}/g, lead.offer || '[ऑफर]')
      .replace(/{followup_date}/g, lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : '[तारीख]');
  };

  const [isMessageEdited, setIsMessageEdited] = useState(false);

  useEffect(() => {
    const savedLeads = JSON.parse(localStorage.getItem('srd_leads') || '[]');
    setLeads(savedLeads);
  }, []);

  useEffect(() => {
    if (showModal && !isMessageEdited) {
      const newMsg = getSmartTemplate(currentLead);
      if (currentLead.customMessage !== newMsg) {
        setCurrentLead(prev => ({ ...prev, customMessage: newMsg }));
      }
    }
  }, [currentLead.clientType, currentLead.messageTemplate, currentLead.name, currentLead.service, currentLead.offer, currentLead.nextFollowUp, showModal, isMessageEdited, currentLead]);

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    localStorage.setItem('srd_leads', JSON.stringify(newLeads));
  };

  const handleStatusChangeSideEffects = (lead, newStatus, oldStatus) => {
    if (newStatus === oldStatus) return;
    
    if (newStatus === 'Proposal Sent') {
      if (window.confirm(`Create a Proposal/Quotation draft for ${lead.name}?`)) {
        const draft = JSON.parse(localStorage.getItem('srd_pro_db') || '{}');
        const newDraft = {
          ...draft,
          name: lead.name,
          company: lead.notes || lead.name,
          phone: lead.phone,
          address: '',
          gst: draft.gst || '0',
          docId: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          items: [{ desc: lead.service || 'Digital Marketing Services', qty: 1, rate: 0 }],
          date: new Date().toISOString().split('T')[0]
        };
        localStorage.setItem('srd_pro_db', JSON.stringify(newDraft));
        navigate('/quotations');
      }
    } else if (newStatus === 'Won') {
      const clients = JSON.parse(localStorage.getItem('srd_clients') || '[]');
      const clientExists = clients.some(c => c.phone === lead.phone);
      if (!clientExists) {
        if (window.confirm(`Convert ${lead.name} into an Active Client?`)) {
          const newClient = {
            id: Date.now().toString(),
            name: lead.name,
            company: lead.notes || `${lead.name} Agency Client`,
            phone: lead.phone,
            address: '',
            gst: '',
            clientType: lead.clientType || 'Generic',
            dateAdded: new Date().toLocaleDateString()
          };
          clients.push(newClient);
          localStorage.setItem('srd_clients', JSON.stringify(clients));
          alert(`Client created successfully! 🎉`);
        }
      }
    }
  };

  const handleSave = () => {
    if (!currentLead.name || !currentLead.phone) return alert("नाव आणि नंबर आवश्यक आहे!");
    
    let newLeads;
    const oldLead = leads.find(l => l.id === currentLead.id);
    const oldStatus = oldLead ? oldLead.status : null;
    
    if (currentLead.id) {
      newLeads = leads.map(l => l.id === currentLead.id ? currentLead : l);
    } else {
      newLeads = [{ 
        ...currentLead, 
        id: Date.now().toString(), 
        date: new Date().toLocaleDateString() 
      }, ...leads];
    }
    
    saveLeads(newLeads);
    setShowModal(false);
    
    const savedLead = currentLead.id ? currentLead : newLeads[0];
    handleStatusChangeSideEffects(savedLead, currentLead.status, oldStatus);
    
    setCurrentLead({ id: '', name: '', phone: '', status: 'New Lead', notes: '', nextFollowUp: '', lastContacted: '', clientType: 'Generic', leadSource: 'Organic', priority: 'Warm', messageTemplate: 'Intro', service: '', offer: '', customMessage: '' });
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this lead?')) {
      saveLeads(leads.filter(l => l.id !== id));
    }
  };

  const sendWhatsApp = (lead) => {
    const template = lead.customMessage || getSmartTemplate(lead);
    const message = template;
    const encodedMessage = encodeURIComponent(message);
    
    // Auto-update last contacted
    const updatedLeads = leads.map(l => {
      if(l.id === lead.id) {
        return { ...l, lastContacted: new Date().toISOString().split('T')[0] };
      }
      return l;
    });
    saveLeads(updatedLeads);

    window.open(`https://wa.me/${lead.phone}?text=${encodedMessage}`, '_blank');
    
    // Prompt for next follow up
    setTimeout(() => {
      if(window.confirm('Schedule next follow-up for this lead?')) {
        const nextDate = new window.Date();
        nextDate.setDate(nextDate.getDate() + 3); // Default 3 days
        
        const finalLeads = updatedLeads.map(l => {
          if(l.id === lead.id) {
            return { ...l, nextFollowUp: nextDate.toISOString().split('T')[0] };
          }
          return l;
        });
        saveLeads(finalLeads);
      }
    }, 2000);
  };

  const moveLead = (leadId, newStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const oldStatus = lead.status;
    const newLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    saveLeads(newLeads);
    handleStatusChangeSideEffects(lead, newStatus, oldStatus);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
    const matchesType = clientTypeFilter === 'All' || l.clientType === clientTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = (data, prefix) => {
    if (data.length === 0) return alert('No leads to export');
    const headers = ['name', 'phone', 'status', 'nextFollowUp', 'clientType', 'leadSource', 'priority', 'service', 'offer', 'notes'];
    const csvContent = [
      headers.join(','),
      ...data.map(lead => headers.map(header => `"${String(lead[header] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${prefix}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportAllToCSV = () => handleExportCSV(leads, 'srd_leads_all');
  const exportFilteredToCSV = () => handleExportCSV(filteredLeads, 'srd_leads_filtered');

  const backupJSON = () => {
    if (leads.length === 0) return alert('No leads to backup');
    const dataStr = JSON.stringify(leads, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `srd_leads_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New Lead': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Contacted': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Interested': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Proposal Sent': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'Won': return 'bg-green-100 text-green-600 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const stages = ['New Lead', 'Contacted', 'Interested', 'Proposal Sent', 'Won', 'Lost'];

  const renderTable = (leadsData) => (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-50">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
            <th className="pb-4 px-4 pt-4">Lead Info</th>
            <th className="pb-4 px-4 pt-4">Status</th>
            <th className="pb-4 px-4 pt-4">Follow-up</th>
            <th className="pb-4 px-4 pt-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leadsData.length === 0 ? (
            <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold">No leads found.</td></tr>
          ) : (
            leadsData.map(lead => (
              <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex gap-2 items-center">
                    <p className="font-black text-slate-800 text-lg uppercase italic">{lead.name}</p>
                    {lead.priority && (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                        lead.priority === 'Hot' ? 'bg-red-100 text-red-600' :
                        lead.priority === 'Warm' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>{lead.priority}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500">{lead.phone}</p>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {lead.nextFollowUp ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg w-max">
                      <Calendar size={12} /> {new Date(lead.nextFollowUp).toLocaleDateString()}
                    </div>
                  ) : <span className="text-xs font-bold text-slate-400">-</span>}
                </td>
                <td className="py-4 px-4 flex justify-end gap-2">
                  <button onClick={() => sendWhatsApp(lead)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Send WhatsApp">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={() => { setIsMessageEdited(!!lead.customMessage); setCurrentLead(lead); setShowModal(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(lead.id)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
            Leads <span className="text-orange-600">.</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Manage Prospects & Pipeline</p>
            <span className="bg-green-100 text-green-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-green-200">
              <Database size={10} /> Data Backup Ready
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button onClick={exportAllToCSV} className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-green-600 hover:bg-white rounded-xl transition-all" title="Export All to CSV">
              <Download size={14} /> All
            </button>
            <div className="w-px bg-slate-200 my-1"></div>
            <button onClick={exportFilteredToCSV} className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all" title="Export Filtered to CSV">
              <Download size={14} /> Filtered
            </button>
            <div className="w-px bg-slate-200 my-1"></div>
            <button onClick={backupJSON} className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-purple-600 hover:bg-white rounded-xl transition-all" title="Backup JSON">
              <Database size={14} /> JSON
            </button>
          </div>

          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
              <List size={20} />
            </button>
            <button onClick={() => setViewMode('pipeline')} className={`p-2 rounded-xl transition-all ${viewMode === 'pipeline' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid size={20} />
            </button>
          </div>
          <button 
            onClick={() => { setIsMessageEdited(false); setCurrentLead({ id: '', name: '', phone: '', status: 'New Lead', notes: '', nextFollowUp: '', lastContacted: '', clientType: 'Generic', leadSource: 'Organic', priority: 'Warm', messageTemplate: 'Intro', service: '', offer: '', customMessage: '' }); setShowModal(true); }}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-200 uppercase hover:scale-105 transition-all"
          >
            <Plus size={16} /> New Lead
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
          <div className="flex-1 flex items-center gap-4">
            <Search className="text-slate-400 ml-2" size={20} />
            <input 
              type="text" 
              placeholder="Search leads by name or phone..." 
              className="bg-transparent border-none outline-none w-full font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <select 
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-600 text-sm cursor-pointer"
            >
              {clientTypes.map(type => (
                <option key={type} value={type}>{type === 'All' ? 'All Client Types' : type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {clientTypes.map(type => {
            const count = type === 'All' ? leads.length : leads.filter(l => l.clientType === type).length;
            const isSelected = clientTypeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setClientTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
                  isSelected 
                    ? 'bg-orange-100 text-orange-600 border border-orange-200' 
                    : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {type}
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                  isSelected ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          
          <div className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={groupByType} onChange={e => setGroupByType(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              Group View
            </label>
          </div>
        </div>

        {viewMode === 'list' ? (
          groupByType ? (
            <div className="space-y-8">
              {clientTypes.filter(type => type !== 'All').filter(type => clientTypeFilter === 'All' || clientTypeFilter === type).map(type => {
                const typeLeads = filteredLeads.filter(l => l.clientType === type);
                if (typeLeads.length === 0) return null;
                return (
                  <div key={type} className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h3 className="text-lg font-black text-slate-700 uppercase italic mb-4 flex items-center gap-2">
                      {type} <span className="bg-white text-slate-400 text-xs px-2 py-1 rounded-lg border border-slate-100 not-italic shadow-sm">{typeLeads.length}</span>
                    </h3>
                    {renderTable(typeLeads)}
                  </div>
                );
              })}
            </div>
          ) : (
            renderTable(filteredLeads)
          )
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {stages.map(stage => (
              <div key={stage} className="min-w-[280px] w-full bg-slate-50 rounded-[2rem] p-4 border border-slate-100 flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className={`text-xs font-black uppercase tracking-widest ${getStatusColor(stage).split(' ')[1]}`}>{stage}</h3>
                  <span className="bg-white text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    {filteredLeads.filter(l => l.status === stage).length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {filteredLeads.filter(l => l.status === stage).map(lead => (
                    <motion.div layout key={lead.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1">
                          <h4 className="font-black text-slate-800 text-sm uppercase italic">{lead.name}</h4>
                          {lead.priority && (
                            <span className={`text-[8px] font-black w-max uppercase px-2 py-0.5 rounded-md ${
                              lead.priority === 'Hot' ? 'bg-red-100 text-red-600' :
                              lead.priority === 'Warm' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>{lead.priority}</span>
                          )}
                        </div>
                        <button onClick={() => sendWhatsApp(lead)} className="text-green-500 hover:scale-110 transition-transform">
                          <MessageCircle size={16} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mb-3">{lead.phone}</p>
                      
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mb-4 w-max">
                          <Calendar size={10} /> Due: {new Date(lead.nextFollowUp).toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t border-slate-50">
                        <select 
                          value={lead.status} 
                          onChange={(e) => moveLead(lead.id, e.target.value)}
                          className={`text-[9px] font-black uppercase tracking-widest bg-slate-50 rounded-lg p-1 outline-none flex-1 cursor-pointer ${getStatusColor(lead.status).split(' ')[1]}`}
                        >
                          {stages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => { setIsMessageEdited(!!lead.customMessage); setCurrentLead(lead); setShowModal(true); }} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:text-blue-600 transition-colors">
                          <Edit size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[3rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic mb-6">
              {currentLead.id ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input type="text" value={currentLead.name} onChange={e => setCurrentLead({...currentLead, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                <input type="text" value={currentLead.phone} onChange={e => setCurrentLead({...currentLead, phone: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" placeholder="Enter phone" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                <select value={currentLead.status} onChange={e => setCurrentLead({...currentLead, status: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold appearance-none">
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Follow-up Date</label>
                <input type="date" value={currentLead.nextFollowUp} onChange={e => setCurrentLead({...currentLead, nextFollowUp: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Type</label>
                <select value={currentLead.clientType} onChange={e => setCurrentLead({...currentLead, clientType: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold appearance-none">
                  {['Real Estate', 'Digital Marketing', 'Dentist', 'Coaching', 'AI Course', 'Generic'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Source</label>
                <select value={currentLead.leadSource} onChange={e => setCurrentLead({...currentLead, leadSource: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold appearance-none">
                  {['Meta Ads', 'WhatsApp', 'Referral', 'Organic', 'Outreach'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                <select value={currentLead.priority} onChange={e => setCurrentLead({...currentLead, priority: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold appearance-none">
                  {['Hot', 'Warm', 'Cold'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Template</label>
                <select value={currentLead.messageTemplate} onChange={e => setCurrentLead({...currentLead, messageTemplate: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold appearance-none">
                  {['Intro', 'Follow-up', 'Proposal', 'Closing'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Interest</label>
                <input type="text" value={currentLead.service} onChange={e => setCurrentLead({...currentLead, service: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" placeholder="E.g. SEO, Website..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Offer</label>
                <input type="text" value={currentLead.offer} onChange={e => setCurrentLead({...currentLead, offer: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" placeholder="E.g. 20% Off..." />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</label>
              <textarea value={currentLead.notes} onChange={e => setCurrentLead({...currentLead, notes: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold resize-none h-16" placeholder="Any details..." />
            </div>

            <div className="mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MessageCircle size={12}/> Live Smart Template Preview
                </label>
                <button onClick={() => { setIsMessageEdited(false); setCurrentLead({...currentLead, customMessage: getSmartTemplate(currentLead)}); }} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700">
                  Regenerate
                </button>
              </div>
              <textarea 
                value={currentLead.customMessage} 
                onChange={e => { setIsMessageEdited(true); setCurrentLead({...currentLead, customMessage: e.target.value}); }} 
                className="w-full p-4 rounded-2xl bg-white border-none outline-none font-bold text-sm text-slate-600 resize-none h-28 shadow-sm" 
                placeholder="Message preview..." 
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 p-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
              <button onClick={handleSave} className="flex-1 p-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-slate-200 hover:scale-105 transition-all">Save Lead</button>
              <button onClick={() => { handleSave(); sendWhatsApp(currentLead); }} className="flex-1 p-4 bg-green-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-green-200 hover:scale-105 transition-all">Save & Send</button>
            </div>
          </motion.div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

export default Leads;
