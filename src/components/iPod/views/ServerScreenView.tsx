import React, { useState } from 'react';
import { Server, Key, User, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { subsonicApi } from '../../../services/subsonicApi';

interface ServerScreenViewProps {
  onSaved: () => void;
}

export const ServerScreenView: React.FC<ServerScreenViewProps> = ({ onSaved }) => {
  const currentConfig = subsonicApi.getConfig();
  const [serverUrl, setServerUrl] = useState(currentConfig.serverUrl || 'http://localhost:4533');
  const [username, setUsername] = useState(currentConfig.username || '');
  const [password, setPassword] = useState(currentConfig.password || '');
  const [isDemoMode, setIsDemoMode] = useState(currentConfig.isDemoMode);
  const [status, setStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleTestConnection = async () => {
    if (isDemoMode) {
      setStatus({ type: 'success', message: 'Demo mode is active (offline)' });
      return;
    }

    if (!serverUrl || !username) {
      setStatus({ type: 'error', message: 'URL and username required' });
      return;
    }

    setStatus({ type: 'testing', message: 'Connecting...' });

    subsonicApi.saveConfig({
      serverUrl,
      username,
      password,
      isDemoMode: false,
    });

    const res = await subsonicApi.ping();
    if (res.ok) {
      setStatus({ type: 'success', message: `Connected! (${res.version || 'Navidrome'})` });
    } else {
      setStatus({ type: 'error', message: res.error || 'Connection failed' });
    }
  };

  const handleSave = () => {
    subsonicApi.saveConfig({
      serverUrl,
      username,
      password,
      isDemoMode,
    });
    setStatus({ type: 'success', message: 'Settings saved!' });
    setTimeout(() => {
      onSaved();
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-800 overflow-y-auto p-2.5 text-[11px] font-ipod scrollbar-thin select-none">
      {/* Mode Switcher */}
      <div className="mb-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Source Mode
        </label>
        <div className="flex rounded border border-slate-300 overflow-hidden bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setIsDemoMode(true)}
            className={`flex-1 py-1 px-1.5 rounded text-center font-bold flex items-center justify-center space-x-1 transition-all ${
              isDemoMode
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Demo Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDemoMode(false)}
            className={`flex-1 py-1 px-1.5 rounded text-center font-bold flex items-center justify-center space-x-1 transition-all ${
              !isDemoMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3 h-3 shrink-0" />
            <span>Navidrome</span>
          </button>
        </div>
      </div>

      {/* Navidrome Server Inputs */}
      <div className={`space-y-1.5 mb-2.5 ${isDemoMode ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
            Server URL
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded px-1.5 py-1 focus-within:border-blue-500 focus-within:bg-white">
            <Server className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://192.168.1.50:4533"
              className="bg-transparent text-[11px] w-full outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
            Username
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded px-1.5 py-1 focus-within:border-blue-500 focus-within:bg-white">
            <User className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="bg-transparent text-[11px] w-full outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
            Password
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded px-1.5 py-1 focus-within:border-blue-500 focus-within:bg-white">
            <Key className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-transparent text-[11px] w-full outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Status banner */}
      {status.type !== 'idle' && (
        <div
          className={`p-1.5 rounded mb-2 text-[10px] font-semibold flex items-center space-x-1.5 ${
            status.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : status.type === 'error'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-slate-100 text-slate-700 border border-slate-300'
          }`}
        >
          {status.type === 'testing' && <RefreshCw className="w-3 h-3 animate-spin shrink-0" />}
          {status.type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
          {status.type === 'error' && <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />}
          <span className="truncate">{status.message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-1.5 mt-auto pt-1">
        {!isDemoMode && (
          <button
            type="button"
            onClick={handleTestConnection}
            className="flex-1 py-1 px-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 border border-slate-300 rounded font-bold text-[10px] transition-colors"
          >
            Test
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded font-bold text-[10px] transition-colors shadow-xs"
        >
          Save & Connect
        </button>
      </div>
    </div>
  );
};
