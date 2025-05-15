/*
import React, { useState, useEffect } from 'react';
import AddServiceModal from './components/AddServiceModal';
import './index.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faPlay, faStop, faEdit, faTrash, faCopy
} from '@fortawesome/free-solid-svg-icons';

export default function App() {
  const [services, setServices] = useState([]);
  const [localIp, setLocalIp] = useState('localhost');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const suggestedPort = 8080;

  useEffect(() => {
    //window.api.loadServices().then(s => s && setServices(s));
    

   window.api.loadServices().then(s => {
     if (s) {
       // Riporta tutti i servizi a stopped/idle allo startup
       const resetServices = s.map(svc => ({
         ...svc,
         status: 'stopped',
         pid: null
      }));
       setServices(resetServices);
       // (opzionale) risalva subito, in modo che in store
       // non rimangano status errati
      window.api.saveServices(resetServices);
     }

    })
    
    window.api.getLocalIp().then(ip => setLocalIp(ip));
  }, []);


    const persist = arr => arr.map(({id, title, port, folder}) => ({id, title, port, folder}));


  const handleSave = svc => {
   
     let updated;
    if (editing) {
      updated = services.map(s => s.id === svc.id ? { ...s, ...svc } : s);
    } else {
     updated = [
        ...services,
       { id: Date.now(), ...svc, status: 'stopped', pid: null }
      ];
    }
    setServices(updated);
    // salvo sul disco SOLO i campi statici
    window.api.saveServices(persist(updated));
    setEditing(null);
    setModalOpen(false);
  };

  const handleStart = async svc => {
    const { pid, status } = await window.api.startService(svc);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, pid, status } : s));
  };
  const handleStop = async svc => {
    const { status } = await window.api.stopService(svc.pid);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, pid: null, status } : s));
  };

  const handleDelete = svc => {
    if (svc.pid) window.api.stopService(svc.pid);

   const updated = services.filter(s => s.id !== svc.id);
    setServices(updated);
    window.api.saveServices(persist(updated));
  };
  const handleEdit = svc => {
    setEditing(svc);
    setModalOpen(true);
  };

  const openLink = url => window.api.openUrl(url);
  const copyToClipboard = txt => navigator.clipboard.writeText(txt);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">PortLoc</h1>
      <button
        className="mb-4 px-4 py-2 bg-white text-sky-500 rounded flex items-center space-x-2"
        onClick={() => { setEditing(null); setModalOpen(true); }}
      >
        <FontAwesomeIcon icon={faPlus} /><span>Add Service</span>
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
              const lanUrl       = `http://${localIp}:${s.port}`;
              return (
                <tr key={s.id}>
                  <td className="border px-4 py-2">{s.title}</td>
                  <td className="border px-4 py-2">{s.port}</td>
                  <td className="border px-4 py-2">{s.folder.split(/[\\/]/).pop()}</td>
                  <td className="border px-4 py-2">{s.status}</td>
                  <td className="border px-4 py-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); openLink(localhostUrl); }}
                        className="text-blue-600 underline cursor-pointer"
                      >
                        {localhostUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(localhostUrl)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Copy"
                      >
                        <FontAwesomeIcon icon={faCopy}/>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); openLink(lanUrl); }}
                        className="text-blue-600 underline cursor-pointer"
                      >
                        {lanUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(lanUrl)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Copy"
                      >
                        <FontAwesomeIcon icon={faCopy}/>
                      </button>
                    </div>
                  </td>
                  <td className="border px-4 py-2 flex space-x-2">
                    {s.status === 'stopped' ? (
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded"
                        onClick={() => handleStart(s)}
                        title="Start"
                      >
                        <FontAwesomeIcon icon={faPlay}/>
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => handleStop(s)}
                        title="Stop"
                      >
                        <FontAwesomeIcon icon={faStop}/>
                      </button>
                    )}
                    <button
                      className="px-2 py-1 bg-yellow-400 text-white rounded"
                      onClick={() => handleEdit(s)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit}/>
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-300 text-black rounded"
                      onClick={() => handleDelete(s)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash}/>
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
*/






import React, { useState, useEffect, useMemo } from 'react';
import AddServiceModal from './components/AddServiceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPlay,
  faStop,
  faEdit,
  faTrash,
  faCopy,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

export default function App() {
  const [services, setServices] = useState([]);
  const [localIp, setLocalIp] = useState('localhost');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const suggestedPort = 8080;

  // Load services & local IP
  useEffect(() => {
    window.api.loadServices().then(raw => {
      if (!raw) return;
      const reset = raw.map(svc => ({ ...svc, status: 'stopped', pid: null }));
      setServices(reset);
      window.api.saveServices(
        reset.map(({ id, title, port, folder }) => ({ id, title, port, folder }))
      );
    });
    window.api.getLocalIp().then(setLocalIp);
  }, []);

  // Filtered list
  const filtered = useMemo(
    () => services.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase())
    ),
    [services, search]
  );

  // Save / Edit handler
  const handleSave = svc => {
    const updated = editing
      ? services.map(s => (s.id === svc.id ? { ...s, ...svc } : s))
      : [...services, { id: Date.now(), ...svc, status: 'stopped', pid: null }];

    setServices(updated);
    window.api.saveServices(
      updated.map(({ id, title, port, folder }) => ({ id, title, port, folder }))
    );
    setEditing(null);
    setModalOpen(false);
  };

  // Service start/stop/delete
  const setStatus = (id, patch) => {
    setServices(list =>
      list.map(s => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const handleStart = async svc => {
    setStatus(svc.id, { status: 'starting' });
    const { pid, status } = await window.api.startService(svc);
    setStatus(svc.id, { pid, status });
  };

  const handleStop = async svc => {
    setStatus(svc.id, { status: 'stopping' });
    const { status } = await window.api.stopService(svc.pid);
    setStatus(svc.id, { pid: null, status });
  };

  const handleDelete = svc => {
    if (svc.pid) window.api.stopService(svc.pid);
    const updated = services.filter(s => s.id !== svc.id);
    setServices(updated);
    window.api.saveServices(
      updated.map(({ id, title, port, folder }) => ({ id, title, port, folder }))
    );
  };

  // Copy URL
  const copyLink = url => navigator.clipboard.writeText(url);

  return (
    <div className="min-h-screen p-6 bg-gray-50 transition-colors">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">PortLoc Dashboard</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transform hover:-translate-y-0.5 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Service
        </button>
      </header>

      {/* Search + count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 shadow-sm"
        />
        <div className="text-gray-600">
          {filtered.length} service{filtered.length !== 1 && 's'} found
        </div>
      </div>

      {/* Table without scrollbars */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {['Title', 'Port', 'Folder', 'Status', 'Links', 'Actions'].map(h => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(svc => {
              const localhostUrl = `http://localhost:${svc.port}`;
              const lanUrl = `http://${localIp}:${svc.port}`;
              return (
                <tr key={svc.id} className="hover:bg-gray-100 transition-transform transform hover:scale-[1.01]">
                  <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{svc.title}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{svc.port}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{svc.folder.split(/[\\/]/).pop()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold animate-[fadeIn_0.3s] ${
                      svc.status === 'running'  ? 'bg-green-100 text-green-800'  :
                      svc.status === 'starting' ? 'bg-yellow-100 text-yellow-800':
                      svc.status === 'stopping' ? 'bg-red-100 text-red-800'     :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(svc.status==='starting'||svc.status==='stopping') && <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />}
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1 whitespace-nowrap">
                    {[localhostUrl, lanUrl].map(url => (
                      <div key={url} className="flex items-center">
                        <a
                          href="#"
                          onClick={e => { e.preventDefault(); window.api.openUrl(url); }}
                          className="text-indigo-600 hover:underline truncate"
                        >
                          {url}
                        </a>
                        <button
                          onClick={() => copyLink(url)}
                          className="ml-2 p-1 hover:bg-gray-200 rounded-full transition"
                          title="Copy URL"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 flex space-x-2 whitespace-nowrap">
                    {svc.status !== 'running' ? (
                      <button
                        onClick={() => handleStart(svc)}
                        className="p-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-lg shadow transition-transform transform hover:-translate-y-0.5"
                        title="Start"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStop(svc)}
                        className="p-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-lg shadow transition-transform transform hover:-translate-y-0.5"
                        title="Stop"
                      >
                        <FontAwesomeIcon icon={faStop} />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditing(svc); setModalOpen(true); }}
                      className="p-2 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-lg shadow transition-transform transform hover:-translate-y-0.5"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(svc)}
                      className="p-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg shadow transition-transform transform hover:-translate-y-0.5"
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
      </div>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        suggestedPort={suggestedPort}
        initial={editing}
      />
    </div>
  );
}
