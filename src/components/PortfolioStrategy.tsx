import React, { useState, useEffect } from 'react';
import type { CryptoAsset } from '../types/crypto';
import {
  Globe, AlertCircle, Bot, Loader2, Key, Trash2, Shield, Landmark, TrendingUp, Zap
} from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
}

export const PortfolioStrategy: React.FC<Props> = ({ assets }) => {
  // Salva a aba ativa
  const [activeTab, setActiveTab] = useState<'simulador' | 'analise' | 'execucao'>(() => {
    return (localStorage.getItem('chainview_strategy_tab') as 'simulador' | 'analise' | 'execucao') || 'simulador';
  });

  useEffect(() => {
    localStorage.setItem('chainview_strategy_tab', activeTab);
  }, [activeTab]);

  // Salva o perfil selecionado
  const [selectedProfile, setSelectedProfile] = useState<'Conservador' | 'Institucional' | 'Moderado' | 'Arrojado'>(() => {
    return (localStorage.getItem('chainview_strategy_profile') as 'Conservador' | 'Institucional' | 'Moderado' | 'Arrojado') || 'Moderado';
  });

  useEffect(() => {
    localStorage.setItem('chainview_strategy_profile', selectedProfile);
  }, [selectedProfile]);

  const profiles = {
    'Conservador': { icon: Shield, caixa: 50, fundacao: 40, risco: 10, desc: 'Proteção máxima de capital com munição para quedas severas.', activeBorder: 'border-emerald-500/40', activeBg: 'bg-emerald-500/5', color: 'text-emerald-400' },
    'Institucional': { icon: Landmark, caixa: 20, fundacao: 70, risco: 10, desc: 'Modelo clássico de fundos: foco nos gigantes, risco controlado.', activeBorder: 'border-blue-500/40', activeBg: 'bg-blue-500/5', color: 'text-blue-400' },
    'Moderado': { icon: TrendingUp, caixa: 30, fundacao: 45, risco: 25, desc: 'Equilíbrio perfeito entre crescimento e liquidez defensiva.', activeBorder: 'border-indigo-500/40', activeBg: 'bg-indigo-500/5', color: 'text-indigo-400' },
    'Arrojado': { icon: Zap, caixa: 10, fundacao: 30, risco: 60, desc: 'Exposição agressiva aos ciclos de alta. Pouco caixa, muito risco.', activeBorder: 'border-emerald-500/40', activeBg: 'bg-emerald-500/5', color: 'text-emerald-400' }
  };

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('chainview_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const [macroMarket, setMacroMarket] = useState<{ btcPrice: number, btcAth: number, dropFromAth: number } | null>(null);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const current = data[0].current_price;
          const ath = data[0].ath;
          const drop = ((current - ath) / ath) * 100;
          setMacroMarket({ btcPrice: current, btcAth: ath, dropFromAth: drop });
        }
      }).catch(() => {});
  }, []);

  // Padrão de Valuation (Foco em preço e oportunidade)
  const getMacroSignal = (drop: number) => {
    if (drop > -38.2) {
      return {
        status: 'ACIMA DO PREÇO JUSTO',
        desc: 'Ativo próximo das máximas ou em correção leve. Evite compras pesadas por euforia ("FOMO") e preserve caixa.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20'
      };
    }
    if (drop > -50) {
      return {
        status: 'APROXIMAÇÃO DO PREÇO JUSTO (0.382)',
        desc: 'Retração ganhando força. Prepare suas ordens limitadas para a zona de Preço Justo (0.5).',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20'
      };
    }
    if (drop > -61.8) {
      return {
        status: '0.5 • PREÇO JUSTO',
        desc: 'O mercado atingiu o equilíbrio da pernada de alta. Ponto inicial saudável para aportes estruturados.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20'
      };
    }
    if (drop > -78.6) {
      return {
        status: '0.618 • DESCONTO IDEAL',
        desc: 'Região de maior assimetria risco/retorno. Excelente zona de oportunidade para posicionar o maior volume de capital.',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/20'
      };
    }
    return {
      status: '0.786 • DESCONTO EXTREMO',
      desc: 'Liquidação profunda do mercado. Zona de capitulação para ativar as últimas ordens de reserva.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    };
  };

  // Preços-alvo do BTC em cada nível de Valuation (baseado no ATH)
  const fiboTargets = macroMarket
    ? {
        level50: macroMarket.btcAth * (1 - 0.5),
        level618: macroMarket.btcAth * (1 - 0.618),
        level786: macroMarket.btcAth * (1 - 0.786),
      }
    : null;

  const totalAssetsValue = assets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const price = isStable ? 1 : curr.currentPrice;
    return acc + (curr.quantity * price);
  }, 0);

  const buckets = assets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const isFoundation = ['bitcoin', 'ethereum'].includes(curr.id.toLowerCase()) || ['BTC', 'ETH'].includes(curr.symbol.toUpperCase());
    const val = curr.quantity * (isStable ? 1 : curr.currentPrice);

    if (isStable) acc.caixa += val;
    else if (isFoundation) acc.fundacao += val;
    else acc.risco += val;

    return acc;
  }, { caixa: 0, fundacao: 0, risco: 0 });

  const getPercentage = (val: number) => totalAssetsValue > 0 ? (val / totalAssetsValue) * 100 : 0;
  const currentProfile = profiles[selectedProfile];

  const caixaDiff = buckets.caixa - (totalAssetsValue * (currentProfile.caixa / 100));
  const fundacaoDiff = buckets.fundacao - (totalAssetsValue * (currentProfile.fundacao / 100));
  const riscoDiff = buckets.risco - (totalAssetsValue * (currentProfile.risco / 100));

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
  const formatTargetPrice = (val: number) => `$${Math.round(val).toLocaleString('en-US')}`;

  const actions = [];
  if (caixaDiff <= -1) actions.push(`O seu balde de Caixa (Estável) precisa de ${formatCurrency(Math.abs(caixaDiff))}. Considere realizar lucros para aumentar a liquidez.`);
  if (fundacaoDiff <= -1) actions.push(`O seu balde de Fundação precisa de ${formatCurrency(Math.abs(fundacaoDiff))}. Reforce a sua posição em BTC/ETH.`);
  if (riscoDiff <= -1) actions.push(`O seu balde de Risco precisa de ${formatCurrency(Math.abs(riscoDiff))}. Busque assimetrias em Altcoins.`);

  const totalInvested = assets.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const portfolioProfitPct = totalInvested > 0 ? ((totalAssetsValue - totalInvested) / totalInvested) * 100 : 0;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const key = formData.get('apiKey') as string;
    if (key.trim()) {
      localStorage.setItem('chainview_gemini_key', key.trim());
      setApiKey(key.trim());
      setShowKeyInput(false);
    }
  };

  const removeKey = () => {
    localStorage.removeItem('chainview_gemini_key');
    setApiKey('');
    setAiResponse('');
    setShowKeyInput(false);
  };

  const generateAIAnalysis = async () => {
    if (!apiKey) return;
    setIsAnalyzing(true);
    setAiResponse('');

    const currentValuation = macroMarket ? getMacroSignal(macroMarket.dropFromAth).status : 'Indisponível';
    const btcContext = macroMarket
      ? `\nContexto Macro (Valuation Fibonacci do Bitcoin): O Bitcoin está com uma retração de ${macroMarket.dropFromAth.toFixed(2)}% em relação à sua Máxima Histórica (ATH), na zona "${currentValuation}".`
      : '';

    const prompt = `
      Atue como um conselheiro tático cripto de alto nível. 
      Dados da carteira: Patrimônio $${totalAssetsValue.toFixed(2)}. 
      Rentabilidade global atual da carteira do investidor: ${portfolioProfitPct.toFixed(2)}%.${btcContext}
      Com base nisso e no contexto macroeconômico atual do Bitcoin, indique em um único parágrafo direto quais devem ser os meus próximos movimentos práticos (comprar, vender ou aguardar). Sem introduções robóticas. Responda em português do Brasil.
    `;

    try {
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listResponse.json();

      if (listData.error) {
        setAiResponse(`⚠️ Erro na Chave API: ${listData.error.message}`);
        setIsAnalyzing(false);
        return;
      }

      const apiModels: string[] = (listData.models || [])
        .filter((m: any) =>
          m.supportedGenerationMethods?.includes('generateContent') &&
          m.name.includes('gemini') &&
          !m.name.includes('embedding') &&
          !m.name.includes('imagen')
        )
        .map((m: any) => m.name);

      const candidateModels = Array.from(new Set([
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        ...apiModels
      ]));

      let lastError = 'Nenhum modelo compatível respondeu.';

      for (const modelName of candidateModels) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
          })
        });

        const data = await response.json();

        if (!data.error && data.candidates && data.candidates.length > 0) {
          setAiResponse(data.candidates[0].content.parts[0].text);
          setIsAnalyzing(false);
          return;
        }

        if (data.error) {
          lastError = `⚠️ Erro da API (${modelName}): ${data.error.message}`;
        }
      }

      setAiResponse(lastError);
    } catch (error) {
      setAiResponse("⚠️ Erro ao conectar à IA. Verifique sua conexão com a internet ou se sua chave API é válida.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const baseCapital = totalAssetsValue > 0 ? totalAssetsValue : 10000;

  return (
    <div className="space-y-6">
      <div className="flex bg-[#121824] p-1 rounded-lg border border-slate-800/80 w-fit">
        <button onClick={() => setActiveTab('simulador')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'simulador' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
          Simulador de Alocação
        </button>
        <button onClick={() => setActiveTab('analise')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'analise' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
          Visão Geral Macro
        </button>
        <button onClick={() => setActiveTab('execucao')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'execucao' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
          Guia Fibonacci
        </button>
      </div>

      {activeTab === 'simulador' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-8 shadow-lg">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Simulador de Estratégia</h3>
              <p className="text-sm text-slate-400">Escolha um perfil de risco para comparar a sua distribuição atual com o modelo institucional ideal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {(Object.keys(profiles) as Array<keyof typeof profiles>).map(profileKey => {
                const profile = profiles[profileKey];
                const Icon = profile.icon;
                const isActive = selectedProfile === profileKey;
                return (
                  <button
                    key={profileKey}
                    onClick={() => setSelectedProfile(profileKey as any)}
                    className={`text-left p-4 rounded-xl border transition-all duration-300 ${isActive ? `${profile.activeBorder} ${profile.activeBg}` : 'bg-[#0b0e14] border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className={`flex items-center gap-2 font-bold mb-2 ${isActive ? profile.color : 'text-slate-300'}`}>
                      <Icon size={18} /> {profileKey}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{profile.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'PÓ DA PAZ (CAIXA)', current: getPercentage(buckets.caixa), target: currentProfile.caixa, val: buckets.caixa, diff: caixaDiff, colorText: 'text-emerald-400', colorBg: 'bg-emerald-500' },
                { label: 'FUNDAÇÃO (BTC/ETH)', current: getPercentage(buckets.fundacao), target: currentProfile.fundacao, val: buckets.fundacao, diff: fundacaoDiff, colorText: 'text-blue-400', colorBg: 'bg-blue-500' },
                { label: 'RISCO (ALTCOINS)', current: getPercentage(buckets.risco), target: currentProfile.risco, val: buckets.risco, diff: riscoDiff, colorText: 'text-rose-400', colorBg: 'bg-rose-500' },
              ].map((bucket, i) => {
                const isExcess = bucket.diff >= 0;
                return (
                  <div key={i} className="bg-[#0b0e14] border border-slate-800/80 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bucket.label}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bucket.target}% <span className="text-slate-600">ALVO IDEAL</span></div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-3xl font-black ${bucket.colorText}`}>{bucket.current.toFixed(1)}%</span>
                        <span className="text-xs font-bold text-slate-500">Atual / <span className="text-slate-200">{formatCurrency(bucket.val)}</span></span>
                      </div>

                      <div className="relative h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full ${bucket.colorBg} transition-all duration-1000`} style={{ width: `${Math.min(100, bucket.current)}%` }}></div>
                        <div className="absolute top-0 w-1 h-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] z-10 transition-all duration-1000" style={{ left: `calc(${bucket.target}% - 2px)` }}></div>
                      </div>
                    </div>

                    <div>
                      <span className={`inline-block px-3 py-1.5 rounded-md text-[10px] font-bold ${
                        isExcess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isExcess ? `Excesso de ${formatCurrency(bucket.diff)}` : `Falta investir +${formatCurrency(Math.abs(bucket.diff))}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-6">
              <h4 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
                <AlertCircle size={14} /> Plano de Ação Matemático
              </h4>
              <div className="space-y-3">
                {actions.length > 0 ? (
                  actions.map((action, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-slate-600 font-bold mt-0.5">→</span>
                      <p>{action}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3 text-sm text-emerald-400 font-bold">
                    <span>✓</span>
                    <p>O seu portefólio está perfeitamente alinhado com o seu perfil de risco! Nenhuma ação necessária no momento.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analise' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col justify-center">
            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              <Globe size={16} /> Padrão de Valuation (Retração do ATH)
            </h4>

            {macroMarket ? (
              <div className={`p-6 rounded-xl border ${getMacroSignal(macroMarket.dropFromAth).bg} flex flex-col gap-4 transition-all h-full justify-center`}>
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <span className={`text-xl font-black tracking-wide ${getMacroSignal(macroMarket.dropFromAth).color}`}>
                    {getMacroSignal(macroMarket.dropFromAth).status}
                  </span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-md shadow-sm">
                    Bitcoin: {macroMarket.dropFromAth.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {getMacroSignal(macroMarket.dropFromAth).desc}
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-800/20 text-sm text-slate-500 flex items-center justify-center gap-3 h-full">
                <Loader2 size={16} className="animate-spin" /> Lendo máxima histórica global (ATH)...
              </div>
            )}
          </div>

          <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <AlertCircle size={16} /> Conselheiro de Mercado IA
              </h4>

              <div className="relative">
                <div className="flex gap-2 items-center">
                  {aiResponse && (
                    <button onClick={() => setAiResponse('')} className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-300 px-2 py-1.5 transition-all">Limpar</button>
                  )}
                  {!apiKey ? (
                    <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-3 py-1.5 rounded flex items-center gap-1 transition-all border border-indigo-500/30">
                      <Key size={12} /> Conectar IA
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={removeKey} className="p-1.5 text-slate-500 hover:text-rose-400 transition" title="Remover Chave IA"><Trash2 size={14} /></button>
                      <button onClick={generateAIAnalysis} disabled={isAnalyzing} className="text-[10px] uppercase font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                        {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />} Consultar Gestor IA
                      </button>
                    </div>
                  )}
                </div>

                {showKeyInput && !apiKey && (
                  <form onSubmit={handleSaveKey} className="absolute top-full mt-2 right-0 bg-[#121824] border border-slate-700 p-4 rounded-xl shadow-xl w-72 z-30 flex flex-col gap-3">
                    <p className="text-[10px] text-slate-400 leading-relaxed">Obtenha uma chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google AI Studio</a>.</p>
                    <input type="password" name="apiKey" placeholder="Cole a API Key aqui..." className="w-full bg-[#0b0e14] border border-slate-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" autoFocus />
                    <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded text-xs font-bold w-full transition">Salvar e Conectar</button>
                  </form>
                )}
              </div>
            </div>

            {aiResponse ? (
              <div className="flex-1 bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-5 text-sm text-slate-300 leading-relaxed font-medium animate-in fade-in">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Bot size={14} /> Análise do Gestor:</div>
                {aiResponse}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-slate-800/60 rounded-xl bg-[#0b0e14]">
                <Bot size={32} className="text-slate-600 mb-3" />
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Clique em <strong>Consultar Gestor IA</strong> para receber uma análise em tempo real baseada exclusivamente no comportamento macroeconômico do Bitcoin e na rentabilidade geral da sua carteira.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'execucao' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">Execução Visual de Fibonacci (Padrão de Valuation)</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Deixe ordens limitadas (<span className="text-amber-300 font-medium">Limit Orders</span>) programadas na corretora conforme o nível de desconto do <strong>Bitcoin (BTC)</strong> em relação ao seu Topo Histórico (ATH).
              </p>
            </div>
            <div className="bg-[#0b0e14] border border-amber-500/20 p-4 rounded-lg text-center shrink-0">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Base de Cálculo</div>
              <div className="text-xl font-black text-white">${baseCapital.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pirâmide Defensiva */}
            <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-1 text-center">Pirâmide Defensiva</h4>
                <p className="text-[11px] text-slate-400 text-center mb-6">Conservador / Foco em Desconto Extremo</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0">1</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">0.5 • Preço Justo</span>
                        <span className="text-emerald-400 font-bold text-sm">${(baseCapital * 0.20).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[20%]"></div></div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>20% do capital</span>
                        {fiboTargets && <span className="font-mono text-slate-400">BTC {formatTargetPrice(fiboTargets.level50)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xs shrink-0">2</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-indigo-400 uppercase font-bold">0.618 • Desconto Ideal</span>
                        <span className="text-indigo-400 font-bold text-sm">${(baseCapital * 0.30).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[30%]"></div></div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>30% do capital</span>
                        {fiboTargets && <span className="font-mono text-slate-400">BTC {formatTargetPrice(fiboTargets.level618)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-xs shrink-0">3</div>
                    <div className="flex-1 bg-[#0b0e14] border border-purple-500/30 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-purple-400 uppercase font-bold">0.786 • Desconto Extremo</span>
                        <span className="text-purple-400 font-bold text-sm">${(baseCapital * 0.50).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[50%]"></div></div>
                      <div className="flex justify-between text-[10px] text-purple-400/80 mt-1 font-bold">
                        <span>50% do capital</span>
                        {fiboTargets && <span className="font-mono">BTC {formatTargetPrice(fiboTargets.level786)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pirâmide Moderada */}
            <div className="bg-[#121824] border border-amber-500/40 rounded-xl p-6 shadow-lg flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow">Equilíbrio</div>
              <div>
                <h4 className="text-base font-bold text-white mb-1 text-center">Pirâmide Moderada</h4>
                <p className="text-[11px] text-slate-400 text-center mb-6">Distribuição Linear (33/33/34)</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0">1</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">0.5 • Preço Justo</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.33).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[33%]"></div></div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>33% do capital</span>
                        {fiboTargets && <span className="font-mono text-slate-400">BTC {formatTargetPrice(fiboTargets.level50)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xs shrink-0">2</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-indigo-400 uppercase font-bold">0.618 • Desconto Ideal</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.33).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[33%]"></div></div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>33% do capital</span>
                        {fiboTargets && <span className="font-mono text-slate-400">BTC {formatTargetPrice(fiboTargets.level618)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-xs shrink-0">3</div>
                    <div className="flex-1 bg-[#0b0e14] border border-amber-500/30 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-purple-400 uppercase font-bold">0.786 • Desconto Extremo</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.34).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[34%]"></div></div>
                      <div className="flex justify-between text-[10px] text-amber-500/80 mt-1 font-bold">
                        <span>34% do capital</span>
                        {fiboTargets && <span className="font-mono">BTC {formatTargetPrice(fiboTargets.level786)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pirâmide Agressiva */}
            <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-1 text-center">Pirâmide Agressiva</h4>
                <p className="text-[11px] text-slate-400 text-center mb-6">Bull Market / Exposição rápida</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0">1</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">0.5 • Preço Justo</span>
                        <span className="text-emerald-400 font-bold text-sm">${(baseCapital * 0.40).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[40%]"></div></div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>40% do capital</span>
                        {fiboTargets && <span className="font-mono text-slate-400">BTC {formatTargetPrice(fiboTargets.level50)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xs shrink-0">2</div>
                    <div className="flex-1 bg-[#0b0e14] border border-indigo-500/30 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-indigo-400 uppercase font-bold">0.618 • Desconto Ideal</span>
                        <span className="text-indigo-400 font-bold text-sm">${(baseCapital * 0.50).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[50%]"></div></div>
                      <div className="flex justify-between text-[10px] text-indigo-400/80 mt-1 font-bold">
                        <span>50% (90% total)</span>
                        {fiboTargets && <span className="font-mono">BTC {formatTargetPrice(fiboTargets.level618)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-xs shrink-0">3</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-purple-400 uppercase font-bold">0.786 • Desconto Extremo</span>
                        <span className="text-purple-400 font-bold text-sm">${(baseCapital * 0.10).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[10%]"></div></div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>10% do capital</span>
                        {fiboTargets && <span className="font-mono text-slate-400">BTC {formatTargetPrice(fiboTargets.level786)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};