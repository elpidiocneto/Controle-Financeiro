# 📧 SISTEMA DE COMUNICAÇÃO - Estratégia Finanças

## 1. EMAIL DE BOAS-VINDAS ✅

**Quando:** Imediatamente após cadastro
**Gatilho:** Firebase Authentication `sendEmailVerification()`
**Conteúdo atual:**
- Link de verificação de email
- Instruções para confirmar cadastro

**MELHORIA SUGERIDA:**
Personalizar o template do Firebase Authentication:
1. Acessar Firebase Console → Authentication → Templates
2. Editar "Email de verificação"
3. Adicionar:
   ```
   Olá {{nome}}! 👋
   
   Bem-vindo ao Estratégia Finanças! 🎉
   
   Você ganhou 2 MESES GRÁTIS para testar todas as funcionalidades:
   ✅ Controle completo de receitas e despesas
   ✅ Planejamento financeiro inteligente
   ✅ Metas e simulações
   ✅ Gestão de pagamentos
   
   Para começar, confirme seu email clicando no botão abaixo:
   [VERIFICAR EMAIL]
   
   Após a verificação, aguarde aprovação do administrador (em até 24h).
   
   Dúvidas? Responda este email ou acesse nosso suporte.
   
   Abraço,
   Equipe Estratégia Finanças
   ```

---

## 2. NOTIFICAÇÕES DE VENCIMENTO 🔔

**Sistema implementado no código:**

### A. Alertas no Dashboard
Já implementado:
- Card "Próximos Vencimentos" (próximos 7 dias)
- Card "Vence Hoje" (urgente)
- Cores de alerta (vermelho ≤3 dias, amarelo ≤7 dias)

### B. Notificação por Email (A IMPLEMENTAR)

**Opção 1: Firebase Cloud Functions**
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

exports.enviarAlertasVencimento = functions.pubsub
  .schedule('0 9 * * *') // Todo dia às 9h
  .onRun(async (context) => {
    const usuarios = await admin.firestore().collection('usuarios').get();
    
    for (const userDoc of usuarios.docs) {
      const userData = userDoc.data();
      if (userData.notificacoes?.vencimentos !== false) {
        await verificarVencimentos(userDoc.id, userData.email);
      }
    }
  });

async function verificarVencimentos(userId, email) {
  const hoje = new Date();
  const em3Dias = new Date(hoje);
  em3Dias.setDate(em3Dias.getDate() + 3);
  
  // Buscar pagamentos pendentes que vencem em até 3 dias
  const backup = await admin.firestore()
    .collection('usuarios').doc(userId)
    .collection('backups').doc('atual').get();
  
  const dados = backup.data()?.dados || {};
  const vencimentos = [];
  
  // Verificar cartões, fixos, etc.
  // ... lógica de verificação ...
  
  if (vencimentos.length > 0) {
    await enviarEmail(email, {
      assunto: '⏰ Você tem ' + vencimentos.length + ' pagamento(s) vencendo em breve',
      corpo: `
        <h2>Olá! 👋</h2>
        <p>Você tem ${vencimentos.length} pagamento(s) vencendo nos próximos 3 dias:</p>
        <ul>
          ${vencimentos.map(v => `<li><strong>${v.nome}</strong>: R$ ${v.valor} (vence dia ${v.dia})</li>`).join('')}
        </ul>
        <p><a href="https://seu-site.com">Acessar Estratégia Finanças</a></p>
      `
    });
  }
}
```

**Opção 2: Verificação no Frontend (Mais simples)**
- Ao fazer login, verificar vencimentos
- Mostrar modal/notificação se houver pendências
- Já implementado parcialmente nos cards

---

## 3. NOTIFICAÇÕES DE METAS 🎯

**Sistema implementado:**

### A. Visual no Sistema
- Card "Progresso Geral" mostra percentual
- Cores dinâmicas (verde ≥75%, azul ≥40%, laranja <40%)
- Card "Metas Concluídas" com celebração

### B. Email de Conquista (A IMPLEMENTAR)
```javascript
// Adicionar no código ao marcar meta como concluída
async function notificarMetaConcluida(meta, usuario) {
  if (usuario.notificacoes?.metas !== false) {
    await enviarEmail(usuario.email, {
      assunto: '🎉 Parabéns! Você atingiu sua meta!',
      corpo: `
        <h2>🎊 Meta Atingida! 🎊</h2>
        <p>Parabéns! Você completou a meta:</p>
        <h3>${meta.nome}</h3>
        <p><strong>Valor alcançado:</strong> R$ ${meta.valor.toFixed(2)}</p>
        <p>Continue assim! Seu planejamento financeiro está indo muito bem! 💪</p>
      `
    });
  }
}
```

---

## 4. SUPORTE 💬

### Opção A: Chat Direto (Recomendado - Simples)

**WhatsApp Business:**
1. Criar número comercial no WhatsApp Business
2. Adicionar botão fixo no sistema:

```javascript
// Adicionar no sidebar ou footer
<a 
  href="https://wa.me/5581999999999?text=Olá! Preciso de ajuda com o Estratégia Finanças"
  target="_blank"
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#25D366',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '50px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 1000
  }}
>
  <span style={{fontSize: '1.5rem'}}>💬</span>
  <span style={{fontWeight: '700'}}>Suporte</span>
</a>
```

### Opção B: Sistema de Tickets
```javascript
// Adicionar tela de suporte
const TelaSuporte = () => {
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  
  const enviarTicket = async () => {
    await db.collection('tickets').add({
      userId: user.uid,
      email: user.email,
      nome: user.displayName,
      assunto,
      mensagem,
      status: 'ABERTO',
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('✅ Ticket enviado! Responderemos em breve.');
  };
  
  return (
    // Formulário de suporte
  );
};
```

---

## 5. NEWSLETTER 📰

### Sistema de Inscrição

```javascript
// Adicionar checkbox no cadastro
<label>
  <input 
    type="checkbox" 
    checked={aceitaNewsletter}
    onChange={e => setAceitaNewsletter(e.target.checked)}
  />
  Quero receber dicas financeiras por email (opcional)
</label>

// Salvar preferência
await db.collection('usuarios').doc(user.uid).update({
  newsletter: aceitaNewsletter
});
```

### Envio de Dicas (Mensal)

**Via Firebase Cloud Functions:**
```javascript
exports.enviarNewsletter = functions.pubsub
  .schedule('0 9 1 * *') // Todo dia 1 do mês às 9h
  .onRun(async (context) => {
    const usuarios = await admin.firestore()
      .collection('usuarios')
      .where('newsletter', '==', true)
      .get();
    
    const dicaDoMes = getDicaFinanceira();
    
    for (const userDoc of usuarios.docs) {
      await enviarEmail(userDoc.data().email, {
        assunto: '💡 Dica Financeira do Mês',
        corpo: dicaDoMes
      });
    }
  });

function getDicaFinanceira() {
  const dicas = [
    {
      titulo: 'Regra 50-30-20',
      conteudo: '50% necessidades, 30% desejos, 20% poupança...'
    },
    {
      titulo: 'Emergência em Primeiro Lugar',
      conteudo: 'Tenha 6 meses de despesas guardadas...'
    },
    // Mais dicas...
  ];
  
  const mes = new Date().getMonth();
  return dicas[mes % dicas.length];
}
```

---

## 6. CONFIGURAÇÕES DE NOTIFICAÇÃO

**Tela de Preferências do Usuário:**

```javascript
const TelaNotificacoes = () => {
  const [prefs, setPrefs] = useState({
    vencimentos: true,
    metas: true,
    newsletter: false
  });
  
  const salvar = async () => {
    await db.collection('usuarios').doc(user.uid).update({
      notificacoes: prefs
    });
  };
  
  return (
    <div>
      <h2>⚙️ Notificações</h2>
      
      <label>
        <input 
          type="checkbox"
          checked={prefs.vencimentos}
          onChange={e => setPrefs({...prefs, vencimentos: e.target.checked})}
        />
        Alertas de vencimento (3 dias antes)
      </label>
      
      <label>
        <input 
          type="checkbox"
          checked={prefs.metas}
          onChange={e => setPrefs({...prefs, metas: e.target.checked})}
        />
        Notificação ao atingir metas
      </label>
      
      <label>
        <input 
          type="checkbox"
          checked={prefs.newsletter}
          onChange={e => setPrefs({...prefs, newsletter: e.target.checked})}
        />
        Newsletter mensal (dicas financeiras)
      </label>
      
      <button onClick={salvar}>Salvar Preferências</button>
    </div>
  );
};
```

---

## RESUMO DE IMPLEMENTAÇÃO

### ✅ JÁ IMPLEMENTADO:
1. Email de verificação (Firebase Auth)
2. Alertas visuais de vencimento (Dashboard)
3. Indicadores de metas (cards coloridos)

### 🔨 PARA IMPLEMENTAR:

**Fácil (Frontend):**
- [ ] Botão de WhatsApp flutuante
- [ ] Checkbox de newsletter no cadastro
- [ ] Tela de preferências de notificação
- [ ] Modal de boas-vindas ao primeiro login

**Médio (Backend):**
- [ ] Sistema de tickets de suporte
- [ ] Logs de comunicação enviada

**Avançado (Cloud Functions):**
- [ ] Email diário de vencimentos
- [ ] Email ao atingir meta
- [ ] Newsletter mensal
- [ ] Personalizar template Firebase

---

## PRÓXIMOS PASSOS RECOMENDADOS:

1. **Imediato:** Adicionar botão WhatsApp (5 minutos)
2. **Curto prazo:** Tela de preferências (30 minutos)
3. **Médio prazo:** Sistema de tickets (2 horas)
4. **Longo prazo:** Cloud Functions para emails (1 dia)

