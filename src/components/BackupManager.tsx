import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';

export const BackupManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // Extrai as chaves exatas que configurámos no App.tsx
    const data = {
      assets: JSON.parse(localStorage.getItem('crypto_portfolio_assets') || '[]'),
      transactions: JSON.parse(localStorage.getItem('crypto_portfolio_transactions') || '[]'),
      portfolios: JSON.parse(localStorage.getItem('crypto_portfolios_list') || '[]'),
      privacy: JSON.parse(localStorage.getItem('crypto_portfolio_privacy') || 'false'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    a.download = `chainview_backup_${date}.json`;
    
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
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.assets && data.transactions) {
          localStorage.setItem('crypto_portfolio_assets', JSON.stringify(data.assets));
          localStorage.setItem('crypto_portfolio_transactions', JSON.stringify(data.transactions));
          if (data.portfolios) localStorage.setItem('crypto_portfolios_list', JSON.stringify(data.portfolios));
          if (data.privacy !== undefined) localStorage.setItem('crypto_portfolio_privacy', JSON.stringify(data.privacy));
          
          alert('Dados importados com sucesso! A página será recarregada.');
          window.location.reload();
        } else {
          alert('Ficheiro de backup inválido.');
        }
      } catch (error) {
        alert('Erro ao ler o ficheiro.');
      }
    };
    reader.readAsText(file);
    
    // Limpa o input para permitir importar o mesmo ficheiro de novo se necessário
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1 pb-4 mb-4 border-b border-slate-800/40">
      <div className="hidden xl:block px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Backup e Segurança
      </div>
      <button 
        onClick={handleExport}
        className="w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition text-sm"
      >
        <Download size={18} className="shrink-0" />
        <span className="hidden xl:block">Exportar Dados</span>
      </button>
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition text-sm"
      >
        <Upload size={18} className="shrink-0" />
        <span className="hidden xl:block">Importar Dados</span>
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".json" 
        className="hidden" 
      />
    </div>
  );
};