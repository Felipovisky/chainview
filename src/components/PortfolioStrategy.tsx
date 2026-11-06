import React, { useState, useEffect } from 'react';
import type { CryptoAsset } from '../types/crypto';
import {
  Globe, AlertCircle, Bot, Loader2, Key, Trash2, Shield, Landmark, TrendingUp, Zap
} from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
}

export const PortfolioStrategy: React.FC<Props> = ({ assets }) => {
  const [activeTab, setActiveTab] = useState<'simulador' | 'analise' | 'execucao'>(() => {
    return (localStorage.getItem('chainview_strategy_tab') as 'simulador' | 'analise' | 'execucao') || 'simulador';
  });

  useEffect(() => {
    localStorage.setItem('chainview_strategy_tab', activeTab);
  }, [activeTab]);

  const [selectedProfile, setSelectedProfile] = useState<'Conservador' | 'Institucional' | 'Moderado' | 'Arrojado'>('Moderado');
  
  const profiles = {
    'Conservador': { icon: Shield, caixa: 50, fundacao: 40, risco: 10, desc: 'Proteção máxima de capital com munição para quedas severas.' },
    'Institucional': { icon: Landmark, caixa: 20, fundacao: 70, risco: 10, desc: 'Modelo clássico de fundos: foco nos gigantes, risco controlado.' },
    'Moderado': { icon: TrendingUp, caixa: 30, fundacao: 45, risco: 25, desc: 'Equilíbrio perfeito entre crescimento e liquidez defensiva.' },
    'Arrojado': { icon: Zap, caixa: 10, fundacao: 30, risco: 60, desc: 'Exposição agressiva aos ciclos de alta. Pouco caixa, muito risco.' }
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

  const getMacroSignal = (drop: number) => {
    if (drop >= 0) return { status: 'DESCOBERTA DE PREÇO', desc: 'Mercado nas máximas históricas (ATH). Momento de euforia. Evite compras pesadas ("FOMO") e foque em gerenciar seu risco.', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
    if (drop > -20) return { status: 'CORREÇÃO LEVE', desc: 'Mercado em retração normal. Boa oportunidade para rebalancear e comprar ativos sólidos.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (drop > -40) return { status: 'ZONA DE OURO (0.382 - 0.5)', desc: 'Retração severa ativada. Inicie seus aportes de Fibonacci conforme a estratégia escolhida.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (drop > -60) return { status: 'COMPRA FORTE (ZONA 0.618)', desc: 'O mercado atingiu o suporte macro histórico (0.618). Excelente oportunidade assimétrica para posicionar o maior volume de capital.', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
    return { status: 'PÂNICO EXTREMO (0.786)', desc: 'Capitulação do mercado. Zona de liquidação profunda. Ative suas últimas ordens de segurança.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
  };

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
  const actions = [];
  
  if (getPercentage(buckets.caixa) < currentProfile.caixa - 2) actions.push(`O seu balde de Caixa (Estável) precisa de $${((currentProfile.caixa / 100) * totalAssetsValue - buckets.caixa).toFixed(2)}. Considere realizar lucros para aumentar a segurança.`);
  if (getPercentage(buckets.fundacao) < currentProfile.fundacao - 2) actions.push(`O seu balde de Fundação precisa de $${((currentProfile.fundacao / 100) * totalAssetsValue - buckets.fundacao).toFixed(2)}. Reforce a sua posição em BTC/ETH.`);
  if (getPercentage(buckets.risco) < currentProfile.risco - 2) actions.push(`O seu balde de Risco precisa de $${((currentProfile.risco / 100) * totalAssetsValue - buckets.risco).toFixed(2)}. Busque assimetrias em Altcoins.`);

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

    const btcContext = macroMarket ? `\n- Contexto Macro (Retração de Fibonacci do Bitcoin): O Bitcoin está com uma retração de ${macroMarket.dropFromAth.toFixed(2)}% em relação à sua Máxima Histórica (ATH).` : '';

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
          <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg">
            <div className="mb-6">
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
                    onClick={() => setSelectedProfile(profileKey)}
                    className={`text-left p-4 rounded-xl border transition-all ${isActive ? 'bg-slate-800/80 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#0b0e14] border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className={`flex items-center gap-2 font-bold mb-2 ${isActive ? 'text-emerald-400' : 'text-slate-300'}`}>
                      <Icon size={16} /> {profileKey}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{profile.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'PÓ DA PAZ (CAIXA)', current: getPercentage(buckets.caixa), target: currentProfile.caixa, val: buckets.caixa, colorText: 'text-emerald-400', colorBg: 'bg-emerald-500' },
                { label: 'FUNDAÇÃO (BTC/ETH)', current: getPercentage(buckets.fundacao), target: currentProfile.fundacao, val: buckets.fundacao, colorText: 'text-blue-400', colorBg: 'bg-blue-500' },
                { label: 'RISCO (ALTCOINS)', current: getPercentage(buckets.risco), target: currentProfile.risco, val: buckets.risco, colorText: 'text-rose-400', colorBg: 'bg-rose-500' },
              ].map((bucket, i) => {
                const diff = bucket.target - bucket.current;
                const diffUsd = (Math.abs(diff) / 100) * totalAssetsValue;
                return (
                  <div key={i} className="bg-[#0b0e14] border border-slate-800 p-5 rounded-xl">
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">{bucket.label}</div>
                      <div className="text-xs font-bold text-slate-400">{bucket.target}% <span className="text-[9px] font-normal uppercase">Alvo Ideal</span></div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className={`text-2xl font-black ${bucket.colorText}`}>{bucket.current.toFixed(1)}%</span>
                      <span className="text-xs text-slate-500">Atual</span>
                    </div>
                    
                    <div className="relative h-1.5 w-full bg-slate-800 rounded-full mb-4 overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full ${bucket.colorBg} transition-all duration-500`} style={{ width: `${Math.min(100, bucket.current)}%` }}></div>
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] z-10 transition-all duration-500" style={{ left: `${bucket.target}%` }}></div>
                    </div>

                    {Math.abs(diff) > 2 ? (
                      <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${diff > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        {diff > 0 ? `Falta investir +$${diffUsd.toFixed(0)}` : `Excesso de $${diffUsd.toFixed(0)}`}
                      </div>
                    ) : (
                      <div className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        ✓ Alinhado
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {actions.length > 0 ? (
              <div className="bg-[#0b0e14] border border-slate-800 p-5 rounded-xl">
                <h4 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase mb-4">
                  <AlertCircle size={16} /> Plano de Ação Matemático
                </h4>
                <div className="space-y-3">
                  {actions.map((action, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-slate-600">→</span>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">✓</div>
                <p className="text-sm font-bold text-emerald-400">A sua carteira está 100% alinhada com o perfil selecionado!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analise' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col justify-center">
            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              <Globe size={16} /> Termômetro Global (Retração do ATH)
            </h4>

            {macroMarket ? (
              <div className={`p-6 rounded-xl border ${getMacroSignal(macroMarket.dropFromAth).bg} flex flex-col gap-4 transition-all h-full justify-center`}>
                 <div className="flex justify-between items-center">
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
                <Loader2 size={16} className="animate-spin"/> Lendo máxima histórica global (ATH)...
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
                      <Key size={12}/> Conectar IA
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={removeKey} className="p-1.5 text-slate-500 hover:text-rose-400 transition" title="Remover Chave IA"><Trash2 size={14}/></button>
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
                 <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Bot size={14}/> Análise do Gestor:</div>
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
              <h3 className="text-xl font-bold text-amber-400 mb-2">Execução Visual de Fibonacci</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Deixe ordens limitadas (<span className="text-amber-300 font-medium">Limit Orders</span>) programadas na corretora com os valores abaixo. Os níveis e retrações abaixo são calculados estritamente em <strong>relação ao Bitcoin (BTC)</strong> e ao seu Topo Histórico (ATH).
              </p>
            </div>
            <div className="bg-[#0b0e14] border border-amber-500/20 p-4 rounded-lg text-center shrink-0">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Base de Cálculo</div>
              <div className="text-xl font-black text-white">${baseCapital.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-1 text-center">Pirâmide Defensiva</h4>
                <p className="text-[11px] text-slate-400 text-center mb-6">Conservador / Quedas severas</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-xs shrink-0">1</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.5 (BTC)</span>
                        <span className="text-rose-400 font-bold text-sm">${(baseCapital * 0.20).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-[20%]"></div></div>
                      <div className="text-[10px] text-slate-500 mt-1">20% do capital.</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">2</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.618 (BTC)</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.30).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[30%]"></div></div>
                      <div className="text-[10px] text-slate-500 mt-1">30% do capital.</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0">3</div>
                    <div className="flex-1 bg-[#0b0e14] border border-emerald-500/30 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">0.786 (BTC)</span>
                        <span className="text-emerald-400 font-bold text-sm">${(baseCapital * 0.50).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[50%]"></div></div>
                      <div className="text-[10px] text-emerald-500/70 mt-1 font-bold">50% (Pânico/Fundo).</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#121824] border border-amber-500/40 rounded-xl p-6 shadow-lg flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow">Equilíbrio</div>
              <div>
                <h4 className="text-base font-bold text-white mb-1 text-center">Pirâmide Moderada</h4>
                <p className="text-[11px] text-slate-400 text-center mb-6">Distribuição Linear (33/33/34)</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">1</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.5 (BTC)</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.33).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[33%]"></div></div>
                      <div className="text-[10px] text-slate-500 mt-1">33% do capital.</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">2</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.618 (BTC)</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.33).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[33%]"></div></div>
                      <div className="text-[10px] text-slate-500 mt-1">33% do capital.</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">3</div>
                    <div className="flex-1 bg-[#0b0e14] border border-amber-500/30 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-amber-400 uppercase font-bold">0.786 (BTC)</span>
                        <span className="text-amber-400 font-bold text-sm">${(baseCapital * 0.34).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[34%]"></div></div>
                      <div className="text-[10px] text-amber-500/70 mt-1 font-bold">34% (Fundo profundo).</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-1 text-center">Pirâmide Agressiva</h4>
                <p className="text-[11px] text-slate-400 text-center mb-6">Bull Market / Exposição rápida</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0">1</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.5 (BTC)</span>
                        <span className="text-emerald-400 font-bold text-sm">${(baseCapital * 0.40).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[40%]"></div></div>
                      <div className="text-[10px] text-slate-500 mt-1">40% do capital.</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs shrink-0">2</div>
                    <div className="flex-1 bg-[#0b0e14] border border-emerald-500/30 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.618 (BTC)</span>
                        <span className="text-emerald-400 font-bold text-sm">${(baseCapital * 0.50).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[50%]"></div></div>
                      <div className="text-[10px] text-emerald-500/70 mt-1 font-bold">50% (90% total).</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-xs shrink-0">3</div>
                    <div className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">0.786 (BTC)</span>
                        <span className="text-rose-400 font-bold text-sm">${(baseCapital * 0.10).toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-[10%]"></div></div>
                      <div className="text-[10px] text-slate-500 mt-1">10% (Tiro no fundo).</div>
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