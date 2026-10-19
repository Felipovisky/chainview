import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';

export const BackupManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainview-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm('Isto irá substituir toda a sua carteira atual. Deseja continuar?')) {
          localStorage.clear();
          Object.keys(data).forEach((key) => localStorage.setItem(key, data[key]));
          window.location.reload();
        }
      } catch (error) {
        alert('Erro: Ficheiro inválido.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-1 w-full pt-4 mt-4 border-t border-slate-800/80 items-center xl:items-stretch">
      {/* Título escondido em ecrãs pequenos */}
      <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 hidden xl:block">
        Segurança e Backup
      </span>
      
      <button
        onClick={handleExport}
        title="Exportar Dados"
        className="flex items-center justify-center xl:justify-start gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors w-full"
      >
        <Download size={18} className="text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap hidden xl:block">Exportar Dados</span>
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        title="Importar Dados"
        className="flex items-center justify-center xl:justify-start gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors w-full"
      >
        <Upload size={18} className="text-amber-400 shrink-0" />
        <span className="whitespace-nowrap hidden xl:block">Importar Dados</span>
      </button>

      <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
    </div>
  );
};