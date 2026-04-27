import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, UserPlus, FileText, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    totalLeads: 0,
    totalQuotes: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [dueFollowUps, setDueFollowUps] = useState([]);

  useEffect(() => {
    // Load data from local storage
    const history = JSON.parse(localStorage.getItem('srd_history') || '[]');
    const clients = JSON.parse(localStorage.getItem('srd_clients') || '[]');
    const leads = JSON.parse(localStorage.getItem('srd_leads') || '[]');

    let revenue = 0;
    history.forEach(bill => {
      const subtotal = bill.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
      const tax = (subtotal * Number(bill.gst || 0)) / 100;
      revenue += (subtotal + tax) - Number(bill.advance || 0);
    });

    setStats({
      totalRevenue: revenue,
      totalClients: clients.length,
      totalLeads: leads.length,
      totalQuotes: history.length,
    });

    // Calculate due follow-ups from leads
    const today = new Date().toISOString().split('T')[0];
    const due = leads.filter(l => 
      l.nextFollowUp && 
      l.nextFollowUp <= today && 
      l.status !== 'Converted' && 
      l.status !== 'Lost'
    );
    // Sort by date oldest first
    due.sort((a, b) => new Date(a.nextFollowUp) - new Date(b.nextFollowUp));
    setDueFollowUps(due);

    // Mock chart data for now based on recent history or static
    const data = [
      { name: 'Mon', revenue: 4000 },
      { name: 'Tue', revenue: 3000 },
      { name: 'Wed', revenue: 2000 },
      { name: 'Thu', revenue: 2780 },
      { name: 'Fri', revenue: 1890 },
      { name: 'Sat', revenue: 2390 },
      { name: 'Sun', revenue: 3490 },
    ];
    setChartData(data);
  }, []);

  const getSmartTemplate = (lead) => {
    const type = lead.clientType || 'Generic';
    const templateType = lead.messageTemplate || 'Follow-up'; // Default to follow-up in dashboard
    
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
    
    let rawTemplate = smartTemplates[type]?.[templateType] || smartTemplates['Generic']['Follow-up'];
    
    return rawTemplate
      .replace(/{name}/g, lead.name || '[नाव]')
      .replace(/{service}/g, lead.service || '[सर्व्हिस]')
      .replace(/{offer}/g, lead.offer || '[ऑफर]')
      .replace(/{followup_date}/g, lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : '[तारीख]');
  };

  const sendWhatsApp = (lead) => {
    const message = lead.customMessage || getSmartTemplate(lead);
    window.open(`https://wa.me/${lead.phone}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Auto update last contacted in DB
    const leads = JSON.parse(localStorage.getItem('srd_leads') || '[]');
    const updatedLeads = leads.map(l => {
      if(l.id === lead.id) {
        return { ...l, lastContacted: new Date().toISOString().split('T')[0] };
      }
      return l;
    });
    localStorage.setItem('srd_leads', JSON.stringify(updatedLeads));
  };

  const kpiCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <IndianRupee size={24} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Active Clients', value: stats.totalClients, icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Leads', value: stats.totalLeads, icon: <UserPlus size={24} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Documents Generated', value: stats.totalQuotes, icon: <FileText size={24} />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
          Dashboard <span className="text-orange-600">.</span>
        </h1>
        <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-2">Overview & KPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, idx) => (
          <motion.div whileHover={{ y: -5 }} key={idx} className="bg-white p-6 rounded-[2rem] shadow-xl border border-white">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-white">
          <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic mb-8">Revenue Overview</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#fff7ed' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#ea580c" radius={[8, 8, 8, 8]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] shadow-xl border border-white flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-2">
              <Calendar className="text-orange-600" size={24} /> Due Follow-ups
            </h2>
            <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full">{dueFollowUps.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {dueFollowUps.length === 0 ? (
              <div className="text-center text-slate-400 font-bold py-10">No pending follow-ups! 🎉</div>
            ) : (
              dueFollowUps.map(lead => (
                <div key={lead.id} className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm uppercase italic">{lead.name}</h4>
                      <p className="text-xs font-bold text-slate-500">{lead.phone}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg">
                      {lead.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(lead.nextFollowUp).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => sendWhatsApp(lead)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-green-500 text-white px-3 py-1.5 rounded-xl shadow-sm hover:scale-105 transition-all"
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => navigate('/leads')}
            className="w-full mt-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            View All Leads
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
