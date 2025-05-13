import React, { useState } from 'react';

export default function AddServiceModal({ isOpen, onClose, onSave, suggestedPort }) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [port, setPort] = useState(suggestedPort);
  const [useSuggested, setUseSuggested] = useState(true);

  // Apri il dialog di sistema per scegliere la cartella
  const pickFolder = async () => {
    const result = await window.api.send('dialog:open-folder');
    if (result) {
      setFolder(result);
    }
  };

  // Quando confermiamo, invochiamo onSave e resettiamo
  const handleSubmit = () => {
    onSave({ title, folder, port });
    // reset
    setTitle('');
    setFolder('');
    setPort(suggestedPort);
    setUseSuggested(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Service</h2>

        {/* Titolo */}
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

        {/* Cartella */}
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

        {/* Porta */}
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

        {/* Azioni */}
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
