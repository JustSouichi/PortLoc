/*
import React, { useState, useEffect } from 'react';
import AddServiceModal from './components/AddServiceModal';
import './index.css';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [services, setServices] = useState([]);
    const [editing, setEditing] = useState(null); 
  // editing: null o il service da modificare

  // apri il modale in edit mode
  const handleEdit = svc => {
    setEditing(svc);
    setModalOpen(true);
  };

  const suggestedPort = 8080;

  // 1) Carica all’avvio
  useEffect(() => {
    window.api.loadServices().then(saved => {
      setServices(saved || []);
    });
  }, []);

  // 2) Salva ogni volta che services cambia
  useEffect(() => {
    window.api.saveServices(services);
  }, [services]);

  const handleSave = svc => {
    const newSvc = { id: Date.now(), ...svc, status: 'stopped', pid: null };
    setServices(prev => [...prev, newSvc]);
  };

  const handleStart = async svc => {
    const result = await window.api.startService(svc);
    setServices(prev =>
      prev.map(s => (s.id === svc.id ? { ...s, pid: result.pid, status: result.status } : s))
    );
  };

  const handleStop = async svc => {
    const result = await window.api.stopService(svc.pid);
    setServices(prev =>
      prev.map(s => (s.id === svc.id ? { ...s, pid: null, status: result.status } : s))
    );
  };

    // Rimuovi un servizio dalla lista
  const handleDelete = svc => {
    // Se il servizio è in esecuzione, fermalo prima
    if (svc.pid) {
      window.api.stopService(svc.pid);
    }
    setServices(prev => prev.filter(s => s.id !== svc.id));
  };


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">PortLoc</h1>
      <button
        className="mb-4 px-4 py-2 bg-white text-sky-500 rounded"
        onClick={() => setModalOpen(true)}
      >
        + Add Service
      </button>
      <AddServiceModal
  isOpen={modalOpen}
  onClose={() => { setModalOpen(false); setEditing(null); }}
  onSave={ svc => {
    if (editing) {
      // modifica
      setServices(prev =>
        prev.map(s => (s.id === svc.id ? { ...s, ...svc } : s))
      );
    } else {
      handleSave(svc);
    }
    setEditing(null);
  }}
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
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.title}</td>
                <td className="border px-4 py-2">{s.port}</td>
                <td className="border px-4 py-2">{s.folder.split(/[\\/]/).pop()}</td>
                <td className="border px-4 py-2">{s.status}</td>
                <td className="border px-4 py-2">
                  {s.status === 'stopped' ? (
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded"
                      onClick={() => handleStart(s)}
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleStop(s)}
                    >
                      Stop
                    </button>
                  )}
                  <button
    className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
    onClick={() => handleEdit(s)}
  >Edit</button>
                 
    <button
    className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
    onClick={() => handleDelete(s)}
  >
    Delete
  </button>
   
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


*/


import React, { useState, useEffect } from 'react';
import AddServiceModal from './components/AddServiceModal';
import './index.css';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPlay,
  faStop,
  faTrash,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const suggestedPort = 8080;

  // Load / Save persistence
  useEffect(() => {
    window.api.loadServices().then(saved => saved && setServices(saved));
  }, []);
  useEffect(() => {
    window.api.saveServices(services);
  }, [services]);

  const handleSave = svc => {
    const newSvc = {
      id: Date.now(),
      title: svc.title,
      folder: svc.folder,
      port: svc.port,
      status: 'stopped',
      pid: null,
    };
    setServices(prev => [...prev, newSvc]);
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
      prev.map(s =>
        s.id === svc.id ? { ...s, pid: null, status } : s
      )
    );
  };
  const handleDelete = svc => {
    if (svc.pid) window.api.stopService(svc.pid);
    setServices(prev => prev.filter(s => s.id !== svc.id));
  };
  const [editing, setEditing] = useState(null);
  const handleEdit = svc => {
    setEditing(svc);
    setModalOpen(true);
  };

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
        key={editing?.id || 'new'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={svc => {
          if (editing) {
            setServices(prev =>
              prev.map(s => (s.id === svc.id ? { ...s, ...svc } : s))
            );
          } else {
            handleSave(svc);
          }
          setEditing(null);
        }}
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
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.title}</td>
                <td className="border px-4 py-2">{s.port}</td>
                <td className="border px-4 py-2">
                  {s.folder.split(/[\\/]/).pop()}
                </td>
                <td className="border px-4 py-2">{s.status}</td>
                <td className="border px-4 py-2 space-x-2">
                  {s.status === 'stopped' ? (
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded"
                      onClick={() => handleStart(s)}
                    >
                      <FontAwesomeIcon icon={faPlay} />
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleStop(s)}
                    >
                      <FontAwesomeIcon icon={faStop} />
                    </button>
                  )}
                  <button
                    className="px-2 py-1 bg-yellow-400 text-white rounded"
                    onClick={() => handleEdit(s)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-300 text-black rounded"
                    onClick={() => handleDelete(s)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
