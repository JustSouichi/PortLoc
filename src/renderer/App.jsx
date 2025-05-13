// src/renderer/App.jsx

import React, { useState, useEffect } from 'react';
import AddServiceModal from './components/AddServiceModal';
import './index.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPlay,
  faStop,
  faEdit,
  faTrash,
  faCopy
} from '@fortawesome/free-solid-svg-icons';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [services, setServices] = useState([]);
  const [localIp, setLocalIp] = useState('localhost');
  const suggestedPort = 8080;

  // Carica servizi e IP LAN
  useEffect(() => {
    window.api.loadServices().then(saved => saved && setServices(saved));
    window.api.getLocalIp().then(ip => setLocalIp(ip));
  }, []);

  // Persisti servizi
  useEffect(() => {
    window.api.saveServices(services);
  }, [services]);

  const handleSave = svc => {
    if (editing) {
      setServices(prev =>
        prev.map(s => (s.id === svc.id ? { ...s, ...svc } : s))
      );
    } else {
      setServices(prev => [
        ...prev,
        { id: Date.now(), ...svc, status: 'stopped', pid: null }
      ]);
    }
    setEditing(null);
  };

  const handleStart = async svc => {
    const { pid, status } = await window.api.startService(svc);
    setServices(prev =>
      prev.map(s => (s.id === svc.id ? { ...s, pid, status } : s))
    );
  };
  const handleStop = async svc => {
    const { status } = await window.api.stopService(svc.pid);
    setServices(prev =>
      prev.map(s => (s.id === svc.id ? { ...s, pid: null, status } : s))
    );
  };
  const handleDelete = svc => {
    if (svc.pid) window.api.stopService(svc.pid);
    setServices(prev => prev.filter(s => s.id !== svc.id));
  };
  const handleEdit = svc => {
    setEditing(svc);
    setModalOpen(true);
  };

  const copyToClipboard = text => navigator.clipboard.writeText(text);
  const openInBrowser = url => window.api.openExternal(url);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">PortLoc</h1>
      <button
        className="mb-4 px-4 py-2 bg-white text-sky-500 rounded flex items-center space-x-2"
        onClick={() => { setEditing(null); setModalOpen(true); }}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Add Service</span>
      </button>

      <AddServiceModal
        key={editing?.id ?? 'new'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        suggestedPort={suggestedPort}
        initial={editing}
      />

      {services.length > 0 && (
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Port</th>
              <th className="px-4 py-2">Folder</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Links</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => {
              const localhostUrl = `http://localhost:${s.port}`;
              const lanUrl = `http://${localIp}:${s.port}`; // <–– qui usa l'IP effettivo

              return (
                <tr key={s.id}>
                  <td className="border px-4 py-2">{s.title}</td>
                  <td className="border px-4 py-2">{s.port}</td>
                  <td className="border px-4 py-2">
                    {s.folder.split(/[\\/]/).pop()}
                  </td>
                  <td className="border px-4 py-2">{s.status}</td>

                  {/* LINKS */}
                  <td className="border px-4 py-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 underline">
                        {localhostUrl}
                      </span>
                      <button onClick={() => openInBrowser(localhostUrl)} title="Open localhost">
                        🔗
                      </button>
                      <button onClick={() => copyToClipboard(localhostUrl)} title="Copy localhost">
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 underline">
                        {lanUrl}
                      </span>
                      <button onClick={() => openInBrowser(lanUrl)} title="Open LAN">
                        🔗
                      </button>
                      <button onClick={() => copyToClipboard(lanUrl)} title="Copy LAN">
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="border px-4 py-2 flex space-x-2">
                    {s.status === 'stopped' ? (
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded"
                        onClick={() => handleStart(s)}
                        title="Start"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => handleStop(s)}
                        title="Stop"
                      >
                        <FontAwesomeIcon icon={faStop} />
                      </button>
                    )}
                    <button
                      className="px-2 py-1 bg-yellow-400 text-white rounded"
                      onClick={() => handleEdit(s)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-300 text-black rounded"
                      onClick={() => handleDelete(s)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
