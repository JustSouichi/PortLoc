/*
import React, { useState, useEffect } from 'react';

export default function AddServiceModal({ isOpen, onClose, onSave, suggestedPort, initial = null }) {
const [title, setTitle] = useState(initial?.title || '');
  const [folder, setFolder] = useState(initial?.folder || '');
  const [port, setPort] = useState(initial?.port || suggestedPort);
  const [useSuggested, setUseSuggested] = useState(!initial);

  // Apri il dialog di sistema per scegliere la cartella
  const pickFolder = async () => {
    const result = await window.api.send('dialog:open-folder');
    if (result) {
      setFolder(result);
    }
  };

  // Quando confermiamo, invochiamo onSave e resettiamo
  const handleSubmit = () => {
    onSave({ ...initial, title, folder, port });
    // reset
    setTitle(''); setFolder(''); setPort(suggestedPort); setUseSuggested(true);
    onClose();
  };

  useEffect(() => {
  setTitle(initial?.title || '');
  setFolder(initial?.folder || '');
  setPort(initial?.port || suggestedPort);
  setUseSuggested(!initial);
}, [initial]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Service</h2>

     
        <label className="block mb-3">
          <span className="text-gray-700">Title</span>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="My Local Site"
          />
        </label>

        <label className="block mb-3">
          <span className="text-gray-700">Folder</span>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l px-2 py-1 focus:outline-none"
              value={folder}
              readOnly
              placeholder="Select a folder…"
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-3 rounded-r hover:bg-blue-600"
              onClick={pickFolder}
            >
              Browse…
            </button>
          </div>
        </label>

       
        <label className="block mb-3">
          <span className="text-gray-700">Port</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none"
              value={port}
              disabled={useSuggested}
              onChange={e => setPort(Number(e.target.value))}
            />
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={useSuggested}
                onChange={e => setUseSuggested(e.target.checked)}
              />
              <span className="text-gray-700 text-sm">Suggested</span>
            </label>
          </div>
        </label>

       
        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!title || !folder}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
*/

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

export default function AddServiceModal({
  isOpen,
  onClose,
  onSave,
  suggestedPort,
  initial = null
}) {
  const [title,  setTitle]  = useState(initial?.title  || '');
  const [folder, setFolder] = useState(initial?.folder || '');
  const [port,   setPort]   = useState(initial?.port   || suggestedPort);
  const [useSuggested, setUseSuggested] = useState(!initial);

  useEffect(() => {
    setTitle(initial?.title  || '');
    setFolder(initial?.folder || '');
    setPort(initial?.port     || suggestedPort);
    setUseSuggested(!initial);
  }, [initial, suggestedPort]);

  const pickFolder = async () => {
    const result = await window.api.send('dialog:open-folder');
    if (result) setFolder(result);
  };

  const handleSubmit = () => {
    onSave({ ...initial, title, folder, port });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-80 p-6 shadow-lg transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {initial ? 'Edit Service' : 'Add Service'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="My Local Site"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Folder</label>
            <div className="flex">
              <input
                type="text"
                value={folder}
                readOnly
                placeholder="Select folder..."
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-l-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <button
                onClick={pickFolder}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg transition"
                title="Browse"
              >
                <FontAwesomeIcon icon={faFolderOpen} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Port</label>
              <input
                type="number"
                value={port}
                disabled={useSuggested}
                onChange={e => setPort(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>
            <label className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={useSuggested}
                onChange={e => setUseSuggested(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span>Use suggested</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !folder}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition"
          >
            {initial ? 'Save Changes' : 'Add Service'}
          </button>
        </div>
      </div>
    </div>
  );
}
