# 💰 Sistema Financeiro

Sistema completo de gestão financeira pessoal com controle de receitas, despesas, planejamento e análises.

## 🚀 Funcionalidades

- ✅ **Dashboard** - Visão geral das finanças
- ✅ **Receitas** - Gestão de entradas
- ✅ **Despesas** - Cartões, fixos, variáveis e extras
- ✅ **Planejamento** - Orçamento, metas, simulador de compras
- ✅ **Relatórios** - Gráficos e exportação em PDF/Excel
- ✅ **Farol Financeiro** - Análise de saúde financeira
- ✅ **Backup na Nuvem** - Sincronização automática com Firebase

## 📂 Estrutura do Projeto

```
projeto-financeiro/
├── index.html              # Página principal
├── css/
│   ├── main.css           # Estilos principais
│   └── responsive.css     # Responsividade mobile
├── js/
│   ├── firebase-config.js # Configuração Firebase
│   └── app.js             # Aplicação React
├── assets/                # Imagens e recursos
├── .env.example           # Template de variáveis de ambiente
├── .gitignore             # Arquivos ignorados pelo Git
└── README.md              # Este arquivo
```

## 🔧 Instalação Local

### 1. Clone o repositório
```bash
git clone [url-do-seu-repositorio]
cd projeto-financeiro
```

### 2. Configure o Firebase
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas credenciais do Firebase
```

### 3. Abra no navegador
```bash
# Abra o arquivo index.html diretamente no navegador
# OU use um servidor local:
python3 -m http.server 8000
# Acesse: http://localhost:8000
```

## 🌐 Deploy

### Vercel (Recomendado - GRÁTIS)

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no painel da Vercel:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- etc...

### Netlify (Alternativa - GRÁTIS)

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente no painel
3. Deploy automático a cada push!

## 🔒 Segurança

- ✅ Nunca commite o arquivo `.env` no Git
- ✅ Use o `.env.example` como template
- ✅ Configure variáveis de ambiente na plataforma de hospedagem
- ✅ Mantenha suas chaves do Firebase em segredo

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile responsivo (iOS e Android)
- ✅ Tablets

## 🛠️ Tecnologias

- React 18
- Firebase (Auth + Firestore)
- TailwindCSS
- Chart.js
- jsPDF / XLSX

## 📄 Licença

Todos os direitos reservados.

## 👤 Autor

Elpídio Cavalcante
