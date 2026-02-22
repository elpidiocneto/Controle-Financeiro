# 💬 INTEGRAÇÃO WHATSAPP - Estratégia Finanças

## 📋 VISÃO GERAL

Integração completa do WhatsApp com o sistema para:
1. ✅ **Cadastro de gastos via mensagem** ("Gastei R$ 50 no Uber")
2. ✅ **Notificações de vencimento** (alertas automáticos todo dia)

---

## 🚀 ARQUITETURA RECOMENDADA

### Opção 1: WhatsApp Business API + Twilio (Profissional)
**Melhor para:** Produção, empresa crescendo, mais de 100 usuários

### Opção 2: Baileys + Node.js (Econômico)
**Melhor para:** MVP, teste inicial, até 100 usuários

Vou detalhar a **Opção 2** que é mais acessível:

---

## 🛠️ IMPLEMENTAÇÃO COM BAILEYS

### 1. ESTRUTURA DO PROJETO

```
estrategia-financas/
├── functions/           # Firebase Cloud Functions
│   ├── index.js        # Função principal
│   ├── whatsapp.js     # Lógica do WhatsApp
│   └── package.json
├── public/             # Frontend existente
└── firestore.rules     # Regras de segurança
```

### 2. INSTALAR DEPENDÊNCIAS

```bash
cd functions
npm install @whiskeysockets/baileys qrcode-terminal firebase-admin firebase-functions
```

### 3. CÓDIGO DO BOT WHATSAPP

**`functions/whatsapp.js`**
```javascript
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const admin = require('firebase-admin');

let sock;
let qrAtual = null;

// Inicializar conexão
async function conectarWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      qrAtual = qr;
      qrcode.generate(qr, { small: true });
      console.log('📱 Escaneie o QR Code com WhatsApp');
    }
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('Reconectando...');
        conectarWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp conectado!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('messages.upsert', handleMessage);
}

// Processar mensagens recebidas
async function handleMessage({ messages, type }) {
  if (type !== 'notify') return;
  
  const msg = messages[0];
  if (!msg.message) return;
  
  const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
  const remetente = msg.key.remoteJid;
  
  if (!texto) return;
  
  console.log(`📨 Mensagem de ${remetente}: ${texto}`);
  
  // Buscar usuário no Firestore pelo número do WhatsApp
  const usuario = await buscarUsuarioPorWhatsApp(remetente);
  
  if (!usuario) {
    await enviarMensagem(remetente, 
      '❌ Número não cadastrado.\n\n' +
      'Para usar o bot, vincule seu WhatsApp no menu Configurações do Estratégia Finanças.'
    );
    return;
  }
  
  // Processar comando
  await processarComando(texto, remetente, usuario);
}

// Processar comandos do usuário
async function processarComando(texto, numero, usuario) {
  const textoLower = texto.toLowerCase().trim();
  
  // 1. CADASTRAR GASTO
  // Padrões aceitos:
  // "gastei 50 uber"
  // "paguei R$ 150 mercado"
  // "comprei 30.50 farmácia"
  
  const regexGasto = /(?:gastei|paguei|comprei|pago)\s+(?:r\$)?\s*(\d+(?:[.,]\d{1,2})?)\s+(.+)/i;
  const matchGasto = texto.match(regexGasto);
  
  if (matchGasto) {
    const valor = parseFloat(matchGasto[1].replace(',', '.'));
    const descricao = matchGasto[2].trim();
    
    await cadastrarGasto(usuario.uid, valor, descricao);
    
    await enviarMensagem(numero,
      `✅ Gasto registrado!\n\n` +
      `💰 Valor: R$ ${valor.toFixed(2)}\n` +
      `📝 Descrição: ${descricao}\n` +
      `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `Tipo: Gasto Variável`
    );
    return;
  }
  
  // 2. VER RESUMO DO MÊS
  if (textoLower.includes('resumo') || textoLower.includes('saldo')) {
    const resumo = await buscarResumoMes(usuario.uid);
    
    await enviarMensagem(numero,
      `📊 *Resumo do Mês*\n\n` +
      `💰 Receitas: R$ ${resumo.receitas.toFixed(2)}\n` +
      `💸 Despesas: R$ ${resumo.despesas.toFixed(2)}\n` +
      `${resumo.saldo >= 0 ? '✅' : '⚠️'} Saldo: R$ ${resumo.saldo.toFixed(2)}\n\n` +
      `📱 Acesse: estrategia.financas.com.br`
    );
    return;
  }
  
  // 3. PRÓXIMOS VENCIMENTOS
  if (textoLower.includes('vencimento') || textoLower.includes('pagar') || textoLower.includes('contas')) {
    const vencimentos = await buscarProximosVencimentos(usuario.uid);
    
    if (vencimentos.length === 0) {
      await enviarMensagem(numero, '✅ Você não tem contas vencendo nos próximos 7 dias!');
      return;
    }
    
    let msg = `⏰ *Próximos Vencimentos*\n\n`;
    vencimentos.forEach(v => {
      const urgente = v.diasRestantes <= 3;
      msg += `${urgente ? '🔴' : '🟡'} *${v.nome}*\n`;
      msg += `   R$ ${v.valor.toFixed(2)} - Dia ${v.dia}\n`;
      msg += `   ${v.diasRestantes === 0 ? 'VENCE HOJE!' : `Faltam ${v.diasRestantes} dias`}\n\n`;
    });
    
    await enviarMensagem(numero, msg);
    return;
  }
  
  // 4. AJUDA
  if (textoLower.includes('ajuda') || textoLower === 'menu' || textoLower === '?') {
    await enviarMensagem(numero,
      `💬 *Bot Estratégia Finanças*\n\n` +
      `📝 *Comandos disponíveis:*\n\n` +
      `▫️ Cadastrar gasto:\n` +
      `   "gastei 50 uber"\n` +
      `   "paguei 150 mercado"\n\n` +
      `▫️ Ver resumo:\n` +
      `   "resumo" ou "saldo"\n\n` +
      `▫️ Ver vencimentos:\n` +
      `   "vencimentos" ou "contas"\n\n` +
      `▫️ Ajuda:\n` +
      `   "ajuda" ou "menu"\n\n` +
      `📱 Acesse: estrategia.financas.com.br`
    );
    return;
  }
  
  // Comando não reconhecido
  await enviarMensagem(numero,
    '❓ Não entendi.\n\n' +
    'Digite *ajuda* para ver os comandos disponíveis.'
  );
}

// Enviar mensagem
async function enviarMensagem(numero, texto) {
  try {
    await sock.sendMessage(numero, { text: texto });
    console.log(`✅ Mensagem enviada para ${numero}`);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
  }
}

// Buscar usuário por número do WhatsApp
async function buscarUsuarioPorWhatsApp(numero) {
  // Remover @s.whatsapp.net e formatar
  const numeroLimpo = numero.replace('@s.whatsapp.net', '');
  
  const snapshot = await admin.firestore()
    .collection('usuarios')
    .where('whatsapp', '==', numeroLimpo)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { uid: doc.id, ...doc.data() };
}

// Cadastrar gasto no Firestore
async function cadastrarGasto(userId, valor, descricao) {
  const agora = new Date();
  const mes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][agora.getMonth()];
  const ano = agora.getFullYear();
  
  // Buscar dados atuais
  const backupRef = admin.firestore()
    .collection('usuarios').doc(userId)
    .collection('backups').doc('atual');
  
  const backup = await backupRef.get();
  const dados = backup.data()?.dados || {};
  const gastosVariaveis = dados.gastosVariaveis || [];
  
  // Adicionar novo gasto
  const novoGasto = {
    id: Date.now(),
    descricao: descricao,
    valor: valor,
    categoria: 'Diversos',
    mes: mes,
    ano: ano,
    data: agora.toLocaleDateString('pt-BR'),
    dataCompleta: agora.toISOString().split('T')[0],
    fonte: 'whatsapp'
  };
  
  gastosVariaveis.push(novoGasto);
  
  // Salvar no Firestore
  dados.gastosVariaveis = gastosVariaveis;
  await backupRef.set({ dados }, { merge: true });
  
  console.log(`✅ Gasto cadastrado para usuário ${userId}`);
}

// Buscar resumo do mês
async function buscarResumoMes(userId) {
  const backupRef = admin.firestore()
    .collection('usuarios').doc(userId)
    .collection('backups').doc('atual');
  
  const backup = await backupRef.get();
  const dados = backup.data()?.dados || {};
  
  const agora = new Date();
  const mes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][agora.getMonth()];
  const ano = agora.getFullYear();
  
  // Calcular receitas
  const receitas = (dados.receitas || [])
    .filter(r => r.mes === mes && r.ano === ano)
    .reduce((sum, r) => sum + r.valor, 0);
  
  // Calcular despesas
  const cartoes = (dados.cartoes || []).reduce((sum, c) => {
    const val = c.valores?.[ano]?.[mes] || 0;
    return sum + val;
  }, 0);
  
  const fixos = (dados.gastosFixos || [])
    .filter(g => !g.mes || (g.mes === mes && g.ano === ano))
    .reduce((sum, g) => sum + g.valor, 0);
  
  const variaveis = (dados.gastosVariaveis || [])
    .filter(g => g.mes === mes && g.ano === ano)
    .reduce((sum, g) => sum + g.valor, 0);
  
  const extras = (dados.gastosExtras || [])
    .filter(g => g.mes === mes && g.ano === ano)
    .reduce((sum, g) => sum + g.valor, 0);
  
  const despesas = cartoes + fixos + variaveis + extras;
  
  return {
    receitas,
    despesas,
    saldo: receitas - despesas
  };
}

// Buscar próximos vencimentos
async function buscarProximosVencimentos(userId) {
  const backupRef = admin.firestore()
    .collection('usuarios').doc(userId)
    .collection('backups').doc('atual');
  
  const backup = await backupRef.get();
  const dados = backup.data()?.dados || {};
  
  const agora = new Date();
  const hoje = agora.getDate();
  const mes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][agora.getMonth()];
  
  const vencimentos = [];
  
  // Cartões
  (dados.cartoes || []).forEach(c => {
    const status = dados.farol?.[`${c.nome}-${mes}-${agora.getFullYear()}`];
    if (status !== 'PAGO' && c.vencimento) {
      const diasRestantes = c.vencimento - hoje;
      if (diasRestantes >= 0 && diasRestantes <= 7) {
        const val = c.valores?.[agora.getFullYear()]?.[mes] || 0;
        vencimentos.push({
          nome: c.nome,
          valor: val,
          dia: c.vencimento,
          diasRestantes
        });
      }
    }
  });
  
  // Gastos Fixos
  (dados.gastosFixos || []).forEach(g => {
    const status = dados.farol?.[`${g.descricao}-${mes}-${agora.getFullYear()}`];
    if (status !== 'PAGO' && g.vencimento) {
      const diasRestantes = g.vencimento - hoje;
      if (diasRestantes >= 0 && diasRestantes <= 7) {
        vencimentos.push({
          nome: g.descricao,
          valor: g.valor,
          dia: g.vencimento,
          diasRestantes
        });
      }
    }
  });
  
  return vencimentos.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

// NOTIFICAÇÕES AUTOMÁTICAS - Enviar todo dia às 9h
async function enviarNotificacoesVencimento() {
  console.log('🔔 Iniciando envio de notificações de vencimento...');
  
  const usuarios = await admin.firestore()
    .collection('usuarios')
    .where('whatsapp', '!=', null)
    .where('notificacoes.vencimentos', '==', true)
    .get();
  
  for (const userDoc of usuarios.docs) {
    const userData = userDoc.data();
    const numero = userData.whatsapp + '@s.whatsapp.net';
    
    const vencimentos = await buscarProximosVencimentos(userDoc.id);
    
    // Filtrar apenas vencimentos de hoje ou próximos 3 dias
    const vencHoje = vencimentos.filter(v => v.diasRestantes === 0);
    const venc3Dias = vencimentos.filter(v => v.diasRestantes > 0 && v.diasRestantes <= 3);
    
    if (vencHoje.length > 0) {
      let msg = `🚨 *VENCIMENTOS HOJE!*\n\n`;
      vencHoje.forEach(v => {
        msg += `💳 ${v.nome}\n`;
        msg += `   R$ ${v.valor.toFixed(2)}\n\n`;
      });
      msg += `📱 Acesse para pagar: estrategia.financas.com.br`;
      
      await enviarMensagem(numero, msg);
    } else if (venc3Dias.length > 0) {
      let msg = `⏰ *Vencimentos Próximos*\n\n`;
      venc3Dias.forEach(v => {
        msg += `${v.diasRestantes === 1 ? '🔴' : '🟡'} ${v.nome}\n`;
        msg += `   R$ ${v.valor.toFixed(2)}\n`;
        msg += `   ${v.diasRestantes === 1 ? 'Vence AMANHÃ!' : `Vence em ${v.diasRestantes} dias`}\n\n`;
      });
      
      await enviarMensagem(numero, msg);
    }
  }
  
  console.log('✅ Notificações enviadas!');
}

module.exports = {
  conectarWhatsApp,
  enviarMensagem,
  enviarNotificacoesVencimento
};
```

### 4. CLOUD FUNCTION PARA NOTIFICAÇÕES AUTOMÁTICAS

**`functions/index.js`**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { enviarNotificacoesVencimento } = require('./whatsapp');

admin.initializeApp();

// Executar todo dia às 9h (horário de Brasília)
exports.notificarVencimentos = functions
  .region('southamerica-east1') // São Paulo
  .pubsub
  .schedule('0 9 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    await enviarNotificacoesVencimento();
    return null;
  });
```

### 5. ADICIONAR CAMPO WHATSAPP NO CADASTRO

**No frontend (`app-compiled.js`):**

```javascript
// Adicionar input de WhatsApp no formulário
<div style={{marginBottom: '1.25rem'}}>
  <label style={{
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  }}>
    WhatsApp (opcional)
  </label>
  <input
    type="tel"
    placeholder="(81) 99999-9999"
    value={whatsapp}
    onChange={e => setWhatsApp(e.target.value)}
    style={{
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '2px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      fontSize: '0.875rem'
    }}
  />
  <p style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem'}}>
    Receba notificações e cadastre gastos via WhatsApp
  </p>
</div>

// Salvar no Firestore
await db.collection('usuarios').doc(userCredential.user.uid).set({
  // ... outros campos
  whatsapp: whatsapp.replace(/\D/g, ''), // Remover formatação
  notificacoes: {
    vencimentos: true,
    metas: true,
    newsletter: aceitaNewsletter
  }
});
```

### 6. TELA DE CONFIGURAÇÕES (VINCULAR WHATSAPP)

```javascript
const TelaConfiguracoes = () => {
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [notif, setNotif] = useState(user.notificacoes || {});
  
  const salvar = async () => {
    await db.collection('usuarios').doc(user.uid).update({
      whatsapp: whatsapp.replace(/\D/g, ''),
      notificacoes: notif
    });
    
    alert('✅ Configurações salvas!');
  };
  
  return (
    <div>
      <h2>⚙️ Configurações</h2>
      
      <div>
        <h3>📱 WhatsApp</h3>
        <input
          type="tel"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
          placeholder="(81) 99999-9999"
        />
        <p>Use o bot para cadastrar gastos e receber alertas!</p>
      </div>
      
      <div>
        <h3>🔔 Notificações</h3>
        <label>
          <input
            type="checkbox"
            checked={notif.vencimentos}
            onChange={e => setNotif({...notif, vencimentos: e.target.checked})}
          />
          Alertas de vencimento diários
        </label>
      </div>
      
      <button onClick={salvar}>Salvar</button>
    </div>
  );
};
```

---

## 📱 COMO USAR (USUÁRIO FINAL)

### 1. VINCULAR WHATSAPP
1. Acessar "Configurações" no sistema
2. Adicionar número do WhatsApp
3. Marcar "Receber alertas de vencimento"
4. Salvar

### 2. USAR O BOT

**Cadastrar gastos:**
```
Você: gastei 50 uber
Bot: ✅ Gasto registrado!
     💰 Valor: R$ 50.00
     📝 Descrição: uber
     📅 Data: 21/02/2026
```

**Ver resumo:**
```
Você: resumo
Bot: 📊 Resumo do Mês
     💰 Receitas: R$ 5.000,00
     💸 Despesas: R$ 3.200,00
     ✅ Saldo: R$ 1.800,00
```

**Ver vencimentos:**
```
Você: vencimentos
Bot: ⏰ Próximos Vencimentos
     
     🔴 Cartão Nubank
        R$ 850,00 - Dia 25
        Vence AMANHÃ!
     
     🟡 Conta de Luz
        R$ 180,00 - Dia 28
        Faltam 3 dias
```

### 3. RECEBER ALERTAS AUTOMÁTICOS

**Todo dia às 9h, o bot envia:**
- 🚨 Se houver vencimento no dia
- ⏰ Se houver vencimento em até 3 dias

---

## 💰 CUSTOS

### Baileys (Gratuito)
- ✅ Grátis
- ✅ Ilimitado
- ⚠️ Não oficial (risco de ban)
- ⚠️ Precisa manter servidor rodando

### Twilio (Oficial)
- 💰 $0.005 por mensagem enviada
- 💰 $0.0075 por mensagem recebida
- ✅ 100% oficial e confiável
- ✅ Melhor para escala

---

## 🚀 DEPLOY

### Opção 1: VPS (Baileys)
```bash
# No servidor (ex: DigitalOcean, AWS EC2)
git clone seu-repo
cd functions
npm install
node index.js

# O terminal mostrará o QR Code
# Escanear com WhatsApp
```

### Opção 2: Firebase Functions (Twilio)
```bash
firebase deploy --only functions
```

---

## 📊 MÉTRICAS RECOMENDADAS

```javascript
// Rastrear uso do bot
await admin.firestore().collection('bot_metrics').add({
  userId: usuario.uid,
  acao: 'gasto_cadastrado',
  valor: valor,
  timestamp: admin.firestore.FieldValue.serverTimestamp()
});
```

---

## 🔒 SEGURANÇA

1. **Validar número do WhatsApp** antes de processar
2. **Rate limiting** para evitar spam
3. **Logs de todas as interações**
4. **Não processar números desconhecidos**

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Implementar código do bot
2. ✅ Adicionar campo WhatsApp no cadastro
3. ✅ Criar tela de configurações
4. ✅ Deploy do bot em servidor
5. ✅ Escanear QR Code
6. ✅ Testar comandos
7. ✅ Configurar notificações automáticas

---

## ❓ FAQ

**P: O bot funciona em grupos?**
R: Não, apenas em conversas privadas por segurança.

**P: Posso ter vários números?**
R: Sim, cada usuário pode vincular seu próprio WhatsApp.

**P: E se o servidor cair?**
R: Use PM2 ou similar para auto-restart.

**P: Funciona com WhatsApp Business?**
R: Sim! Funciona com qualquer conta WhatsApp.

