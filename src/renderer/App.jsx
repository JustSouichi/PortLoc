import React, { useState } from 'react';
import AddServiceModal from './components/AddServiceModal';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const suggestedPort = 8080;

  const handleSave = svc => {
    const newSvc = { id: Date.now(), title: svc.title, folder: svc.folder, port: svc.port, status: 'stopped', pid: null };
    setServices(prev => [...prev, newSvc]);
  };

  const handleStart = async svc => {
    const result = await window.api.startService(svc);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, pid: result.pid, status: result.status } : s));
  };

  const handleStop = async svc => {
    const result = await window.api.stopService(svc.pid);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, pid: null, status: result.status } : s));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">PortLoc</h1>
      <button className="mb-4 px-4 py-2 bg-white text-sky-500 rounded" onClick={() => setModalOpen(true)}>+ Add Service</button>
      <AddServiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} suggestedPort={suggestedPort} />
      {services.length > 0 && (
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead><tr className="text-left bg-gray-100"><th className="px-4 py-2">Title</th><th className="px-4 py-2">Port</th><th className="px-4 py-2">Folder</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Action</th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.title}</td>
                <td className="border px-4 py-2">{s.port}</td>
                <td className="border px-4 py-2">{s.folder.split(/[\/]/).pop()}</td>
                <td className="border px-4 py-2">{s.status}</td>
                <td className="border px-4 py-2">
                  {s.status === 'stopped' ? <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handleStart(s)}>Start</button> : <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleStop(s)}>Stop</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}