import React, { useState, useMemo } from 'react';
import type { CryptoAsset } from '../types/crypto';
import { Shield, Zap, TrendingUp, Landmark, AlertCircle, ArrowRight, CheckCircle2, Bot, Loader2, Key, Trash2 } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
}

const PROFILES = [
  { id: 'conservador', name: 'Conservador', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30', desc: 'Proteção máxima de capital com munição para quedas severas.', targets: { caixa: 50, core: 40, alt: 10 } },
  { id: 'institucional', name: 'Institucional', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30', desc: 'Modelo clássico de fundos: foco nos gigantes, risco controlado.', targets: { caixa: 20, core: 60, alt: 20 } },
  { id: 'moderado', name: 'Moderado', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30', desc: 'Equilíbrio perfeito entre crescimento e liquidez defensiva.', targets: { caixa: 30, core: 45, alt: 25 } },
  { id: 'arrojado', name: 'Arrojado', icon: Zap, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-500/30', desc: 'Exposição agressiva aos ciclos de alta. Pouco caixa, muito risco.', targets: { caixa: 10, core: 30, alt: 60 } },
];

export const PortfolioStrategy: React.FC<Props> = ({ assets }) => {
  const [activeProfile, setActiveProfile] = useState(PROFILES[2]);
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('chainview_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const analysis = useMemo(() => {
    let caixaVal = 0, coreVal = 0, altVal = 0;
    const altcoins: (CryptoAsset & { profit: number, discount: number })[] = [];
    const coreCoins: (CryptoAsset & { profit: number })[] = [];

    assets.forEach(a => {
      const val = a.quantity * a.currentPrice;
      const profit = val - a.investedAmount;
      const discount = a.investedAmount > 0 ? ((a.currentPrice - (a.investedAmount / a.quantity)) / (a.investedAmount / a.quantity)) * 100 : 0;

      if (['USDT', 'USDC'].includes(a.symbol)) {
        caixaVal += val;
      } else if (['BTC', 'ETH'].includes(a.symbol)) {
        coreVal += val;
        coreCoins.push({ ...a, profit });
      } else {
        altVal += val;
        altcoins.push({ ...a, profit, discount });
      }
    });

    const total = caixaVal + coreVal + altVal;
    if (total === 0) return null;

    const currentPct = {
      caixa: (caixaVal / total) * 100,
      core: (coreVal / total) * 100,
      alt: (altVal / total) * 100
    };

    const diffDollars = {
      caixa: (activeProfile.targets.caixa / 100) * total - caixaVal,
      core: (activeProfile.targets.core / 100) * total - coreVal,
      alt: (activeProfile.targets.alt / 100) * total - altVal
    };

    const topProfitAlt = altcoins.sort((a, b) => b.profit - a.profit)[0];
    const topDiscountAlt = altcoins.filter(a => a.discount < 0).sort((a, b) => a.discount - b.discount)[0];
    const coreOwnedSymbols = Array.from(new Set(coreCoins.map(c => c.symbol)));
    const coreNames = coreOwnedSymbols.length === 1 ? coreOwnedSymbols[0] : coreOwnedSymbols.join(' e ');
    const hasCore = coreOwnedSymbols.length > 0;

    return { total, caixaVal, coreVal, altVal, currentPct, diffDollars, topProfitAlt, topDiscountAlt, hasCore, coreNames, altcoins, coreCoins };
  }, [assets, activeProfile]);

  const handleSaveKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
  };

  const generateAIAnalysis = async () => {
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }
    if (!analysis) return;

    setIsAnalyzing(true);
    setAiResponse('');

    const prompt = `
      Atue como um gestor de fundos cripto de Wall Street, direto, clínico e profissional.
      O meu perfil de risco ideal escolhido é: ${activeProfile.name}.
      
      DADOS DA MINHA CARTEIRA ATUAL:
      - Património Total: $${analysis.total.toFixed(2)}
      - Caixa (USDT/USDC): ${analysis.currentPct.caixa.toFixed(1)}% (Alvo: ${activeProfile.targets.caixa}%) -> Diferença para o alvo: $${analysis.diffDollars.caixa.toFixed(2)}
      - Fundação Core (BTC/ETH): ${analysis.currentPct.core.toFixed(1)}% (Alvo: ${activeProfile.targets.core}%) -> Diferença para o alvo: $${analysis.diffDollars.core.toFixed(2)}
      - Risco Altcoins: ${analysis.currentPct.alt.toFixed(1)}% (Alvo: ${activeProfile.targets.alt}%) -> Diferença para o alvo: $${analysis.diffDollars.alt.toFixed(2)}
      
      OS MEUS ATIVOS ATUAIS E PERFORMANCE:
      ${assets.filter(a => !['USDT', 'USDC'].includes(a.symbol)).map(a => `- ${a.symbol}: Saldo $${(a.quantity * a.currentPrice).toFixed(2)} | Lucro/Prejuízo: $${((a.quantity * a.currentPrice) - a.investedAmount).toFixed(2)}`).join('\n')}
      
      TAREFA:
      Com base nestes dados exatos da minha carteira e nas diferenças em dólares para o meu alvo ideal, escreva uma recomendação tática executiva de no máximo 2 parágrafos. 
      Diga-me exatamente que moedas específicas devo comprar (para aproveitar quedas/equilibrar a fundação) ou vender (para realizar lucros e aumentar caixa). Não use introduções genéricas, vá direto às ordens táticas.
    `;

    try {
      // 1. Consulta os modelos disponíveis na conta e prioriza a linha Gemini 3.0
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listResponse.json();

      if (listData.error) {
        setAiResponse(`Erro na Chave API: ${listData.error.message}`);
        return;
      }

      const apiModels: string[] = (listData.models || [])
        .filter((m: any) =>
          m.supportedGenerationMethods?.includes('generateContent') &&
          m.name.includes('gemini') &&
          !m.name.includes('embedding') &&
          !m.name.includes('imagen') &&
          !m.name.includes('2.5-flash') // Ignora o 2.5-flash desativado para novas contas
        )
        .map((m: any) => m.name);

      // Lista ordenada por prioridade (começando pelo gemini-3.0-flash exigido pela Google)
      const candidateModels = Array.from(new Set([
        'models/gemini-3.0-flash',
        ...apiModels.filter(name => name.includes('gemini-3')),
        ...apiModels.filter(name => name.includes('flash')),
        ...apiModels
      ]));

      let lastError = 'Nenhum modelo compatível respondeu.';

      // 2. Testa os modelos em cascata até obter a resposta com sucesso
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
          return;
        }

        if (data.error) {
          lastError = `Erro da API (${modelName}): ${data.error.message}`;
        }
      }

      setAiResponse(lastError);
    } catch (error) {
      setAiResponse("Erro ao conectar à IA. Verifique a sua ligação à internet ou se a sua chave API é válida.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysis) {
    return <div className="p-8 text-center text-slate-500">Sem fundos suficientes para análise estratégica.</div>;
  }

  const renderBucket = (title: string, current: number, target: number, diff: number, color: string) => {
    const isAligned = Math.abs(current - target) <= 5;
    
    return (
      <div className="bg-[#0b0e14] border border-slate-800/60 rounded-xl p-5 relative overflow-hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${color}`}>{current.toFixed(1)}%</span>
              <span className="text-xs font-medium text-slate-500">Atual</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-white block">{target}%</span>
            <span className="text-[10px] text-slate-500 uppercase">Alvo Ideal</span>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
          <div className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${Math.min(current, 100)}%` }}></div>
          <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ left: `${target}%` }}></div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold">
          {isAligned ? (
            <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
              <CheckCircle2 size={14} /> Alinhado
            </span>
          ) : diff > 0 ? (
            <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
              Falta investir +${diff.toFixed(0)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
              Excesso de ${Math.abs(diff).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-8 shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Simulador de Estratégia</h3>
          <p className="text-sm text-slate-400">Escolha um perfil de risco para comparar a sua distribuição atual com o modelo institucional ideal.</p>
        </div>
        
        <div className="flex flex-col items-end relative">
          <div className="flex items-center gap-2">
            {apiKey && (
              <button onClick={removeKey} className="p-2 text-slate-500 hover:text-rose-400 transition" title="Remover Chave API">
                <Trash2 size={15} />
              </button>
            )}
            <button 
              onClick={generateAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              {isAnalyzing ? 'A analisar carteira...' : 'Gerar Análise IA'}
            </button>
          </div>

          {showKeyInput && !apiKey && (
            <form onSubmit={handleSaveKey} className="absolute top-12 right-0 bg-[#0b0e14] border border-slate-700 p-4 rounded-xl shadow-xl w-80 z-20 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Key size={14} /> Configurar Gemini IA (Gratuito)
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Obtenha uma chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google AI Studio</a>. A chave fica guardada apenas no seu navegador.
              </p>
              <div className="flex gap-2">
                <input type="password" name="apiKey" placeholder="Cole a sua API Key..." className="flex-1 bg-[#121824] border border-slate-700 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500" autoFocus />
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold transition">Guardar</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {aiResponse && (
        <div className="mb-10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
            <Bot size={16} /> Parecer Tático da IA
          </h4>
          <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap font-medium">
            {aiResponse}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {PROFILES.map(profile => {
          const Icon = profile.icon;
          const isActive = activeProfile.id === profile.id;
          return (
            <button
              key={profile.id}
              onClick={() => { setActiveProfile(profile); setAiResponse(''); }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col gap-3 ${isActive ? `${profile.bg} ${profile.border} ring-1 ring-${profile.border.split('-')[1]}` : 'bg-[#0b0e14] border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/30'}`}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} className={isActive ? profile.color : 'text-slate-500'} />
                <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{profile.name}</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {profile.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {renderBucket('Pó da Paz (Caixa)', analysis.currentPct.caixa, activeProfile.targets.caixa, analysis.diffDollars.caixa, 'text-emerald-400')}
        {renderBucket('Fundação (BTC/ETH)', analysis.currentPct.core, activeProfile.targets.core, analysis.diffDollars.core, 'text-blue-400')}
        {renderBucket('Risco (Altcoins)', analysis.currentPct.alt, activeProfile.targets.alt, analysis.diffDollars.alt, 'text-rose-400')}
      </div>

      <div className="bg-[#0b0e14] border border-slate-800/60 rounded-xl p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-6 uppercase tracking-wider">
          <AlertCircle size={16} className="text-amber-500" /> Plano de Ação Matemático
        </h4>
        
        <div className="space-y-4">
          {analysis.diffDollars.core > 0 && (
            <div className="flex items-start gap-4 text-sm bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
              <ArrowRight size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-slate-300">
                  O seu balde de <strong>Fundação</strong> precisa de <strong className="text-white">${analysis.diffDollars.core.toFixed(2)}</strong>.
                </span>
                <span className="text-xs text-slate-500">
                  {analysis.hasCore 
                    ? `Reforce a sua posição atual em ${analysis.coreNames} aproveitando o seu saldo em Caixa.` 
                    : "Você não possui ativos de fundação. Como este modelo exige uma base sólida, inicie uma posição em Bitcoin (BTC)."}
                </span>
              </div>
            </div>
          )}
          
          {analysis.diffDollars.alt > 0 && (
            <div className="flex items-start gap-4 text-sm bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
              <ArrowRight size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-slate-300">
                  Pode aumentar a exposição ao risco em <strong className="text-white">${analysis.diffDollars.alt.toFixed(2)}</strong>.
                </span>
                <span className="text-xs text-slate-500">
                  {analysis.topDiscountAlt ? `Tática: O ativo ${analysis.topDiscountAlt.symbol} está com ${Math.abs(analysis.topDiscountAlt.discount).toFixed(2)}% de desconto. Considere usá-lo para rebaixar o custo.` : "Considere alocar este valor nos altcoins do seu radar que estão mais distantes do Topo Histórico (ATH)."}
                </span>
              </div>
            </div>
          )}

          {analysis.diffDollars.caixa > 0 && (
            <div className="flex items-start gap-4 text-sm bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
              <ArrowRight size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-slate-300">
                  Está sobre-exposto no mercado. Precisa de proteger <strong className="text-white">${analysis.diffDollars.caixa.toFixed(2)}</strong> em USDT.
                </span>
                <span className="text-xs text-slate-500">
                  {analysis.topProfitAlt && analysis.topProfitAlt.profit > 0 ? `Realize lucros parciais no ativo ${analysis.topProfitAlt.symbol} (lucro de $${analysis.topProfitAlt.profit.toFixed(2)}) para reencher o seu caixa.` : "Limite novas compras até que os seus aportes mensais reequilibrem o saldo de caixa."}
                </span>
              </div>
            </div>
          )}
          
          {analysis.diffDollars.core <= 5 && analysis.diffDollars.alt <= 5 && analysis.diffDollars.caixa <= 5 && (
            <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 p-5 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle2 size={20} /> A sua carteira está matematicamente alinhada com o perfil institucional selecionado!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};