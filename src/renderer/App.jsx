/*
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
      
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">PortLoc Dashboard</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transform hover:-translate-y-0.5 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Service
        </button>
      </header>

   
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

  // Compute next available port starting from 8080
  const suggestedPort = useMemo(() => {
    const basePort = 8080;
    const used = services.map(s => s.port);
    let port = basePort;
    while (used.includes(port)) port++;
    return port;
  }, [services]);

  // Load stored services & local IP
  useEffect(() => {
    (async () => {
      const raw = await window.api.loadServices();
      if (!raw) return;
      const initial = raw.map(svc => ({ ...svc, status: 'stopped', pid: null }));
      setServices(initial);
    })();
    window.api.getLocalIp().then(setLocalIp);
  }, []);

  // Filtered list by search
  const filtered = useMemo(
    () => services.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase())
    ),
    [services, search]
  );

  // Save or update a service, ensuring no duplicate ports
  const handleSave = svc => {
    // Check for port conflicts (excluding self when editing)
    const conflict = services.some(s => s.port === svc.port && s.id !== svc.id);
    const portToUse = conflict ? suggestedPort : svc.port;
    const svcClean = { ...svc, port: portToUse };

    let updated;
    if (editing) {
      updated = services.map(s =>
        s.id === svc.id ? { ...s, ...svcClean } : s
      );
    } else {
      updated = [...services, { id: Date.now(), ...svcClean, status: 'stopped', pid: null }];
    }

    setServices(updated);
    // Persist only static fields
    window.api.saveServices(
      updated.map(({ id, title, port, folder }) => ({ id, title, port, folder }))
    );

    setEditing(null);
    setModalOpen(false);
  };

  // Update status field for a given service
  const setStatus = (id, patch) => {
    setServices(list =>
      list.map(s => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  // Handlers for start, stop, delete
  const handleStart = async svc => {
    setStatus(svc.id, { status: 'starting' });
    const { pid, status } = await window.api.startService(svc);
    setStatus(svc.id, { pid, status });
  };

  const handleStop = async svc => {
    setStatus(svc.id, { status: 'stopping' });
    const { status } = await window.api.stopService(svc.pid);
    setStatus(svc.id, { status, pid: null });
  };

  const handleDelete = svc => {
    if (svc.pid) window.api.stopService(svc.pid);
    const filteredOut = services.filter(s => s.id !== svc.id);
    setServices(filteredOut);
    window.api.saveServices(
      filteredOut.map(({ id, title, port, folder }) => ({ id, title, port, folder }))
    );
  };

  // Copy a URL to clipboard
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

      {/* Services table */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {['Title', 'Port', 'Folder', 'Status', 'Links', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
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
                      {(svc.status === 'starting' || svc.status === 'stopping') && (
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                      )}
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
                        className="p-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-lg shadow transform hover:-translate-y-0.5 transition"
                        title="Start"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStop(svc)}
                        className="p-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-lg shadow transform hover:-translate-y-0.5 transition"
                        title="Stop"
                      >
                        <FontAwesomeIcon icon={faStop} />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditing(svc); setModalOpen(true); }}
                      className="p-2 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-lg shadow transform hover:-translate-y-0.5 transition"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(svc)}
                      className="p-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg shadow transform hover:-translate-y-0.5 transition"
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
