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
    window.api.loadServices().then(s => s && setServices(s));
    window.api.getLocalIp().then(ip => setLocalIp(ip));
  }, []);

  useEffect(() => {
    window.api.saveServices(services);
  }, [services]);

  const handleSave = svc => {
    if (editing) {
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, ...svc } : s));
    } else {
      setServices(prev => [...prev, {
        id: Date.now(),
        ...svc,
        status: 'stopped',
        pid: null
      }]);
    }
    setEditing(null);
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
    setServices(prev => prev.filter(s => s.id !== svc.id));
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


import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AddServiceModal from './components/AddServiceModal'
import './index.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faPlay,
  faStop,
  faEdit,
  faTrash,
  faCopy,
  faSearch,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons'

export default function App() {
  const [services, setServices] = useState([])
  const [localIp, setLocalIp] = useState('localhost')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const suggestedPort = 8080

  // Toggle dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Load persisted services + IP
  useEffect(() => {
    window.api.loadServices().then(saved => {
      if (saved){
        const reset = saved.map(s => ({ ...s, status: 'stopped' }))
        setServices(saved)
      }
    })
    window.api.getLocalIp().then(ip => setLocalIp(ip))
  }, [])

  // Save on change
  useEffect(() => {
    window.api.saveServices(services)
  }, [services])

  // Filter by search
  const visible = services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  // Add / Edit service
  const handleSave = svc => {
    if (editing) {
      setServices(prev =>
        prev.map(s =>
          s.id === svc.id ? { ...s, title: svc.title, folder: svc.folder, port: svc.port } : s
        )
      )
    } else {
      setServices(prev => [
        ...prev,
        { id: Date.now(), title: svc.title, folder: svc.folder, port: svc.port, status: 'stopped' }
      ])
    }
    setEditing(null)
    setModalOpen(false)
  }

  // Start service
  const handleStart = async s => {
    try {
      const { id, status } = await window.api.startService(s)
      setServices(prev =>
        prev.map(x => (x.id === id ? { ...x, status } : x))
      )
    } catch (err) {
      console.error('start failed', err)
    }
  }

  const handleStop = async svc => {
  try {
    const { id, status } = await window.api.stopService(svc.id);
    setServices(prev =>
      prev.map(x => (x.id === id ? { ...x, status } : x))
    );
  } catch (err) {
    console.error('stop failed', err);
  }
};

  // Delete service
  const handleDelete = s => {
    // if running, stop it first
    if (s.status === 'running') {
      window.api.stopService(s.id).catch(() => {})
    }
    setServices(prev => prev.filter(x => x.id !== s.id))
  }

  // Copy / Open
  const openLink = url => window.api.openUrl(url)
  const copyToClipboard = txt => navigator.clipboard.writeText(txt)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          PortLoc
        </h1>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search services…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-3 pr-10 py-2 w-64 rounded-lg border focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          {/* Theme */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            title="Toggle theme"
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
          {/* Add */}
          <button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add</span>
          </button>
        </div>
      </header>

      <main className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {visible.map(s => {
            const localhostUrl = `http://localhost:${s.port}`
            const lanUrl = `http://${localIp}:${s.port}`

            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {s.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
                    {s.folder.split(/[\\/]/).pop()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        s.status === 'running'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Port: {s.port}
                    </span>
                  </div>
                </div>

                {/* Links */}
                <div className="mt-4 space-y-2 text-sm">
                  {[localhostUrl, lanUrl].map(url => (
                    <div
                      key={url}
                      className="flex justify-between items-center"
                    >
                      <a
                        onClick={() => openLink(url)}
                        className="text-blue-600 dark:text-blue-400 underline truncate cursor-pointer"
                        title={url}
                      >
                        {url}
                      </a>
                      <button onClick={() => copyToClipboard(url)}>
                        <FontAwesomeIcon
                          icon={faCopy}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-2">
                 {s.status === 'running' ? (
  <button
    onClick={() => handleStop(s)}
    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
  >
    <FontAwesomeIcon icon={faStop} className="mr-2" />
    Stop
  </button>
) : (
  <button
    onClick={() => handleStart(s)}
    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
  >
    <FontAwesomeIcon icon={faPlay} className="mr-2" />
    Start
  </button>
)}
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </main>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        suggestedPort={suggestedPort}
        initial={editing}
      />
    </div>
  )
}
