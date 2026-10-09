# 📈 ChainView - Crypto Portfolio Dashboard

O **ChainView** é um painel de controlo (dashboard) moderno e responsivo para gestão e monitorização de um portfólio de criptomoedas. Permite aos utilizadores registar os seus aportes e acompanhar lucros, prejuízos e o saldo total com atualizações de preços em tempo real.

## ✨ Funcionalidades Principais

* **Cotações em Tempo Real:** Integração com o WebSocket da Binance para atualizar os preços das criptomoedas instantaneamente.
* **Gestão de Aportes:** Adição de novas compras (Ativo, Quantidade, Valor Pago) através de um modal de pesquisa rápida.
* **Cálculo Automático:** Tabela de portfólio que calcula o Preço Médio, Lucro/Prejuízo em USD e em percentagem (%), limitando a exibição a 5 casas decimais para maior legibilidade.
* **Gráficos de Performance:** Visualização histórica (Semanal, Mensal, Anual) utilizando a biblioteca Recharts.
* **Histórico de Transações:** Registo detalhado de todas as operações realizadas por cada criptomoeda.
* **Armazenamento Local:** Os dados do utilizador são guardados no `localStorage` do navegador, garantindo que as informações não se perdem ao recarregar a página.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

* **[React](https://reactjs.org/)** (com **[Vite](https://vitejs.dev/)**): Biblioteca principal para a construção da interface de utilizador.
* **[TypeScript](https://www.typescriptlang.org/)**: Superconjunto de JavaScript que adiciona tipagem estática, garantindo um código mais seguro e previsível.
* **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS utilitário para a estilização rápida e moderna da interface.
* **[Recharts](https://recharts.org/)**: Biblioteca para a criação dos gráficos de performance e alocação.
* **[Lucide React](https://lucide.dev/)**: Conjunto de ícones utilizados em toda a aplicação.
* **WebSocket (Binance)**: Consumo da API pública da Binance para cotações ao vivo (ex: `wss://stream.binance.com:9443`).

## 📁 Estrutura do Projeto

A estrutura de pastas principal dentro de `src/` está organizada da seguinte forma:

```text
src/
├── components/          # Componentes visuais da interface (Tabelas, Gráficos, Modais)
│   ├── AddAssetModal.tsx
│   ├── PerformanceChart.tsx
│   ├── PortfolioTable.tsx
│   └── ...
├── data/                # Dados simulados (mock data) para testes iniciais
├── services/            # Serviços externos e APIs (ex: binanceWs.ts)
├── types/               # Definições de tipagem do TypeScript (crypto.ts)
├── App.tsx              # Componente raiz que monta o layout principal
└── main.tsx             # Ponto de entrada da aplicação React
