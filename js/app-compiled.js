const {
  useState,
  useEffect
} = React;

// Firebase já foi inicializado no firebase-config.js
// Usando db global do window

const DADOS_INICIAIS = {
  // Novos usuários começam com dados completamente vazios.
  // Cartões e gastos são cadastrados pelo próprio usuário.
  gastosFixos: [],
  cartoes: []
};
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// ── Helpers seguros para localStorage ────────────────────────────────────────
// Protege contra: JSON corrompido, modo privado do Safari, quota excedida
const lsGet = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v);
  } catch (e) {
    localStorage.removeItem(key); // limpa dado corrompido
    return fallback;
  }
};
const lsSet = (key, value) => {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    // QuotaExceededError (storage cheio) ou SecurityError (modo privado no Safari)
  }
};

// ── Helper seguro para parseFloat ─────────────────────────────────────────────
// Retorna fallback (padrão 0) para NaN, Infinity ou valores inválidos
const safeFloat = (v, fallback = 0) => {
  const n = parseFloat(v);
  return isFinite(n) ? n : fallback;
};
// ─────────────────────────────────────────────────────────────────────────────

// Modal genérico de input (substitui prompt() nativo)
function InputDialog({titulo, label, valorPadrao = '', onConfirm, onCancel}) {
  const [valor, setValor] = React.useState(valorPadrao);
  const handleConfirm = () => onConfirm(valor);
  const handleKey = (e) => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') onCancel(); };
  return /*#__PURE__*/React.createElement("div", {style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}},
    /*#__PURE__*/React.createElement("div", {style:{background:C.bg,borderRadius:'16px',padding:'1.5rem',width:'100%',maxWidth:'380px',boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}},
      /*#__PURE__*/React.createElement("h3", {style:{margin:'0 0 0.75rem',fontSize:'1.05rem',fontWeight:'700',color:'#1e1b4b'}}, titulo),
      /*#__PURE__*/React.createElement("p", {style:{margin:'0 0 0.75rem',fontSize:'0.9rem',color:'#4b5563'}}, label),
      /*#__PURE__*/React.createElement("input", {type:'number',value:valor,onChange:e=>setValor(e.target.value),onKeyDown:handleKey,autoFocus:true,style:{width:'100%',padding:'0.6rem 0.75rem',border:'1.5px solid #d1d5db',borderRadius:'8px',fontSize:'1rem',outline:'none',boxSizing:'border-box'}}),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',gap:'0.75rem',marginTop:'1rem',justifyContent:'flex-end'}},
        /*#__PURE__*/React.createElement("button", {onClick:onCancel,style:{padding:'0.5rem 1.1rem',border:'1.5px solid #d1d5db',borderRadius:'8px',background:C.bg,cursor:'pointer',fontSize:'0.9rem',color:C.textMuted}}, "Cancelar"),
        /*#__PURE__*/React.createElement("button", {onClick:handleConfirm,style:{padding:'0.5rem 1.25rem',border:'none',borderRadius:'8px',background:'#f97316',color:'#fff',cursor:'pointer',fontSize:'0.9rem',fontWeight:'700'}}, "Confirmar")
      )
    )
  );
}

// ─── SISTEMA DE NOTIFICAÇÕES TOAST ───────────────────────────────────────────
function ToastContainer() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    // Injetar animação CSS uma única vez
    if (!document.getElementById('toast-style')) {
      const s = document.createElement('style');
      s.id = 'toast-style';
      s.textContent = '@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}' +
                      '@keyframes toastOut{from{opacity:1}to{opacity:0;transform:translateX(110%)}}';
      document.head.appendChild(s);
    }
    // Expor função global
    window.showToast = function(msg, tipo, duracao) {
      tipo = tipo || 'success';
      duracao = duracao || (tipo === 'error' || tipo === 'warning' ? 6000 : 4000);
      const id = Date.now() + Math.random();
      setToasts(function(prev) { return [...prev.slice(-2), {id: id, msg: msg, tipo: tipo}]; });
      setTimeout(function() {
        setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); });
      }, duracao);
    };
    return function() { window.showToast = null; };
  }, []);

  var CORES = {
    success: {bg: '#059669', icone: '✅'},
    error:   {bg: '#dc2626', icone: '❌'},
    warning: {bg: '#d97706', icone: '⚠️'},
    info:    {bg: '#ea580c', icone: 'ℹ️'}
  };

  var _toastMob = window.innerWidth <= 768;
  return React.createElement('div', {
    style: {position:'fixed',
            bottom: _toastMob ? '88px' : '24px',
            right: _toastMob ? '12px' : '24px',
            left: _toastMob ? '12px' : 'auto',
            zIndex:999999,
            display:'flex', flexDirection:'column-reverse', gap:'10px', pointerEvents:'none'}
  },
    toasts.map(function(t) {
      var c = CORES[t.tipo] || CORES.success;
      return React.createElement('div', {
        key: t.id,
        style: {
          background: c.bg, color: '#fff',
          padding: '12px 18px', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          fontSize: '0.87rem', fontWeight: '600',
          maxWidth: _toastMob ? '100%' : '340px', lineHeight: '1.5',
          pointerEvents: 'auto', cursor: 'default',
          animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }
      }, c.icone + '  ' + t.msg);
    })
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// COMPONENTE DE AUTENTICAÇÃO
function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [reenviarModal, setReenviarModal] = useState(false);
  const [reenviarEmail, setReenviarEmail] = useState('');
  const [reenviarSenha, setReenviarSenha] = useState('');
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
      // Se está cadastrando, ignorar este evento
      if (registering) {
        return;
      }
      if (user && db) {
        // Primeiro verificar se é admin ANTES de bloquear por email
        let isUserAdmin = false;
        try {
          const userDoc = await db.collection('usuarios').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            isUserAdmin = userData.isAdmin === true;
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error);
        }

        // Verificar se email foi verificado (MAS NÃO BLOQUEAR ADMINS!)
        if (!user.emailVerified && !isUserAdmin) {
          await firebase.auth().signOut();
          alert('📧 Email não verificado!\n\n⚠️ Você precisa confirmar seu email antes de fazer login.\n\nVerifique sua caixa de entrada (e spam) e clique no link de verificação.\n\n💡 Não recebeu? Tente fazer login novamente para reenviar o email.');
          setUser(null);
          setLoading(false);
          return;
        }

        // Verificar status do usuário no Firestore
        try {
          const userDoc = await db.collection('usuarios').doc(user.uid).get();

          // Se usuário NÃO existe no Firestore, criar como PENDENTE
          if (!userDoc.exists) {
            await db.collection('usuarios').doc(user.uid).set({
              nome: user.displayName || '',
              email: user.email,
              isAdmin: false,
              status: 'PENDENTE',
              emailVerificado: user.emailVerified,
              criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
              ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Bloquear acesso até aprovação
            await firebase.auth().signOut();
            alert('⏳ Sua conta foi criada e está aguardando aprovação do administrador.\n\nPor favor, aguarde a liberação do seu acesso.');
            setUser(null);
            setLoading(false);
            return;
          }
          const userData = userDoc.data();

          // Atualizar status de email verificado no Firestore
          if (user.emailVerified && !userData.emailVerificado) {
            await db.collection('usuarios').doc(user.uid).update({
              emailVerificado: true
            });
          }

          // Verificar status de aprovação (NÃO BLOQUEAR ADMINS!)
          if (!userData.isAdmin) {
            if (userData.status === 'PENDENTE') {
              await firebase.auth().signOut();
              alert('⏳ Sua conta ainda está aguardando aprovação do administrador.\n\nPor favor, aguarde a liberação do seu acesso.');
              setUser(null);
              setLoading(false);
              return;
            } else if (userData.status === 'REJEITADO') {
              await firebase.auth().signOut();
              alert('❌ Sua solicitação de cadastro foi rejeitada.\n\nEntre em contato com o administrador para mais informações.');
              setUser(null);
              setLoading(false);
              return;
            } else if (userData.status !== 'APROVADO') {
              // Se não tem status definido, considerar como PENDENTE
              await db.collection('usuarios').doc(user.uid).update({
                status: 'PENDENTE'
              });
              await firebase.auth().signOut();
              alert('⏳ Sua conta precisa ser aprovada pelo administrador.\n\nPor favor, aguarde a liberação do seu acesso.');
              setUser(null);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
          // Em caso de erro, bloquear acesso por segurança
          await firebase.auth().signOut();
          alert('❌ Erro ao verificar suas permissões.\n\nTente novamente mais tarde.');
          setUser(null);
          setLoading(false);
          return;
        }
      }

      // ===================================================
      // SINCRONIZAÇÃO DE DADOS POR USUÁRIO
      // Sempre carrega do Firestore no login/reload para garantir dados
      // atualizados em todos os dispositivos. Reload apenas em troca de conta.
      // ===================================================
      if (user) {
        const uidAnterior = localStorage.getItem('_currentUserId');
        const uidMudou = uidAnterior && uidAnterior !== user.uid;
        // Sempre sincroniza: garante dados atualizados em multi-dispositivo e após limpeza de cache
        if (true) {
          try {
            // 1. Limpar TODOS os dados do localStorage
            const keysToRemove = ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'farol', 'metas', 'metasFinanceiras', 'orcamento', 'orcamentosMensais', 'orcamentoAnual', 'planejadosMes', 'comprasParceladas', 'dividas', 'reservaEmergencia', 'categoriasPersonalizadas', 'anoAtual', 'mesAtual'];
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // 2. Carregar dados do Firestore do usuário atual
            const backupDoc = await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
            if (backupDoc.exists) {
              const dadosBackup = backupDoc.data().dados || {};
              if (dadosBackup.cartoes) lsSet('cartoes', dadosBackup.cartoes);
              if (dadosBackup.gastosFixos) lsSet('gastosFixos', dadosBackup.gastosFixos);
              if (dadosBackup.gastosVariaveis) lsSet('gastosVariaveis', dadosBackup.gastosVariaveis);
              if (dadosBackup.gastosExtras) lsSet('gastosExtras', dadosBackup.gastosExtras);
              if (dadosBackup.receitas) lsSet('receitas', dadosBackup.receitas);
              if (dadosBackup.farol) lsSet('farol', dadosBackup.farol);
              if (dadosBackup.metas) lsSet('metas', dadosBackup.metas);
              if (dadosBackup.metasFinanceiras) lsSet('metasFinanceiras', dadosBackup.metasFinanceiras);
              if (dadosBackup.orcamento) lsSet('orcamento', dadosBackup.orcamento);
              if (dadosBackup.orcamentosMensais) lsSet('orcamentosMensais', dadosBackup.orcamentosMensais);
              if (dadosBackup.orcamentoAnual) lsSet('orcamentoAnual', dadosBackup.orcamentoAnual);
              if (dadosBackup.planejadosMes) lsSet('planejadosMes', dadosBackup.planejadosMes);
              if (dadosBackup.comprasParceladas) lsSet('comprasParceladas', dadosBackup.comprasParceladas);
              if (dadosBackup.dividas) lsSet('dividas', dadosBackup.dividas);
              if (dadosBackup.reservaEmergencia !== undefined) lsSet('reservaEmergencia', dadosBackup.reservaEmergencia.toString());
              if (dadosBackup.categoriasPersonalizadas) lsSet('categoriasPersonalizadas', dadosBackup.categoriasPersonalizadas);
            } else {
            }

            // 3. Salvar o uid atual para comparação futura
            localStorage.setItem('_currentUserId', user.uid);

            // 4. Se o uid MUDOU (troca de conta), recarregar a página
            //    para que os useState do React reinicializem com os dados corretos
            if (uidMudou) {
              window.location.reload();
              return;
            }
          } catch (error) {
            console.error('Erro ao isolar dados do usuário:', error);
          }
        }
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [registering]);
  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

      // Atualizar último acesso
      await db.collection('usuarios').doc(userCredential.user.uid).update({
        ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(() => {
        // Se não existir, criar
        db.collection('usuarios').doc(userCredential.user.uid).set({
          nome: userCredential.user.displayName || '',
          email: userCredential.user.email,
          isAdmin: false,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch (error) {
      const messages = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/invalid-email': 'Email inválido'
      };
      setError(messages[error.code] || 'Erro ao fazer login');
    }
  };
  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setRegistering(true); // Bloquear onAuthStateChanged

    try {
      // 1. Criar usuário
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({
        displayName: nome
      });

      // 2. Criar documento no Firestore com dados de trial
      const agora = new Date();
      const fimTrial = new Date(agora);
      fimTrial.setDate(fimTrial.getDate() + 60); // 60 dias = 2 meses

      await db.collection('usuarios').doc(userCredential.user.uid).set({
        nome: nome,
        email: email,
        isAdmin: false,
        status: 'PENDENTE',
        emailVerificado: false,
        plano: 'trial',
        dataFimTrial: fimTrial,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 3. Enviar email de verificação
      await userCredential.user.sendEmailVerification({
        url: window.location.href,
        handleCodeInApp: false
      });

      // 4. Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Fazer logout
      await firebase.auth().signOut();

      // 6. Resetar estados
      setRegistering(false);
      setEmail('');
      setPassword('');
      setNome('');
      setAuthMode('login');

      // 7. Mostrar mensagem de sucesso
      alert('✅ Cadastro realizado com sucesso!\n\n📧 Enviamos um email de verificação para: ' + email + '\n\n⚠️ IMPORTANTE:\n1. Verifique sua caixa de entrada (e spam)\n2. Clique no link do email para confirmar\n3. Depois aguarde aprovação do administrador\n\nSem a verificação do email, você não poderá fazer login!');
    } catch (error) {
      setRegistering(false);
      const messages = {
        'auth/email-already-in-use': 'Email já cadastrado',
        'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
        'auth/invalid-email': 'Email inválido'
      };
      setError(messages[error.code] || 'Erro ao cadastrar: ' + error.message);
      console.error('Erro no cadastro:', error);
    }
  };
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: "loading-screen"
    }, /*#__PURE__*/React.createElement("img", {
      src: window.LOGO_B64,
      alt: "Estrat\xE9gia Finan\xE7as",
      style: {
        maxHeight: '80px',
        width: 'auto',
        marginBottom: '1rem'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "loading-title"
    }, "Estrat\xE9gia Finan\xE7as"), /*#__PURE__*/React.createElement("div", {
      className: "loading-subtitle"
    }, "Carregando seu controle financeiro..."), /*#__PURE__*/React.createElement("div", {
      className: "loading-dots"
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)));
  }
  if (registering) {
    return /*#__PURE__*/React.createElement("div", {
      className: "loading-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "loading-icon"
    }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
      className: "loading-title"
    }, "Criando sua conta..."), /*#__PURE__*/React.createElement("div", {
      className: "loading-subtitle"
    }, "Preparando tudo para voc\xEA!"), /*#__PURE__*/React.createElement("div", {
      className: "loading-dots"
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.8rem',
        marginTop: '1.5rem'
      }
    }, "\u2728 2 meses gratuitos j\xE1 liberados"));
  }
  if (!user) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        marginBottom: '2rem'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.LOGO_B64,
      alt: "Estrat\xE9gia Finan\xE7as",
      style: {
        maxHeight: '70px',
        width: 'auto',
        objectFit: 'contain',
        marginBottom: '0.5rem',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto'
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.875rem',
        margin: 0
      }
    }, authMode === 'login' ? 'Bem-vindo de volta' : '2 meses grátis para começar')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '1.5rem'
      }
    }, ['login', 'register'].map(mode => /*#__PURE__*/React.createElement("button", {
      key: mode,
      onClick: () => {
        setAuthMode(mode);
        setError('');
      },
      style: {
        flex: 1,
        padding: '0.6rem',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        background: authMode === mode ? '#f97316' : 'transparent',
        color: authMode === mode ? '#fff' : 'rgba(255,255,255,0.45)'
      }
    }, mode === 'login' ? 'Entrar' : 'Criar Conta'))), authMode === 'register' && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(249,115,22,0.2))',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#10b981',
        fontSize: '0.8rem',
        fontWeight: '600'
      }
    }, "\u2728 2 meses gr\xE1tis \u2022 Depois apenas R$ 29,90/m\xEAs \u2022 Cancele quando quiser")), error && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        color: '#fca5a5',
        fontSize: '0.875rem'
      }
    }, "\u26A0\uFE0F ", error), /*#__PURE__*/React.createElement("form", {
      onSubmit: authMode === 'login' ? handleLogin : handleRegister
    }, authMode === 'register' && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '1rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'block',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginBottom: '0.4rem'
      }
    }, "SEU NOME"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: nome,
      onChange: e => setNome(e.target.value),
      placeholder: "Como devemos te chamar?",
      required: true,
      style: {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border 0.2s'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '1rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'block',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginBottom: '0.4rem'
      }
    }, "EMAIL"), /*#__PURE__*/React.createElement("input", {
      type: "email",
      value: email,
      onChange: e => setEmail(e.target.value),
      placeholder: "seu@email.com",
      required: true,
      style: {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '1.5rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'block',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginBottom: '0.4rem'
      }
    }, "SENHA"), /*#__PURE__*/React.createElement("input", {
      type: "password",
      value: password,
      onChange: e => setPassword(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      required: true,
      minLength: "6",
      style: {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      style: {
        width: '100%',
        padding: '0.875rem',
        background: '#f97316',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
        transition: 'transform 0.1s, box-shadow 0.2s'
      }
    }, authMode === 'login' ? '→ Entrar na conta' : '→ Criar minha conta grátis')), authMode === 'login' && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        marginTop: '1rem'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => { setReenviarEmail(''); setReenviarSenha(''); setReenviarModal(true); },
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.8rem',
        textDecoration: 'underline'
      }
    }, "N\xE3o recebeu o email de verifica\xE7\xE3o?")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem'
      }
    }, ['🔒 SSL Seguro', '☁️ Nuvem', '🇧🇷 Brasil'].map((item, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.75rem'
      }
    }, item))))
  , reenviarModal && /*#__PURE__*/React.createElement("div", {style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}},
      /*#__PURE__*/React.createElement("div", {style:{background:C.bg,borderRadius:'16px',padding:'1.75rem',width:'100%',maxWidth:'400px',boxShadow:'0 24px 64px rgba(0,0,0,0.4)'}},
        /*#__PURE__*/React.createElement("h3", {style:{margin:'0 0 1rem',fontSize:'1.1rem',fontWeight:'700',color:'#1e1b4b'}}, "📧 Reenviar Email de Verificação"),
        /*#__PURE__*/React.createElement("div", {style:{marginBottom:'0.75rem'}},
          /*#__PURE__*/React.createElement("label", {style:{display:'block',fontSize:'0.85rem',color:'#4b5563',marginBottom:'0.3rem'}}, "Email"),
          /*#__PURE__*/React.createElement("input", {type:'email',value:reenviarEmail,onChange:e=>setReenviarEmail(e.target.value),placeholder:'seu@email.com',style:{width:'100%',padding:'0.6rem 0.75rem',border:'1.5px solid #d1d5db',borderRadius:'8px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box'}})
        ),
        /*#__PURE__*/React.createElement("div", {style:{marginBottom:'1rem'}},
          /*#__PURE__*/React.createElement("label", {style:{display:'block',fontSize:'0.85rem',color:'#4b5563',marginBottom:'0.3rem'}}, "Senha"),
          /*#__PURE__*/React.createElement("input", {type:'password',value:reenviarSenha,onChange:e=>setReenviarSenha(e.target.value),placeholder:'Sua senha',style:{width:'100%',padding:'0.6rem 0.75rem',border:'1.5px solid #d1d5db',borderRadius:'8px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box'}})
        ),
        /*#__PURE__*/React.createElement("div", {style:{display:'flex',gap:'0.75rem',justifyContent:'flex-end'}},
          /*#__PURE__*/React.createElement("button", {onClick:()=>setReenviarModal(false),style:{padding:'0.5rem 1.1rem',border:'1.5px solid #d1d5db',borderRadius:'8px',background:C.bg,cursor:'pointer',fontSize:'0.9rem',color:C.textMuted}}, "Cancelar"),
          /*#__PURE__*/React.createElement("button", {onClick:async()=>{
            if(!reenviarEmail||!reenviarSenha)return;
            try{
              const uc=await firebase.auth().signInWithEmailAndPassword(reenviarEmail,reenviarSenha);
              if(!uc.user.emailVerified){await uc.user.sendEmailVerification();await firebase.auth().signOut();setError('✅ Email de verificação reenviado! Verifique sua caixa de entrada.');}
              else{await firebase.auth().signOut();setError('✅ Email já verificado! Tente fazer login normalmente.');}
            }catch(err){setError('❌ Email ou senha incorretos');}
            setReenviarModal(false);
          },style:{padding:'0.5rem 1.25rem',border:'none',borderRadius:'8px',background:'#f97316',color:'#fff',cursor:'pointer',fontSize:'0.9rem',fontWeight:'700'}}, "Enviar")
        )
      )
    )
  );
  }
  return /*#__PURE__*/React.createElement(App, {
    user: user
  });
}

// Componente de Formulário de Edição Universal
function FormEdicao({
  item,
  tipo,
  onSalvar
}) {
  const [formData, setFormData] = useState({
    ...item
  });

  // Debug: ver dados iniciais
  const handleChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();

    // Garantir que ano seja número
    const dadosParaSalvar = {
      ...formData,
      ano: parseInt(formData.ano) || new Date().getFullYear(),
      valor: safeFloat(formData.valor)
    };
    onSalvar(dadosParaSalvar);
  };
  return /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, tipo === 'cartao' ? 'Nome do Cartão' : 'Descrição'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: formData[tipo === 'cartao' ? 'nome' : 'descricao'] || '',
    onChange: e => handleChange(tipo === 'cartao' ? 'nome' : 'descricao', e.target.value),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: formData.valor || '',
    onChange: e => handleChange('valor', parseFloat(e.target.value)),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Ano"), /*#__PURE__*/React.createElement("select", {
    value: formData.ano || new Date().getFullYear(),
    onChange: e => handleChange('ano', parseInt(e.target.value)),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => /*#__PURE__*/React.createElement("option", {
    key: ano,
    value: ano
  }, ano)))), (tipo === 'cartao' || tipo === 'fixo') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Dia do Vencimento"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "31",
    value: formData.vencimento || '',
    onChange: e => handleChange('vencimento', parseInt(e.target.value)),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), tipo === 'cartao' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Dia de Fechamento"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "31",
    value: formData.diaFechamento || '',
    onChange: e => handleChange('diaFechamento', parseInt(e.target.value)),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    placeholder: `Padrão: ${(formData.vencimento || 15) - 7}`
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "Deixe vazio para 7 dias antes do vencimento")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Limite do Cart\xE3o (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    min: "0",
    value: formData.limite || '',
    onChange: e => handleChange('limite', parseFloat(e.target.value) || 0),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    placeholder: "Ex: 10000.00"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "Deixe 0 para n\xE3o controlar limite"))), tipo === 'receita' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Categoria"), /*#__PURE__*/React.createElement("select", {
    value: formData.categoria || 'Salário',
    onChange: e => handleChange('categoria', e.target.value),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, /*#__PURE__*/React.createElement("option", null, "Sal\xE1rio"), /*#__PURE__*/React.createElement("option", null, "Freelance"), /*#__PURE__*/React.createElement("option", null, "Investimentos"), /*#__PURE__*/React.createElement("option", null, "Outros"))), (tipo === 'variavel' || tipo === 'receita' || tipo === 'extra') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "M\xEAs"), /*#__PURE__*/React.createElement("select", {
    value: formData.mes || 'Janeiro',
    onChange: e => handleChange('mes', e.target.value),
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(mes => /*#__PURE__*/React.createElement("option", {
    key: mes,
    value: mes
  }, mes)))), (tipo === 'variavel' || tipo === 'extra') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Data do Gasto"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: formData.dataCompleta || '',
    onChange: e => {
      const dataInput = e.target.value;
      const dataObj = new Date(dataInput + 'T00:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      handleChange('dataCompleta', dataInput);
      handleChange('data', dataFormatada);
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  }), formData.data && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "Exibido como: ", formData.data)), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
  }, "\uD83D\uDCBE Salvar Altera\xE7\xF5es"));
}

// Componente Menu de Navegação (escopo global)
// MenuNavegacao carregado de js/menu.js como window.MenuNavegacao
const MenuNavegacao = window.MenuNavegacao;

// Componente UserMenu (escopo global)
const UserMenu = ({
  user,
  onLogout
}) => {
  const [aberto, setAberto] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!aberto) return;
    const fechar = () => setAberto(false);
    const timer = setTimeout(() => {
      document.addEventListener('click', fechar, {
        once: true
      });
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', fechar);
    };
  }, [aberto]);
  const nome = user.displayName || user.email?.split('@')[0] || 'Usuário';
  const inicial = nome.charAt(0).toUpperCase();
  const email = user.email || '';
  const _mob = window.innerWidth <= 768;
  // No mobile, mostra só o primeiro nome
  const nomeExibido = _mob ? nome.split(' ')[0] : nome;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setAberto(p => !p);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: _mob ? '6px' : '8px',
      padding: _mob ? '4px 8px' : '6px 12px',
      borderRadius: '8px',
      background: aberto ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.15)',
      cursor: 'pointer',
      color: '#fff',
      minHeight: 'unset'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: _mob ? '26px' : '30px',
      height: _mob ? '26px' : '30px',
      borderRadius: '50%',
      background: '#f97316',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: _mob ? '0.8rem' : '0.9rem',
      color: '#fff',
      flexShrink: 0
    }
  }, inicial), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: _mob ? '0.78rem' : '0.85rem',
      fontWeight: '600',
      maxWidth: _mob ? '80px' : '120px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, nomeExibido), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.7rem',
      opacity: 0.7
    }
  }, "\u25BE")), aberto && /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      zIndex: 9999,
      background: '#1e1b4b',
      borderRadius: '12px',
      minWidth: '220px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
      border: '1px solid rgba(249,115,22,0.4)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: '700',
      color: '#fff',
      fontSize: '0.9rem'
    }
  }, nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.5)',
      marginTop: '2px'
    }
  }, email)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    style: {
      width: '100%',
      padding: '10px 12px',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '8px',
      background: 'rgba(239,68,68,0.15)',
      color: '#f87171',
      fontSize: '0.85rem',
      fontWeight: '600',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, "\uD83D\uDEAA Sair da conta"))));
};
function App({
  user
}) {
  const [salvando, setSalvando] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [coupleId, setCoupleId] = useState(() => localStorage.getItem('coupleId') || null);
  const [coupleInfo, setCoupleInfo] = useState(null);
  const C = {
    bg:          darkMode ? '#1e293b' : '#ffffff',
    bgPage:      darkMode ? '#0f172a' : '#f3f4f8',
    bgMuted:     darkMode ? '#1e293b' : '#f9fafb',
    bgTable:     darkMode ? '#0f172a' : '#f3f4f6',
    text:        darkMode ? '#f1f5f9' : '#111827',
    textMuted:   darkMode ? '#94a3b8' : '#6b7280',
    textFaint:   darkMode ? '#64748b' : '#9ca3af',
    border:      darkMode ? '#334155' : '#e5e7eb',
    borderLight: darkMode ? '#0f172a' : '#f3f4f6',
    input:       darkMode ? '#0f172a' : '#f9fafb',
  };
  const [ultimoSave, setUltimoSave] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [planoInfo, setPlanoInfo] = useState({
    plano: 'trial',
    diasRestantes: 60,
    expirado: false
  });
  const [anoAtual, setAnoAtual] = useState(() => {
    const saved = localStorage.getItem('anoAtual');
    return saved ? parseInt(saved) : new Date().getFullYear();
  });
  const [mesAtual, setMesAtual] = useState(() => {
    const saved = localStorage.getItem('mesAtual');
    if (saved) return saved;
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return meses[new Date().getMonth()];
  });
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  // Ordenação nas tabelas
  const [sortGF,  setSortGF]  = useState('venc-asc');
  const [sortGV,  setSortGV]  = useState('data-desc');
  const [sortGE,  setSortGE]  = useState('data-desc');
  const [sortRec, setSortRec] = useState('data-desc');
  // Busca global
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [buscaOpen,   setBuscaOpen]   = useState(false);
  // (WhatsApp wa.me — sem estado global necessário)
  // Cartão selecionado — App level para sobreviver troca de mês
  const [cartaoSelId, setCartaoSelId] = useState(() => null);
  // Heatmap — mês analisado independente do mês global
  const [heatmapMes, setHeatmapMes] = useState(() => mesAtual);
  const [heatmapAno, setHeatmapAno] = useState(() => anoAtual);
  const [modalAberto, setModalAberto] = useState(null);
  const [itemEditando, setItemEditando] = useState(null);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [inputDialog, setInputDialog] = useState(null);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(() => {
    const userId = localStorage.getItem('_currentUserId');
    return userId ? !localStorage.getItem('onboardingVisto_' + userId) : false;
  });
  const [stepOnboarding, setStepOnboarding] = useState(0);
  const _alertasExibidos = React.useRef(false);

  // Fecha modal e limpa edição ao trocar de tela
  useEffect(function() {
    setModalAberto(null);
    setItemEditando(null);
    setTipoEditando(null);
    setInputDialog(null);
  }, [telaAtiva]);
  const dispensarOnboarding = () => {
    const userId = localStorage.getItem('_currentUserId');
    if (userId) localStorage.setItem('onboardingVisto_' + userId, '1');
    setMostrarOnboarding(false);
    setStepOnboarding(0);
  };
  const [gastosFixos, setGastosFixos] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return DADOS_INICIAIS.gastosFixos;
    return lsGet('gastosFixos', DADOS_INICIAIS.gastosFixos);
  });
  const [cartoes, setCartoes] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return DADOS_INICIAIS.cartoes;
    return lsGet('cartoes', DADOS_INICIAIS.cartoes);
  });
  const [gastosVariaveis, setGastosVariaveis] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const gastos = lsGet('gastosVariaveis', []);

    // Migração: adicionar dataCompleta para gastos que não têm
    let precisaSalvar = false;
    const gastosMigrados = gastos.map(gasto => {
      if (!gasto.dataCompleta) {
        precisaSalvar = true;

        // Tentar diferentes fontes para a data
        let dataGasto;

        // 1. Se já tem data em formato BR, converter
        if (gasto.data && gasto.data.includes('/')) {
          const [dia, mes, ano] = gasto.data.split('/');
          dataGasto = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        }
        // 2. Se ID é timestamp válido
        else if (gasto.id && !isNaN(gasto.id) && gasto.id > 1000000000000) {
          dataGasto = new Date(gasto.id);
        }
        // 3. Fallback: usar mês e ano atuais com dia 1
        else {
          const anoGasto = gasto.ano || new Date().getFullYear();
          const mesGasto = gasto.mes || 'jan';
          const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          const mesNum = meses.indexOf(mesGasto.toLowerCase());
          dataGasto = new Date(anoGasto, mesNum >= 0 ? mesNum : 0, 1);
        }
        const dataCompletaGerada = dataGasto.toISOString().split('T')[0];
        const dataFormatada = dataGasto.toLocaleDateString('pt-BR');
        return {
          ...gasto,
          dataCompleta: dataCompletaGerada,
          data: dataFormatada
        };
      }
      return gasto;
    });

    // Salvar automaticamente se teve migração
    if (precisaSalvar) {
      setTimeout(() => {
        lsSet('gastosVariaveis', gastosMigrados);
      }, 100);
    }
    return gastosMigrados;
  });
  const [gastosExtras, setGastosExtras] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const gastos = lsGet('gastosExtras', []);

    // Migração: adicionar dataCompleta para gastos que não têm
    let precisaSalvar = false;
    const gastosMigrados = gastos.map(gasto => {
      if (!gasto.dataCompleta) {
        precisaSalvar = true;

        // Tentar diferentes fontes para a data
        let dataGasto;

        // 1. Se já tem data em formato BR, converter
        if (gasto.data && gasto.data.includes('/')) {
          const [dia, mes, ano] = gasto.data.split('/');
          dataGasto = new Date(ano, mes - 1, dia);
        }
        // 2. Se ID é timestamp válido
        else if (gasto.id && !isNaN(gasto.id) && gasto.id > 1000000000000) {
          dataGasto = new Date(gasto.id);
        }
        // 3. Fallback: usar mês e ano atuais com dia 1
        else {
          const anoGasto = gasto.ano || new Date().getFullYear();
          const mesGasto = gasto.mes || 'jan';
          const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          const mesNum = meses.indexOf(mesGasto.toLowerCase());
          dataGasto = new Date(anoGasto, mesNum, 1);
        }
        return {
          ...gasto,
          dataCompleta: dataGasto.toISOString().split('T')[0],
          // YYYY-MM-DD
          data: dataGasto.toLocaleDateString('pt-BR')
        };
      }
      return gasto;
    });

    // Salvar automaticamente se teve migração
    if (precisaSalvar) {
      setTimeout(() => {
        lsSet('gastosExtras', gastosMigrados);
      }, 100);
    }
    return gastosMigrados;
  });
  const [receitas, setReceitas] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    return lsGet('receitas', []);
  });
  const [cartaoParaNovaCompra, setCartaoParaNovaCompra] = useState(null);
  const [cartaoImport, setCartaoImport] = useState(null);
  const [farol, setFarol] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return {};
    return lsGet('farol', {});
  });
  const [metas, setMetas] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return {};
    return lsGet('metas', { mensal:0, jan:0, fev:0, mar:0, abr:0, mai:0, jun:0, jul:0, ago:0, set:0, out:0, nov:0, dez:0 });
  });

  // 🎯 METAS FINANCEIRAS (Curto/Médio/Longo Prazo)
  const [metasFinanceiras, setMetasFinanceiras] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    return lsGet('metasFinanceiras', []);
  });

  // 💰 RESERVA DE EMERGÊNCIA ATUAL
  const [reservaEmergencia, setReservaEmergencia] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return 0;
    const saved = localStorage.getItem('reservaEmergencia');
    return saved ? (parseFloat(saved) || 0) : 0;
  });

  // 💳 DÍVIDAS
  const [dividas, setDividas] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    return lsGet('dividas', []);
  });
  const [orcamento, setOrcamento] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return {};
    return lsGet('orcamento', { cartoes: 0, fixos: 0, variaveis: 0 });
  });

  // Categorias personalizadas
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState(() => {
    return lsGet('categoriasPersonalizadas', { gastosFixos: [], gastosVariaveis: [], gastosExtras: [] });
  });
  const _omz = { cartoes: 0, fixos: 0, variaveis: 0 };
  const [orcamentosMensais, setOrcamentosMensais] = useState(() => {
    return lsGet('orcamentosMensais', {
      jan: _omz, fev: _omz, mar: _omz, abr: _omz, mai: _omz, jun: _omz,
      jul: _omz, ago: _omz, set: _omz, out: _omz, nov: _omz, dez: _omz
    });
  });
  const [orcamentoAnual, setOrcamentoAnual] = useState(() => {
    return lsGet('orcamentoAnual', { jan:0, fev:0, mar:0, abr:0, mai:0, jun:0, jul:0, ago:0, set:0, out:0, nov:0, dez:0 });
  });
  const [planejadosMes, setPlanejadosMes] = useState(() => {
    return lsGet('planejadosMes', []);
  });
  const [comprasParceladas, setComprasParceladas] = useState(() => {
    return lsGet('comprasParceladas', []);
  });
  useEffect(() => {
    localStorage.setItem('anoAtual', anoAtual.toString());
  }, [anoAtual]);
  useEffect(() => {
    lsSet('darkMode', darkMode.toString());
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.style.background = '';
      document.body.style.colorScheme = '';
    } else {
      document.body.classList.remove('dark');
      document.body.style.background = '';
      document.body.style.colorScheme = '';
    }
  }, [darkMode]);
  useEffect(() => {
    lsSet('gastosFixos', gastosFixos);
  }, [gastosFixos]);
  useEffect(() => {
    lsSet('categoriasPersonalizadas', categoriasPersonalizadas);
  }, [categoriasPersonalizadas]);
  useEffect(() => {
    lsSet('cartoes', cartoes);
  }, [cartoes]);
  useEffect(() => {
    lsSet('gastosVariaveis', gastosVariaveis);
  }, [gastosVariaveis]);
  useEffect(() => {
    lsSet('gastosExtras', gastosExtras);
  }, [gastosExtras]);
  useEffect(() => {
    lsSet('receitas', receitas);
  }, [receitas]);
  useEffect(() => {
    lsSet('farol', farol);
  }, [farol]);
  useEffect(() => {
    lsSet('metas', metas);
  }, [metas]);
  useEffect(() => {
    lsSet('metasFinanceiras', metasFinanceiras);
  }, [metasFinanceiras]);
  useEffect(() => {
    lsSet('reservaEmergencia', reservaEmergencia.toString());
  }, [reservaEmergencia]);
  useEffect(() => {
    lsSet('dividas', dividas);
  }, [dividas]);
  useEffect(() => {
    lsSet('orcamento', orcamento);
  }, [orcamento]);
  useEffect(() => {
    lsSet('orcamentosMensais', orcamentosMensais);
  }, [orcamentosMensais]);

  // 🔥 AUTO-SAVE NA NUVEM - Salva automaticamente após cada mudança
  useEffect(() => {
    const autoSave = async () => {
      if (!db || !user || salvando) return;
      setSalvando(true);
      try {
        const dadosBackup = {
          versao: '3.1',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes,
            gastosFixos,
            gastosVariaveis,
            gastosExtras,
            receitas,
            farol,
            metas,
            metasFinanceiras,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas,
            dividas,
            reservaEmergencia,
            categoriasPersonalizadas
          }
        };
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
        setUltimoSave(new Date());
      } catch (error) {
        if (navigator.onLine && window.showToast) {
          window.showToast('⚠️ Falha ao salvar na nuvem. Dados salvos localmente.', 'warning', 4000);
        }
      } finally {
        setSalvando(false);
      }
    };

    // Debounce de 2 segundos para evitar salvar demais
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [cartoes, gastosFixos, gastosVariaveis, gastosExtras, receitas, farol, metas, metasFinanceiras, orcamento, orcamentosMensais, orcamentoAnual, planejadosMes, comprasParceladas, dividas, reservaEmergencia, categoriasPersonalizadas]);

  // Carregar dados da nuvem ao iniciar
  useEffect(() => {
    const carregarDaNuvem = async () => {
      if (!db || !user) return;
      try {
        // Verificar se é o primeiro usuário e promover automaticamente
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();

          // Se não tem campo isAdmin definido, verificar se é o primeiro usuário
          if (userData.isAdmin === undefined || userData.isAdmin === null) {
            const allUsers = await db.collection('usuarios').get();

            // Se for o único usuário ou o mais antigo, promover a admin
            if (allUsers.size === 1) {
              await db.collection('usuarios').doc(user.uid).update({
                isAdmin: true
              });
              setIsUserAdmin(true);
            } else {
              setIsUserAdmin(false);
            }
          } else {
            // Já tem campo definido, usar o valor
            const adminStatus = userData.isAdmin === true;
            setIsUserAdmin(adminStatus);
          }

          // Se não tem status, é usuário antigo - aprovar automaticamente
          if (!userData.status) {
            await db.collection('usuarios').doc(user.uid).update({
              status: 'APROVADO',
              emailVerificado: true,
              plano: 'premium' // Usuários antigos viram premium
            });
          }

          // ✅ VERIFICAR PLANO E TRIAL
          const planoAtual = userData.plano || 'trial';
          if (planoAtual === 'trial' && userData.dataFimTrial) {
            const agora = new Date();
            const fimTrial = userData.dataFimTrial.toDate ? userData.dataFimTrial.toDate() : new Date(userData.dataFimTrial);
            const diasRestantes = Math.ceil((fimTrial - agora) / (1000 * 60 * 60 * 24));
            const expirado = diasRestantes <= 0;
            setPlanoInfo({
              plano: planoAtual,
              diasRestantes: Math.max(0, diasRestantes),
              expirado
            });
          } else if (planoAtual === 'premium') {
            setPlanoInfo({
              plano: 'premium',
              diasRestantes: 0,
              expirado: false
            });
          }
        } else {
          setIsUserAdmin(false);
        }
        const doc = await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
        if (doc.exists) {
          const dadosBackup = doc.data();
          setCartoes(dadosBackup.dados.cartoes || []);
          setGastosFixos(dadosBackup.dados.gastosFixos || []);
          setGastosVariaveis(dadosBackup.dados.gastosVariaveis || []);
          setReceitas(dadosBackup.dados.receitas || []);
          setFarol(dadosBackup.dados.farol || {});
          setMetas(dadosBackup.dados.metas || {
            mensal: 0
          });
          setOrcamento(dadosBackup.dados.orcamento || {
            cartoes: 0,
            fixos: 0,
            variaveis: 0
          });
          setOrcamentosMensais(dadosBackup.dados.orcamentosMensais || {});
          setOrcamentoAnual(dadosBackup.dados.orcamentoAnual || {});
          setPlanejadosMes(dadosBackup.dados.planejadosMes || []);
          setComprasParceladas(dadosBackup.dados.comprasParceladas || []);
        }
      } catch (error) {
        if (!navigator.onLine && window.showToast) {
          window.showToast('📴 Modo offline — usando dados salvos localmente', 'info', 4000);
        }
      }
    };
    carregarDaNuvem();
  }, []);
  useEffect(() => {
    lsSet('orcamentoAnual', orcamentoAnual);
  }, [orcamentoAnual]);
  useEffect(() => {
    lsSet('planejadosMes', planejadosMes);
  }, [planejadosMes]);
  useEffect(() => {
    lsSet('comprasParceladas', comprasParceladas);
  }, [comprasParceladas]);

  // MIGRAÇÃO AUTOMÁTICA PARA ESTRUTURA MULTI-ANO
  useEffect(() => {
    const migrated = localStorage.getItem('dataMigradaMultiAno');
    if (migrated) return; // Já migrado


    // Migrar Cartões
    const cartoesAtualizados = cartoes.map(cartao => {
      // Se já tem estrutura de ano, mantém
      if (cartao.valores && typeof cartao.valores === 'object' && cartao.valores['2025']) {
        return cartao;
      }
      // Se tem estrutura antiga (valores diretos por mês), migra para 2025
      return {
        ...cartao,
        valores: {
          2025: {
            ...cartao.valores
          }
        }
      };
    });

    // Migrar Receitas
    const receitasAtualizadas = receitas.map(receita => {
      if (receita.ano) return receita; // Já tem ano
      return {
        ...receita,
        ano: 2025
      };
    });

    // Migrar Gastos Variáveis
    const variaveisAtualizados = gastosVariaveis.map(gasto => {
      if (gasto.ano) return gasto;
      return {
        ...gasto,
        ano: 2025
      };
    });

    // Migrar Farol (chave antiga: "nome-mes" -> nova: "nome-mes-ano")
    const farolAtualizado = {};
    Object.keys(farol).forEach(chave => {
      if (chave.includes('-2025') || chave.includes('-2024')) {
        farolAtualizado[chave] = farol[chave]; // Já tem ano
      } else {
        // Adiciona ano 2025 às chaves antigas
        farolAtualizado[`${chave}-2025`] = farol[chave];
      }
    });

    // Aplicar migrações
    setCartoes(cartoesAtualizados);
    setReceitas(receitasAtualizadas);
    setGastosVariaveis(variaveisAtualizados);
    setFarol(farolAtualizado);

    // Marcar como migrado
    localStorage.setItem('dataMigradaMultiAno', 'true');
  }, []);
  const calcularTotais = mes => {
    // Valor base dos cartões - AGORA USA ANO
    const totalCartoesBase = cartoes.reduce((sum, c) => {
      const valoresAno = c.valores?.[anoAtual] || {};
      return sum + (valoresAno[mes] || 0);
    }, 0);

    // Adicionar parcelas do mês (filtrando por ano correto)
    const parcelasDoMes = comprasParceladas.filter(compra => {
      if (!compra.meses || !compra.meses.includes(mes)) return false;
      const parcelaIndex = compra.meses.indexOf(mes);
      const indiceMesInicio = MESES.indexOf(compra.mesInicio);
      const anoBase = compra.anoInicio || compra.ano || anoAtual;
      const anoParc = anoBase + Math.floor((indiceMesInicio + parcelaIndex) / 12);
      return anoParc === anoAtual;
    }).reduce((sum, compra) => sum + (compra.valorParcela || 0), 0);
    const totalCartoes = totalCartoesBase + parcelasDoMes;

    // FIXOS: filtrar por mês/ano (gastos temporários) OU mostrar permanentes
    const totalFixos = gastosFixos.filter(g => {
      // Se tem mes e ano, filtrar por eles
      if (g.mes && g.ano) {
        return g.mes === mes && g.ano === anoAtual;
      }
      // Se não tem, é permanente (aparece sempre)
      return true;
    }).reduce((sum, g) => sum + g.valor, 0);

    // Variáveis agora filtram por ANO também
    const totalVariaveis = gastosVariaveis.filter(g => g.mes === mes && g.ano === anoAtual).reduce((sum, g) => sum + g.valor, 0);

    // Extras também filtram por ANO
    const totalExtras = gastosExtras.filter(g => g.mes === mes && g.ano === anoAtual).reduce((sum, g) => sum + g.valor, 0);
    return {
      cartoes: totalCartoes,
      cartoesBase: totalCartoesBase,
      parcelas: parcelasDoMes,
      fixos: totalFixos,
      variaveis: totalVariaveis,
      extras: totalExtras,
      total: totalCartoes + totalFixos + totalVariaveis + totalExtras
    };
  };
  const totais = calcularTotais(mesAtual);
  const metaMensal = metas[mesAtual] || metas.mensal;
  const orcamentoMensal = orcamentosMensais[mesAtual] || orcamento;

  // ── Alertas Proativos ────────────────────────────────────────────────────
  useEffect(function() {
    if (!window.showToast) return;
    if (gastosFixos.length === 0 && receitas.length === 0) return; // dados ainda não carregaram
    // Exibe alertas 1x por mês/ano por sessão de browser (sessionStorage reseta ao fechar aba)
    const _chave = 'alertas_' + mesAtual + '_' + anoAtual;
    if (sessionStorage.getItem(_chave)) return;
    sessionStorage.setItem(_chave, '1');
    // 1) Orçamento estourado
    const limiteTotal = (orcamentoMensal.cartoes || 0) + (orcamentoMensal.fixos || 0) + (orcamentoMensal.variaveis || 0);
    if (limiteTotal > 0 && totais.total > limiteTotal) {
      const pct = Math.round(totais.total / limiteTotal * 100);
      setTimeout(function() {
        showToast('Orçamento de ' + mesAtual.toUpperCase() + ' estourado em ' + pct + '%!', 'warning', 7000);
      }, 800);
    }
    // 2) Alertas por tipo de orçamento: 80% (info) e 90% (warning)
    const alertasOrcamento = [
      { label: 'Gastos Variáveis', atual: totais.variaveis, limite: orcamentoMensal.variaveis || 0 },
      { label: 'Contas Fixas',     atual: totais.fixos,     limite: orcamentoMensal.fixos     || 0 },
    ];
    alertasOrcamento.forEach(function({ label, atual, limite }) {
      if (limite <= 0) return;
      const pct = Math.round(atual / limite * 100);
      if (pct >= 90 && pct < 100) {
        setTimeout(function() { showToast('🔴 ' + label + ': ' + pct + '% do orçamento usado!', 'warning', 6000); }, 1400);
      } else if (pct >= 80 && pct < 90) {
        setTimeout(function() { showToast('🟡 ' + label + ': ' + pct + '% do orçamento usado', 'info', 5000); }, 1400);
      }
    });
    // 3) Metas financeiras próximas do prazo (< 30 dias)
    const hoje = new Date();
    metasFinanceiras.filter(function(m) { return !m.concluida && m.dataMeta; }).forEach(function(m) {
      const diff = Math.ceil((new Date(m.dataMeta) - hoje) / 86400000);
      if (diff >= 0 && diff <= 30) {
        setTimeout(function() {
          showToast('Meta "' + m.nome + '" vence em ' + diff + ' dia(s)!', 'info', 6000);
        }, 1400);
      }
    });
    // 3) Gastos fixos com vencimento nos próximos 5 dias
    //    Filtra por mes/ano atual e deduplica por descricao (evita parcelas múltiplas)
    const diaHoje = hoje.getDate();
    const _jaAlertado = {};
    gastosFixos
      .filter(function(g) {
        return g.vencimento &&
          (!g.mes || g.mes === mesAtual) &&
          (!g.ano || g.ano === anoAtual);
      })
      .forEach(function(g) {
        const diff = g.vencimento - diaHoje;
        if (diff >= 0 && diff <= 5 && !_jaAlertado[g.descricao]) {
          _jaAlertado[g.descricao] = true;
          setTimeout(function() {
            showToast(g.descricao + ' vence em ' + diff + ' dia(s) (dia ' + g.vencimento + ')', 'warning', 5000);
          }, 2000);
        }
      });
  }, [mesAtual, anoAtual, gastosFixos, receitas]);
  // ────────────────────────────────────────────────────────────────────────

  // ── Notificações Push (executa 1x no mount) ──────────────────────────────
  useEffect(function() {
    // 1) Pedir permissão para notificações do browser
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // 2) Contas com vencimento hoje
    var diaHoje = new Date().getDate();
    var contasHoje = gastosFixos.filter(function(g) { return g.vencimento === diaHoje; });
    if (contasHoje.length === 0) return;
    // 3) Notificação nativa via Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function(reg) {
        if (Notification.permission === 'granted') {
          var linhas = contasHoje.slice(0,5).map(function(g) {
            return g.descricao + ' — R$ ' + (g.valor||0).toFixed(2);
          }).join('\n');
          reg.showNotification('💸 Contas vencem hoje!', {
            body: linhas,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'contas-hoje',
            renotify: true
          });
        }
      }).catch(function(){});
    }
  }, []); // executa apenas 1x no mount
  // ────────────────────────────────────────────────────────────────────────

  // ── Recorrência Automática ───────────────────────────────────────────────
  useEffect(function() {
    // Clonar receitas recorrentes para o mesAtual/anoAtual se ainda não existirem
    var recorrentes = receitas.filter(function(r) { return r.recorrente; });
    if (recorrentes.length === 0) return;
    var jaExiste = {};
    receitas.forEach(function(r) {
      if (r.mes === mesAtual && r.ano === anoAtual) {
        jaExiste[r.categoria + '|' + r.descricao] = true;
      }
    });
    var novas = [];
    recorrentes.forEach(function(r) {
      var chave = r.categoria + '|' + r.descricao;
      if (!jaExiste[chave]) {
        novas.push({
          id: Date.now() + Math.random(),
          categoria: r.categoria,
          descricao: r.descricao,
          valor: r.valor,
          mes: mesAtual,
          ano: anoAtual,
          recorrente: true,
          data: new Date().toLocaleDateString('pt-BR')
        });
      }
    });
    if (novas.length > 0) {
      setReceitas(function(prev) { return [...prev, ...novas]; });
      if (window.showToast) showToast(novas.length + ' receita(s) recorrente(s) adicionada(s) automaticamente!', 'info');
    }
  }, [mesAtual, anoAtual]);

  // ── Recorrência Automática — Gastos Variáveis ────────────────────────────
  useEffect(function() {
    var recorrentes = gastosVariaveis.filter(function(g) { return g.recorrente; });
    if (recorrentes.length === 0) return;
    // Verificar quais já existem no mês atual
    var jaExiste = {};
    gastosVariaveis.forEach(function(g) {
      if (g.mes === mesAtual && g.ano === anoAtual) {
        jaExiste[g.categoria + '|' + (g.descricao || '')] = true;
      }
    });
    var novas = [];
    recorrentes.forEach(function(g) {
      var chave = g.categoria + '|' + (g.descricao || '');
      if (!jaExiste[chave]) {
        novas.push({
          id: Date.now() + Math.random(),
          categoria: g.categoria,
          descricao: g.descricao || '',
          valor: g.valor,
          mes: mesAtual,
          ano: anoAtual,
          recorrente: true,
          data: new Date().toLocaleDateString('pt-BR'),
          dataCompleta: new Date().toISOString().split('T')[0]
        });
      }
    });
    if (novas.length > 0) {
      setGastosVariaveis(function(prev) { return [...prev, ...novas]; });
      if (window.showToast) showToast(novas.length + ' gasto(s) variável(is) recorrente(s) adicionado(s)!', 'info');
    }
  }, [mesAtual, anoAtual]);
  // ────────────────────────────────────────────────────────────────────────

  // CÁLCULO DE RECEITAS E SALDO
  const calcularSaldo = mes => {
    // Receitas agora filtram por ANO também
    const totalReceitas = receitas.filter(r => r.mes === mes && r.ano === anoAtual).reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = calcularTotais(mes).total;
    const saldo = totalReceitas - totalDespesas;
    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: saldo,
      positivo: saldo >= 0
    };
  };
  const calcularPagamentos = mes => {
    const itensPagamento = [...cartoes.map(c => {
      const valoresAno = c.valores?.[anoAtual] || {};
      const valorTotal = valoresAno[mes] || 0;
      const statusFarol = farol[`${c.nome}-${mes}-${anoAtual}`];

      // Verifica se é PAGO, PARCIAL (número) ou PENDENTE
      let valorPago = 0;
      if (statusFarol === 'PAGO') {
        valorPago = valorTotal;
      } else if (typeof statusFarol === 'number') {
        valorPago = statusFarol;
      }
      return {
        tipo: 'CARTÃO',
        nome: c.nome,
        valor: valorTotal,
        valorPago: valorPago,
        pago: statusFarol === 'PAGO'
      };
    }), ...gastosFixos.filter(g => {
      // Se tem mes e ano, filtrar por eles
      if (g.mes && g.ano) {
        return g.mes === mes && g.ano === anoAtual;
      }
      // Se não tem, é permanente (aparece sempre)
      return true;
    }).map(g => {
      const statusFarol = farol[`${g.descricao}-${mes}-${anoAtual}`];
      let valorPago = 0;
      if (statusFarol === 'PAGO') {
        valorPago = g.valor;
      } else if (typeof statusFarol === 'number') {
        valorPago = statusFarol;
      }
      return {
        tipo: 'FIXO',
        nome: g.descricao,
        valor: g.valor,
        valorPago: valorPago,
        pago: statusFarol === 'PAGO'
      };
    })].filter(item => item.valor > 0);
    const totalPagar = itensPagamento.reduce((sum, item) => sum + item.valor, 0);
    const totalPago = itensPagamento.reduce((sum, item) => sum + item.valorPago, 0);
    const totalPendente = totalPagar - totalPago;
    const percentualPago = totalPagar > 0 ? totalPago / totalPagar * 100 : 0;
    const quantidadePaga = itensPagamento.filter(item => item.pago).length;
    const quantidadeTotal = itensPagamento.length;
    return {
      total: totalPagar,
      pago: totalPago,
      pendente: totalPendente,
      percentual: percentualPago,
      qtdPago: quantidadePaga,
      qtdTotal: quantidadeTotal,
      items: itensPagamento
    };
  };
  const saldo = calcularSaldo(mesAtual);
  const pagamentos = calcularPagamentos(mesAtual);

  // COMPARAÇÃO ENTRE MESES
  const compararMeses = () => {
    const indiceMesAtual = MESES.indexOf(mesAtual);
    const mesAnterior = indiceMesAtual > 0 ? MESES[indiceMesAtual - 1] : null;
    if (!mesAnterior) {
      return {
        temAnterior: false
      };
    }
    const totaisAtual = calcularTotais(mesAtual);
    const totaisAnterior = calcularTotais(mesAnterior);
    const diferenca = totaisAtual.total - totaisAnterior.total;
    const variacao = totaisAnterior.total > 0 ? (diferenca / totaisAnterior.total * 100).toFixed(1) : 0;

    // Calcular melhor e pior mês do ano
    const todosMeses = MESES.map(mes => ({
      mes,
      total: calcularTotais(mes).total
    })).filter(m => m.total > 0);
    const melhorMes = todosMeses.length > 0 ? todosMeses.reduce((min, m) => m.total < min.total ? m : min) : null;
    const piorMes = todosMeses.length > 0 ? todosMeses.reduce((max, m) => m.total > max.total ? m : max) : null;
    return {
      temAnterior: true,
      mesAnterior,
      totaisAtual,
      totaisAnterior,
      diferenca,
      variacao,
      aumentou: diferenca > 0,
      melhorMes,
      piorMes
    };
  };
  const comparacao = compararMeses();

  // INSIGHTS AUTOMÁTICOS
  const gerarInsights = () => {
    const insights = [];

    // Insight 1: Comparação com mês anterior
    if (comparacao.temAnterior) {
      if (comparacao.aumentou && Math.abs(comparacao.variacao) > 10) {
        insights.push({
          tipo: 'alerta',
          icone: '⚠️',
          titulo: 'Gastos aumentaram significativamente',
          mensagem: `Seus gastos aumentaram ${comparacao.variacao}% comparado a ${comparacao.mesAnterior.toUpperCase()}. Isso representa +R$ ${Math.abs(comparacao.diferenca).toFixed(2)}.`,
          cor: 'red'
        });
      } else if (!comparacao.aumentou && Math.abs(comparacao.variacao) > 10) {
        insights.push({
          tipo: 'sucesso',
          icone: '✅',
          titulo: 'Parabéns! Você economizou',
          mensagem: `Seus gastos diminuíram ${Math.abs(comparacao.variacao)}% comparado a ${comparacao.mesAnterior.toUpperCase()}. Economia de R$ ${Math.abs(comparacao.diferenca).toFixed(2)}!`,
          cor: 'green'
        });
      }

      // Insight sobre categorias específicas
      const difCartoes = comparacao.totaisAtual.cartoes - comparacao.totaisAnterior.cartoes;
      const difVariaveis = comparacao.totaisAtual.variaveis - comparacao.totaisAnterior.variaveis;
      if (difCartoes > 500) {
        insights.push({
          tipo: 'info',
          icone: '💳',
          titulo: 'Gastos com cartões em alta',
          mensagem: `Seus gastos com cartões aumentaram R$ ${difCartoes.toFixed(2)} este mês. Revise suas faturas.`,
          cor: 'orange'
        });
      }
      if (difVariaveis > 500) {
        insights.push({
          tipo: 'info',
          icone: '📊',
          titulo: 'Gastos variáveis elevados',
          mensagem: `Seus gastos variáveis aumentaram R$ ${difVariaveis.toFixed(2)}. Considere revisar seus hábitos de consumo.`,
          cor: 'blue'
        });
      }
    }

    // Insight 2: Meta
    if (metas.mensal > 0) {
      const percentualMeta = totais.total / metas.mensal * 100;
      if (percentualMeta > 100) {
        insights.push({
          tipo: 'alerta',
          icone: '🔴',
          titulo: 'Meta ultrapassada!',
          mensagem: `Você ultrapassou sua meta em ${(percentualMeta - 100).toFixed(1)}%. Total gasto: R$ ${totais.total.toFixed(2)} de R$ ${metas.mensal.toFixed(2)}.`,
          cor: 'red'
        });
      } else if (percentualMeta > 80) {
        insights.push({
          tipo: 'aviso',
          icone: '⚡',
          titulo: 'Atenção: Meta próxima do limite',
          mensagem: `Você já usou ${percentualMeta.toFixed(1)}% da sua meta mensal. Restam apenas R$ ${(metas.mensal - totais.total).toFixed(2)}.`,
          cor: 'yellow'
        });
      } else if (percentualMeta < 70) {
        insights.push({
          tipo: 'sucesso',
          icone: '🎉',
          titulo: 'Dentro da meta!',
          mensagem: `Você está usando apenas ${percentualMeta.toFixed(1)}% da sua meta. Continue assim!`,
          cor: 'green'
        });
      }
    }

    // Insight 3: Análise de categorias
    if (gastosFixos.length > 0) {
      const categorias = gastosFixos.reduce((acc, g) => {
        acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
        return acc;
      }, {});
      const categoriaMaior = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0];
      const percentualCategoria = categoriaMaior[1] / totais.fixos * 100;
      if (percentualCategoria > 40) {
        insights.push({
          tipo: 'info',
          icone: '📌',
          titulo: `Categoria ${categoriaMaior[0]} representa ${percentualCategoria.toFixed(0)}%`,
          mensagem: `A categoria ${categoriaMaior[0]} representa ${percentualCategoria.toFixed(0)}% dos seus gastos fixos (R$ ${categoriaMaior[1].toFixed(2)}).`,
          cor: 'purple'
        });
      }
    }

    // Insight 4: Sugestões
    if (gastosVariaveis.filter(g => g.mes === mesAtual && g.ano === anoAtual).length === 0) {
      insights.push({
        tipo: 'dica',
        icone: '💡',
        titulo: 'Registre seus gastos variáveis',
        mensagem: 'Você ainda não registrou gastos variáveis este mês. Adicione mercado, alimentação e outros gastos para ter controle total.',
        cor: 'blue'
      });
    }

    // Limitar a 5 insights mais relevantes
    return insights.slice(0, 5);
  };
  const insights = gerarInsights();

  // CRUD Functions
  const adicionarCartao = dados => {
    const novoCartao = {
      id: Date.now(),
      nome: dados.nome.toUpperCase(),
      vencimento: parseInt(dados.vencimento),
      diaFechamento: parseInt(dados.diaFechamento || dados.vencimento - 7),
      // 7 dias antes do vencimento por padrão
      limite: parseFloat(dados.limite || 0),
      valores: {
        jan: 0,
        fev: 0,
        mar: 0,
        abr: 0,
        mai: 0,
        jun: 0,
        jul: 0,
        ago: 0,
        set: 0,
        out: 0,
        nov: 0,
        dez: 0
      }
    };
    setCartoes([...cartoes, novoCartao]);
    setModalAberto(null);
    if(window.showToast) showToast('Cartão adicionado com sucesso!','success'); else alert('Cartão adicionado com sucesso!');
  };
  const adicionarGastoFixo = dados => {
    const novoGasto = {
      id: Date.now(),
      categoria: dados.categoria.toUpperCase(),
      descricao: dados.descricao.toUpperCase(),
      valor: safeFloat(dados.valor),
      vencimento: parseInt(dados.vencimento),
      temporario: dados.temporario || false,
      totalParcelas: dados.totalParcelas || null,
      parcelaAtual: dados.parcelaAtual || null,
      mes: dados.mes || null,
      ano: dados.ano || null
    };
    setGastosFixos([...gastosFixos, novoGasto]);

    // Só mostra alert se for gasto único (não parcelado)
    if (!dados.temporario || dados.totalParcelas <= 1) {
      setModalAberto(null);
      if(window.showToast) showToast('Gasto fixo adicionado!','success'); else alert('Gasto fixo adicionado com sucesso!');
    }
  };
  const adicionarGastoVariavel = dados => {
    const novoGasto = {
      id: Date.now(),
      categoria: dados.categoria,
      descricao: dados.descricao || '',
      valor: safeFloat(dados.valor),
      mes: mesAtual,
      ano: anoAtual,
      data: dados.data || new Date().toLocaleDateString('pt-BR'),
      dataCompleta: dados.dataCompleta || new Date().toISOString().split('T')[0] // YYYY-MM-DD para ordenar
    };
    setGastosVariaveis([...gastosVariaveis, novoGasto]);
    setModalAberto(null);
    if(window.showToast) showToast('Gasto variável adicionado!','success'); else alert('Gasto variável adicionado com sucesso!');
  };
  const deletarCartao = id => {
    if (confirm('Tem certeza?')) {
      setCartoes(cartoes.filter(c => c.id !== id));
    }
  };
  const editarCartao = async (id, dadosAtualizados) => {
    const novosCartoes = [];
    cartoes.forEach(c => {
      if (c.id === id) {
        const cartaoAtualizado = {
          ...c,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || c.ano || anoAtual,
          valor: safeFloat(dadosAtualizados.valor) || c.valor,
          limite: parseFloat(dadosAtualizados.limite) || c.limite || 0,
          // IMPORTANTE!
          diaFechamento: parseInt(dadosAtualizados.diaFechamento) || c.diaFechamento
        };
        novosCartoes.push(cartaoAtualizado);
      } else {
        novosCartoes.push(c);
      }
    });
    setCartoes(novosCartoes);
    setModalAberto(null);
    if(window.showToast) showToast('Cartão atualizado!','success'); else alert('✅ Cartão atualizado com sucesso!');

    // Salvar no Firestore
    if (db && user) {
      try {
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
          versao: '3.0',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes: novosCartoes,
            gastosFixos,
            gastosVariaveis,
            receitas,
            farol,
            metas,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas
          }
        });
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }
    setItemEditando(null);
    setTipoEditando(null);
    setModalAberto(null);
    if(window.showToast) showToast('Cartão atualizado!','success'); else alert('✅ Cartão atualizado!');
  };
  const duplicarCartao = cartao => {
    const novoCartao = {
      ...cartao,
      id: Date.now(),
      nome: cartao.nome + ' (Cópia)'
    };
    setCartoes([...cartoes, novoCartao]);
    if(window.showToast) showToast('Cartão duplicado!','success'); else alert('✅ Cartão duplicado com sucesso!');
  };
  const deletarGastoFixo = id => {
    if (confirm('Tem certeza?')) {
      setGastosFixos(gastosFixos.filter(g => g.id !== id));
    }
  };
  const editarGastoFixo = async (id, dadosAtualizados) => {
    const novosGastos = [];
    gastosFixos.forEach(g => {
      if (g.id === id) {
        novosGastos.push({
          ...g,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || g.ano || anoAtual,
          valor: safeFloat(dadosAtualizados.valor) || g.valor
        });
      } else {
        novosGastos.push(g);
      }
    });
    setGastosFixos(novosGastos);

    // Salvar no Firestore
    if (db && user) {
      try {
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
          versao: '3.0',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes,
            gastosFixos: novosGastos,
            gastosVariaveis,
            receitas,
            farol,
            metas,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas
          }
        });
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }
    setItemEditando(null);
    setTipoEditando(null);
    setModalAberto(null);
    if(window.showToast) showToast('Gasto fixo atualizado!','success'); else alert('✅ Gasto fixo atualizado!');
  };
  const duplicarGastoFixo = gasto => {
    const novoGasto = {
      ...gasto,
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    };
    setGastosFixos([...gastosFixos, novoGasto]);
    if(window.showToast) showToast('Gasto fixo duplicado!','success'); else alert('✅ Gasto fixo duplicado com sucesso!');
  };
  const deletarGastoVariavel = id => {
    if (confirm('Tem certeza?')) {
      setGastosVariaveis(gastosVariaveis.filter(g => g.id !== id));
    }
  };
  const editarGastoVariavel = async (id, dadosAtualizados) => {
    const novosGastos = [];
    gastosVariaveis.forEach(g => {
      if (g.id === id) {
        novosGastos.push({
          ...g,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || g.ano || anoAtual,
          valor: safeFloat(dadosAtualizados.valor) || g.valor
        });
      } else {
        novosGastos.push(g);
      }
    });
    setGastosVariaveis(novosGastos);

    // Salvar no Firestore
    if (db && user) {
      try {
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
          versao: '3.0',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes,
            gastosFixos,
            gastosVariaveis: novosGastos,
            receitas,
            farol,
            metas,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas
          }
        });
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }
    setItemEditando(null);
    setTipoEditando(null);
    setModalAberto(null);
    if(window.showToast) showToast('Gasto variável atualizado!','success'); else alert('✅ Gasto variável atualizado!');
  };
  const duplicarGastoVariavel = gasto => {
    const novoGasto = {
      ...gasto,
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    };
    setGastosVariaveis([...gastosVariaveis, novoGasto]);
    if(window.showToast) showToast('Gasto variável duplicado!','success'); else alert('✅ Gasto variável duplicado!');
  };

  // Funções para Gastos Extras
  const deletarGastoExtra = id => {
    if (confirm('Tem certeza?')) {
      setGastosExtras(gastosExtras.filter(g => g.id !== id));
    }
  };
  const editarGastoExtra = async (id, dadosAtualizados) => {
    const novosGastos = [];
    gastosExtras.forEach(g => {
      if (g.id === id) {
        novosGastos.push({
          ...g,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || g.ano || anoAtual,
          valor: safeFloat(dadosAtualizados.valor) || g.valor
        });
      } else {
        novosGastos.push(g);
      }
    });
    setGastosExtras(novosGastos);

    // Salvar no Firestore
    if (db && user) {
      try {
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').update({
          'dados.gastosExtras': novosGastos
        });
      } catch (err) {
        console.error('Erro ao salvar:', err);
      }
    }
  };
  const duplicarGastoExtra = gasto => {
    const novoGasto = {
      ...gasto,
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    };
    setGastosExtras([...gastosExtras, novoGasto]);
    if(window.showToast) showToast('Gasto extra duplicado!','success'); else alert('✅ Gasto extra duplicado!');
  };

  // 💳 MIGRAÇÃO DE VALORES DE CARTÕES 2025 → 2026 (MOVE, NÃO COPIA)
  const migrarValoresCartoes = async (anoOrigem, anoDestino) => {
    if (!confirm(`💳 MOVER VALORES DE CARTÕES\n\nIsso vai MOVER todos os valores de ${anoOrigem} para ${anoDestino}.\n\n⚠️ ATENÇÃO:\n✅ Valores vão para ${anoDestino}\n❌ Valores de ${anoOrigem} serão APAGADOS\n\nExemplo:\nNubank ${anoOrigem}: R$ 1.500\n  ↓\nNubank ${anoDestino}: R$ 1.500\nNubank ${anoOrigem}: R$ 0 (zerado!)\n\nDeseja continuar?`)) {
      return;
    }
    try {
      let cartoesAtualizados = 0;
      let valoresMigrados = 0;
      const novosCartoes = cartoes.map(cartao => {
        // Verificar se tem valores no ano de origem
        const valoresOrigem = cartao.valores?.[anoOrigem];
        if (valoresOrigem && Object.keys(valoresOrigem).length > 0) {

          // Criar objeto de valores zerados para o ano de origem
          const valoresZerados = {};
          Object.keys(valoresOrigem).forEach(mes => {
            valoresZerados[mes] = 0;
          });

          // Criar novo cartão com valores movidos
          const novoCartao = {
            ...cartao,
            valores: {
              ...cartao.valores,
              [anoDestino]: {
                ...valoresOrigem
              },
              // Copia para destino
              [anoOrigem]: valoresZerados // Zera origem
            }
          };
          cartoesAtualizados++;
          valoresMigrados += Object.keys(valoresOrigem).length;
          return novoCartao;
        }
        return cartao;
      });
      if (cartoesAtualizados === 0) {
        alert(`⚠️ Nenhum cartão tinha valores em ${anoOrigem}!\n\nVerifique se os cartões estão cadastrados.`);
        return;
      }

      // Atualizar estado
      setCartoes(novosCartoes);

      // Salvar no Firestore
      if (db && user) {
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
          versao: '3.0',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes: novosCartoes,
            gastosFixos,
            gastosVariaveis,
            gastosExtras,
            receitas,
            farol,
            metas,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas
          }
        });
      }
      alert(`✅ Migração de cartões concluída!\n\n` + `💳 Cartões movidos: ${cartoesAtualizados}\n` + `📅 Valores mensais migrados: ${valoresMigrados}\n\n` + `✅ Valores copiados para ${anoDestino}\n` + `❌ Valores de ${anoOrigem} foram ZERADOS\n\n` + `Veja o console (F12) para detalhes.`);
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      alert('❌ Erro na migração: ' + error.message);
    }
  };

  // 🔍 DIAGNÓSTICO COMPLETO - LOCALSTORAGE + FIRESTORE
  const diagnosticarStorage = async () => {

    // 1. Ver o que tem no localStorage
    const localReceitas = JSON.parse(localStorage.getItem('receitas') || '[]');
    const localCartoes = JSON.parse(localStorage.getItem('cartoes') || '[]');
    const localFixos = JSON.parse(localStorage.getItem('gastosFixos') || '[]');
    const localVariaveis = JSON.parse(localStorage.getItem('gastosVariaveis') || '[]');

    // 2. Ver o que tem no Firestore
    let firestoreData = null;
    if (db && user) {
      try {
        const doc = await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
        if (doc.exists) {
          firestoreData = doc.data();
        }
      } catch (error) {
        console.error('Erro ao buscar Firestore:', error);
      }
    }

    // 3. Ver o que tem nos estados React

    // 4. Contar por fonte
    const contagem = {
      localStorage: {
        receitas: localReceitas.length,
        cartoes: localCartoes.length,
        fixos: localFixos.length,
        variaveis: localVariaveis.length
      },
      firestore: firestoreData ? {
        receitas: firestoreData.dados.receitas?.length || 0,
        cartoes: firestoreData.dados.cartoes?.length || 0,
        fixos: firestoreData.dados.gastosFixos?.length || 0,
        variaveis: firestoreData.dados.gastosVariaveis?.length || 0
      } : null,
      react: {
        receitas: receitas.length,
        cartoes: cartoes.length,
        fixos: gastosFixos.length,
        variaveis: gastosVariaveis.length
      }
    };
    alert(`🔍 DIAGNÓSTICO COMPLETO\n\n` + `💾 LOCALSTORAGE:\n` + `  Receitas: ${contagem.localStorage.receitas}\n` + `  Cartões: ${contagem.localStorage.cartoes}\n` + `  Fixos: ${contagem.localStorage.fixos}\n` + `  Variáveis: ${contagem.localStorage.variaveis}\n\n` + `☁️ FIRESTORE:\n` + `  Receitas: ${contagem.firestore?.receitas || 0}\n` + `  Cartões: ${contagem.firestore?.cartoes || 0}\n` + `  Fixos: ${contagem.firestore?.fixos || 0}\n` + `  Variáveis: ${contagem.firestore?.variaveis || 0}\n\n` + `⚛️ REACT (sendo usado agora):\n` + `  Receitas: ${contagem.react.receitas}\n` + `  Cartões: ${contagem.react.cartoes}\n` + `  Fixos: ${contagem.react.fixos}\n` + `  Variáveis: ${contagem.react.variaveis}\n\n` + `Veja o CONSOLE (F12) para detalhes completos!`);
  };

  // 🔍 DIAGNÓSTICO DE ANOS E MESES
  const diagnosticarAnos = () => {
    const diagnostico = {
      receitas: receitas.map(r => ({
        descricao: r.descricao || r.categoria,
        ano: r.ano,
        mes: r.mes,
        valor: r.valor
      })),
      cartoes: cartoes.map(c => ({
        nome: c.nome,
        ano: c.ano,
        valor: c.valor
      })),
      fixos: gastosFixos.map(g => ({
        descricao: g.descricao,
        ano: g.ano,
        valor: g.valor
      })),
      variaveis: gastosVariaveis.map(g => ({
        descricao: g.descricao,
        ano: g.ano,
        mes: g.mes,
        valor: g.valor
      }))
    };

    // Contar totais
    const totais = {
      receitas: receitas.length,
      cartoes: cartoes.length,
      fixos: gastosFixos.length,
      variaveis: gastosVariaveis.length
    };

    // Contar por ano
    const anos = {
      receitas: {},
      cartoes: {},
      fixos: {},
      variaveis: {}
    };
    receitas.forEach(r => {
      const ano = r.ano || 'undefined';
      anos.receitas[ano] = (anos.receitas[ano] || 0) + 1;
    });
    cartoes.forEach(c => {
      const ano = c.ano || 'undefined';
      anos.cartoes[ano] = (anos.cartoes[ano] || 0) + 1;
    });
    gastosFixos.forEach(g => {
      const ano = g.ano || 'undefined';
      anos.fixos[ano] = (anos.fixos[ano] || 0) + 1;
    });
    gastosVariaveis.forEach(g => {
      const ano = g.ano || 'undefined';
      anos.variaveis[ano] = (anos.variaveis[ano] || 0) + 1;
    });

    // Verificar mês atual
    const mesAtualDiag = {
      receitas: receitas.filter(r => r.mes === mesAtual && r.ano === anoAtual).length,
      variaveis: gastosVariaveis.filter(g => g.mes === mesAtual && g.ano === anoAtual).length
    };
    alert(`📊 DIAGNÓSTICO COMPLETO\n\n` + `📈 TOTAL DE LANÇAMENTOS:\n` + `  Receitas: ${totais.receitas}\n` + `  Cartões: ${totais.cartoes}\n` + `  Fixos: ${totais.fixos}\n` + `  Variáveis: ${totais.variaveis}\n\n` + `📅 EM ${mesAtual.toUpperCase()}/${anoAtual}:\n` + `  Receitas: ${mesAtualDiag.receitas}\n` + `  Variáveis: ${mesAtualDiag.variaveis}\n\n` + `📊 DISTRIBUIÇÃO POR ANO:\n` + `RECEITAS: ${Object.entries(anos.receitas).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` + `CARTÕES: ${Object.entries(anos.cartoes).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` + `FIXOS: ${Object.entries(anos.fixos).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` + `VARIÁVEIS: ${Object.entries(anos.variaveis).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n\n` + `Veja o console (F12) para LISTA COMPLETA!`);
  };

  // 🔧 CORRIGIR ANOS UNDEFINED → 2025
  const corrigirAnosUndefined = async () => {
    if (!confirm(`🔧 CORRIGIR ANOS\n\nIsso vai adicionar ano = 2025 em todos os lançamentos que não têm ano definido.\n\nDeseja continuar?`)) {
      return;
    }
    const novasReceitas = receitas.map(r => !r.ano ? {
      ...r,
      ano: 2025
    } : r);
    const novosCartoes = cartoes.map(c => !c.ano ? {
      ...c,
      ano: 2025
    } : c);
    const novosFixos = gastosFixos.map(g => !g.ano ? {
      ...g,
      ano: 2025
    } : g);
    const novosVariaveis = gastosVariaveis.map(g => !g.ano ? {
      ...g,
      ano: 2025
    } : g);
    const count = {
      receitas: novasReceitas.filter(r => !receitas.find(old => old.id === r.id && old.ano)).length,
      cartoes: novosCartoes.filter(c => !cartoes.find(old => old.id === c.id && old.ano)).length,
      fixos: novosFixos.filter(g => !gastosFixos.find(old => old.id === g.id && old.ano)).length,
      variaveis: novosVariaveis.filter(g => !gastosVariaveis.find(old => old.id === g.id && old.ano)).length
    };
    setReceitas(novasReceitas);
    setCartoes(novosCartoes);
    setGastosFixos(novosFixos);
    setGastosVariaveis(novosVariaveis);

    // Salvar no Firestore
    if (db && user) {
      await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
        versao: '3.0',
        dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
        email: user.email,
        nome: user.displayName,
        dados: {
          cartoes: novosCartoes,
          gastosFixos: novosFixos,
          gastosVariaveis: novosVariaveis,
          receitas: novasReceitas,
          farol,
          metas,
          orcamento,
          orcamentosMensais,
          orcamentoAnual,
          planejadosMes,
          comprasParceladas
        }
      });
    }
    alert(`✅ Anos corrigidos!\n\n` + `📊 Receitas: ${count.receitas}\n` + `💳 Cartões: ${count.cartoes}\n` + `🏠 Fixos: ${count.fixos}\n` + `🛒 Variáveis: ${count.variaveis}\n\n` + `Total: ${count.receitas + count.cartoes + count.fixos + count.variaveis} corrigidos!\n\n` + `Agora você pode migrar para 2026!`);
  };

  // 🔄 MIGRAÇÃO EM MASSA 2025 → 2026
  const migrarAno = async (de, para) => {
    if (!confirm(`⚠️ ATENÇÃO!\n\nVocê vai MIGRAR todos os lançamentos de ${de} para ${para}.\n\nIsso vai:\n✅ Mudar o ano de ${de} → ${para}\n✅ Manter o mesmo mês\n✅ Salvar no Firestore\n\nDeseja continuar?`)) {
      return;
    }
    try {
      // Migrar receitas
      const novasReceitas = receitas.map(r => r.ano === de ? {
        ...r,
        ano: para
      } : r);

      // Migrar cartões
      const novosCartoes = cartoes.map(c => c.ano === de ? {
        ...c,
        ano: para
      } : c);

      // Migrar fixos
      const novosFixos = gastosFixos.map(g => g.ano === de ? {
        ...g,
        ano: para
      } : g);

      // Migrar variáveis
      const novosVariaveis = gastosVariaveis.map(g => g.ano === de ? {
        ...g,
        ano: para
      } : g);

      // Contar quantos foram migrados
      const count = {
        receitas: novasReceitas.filter(r => r.ano === para).length - receitas.filter(r => r.ano === para).length,
        cartoes: novosCartoes.filter(c => c.ano === para).length - cartoes.filter(c => c.ano === para).length,
        fixos: novosFixos.filter(g => g.ano === para).length - gastosFixos.filter(g => g.ano === para).length,
        variaveis: novosVariaveis.filter(g => g.ano === para).length - gastosVariaveis.filter(g => g.ano === para).length
      };

      // Atualizar estados
      setReceitas(novasReceitas);
      setCartoes(novosCartoes);
      setGastosFixos(novosFixos);
      setGastosVariaveis(novosVariaveis);

      // Salvar no Firestore
      if (db && user) {
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
          versao: '3.0',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes: novosCartoes,
            gastosFixos: novosFixos,
            gastosVariaveis: novosVariaveis,
            receitas: novasReceitas,
            farol,
            metas,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas
          }
        });
      }
      alert(`✅ Migração concluída!\n\n` + `📊 Receitas: ${count.receitas}\n` + `💳 Cartões: ${count.cartoes}\n` + `🏠 Fixos: ${count.fixos}\n` + `🛒 Variáveis: ${count.variaveis}\n\n` + `Total: ${count.receitas + count.cartoes + count.fixos + count.variaveis} lançamentos migrados!`);
    } catch (error) {
      alert('❌ Erro na migração: ' + error.message);
      console.error(error);
    }
  };
  const adicionarReceita = dados => {
    const novaReceita = {
      id: Date.now(),
      categoria: dados.categoria,
      descricao: dados.descricao || '',
      valor: safeFloat(dados.valor),
      mes: mesAtual,
      ano: anoAtual,
      recorrente: dados.recorrente || false,
      // ADICIONADO
      data: new Date().toLocaleDateString('pt-BR')
    };
    setReceitas([...receitas, novaReceita]);
    setModalAberto(null);
    if(window.showToast) showToast('Receita adicionada!','success'); else alert('Receita adicionada com sucesso!');
  };
  const deletarReceita = id => {
    if (confirm('Tem certeza?')) {
      setReceitas(receitas.filter(r => r.id !== id));
    }
  };
  const editarReceita = async (id, dadosAtualizados) => {

    // Criar NOVA array para forçar re-render
    const novasReceitas = [];
    receitas.forEach(r => {
      if (r.id === id) {
        const receitaAtualizada = {
          ...r,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || r.ano || anoAtual,
          valor: safeFloat(dadosAtualizados.valor) || r.valor
        };
        novasReceitas.push(receitaAtualizada);
      } else {
        novasReceitas.push(r);
      }
    });

    // Forçar atualização
    setReceitas(novasReceitas);

    // 🔥 SALVAR IMEDIATAMENTE NO FIRESTORE
    if (db && user) {
      try {
        const dadosBackup = {
          versao: '3.0',
          dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
          email: user.email,
          nome: user.displayName,
          dados: {
            cartoes,
            gastosFixos,
            gastosVariaveis,
            receitas: novasReceitas,
            // <- USA A NOVA LISTA!
            farol,
            metas,
            orcamento,
            orcamentosMensais,
            orcamentoAnual,
            planejadosMes,
            comprasParceladas
          }
        };
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
      } catch (error) {
        console.error('❌ Erro ao salvar no Firestore:', error);
        if(window.showToast) showToast('Dados salvos localmente (erro na nuvem)','warning'); else alert('⚠️ Erro ao salvar na nuvem: ' + error.message);
      }
    }
    setItemEditando(null);
    setTipoEditando(null);
    setModalAberto(null);
    if(window.showToast) showToast('Receita atualizada!','success'); else alert('✅ Receita atualizada!');
  };
  const duplicarReceita = receita => {
    const novaReceita = {
      ...receita,
      id: Date.now(),
      descricao: receita.descricao + ' (Cópia)'
    };
    setReceitas([...receitas, novaReceita]);
    if(window.showToast) showToast('Receita duplicada!','success'); else alert('✅ Receita duplicada!');
  };
  const adicionarPlanejado = dados => {
    const novoPlanejado = {
      id: Date.now(),
      mes: mesAtual,
      descricao: dados.descricao,
      valor: safeFloat(dados.valor),
      categoria: dados.categoria,
      executado: false
    };
    setPlanejadosMes([...planejadosMes, novoPlanejado]);
    setModalAberto(null);
  };
  const togglePlanejado = id => {
    setPlanejadosMes(planejadosMes.map(p => p.id === id ? {
      ...p,
      executado: !p.executado
    } : p));
  };
  const deletarPlanejado = id => {
    if (confirm('Tem certeza?')) {
      setPlanejadosMes(planejadosMes.filter(p => p.id !== id));
    }
  };
  const editarValorCartao = (id, mes, valor) => {
    setCartoes(cartoes.map(c => {
      if (c.id === id) {
        // Garante que a estrutura do ano existe
        const valoresAtuais = c.valores || {};
        const valoresAno = valoresAtuais[anoAtual] || {};
        return {
          ...c,
          valores: {
            ...valoresAtuais,
            [anoAtual]: {
              ...valoresAno,
              [mes]: parseFloat(valor) || 0
            }
          }
        };
      }
      return c;
    }));
  };
  const editarValorGastoFixo = (id, valor) => {
    setGastosFixos(gastosFixos.map(g => {
      if (g.id === id) {
        return {
          ...g,
          valor: safeFloat(valor)
        };
      }
      return g;
    }));
  };
  const getStatusFarol = (item, mes) => {
    const valor = farol[`${item}-${mes}-${anoAtual}`];
    // Compatibilidade: retorna string 'PAGO'/'PENDENTE' ou número (valor pago)
    return valor || 'PENDENTE';
  };
  const toggleFarol = (item, mes) => {
    const chave = `${item}-${mes}-${anoAtual}`;
    setFarol(prev => ({
      ...prev,
      [chave]: prev[chave] === 'PAGO' ? 'PENDENTE' : 'PAGO'
    }));
  };

  // NOVAS FUNÇÕES para pagamento parcial
  const pagarParcial = (item, mes, valor) => {
    const chave = `${item}-${mes}-${anoAtual}`;
    const atual = farol[chave];
    // Se já tinha valor parcial, acumula; se era 'PAGO' ou indefinido, inicia do zero
    const jaFoiPago = typeof atual === 'number' ? atual : 0;
    setFarol(prev => ({
      ...prev,
      [chave]: jaFoiPago + parseFloat(valor)
    }));
  };
  const marcarPago = (item, mes) => {
    const chave = `${item}-${mes}-${anoAtual}`;
    setFarol(prev => ({
      ...prev,
      [chave]: 'PAGO'
    }));
  };
  const exportarPDF = () => {
    if (!window.jspdf) { if(window.showToast) showToast('Biblioteca PDF não carregada','error'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const mesNome = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
    const saldoMes = calcularSaldo(mesAtual);
    const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2});
    const W = 210; // largura A4
    let y = 0;

    // ── Cabeçalho ───────────────────────────────────────────────────────────
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, W, 38, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20); doc.setFont('helvetica','bold');
    doc.text('Relatório Financeiro', 14, 16);
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    doc.text(mesNome + ' / ' + anoAtual + '  |  Gerado em ' + new Date().toLocaleDateString('pt-BR'), 14, 26);
    const pctEconomia = saldoMes.receitas > 0 ? (saldoMes.saldo / saldoMes.receitas * 100).toFixed(1) : '0.0';
    doc.text('Taxa de Economia: ' + pctEconomia + '%', 14, 34);
    y = 50;

    // ── Cards de Resumo ──────────────────────────────────────────────────────
    doc.setTextColor(30,30,30);
    const cards = [
      {label:'RECEITAS', valor:saldoMes.receitas, cor:[16,185,129]},
      {label:'DESPESAS', valor:saldoMes.despesas, cor:[239,68,68]},
      {label:'SALDO',    valor:saldoMes.saldo,    cor: saldoMes.positivo ? [16,185,129] : [239,68,68]}
    ];
    cards.forEach(function(c, i) {
      const x = 14 + i * 62;
      doc.setFillColor(c.cor[0],c.cor[1],c.cor[2]);
      doc.roundedRect(x, y, 58, 28, 4, 4, 'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text(c.label, x+4, y+8);
      doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(fmt(c.valor), x+4, y+20);
    });
    y += 38;

    // ── Tabela de Categorias ─────────────────────────────────────────────────
    doc.setTextColor(30,30,30);
    doc.setFontSize(12); doc.setFont('helvetica','bold');
    doc.text('Composicao das Despesas', 14, y); y += 8;
    const cats = [
      ['Cartoes',          totais.cartoes],
      ['Contas Fixas',     totais.fixos],
      ['Gastos Variáveis', totais.variaveis],
      ['Gastos Extras',    totais.extras]
    ];
    cats.forEach(function(row) {
      const pct = totais.total > 0 ? (row[1]/totais.total*100).toFixed(1) : '0.0';
      doc.setFont('helvetica','normal'); doc.setFontSize(10);
      doc.setFillColor(248,250,252); doc.rect(14, y, 182, 9, 'F');
      doc.setTextColor(60,60,60);  doc.text(row[0], 18, y+6.5);
      doc.setTextColor(79,70,229); doc.text(fmt(row[1]), 120, y+6.5);
      doc.setTextColor(100,100,100); doc.text(pct + '%', 170, y+6.5);
      y += 10;
    });
    // Total
    doc.setFillColor(79,70,229); doc.rect(14, y, 182, 10, 'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.text('TOTAL DESPESAS', 18, y+7); doc.text(fmt(totais.total), 120, y+7);
    y += 18;

    // ── Gastos Variáveis do mês ──────────────────────────────────────────────
    const varMes = gastosVariaveis.filter(function(g){ return g.mes===mesAtual && g.ano===anoAtual; });
    if (varMes.length > 0) {
      doc.setTextColor(30,30,30); doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('Gastos Variáveis (' + varMes.length + ' lancamentos)', 14, y); y += 8;
      varMes.slice(0,25).forEach(function(g) {
        doc.setFont('helvetica','normal'); doc.setFontSize(9);
        doc.setFillColor(250,252,255); doc.rect(14, y, 182, 8, 'F');
        doc.setTextColor(60,60,60);
        doc.text((g.data||''), 18, y+5.5);
        doc.text((g.categoria||'').slice(0,20), 45, y+5.5);
        doc.text((g.descricao||'').slice(0,30), 85, y+5.5);
        doc.setTextColor(239,68,68); doc.text(fmt(g.valor), 158, y+5.5);
        y += 9;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      y += 6;
    }

    // ── Metas Financeiras ────────────────────────────────────────────────────
    const metasAtivas = metasFinanceiras.filter(function(m){ return !m.concluida; });
    if (metasAtivas.length > 0 && y < 240) {
      doc.setTextColor(30,30,30); doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('Metas Financeiras', 14, y); y += 8;
      metasAtivas.slice(0,5).forEach(function(m) {
        const pct = m.valor > 0 ? Math.min(100, m.valorAtual/m.valor*100).toFixed(0) : 0;
        doc.setFont('helvetica','normal'); doc.setFontSize(9);
        doc.setFillColor(240,253,244); doc.rect(14, y, 182, 10, 'F');
        doc.setTextColor(60,60,60);
        doc.text((m.nome||'').slice(0,35), 18, y+7);
        doc.text(fmt(m.valorAtual) + ' / ' + fmt(m.valor), 120, y+7);
        doc.setTextColor(16,185,129); doc.text(pct+'%', 174, y+7);
        y += 11;
      });
    }

    // ── Rodapé ───────────────────────────────────────────────────────────────
    doc.setFillColor(240,242,255); doc.rect(0, 282, W, 15, 'F');
    doc.setTextColor(120,120,150); doc.setFontSize(8); doc.setFont('helvetica','italic');
    doc.text('Controle Financeiro  |  ' + new Date().toLocaleString('pt-BR'), 14, 290);

    doc.save('relatorio-' + mesAtual + '-' + anoAtual + '.pdf');
    if(window.showToast) showToast('PDF gerado com sucesso!','success');
  };

  const exportarExcel = () => {
    if (!window.XLSX) { if(window.showToast) showToast('Biblioteca Excel não carregada','error'); return; }
    const wb = XLSX.utils.book_new();
    const saldoMes = calcularSaldo(mesAtual);
    const fmt = v => parseFloat(v||0).toFixed(2);

    // Sheet 1 — Resumo
    const resumo = [
      ['RELATÓRIO FINANCEIRO - ' + mesAtual.toUpperCase() + '/' + anoAtual],
      ['Gerado em', new Date().toLocaleString('pt-BR')],
      [],
      ['RESUMO', 'VALOR (R$)'],
      ['Receitas',       saldoMes.receitas],
      ['Despesas',       saldoMes.despesas],
      ['Saldo',          saldoMes.saldo],
      ['Taxa de Economia', saldoMes.receitas>0 ? ((saldoMes.saldo/saldoMes.receitas)*100).toFixed(1)+'%' : '0%'],
      [],
      ['CATEGORIA',      'VALOR (R$)', '% do Total'],
      ['Cartões',        totais.cartoes,  totais.total>0?(totais.cartoes/totais.total*100).toFixed(1)+'%':'0%'],
      ['Contas Fixas',   totais.fixos,    totais.total>0?(totais.fixos/totais.total*100).toFixed(1)+'%':'0%'],
      ['Gastos Variáveis',totais.variaveis,totais.total>0?(totais.variaveis/totais.total*100).toFixed(1)+'%':'0%'],
      ['Gastos Extras',  totais.extras,   totais.total>0?(totais.extras/totais.total*100).toFixed(1)+'%':'0%'],
      ['TOTAL',          totais.total,    '100%']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'Resumo');

    // Sheet 2 — Gastos Fixos
    const fixosData = [['Categoria','Descrição','Valor','Vencimento','Temporário']];
    gastosFixos.forEach(function(g){ fixosData.push([g.categoria,g.descricao,g.valor,g.vencimento,g.temporario?'Sim':'Não']); });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fixosData), 'Contas Fixas');

    // Sheet 3 — Gastos Variáveis do mês
    const varData = [['Data','Categoria','Descrição','Valor']];
    gastosVariaveis.filter(function(g){ return g.mes===mesAtual&&g.ano===anoAtual; })
      .forEach(function(g){ varData.push([g.data,g.categoria,g.descricao,g.valor]); });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(varData), 'Gastos Variáveis');

    // Sheet 4 — Cartões
    const cartoesData = [['Cartão','Vencimento','Limite','Valor ' + mesAtual.toUpperCase()]];
    cartoes.forEach(function(c){
      const v = (c.valores?.[anoAtual]||{})[mesAtual]||0;
      cartoesData.push([c.nome, c.vencimento, c.limite, v]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cartoesData), 'Cartões de Crédito');

    // Sheet 5 — Receitas do mês
    const receitasData = [['Data','Categoria','Descrição','Valor','Recorrente']];
    receitas.filter(function(r){ return r.mes===mesAtual&&r.ano===anoAtual; })
      .forEach(function(r){ receitasData.push([r.data,r.categoria,r.descricao,r.valor,r.recorrente?'Sim':'Não']); });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(receitasData), 'Receitas');

    // Sheet 6 — Anual (todos os 12 meses)
    const anualData = [['Mês','Receitas','Despesas','Saldo','Cartões de Crédito','Contas Fixas','Gastos Variáveis','Extras']];
    MESES.forEach(function(m){
      const s = calcularSaldo(m); const t = calcularTotais(m);
      anualData.push([m.toUpperCase(), s.receitas, s.despesas, s.saldo, t.cartoes, t.fixos, t.variaveis, t.extras]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(anualData), 'Anual ' + anoAtual);

    XLSX.writeFile(wb, 'relatorio-' + mesAtual + '-' + anoAtual + '.xlsx');
    if(window.showToast) showToast('Excel gerado com sucesso! (6 abas)','success');
  };
  const moverDadosEntreAnos = (anoOrigem, anoDestino) => {
    if (!confirm(`⚠️ Confirma MOVER todos os dados de ${anoOrigem} para ${anoDestino}?\n\nIsso vai:\n✅ Copiar cartões, receitas e gastos\n✅ Mover status de pagamentos\n⚠️ APAGAR dados de ${anoOrigem}`)) {
      return;
    }

    // Mover Cartões
    const cartoesAtualizados = cartoes.map(cartao => {
      const valoresOriginais = cartao.valores || {};
      const dadosOrigem = valoresOriginais[anoOrigem] || {};
      return {
        ...cartao,
        valores: {
          ...valoresOriginais,
          [anoDestino]: dadosOrigem,
          [anoOrigem]: {} // Limpa ano origem
        }
      };
    });

    // Mover Receitas
    const receitasAtualizadas = receitas.map(receita => {
      if (receita.ano === anoOrigem) {
        return {
          ...receita,
          ano: anoDestino
        };
      }
      return receita;
    });

    // Mover Gastos Variáveis
    const variaveisAtualizados = gastosVariaveis.map(gasto => {
      if (gasto.ano === anoOrigem) {
        return {
          ...gasto,
          ano: anoDestino
        };
      }
      return gasto;
    });

    // Mover Farol
    const farolAtualizado = {};
    Object.keys(farol).forEach(chave => {
      if (chave.endsWith(`-${anoOrigem}`)) {
        const novaChave = chave.replace(`-${anoOrigem}`, `-${anoDestino}`);
        farolAtualizado[novaChave] = farol[chave];
      } else {
        farolAtualizado[chave] = farol[chave];
      }
    });

    // Aplicar mudanças
    setCartoes(cartoesAtualizados);
    setReceitas(receitasAtualizadas);
    setGastosVariaveis(variaveisAtualizados);
    setFarol(farolAtualizado);
    alert(`✅ Dados movidos de ${anoOrigem} para ${anoDestino} com sucesso!`);
  };
  const fazerBackup = () => {
    try {
      const dadosBackup = {
        versao: '3.0',
        dataBackup: new Date().toISOString(),
        dados: {
          cartoes: cartoes,
          gastosFixos: gastosFixos,
          gastosVariaveis: gastosVariaveis,
          receitas: receitas,
          farol: farol,
          metas: metas,
          orcamento: orcamento,
          orcamentosMensais: orcamentosMensais,
          orcamentoAnual: orcamentoAnual,
          planejadosMes: planejadosMes,
          comprasParceladas: comprasParceladas
        }
      };
      const json = JSON.stringify(dadosBackup, null, 2);
      const blob = new Blob([json], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('✅ Backup realizado com sucesso!\n\nArquivo salvo: backup-financeiro-' + new Date().toISOString().split('T')[0] + '.json');
    } catch (error) {
      alert('❌ Erro ao fazer backup: ' + error.message);
    }
  };
  const restaurarBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const dadosBackup = JSON.parse(event.target.result);
          if (!dadosBackup.versao || !dadosBackup.dados) {
            throw new Error('Arquivo de backup inválido');
          }
          if (confirm('⚠️ ATENÇÃO!\n\nIsso vai substituir TODOS os dados atuais pelos dados do backup.\n\nTem certeza que deseja continuar?')) {
            setCartoes(dadosBackup.dados.cartoes || []);
            setGastosFixos(dadosBackup.dados.gastosFixos || []);
            setGastosVariaveis(dadosBackup.dados.gastosVariaveis || []);
            setReceitas(dadosBackup.dados.receitas || []);
            setFarol(dadosBackup.dados.farol || {});
            setMetas(dadosBackup.dados.metas || {
              mensal: 0
            });
            setOrcamento(dadosBackup.dados.orcamento || {
              cartoes: 0,
              fixos: 0,
              variaveis: 0
            });
            setOrcamentosMensais(dadosBackup.dados.orcamentosMensais || {});
            setOrcamentoAnual(dadosBackup.dados.orcamentoAnual || {});
            setPlanejadosMes(dadosBackup.dados.planejadosMes || []);
            setComprasParceladas(dadosBackup.dados.comprasParceladas || []);
            alert('✅ Backup restaurado com sucesso!\n\nData do backup: ' + new Date(dadosBackup.dataBackup).toLocaleString('pt-BR'));
          }
        } catch (error) {
          alert('❌ Erro ao restaurar backup: ' + error.message + '\n\nCertifique-se de que o arquivo é um backup válido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 🔥 FUNÇÕES DE BACKUP NA NUVEM (FIREBASE)
  const salvarNaNuvem = async () => {
    if (!db || !user) {
      alert('⚠️ Erro ao salvar!\n\nVerifique sua conexão.');
      return;
    }
    try {
      const dadosBackup = {
        versao: '3.0',
        dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
        email: user.email,
        nome: user.displayName,
        dados: {
          cartoes,
          gastosFixos,
          gastosVariaveis,
          receitas,
          farol,
          metas,
          orcamento,
          orcamentosMensais,
          orcamentoAnual,
          planejadosMes,
          comprasParceladas
        }
      };
      await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
      alert('✅ Dados salvos na nuvem com sucesso!\n\n' + 'Seus dados estão seguros e sincronizados.');
    } catch (error) {
      alert('❌ Erro ao salvar na nuvem: ' + error.message);
    }
  };
  const restaurarDaNuvem = async () => {
    if (!db || !user) {
      alert('⚠️ Erro ao restaurar!\n\nVerifique sua conexão.');
      return;
    }
    try {
      const doc = await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
      if (!doc.exists) {
        alert('❌ Nenhum backup encontrado.\n\nSalve seus dados na nuvem primeiro usando o botão ☁️ Nuvem');
        return;
      }
      const dadosBackup = doc.data();
      if (confirm('⚠️ ATENÇÃO!\n\nBackup encontrado!\nData: ' + (dadosBackup.dataBackup ? new Date(dadosBackup.dataBackup.toDate()).toLocaleString('pt-BR') : 'Desconhecida') + '\n\nIsso vai substituir TODOS os dados atuais.\n\nContinuar?')) {
        setCartoes(dadosBackup.dados.cartoes || []);
        setGastosFixos(dadosBackup.dados.gastosFixos || []);
        setGastosVariaveis(dadosBackup.dados.gastosVariaveis || []);
        setReceitas(dadosBackup.dados.receitas || []);
        setFarol(dadosBackup.dados.farol || {});
        setMetas(dadosBackup.dados.metas || {
          mensal: 0
        });
        setOrcamento(dadosBackup.dados.orcamento || {
          cartoes: 0,
          fixos: 0,
          variaveis: 0
        });
        setOrcamentosMensais(dadosBackup.dados.orcamentosMensais || {});
        setOrcamentoAnual(dadosBackup.dados.orcamentoAnual || {});
        setPlanejadosMes(dadosBackup.dados.planejadosMes || []);
        setComprasParceladas(dadosBackup.dados.comprasParceladas || []);
        alert('✅ Dados restaurados da nuvem com sucesso!');
      }
    } catch (error) {
      alert('❌ Erro ao restaurar da nuvem: ' + error.message);
    }
  };

  // FUNÇÕES DE COMPRAS PARCELADAS
  const adicionarCompraParcelada = dados => {
    const {
      descricao,
      cartao,
      valorTotal,
      parcelas,
      mesInicio
    } = dados;
    if (!parcelas || parcelas <= 0 || !valorTotal || !descricao || !cartao || !mesInicio) return;
    const valorParcela = valorTotal / parcelas;
    const indiceMesInicio = MESES.indexOf(mesInicio);
    if (indiceMesInicio === -1) return;
    const mesesCompra = [];
    for (let i = 0; i < parcelas; i++) {
      const indiceMes = (indiceMesInicio + i) % 12;
      mesesCompra.push(MESES[indiceMes]);
    }
    const novaCompra = {
      id: Date.now().toString(),
      descricao,
      cartao,
      valorTotal,
      totalParcelas: parcelas,
      // CAMPO IMPORTANTE!
      parcelas,
      // Mantém por compatibilidade
      valorParcela,
      parcelaPaga: 0,
      // COMEÇA EM ZERO!
      mesInicio,
      anoInicio: anoAtual,
      // ANO DE INÍCIO DA COMPRA
      meses: mesesCompra
    };
    setComprasParceladas([...comprasParceladas, novaCompra]);
  };
  const excluirCompraParcelada = id => {
    if (confirm('Tem certeza que deseja excluir esta compra parcelada? Ela será removida de todos os meses.')) {
      setComprasParceladas(comprasParceladas.filter(c => c.id !== id));
    }
  };
  const calcularParcelasCartao = (nomeCartao, mes) => {
    return comprasParceladas.filter(c => {
      if (c.cartao !== nomeCartao || !c.meses || !c.meses.includes(mes)) return false;
      const parcelaIndex = c.meses.indexOf(mes);
      const indiceMesInicio = MESES.indexOf(c.mesInicio);
      const anoBase = c.anoInicio || c.ano || anoAtual;
      const anoParc = anoBase + Math.floor((indiceMesInicio + parcelaIndex) / 12);
      return anoParc === anoAtual;
    }).map(c => ({
      ...c,
      parcelaAtual: c.meses.indexOf(mes) + 1
    }));
  };

  // Modal Component
  const Modal = ({
    titulo,
    children,
    onClose
  }) => /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800"
  }, titulo), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-gray-500 hover:text-gray-700 text-xl font-bold"
  }, "\xD7")), children));

  // Forms
  const FormNovoCartao = () => {
    const [nome, setNome] = useState('');
    const [vencimento, setVencimento] = useState(5);
    const [diaFechamento, setDiaFechamento] = useState('');
    const [limite, setLimite] = useState('');
    const handleSubmit = e => {
      e.preventDefault();
      if (nome.trim()) {
        adicionarCartao({
          nome,
          vencimento,
          diaFechamento: diaFechamento || parseInt(vencimento) - 7,
          limite: limite || 0
        });
      } else {
        alert('Preencha o nome do cartão!');
      }
    };
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Nome do Cart\xE3o"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: nome,
      onChange: e => setNome(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Nubank",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Dia de Fechamento"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: "31",
      value: diaFechamento,
      onChange: e => setDiaFechamento(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: `Ex: ${parseInt(vencimento) - 7}`
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "Deixe vazio para 7 dias antes do vencimento")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Dia do Vencimento"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: "31",
      value: vencimento,
      onChange: e => setVencimento(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      required: true
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Limite do Cart\xE3o (Opcional)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      min: "0",
      value: limite,
      onChange: e => setLimite(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: 10000.00"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "Deixe vazio se n\xE3o quiser controlar limite")), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2705 Adicionar Cart\xE3o"));
  };
  const FormNovoGastoFixo = () => {
    const [categoria, setCategoria] = useState('MORADIA');
    const [novaCategoria, setNovaCategoria] = useState('');
    const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [vencimento, setVencimento] = useState(10);
    const [temporario, setTemporario] = useState(false);
    const [totalParcelas, setTotalParcelas] = useState(1);
    const [mesInicio, setMesInicio] = useState('jan');
    const [anoInicio, setAnoInicio] = useState(anoAtual);

    // Categorias padrão + personalizadas
    const categoriasFixasDefault = ['MORADIA', 'ESTUDO', 'TRANSPORTE', 'SERVIÇOS', 'SAÚDE'];
    const todasCategorias = [...categoriasFixasDefault, ...categoriasPersonalizadas.gastosFixos];
    const mesesList = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const calcularValorParcela = () => {
      if (temporario && valor && totalParcelas > 0) {
        return (parseFloat(valor) / parseInt(totalParcelas)).toFixed(2);
      }
      return valor;
    };
    const handleSubmit = e => {
      e.preventDefault();
      let categoriaFinal = categoria;

      // Se está criando nova categoria
      if (mostrarNovaCategoria && novaCategoria.trim()) {
        categoriaFinal = novaCategoria.trim().toUpperCase();

        // Adicionar à lista de categorias personalizadas
        if (!todasCategorias.includes(categoriaFinal)) {
          setCategoriasPersonalizadas({
            ...categoriasPersonalizadas,
            gastosFixos: [...categoriasPersonalizadas.gastosFixos, categoriaFinal]
          });
        }
      }
      if (descricao.trim() && valor) {
        // Se é temporário, criar múltiplas parcelas OU única parcela com mes/ano
        if (temporario && totalParcelas >= 1) {
          const valorParcela = parseFloat(valor) / parseInt(totalParcelas);
          const mesInicioIdx = mesesList.indexOf(mesInicio);

          // CRIAR ARRAY COM TODAS AS PARCELAS PRIMEIRO
          const novasParcelas = [];
          const baseTime = Date.now();
          for (let i = 0; i < parseInt(totalParcelas); i++) {
            // Calcular mês e ano da parcela
            const mesesAFrente = mesInicioIdx + i;
            const mesParcelaIdx = mesesAFrente % 12;
            const anosAFrente = Math.floor(mesesAFrente / 12);
            const mesParcela = mesesList[mesParcelaIdx];
            const anoAtualParcela = anoInicio + anosAFrente;
            const novaParcela = {
              id: baseTime + i,
              categoria: categoriaFinal,
              descricao: totalParcelas > 1 ? `${descricao} - ${i + 1}/${totalParcelas}` : descricao,
              valor: valorParcela,
              vencimento: parseInt(vencimento),
              temporario: true,
              totalParcelas: parseInt(totalParcelas),
              parcelaAtual: i + 1,
              mes: mesParcela,
              ano: anoAtualParcela
            };
            novasParcelas.push(novaParcela);
          }

          // ADICIONAR TODAS DE UMA VEZ
          setGastosFixos(prev => [...prev, ...novasParcelas]);
          setModalAberto(null);
          alert(`✅ ${novasParcelas.length} ${totalParcelas === 1 ? 'gasto temporário criado' : 'parcelas criadas'} com sucesso!`);
        } else {
          // Gasto fixo normal
          const novoGasto = {
            categoria: categoriaFinal,
            descricao,
            valor: safeFloat(valor),
            vencimento: parseInt(vencimento),
            temporario: false,
            totalParcelas: null,
            parcelaAtual: null
          };
          adicionarGastoFixo(novoGasto);
          setModalAberto(null);
        }
      } else {
        alert('Preencha todos os campos!');
      }
    };
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), !mostrarNovaCategoria ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: e => setCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
    }, todasCategorias.map(cat => /*#__PURE__*/React.createElement("option", {
      key: cat,
      value: cat
    }, cat))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setMostrarNovaCategoria(true),
      className: "mt-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: e => setNovaCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500",
      placeholder: "Ex: PETS, INVESTIMENTOS, ASSINATURAS...",
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mt-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setMostrarNovaCategoria(false);
        setNovaCategoria('');
      },
      className: "text-sm text-gray-600 hover:text-gray-700"
    }, "\u2190 Voltar para categorias")), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "\uD83D\uDCA1 Ser\xE1 salvo automaticamente em MAI\xDASCULAS"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Descri\xE7\xE3o ", temporario && /*#__PURE__*/React.createElement("span", {
      className: "text-orange-600"
    }, "(base)")), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      placeholder: temporario ? "Ex: IPVA 2026" : "Ex: Aluguel",
      required: true
    }), temporario && /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "\uD83D\uDCA1 Sistema adicionar\xE1 \" - 1/3\", \" - 2/3\", etc.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor ", temporario && /*#__PURE__*/React.createElement("span", {
      className: "text-orange-600"
    }, "(total)")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: e => setValor(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      placeholder: "0.00",
      required: true
    }), temporario && valor && totalParcelas > 0 && /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-green-600 font-semibold mt-1"
    }, "\uD83D\uDCB0 Cada parcela: R$ ", calcularValorParcela())), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Dia do Vencimento"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: "31",
      value: vencimento,
      onChange: e => setVencimento(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "bg-orange-50 border-2 border-orange-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("label", {
      className: "flex items-center gap-2 cursor-pointer"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: temporario,
      onChange: e => setTemporario(e.target.checked),
      className: "w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\u23F1\uFE0F Parcelar este gasto (criar parcelas automaticamente)")), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1 ml-7"
    }, "Exemplo: IPVA, financiamento, etc."), temporario && /*#__PURE__*/React.createElement("div", {
      className: "mt-4 space-y-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "N\xFAmero de Parcelas"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: "60",
      value: totalParcelas,
      onChange: e => setTotalParcelas(e.target.value),
      className: "w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 text-sm",
      placeholder: "3",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "M\xEAs de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: mesInicio,
      onChange: e => setMesInicio(e.target.value),
      className: "w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 text-sm"
    }, mesesList.map((mes, idx) => /*#__PURE__*/React.createElement("option", {
      key: mes,
      value: mes
    }, mesesNomes[idx])))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "Ano de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: anoInicio,
      onChange: e => setAnoInicio(parseInt(e.target.value)),
      className: "w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 text-sm"
    }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => /*#__PURE__*/React.createElement("option", {
      key: ano,
      value: ano
    }, ano))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded p-3 text-xs space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-orange-700"
    }, "\uD83D\uDCCB Resumo do Parcelamento:"), /*#__PURE__*/React.createElement("div", {
      className: "text-gray-600"
    }, "\u2022 Total: R$ ", valor || '0.00'), /*#__PURE__*/React.createElement("div", {
      className: "text-gray-600"
    }, "\u2022 ", totalParcelas, "x de R$ ", calcularValorParcela()), /*#__PURE__*/React.createElement("div", {
      className: "text-gray-600"
    }, "\u2022 In\xEDcio: ", mesesNomes[mesesList.indexOf(mesInicio)], "/", anoInicio), /*#__PURE__*/React.createElement("div", {
      className: "text-gray-600"
    }, "\u2022 Vencimento: todo dia ", vencimento)))), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
    }, temporario ? `✅ Criar ${totalParcelas} Parcelas` : '✅ Adicionar Gasto Fixo'));
  };
  // ── Lista unificada de categorias de gastos ────────────────────────────────
  const CATEGORIAS_GASTOS = [
    'ALIMENTAÇÃO','MERCADO','GASOLINA','TRANSPORTE','FARMÁCIA','SAÚDE',
    'ACADEMIA','BELEZA','VESTUÁRIO','TECNOLOGIA','ASSINATURA',
    'LAZER','VIAGEM','FESTA','PRESENTE',
    'MORADIA','CONDOMÍNIO','ÁGUA/LUZ/GÁS','INTERNET/TELEFONE',
    'EDUCAÇÃO','PET','MANUTENÇÃO','REFORMA','SERVIÇOS',
    'COMPRAS ONLINE','EMERGÊNCIA','OUTROS'
  ];
  // ──────────────────────────────────────────────────────────────────────────

  const FormNovoGastoVariavel = () => {
    const [categoria, setCategoria] = useState('MERCADO');
    const [novaCategoria, setNovaCategoria] = useState('');
    const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [mostrarNoFarol, setMostrarNoFarol] = useState(false);

    // Categorias padrão + personalizadas
    const todasCategorias = [...CATEGORIAS_GASTOS, ...(categoriasPersonalizadas.gastosVariaveis||[]).filter(c => !CATEGORIAS_GASTOS.includes(c))];
    const handleSubmit = e => {
      e.preventDefault();
      let categoriaFinal = categoria;

      // Se está criando nova categoria
      if (mostrarNovaCategoria && novaCategoria.trim()) {
        categoriaFinal = novaCategoria.trim().toUpperCase();

        // Adicionar à lista de categorias personalizadas
        if (!todasCategorias.includes(categoriaFinal)) {
          setCategoriasPersonalizadas({
            ...categoriasPersonalizadas,
            gastosVariaveis: [...categoriasPersonalizadas.gastosVariaveis, categoriaFinal]
          });
        }
      }
      if (valor) {
        const dataInput = document.getElementById('dataGastoVariavel').value;
        const dataObj = new Date(dataInput + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const dia = dataObj.getDate();
        adicionarGastoVariavel({
          categoria: categoriaFinal,
          descricao,
          valor,
          data: dataFormatada,
          dataCompleta: dataInput,
          mostrarNoFarol: mostrarNoFarol,
          vencimento: mostrarNoFarol ? dia : null
        });
        setModalAberto(null);
      } else {
        alert('Preencha o valor!');
      }
    };
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), !mostrarNovaCategoria ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: e => setCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
    }, todasCategorias.map(cat => /*#__PURE__*/React.createElement("option", {
      key: cat,
      value: cat
    }, cat))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setMostrarNovaCategoria(true),
      className: "mt-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: e => setNovaCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500",
      placeholder: "Ex: VESTU\xC1RIO, ELETR\xD4NICOS, PRESENTES...",
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mt-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setMostrarNovaCategoria(false);
        setNovaCategoria('');
      },
      className: "text-sm text-gray-600 hover:text-gray-700"
    }, "\u2190 Voltar para categorias")), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "\uD83D\uDCA1 Ser\xE1 salvo automaticamente em MAI\xDASCULAS"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Data do Gasto"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      id: "dataGastoVariavel",
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      defaultValue: new Date().toISOString().split('T')[0],
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Descri\xE7\xE3o (Opcional)"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      placeholder: "Ex: Supermercado Extra"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: e => setValor(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "bg-orange-50 border-2 border-orange-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("label", {
      className: "flex items-center gap-2 cursor-pointer"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: mostrarNoFarol,
      onChange: e => setMostrarNoFarol(e.target.checked),
      className: "w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDCB3 Mostrar nas Contas a Pagar")), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1 ml-7"
    }, "Para gastos recorrentes como IPTU, seguro anual, etc.")), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
    }, "\u2705 Adicionar Gasto Vari\xE1vel"));
  };
  const FormNovoGastoExtra = () => {
    const [categoria, setCategoria] = useState('VIAGEM');
    const [novaCategoria, setNovaCategoria] = useState('');
    const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [mostrarNoFarol, setMostrarNoFarol] = useState(false);

    // Categorias padrão para gastos extras
    const todasCategorias = [...CATEGORIAS_GASTOS, ...(categoriasPersonalizadas.gastosExtras||[]).filter(c => !CATEGORIAS_GASTOS.includes(c))];
    const handleSubmit = e => {
      e.preventDefault();
      let categoriaFinal = categoria;
      if (mostrarNovaCategoria && novaCategoria.trim()) {
        categoriaFinal = novaCategoria.trim().toUpperCase();
        if (!todasCategorias.includes(categoriaFinal)) {
          setCategoriasPersonalizadas({
            ...categoriasPersonalizadas,
            gastosExtras: [...(categoriasPersonalizadas.gastosExtras || []), categoriaFinal]
          });
        }
      }
      if (valor) {
        const dataInput = document.getElementById('dataGastoExtra').value;
        const dataObj = new Date(dataInput + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const dia = dataObj.getDate();
        const novoGasto = {
          id: Date.now(),
          categoria: categoriaFinal,
          descricao: descricao || categoriaFinal,
          valor: safeFloat(valor),
          data: dataFormatada,
          dataCompleta: dataInput,
          // YYYY-MM-DD
          mes: mesAtual,
          ano: anoAtual,
          mostrarNoFarol: mostrarNoFarol,
          vencimento: mostrarNoFarol ? dia : null
        };
        setGastosExtras([...gastosExtras, novoGasto]);
        setModalAberto(null);
      } else {
        alert('Preencha o valor!');
      }
    };
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), !mostrarNovaCategoria ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: e => setCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500"
    }, todasCategorias.map(cat => /*#__PURE__*/React.createElement("option", {
      key: cat,
      value: cat
    }, cat))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setMostrarNovaCategoria(true),
      className: "mt-2 text-sm text-amber-600 hover:text-amber-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: e => setNovaCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500",
      placeholder: "Ex: CURSO, EQUIPAMENTO...",
      autoFocus: true
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setMostrarNovaCategoria(false);
        setNovaCategoria('');
      },
      className: "mt-2 text-sm text-gray-600 hover:text-gray-700"
    }, "\u2190 Voltar"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "\uD83D\uDCA1 Salvo em MAI\xDASCULAS"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Data do Gasto"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      id: "dataGastoExtra",
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500",
      defaultValue: new Date().toISOString().split('T')[0],
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Descri\xE7\xE3o"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500",
      placeholder: "Ex: Passagem a\xE9rea"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: e => setValor(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "bg-amber-50 border-2 border-amber-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("label", {
      className: "flex items-center gap-2 cursor-pointer"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: mostrarNoFarol,
      onChange: e => setMostrarNoFarol(e.target.checked),
      className: "w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDCB3 Mostrar nas Contas a Pagar")), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1 ml-7"
    }, "Para gastos recorrentes como seguro, licenciamento, etc.")), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
    }, "\u2705 Adicionar Gasto Extra"));
  };
  const FormMetas = () => {
    const [metasTemp, setMetasTemp] = useState(metas);
    const handleSalvar = () => {
      setMetas(metasTemp);
      setModalAberto(null);
      alert('Metas salvas com sucesso!');
    };
    const aplicarParaTodos = () => {
      const valor = metasTemp.mensal;
      setMetasTemp({
        mensal: valor,
        jan: valor,
        fev: valor,
        mar: valor,
        abr: valor,
        mai: valor,
        jun: valor,
        jul: valor,
        ago: valor,
        set: valor,
        out: valor,
        nov: valor,
        dez: valor
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Meta Padr\xE3o"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: metasTemp.mensal,
      onChange: e => setMetasTemp({
        ...metasTemp,
        mensal: parseFloat(e.target.value) || 0
      }),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "20000.00"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: aplicarParaTodos,
      className: "mt-2 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
    }, "\uD83D\uDCCB Aplicar para Todos os Meses")), /*#__PURE__*/React.createElement("div", {
      className: "pt-4 border-t"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-gray-800 mb-3"
    }, "Metas por M\xEAs"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-3 max-h-96 overflow-y-auto"
    }, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => /*#__PURE__*/React.createElement("div", {
      key: mes
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1 uppercase"
    }, mes), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: metasTemp[mes],
      onChange: e => setMetasTemp({
        ...metasTemp,
        [mes]: parseFloat(e.target.value) || 0
      }),
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "pt-4 border-t"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-3"
    }, /*#__PURE__*/React.createElement("strong", null, "Total Anual:"), " R$ ", (metasTemp.jan + metasTemp.fev + metasTemp.mar + metasTemp.abr + metasTemp.mai + metasTemp.jun + metasTemp.jul + metasTemp.ago + metasTemp.set + metasTemp.out + metasTemp.nov + metasTemp.dez).toFixed(2)), /*#__PURE__*/React.createElement("button", {
      onClick: handleSalvar,
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Salvar Metas")));
  };
  const FormOrcamento = () => {
    const [cartoes, setCartoes] = useState(orcamento.cartoes);
    const [fixos, setFixos] = useState(orcamento.fixos);
    const [variaveis, setVariaveis] = useState(orcamento.variaveis);
    const handleSalvar = () => {
      setOrcamento({
        cartoes: parseFloat(cartoes) || 0,
        fixos: parseFloat(fixos) || 0,
        variaveis: parseFloat(variaveis) || 0
      });
      setModalAberto(null);
      alert('Orçamento salvo com sucesso!');
    };
    const total = (parseFloat(cartoes) || 0) + (parseFloat(fixos) || 0) + (parseFloat(variaveis) || 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCB3 Or\xE7amento para Cart\xF5es"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: cartoes,
      onChange: e => setCartoes(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "8000.00"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83C\uDFE0 Or\xE7amento para Contas Fixas"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: fixos,
      onChange: e => setFixos(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "5500.00"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCCA Or\xE7amento para Gastos Variáveis"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: variaveis,
      onChange: e => setVariaveis(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "2000.00"
    })), /*#__PURE__*/React.createElement("div", {
      className: "pt-4 border-t"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-3"
    }, /*#__PURE__*/React.createElement("strong", null, "Total Or\xE7ado:"), " R$ ", total.toFixed(2)), /*#__PURE__*/React.createElement("button", {
      onClick: handleSalvar,
      className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2705 Salvar Or\xE7amento")));
  };
  const FormPlanejado = () => {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState('CARTÃO');
    const handleSubmit = e => {
      e.preventDefault();
      if (descricao && valor) {
        adicionarPlanejado({
          descricao,
          valor,
          categoria
        });
      } else {
        alert('Preencha descrição e valor!');
      }
    };
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Descri\xE7\xE3o"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Aluguel, Mercado, Gasolina...",
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: e => setCategoria(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg"
    }, /*#__PURE__*/React.createElement("option", {
      value: "CART\xC3O"
    }, "\uD83D\uDCB3 Cart\xE3o"), /*#__PURE__*/React.createElement("option", {
      value: "FIXO"
    }, "\uD83C\uDFE0 Fixo"), /*#__PURE__*/React.createElement("option", {
      value: "VARI\xC1VEL"
    }, "\uD83D\uDCCA Vari\xE1vel"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor Planejado"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: e => setValor(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Adicionar Planejado"));
  };
  const FormCompraParcelada = () => {
    const [descricao, setDescricao] = useState('');
    const [cartao, setCartao] = useState(cartaoParaNovaCompra || cartoes[0]?.nome || '');
    const [categoria, setCategoria] = useState('OUTROS');
    const [valorTotal, setValorTotal] = useState('');
    const [parcelas, setParcelas] = useState('1');
    const [mesInicio, setMesInicio] = useState(mesAtual);
    const valorParcela = valorTotal && parcelas ? (parseFloat(valorTotal) / parseInt(parcelas)).toFixed(2) : 0;
    const handleSubmit = e => {
      e.preventDefault();
      if (descricao && cartao && valorTotal && parcelas) {
        adicionarCompraParcelada({
          descricao,
          cartao,
          categoria,
          valorTotal: safeFloat(valorTotal),
          parcelas: parseInt(parcelas),
          mesInicio
        });
        setModalAberto(null);
      } else {
        alert('❌ Preencha todos os campos!');
      }
    };
    const indiceMesInicio = MESES.indexOf(mesInicio);
    const mesesPreview = [];
    for (let i = 0; i < Math.min(parseInt(parcelas) || 0, 12); i++) {
      const indiceMes = (indiceMesInicio + i) % 12;
      mesesPreview.push(MESES[indiceMes].toUpperCase());
    }
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Descri\xE7\xE3o da Compra"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Notebook Dell, Geladeira Samsung...",
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Cart\xE3o"), /*#__PURE__*/React.createElement("select", {
      value: cartao,
      onChange: e => setCartao(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      required: true
    }, cartoes.map(c => /*#__PURE__*/React.createElement("option", {
      key: c.nome,
      value: c.nome
    }, "\uD83D\uDCB3 ", c.nome)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: e => setCategoria(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg"
    }, CATEGORIAS_GASTOS.map(c => /*#__PURE__*/React.createElement("option", {key:c,value:c}, c)))),
    /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor Total"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valorTotal,
      onChange: e => setValorTotal(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "1200.00",
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Parcelas"), /*#__PURE__*/React.createElement("select", {
      value: parcelas,
      onChange: e => setParcelas(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      required: true
    }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24].map(num => /*#__PURE__*/React.createElement("option", {
      key: num,
      value: num
    }, num, "x"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "M\xEAs de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: mesInicio,
      onChange: e => setMesInicio(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg"
    }, MESES.map(mes => /*#__PURE__*/React.createElement("option", {
      key: mes,
      value: mes
    }, mes.toUpperCase())))), valorTotal && parcelas && /*#__PURE__*/React.createElement("div", {
      className: "bg-blue-50 border-2 border-blue-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCCB Preview:"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-600 mb-2"
    }, parcelas, "x de R$ ", valorParcela), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Meses: ", mesesPreview.join(', '), parseInt(parcelas) > 12 && /*#__PURE__*/React.createElement("span", {
      className: "text-orange-600"
    }, " (continua no ano seguinte)"))), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Adicionar Compra Parcelada"));
  };
  const FormNovaReceita = () => {
    const [categoria, setCategoria] = useState('SALÁRIO');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [recorrente, setRecorrente] = useState(false);
    const handleSubmit = e => {
      e.preventDefault();
      if (valor) {
        adicionarReceita({
          categoria,
          descricao,
          valor,
          recorrente
        });
      } else {
        alert('Preencha o valor!');
      }
    };
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: e => setCategoria(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg"
    }, /*#__PURE__*/React.createElement("option", {
      value: "SAL\xC1RIO"
    }, "\uD83D\uDCBC Sal\xE1rio"), /*#__PURE__*/React.createElement("option", {
      value: "FREELANCE"
    }, "\uD83D\uDCBB Freelance"), /*#__PURE__*/React.createElement("option", {
      value: "INVESTIMENTOS"
    }, "\uD83D\uDCC8 Investimentos"), /*#__PURE__*/React.createElement("option", {
      value: "ALUGUEL"
    }, "\uD83C\uDFE0 Aluguel Recebido"), /*#__PURE__*/React.createElement("option", {
      value: "B\xD4NUS"
    }, "\uD83C\uDF81 B\xF4nus"), /*#__PURE__*/React.createElement("option", {
      value: "OUTROS"
    }, "\uD83D\uDCB0 Outros"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Descri\xE7\xE3o (Opcional)"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Sal\xE1rio CLT"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: e => setValor(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Adicionar Receita"));
  };

  // Screens
  const Dashboard = () => {
    // Setar contexto para o DashboardComponent externo
    const gastosFixosMes = gastosFixos.filter(g => !g.mes || (g.mes === mesAtual && String(g.ano) === String(anoAtual)));
    window.__dashCtx = {
      totais, saldo, cartoes, gastosFixos: gastosFixosMes, receitas,
      mesAtual, anoAtual, metaMensal, pagamentos,
      getStatusFarol, calcularParcelasCartao,
      darkMode, C,
    };
    const primeiroNome = user
      ? (user.displayName || user.email?.split('@')[0] || 'Usu\u00E1rio').split(' ')[0]
      : 'Usu\u00E1rio';
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const MESES_NOME = {jan:'Janeiro',fev:'Fevereiro',mar:'\u00E7o',abr:'Abril',mai:'Maio',jun:'Junho',jul:'Julho',ago:'Agosto',set:'Setembro',out:'Outubro',nov:'Novembro',dez:'Dezembro'};
    const dataFormatada = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const mesNomeDash = {jan:'Janeiro',fev:'Fevereiro',mar:'Mar\u00E7o',abr:'Abril',mai:'Maio',jun:'Junho',jul:'Julho',ago:'Agosto',set:'Setembro',out:'Outubro',nov:'Novembro',dez:'Dezembro'}[mesAtual] || mesAtual;
    return React.createElement(React.Fragment, null,
      React.createElement('div', {
        style: {
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          background: C.bg,
          borderRadius: '16px',
          border: '1px solid ' + C.border,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }
      },
        React.createElement('div', null,
          React.createElement('div', {
            style: { fontSize: '1.35rem', fontWeight: '800', color: C.text, lineHeight: '1.2' }
          }, saudacao + ', ' + primeiroNome + '! \uD83D\uDC4B'),
          React.createElement('div', {
            style: { fontSize: '0.8rem', color: C.textMuted, marginTop: '4px' }
          }, 'Aqui est\u00E1 seu resumo financeiro.')
        ),
        React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('div', {
            style: { fontSize: '0.78rem', color: C.textMuted, textTransform: 'capitalize' }
          }, dataFormatada),
          React.createElement('div', {
            style: { fontSize: '0.72rem', color: C.textFaint, marginTop: '2px' }
          }, mesNomeDash + ' \u00B7 ' + anoAtual)
        )
      ),
      (function(){
        const passosOK = {
          receita: receitas.length > 0,
          fixo: gastosFixos.length > 0,
          cartao: cartoes.length > 0,
          variavel: gastosVariaveis.length > 0,
        };
        const passosFeitos = Object.values(passosOK).filter(Boolean).length;
        if (passosFeitos === 4) return null;
        const passos = [
          { ok: passosOK.receita,  icon: '💰', label: 'Cadastrar receitas',  desc: 'Salário e entradas mensais',  tela: 'receitas', cor: '#10b981' },
          { ok: passosOK.fixo,     icon: '🏠', label: 'Adicionar conta fixa', desc: 'Aluguel, internet, assinaturas...', tela: 'fixos', cor: '#f97316' },
          { ok: passosOK.cartao,   icon: '💳', label: 'Cadastrar cartão',    desc: 'Controle suas faturas',       tela: 'cartoes', cor: '#8b5cf6' },
          { ok: passosOK.variavel, icon: '📊', label: 'Registrar gastos',    desc: 'Mercado, combustível...',      tela: 'variaveis', cor: '#0284c7' },
        ];
        return React.createElement('div', {
          style: { marginBottom: '20px', background: C.bg, borderRadius: '16px', border: '1px solid #fdba74', padding: '16px 18px', boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '0.88rem', fontWeight: '800', color: C.text } }, '🚀 Primeiros passos'),
              React.createElement('div', { style: { fontSize: '0.7rem', color: C.textFaint, marginTop: '1px' } }, passosFeitos + ' de 4 concluídos — clique para configurar')
            ),
            React.createElement('div', { style: { background: passosFeitos > 0 ? '#f97316' : C.border, borderRadius: '20px', padding: '2px 10px', fontSize: '0.68rem', fontWeight: '800', color: passosFeitos > 0 ? '#fff' : C.textFaint } },
              Math.round(passosFeitos / 4 * 100) + '%')
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' } },
            ...passos.map(function(p) {
              return React.createElement('div', {
                key: p.tela,
                onClick: p.ok ? undefined : function(){ setTelaAtiva(p.tela); },
                style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: p.ok ? 'default' : 'pointer', background: p.ok ? (darkMode ? '#052e16' : '#f0fdf4') : C.bgMuted, border: '1px solid ' + (p.ok ? '#86efac' : C.border), transition: 'all 0.15s' },
                onMouseEnter: p.ok ? undefined : function(e){ e.currentTarget.style.borderColor = p.cor; e.currentTarget.style.background = p.cor + '18'; },
                onMouseLeave: p.ok ? undefined : function(e){ e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgMuted; }
              },
                React.createElement('div', { style: { width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: p.ok ? '#10b981' : p.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p.ok ? '1rem' : '1.1rem', color: '#fff', fontWeight: '700' } }, p.ok ? '✓' : p.icon),
                React.createElement('div', { style: { minWidth: 0 } },
                  React.createElement('div', { style: { fontSize: '0.75rem', fontWeight: '700', color: p.ok ? '#16a34a' : C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.label),
                  React.createElement('div', { style: { fontSize: '0.65rem', color: C.textFaint } }, p.ok ? '✓ Concluído' : p.desc)
                )
              );
            })
          )
        );
      })(),
      window.DashboardComponent ? window.DashboardComponent() : React.createElement('div', null, 'Carregando...')
    );
  };

  // 👑 PAINEL DE ADMINISTRAÇÃO
  const TelaAdmin = ({
    isUserAdmin: isUserAdminProp
  }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
      total: 0,
      ativos: 0,
      novos: 0
    });
    useEffect(() => {
      carregarUsuarios();
    }, []);
    const carregarUsuarios = async () => {
      if (!db || !user) {
        return;
      }
      try {
        setLoading(true);
        const usersSnapshot = await db.collection('usuarios').get();
        const usersList = [];
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          usersList.push({
            uid: doc.id,
            ...data
          });
        });

        // Calcular estatísticas
        const agora = new Date();
        const umDiaAtras = new Date(agora - 24 * 60 * 60 * 1000);
        const seteDiasAtras = new Date(agora - 7 * 24 * 60 * 60 * 1000);
        const ativos = usersList.filter(u => {
          try {
            return u.ultimoAcesso && u.ultimoAcesso.toDate && u.ultimoAcesso.toDate() > umDiaAtras;
          } catch {
            return false;
          }
        }).length;
        const novos = usersList.filter(u => {
          try {
            return u.criadoEm && u.criadoEm.toDate && u.criadoEm.toDate() > seteDiasAtras;
          } catch {
            return false;
          }
        }).length;
        const pendentes = usersList.filter(u => u.status === 'PENDENTE').length;
        setStats({
          total: usersList.length,
          pendentes: pendentes,
          ativos: ativos,
          novos: novos
        });
        setUsuarios(usersList);
      } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        alert('❌ Erro ao carregar usuários: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    const toggleAdmin = async (userId, isCurrentlyAdmin) => {
      if (!confirm(`Deseja ${isCurrentlyAdmin ? 'REMOVER' : 'CONCEDER'} permissões de admin para este usuário?`)) {
        return;
      }
      try {
        await db.collection('usuarios').doc(userId).update({
          isAdmin: !isCurrentlyAdmin,
          modificadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert(`✅ Permissões ${isCurrentlyAdmin ? 'removidas' : 'concedidas'} com sucesso!`);
        carregarUsuarios();
      } catch (error) {
        alert('❌ Erro ao alterar permissões: ' + error.message);
      }
    };

    // Usar o isUserAdmin que já foi verificado no componente pai
    if (!isUserAdminProp) {
      return /*#__PURE__*/React.createElement("div", {
        className: "max-w-4xl mx-auto p-8"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-6xl mb-4"
      }, "\uD83D\uDEAB"), /*#__PURE__*/React.createElement("h2", {
        className: "text-2xl font-bold text-red-800 mb-2"
      }, "Acesso Negado"), /*#__PURE__*/React.createElement("p", {
        className: "text-red-600 mb-4"
      }, "Voc\xEA n\xE3o tem permiss\xF5es de administrador."), /*#__PURE__*/React.createElement("div", {
        className: "bg-white rounded-lg p-4 text-left space-y-2 text-sm"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "DEBUG INFO:")), /*#__PURE__*/React.createElement("div", null, "\u2022 isUserAdminProp: ", /*#__PURE__*/React.createElement("code", {
        className: "bg-gray-200 px-2 py-1 rounded"
      }, String(isUserAdminProp))), /*#__PURE__*/React.createElement("div", null, "\u2022 User UID: ", /*#__PURE__*/React.createElement("code", {
        className: "bg-gray-200 px-2 py-1 rounded"
      }, user?.uid || 'null')), /*#__PURE__*/React.createElement("div", null, "\u2022 User Email: ", /*#__PURE__*/React.createElement("code", {
        className: "bg-gray-200 px-2 py-1 rounded"
      }, user?.email || 'null')), /*#__PURE__*/React.createElement("div", null, "\u2022 Firestore: ", /*#__PURE__*/React.createElement("code", {
        className: "bg-gray-200 px-2 py-1 rounded"
      }, db ? 'Conectado' : 'Desconectado'))), /*#__PURE__*/React.createElement("button", {
        onClick: async () => {
          if (!db || !user) {
            alert('❌ DB ou User não disponível');
            return;
          }
          try {
            const doc = await db.collection('usuarios').doc(user.uid).get();
            if (doc.exists) {
              const data = doc.data();
              alert(`📊 DADOS DO FIRESTORE:\n\n` + `Nome: ${data.nome}\n` + `Email: ${data.email}\n` + `isAdmin: ${data.isAdmin}\n` + `Status: ${data.status}\n\n` + `Para ser admin, isAdmin deve ser true!`);
            } else {
              alert('❌ Seu usuário não existe no Firestore!');
            }
          } catch (error) {
            alert('❌ Erro ao verificar: ' + error.message);
          }
        },
        className: "mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      }, "\uD83D\uDD0D Verificar Meus Dados no Firestore")));
    }
    if (loading) {
      return /*#__PURE__*/React.createElement("div", {
        className: "max-w-6xl mx-auto p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-center py-12"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-2xl mb-4"
      }, "\u23F3"), /*#__PURE__*/React.createElement("p", {
        className: "text-gray-600"
      }, "Carregando usu\xE1rios...")));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "max-w-6xl mx-auto p-4 space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-xl p-6 shadow-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "text-xl font-bold mb-2"
    }, "\uD83D\uDC51 Painel de Administra\xE7\xE3o"), /*#__PURE__*/React.createElement("p", {
      className: "opacity-90"
    }, "Gerencie usu\xE1rios e visualize estat\xEDsticas do sistema")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        alert(`🔍 DIAGNÓSTICO:\n\n` + `Admin: ${isUserAdminProp}\n` + `User: ${user?.email}\n` + `DB: ${db ? 'OK' : 'ERRO'}\n` + `Usuários: ${usuarios.length}\n\n` + `Veja console (F12) para mais detalhes`);
      },
      className: "px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-all"
    }, "\uD83D\uDD0D Diagn\xF3stico"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-4 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\uD83D\uDC65 Total de Usu\xE1rios"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-600"
    }, stats.total)), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\u23F3 Aguardando Aprova\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-yellow-600"
    }, stats.pendentes || 0)), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl p-6 shadow-lg border-2 border-green-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\u2705 Ativos Hoje"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-green-600"
    }, stats.ativos)), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\uD83C\uDD95 Novos (7 dias)"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-orange-600"
    }, stats.novos))), (() => {
      const pendentes = usuarios.filter(u => u.status === 'PENDENTE');
      if (pendentes.length === 0) return null;
      return /*#__PURE__*/React.createElement("div", {
        className: "bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg overflow-hidden"
      }, /*#__PURE__*/React.createElement("div", {
        className: "p-4 bg-yellow-100 border-b border-yellow-300"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "text-xl font-bold text-yellow-900"
      }, "\u23F3 Solicita\xE7\xF5es Pendentes (", pendentes.length, ")")), /*#__PURE__*/React.createElement("div", {
        className: "p-4 space-y-3"
      }, pendentes.map(usuario => /*#__PURE__*/React.createElement("div", {
        key: usuario.uid,
        className: "bg-white border-2 border-yellow-200 rounded-lg p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mb-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-2xl"
      }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "font-bold text-lg text-gray-800"
      }, usuario.nome), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 text-sm text-gray-600"
      }, /*#__PURE__*/React.createElement("span", null, usuario.email), usuario.emailVerificado ? /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold"
      }, "\u2705 Verificado") : /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold"
      }, "\u26A0\uFE0F N\xE3o verificado")))), /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-500"
      }, "\uD83D\uDCC5 Solicitou em: ", (() => {
        try {
          return usuario.criadoEm && usuario.criadoEm.toDate ? new Date(usuario.criadoEm.toDate()).toLocaleString('pt-BR') : 'Data desconhecida';
        } catch {
          return 'Data desconhecida';
        }
      })())), /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: async () => {
          if (confirm(`✅ Aprovar acesso de ${usuario.nome}?`)) {
            try {
              await db.collection('usuarios').doc(usuario.uid).update({
                status: 'APROVADO'
              });
              alert('✅ Usuário aprovado com sucesso!');
              carregarUsuarios();
            } catch (error) {
              alert('❌ Erro ao aprovar: ' + error.message);
            }
          }
        },
        className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
      }, "\u2705 Aprovar"), /*#__PURE__*/React.createElement("button", {
        onClick: async () => {
          if (confirm(`❌ Rejeitar acesso de ${usuario.nome}?\n\nEsta pessoa não poderá acessar o sistema.`)) {
            try {
              await db.collection('usuarios').doc(usuario.uid).update({
                status: 'REJEITADO'
              });
              alert('❌ Usuário rejeitado.');
              carregarUsuarios();
            } catch (error) {
              alert('❌ Erro ao rejeitar: ' + error.message);
            }
          }
        },
        className: "px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
      }, "\u274C Rejeitar")))))));
    })(), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg border overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-4 bg-gray-50 border-b"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-base font-bold text-gray-800"
    }, "\uD83D\uDCCB Lista de Usu\xE1rios")), /*#__PURE__*/React.createElement("div", {
      className: "overflow-x-auto"
    }, /*#__PURE__*/React.createElement("table", {
      className: "w-full"
    }, /*#__PURE__*/React.createElement("thead", {
      className: "bg-gray-100"
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      className: "px-4 py-2 text-left text-sm font-semibold text-gray-700"
    }, "Usu\xE1rio"), /*#__PURE__*/React.createElement("th", {
      className: "px-4 py-2 text-left text-sm font-semibold text-gray-700"
    }, "Email"), /*#__PURE__*/React.createElement("th", {
      className: "px-4 py-2 text-left text-sm font-semibold text-gray-700"
    }, "Cadastro"), /*#__PURE__*/React.createElement("th", {
      className: "px-4 py-2 text-left text-sm font-semibold text-gray-700"
    }, "Status"), /*#__PURE__*/React.createElement("th", {
      className: "px-4 py-2 text-left text-sm font-semibold text-gray-700"
    }, "Tipo"), /*#__PURE__*/React.createElement("th", {
      className: "px-4 py-2 text-left text-sm font-semibold text-gray-700"
    }, "A\xE7\xF5es"))), /*#__PURE__*/React.createElement("tbody", {
      className: "divide-y"
    }, usuarios.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "6",
      className: "px-4 py-12 text-center text-gray-500"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-4xl mb-2"
    }, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("div", {
      className: "font-semibold"
    }, "Nenhum usu\xE1rio encontrado"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm mt-1"
    }, "Os usu\xE1rios aparecer\xE3o aqui ap\xF3s o cadastro"))) : usuarios.map((usuario, index) => /*#__PURE__*/React.createElement("tr", {
      key: usuario.uid,
      className: index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-2xl"
    }, usuario.isAdmin ? '👑' : '👤'), /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, usuario.nome || 'Sem nome'))), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2 text-sm text-gray-600"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", null, usuario.email), usuario.emailVerificado ? /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold",
      title: "Email verificado"
    }, "\u2705") : /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold",
      title: "Email n\xE3o verificado"
    }, "\u26A0\uFE0F"))), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2 text-sm text-gray-600"
    }, (() => {
      try {
        return usuario.criadoEm && usuario.criadoEm.toDate ? new Date(usuario.criadoEm.toDate()).toLocaleDateString('pt-BR') : 'N/A';
      } catch {
        return 'N/A';
      }
    })()), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: `px-3 py-1 rounded-full text-xs font-semibold ${usuario.status === 'APROVADO' ? 'bg-green-100 text-green-800' : usuario.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' : usuario.status === 'REJEITADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`
    }, usuario.status === 'APROVADO' ? '✅ APROVADO' : usuario.status === 'PENDENTE' ? '⏳ PENDENTE' : usuario.status === 'REJEITADO' ? '❌ REJEITADO' : '✅ ATIVO')), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: `px-3 py-1 rounded-full text-xs font-semibold ${usuario.isAdmin ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`
    }, usuario.isAdmin ? 'ADMIN' : 'USUÁRIO')), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2"
    }, usuario.uid !== user.uid && /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleAdmin(usuario.uid, usuario.isAdmin),
      className: `px-3 py-1 rounded-lg text-xs font-semibold ${usuario.isAdmin ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`
    }, usuario.isAdmin ? '⬇️ Rebaixar' : '⬆️ Promover'), usuario.uid === user.uid && /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-gray-500 italic"
    }, "Voc\xEA")))))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "font-semibold text-blue-900 mb-2"
    }, "\u2139\uFE0F Informa\xE7\xF5es"), /*#__PURE__*/React.createElement("ul", {
      className: "text-sm text-blue-800 space-y-1"
    }, /*#__PURE__*/React.createElement("li", null, "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Admin:"), " Pode acessar este painel e gerenciar outros usu\xE1rios"), /*#__PURE__*/React.createElement("li", null, "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Usu\xE1rio:"), " Acessa apenas seus pr\xF3prios dados financeiros"), /*#__PURE__*/React.createElement("li", null, "\u2022 Voc\xEA n\xE3o pode alterar suas pr\xF3prias permiss\xF5es"), /*#__PURE__*/React.createElement("li", null, "\u2022 Para gerenciar contas (excluir, desativar), use o Firebase Console"))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: carregarUsuarios,
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\uD83D\uDD04 Atualizar Lista")));
  };
  const FormImportarFatura = () => {
    const [etapa, setEtapa] = React.useState(1);
    const [linhas, setLinhas] = React.useState([]);
    const [selecionados, setSelecionados] = React.useState({});
    const [ignorarCreditos, setIgnorarCreditos] = React.useState(true);
    const [parcImport, setParcImport] = React.useState({});
    const [dragging, setDragging] = React.useState(false);
    const cartaoNome = cartaoImport?.nome || '';

    const parseCSV = (texto) => {
      const ls = texto.split('\n').filter(l => l.trim());
      if (ls.length < 2) return [];
      // 1. Detecta separador nas primeiras 10 linhas (não só na primeira)
      const sample = ls.slice(0, Math.min(10, ls.length)).join('\n');
      const sep = (sample.split(';').length > sample.split(',').length) ? ';' : ',';
      // 2. Pula linhas de metadados (ex: "Conta ;9634975") e encontra o header real
      //    O header real deve ter colunas com "data" e "valor"
      const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      let headerIdx = 0;
      for (let i = 0; i < Math.min(10, ls.length); i++) {
        const cols = ls[i].split(sep).map(c => norm(c.replace(/"/g,'').trim()));
        if (cols.some(c => /\bdata\b|\bdate\b/.test(c)) && cols.some(c => /\bvalor\b|\bamount\b/.test(c))) {
          headerIdx = i; break;
        }
      }
      const headers = ls[headerIdx].split(sep).map(h => norm(h.replace(/"/g,'').trim()));
      // 3. Índices das colunas — prefere 'descricao' sobre 'historico'
      const iData  = headers.findIndex(h => /\bdata\b|\bdate\b/.test(h));
      const iValor = headers.findIndex(h => /\bvalor\b|\bamount\b|\bquantia\b|\bmontante\b/.test(h));
      const iDesc  = (() => { const d = headers.findIndex(h => /descri/.test(h)); return d >= 0 ? d : headers.findIndex(h => /desc|titulo|title|histor|memo|estabele|name|nome/.test(h)); })();
      const iHist  = headers.findIndex(h => /histor/.test(h));
      const isNubank = headers.includes('title') && headers.includes('amount');
      const result = [];
      for (let i = headerIdx + 1; i < ls.length; i++) {
        const cols = ls[i].split(sep).map(c => c.replace(/"/g,'').trim());
        if (cols.length < 2) continue;
        let desc = '', valorStr = '', data = '';
        if (isNubank) {
          desc = cols[headers.indexOf('title')] || '';
          valorStr = cols[headers.indexOf('amount')] || '0';
          data = cols[headers.indexOf('date')] || '';
        } else if (iValor >= 0 && iDesc >= 0) {
          const mainDesc = cols[iDesc] || '';
          const hist = (iHist >= 0 && iHist !== iDesc) ? (cols[iHist] || '') : '';
          desc = hist ? hist + ' — ' + mainDesc : mainDesc;
          valorStr = cols[iValor] || '0';
          data = iData >= 0 ? (cols[iData] || '') : '';
        } else if (iValor >= 0) {
          desc = cols[0] || '';
          valorStr = cols[iValor] || '0';
          data = iData >= 0 ? (cols[iData] || '') : '';
        } else {
          const textIdx = cols.findIndex(c => c.length > 5 && isNaN(parseFloat(c.replace(/\./g,'').replace(',','.'))));
          const numIdx  = cols.findIndex((c,j) => j !== textIdx && !isNaN(parseFloat(c.replace(/\./g,'').replace(',','.'))));
          desc = textIdx >= 0 ? cols[textIdx] : cols[0];
          valorStr = numIdx >= 0 ? cols[numIdx] : '0';
        }
        // 4. Número brasileiro: "1.234,56" → remove ponto → troca vírgula → float
        const valor = parseFloat(valorStr.replace(/\./g,'').replace(',','.'));
        if (!desc || isNaN(valor)) continue;
        result.push({ id: i.toString(), descricao: desc.toUpperCase(), valor: Math.abs(valor), valorOriginal: valor, data });
      }
      return result;
    };

    const parseOFX = (texto) => {
      const result = [];
      const blocos = texto.split('<STMTTRN>').slice(1);
      blocos.forEach((bloco, i) => {
        const getTag = (tag) => { const m = bloco.match(new RegExp('<'+tag+'>([^<\\n]+)','i')); return m ? m[1].trim() : ''; };
        const nome = getTag('NAME') || getTag('MEMO');
        const valorStr = getTag('TRNAMT');
        const data = getTag('DTPOSTED');
        const valorBruto = parseFloat(valorStr);
        if (!nome || isNaN(valorBruto)) return;
        // Em OFX, compras aparecem como negativos (saída do banco/cartão).
        // Invertemos o sinal para que compras fiquem positivas,
        // mantendo consistência com o formato CSV.
        const valorOriginal = -valorBruto;
        result.push({ id: i.toString(), descricao: nome.toUpperCase(), valor: Math.abs(valorBruto), valorOriginal, data: data.slice(0,8) });
      });
      return result;
    };

    const processarArquivo = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Tenta UTF-8 primeiro; se produzir caracteres inválidos (latin1/ISO-8859-1), recodifica
        const bytes = new Uint8Array(e.target.result);
        let texto;
        try {
          texto = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch (_) {
          texto = new TextDecoder('iso-8859-1').decode(bytes);
        }
        const ext = file.name.toLowerCase().split('.').pop();
        let rows = [];
        if (['ofx','qfx'].includes(ext) || texto.toUpperCase().includes('<OFX>')) {
          rows = parseOFX(texto);
        } else {
          rows = parseCSV(texto);
        }
        if (rows.length === 0) { alert('Nenhum lan\xE7amento encontrado. Verifique o formato do arquivo.'); return; }
        setLinhas(rows);
        const sel = {}; const parc = {};
        rows.forEach(r => { sel[r.id] = r.valorOriginal > 0; parc[r.id] = 1; });
        setSelecionados(sel); setParcImport(parc); setEtapa(2);
      };
      reader.readAsArrayBuffer(file);
    };

    const confirmarImport = () => {
      linhas.filter(r => selecionados[r.id]).forEach(r => {
        adicionarCompraParcelada({ descricao: r.descricao, cartao: cartaoNome, valorTotal: r.valor, parcelas: parseInt(parcImport[r.id] || 1), mesInicio: mesAtual });
      });
      setModalAberto(null);
    };

    const qtdSel = Object.values(selecionados).filter(Boolean).length;
    const linhasFiltradas = ignorarCreditos ? linhas.filter(r => r.valorOriginal > 0) : linhas;

    if (etapa === 1) return /*#__PURE__*/React.createElement("div", null,
      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.82rem',color:'#64748b',marginBottom:'16px'}}, 'Cart\xE3o: '+cartaoNome),
      /*#__PURE__*/React.createElement("div", {
        onDragOver: e=>{e.preventDefault();setDragging(true);}, onDragLeave:()=>setDragging(false),
        onDrop: e=>{e.preventDefault();setDragging(false);processarArquivo(e.dataTransfer.files[0]);},
        onClick: ()=>document.getElementById('ifatura-input').click(),
        style:{border:'2px dashed '+(dragging?'#0284c7':'#cbd5e1'),borderRadius:'12px',padding:'48px 20px',textAlign:'center',cursor:'pointer',background:dragging?'#eff6ff':'#f8fafc',transition:'all 0.2s'}
      },
        /*#__PURE__*/React.createElement("div",{style:{fontSize:'2.5rem',marginBottom:'10px'}},'\uD83D\uDCC1'),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:'0.95rem',fontWeight:'700',color:C.text,marginBottom:'6px'}},'Arraste o arquivo ou clique para selecionar'),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:'0.75rem',color:'#9ca3af'}},'Aceita CSV, OFX, QFX \u2014 Nubank, Ita\xFA, Bradesco, C6, Inter e mais')
      ),
      /*#__PURE__*/React.createElement("input",{id:'ifatura-input',type:'file',accept:'.csv,.txt,.ofx,.qfx',style:{display:'none'},onChange:e=>processarArquivo(e.target.files[0])})
    );

    return /*#__PURE__*/React.createElement("div", {style:{width:'100%', boxSizing:'border-box'}},
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}},
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("span",{style:{fontWeight:'700',color:C.text}}, linhasFiltradas.length+' lan\xE7amentos encontrados'),
          /*#__PURE__*/React.createElement("span",{style:{fontSize:'0.75rem',color:'#64748b',marginLeft:'8px'}},'('+qtdSel+' selecionados)')
        ),
        /*#__PURE__*/React.createElement("label",{style:{display:'flex',alignItems:'center',gap:'6px',fontSize:'0.78rem',color:'#64748b',cursor:'pointer'}},
          /*#__PURE__*/React.createElement("input",{type:'checkbox',checked:ignorarCreditos,onChange:e=>setIgnorarCreditos(e.target.checked)}),
          'Ocultar cr\xE9ditos/estornos'
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{maxHeight:'300px',overflowY:'auto',border:'1px solid '+C.border,borderRadius:'10px',marginBottom:'14px'}},
        linhasFiltradas.length === 0
          ? /*#__PURE__*/React.createElement("div",{style:{padding:'20px',textAlign:'center',color:'#9ca3af'}},'Nenhum lan\xE7amento a exibir')
          : linhasFiltradas.map(r => /*#__PURE__*/React.createElement("div", {key:r.id,style:{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderBottom:'1px solid #f1f5f9',background:selecionados[r.id]?'#f0f9ff':'#fff'}},
              /*#__PURE__*/React.createElement("input",{type:'checkbox',checked:!!selecionados[r.id],onChange:e=>setSelecionados(prev=>({...prev,[r.id]:e.target.checked})),style:{flexShrink:0}}),
              /*#__PURE__*/React.createElement("div",{style:{flex:1,minWidth:0}},
                /*#__PURE__*/React.createElement("div",{style:{fontSize:'0.8rem',fontWeight:'600',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},r.descricao),
                r.data && /*#__PURE__*/React.createElement("div",{style:{fontSize:'0.65rem',color:'#9ca3af'}},r.data)
              ),
              /*#__PURE__*/React.createElement("span",{style:{fontSize:'0.82rem',fontWeight:'700',color:'#0284c7',flexShrink:0}},'R$ '+r.valor.toFixed(2)),
              /*#__PURE__*/React.createElement("select",{
                value:parcImport[r.id]||1,
                onChange:e=>setParcImport(prev=>({...prev,[r.id]:parseInt(e.target.value)})),
                disabled:!selecionados[r.id],
                style:{padding:'3px 6px',border:'1px solid '+C.border,borderRadius:'6px',fontSize:'0.75rem',background:'#fff',cursor:'pointer'}
              }, [1,2,3,4,5,6,7,8,9,10,11,12,18,24,36,48].map(n=>/*#__PURE__*/React.createElement("option",{key:n,value:n},n===1?'1x (\xE0 vista)':n+'x')))
            ))
      ),
      /*#__PURE__*/React.createElement("div",{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
        /*#__PURE__*/React.createElement("button",{onClick:()=>setEtapa(1),style:{padding:'8px 16px',border:'1px solid '+C.border,borderRadius:'8px',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'0.82rem'}},'\u2190 Voltar'),
        /*#__PURE__*/React.createElement("button",{
          onClick:confirmarImport,disabled:qtdSel===0,
          style:{padding:'8px 20px',border:'none',borderRadius:'8px',background:qtdSel===0?'#cbd5e1':'#0284c7',color:'#fff',cursor:qtdSel===0?'not-allowed':'pointer',fontSize:'0.82rem',fontWeight:'700'}
        },'\u2705 Importar '+qtdSel+(qtdSel===1?' item':' itens'))
      )
    );
  };

  const FormGerenciarCartoes = () => {
    return /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'10px', width:'100%', boxSizing:'border-box'}},
      cartoes.length === 0
        ? /*#__PURE__*/React.createElement("div", {style:{padding:'48px', textAlign:'center', color:'#9ca3af'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'2rem', marginBottom:'8px'}}, '\uD83D\uDCB3'),
            'Nenhum cart\xE3o cadastrado'
          )
        : cartoes.map(c => {
            const lim = c.limite || 0;
            const valAno2 = c.valores?.[anoAtual] || {};
            let usadoG = 0, pagoG = 0;
            ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].forEach(m => {
              const vb = valAno2[m] || 0;
              const vp = calcularParcelasCartao(c.nome, m).reduce((s,p)=>s+p.valorParcela,0);
              usadoG += vb + vp;
              const st = getStatusFarol(c.nome, m);
              if (st==='PAGO') pagoG += vb + vp;
              else if (typeof st==='number') pagoG += st;
            });
            const usadoLiq = Math.max(0, usadoG - pagoG);
            const dispG = lim > 0 ? Math.max(0, lim - usadoLiq) : 0;
            const pctG = lim > 0 ? Math.min(100, usadoLiq/lim*100) : 0;
            return /*#__PURE__*/React.createElement("div", {
              key: c.id,
              style:{background:C.bgMuted, borderRadius:'12px', border:'1px solid '+C.border, padding:'14px 18px'}
            },
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: lim > 0 ? '10px' : '0'}},
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'800', color:C.text}}, c.nome),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}}, 'Fecha dia '+(c.diaFechamento||c.vencimento-7)+' \xB7 Vence dia '+c.vencimento)
                ),
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'6px'}},
                  /*#__PURE__*/React.createElement("button", {
                    onClick: () => {setItemEditando(c);setTipoEditando('cartao');setModalAberto('editar');},
                    style:{padding:'6px 11px', border:'none', borderRadius:'8px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700'}
                  }, '\u270F\uFE0F Editar'),
                  /*#__PURE__*/React.createElement("button", {
                    onClick: () => duplicarCartao(c),
                    style:{padding:'6px 11px', border:'none', borderRadius:'8px', background:'#fff7ed', color:'#f97316', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700'}
                  }, '\uD83D\uDCCB Duplicar'),
                  /*#__PURE__*/React.createElement("button", {
                    onClick: () => deletarCartao(c.id),
                    style:{padding:'6px 11px', border:'none', borderRadius:'8px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700'}
                  }, '\uD83D\uDDD1\uFE0F Excluir')
                )
              ),
              lim > 0
                ? /*#__PURE__*/React.createElement("div", null,
                    /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'#9ca3af', marginBottom:'4px'}},
                      /*#__PURE__*/React.createElement("span", null, 'Limite: R$ '+lim.toLocaleString('pt-BR')),
                      /*#__PURE__*/React.createElement("span", null, 'Dispon\xEDvel: R$ '+dispG.toLocaleString('pt-BR'))
                    ),
                    /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:'#e2e8f0', borderRadius:'3px', overflow:'hidden'}},
                      /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:pctG+'%', background:pctG>80?'#ef4444':pctG>60?'#f59e0b':'#0284c7', borderRadius:'3px', transition:'width .6s'}})
                    )
                  )
                : /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}},
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', color:'#9ca3af'}}, 'Limite n\xE3o definido'),
                    /*#__PURE__*/React.createElement("button", {
                      onClick: () => setInputDialog({titulo:'Definir Limite \u2014 '+c.nome,label:'Limite (R$):',valorPadrao:'10000',callback:v=>{if(v&&!isNaN(v)){const n=cartoes.map(x=>x.id===c.id?{...x,limite:parseFloat(v)}:x);setCartoes(n);lsSet('cartoes',n);}}}),
                      style:{fontSize:'0.72rem', padding:'4px 10px', border:'none', borderRadius:'7px', background:'#0284c7', color:'#fff', cursor:'pointer', fontWeight:'600'}
                    }, '+ Definir Limite')
                  )
            );
          })
    );
  };

  const TelaCartoes = () => {
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesNome  = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'};
    const dataAtual = new Date();
    const mesAtualSistema = mesesOrdem[dataAtual.getMonth()];
    const anoAtualSistema = dataAtual.getFullYear();
    const estamosNoMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
    const hoje = estamosNoMesAtual ? dataAtual.getDate() : -1;

    // cartaoSelId / setCartaoSelId vêm do App level (sobrevivem troca de mês)
    const [valorFaturaEdit, setValorFaturaEdit] = React.useState('');

    React.useEffect(() => {
      if (cartoes.length > 0 && (!cartaoSelId || !cartoes.find(c => c.id === cartaoSelId))) {
        setCartaoSelId(cartoes[0].id);
      } else if (cartoes.length === 0) {
        setCartaoSelId(null);
      }
    }, [cartoes.length, cartaoSelId]);

    const totaisPorCartao = {};
    let totalGeralMes = 0;
    let totalDivida = 0;
    cartoes.forEach(c => {
      const valoresAno = c.valores?.[anoAtual] || {};
      const valorBase = valoresAno[mesAtual] || 0;
      const parc = calcularParcelasCartao(c.nome, mesAtual);
      const valorParc = parc.reduce((s,p) => s + p.valorParcela, 0);
      const total = valorBase + valorParc;
      totaisPorCartao[c.nome] = { total, valorBase, valorParc, parcelas: parc };
      totalGeralMes += total;
      mesesOrdem.forEach(mes => {
        const vb = valoresAno[mes] || 0;
        const vp = calcularParcelasCartao(c.nome, mes).reduce((s,p) => s + p.valorParcela, 0);
        const tot = vb + vp;
        const st = getStatusFarol(c.nome, mes);
        if (st !== 'PAGO' && typeof st !== 'number') totalDivida += tot;
        else if (typeof st === 'number') totalDivida += Math.max(0, tot - st);
      });
    });

    const cartao = cartoes.find(c => c.id === cartaoSelId) || null;
    let valorBase = 0, parcelas = [], valorParc = 0, valorTotalFat = 0;
    let limite = 0, usado = 0, disponivel = 0, pctLimite = 0;
    let fech = 0, statusFat = 'ABERTA', corStatus = {bg:'#dbeafe',txt:'#1e40af'};
    const stFarol = cartao ? getStatusFarol(cartao.nome, mesAtual) : 'PENDENTE';
    const isPago = stFarol === 'PAGO';

    if (cartao) {
      const valoresAno = cartao.valores?.[anoAtual] || {};
      valorBase = valoresAno[mesAtual] || 0;
      parcelas = calcularParcelasCartao(cartao.nome, mesAtual);
      valorParc = parcelas.reduce((s,p) => s + p.valorParcela, 0);
      valorTotalFat = valorBase + valorParc;
      limite = cartao.limite || 0;
      fech = cartao.diaFechamento || cartao.vencimento - 7;
      statusFat = hoje <= fech ? 'ABERTA' : hoje <= cartao.vencimento ? 'FECHADA' : 'VENCIDA';
      corStatus = statusFat==='ABERTA'?{bg:'#dbeafe',txt:'#1e40af'}:statusFat==='FECHADA'?{bg:'#d1fae5',txt:'#065f46'}:{bg:'#fecdd3',txt:'#be123c'};
      let totalUsado = 0, totalPago = 0;
      mesesOrdem.forEach(mes => {
        const vb = valoresAno[mes] || 0;
        const vp = calcularParcelasCartao(cartao.nome, mes).reduce((s,p) => s + p.valorParcela, 0);
        totalUsado += vb + vp;
        const st = getStatusFarol(cartao.nome, mes);
        if (st === 'PAGO') totalPago += vb + vp;
        else if (typeof st === 'number') totalPago += st;
      });
      usado = Math.max(0, totalUsado - totalPago);
      disponivel = limite > 0 ? Math.max(0, limite - usado) : 0;
      pctLimite = limite > 0 ? Math.min(100, usado/limite*100) : 0;
    }

    // Sincroniza o input local apenas quando trocar de cartão (não de mês)
    React.useEffect(() => {
      setValorFaturaEdit(valorBase > 0 ? String(valorBase) : '');
    }, [cartaoSelId]);

    const _isMob = window.innerWidth <= 768;
    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns: _isMob ? '1fr' : '280px 1fr', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden', display:'flex', flexDirection:'column', minWidth:0}},
        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 18px', background:'#0369a1', color:'#fff'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', opacity:0.6, marginBottom:'6px'}}, 'CART\xD5ES \xB7 '+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.7rem', fontWeight:'900', lineHeight:1, marginBottom:'8px'}}, 'R$ '+totalGeralMes.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', opacity:0.8}},
            /*#__PURE__*/React.createElement("span", null, cartoes.length+' cart\xE3o'+(cartoes.length!==1?'es':'')),
            totalDivida > 0 && /*#__PURE__*/React.createElement("span", {style:{color:'#fca5a5'}}, 'D\xEDvida: R$ '+totalDivida.toFixed(0))
          )
        ),
        /*#__PURE__*/React.createElement("div", {style:{flex:1, overflowY:'auto', padding:'8px'}},
          cartoes.length === 0
            ? /*#__PURE__*/React.createElement("div", {style:{padding:'24px 12px', textAlign:'center', color:C.textFaint, fontSize:'0.8rem'}}, 'Nenhum cart\xE3o ainda')
            : cartoes.map(c => {
                const info = totaisPorCartao[c.nome] || {total:0};
                const st = getStatusFarol(c.nome, mesAtual);
                const pg = st === 'PAGO';
                const sel = c.id === cartaoSelId;
                const fch = c.diaFechamento || c.vencimento - 7;
                const hj = estamosNoMesAtual ? dataAtual.getDate() : -1;
                const sfat = hj <= fch ? 'ABERTA' : hj <= c.vencimento ? 'FECHADA' : 'VENCIDA';
                const cor = pg ? '#059669' : sfat==='VENCIDA' ? '#e11d48' : '#0284c7';
                return /*#__PURE__*/React.createElement("div", {
                  key: c.id,
                  onClick: () => setCartaoSelId(c.id),
                  style:{padding:'10px 12px', borderRadius:'10px', cursor:'pointer', marginBottom:'4px', transition:'all 0.15s',
                    background: sel ? 'rgba(2,132,199,0.08)' : 'transparent',
                    border: sel ? '1px solid rgba(2,132,199,0.2)' : '1px solid transparent',
                    borderLeft: '3px solid '+(sel ? cor : 'transparent')}
                },
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3px'}},
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem', fontWeight:'700', color: sel ? cor : C.text}}, c.nome),
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', fontWeight:'800', color: cor}}, 'R$ '+info.total.toFixed(0))
                  ),
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.65rem', color:C.textFaint}}, 'Vence dia '+c.vencimento),
                    /*#__PURE__*/React.createElement("span", {style:{padding:'1px 7px', borderRadius:'8px', fontSize:'0.6rem', fontWeight:'700', background: pg?'#dcfce7':sfat==='VENCIDA'?'#fecdd3':'#dbeafe', color: pg?'#15803d':sfat==='VENCIDA'?'#be123c':'#1e40af'}}, pg?'PAGO':sfat)
                  )
                );
              })
        ),
        /*#__PURE__*/React.createElement("div", {style:{padding:'8px', borderTop:'1px solid '+C.borderLight, display:'flex', flexDirection:'column', gap:'4px'}},
          /*#__PURE__*/React.createElement("button", {
            onClick: () => setModalAberto('novoCartao'),
            style:{width:'100%', padding:'10px', border:'none', borderRadius:'10px', background:'#0284c7', color:'#fff', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer', boxShadow:'0 2px 8px rgba(2,132,199,0.3)'}
          }, '+ Novo Cart\xE3o'),
          /*#__PURE__*/React.createElement("button", {
            onClick: () => setModalAberto('gerenciarCartoes'),
            style:{width:'100%', padding:'9px', border:'1.5px solid #e2e8f0', borderRadius:'10px', background:'transparent', color:C.textFaint, fontSize:'0.8rem', fontWeight:'700', cursor:'pointer', transition:'all 0.15s'}
          }, '\u2699\uFE0F Gerenciar Cart\xF5es')
        )
      ),

      !cartao
        ? /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, padding:'80px 20px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', minWidth:0}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, '\uD83D\uDCB3'),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem', fontWeight:'700', color:C.textFaint, marginBottom:'8px'}}, 'Nenhum cart\xE3o cadastrado'),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.82rem', color:C.textFaint, marginBottom:'20px'}}, 'Crie seu primeiro cart\xE3o de cr\xE9dito para come\xE7ar'),
            /*#__PURE__*/React.createElement("button", {
              onClick: () => setModalAberto('novoCartao'),
              style:{padding:'11px 28px', border:'none', borderRadius:'10px', background:'#0284c7', color:'#fff', fontSize:'0.85rem', fontWeight:'700', cursor:'pointer'}
            }, '+ Adicionar Primeiro Cart\xE3o')
          )
        : /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'16px', minWidth:0, overflow:'hidden'}},

            /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', padding:'22px 24px'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', flexWrap:'wrap', gap:'8px'}},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.35rem', fontWeight:'900', color:C.text}}, cartao.nome),
                  /*#__PURE__*/React.createElement("span", {style:{padding:'3px 10px', borderRadius:'12px', fontSize:'0.65rem', fontWeight:'700', background:corStatus.bg, color:corStatus.txt}}, statusFat)
                ),
                /*#__PURE__*/React.createElement("button", {
                  onClick: () => toggleFarol(cartao.nome, mesAtual),
                  style:{padding:'7px 18px', border:'none', borderRadius:'9px', cursor:'pointer', fontSize:'0.8rem', fontWeight:'700',
                    background: isPago ? '#dcfce7' : '#fef9c3', color: isPago ? '#15803d' : '#92400e',
                    boxShadow: isPago ? '0 1px 4px rgba(5,150,105,0.2)' : '0 1px 4px rgba(146,64,14,0.15)'}
                }, isPago ? '\u2713 Pago' : '\u25CB Marcar Pago')
              ),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'16px', fontSize:'0.72rem', color:C.textFaint, marginBottom:'18px'}},
                /*#__PURE__*/React.createElement("span", null, 'Fecha dia '+fech),
                /*#__PURE__*/React.createElement("span", null, '\u00B7'),
                /*#__PURE__*/React.createElement("span", null, 'Vence dia '+cartao.vencimento)
              ),
              /*#__PURE__*/React.createElement("div", {style:{borderTop:'1px solid '+C.borderLight, marginBottom:'18px'}}),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px', width:'100%'}},
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.62rem', fontWeight:'700', letterSpacing:'0.8px', textTransform:'uppercase', color:C.textFaint, marginBottom:'7px'}}, 'Outras cobran\xE7as (R$)'),
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
                    /*#__PURE__*/React.createElement("input", {
                      type:'number', step:'0.01', value:valorFaturaEdit,
                      onChange: e => setValorFaturaEdit(e.target.value),
                      onBlur: e => cartao && editarValorCartao(cartao.id, mesAtual, e.target.value),
                      onKeyDown: e => { if (e.key === 'Enter' && cartao) { editarValorCartao(cartao.id, mesAtual, valorFaturaEdit); e.target.blur(); } },
                      placeholder:'0,00',
                      style:{width: window.innerWidth <= 768 ? '100%' : '150px', padding:'9px 13px', border:'2px solid '+C.border, borderRadius:'10px', fontSize:'0.95rem', textAlign:'right', outline:'none', color:C.text, background:C.bgAlt||C.bg, fontWeight:'600'}
                    }),
                    valorParc > 0 && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', color:C.textFaint}}, '+ R$ '+valorParc.toFixed(0)+' em parcelas')
                  )
                ),
                /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.62rem', fontWeight:'700', letterSpacing:'0.8px', textTransform:'uppercase', color:C.textFaint, marginBottom:'5px'}}, 'Total da Fatura'),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'2.4rem', fontWeight:'900', color:'#0284c7', lineHeight:1}}, 'R$ '+valorTotalFat.toFixed(2)),
                  parcelas.length > 0 && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#64748b', marginTop:'4px'}}, parcelas.length+' compra'+(parcelas.length!==1?'s':'')+' rastreada'+(parcelas.length!==1?'s':''))
                )
              )
            ),

            /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
              /*#__PURE__*/React.createElement("div", {style:{padding:'12px 16px', borderBottom:'1px solid '+C.borderLight, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f0fdf4', flexWrap:'wrap', gap:'8px'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint}}, '\uD83D\uDECD\uFE0F Extrato \u2014 '+mesAtual.toUpperCase()),
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'6px'}},
                  /*#__PURE__*/React.createElement("button", {
                    onClick: () => { setCartaoParaNovaCompra(cartao.nome); setModalAberto('compraParcelada'); },
                    style:{padding:'6px 13px', border:'none', borderRadius:'8px', background:'#0284c7', color:'#fff', cursor:'pointer', fontSize:'0.75rem', fontWeight:'700', boxShadow:'0 1px 4px rgba(2,132,199,0.3)'}
                  }, '+ Compra'),
                  /*#__PURE__*/React.createElement("button", {
                    onClick: () => { setCartaoImport(cartao); setModalAberto('importarFatura'); },
                    style:{padding:'6px 13px', border:'1px solid #bbf7d0', borderRadius:'8px', background:'#f0fdf4', color:'#15803d', cursor:'pointer', fontSize:'0.75rem', fontWeight:'700'}
                  }, '\u2B06 Importar')
                )
              ),
              /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px'}},
                parcelas.length === 0
                  ? /*#__PURE__*/React.createElement("div", {style:{padding:'32px 16px', textAlign:'center'}},
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'2rem', marginBottom:'10px'}}, '\uD83D\uDECD\uFE0F'),
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', color:C.textFaint, marginBottom:'16px'}}, 'Nenhuma compra registrada em '+mesAtual),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'8px', justifyContent:'center'}},
                        /*#__PURE__*/React.createElement("button", {
                          onClick: () => { setCartaoParaNovaCompra(cartao.nome); setModalAberto('compraParcelada'); },
                          style:{padding:'8px 18px', border:'none', borderRadius:'9px', background:'#0284c7', color:'#fff', cursor:'pointer', fontSize:'0.8rem', fontWeight:'700'}
                        }, '+ Adicionar Compra'),
                        /*#__PURE__*/React.createElement("button", {
                          onClick: () => { setCartaoImport(cartao); setModalAberto('importarFatura'); },
                          style:{padding:'8px 18px', border:'1px solid #bbf7d0', borderRadius:'9px', background:'#f0fdf4', color:'#15803d', cursor:'pointer', fontSize:'0.8rem', fontWeight:'700'}
                        }, '\u2B06 Importar Fatura')
                      )
                    )
                  : /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'6px'}},
                      ...parcelas.map((p, i) => {
                        const badge = (!p.totalParcelas || p.totalParcelas <= 1) ? '\xC0 vista' : 'Parcela '+(p.parcelaAtual||1)+' de '+p.totalParcelas;
                        return /*#__PURE__*/React.createElement("div", {key:i, style:{display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', background:C.bgMuted, borderRadius:'10px', border:'1px solid '+C.border}},
                          /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'700', color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}, p.descricao),
                            /*#__PURE__*/React.createElement("span", {style:{display:'inline-block', padding:'2px 8px', borderRadius:'10px', fontSize:'0.62rem', fontWeight:'700', background: p.totalParcelas<=1?'#f0fdf4':'#eff6ff', color: p.totalParcelas<=1?'#15803d':'#1d4ed8', marginTop:'3px'}}, badge)
                          ),
                          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.92rem', fontWeight:'800', color:'#0284c7', flexShrink:0}}, 'R$ '+p.valorParcela.toFixed(2)),
                          /*#__PURE__*/React.createElement("button", {
                            onClick: () => excluirCompraParcelada(p.id),
                            style:{width:'26px', height:'26px', border:'none', borderRadius:'6px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.75rem', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700'}
                          }, '\u2715')
                        );
                      })
                    )
              )
            ),

            /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
              /*#__PURE__*/React.createElement("div", {style:{padding:'14px 20px', borderBottom:'1px solid '+C.borderLight, background:C.bgMuted, display:'flex', justifyContent:'space-between', alignItems:'center'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint}}, '\uD83D\uDCC5 Proje\xE7\xE3o \u2014 Pr\xF3ximos 6 Meses'),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:C.textFaint}}, 'base + parcelas')
              ),
              /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px'}},
                /*#__PURE__*/React.createElement("div", {style:{overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'6px'}}, /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'8px', minWidth:'440px'}},
                  ...(()=>{
                    const ordemM = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
                    const nomesM = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'};
                    const idxAtual = ordemM.indexOf(mesAtual);
                    const meses6 = Array.from({length:6}, (_,i) => ordemM[(idxAtual+i)%12]);
                    const dados6 = meses6.map(m => {
                      const base = cartao.valores?.[anoAtual]?.[m] || 0;
                      const parcs = calcularParcelasCartao(cartao.nome, m);
                      const totalParc = parcs.reduce((s,p)=>s+p.valorParcela, 0);
                      return { mes:m, nome:nomesM[m], base, qtdParc:parcs.length, total:base+totalParc };
                    });
                    const maxTotal = Math.max(...dados6.map(t=>t.total), 1);
                    return dados6.map((t,i) => {
                      const isCurrent = i===0;
                      const pct = Math.max(3, Math.round(t.total/maxTotal*100));
                      const corBar = isCurrent ? '#3b82f6' : t.total===0 ? '#e2e8f0' : '#94a3b8';
                      return /*#__PURE__*/React.createElement("div", {key:i,
                        onClick: () => setMesAtual(t.mes),
                        title: 'Ver ' + t.nome,
                        style:{textAlign:'center', padding:'10px 6px', borderRadius:'10px',
                          cursor: 'pointer',
                          background: isCurrent?'#eff6ff':'#f8fafc',
                          border:'1px solid '+(isCurrent?'#bfdbfe':C.border),
                          transition:'box-shadow .15s, transform .15s'}
                      },
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'0.5px', textTransform:'uppercase', color: isCurrent?'#2563eb':C.textFaint, marginBottom:'8px'}}, t.nome),
                        /*#__PURE__*/React.createElement("div", {style:{height:'48px', display:'flex', alignItems:'flex-end', justifyContent:'center', marginBottom:'6px'}},
                          /*#__PURE__*/React.createElement("div", {style:{width:'80%', height:pct+'%', minHeight:'3px', background:corBar, borderRadius:'3px 3px 0 0', transition:'height .5s ease'}})
                        ),
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', fontWeight:'900', color: isCurrent?'#1d4ed8':C.text, lineHeight:1}},
                          t.total > 0 ? 'R$\u00A0'+t.total.toLocaleString('pt-BR',{minimumFractionDigits:0}) : '\u2014'
                        ),
                        t.qtdParc > 0 && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.56rem', color:C.textFaint, marginTop:'3px'}},
                          t.qtdParc+' compra'+(t.qtdParc!==1?'s':'')
                        )
                      );
                    });
                  })()
                ))
              )
            ),

            // ── Feature D: Progresso de Todas as Compras Parceladas ─────────────
            (function(){
              if(comprasParceladas.length===0)return null;
              var todasParc=comprasParceladas.slice().sort(function(a,b){
                var ai=a.meses?a.meses.indexOf(mesAtual):-1;
                var bi=b.meses?b.meses.indexOf(mesAtual):-1;
                var aPct=a.totalParcelas>0?(ai>=0?ai+1:a.totalParcelas)/a.totalParcelas:1;
                var bPct=b.totalParcelas>0?(bi>=0?bi+1:b.totalParcelas)/b.totalParcelas:1;
                return bPct-aPct;
              });
              var impactoMes=comprasParceladas.filter(function(p){return p.meses&&p.meses.includes(mesAtual);}).reduce(function(s,p){return s+(p.valorParcela||0);},0);
              return React.createElement('div',{style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
                React.createElement('div',{style:{padding:'12px 16px',borderBottom:'1px solid '+C.borderLight,display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f5f3ff'}},
                  React.createElement('div',{style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.2px',textTransform:'uppercase',color:C.textFaint}},'📊 Progresso — Compras Parceladas'),
                  impactoMes>0&&React.createElement('div',{style:{fontSize:'0.68rem',fontWeight:'700',color:'#f97316'}},'R$ '+impactoMes.toFixed(2)+'/mês')
                ),
                React.createElement('div',{style:{padding:'12px 16px',display:'flex',flexDirection:'column',gap:'8px'}},
                  todasParc.map(function(p,i){
                    var mesIdx=p.meses?p.meses.indexOf(mesAtual):-1;
                    var numAtual=mesIdx>=0?mesIdx+1:p.totalParcelas||1;
                    var total=p.totalParcelas||1;
                    var pct=total>0?numAtual/total:1;
                    var restantes=Math.max(0,total-numAtual);
                    var ativa=mesIdx>=0;
                    var cor=pct>=0.85?'#10b981':pct>=0.5?'#f97316':'#f59e0b';
                    return React.createElement('div',{key:p.id||i,style:{padding:'10px 12px',borderRadius:'10px',background:ativa?(darkMode?'rgba(249,115,22,0.08)':'#f5f3ff'):(darkMode?'rgba(255,255,255,0.03)':'#f8fafc'),border:'1px solid '+(ativa?'rgba(249,115,22,0.2)':C.border)}},
                      React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}},
                        React.createElement('div',{style:{flex:1,minWidth:0}},
                          React.createElement('div',{style:{fontSize:'0.78rem',fontWeight:'700',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},p.descricao),
                          React.createElement('div',{style:{fontSize:'0.62rem',color:C.textFaint,marginTop:'1px'}},
                            p.cartao+(total>1?' · '+numAtual+'/'+total+' parcelas'+(restantes>0?' · '+restantes+' restante'+(restantes!==1?'s':''):''):'  · À vista')+(ativa?' · ✅ este mês':'')
                          )
                        ),
                        React.createElement('div',{style:{textAlign:'right',flexShrink:0,marginLeft:'8px'}},
                          React.createElement('div',{style:{fontSize:'0.82rem',fontWeight:'800',color:'#0284c7'}},'R$ '+p.valorParcela.toFixed(2)),
                          total>1&&React.createElement('div',{style:{fontSize:'0.58rem',color:C.textFaint,marginTop:'1px'}},(pct*100).toFixed(0)+'% concluído')
                        )
                      ),
                      total>1&&React.createElement('div',{style:{height:'5px',background:C.bgTable,borderRadius:'3px',overflow:'hidden'}},
                        React.createElement('div',{style:{height:'100%',width:(pct*100).toFixed(1)+'%',background:cor,borderRadius:'3px',transition:'width .6s ease'}})
                      )
                    );
                  })
                )
              );
            })()
          )
    );
  };

  const TelaGastosFixos = () => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const [busca, setBusca] = useState('');
    const [valoresEditFixos, setValoresEditFixos] = useState({});

    // CORREÇÃO: Verificar se estamos no mês atual
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const dataAtual = new Date();
    const mesAtualSistema = mesesOrdem[dataAtual.getMonth()];
    const anoAtualSistema = dataAtual.getFullYear();
    const estamosNoMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;

    const gastosDoMes = gastosFixos.filter(g => {
      if (g.mes && g.ano) return g.mes === mesAtual && g.ano === anoAtual;
      return true;
    });
    const categorias = ['TODAS', ...new Set(gastosDoMes.map(g => g.categoria))];
    const totaisPorCat = {};
    gastosDoMes.forEach(g => { totaisPorCat[g.categoria] = (totaisPorCat[g.categoria]||0) + g.valor; });
    const totalGeral = gastosDoMes.reduce((s,g) => s+g.valor, 0);
    const gastosDoMesCatFix = categoriaFiltro==='TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria===categoriaFiltro);
    const gastosFiltrados = !busca ? gastosDoMesCatFix : gastosDoMesCatFix.filter(g => g.descricao && g.descricao.toLowerCase().includes(busca.toLowerCase()));
    const totalFiltrado = gastosFiltrados.reduce((s,g) => s+g.valor, 0);

    // Agrupar por vencimento
    const porDia = {};
    gastosFiltrados.forEach(g => {
      const dia = g.vencimento || 1;
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(g);
    });
    const diasOrdenados = sortGF === 'venc-desc'
      ? Object.keys(porDia).sort((a,b) => parseInt(b)-parseInt(a))
      : Object.keys(porDia).sort((a,b) => parseInt(a)-parseInt(b));
    const hoje = estamosNoMesAtual ? dataAtual.getDate() : -1;

    const _isMobGF = window.innerWidth <= 768;
    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns: _isMobGF ? '1fr' : '200px 1fr', gap:'16px', alignItems:'start'}},

      // COLUNA ESQUERDA — totais + filtro
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},

        // Hero total
        /*#__PURE__*/React.createElement("div", {style:{background:'#f97316', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(249,115,22,0.35)', border:'1px solid rgba(255,255,255,0.1)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, "\uD83C\uDFE0 FIXOS \xB7 "+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.9rem', fontWeight:'900', marginBottom:'4px', lineHeight:1}}, "R$ "+totalGeral.toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', opacity:0.65}}, gastosDoMes.length+" gasto"+(gastosDoMes.length!==1?"s":"")+" fixo"+(gastosDoMes.length!==1?"s":""))
        ),

        // % do total de despesas
        totais.total>0 && /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'8px'}}, "\uD83D\uDCCA Do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#f97316', marginBottom:'6px'}}, (totalGeral/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:C.bgTable, borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalGeral/totais.total*100)+'%', background:'#f97316', borderRadius:'3px', transition:'width .6s ease'}})
          )
        ),

        // Filtro por categoria
        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83C\uDFF7\uFE0F Categorias"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'5px'}},
            ...categorias.map(cat =>
              /*#__PURE__*/React.createElement("button", {
                key:cat,
                onClick:()=>setCategoriaFiltro(cat),
                style:{
                  width:'100%', padding:'7px 10px', border:'none', borderRadius:'8px', cursor:'pointer',
                  textAlign:'left', fontSize:'0.75rem', fontWeight:'600',
                  background: categoriaFiltro===cat?'#fff7ed':'transparent',
                  color:       categoriaFiltro===cat?'#f97316':'#6b7280',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }
              },
                /*#__PURE__*/React.createElement("span", null, cat==='TODAS'?'Todas':cat),
                cat!=='TODAS' && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.7rem', fontWeight:'700', color:categoriaFiltro===cat?'#f97316':'#9ca3af'}},
                  "R$ "+(totaisPorCat[cat]||0).toFixed(0)
                )
              )
            )
          )
        ),

        // Botões de ação
        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('novoGastoFixo'), style:{width:'100%', padding:'12px', border:'none', borderRadius:'12px', background:'#f97316', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(124,58,237,0.35)'}}, "\u2795 Nova Conta Fixa"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('gerenciarCategorias'), style:{width:'100%', padding:'10px', border:'2px solid '+C.border, borderRadius:'12px', background:C.bg, color:C.textMuted, fontSize:'0.78rem', fontWeight:'600', cursor:'pointer'}}, "\uD83C\uDFF7\uFE0F Gerenciar Categorias")
      ),

      // COLUNA DIREITA — lista por vencimento
      /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},

        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid '+C.borderLight, display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:C.text}}, categoriaFiltro==='TODAS'?"Todas as Contas Fixas":"Contas Fixas \xB7 "+categoriaFiltro),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}}, gastosFiltrados.length+" item"+(gastosFiltrados.length!==1?"s":"")+" \xB7 ordenados por vencimento")
          ),
          /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.1rem', color:'#f97316'}}, "R$ "+totalFiltrado.toFixed(2))
        ),

        gastosFiltrados.length===0
          ? /*#__PURE__*/React.createElement("div", {style:{padding:'50px 20px', textAlign:'center'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'72px', height:'72px', borderRadius:'20px', background:darkMode?'#1e293b':'#f1f5f9', fontSize:'2.5rem', marginBottom:'16px'}}, "\uD83C\uDFE0"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'800', color:C.text, marginBottom:'6px'}}, "Nenhuma conta fixa"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:C.textFaint, marginBottom:'20px'}}, "Adicione suas contas fixas mensais como aluguel, internet e assinaturas"),
              /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('novoGastoFixo'), style:{padding:'9px 22px', border:'none', borderRadius:'10px', background:'#f97316', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer'}}, "\u2795 Adicionar")
            )
          : /*#__PURE__*/React.createElement("div", {style:{maxHeight:'580px', overflowY:'auto'}},
              /*#__PURE__*/React.createElement('div', {style:{display:'flex',gap:'6px',marginBottom:'8px',alignItems:'center',flexWrap:'wrap',padding:'0 2px'}},
                /*#__PURE__*/React.createElement('span', {style:{fontSize:'0.7rem',color:C.textFaint}}, 'Ordenar:'),
                /*#__PURE__*/React.createElement('button', {
                  onClick:()=>setSortGF(s=>s==='venc-asc'?'venc-desc':'venc-asc'),
                  style:{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:'700',
                    background:'#f97316',color:'#fff'}
                }, sortGF==='venc-asc'?'📅 Vencimento ↑':'📅 Vencimento ↓')
              ),
              ...diasOrdenados.map(dia => {
                const gastosDia = porDia[dia];
                const totalDia = gastosDia.reduce((s,g)=>s+g.valor,0);
                const isHoje = parseInt(dia)===hoje;
                const dataObj = new Date(new Date().getFullYear(), new Date().getMonth(), parseInt(dia));
                const diaSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','S\xE1b'][dataObj.getDay()];
                return /*#__PURE__*/React.createElement("div", {key:dia},
                  // Cabeçalho do dia
                  /*#__PURE__*/React.createElement("div", {
                    style:{
                      display:'flex', alignItems:'center', gap:'12px', padding:'10px 20px',
                      background: isHoje?'#fff7ed':'#f9fafb',
                      borderBottom:'1px solid '+C.borderLight
                    }
                  },
                    /*#__PURE__*/React.createElement("div", {style:{width:'48px', textAlign:'center', flexShrink:0}},
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'700', color: isHoje?'#7c3aed':'#9ca3af', textTransform:'uppercase'}}, diaSemana),
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color: isHoje?'#f97316':'#374151', lineHeight:1.1}}, dia),
                      isHoje && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.55rem', fontWeight:'800', color:'#f97316', textTransform:'uppercase'}}, "Hoje")
                    ),
                    /*#__PURE__*/React.createElement("div", {style:{flex:1}}),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', fontWeight:'700', color: isHoje?'#f97316':'#6b7280'}},
                      "R$ "+totalDia.toFixed(2)+" \xB7 "+gastosDia.length+" item"+(gastosDia.length!==1?"s":"")
                    )
                  ),
                  // Itens do dia
                  ...gastosDia.map((gasto,idx) =>
                    /*#__PURE__*/React.createElement("div", {
                      key:gasto.id,
                      style:{
                        display:'flex', alignItems:'center', gap:'12px', padding:'11px 20px 11px 32px',
                        borderBottom: idx<gastosDia.length-1?'1px solid #f9fafb':'none',
                        transition:'background .15s'
                      },
                      onMouseEnter:e=>{e.currentTarget.style.background='#fafafa'},
                      onMouseLeave:e=>{e.currentTarget.style.background='transparent'}
                    },
                      /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                        /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'8px'}},
                          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.82rem', fontWeight:'700', color:C.text}}, gasto.descricao),
                          gasto.temporario && gasto.totalParcelas && /*#__PURE__*/React.createElement("span", {style:{padding:'2px 8px', borderRadius:'20px', background:'#fff7ed', color:'#f97316', fontSize:'0.65rem', fontWeight:'700'}}, (gasto.parcelaAtual||1)+"/"+gasto.totalParcelas)
                        ),
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:C.textFaint, marginTop:'2px'}}, gasto.categoria)
                      ),
                      /*#__PURE__*/React.createElement("input", {
                        type:"number", step:"0.01",
                        value: valoresEditFixos[gasto.id] !== undefined ? valoresEditFixos[gasto.id] : gasto.valor,
                        onChange: e => setValoresEditFixos({...valoresEditFixos, [gasto.id]: e.target.value}),
                        onBlur: e => { editarValorGastoFixo(gasto.id, e.target.value); setValoresEditFixos(v => { const n={...v}; delete n[gasto.id]; return n; }); },
                        onKeyDown: e => { if (e.key==='Enter') { editarValorGastoFixo(gasto.id, valoresEditFixos[gasto.id] ?? gasto.valor); e.target.blur(); } },
                        style:{width:'88px', padding:'5px 8px', border:'2px solid '+C.border, borderRadius:'8px', fontSize:'0.82rem', fontWeight:'700', textAlign:'right', outline:'none'}
                      }),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px'}},
                        /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(gasto);setTipoEditando('fixo');setModalAberto('editar');}, style:{width:_isMobGF?'36px':'28px', height:_isMobGF?'36px':'28px', border:'none', borderRadius:'7px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\u270F\uFE0F"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarGastoFixo(gasto), style:{width:_isMobGF?'36px':'28px', height:_isMobGF?'36px':'28px', border:'none', borderRadius:'7px', background:'#fff7ed', color:'#f97316', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDCCB"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>deletarGastoFixo(gasto.id), style:{width:_isMobGF?'36px':'28px', height:_isMobGF?'36px':'28px', border:'none', borderRadius:'7px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDDD1\uFE0F")
                      )
                    )
                  )
                );
              })
            ),

        gastosFiltrados.length>1 && /*#__PURE__*/React.createElement("div", {style:{padding:'12px 20px', borderTop:'2px solid '+C.border, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bgMuted}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:C.textMuted}}, "Total \xB7 "+gastosFiltrados.length+" gastos"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#f97316'}}, "R$ "+totalFiltrado.toFixed(2))
        )
      )
    );
  };


  const FormImportarCSV = () => {
    const [etapa, setEtapa] = React.useState(1);
    const [linhas, setLinhas] = React.useState([]);
    const [selecionados, setSelecionados] = React.useState({});
    const [inverterValor, setInverterValor] = React.useState(false);
    const [ignorarCreditos, setIgnorarCreditos] = React.useState(true);
    const [bancoDetectado, setBancoDetectado] = React.useState('');
    const [erroArquivo, setErroArquivo] = React.useState('');
    const [dragging, setDragging] = React.useState(false);
    const [catRows, setCatRows] = React.useState({});

    const todasCatImport = [...CATEGORIAS_GASTOS, ...(categoriasPersonalizadas.gastosVariaveis||[]).filter(function(c){ return !CATEGORIAS_GASTOS.includes(c); })];

    function detectarCategoria(desc) {
      const d = desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (/posto|combusti|gasolina|petrob|shell|ipiran|br distrib|etanol|ale combusti/.test(d)) return 'GASOLINA';
      if (/mercado|supermercado|hortifruti|feira|atacadao|assai|mix mateus|pantanal|atacarejo|verdureiro|frutaria|alimentos/.test(d)) return 'MERCADO';
      if (/farmac|drogari|ultrafarma|pacheco|nissei|droga/.test(d)) return 'FARMÁCIA';
      if (/hospital|clinica|medic|dentist|saude|laborat|exame|plano de saude|unimed|amil|hapvida/.test(d)) return 'SAÚDE';
      if (/academia|gym|fitness|crossfit|smartfit/.test(d)) return 'ACADEMIA';
      if (/salao|barbearia|estetica|manicure|beleza|cabeler/.test(d)) return 'BELEZA';
      if (/uber|99app|99 pop|cabify|taxi|onibus|metro|passagem|brt|rodoviaria|conducao|estacion/.test(d)) return 'TRANSPORTE';
      if (/restaur|lanchonet|ifood|delivery|pizza|burguer|mcdonalds|subway|padaria|acougue|cafe|bistro|sushi|churrasco|alimenta|jim\.com|sauvass|refeicao|lanche/.test(d)) return 'ALIMENTAÇÃO';
      if (/\bpet\b|petshop|pet shop|veterina|racao|cobasi|petz|agropec/.test(d)) return 'PET';
      if (/amazon|shopee|aliexpress|magalu|americanas|submarino|mercado livre|shein/.test(d)) return 'COMPRAS ONLINE';
      if (/lwsa|sistemaq|assinatura|mensalidade|plano |software|cobranca/.test(d)) return 'SERVIÇOS';
      if (/netflix|spotify|cinema|teatro|lazer|clube|parque|show|amazon prime|disney|hbo|\bgames?\b|steam|playstation/.test(d)) return 'LAZER';
      if (/escola|faculdade|curso|universidade|educac|livro|apostila|material escolar/.test(d)) return 'EDUCAÇÃO';
      if (/condomin|iptu/.test(d)) return 'CONDOMÍNIO';
      if (/agua |luz |energia|gas encana|neoenergia|copel|cemig|sabesp/.test(d)) return 'ÁGUA/LUZ/GÁS';
      if (/internet|telefone|tim |claro |vivo |oi |net /.test(d)) return 'INTERNET/TELEFONE';
      if (/aluguel/.test(d)) return 'MORADIA';
      if (/roupa|vestuario|calcado|moda|zara|renner|c&a|riachuelo|hering|camiseta|calca|vestido/.test(d)) return 'VESTUÁRIO';
      if (/celular|notebook|computador|tablet|iphone|samsung|apple|tecno|eletronico/.test(d)) return 'TECNOLOGIA';
      if (/reform|obra|pintura|construc/.test(d)) return 'REFORMA';
      if (/manutenc|conserto|reparo|tecnico/.test(d)) return 'MANUTENÇÃO';
      return 'OUTROS';
    }

    function parsearData(str) {
      const fallback = { data: new Date().toLocaleDateString('pt-BR'), dataCompleta: new Date().toISOString().split('T')[0], mes: mesAtual, ano: anoAtual };
      if (!str) return fallback;
      const s = String(str).trim();
      let d;
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) d = new Date(s.substring(0,10)+'T00:00:00');
      else if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) { const p=s.split('/'); d=new Date(p[2]+'-'+p[1]+'-'+p[0]+'T00:00:00'); }
      else if (/^\d{2}-\d{2}-\d{4}/.test(s)) { const p=s.split('-'); d=new Date(p[2]+'-'+p[1]+'-'+p[0]+'T00:00:00'); }
      if (!d || isNaN(d.getTime())) return { data: s, dataCompleta: '', mes: mesAtual, ano: anoAtual };
      return { data: d.toLocaleDateString('pt-BR'), dataCompleta: d.toISOString().split('T')[0], mes: MESES[d.getMonth()], ano: d.getFullYear() };
    }

    function processarArquivo(file) {
      if (!file) return;
      setErroArquivo('');
      const reader = new FileReader();
      reader.onload = function(e) {
        const bytes = new Uint8Array(e.target.result);
        let texto;
        try { texto = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
        catch (_) { texto = new TextDecoder('iso-8859-1').decode(bytes); }

        const ls = texto.split('\n').filter(function(l){ return l.trim(); });
        if (ls.length < 2) { setErroArquivo('Arquivo vazio ou inv\u00e1lido.'); return; }

        // 1. Detecta separador nas primeiras 10 linhas
        const sample = ls.slice(0, Math.min(10, ls.length)).join('\n');
        const sep = (sample.split(';').length > sample.split(',').length) ? ';' : ',';

        // 2. Encontra o header real (linha com "data" e "valor")
        const norm = function(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); };
        let headerIdx = 0;
        for (let i = 0; i < Math.min(10, ls.length); i++) {
          const cols = ls[i].split(sep).map(function(c){ return norm(c.replace(/"/g,'').trim()); });
          if (cols.some(function(c){ return /\bdata\b|\bdate\b/.test(c); }) &&
              cols.some(function(c){ return /\bvalor\b|\bamount\b/.test(c); })) {
            headerIdx = i; break;
          }
        }

        const headers = ls[headerIdx].split(sep).map(function(h){ return norm(h.replace(/"/g,'').trim()); });
        const iData  = headers.findIndex(function(h){ return /\bdata\b|\bdate\b/.test(h); });
        const iValor = headers.findIndex(function(h){ return /\bvalor\b|\bamount\b|\bquantia\b|\bmontante\b/.test(h); });
        const iDesc  = (function(){ var d=headers.findIndex(function(h){ return /descri/.test(h); }); return d>=0?d:headers.findIndex(function(h){ return /desc|titulo|title|histor|memo|estabele|name|nome/.test(h); }); })();
        const iHist  = headers.findIndex(function(h){ return /histor/.test(h); });
        const isNubank = headers.includes('title') && headers.includes('amount');

        // 3. Detecta banco
        let banco = '';
        if (isNubank) banco = 'Nubank';
        else if (headers.some(function(h){ return /historico|hist\u00f3rico/.test(h); })) banco = 'Banco Inter';
        else if (headers.some(function(h){ return /agencia|ag\u00eancia/.test(h); })) banco = 'Ita\u00fa/Bradesco';
        else if (headers.some(function(h){ return /lancamento|lan\u00e7amento/.test(h); })) banco = 'Banco BR';
        setBancoDetectado(banco);

        // 4. Lê as linhas de dados
        const result = [];
        for (let i = headerIdx + 1; i < ls.length; i++) {
          const cols = ls[i].split(sep).map(function(c){ return c.replace(/"/g,'').trim(); });
          if (cols.length < 2) continue;
          let desc = '', valorStr = '', dataStr = '';
          if (isNubank) {
            desc     = cols[headers.indexOf('title')] || '';
            valorStr = cols[headers.indexOf('amount')] || '0';
            dataStr  = cols[headers.indexOf('date')] || '';
          } else if (iValor >= 0 && iDesc >= 0) {
            const mainDesc = cols[iDesc] || '';
            const hist = (iHist >= 0 && iHist !== iDesc) ? (cols[iHist] || '') : '';
            desc     = hist ? hist + ' \u2014 ' + mainDesc : mainDesc;
            valorStr = cols[iValor] || '0';
            dataStr  = iData >= 0 ? (cols[iData] || '') : '';
          } else if (iValor >= 0) {
            desc     = cols[0] || '';
            valorStr = cols[iValor] || '0';
            dataStr  = iData >= 0 ? (cols[iData] || '') : '';
          } else { continue; }

          const valorBruto = parseFloat(valorStr.replace(/\./g,'').replace(',','.'));
          if (!desc || isNaN(valorBruto)) continue;
          result.push({ id: String(i), descricao: desc.toUpperCase(), valor: Math.abs(valorBruto), valorOriginal: valorBruto, dataStr: dataStr });
        }

        if (result.length === 0) { setErroArquivo('Nenhum lan\u00e7amento encontrado. Verifique o formato do arquivo.'); return; }
        setLinhas(result);
        // Pré-seleciona débitos (valores negativos = saída de dinheiro)
        const sel = {}; const cats = {};
        result.forEach(function(r){ sel[r.id] = r.valorOriginal < 0; cats[r.id] = detectarCategoria(r.descricao); });
        setSelecionados(sel); setCatRows(cats);
        setEtapa(2);
      };
      reader.readAsArrayBuffer(file);
    }

    function importar() {
      const novos = [];
      linhas.filter(function(r){ return selecionados[r.id]; }).forEach(function(r) {
        const valorFinal = inverterValor ? Math.abs(r.valorOriginal) : r.valor;
        if (valorFinal <= 0) return;
        const di = parsearData(r.dataStr);
        novos.push({ id: Date.now()+Math.random(), categoria: catRows[r.id]||'OUTROS', descricao: r.descricao, valor: valorFinal, mes: di.mes, ano: di.ano, data: di.data, dataCompleta: di.dataCompleta });
      });
      if (novos.length === 0) { setErroArquivo('Nenhum item v\u00e1lido selecionado.'); return; }
      setGastosVariaveis(function(prev){ return [...prev, ...novos]; });
      setModalAberto(null);
      if (window.showToast) showToast(novos.length + ' gasto(s) importado(s)!', 'success');
    }

    const linhasFiltradas = ignorarCreditos ? linhas.filter(function(r){ return r.valorOriginal < 0; }) : linhas;
    const qtdSel = Object.values(selecionados).filter(Boolean).length;

    if (etapa === 1) return React.createElement('div', {style:{padding:'8px 0'}},
      React.createElement('div', {style:{fontSize:'0.8rem',color:C.textMuted,marginBottom:'20px',textAlign:'center'}}, 'Auto-detecta: Nubank \u00b7 Banco Inter \u00b7 Ita\u00fa \u00b7 Bradesco \u00b7 Santander \u00b7 C6 \u00b7 e mais'),
      React.createElement('div', {
        onClick: function(){ document.getElementById('csvFileInput').click(); },
        onDragOver: function(e){ e.preventDefault(); setDragging(true); },
        onDragLeave: function(){ setDragging(false); },
        onDrop: function(e){ e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) processarArquivo(f); },
        style:{border:'2.5px dashed '+(dragging?'#f97316':'#fdba74'),borderRadius:'16px',padding:'40px 20px',textAlign:'center',cursor:'pointer',background:dragging?'#fff7ed':'#fffbeb',marginBottom:'16px',transition:'all .2s'}
      },
        React.createElement('div',{style:{fontSize:'2.5rem',marginBottom:'10px'}},'\uD83D\uDCC4'),
        React.createElement('div',{style:{fontSize:'0.95rem',fontWeight:'800',color:'#ea580c',marginBottom:'6px'}},'Clique ou arraste o extrato .csv'),
        React.createElement('div',{style:{fontSize:'0.75rem',color:'#fb923c'}},'Colunas detectadas automaticamente \u2014 sem configura\u00e7\u00e3o manual')
      ),
      React.createElement('input',{id:'csvFileInput',type:'file',accept:'.csv,.txt,.ofx,.qfx',style:{display:'none'},onChange:function(e){ const f=e.target.files[0]; if(f) processarArquivo(f); }}),
      erroArquivo ? React.createElement('div',{style:{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'10px',padding:'10px 14px',color:'#dc2626',fontSize:'0.8rem',fontWeight:'600'}},erroArquivo) : null
    );

    return React.createElement('div', {style:{padding:'0'}},
      // Banner banco + contagem
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px'}},
        React.createElement('span',{style:{fontSize:'1.1rem'}},'\u2705'),
        React.createElement('div',null,
          React.createElement('div',{style:{fontSize:'0.8rem',fontWeight:'800',color:'#15803d'}}, linhas.length+' lan\u00e7amentos detectados'+(bancoDetectado?' \u2014 '+bancoDetectado:'')),
          React.createElement('div',{style:{fontSize:'0.7rem',color:'#166534'}}, 'd\u00e9bitos pr\u00e9-selecionados \u00b7 cr\u00e9ditos/Pix recebidos ocultados')
        )
      ),
      // Toggles
      React.createElement('div',{style:{display:'flex',gap:'12px',marginBottom:'12px',flexWrap:'wrap'}},
        React.createElement('label',{style:{display:'flex',alignItems:'center',gap:'6px',fontSize:'0.78rem',fontWeight:'600',color:C.textMuted,cursor:'pointer'}},
          React.createElement('input',{type:'checkbox',checked:ignorarCreditos,onChange:function(e){setIgnorarCreditos(e.target.checked);}}),
          'Ocultar cr\u00e9ditos/Pix recebidos'
        ),
        React.createElement('label',{style:{display:'flex',alignItems:'center',gap:'6px',fontSize:'0.78rem',fontWeight:'600',color:C.textMuted,cursor:'pointer'}},
          React.createElement('input',{type:'checkbox',checked:inverterValor,onChange:function(e){setInverterValor(e.target.checked);}}),
          'Valores positivos s\u00e3o d\u00e9bitos'
        )
      ),
      // Lista selecionável
      React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}},
        React.createElement('div',{style:{fontSize:'0.78rem',fontWeight:'800',color:C.textMuted}},qtdSel+' selecionados de '+linhasFiltradas.length+' exibidos'),
        React.createElement('label',{style:{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.75rem',fontWeight:'700',color:'#ea580c',cursor:'pointer'}},
          React.createElement('input',{type:'checkbox',
            checked: linhasFiltradas.length>0 && linhasFiltradas.every(function(r){ return selecionados[r.id]; }),
            onChange:function(e){
              setSelecionados(function(prev){
                const next = Object.assign({},prev);
                linhasFiltradas.forEach(function(r){ next[r.id]=e.target.checked; });
                return next;
              });
            }
          }),
          'Todos'
        )
      ),
      React.createElement('div',{style:{maxHeight:'240px',overflowY:'auto',border:'1px solid '+C.border,borderRadius:'10px',background:C.bg,marginBottom:'12px'}},
        linhasFiltradas.length===0
          ? React.createElement('div',{style:{padding:'24px',textAlign:'center',color:C.textFaint,fontSize:'0.8rem'}},'Nenhum item a exibir')
          : linhasFiltradas.map(function(r){
              const di = parsearData(r.dataStr);
              const catAtual = catRows[r.id] || 'OUTROS';
              return React.createElement('div',{key:r.id,style:{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',borderBottom:'1px solid '+C.borderLight,background:selecionados[r.id]?'#fff7ed':'transparent'}},
                React.createElement('input',{type:'checkbox',checked:!!selecionados[r.id],onChange:function(e){setSelecionados(function(prev){ return Object.assign({},prev,{[r.id]:e.target.checked}); }),undefined;},style:{flexShrink:0,cursor:'pointer'}}),
                React.createElement('div',{style:{flex:1,minWidth:0,cursor:'pointer'},onClick:function(){ setSelecionados(function(prev){ return Object.assign({},prev,{[r.id]:!prev[r.id]}); }); }},
                  React.createElement('div',{style:{fontSize:'0.75rem',fontWeight:'600',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},r.descricao),
                  di.data!==r.dataStr && React.createElement('div',{style:{fontSize:'0.62rem',color:C.textFaint}},di.data)
                ),
                React.createElement('select',{
                  value: catAtual,
                  onChange: function(e){ setCatRows(function(prev){ return Object.assign({},prev,{[r.id]:e.target.value}); }); },
                  onClick: function(e){ e.stopPropagation(); },
                  style:{fontSize:'0.65rem',fontWeight:'700',padding:'3px 4px',border:'1.5px solid #fdba74',borderRadius:'6px',background:'#fff7ed',color:'#c2410c',cursor:'pointer',flexShrink:0,maxWidth:'90px'}
                }, todasCatImport.map(function(c){ return React.createElement('option',{key:c,value:c},c); })),
                React.createElement('span',{style:{fontSize:'0.75rem',fontWeight:'700',color:'#dc2626',whiteSpace:'nowrap',flexShrink:0}},'R$\u00a0'+r.valor.toFixed(2))
              );
            })
      ),
      erroArquivo ? React.createElement('div',{style:{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'10px',padding:'10px 14px',color:'#dc2626',fontSize:'0.8rem',fontWeight:'600',marginBottom:'10px'}},erroArquivo) : null,
      React.createElement('div',{style:{display:'flex',gap:'10px'}},
        React.createElement('button',{onClick:function(){setEtapa(1);setErroArquivo('');},style:{padding:'10px 16px',border:'2px solid '+C.border,borderRadius:'10px',background:C.bg,color:C.textMuted,fontSize:'0.8rem',fontWeight:'700',cursor:'pointer'}},'\u2190 Voltar'),
        React.createElement('button',{onClick:importar,disabled:qtdSel===0,style:{flex:1,padding:'11px',border:'none',borderRadius:'10px',background:qtdSel>0?'#f97316':'#e5e7eb',color:qtdSel>0?'#fff':'#9ca3af',fontSize:'0.85rem',fontWeight:'800',cursor:qtdSel>0?'pointer':'not-allowed'}},
          '\uD83D\uDCE5 Importar '+qtdSel+' gasto'+(qtdSel!==1?'s':'')
        )
      )
    );
  };

  const TelaGastosVariaveis = () => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const [busca, setBusca] = useState('');
    const [minVal, setMinVal] = useState('');
    const [maxVal, setMaxVal] = useState('');
    const [periodoFiltro, setPeriodoFiltro] = useState('mes'); // 'mes'|'semana'|'30dias'|'faixa'

    // CORREÇÃO: Verificar se estamos no mês atual
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const dataAtual = new Date();
    const mesAtualSistema = mesesOrdem[dataAtual.getMonth()];
    const anoAtualSistema = dataAtual.getFullYear();
    const estamosNoMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;

    // Período base para filtro
    const _isoSemana = (function(){ var d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().split('T')[0]; })();
    const _iso30d = new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0];
    const gastosDoMes = periodoFiltro==='semana'
      ? gastosVariaveis.filter(g => (g.dataCompleta||'') >= _isoSemana)
      : periodoFiltro==='30dias'
      ? gastosVariaveis.filter(g => (g.dataCompleta||'') >= _iso30d)
      : gastosVariaveis.filter(g => g.mes===mesAtual && g.ano===anoAtual);

    const totaisPorCat = {};
    gastosDoMes.forEach(g => { totaisPorCat[g.categoria] = (totaisPorCat[g.categoria]||0) + g.valor; });
    const totalMes = gastosDoMes.reduce((s,g) => s+g.valor, 0);
    const gastosDoMesCat = categoriaFiltro==='TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria===categoriaFiltro);
    const gastosFiltrados = gastosDoMesCat
      .filter(g => !busca || g.descricao.toLowerCase().includes(busca.toLowerCase()) || g.categoria.toLowerCase().includes(busca.toLowerCase()))
      .filter(g => periodoFiltro!=='faixa' || !minVal || g.valor >= parseFloat(minVal))
      .filter(g => periodoFiltro!=='faixa' || !maxVal || g.valor <= parseFloat(maxVal));
    const totalFiltrado = gastosFiltrados.reduce((s,g) => s+g.valor, 0);
    const categorias = ['TODAS', ...Object.keys(totaisPorCat).sort((a,b)=>totaisPorCat[b]-totaisPorCat[a])];

    // Agrupar por data
    const porData = {};
    gastosFiltrados.forEach(g => {
      const key = g.dataCompleta||g.data||'Sem data';
      if (!porData[key]) porData[key] = [];
      porData[key].push(g);
    });
    const datasOrdenadas = Object.keys(porData).sort((a,b) => {
      if(a==='Sem data') return 1; if(b==='Sem data') return -1;
      return sortGV==='data-asc' ? a.localeCompare(b) : b.localeCompare(a);
    });
    const hoje = estamosNoMesAtual ? dataAtual : null;

    const _isMobGV = window.innerWidth <= 768;
    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns: _isMobGV ? '1fr' : '200px 1fr', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px', minWidth:0}},

        /*#__PURE__*/React.createElement("div", {style:{background:'#f97316', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(249,115,22,0.35)', border:'1px solid rgba(255,255,255,0.1)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, "\uD83D\uDCCA VARI\xC1VEIS \xB7 "+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.9rem', fontWeight:'900', marginBottom:'4px', lineHeight:1}}, "R$ "+totalMes.toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', opacity:0.65}}, gastosDoMes.length+" gasto"+(gastosDoMes.length!==1?"s":""))
        ),

        totais.total>0 && /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'8px'}}, "\uD83D\uDCCA Do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#c2410c', marginBottom:'6px'}}, (totalMes/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:C.bgTable, borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalMes/totais.total*100)+'%', background:'#f97316', borderRadius:'3px', transition:'width .6s ease'}})
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83D\uDCC5 Período"),
          React.createElement('div', {style:{display:'flex', flexDirection:'column', gap:'5px'}},
            [
              {v:'mes',    l:'📅 Este mês'},
              {v:'semana', l:'📅 Esta semana'},
              {v:'30dias', l:'🗓️ Últimos 30 dias'},
              {v:'faixa',  l:'💰 Faixa de valor'},
            ].map(function(p) {
              return React.createElement('button', {
                key:p.v, onClick:function(){ setPeriodoFiltro(p.v); setMinVal(''); setMaxVal(''); },
                style:{width:'100%', padding:'7px 10px', border:'none', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontSize:'0.73rem', fontWeight:'600',
                  background:periodoFiltro===p.v?'#fff7ed':'transparent',
                  color:periodoFiltro===p.v?'#c2410c':'#6b7280'}
              }, p.l);
            }),
            periodoFiltro==='faixa' && React.createElement('div', {style:{display:'flex', gap:'6px', marginTop:'6px'}},
              React.createElement('input', {type:'number', placeholder:'Mín R$', value:minVal, onChange:function(e){setMinVal(e.target.value);},
                style:{flex:1, padding:'5px 8px', borderRadius:'8px', border:'1px solid '+C.border, background:C.input, color:C.text, fontSize:'0.72rem', minWidth:0}}),
              React.createElement('input', {type:'number', placeholder:'Máx R$', value:maxVal, onChange:function(e){setMaxVal(e.target.value);},
                style:{flex:1, padding:'5px 8px', borderRadius:'8px', border:'1px solid '+C.border, background:C.input, color:C.text, fontSize:'0.72rem', minWidth:0}})
            )
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83C\uDFF7\uFE0F Categorias"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'5px'}},
            ...categorias.map(cat =>
              /*#__PURE__*/React.createElement("button", {
                key:cat,
                onClick:()=>setCategoriaFiltro(cat),
                style:{width:'100%', padding:'7px 10px', border:'none', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontSize:'0.75rem', fontWeight:'600', background:categoriaFiltro===cat?'#fff7ed':'transparent', color:categoriaFiltro===cat?'#c2410c':'#6b7280', display:'flex', justifyContent:'space-between', alignItems:'center'}
              },
                /*#__PURE__*/React.createElement("span", null, cat==='TODAS'?'Todas':cat),
                cat!=='TODAS' && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.7rem', fontWeight:'700', color:categoriaFiltro===cat?'#c2410c':'#9ca3af'}}, "R$ "+(totaisPorCat[cat]||0).toFixed(0))
              )
            )
          )
        ),

        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('novoGastoVariavel'), style:{width:'100%', padding:'12px', border:'none', borderRadius:'12px', background:'#ea580c', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(234,88,12,0.35)'}}, "\u2795 Novo Gasto Vari\xE1vel"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('gerenciarCategorias'), style:{width:'100%', padding:'10px', border:'2px solid '+C.border, borderRadius:'12px', background:C.bg, color:C.textMuted, fontSize:'0.78rem', fontWeight:'600', cursor:'pointer'}}, "\uD83C\uDFF7\uFE0F Gerenciar Categorias"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('importarCSV'), style:{width:'100%', padding:'10px', border:'2px solid #f97316', borderRadius:'12px', background:'#fff7ed', color:'#ea580c', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', marginTop:'6px'}}, "\uD83D\uDCE5 Importar CSV")
      ),

      /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid '+C.borderLight, display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:C.text}}, categoriaFiltro==='TODAS'?"Todas as Gastos Variáveis":"Gastos \xB7 "+categoriaFiltro),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}}, gastosFiltrados.length+" gasto"+(gastosFiltrados.length!==1?"s":"")+" \xB7 mais recentes primeiro")
          ),
          gastosFiltrados.length>0 && /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.1rem', color:'#c2410c'}}, "R$ "+totalFiltrado.toFixed(2))
        ),

        gastosFiltrados.length===0
          ? /*#__PURE__*/React.createElement("div", {style:{padding:'50px 20px', textAlign:'center'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'72px', height:'72px', borderRadius:'20px', background:darkMode?'#1e293b':'#f1f5f9', fontSize:'2.5rem', marginBottom:'16px'}}, "\uD83D\uDED2"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'800', color:C.text, marginBottom:'6px'}}, categoriaFiltro==='TODAS'?"Nenhuma compra ou gasto em "+mesAtual:"Nenhum gasto em "+categoriaFiltro),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:C.textFaint, marginBottom:'20px'}}, "Registre gastos do dia a dia como mercado, farm\xE1cia e transporte"),
              /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('novoGastoVariavel'), style:{padding:'9px 22px', border:'none', borderRadius:'10px', background:'#ea580c', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer'}}, "\u2795 Adicionar")
            )
          : /*#__PURE__*/React.createElement("div", {style:{maxHeight:'560px', overflowY:'auto'}},
              /*#__PURE__*/React.createElement('div', {style:{display:'flex',gap:'6px',marginBottom:'8px',alignItems:'center',flexWrap:'wrap',padding:'8px 20px 0'}},
                /*#__PURE__*/React.createElement('span', {style:{fontSize:'0.7rem',color:C.textFaint}}, 'Ordenar:'),
                /*#__PURE__*/React.createElement('button', {
                  onClick:()=>setSortGV(s=>s==='data-desc'?'data-asc':'data-desc'),
                  style:{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:'700',
                    background:'#c2410c',color:'#fff'}
                }, sortGV==='data-asc'?'📅 Data ↑':'📅 Data ↓')
              ),
              ...datasOrdenadas.map(dataKey => {
                const gastosDia = porData[dataKey];
                const totalDia = gastosDia.reduce((s,g)=>s+g.valor,0);
                let diaSemana='', diaNum='', dataFmt=dataKey, isHoje=false;
                if (dataKey!=='Sem data') {
                  const d = new Date(dataKey+'T00:00:00');
                  isHoje = hoje ? d.toDateString()===hoje.toDateString() : false;
                  diaSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','S\xE1b'][d.getDay()];
                  diaNum = d.getDate();
                  dataFmt = d.toLocaleDateString('pt-BR');
                }
                return /*#__PURE__*/React.createElement("div", {key:dataKey},
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'12px', padding:'10px 20px', background:isHoje?'#fff7ed':'#f9fafb', borderBottom:'1px solid '+C.borderLight}},
                    dataKey!=='Sem data'
                      ? /*#__PURE__*/React.createElement("div", {style:{width:'48px', textAlign:'center', flexShrink:0}},
                          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'700', color:isHoje?'#c2410c':'#9ca3af', textTransform:'uppercase'}}, diaSemana),
                          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:isHoje?'#c2410c':'#374151', lineHeight:1.1}}, diaNum),
                          isHoje && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.55rem', fontWeight:'800', color:'#c2410c', textTransform:'uppercase'}}, "Hoje")
                        )
                      : /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.72rem', fontWeight:'700', color:C.textFaint}}, "Sem data"),
                    /*#__PURE__*/React.createElement("div", {style:{flex:1}}),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', fontWeight:'700', color:isHoje?'#c2410c':'#6b7280'}}, "R$ "+totalDia.toFixed(2)+" \xB7 "+gastosDia.length+" item"+(gastosDia.length!==1?"s":""))
                  ),
                  ...gastosDia.map((gasto,idx)=>
                    /*#__PURE__*/React.createElement("div", {
                      key:gasto.id,
                      style:{display:'flex', alignItems:'center', gap:'12px', padding:'11px 20px 11px 32px', borderBottom:idx<gastosDia.length-1?'1px solid #f9fafb':'none', transition:'background .15s'},
                      onMouseEnter:e=>{e.currentTarget.style.background='#fafafa'},
                      onMouseLeave:e=>{e.currentTarget.style.background='transparent'}
                    },
                      /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.82rem', fontWeight:'700', color:C.text}}, gasto.descricao||'Sem descri\xE7\xE3o'),
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:C.textFaint, marginTop:'2px'}}, gasto.categoria)
                      ),
                      /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', fontSize:'0.9rem', color:'#c2410c', flexShrink:0, marginRight:'8px'}}, "R$ "+gasto.valor.toFixed(2)),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px'}},
                        /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(gasto);setTipoEditando('variavel');setModalAberto('editar');}, style:{width:_isMobGV?'36px':'28px', height:_isMobGV?'36px':'28px', border:'none', borderRadius:'7px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\u270F\uFE0F"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarGastoVariavel(gasto), style:{width:_isMobGV?'36px':'28px', height:_isMobGV?'36px':'28px', border:'none', borderRadius:'7px', background:'#fff7ed', color:'#f97316', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDCCB"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>deletarGastoVariavel(gasto.id), style:{width:_isMobGV?'36px':'28px', height:_isMobGV?'36px':'28px', border:'none', borderRadius:'7px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDDD1\uFE0F")
                      )
                    )
                  )
                );
              })
            ),

        gastosFiltrados.length>1 && /*#__PURE__*/React.createElement("div", {style:{padding:'12px 20px', borderTop:'2px solid '+C.border, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bgMuted}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:C.textMuted}}, "Total \xB7 "+gastosFiltrados.length+" gastos"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#c2410c'}}, "R$ "+totalFiltrado.toFixed(2))
        )
      )
    );
  };

  const TelaGastosExtras = () => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const [periodoFiltroE, setPeriodoFiltroE] = useState('mes'); // 'mes'|'semana'|'30dias'|'faixa'
    const [minValE, setMinValE] = useState('');
    const [maxValE, setMaxValE] = useState('');

    // Período base
    const _isoSemanaE = (function(){ var d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().split('T')[0]; })();
    const _iso30dE = new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0];
    const gastosDoMes = periodoFiltroE==='semana'
      ? gastosExtras.filter(g => (g.dataCompleta||'') >= _isoSemanaE)
      : periodoFiltroE==='30dias'
      ? gastosExtras.filter(g => (g.dataCompleta||'') >= _iso30dE)
      : gastosExtras.filter(g => g.mes===mesAtual && g.ano===anoAtual);

    const totaisPorCat = {};
    gastosDoMes.forEach(g => { totaisPorCat[g.categoria] = (totaisPorCat[g.categoria]||0) + g.valor; });
    const totalMes = gastosDoMes.reduce((s,g) => s+g.valor, 0);
    const gastosFiltradosBase = categoriaFiltro==='TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria===categoriaFiltro);
    const gastosFiltrados = gastosFiltradosBase
      .filter(g => periodoFiltroE!=='faixa' || !minValE || g.valor >= parseFloat(minValE))
      .filter(g => periodoFiltroE!=='faixa' || !maxValE || g.valor <= parseFloat(maxValE));
    const totalFiltrado = gastosFiltrados.reduce((s,g) => s+g.valor, 0);
    const categorias = ['TODAS', ...Object.keys(totaisPorCat).sort((a,b)=>totaisPorCat[b]-totaisPorCat[a])];
    const sortedGastos = [...gastosFiltrados].sort((a,b) => {
      if (sortGE === 'valor-desc') return b.valor - a.valor;
      if (sortGE === 'valor-asc')  return a.valor - b.valor;
      if (sortGE === 'data-asc')   return (a.data||'').localeCompare(b.data||'');
      return (b.data||'').localeCompare(a.data||'');
    });

    const _isMobGE = window.innerWidth <= 768;
    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns: _isMobGE ? '1fr' : '200px 1fr', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px', minWidth:0}},

        /*#__PURE__*/React.createElement("div", {style:{background:'#f97316', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(249,115,22,0.35)', border:'1px solid rgba(255,255,255,0.1)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, "\u26A1 EXTRAS \xB7 "+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.9rem', fontWeight:'900', marginBottom:'4px', lineHeight:1}}, "R$ "+totalMes.toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', opacity:0.65}}, gastosDoMes.length+" gasto"+(gastosDoMes.length!==1?"s":"")+" extra"+(gastosDoMes.length!==1?"s":""))
        ),

        totais.total>0 && /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'8px'}}, "\uD83D\uDCCA Do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#b45309', marginBottom:'6px'}}, (totalMes/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:C.bgTable, borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalMes/totais.total*100)+'%', background:'#d97706', borderRadius:'3px', transition:'width .6s ease'}})
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83D\uDCC5 Período"),
          React.createElement('div', {style:{display:'flex', flexDirection:'column', gap:'5px'}},
            [
              {v:'mes',    l:'📅 Este mês'},
              {v:'semana', l:'📅 Esta semana'},
              {v:'30dias', l:'🗓️ Últimos 30 dias'},
              {v:'faixa',  l:'💰 Faixa de valor'},
            ].map(function(p) {
              return React.createElement('button', {
                key:p.v, onClick:function(){ setPeriodoFiltroE(p.v); setMinValE(''); setMaxValE(''); },
                style:{width:'100%', padding:'7px 10px', border:'none', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontSize:'0.73rem', fontWeight:'600',
                  background:periodoFiltroE===p.v?'#fffbeb':'transparent',
                  color:periodoFiltroE===p.v?'#b45309':'#6b7280'}
              }, p.l);
            }),
            periodoFiltroE==='faixa' && React.createElement('div', {style:{display:'flex', gap:'6px', marginTop:'6px'}},
              React.createElement('input', {type:'number', placeholder:'Mín R$', value:minValE, onChange:function(e){setMinValE(e.target.value);},
                style:{flex:1, padding:'5px 8px', borderRadius:'8px', border:'1px solid '+C.border, background:C.input, color:C.text, fontSize:'0.72rem', minWidth:0}}),
              React.createElement('input', {type:'number', placeholder:'Máx R$', value:maxValE, onChange:function(e){setMaxValE(e.target.value);},
                style:{flex:1, padding:'5px 8px', borderRadius:'8px', border:'1px solid '+C.border, background:C.input, color:C.text, fontSize:'0.72rem', minWidth:0}})
            )
          )
        ),

        Object.keys(totaisPorCat).length>0 && /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'12px', padding:'14px', border:'1px solid '+C.border}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83C\uDFF7\uFE0F Categorias"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'5px'}},
            ...categorias.map(cat =>
              /*#__PURE__*/React.createElement("button", {
                key:cat,
                onClick:()=>setCategoriaFiltro(cat),
                style:{width:'100%', padding:'7px 10px', border:'none', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontSize:'0.75rem', fontWeight:'600', background:categoriaFiltro===cat?'#fffbeb':'transparent', color:categoriaFiltro===cat?'#b45309':'#6b7280', display:'flex', justifyContent:'space-between', alignItems:'center'}
              },
                /*#__PURE__*/React.createElement("span", null, cat==='TODAS'?'Todas':cat),
                cat!=='TODAS' && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.7rem', fontWeight:'700', color:categoriaFiltro===cat?'#b45309':'#9ca3af'}}, "R$ "+(totaisPorCat[cat]||0).toFixed(0))
              )
            )
          )
        ),

        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('novoGastoExtra'), style:{width:'100%', padding:'12px', border:'none', borderRadius:'12px', background:'#d97706', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(217,119,6,0.35)'}}, "\u2795 Novo Gasto Extra"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('gerenciarCategorias'), style:{width:'100%', padding:'10px', border:'2px solid '+C.border, borderRadius:'12px', background:C.bg, color:C.textMuted, fontSize:'0.78rem', fontWeight:'600', cursor:'pointer'}}, "\uD83C\uDFF7\uFE0F Gerenciar Categorias")
      ),

      /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid '+C.borderLight, display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:C.text}}, categoriaFiltro==='TODAS'?"Todos os Gastos Extras":"Gastos \xB7 "+categoriaFiltro),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}}, gastosFiltrados.length+" item"+(gastosFiltrados.length!==1?"s":""))
          ),
          gastosFiltrados.length>0 && /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.1rem', color:'#b45309'}}, "R$ "+totalFiltrado.toFixed(2))
        ),

        gastosFiltrados.length===0
          ? /*#__PURE__*/React.createElement("div", {style:{padding:'50px 20px', textAlign:'center'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\u26A1"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:C.textFaint, marginBottom:'6px'}}, categoriaFiltro==='TODAS'?"Nenhum gasto extra em "+mesAtual:"Nenhum gasto em "+categoriaFiltro),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:'#d1d5db', marginBottom:'18px'}}, "Registre compras pontuais, surpresas ou gastos imprevistos"),
              /*#__PURE__*/React.createElement("button", {onClick:()=>setModalAberto('novoGastoExtra'), style:{padding:'9px 22px', border:'none', borderRadius:'10px', background:'#d97706', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer'}}, "\u2795 Adicionar")
            )
          : /*#__PURE__*/React.createElement("div", {style:{maxHeight:'560px', overflowY:'auto'}},
              /*#__PURE__*/React.createElement('div', {style:{display:'flex',gap:'6px',marginBottom:'4px',alignItems:'center',flexWrap:'wrap',padding:'8px 20px 0'}},
                /*#__PURE__*/React.createElement('span', {style:{fontSize:'0.7rem',color:C.textFaint}}, 'Ordenar:'),
                /*#__PURE__*/React.createElement('button', {
                  onClick:()=>setSortGE(s=>s.startsWith('data')?(s==='data-desc'?'data-asc':'data-desc'):'data-desc'),
                  style:{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:'700',
                    background:sortGE.startsWith('data')?'#b45309':(darkMode?'#1e293b':'#f3f4f6'),
                    color:sortGE.startsWith('data')?'#fff':C.textFaint}
                }, sortGE==='data-asc'?'📅 Data ↑':'📅 Data ↓'),
                /*#__PURE__*/React.createElement('button', {
                  onClick:()=>setSortGE(s=>s.startsWith('valor')?(s==='valor-desc'?'valor-asc':'valor-desc'):'valor-desc'),
                  style:{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:'700',
                    background:sortGE.startsWith('valor')?'#b45309':(darkMode?'#1e293b':'#f3f4f6'),
                    color:sortGE.startsWith('valor')?'#fff':C.textFaint}
                }, sortGE==='valor-asc'?'💰 Valor ↑':'💰 Valor ↓')
              ),
              ...sortedGastos.map((gasto,idx)=>
                /*#__PURE__*/React.createElement("div", {
                  key:gasto.id,
                  style:{display:'flex', alignItems:'center', gap:'14px', padding:'13px 22px', borderBottom:idx<sortedGastos.length-1?'1px solid #f9fafb':'none', transition:'background .15s'},
                  onMouseEnter:e=>{e.currentTarget.style.background='#fafafa'},
                  onMouseLeave:e=>{e.currentTarget.style.background='transparent'}
                },
                  /*#__PURE__*/React.createElement("div", {style:{width:'38px', height:'38px', borderRadius:'10px', background:'#fffbeb', border:'1px solid #fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0}}, "\u26A1"),
                  /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                    /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px'}},
                      /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem', fontWeight:'700', color:C.text}}, gasto.categoria),
                      gasto.descricao && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.73rem', color:C.textFaint, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px'}}, "\xB7 "+gasto.descricao)
                    ),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#d1d5db'}}, gasto.data||'')
                  ),
                  /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', fontSize:'0.92rem', color:'#b45309', flexShrink:0, marginRight:'8px'}}, "R$ "+gasto.valor.toFixed(2)),
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px', flexShrink:0}},
                    /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(gasto);setTipoEditando('extra');setModalAberto('editar');}, style:{width:_isMobGE?'36px':'28px', height:_isMobGE?'36px':'28px', border:'none', borderRadius:'7px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\u270F\uFE0F"),
                    /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarGastoExtra(gasto), style:{width:_isMobGE?'36px':'28px', height:_isMobGE?'36px':'28px', border:'none', borderRadius:'7px', background:'#fff7ed', color:'#f97316', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDCCB"),
                    /*#__PURE__*/React.createElement("button", {onClick:()=>deletarGastoExtra(gasto.id), style:{width:_isMobGE?'36px':'28px', height:_isMobGE?'36px':'28px', border:'none', borderRadius:'7px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDDD1\uFE0F")
                  )
                )
              )
            ),

        gastosFiltrados.length>1 && /*#__PURE__*/React.createElement("div", {style:{padding:'12px 20px', borderTop:'2px solid '+C.border, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bgMuted}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:C.textMuted}}, "Total \xB7 "+gastosFiltrados.length+" gastos"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#b45309'}}, "R$ "+totalFiltrado.toFixed(2))
        )
      )
    );
  };

  const TelaReceitas = () => {
    const [busca, setBusca] = useState('');
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesNome  = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'};
    const catIcone   = {'Salário':'💼','Freelance':'🖥️','Investimento':'📈','Aluguel':'🏠','Bônus':'🎯','13º Salário':'🎁','Pensão':'👨‍👩‍👧','Outros':'💰'};

    const todasReceitasDoMes = receitas.filter(r => r.mes === mesAtual && r.ano === anoAtual);
    const receitasDoMes = !busca ? todasReceitasDoMes : todasReceitasDoMes.filter(r => r.descricao && r.descricao.toLowerCase().includes(busca.toLowerCase()));
    const totalMes      = receitasDoMes.reduce((s,r) => s + r.valor, 0);
    const receitasAno   = receitas.filter(r => r.ano === anoAtual);
    const totalAno      = receitasAno.reduce((s,r) => s + r.valor, 0);

    const idxAtual  = mesesOrdem.indexOf(mesAtual);
    const ultimos6  = Array.from({length:6}, (_,i) => {
      const idx   = (idxAtual - 5 + i + 12) % 12;
      const mes   = mesesOrdem[idx];
      const total = receitas.filter(r => r.mes === mes && r.ano === anoAtual).reduce((s,r) => s + r.valor, 0);
      return { mes, label: mesesNome[mes], total, atual: mes === mesAtual };
    });
    const maxBar      = Math.max(...ultimos6.map(m => m.total), 1);
    const mediaUlt6   = ultimos6.reduce((s,m) => s + m.total, 0) / 6;
    const variacaoMes = mediaUlt6 > 0 ? (totalMes - mediaUlt6) / mediaUlt6 * 100 : 0;

    const porCat  = receitasDoMes.reduce((acc,r) => { acc[r.categoria] = (acc[r.categoria]||0) + r.valor; return acc; }, {});
    const catList = Object.entries(porCat).sort((a,b) => b[1]-a[1]);

    const _isMobRec = window.innerWidth <= 768;
    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns: _isMobRec ? '1fr' : '240px 1fr 220px', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px', minWidth:0}},

        /*#__PURE__*/React.createElement("div", {style:{background:'#065f46', borderRadius:'16px', padding:'22px', color:'#fff', boxShadow:'0 6px 28px rgba(16,185,129,0.35)', border:'1px solid rgba(16,185,129,0.25)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, mesAtual.toUpperCase() + " \xB7 " + anoAtual),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', opacity:0.7, marginBottom:'4px'}}, "Total do m\xEAs"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'2rem', fontWeight:'900', lineHeight:1, marginBottom:'16px'}}, "R$ " + totalMes.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:'14px'}},
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.62rem', opacity:0.55, marginBottom:'3px'}}, "Lan\xE7amentos"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem', fontWeight:'800'}}, receitasDoMes.length)
            ),
            /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.62rem', opacity:0.55, marginBottom:'3px'}}, "vs m\xE9dia"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem', fontWeight:'800', color: variacaoMes >= 0 ? '#86efac' : '#fca5a5'}}, (variacaoMes >= 0 ? '+' : '') + variacaoMes.toFixed(1) + '%')
            )
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83D\uDCC5 Acumulado " + anoAtual),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#065f46'}}, "R$ " + totalAno.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'3px'}}, receitasAno.length + " lan\xE7amentos no ano")
        ),

        catList.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'14px'}}, "\uD83E\uDD67 Por Categoria"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'11px'}},
            ...catList.map(([cat, val]) =>
              /*#__PURE__*/React.createElement("div", {key:cat},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', marginBottom:'4px', alignItems:'center'}},
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'6px'}},
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem'}}, catIcone[cat] || '\uD83D\uDCB0'),
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:C.text}}, cat)
                  ),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', fontWeight:'800', color:'#065f46'}}, (totalMes > 0 ? val/totalMes*100 : 0).toFixed(0) + "%")
                ),
                /*#__PURE__*/React.createElement("div", {style:{height:'4px', background:'#f0fdf4', borderRadius:'2px', overflow:'hidden'}},
                  /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalMes > 0 ? val/totalMes*100 : 0)+'%', background:'#10b981', borderRadius:'2px', transition:'width .6s ease'}})
                )
              )
            )
          )
        ),

        /*#__PURE__*/React.createElement("button", {
          onClick: () => setModalAberto('novaReceita'),
          style:{width:'100%', padding:'13px', border:'none', borderRadius:'12px', background:'#059669', color:'#fff', fontSize:'0.83rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 14px rgba(16,185,129,0.35)', letterSpacing:'0.3px'}
        }, "\u2795 Nova Receita")
      ),

      /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},

        /*#__PURE__*/React.createElement("div", {style:{padding:'12px 16px', borderBottom:'1px solid '+C.borderLight}},
          /*#__PURE__*/React.createElement("input", {
            type:'text', value:busca, onChange:e=>setBusca(e.target.value),
            placeholder:'\uD83D\uDD0D Buscar receita...',
            style:{width:'100%', padding:'8px 12px', border:'1.5px solid '+C.border, borderRadius:'10px', background:C.input, color:C.text, fontSize:'0.82rem', outline:'none', boxSizing:'border-box'}
          })
        ),

        /*#__PURE__*/React.createElement("div", {style:{padding:'18px 22px', borderBottom:'2px solid '+C.borderLight, display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:C.text}}, "Receitas de " + mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}}, receitasDoMes.length === 0 ? "Nenhum lan\xE7amento ainda" : receitasDoMes.length + " " + (receitasDoMes.length === 1 ? "lan\xE7amento" : "lan\xE7amentos"))
          ),
          receitasDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.15rem', color:'#10b981'}}, "R$ " + totalMes.toLocaleString('pt-BR',{minimumFractionDigits:2}))
        ),

        receitasDoMes.length === 0 && /*#__PURE__*/React.createElement("div", {style:{padding:'60px 20px', textAlign:'center'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\uD83D\uDCB0"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'700', color:C.textFaint, marginBottom:'6px'}}, "Nenhuma receita em " + mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:'#d1d5db', marginBottom:'22px'}}, "Registre sal\xE1rio, freelance, b\xF4nus ou qualquer entrada"),
          /*#__PURE__*/React.createElement("button", {
            onClick: () => setModalAberto('novaReceita'),
            style:{padding:'10px 26px', border:'none', borderRadius:'10px', background:'#059669', color:'#fff', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer', boxShadow:'0 3px 10px rgba(16,185,129,0.3)'}
          }, "\u2795 Registrar Receita")
        ),

        receitasDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {style:{maxHeight:'500px', overflowY:'auto'}},
          /*#__PURE__*/React.createElement('div', {style:{display:'flex',gap:'6px',marginBottom:'4px',alignItems:'center',flexWrap:'wrap',padding:'8px 20px 0'}},
            /*#__PURE__*/React.createElement('span', {style:{fontSize:'0.7rem',color:C.textFaint}}, 'Ordenar:'),
            /*#__PURE__*/React.createElement('button', {
              onClick:()=>setSortRec(s=>s.startsWith('data')?(s==='data-desc'?'data-asc':'data-desc'):'data-desc'),
              style:{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:'700',
                background:sortRec.startsWith('data')?'#10b981':(darkMode?'#1e293b':'#f3f4f6'),
                color:sortRec.startsWith('data')?'#fff':C.textFaint}
            }, sortRec==='data-asc'?'📅 Data ↑':'📅 Data ↓'),
            /*#__PURE__*/React.createElement('button', {
              onClick:()=>setSortRec(s=>s.startsWith('valor')?(s==='valor-desc'?'valor-asc':'valor-desc'):'valor-desc'),
              style:{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:'700',
                background:sortRec.startsWith('valor')?'#10b981':(darkMode?'#1e293b':'#f3f4f6'),
                color:sortRec.startsWith('valor')?'#fff':C.textFaint}
            }, sortRec==='valor-asc'?'💰 Valor ↑':'💰 Valor ↓')
          ),
          ...[...receitasDoMes].sort((a,b) => {
            if (sortRec === 'valor-desc') return b.valor - a.valor;
            if (sortRec === 'valor-asc')  return a.valor - b.valor;
            if (sortRec === 'data-asc')   return (a.data||'').localeCompare(b.data||'');
            return (b.data||'').localeCompare(a.data||'');
          }).map((receita, idx) =>
            /*#__PURE__*/React.createElement("div", {
              key: receita.id,
              style:{display:'flex', alignItems:'center', gap:'14px', padding:'13px 22px', borderBottom: idx < receitasDoMes.length-1 ? '1px solid #f9fafb' : 'none', transition:'background .15s'},
              onMouseEnter: e => { e.currentTarget.style.background = '#fafafa'; },
              onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; }
            },
              /*#__PURE__*/React.createElement("div", {style:{width:'42px', height:'42px', borderRadius:'11px', background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.15rem', border:'1px solid #d1fae5'}}, catIcone[receita.categoria] || '\uD83D\uDCB0'),
              /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem', fontWeight:'700', color:C.text}}, receita.categoria),
                  receita.recorrente && /*#__PURE__*/React.createElement("span", {title:"Recorrente", style:{fontSize:'0.62rem', background:'#dcfce7', color:'#16a34a', padding:'1px 7px', borderRadius:'10px', fontWeight:'800', flexShrink:0}}, "\uD83D\uDD04 Recorrente"),
                  receita.descricao && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.73rem', color:C.textFaint, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'160px'}}, "\xB7 " + receita.descricao)
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#d1d5db'}}, receita.data || '')
              ),
              /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'0.95rem', color:'#059669', flexShrink:0, marginRight:'8px'}}, "R$ " + receita.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px', flexShrink:0}},
                /*#__PURE__*/React.createElement("button", {onClick:()=>{ setItemEditando(receita); setTipoEditando('receita'); setModalAberto('editar'); }, title:"Editar", style:{width:_isMobRec?'36px':'30px', height:_isMobRec?'36px':'30px', border:'none', borderRadius:'8px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\u270F\uFE0F"),
                /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarReceita(receita), title:"Duplicar", style:{width:_isMobRec?'36px':'30px', height:_isMobRec?'36px':'30px', border:'none', borderRadius:'8px', background:'#fff7ed', color:'#f97316', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDCCB"),
                /*#__PURE__*/React.createElement("button", {onClick:()=>deletarReceita(receita.id), title:"Excluir", style:{width:_isMobRec?'36px':'30px', height:_isMobRec?'36px':'30px', border:'none', borderRadius:'8px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'0', flexShrink:0}}, "\uD83D\uDDD1\uFE0F")
              )
            )
          )
        ),

        receitasDoMes.length > 1 && /*#__PURE__*/React.createElement("div", {style:{padding:'13px 22px', borderTop:'2px solid '+C.border, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bgMuted}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:C.textMuted}}, "Total de " + receitasDoMes.length + " receitas"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#059669'}}, "R$ " + totalMes.toLocaleString('pt-BR',{minimumFractionDigits:2}))
        )
      ),

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'14px'}}, "\uD83D\uDCCA \xDAltimos 6 Meses"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'flex-end', gap:'5px', height:'72px', marginBottom:'8px'}},
            ...ultimos6.map(m =>
              /*#__PURE__*/React.createElement("div", {key:m.mes, style:{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%'}},
                m.total > 0
                  ? /*#__PURE__*/React.createElement("div", {title:"R$ " + m.total.toFixed(2), style:{width:'100%', height: Math.max(4, m.total/maxBar*68)+'px', background: m.atual ? '#10b981' : '#bbf7d0', borderRadius:'4px 4px 0 0', transition:'height .5s ease', boxShadow: m.atual ? '0 2px 8px rgba(16,185,129,0.4)' : 'none'}})
                  : /*#__PURE__*/React.createElement("div", {style:{width:'100%', height:'3px', background:C.bgTable, borderRadius:'2px'}})
              )
            )
          ),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px'}},
            ...ultimos6.map(m =>
              /*#__PURE__*/React.createElement("div", {key:m.mes, style:{flex:1, textAlign:'center', fontSize:'0.58rem', fontWeight: m.atual ? '800' : '500', color: m.atual ? '#059669' : '#9ca3af'}}, m.label)
            )
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "\uD83D\uDCD0 M\xE9dia Mensal"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.15rem', fontWeight:'900', color:C.text, marginBottom:'8px'}}, "R$ " + mediaUlt6.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'700', background: variacaoMes >= 0 ? '#ecfdf5' : '#fff1f2', color: variacaoMes >= 0 ? '#059669' : '#e11d48'}},
            variacaoMes >= 0 ? '\u25B2' : '\u25BC', " " + Math.abs(variacaoMes).toFixed(1) + "% este m\xEAs"
          )
        ),

        saldo.receitas > 0 && /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'12px'}}, "\u2696\uFE0F Comprometimento"),
          (function() {
            var pct = saldo.receitas > 0 ? saldo.despesas / saldo.receitas * 100 : 0;
            var cor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981';
            var bg  = pct > 90 ? '#fff1f2' : pct > 70 ? '#fffbeb' : '#f0fdf4';
            return /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', marginBottom:'8px'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.73rem', color:C.textMuted}}, "Despesas / Receita"),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.92rem', fontWeight:'900', color:cor}}, pct.toFixed(0) + "%")
              ),
              /*#__PURE__*/React.createElement("div", {style:{height:'7px', background:C.bgTable, borderRadius:'4px', overflow:'hidden', marginBottom:'10px'}},
                /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:Math.min(100,pct)+'%', background:cor, borderRadius:'4px', transition:'width .6s ease'}})
              ),
              /*#__PURE__*/React.createElement("div", {style:{padding:'8px 10px', borderRadius:'8px', background:bg, fontSize:'0.7rem', color:cor, fontWeight:'600'}},
                pct > 90 ? "\uD83D\uDD34 Comprometimento cr\xEDtico"
                  : pct > 70 ? "\uD83D\uDFE1 Pouca margem para poupar"
                  : "\uD83D\uDFE2 Boa margem de poupan\xE7a"
              )
            );
          })()
        ),

        /*#__PURE__*/React.createElement("div", {
          style:{borderRadius:'14px', padding:'16px', background: saldo.positivo ? '#ecfdf5' : '#fff1f2', border: saldo.positivo ? '1px solid #a7f3d0' : '1px solid #fecdd3'}
        },
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color: saldo.positivo ? '#065f46' : '#be123c', marginBottom:'10px'}}, saldo.positivo ? "\u2705 Sobra do M\xEAs" : "\u26A0\uFE0F D\xE9ficit do M\xEAs"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color: saldo.positivo ? '#059669' : '#e11d48'}}, "R$ " + Math.abs(saldo.saldo).toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color: saldo.positivo ? '#065f46' : '#be123c', marginTop:'5px', opacity:0.8}}, saldo.positivo ? "Dispon\xEDvel para poupar ou investir" : "Receitas menores que as despesas")
        )
      )
    );
  };

  // ── GRÁFICOS HISTÓRICOS ──────────────────────────────────────────────────
  const TelaHistorico = React.memo(function TelaHistorico() {
    var ref1 = React.useRef(null);
    var ref2 = React.useRef(null);
    var ref3 = React.useRef(null);
    var inst1 = React.useRef(null);
    var inst2 = React.useRef(null);
    var inst3 = React.useRef(null);

    React.useEffect(function() {
      var Chart = window.Chart;
      if (!Chart) return;
      // Destruir instâncias anteriores
      [inst1, inst2, inst3].forEach(function(r) { if (r.current) { r.current.destroy(); r.current = null; } });

      var labels = MESES.map(function(m) { return m.toUpperCase(); });
      var dadosAnuais = MESES.map(function(m) { return calcularSaldo(m); });
      var tAtual = calcularTotais(mesAtual);

      // Gráfico 1 — Barras: Receitas vs Despesas
      if (ref1.current) {
        inst1.current = new Chart(ref1.current, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              { label: 'Receitas', data: dadosAnuais.map(function(d){ return d.receitas; }), backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6 },
              { label: 'Despesas', data: dadosAnuais.map(function(d){ return d.despesas; }), backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 6 }
            ]
          },
          options: { responsive: true, interaction: { mode: 'index' }, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: function(v){ return 'R$'+v.toLocaleString('pt-BR'); } } } } }
        });
      }

      // Gráfico 2 — Linha: Evolução do Saldo
      if (ref2.current) {
        var saldos = dadosAnuais.map(function(d){ return d.saldo; });
        inst2.current = new Chart(ref2.current, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Saldo (R$)',
              data: saldos,
              borderColor: '#f97316',
              backgroundColor: 'rgba(249,115,22,0.1)',
              fill: true, tension: 0.4,
              pointBackgroundColor: saldos.map(function(v){ return v >= 0 ? '#10b981' : '#ef4444'; }),
              pointRadius: 5
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { ticks: { callback: function(v){ return 'R$'+v.toLocaleString('pt-BR'); } } } } }
        });
      }

      // Gráfico 3 — Rosca: Composição do mês atual
      if (ref3.current) {
        inst3.current = new Chart(ref3.current, {
          type: 'doughnut',
          data: {
            labels: ['Cartões', 'Fixos', 'Variáveis', 'Extras'],
            datasets: [{ data: [tAtual.cartoes, tAtual.fixos, tAtual.variaveis, tAtual.extras], backgroundColor: ['#f97316','#f59e0b','#10b981','#ef4444'], borderWidth: 2, hoverOffset: 6 }]
          },
          options: { responsive: true, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: function(ctx){ return ctx.label + ': R$ ' + ctx.parsed.toLocaleString('pt-BR',{minimumFractionDigits:2}); } } } } }
        });
      }

      return function() {
        [inst1, inst2, inst3].forEach(function(r) { if (r.current) { r.current.destroy(); r.current = null; } });
      };
    }, [mesAtual, anoAtual]);

    return React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' } },
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: '800', color: '#1e1b4b', margin: 0 } }, '📈 Histórico ' + anoAtual),
        React.createElement('span', { style: { fontSize: '0.72rem', background: '#eef2ff', color: '#f97316', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' } }, mesAtual.toUpperCase())
      ),
      // Card 1: Barras
      React.createElement('div', { style: { background: C.bg, borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } },
        React.createElement('div', { style: { fontSize: '0.72rem', fontWeight: '800', letterSpacing: '1px', color: '#f97316', marginBottom: '14px', textTransform: 'uppercase' } }, '📊 Receitas vs Despesas — ' + anoAtual),
        React.createElement('canvas', { ref: ref1, style: { maxHeight: '220px' } })
      ),
      // Cards 2 e 3 lado a lado
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1.5fr 1fr', gap: '16px' } },
        React.createElement('div', { style: { background: C.bg, borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } },
          React.createElement('div', { style: { fontSize: '0.72rem', fontWeight: '800', letterSpacing: '1px', color: '#f97316', marginBottom: '14px', textTransform: 'uppercase' } }, '📈 Evolução do Saldo'),
          React.createElement('canvas', { ref: ref2, style: { maxHeight: '200px' } })
        ),
        React.createElement('div', { style: { background: C.bg, borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } },
          React.createElement('div', { style: { fontSize: '0.72rem', fontWeight: '800', letterSpacing: '1px', color: '#f97316', marginBottom: '14px', textTransform: 'uppercase' } }, '🍩 Composição ' + mesAtual.toUpperCase()),
          React.createElement('canvas', { ref: ref3, style: { maxHeight: '200px' } })
        )
      )
    );
  });
  // ────────────────────────────────────────────────────────────────────────────

  const TelaPlanejamento = () => {
    // Controlar aba via telaAtiva do menu
    const abaAtiva = telaAtiva === 'planejamento-orcamento' || telaAtiva === 'planejamento-premes' ? 'orcamento' : telaAtiva === 'planejamento-metas' || telaAtiva === 'planejamento-dividas' ? 'metas' : telaAtiva === 'planejamento-compra' || telaAtiva === 'planejamento-simulador' || telaAtiva === 'planejamento-aposentadoria' || telaAtiva === 'planejamento-quitacao' ? 'simulacoes' : telaAtiva === 'planejamento-historico' ? 'historico' : 'diagnostico';
    const subAba = telaAtiva === 'planejamento-premes' ? 'premes' : telaAtiva === 'planejamento-dividas' ? 'dividas' : telaAtiva === 'planejamento-compra' ? 'compra' : telaAtiva === 'planejamento-simulador' ? 'simulador' : telaAtiva === 'planejamento-aposentadoria' ? 'aposentadoria' : telaAtiva === 'planejamento-quitacao' ? 'quitacao' : telaAtiva === 'planejamento-timeline' ? 'timeline' : null;

    // Estados do Simulador
    const [simulacao, setSimulacao] = useState({
      rendaAjuste: 0,
      // % de ajuste
      gastosAjuste: 0,
      // % de ajuste
      quitarDivida: null,
      // ID da dívida
      novaReceita: 0,
      // valor adicional
      novaDespesa: 0 // valor adicional
    });
    const [simCompra, setSimCompra] = useState({ nome:'', valor:'', forma:'avista', parcelas:12, taxaJuros:2.5, resultado:null });
    const [simApos, setSimApos] = useState({ idadeAtual:30, idadeAposentadoria:65, patrimonioAtual:0, aporteMensal:500, taxaAnual:8, inflacao:4, rendaDesejada:5000, resultado:null });
    const [simQuit, setSimQuit] = useState({ nomeDiv:'', saldoDevedor:'', taxaMensal:'', pagamentoAtual:'', pagamentoExtra:'', estrategia:'avalanche', resultado:null });
    // Metas: modais locais
    const [metaSelecionada,  setMetaSelecionada]  = useState(null);
    const [modalMetaAberto,  setModalMetaAberto]  = useState(null); // 'depositar' | 'editar'
    const [depositarValor,   setDepositarValor]   = useState('');
    const [editMetaForm,     setEditMetaForm]     = useState({});
    const fecharModalMeta = function() { setModalMetaAberto(null); setMetaSelecionada(null); setDepositarValor(''); setEditMetaForm({}); };
    const orcadoTotal = orcamento.cartoes + orcamento.fixos + orcamento.variaveis;
    const gastadoTotal = totais.total;
    const diferenca = orcadoTotal - gastadoTotal;
    const dentroOrcamento = diferenca >= 0;

    // Planejados do mês atual
    const planejadosDoMes = planejadosMes.filter(p => p.mes === mesAtual);
    const totalPlanejado = planejadosDoMes.reduce((sum, p) => sum + p.valor, 0);
    const totalExecutado = planejadosDoMes.filter(p => p.executado).reduce((sum, p) => sum + p.valor, 0);
    const totalPendente = totalPlanejado - totalExecutado;

    // 📊 SCORE DE SAÚDE FINANCEIRA
    const calcularScore = () => {
      let score = 0;
      const criterios = [];

      // 1. Possui saldo positivo (30 pontos)
      if (saldo.positivo) {
        score += 30;
        criterios.push({
          nome: '✅ Saldo Positivo',
          pontos: 30
        });
      } else {
        criterios.push({
          nome: '❌ Saldo Negativo',
          pontos: 0
        });
      }

      // 2. Dentro do orçamento (25 pontos)
      if (dentroOrcamento) {
        score += 25;
        criterios.push({
          nome: '✅ Dentro do Orçamento',
          pontos: 25
        });
      } else {
        criterios.push({
          nome: '⚠️ Acima do Orçamento',
          pontos: 0
        });
      }

      // 3. Reserva de emergência (30 pontos)
      const reservaIdeal = gastadoTotal * 6; // 6 meses de despesas
      const reservaAtual = reservaEmergencia; // Valor real informado pelo usuário
      const percentualReserva = reservaIdeal > 0 ? reservaAtual / reservaIdeal * 100 : 0;
      if (percentualReserva >= 100) {
        score += 30;
        criterios.push({
          nome: '✅ Reserva Completa (6+ meses)',
          pontos: 30
        });
      } else if (percentualReserva >= 50) {
        score += 20;
        criterios.push({
          nome: '⚠️ Reserva Parcial (3-6 meses)',
          pontos: 20
        });
      } else if (percentualReserva >= 16) {
        score += 10;
        criterios.push({
          nome: '⚠️ Reserva Baixa (1-3 meses)',
          pontos: 10
        });
      } else {
        criterios.push({
          nome: '❌ Sem Reserva Adequada',
          pontos: 0
        });
      }

      // 4. Capacidade de poupança (15 pontos)
      const percentualPoupanca = saldo.positivo ? saldo.saldo / saldo.receitas * 100 : 0;
      if (percentualPoupanca >= 20) {
        score += 15;
        criterios.push({
          nome: '✅ Economiza 20%+',
          pontos: 15
        });
      } else if (percentualPoupanca >= 10) {
        score += 10;
        criterios.push({
          nome: '⚠️ Economiza 10-20%',
          pontos: 10
        });
      } else if (percentualPoupanca > 0) {
        score += 5;
        criterios.push({
          nome: '⚠️ Economiza menos de 10%',
          pontos: 5
        });
      } else {
        criterios.push({
          nome: '❌ Não está economizando',
          pontos: 0
        });
      }
      return {
        score,
        criterios,
        reservaIdeal,
        reservaAtual,
        percentualReserva,
        percentualPoupanca
      };
    };
    const scoreSaude = calcularScore();

    // Determinar cor e label do score
    const getScoreColor = score => {
      if (score >= 80) return {
        bg: 'from-green-500 to-green-600',
        text: 'Excelente',
        emoji: '🎉'
      };
      if (score >= 60) return {
        bg: 'from-blue-500 to-blue-600',
        text: 'Bom',
        emoji: '👍'
      };
      if (score >= 40) return {
        bg: 'from-yellow-500 to-yellow-600',
        text: 'Regular',
        emoji: '⚠️'
      };
      return {
        bg: 'from-red-500 to-red-600',
        text: 'Crítico',
        emoji: '🚨'
      };
    };
    const scoreInfo = getScoreColor(scoreSaude.score);

    // 🎯 FUNÇÕES DE METAS FINANCEIRAS
    const adicionarMeta = meta => {
      const novaMeta = {
        id: Date.now(),
        titulo: meta.titulo,
        valor: safeFloat(meta.valor),
        valorAtual: 0,
        prazo: meta.prazo,
        // 'curto', 'medio', 'longo'
        prioridade: parseInt(meta.prioridade),
        // 1-5
        dataInicio: new Date().toISOString(),
        dataMeta: meta.dataMeta,
        categoria: meta.categoria,
        // 'reserva', 'viagem', 'investimento', 'compra', 'outros'
        concluida: false
      };
      setMetasFinanceiras([...metasFinanceiras, novaMeta]);
      setModalAberto(null);
      alert('✅ Meta criada com sucesso!');
    };
    const atualizarProgressoMeta = (id, novoValor) => {
      setMetasFinanceiras(metasFinanceiras.map(m => m.id === id ? {
        ...m,
        valorAtual: parseFloat(novoValor)
      } : m));
    };
    const concluirMeta = id => {
      setMetasFinanceiras(metasFinanceiras.map(m => m.id === id ? {
        ...m,
        concluida: true,
        valorAtual: m.valor
      } : m));
    };
    const deletarMeta = id => {
      if (confirm('Tem certeza que deseja excluir esta meta?')) {
        setMetasFinanceiras(metasFinanceiras.filter(m => m.id !== id));
      }
    };

    // 💳 FUNÇÕES DE DÍVIDAS
    const adicionarDivida = divida => {
      const novaDivida = {
        id: Date.now(),
        nome: divida.nome,
        valorTotal: safeFloat(divida.valorTotal),
        saldoDevedor: safeFloat(divida.saldoDevedor),
        taxaJuros: safeFloat(divida.taxaJuros),
        parcelaMinima: safeFloat(divida.parcelaMinima),
        vencimento: parseInt(divida.vencimento)
      };
      setDividas([...dividas, novaDivida]);
    };
    const atualizarDivida = (id, campo, valor) => {
      setDividas(dividas.map(d => d.id === id ? {
        ...d,
        [campo]: parseFloat(valor)
      } : d));
    };
    const deletarDivida = id => {
      if (confirm('Tem certeza que deseja excluir esta dívida?')) {
        setDividas(dividas.filter(d => d.id !== id));
      }
    };

    // Calcular estratégias de pagamento
    const calcularEstrategias = () => {
      if (dividas.length === 0) return null;
      const disponivel = saldo.positivo ? saldo.saldo : 0;

      // BOLA DE NEVE: Ordena por menor saldo
      const bolaDeNeve = [...dividas].sort((a, b) => a.saldoDevedor - b.saldoDevedor);

      // AVALANCHE: Ordena por maior juros
      const avalanche = [...dividas].sort((a, b) => b.taxaJuros - a.taxaJuros);

      // Calcular tempo e juros para cada estratégia
      const simularEstrategia = ordem => {
        let dividasSimuladas = ordem.map(d => ({
          ...d
        }));
        let meses = 0;
        let jurosTotal = 0;
        while (dividasSimuladas.some(d => d.saldoDevedor > 0) && meses < 360) {
          meses++;

          // Aplicar juros
          dividasSimuladas.forEach(d => {
            if (d.saldoDevedor > 0) {
              const juros = d.saldoDevedor * (d.taxaJuros / 100);
              d.saldoDevedor += juros;
              jurosTotal += juros;
            }
          });

          // Pagar parcelas mínimas
          let sobra = disponivel;
          dividasSimuladas.forEach(d => {
            if (d.saldoDevedor > 0 && sobra >= d.parcelaMinima) {
              d.saldoDevedor -= d.parcelaMinima;
              sobra -= d.parcelaMinima;
            }
          });

          // Aplicar sobra na primeira dívida não quitada
          for (let d of dividasSimuladas) {
            if (d.saldoDevedor > 0 && sobra > 0) {
              const pagamento = Math.min(sobra, d.saldoDevedor);
              d.saldoDevedor -= pagamento;
              sobra -= pagamento;
              break;
            }
          }
        }
        return {
          meses,
          jurosTotal
        };
      };
      return {
        bolaDeNeve: simularEstrategia(bolaDeNeve),
        avalanche: simularEstrategia(avalanche),
        disponivel
      };
    };
    const estrategias = calcularEstrategias();

    // Separar metas por prazo
    const metasCurtoPrazo = metasFinanceiras.filter(m => m.prazo === 'curto' && !m.concluida);
    const metasMedioPrazo = metasFinanceiras.filter(m => m.prazo === 'medio' && !m.concluida);
    const metasLongoPrazo = metasFinanceiras.filter(m => m.prazo === 'longo' && !m.concluida);
    const metasConcluidas = metasFinanceiras.filter(m => m.concluida);

    // Calcular totais
    const totalMetasValor = metasFinanceiras.filter(m => !m.concluida).reduce((sum, m) => sum + m.valor, 0);
    const totalMetasAtual = metasFinanceiras.filter(m => !m.concluida).reduce((sum, m) => sum + m.valorAtual, 0);
    const percentualMetasGeral = totalMetasValor > 0 ? totalMetasAtual / totalMetasValor * 100 : 0;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-base font-bold text-gray-800"
    }, "\uD83D\uDCCB Planejamento")),
    abaAtiva === 'diagnostico' && (() => {
      window.__diagCtx = {
        scoreSaude, scoreInfo, saldo, totais, orcamento,
        dentroOrcamento, reservaEmergencia, setReservaEmergencia,
        mesAtual, anoAtual, subAba, setTelaAtiva,
        metasFinanceiras, dividas,
      };
      return window.DiagnosticoComponent
        ? window.DiagnosticoComponent()
        : /*#__PURE__*/React.createElement('div', {style:{padding:'20px',color:'#999'}}, 'Carregando diagnóstico...');
    })(),
// Novo bloco Orçamento redesenhado - 3 colunas profissionais
(abaAtiva === 'orcamento' && !subAba) && /*#__PURE__*/React.createElement("div", {
  className: "space-y-3"
}, /*#__PURE__*/React.createElement("div", {
  style: {display:'flex', gap:'8px', marginBottom:'16px'}
}, /*#__PURE__*/React.createElement("button", {
  onClick: ()=>setTelaAtiva('planejamento-orcamento'),
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:'#f97316', color:'#fff', transition:'all 0.15s'}
}, "📊 Orçamento"), /*#__PURE__*/React.createElement("button", {
  onClick: ()=>setTelaAtiva('planejamento-premes'),
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:C.bgTable, color:C.textMuted, transition:'all 0.15s'}
}, "📝 Pré-Mês")),

// GRID 3 COLUNAS
/*#__PURE__*/React.createElement("div", {
  style: {display:'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1.5fr 1fr', gap:'16px', alignItems:'start'}
},

// ═══════════════════════════════════════════════════════════
// COLUNA ESQUERDA: Resumo + Ação
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},
  
  // Card: Status Orçamento (escuro)
  /*#__PURE__*/React.createElement("div", {
    style: {
      background: dentroOrcamento ? '#065f46' : '#991b1b',
      borderRadius:'16px',
      padding:'20px',
      border: dentroOrcamento ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
      boxShadow: dentroOrcamento ? '0 4px 20px rgba(16,185,129,0.25)' : '0 4px 20px rgba(239,68,68,0.25)',
      color:'#fff'
    }
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:'12px'}}, 
      dentroOrcamento ? '✅ Status Orçamento' : '⚠️ Status Orçamento'
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'2.2rem', fontWeight:'900', marginBottom:'8px'}},
      'R$ ' + Math.abs(diferenca).toFixed(0)
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', opacity:0.85}},
      dentroOrcamento ? 'Ainda disponível' : 'Acima do orçado'
    ),
    /*#__PURE__*/React.createElement("div", {style:{borderTop:'1px solid rgba(255,255,255,0.15)', marginTop:'14px', paddingTop:'14px', display:'flex', justifyContent:'space-between', fontSize:'0.75rem'}},
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("div", {style:{opacity:0.6, marginBottom:'3px'}}, 'Orçado'),
        /*#__PURE__*/React.createElement("div", {style:{fontWeight:'700'}}, 'R$ ' + orcadoTotal.toFixed(0))
      ),
      /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
        /*#__PURE__*/React.createElement("div", {style:{opacity:0.6, marginBottom:'3px'}}, 'Gasto'),
        /*#__PURE__*/React.createElement("div", {style:{fontWeight:'700'}}, 'R$ ' + gastadoTotal.toFixed(0))
      )
    )
  ),
  
  // Card: Taxa de Utilização
  /*#__PURE__*/React.createElement("div", {
    style: {background:C.bg, borderRadius:'16px', padding:'20px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:C.textMuted, marginBottom:'14px'}}, 
      '📊 Utilização'
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'16px'}},
      // Gauge circular
      /*#__PURE__*/React.createElement("svg", {width:90, height:90, viewBox:"0 0 90 90", style:{flexShrink:0}},
        /*#__PURE__*/React.createElement("circle", {cx:45, cy:45, r:35, fill:'none', stroke:'#f3f4f6', strokeWidth:8}),
        orcadoTotal > 0 && /*#__PURE__*/React.createElement("circle", {
          cx:45, cy:45, r:35, fill:'none', 
          stroke: dentroOrcamento ? '#10b981' : '#ef4444',
          strokeWidth:8,
          strokeDasharray: `${Math.min(100, gastadoTotal/orcadoTotal*100)/100*220} 220`,
          strokeDashoffset:55,
          strokeLinecap:'round'
        }),
        /*#__PURE__*/React.createElement("text", {x:45, y:48, textAnchor:'middle', fontSize:'18', fontWeight:'900', fill: dentroOrcamento ? '#10b981' : '#ef4444'},
          orcadoTotal > 0 ? Math.min(100, gastadoTotal/orcadoTotal*100).toFixed(0) : '0'
        ),
        /*#__PURE__*/React.createElement("text", {x:45, y:58, textAnchor:'middle', fontSize:'8', fill:'#9ca3af'}, '%')
      ),
      /*#__PURE__*/React.createElement("div", {style:{flex:1}},
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:C.text, marginBottom:'6px'}},
          orcadoTotal > 0 
            ? `R$ ${gastadoTotal.toFixed(2)} de R$ ${orcadoTotal.toFixed(2)}` 
            : 'Orçamento não definido'
        ),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', fontWeight:'700', color: dentroOrcamento ? '#10b981' : '#ef4444'}},
          orcadoTotal > 0
            ? (dentroOrcamento ? '✅ No limite' : '🚨 Estourado')
            : '⚠️ Configure seu orçamento'
        )
      )
    )
  ),

  // Botão Definir Orçamento
  /*#__PURE__*/React.createElement("button", {
    onClick: () => setModalAberto('orcamento'),
    style: {
      width:'100%', padding:'14px', border:'none', borderRadius:'12px',
      background:'#f97316', 
      color:'#fff', fontSize:'0.85rem', fontWeight:'700',
      cursor:'pointer', boxShadow:'0 4px 12px rgba(249,115,22,0.3)',
      transition:'all 0.2s'
    }
  }, '⚙️ ' + (orcadoTotal > 0 ? 'Ajustar Orçamento' : 'Definir Orçamento'))
),

// ═══════════════════════════════════════════════════════════
// COLUNA CENTRAL: Detalhamento por Categoria
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {
  style: {background:C.bg, borderRadius:'16px', padding:'20px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
},
  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}},
    /*#__PURE__*/React.createElement("h3", {style:{fontSize:'0.9rem', fontWeight:'800', color:C.text}}, '📋 Detalhamento'),
    orcadoTotal > 0 && /*#__PURE__*/React.createElement("span", {
      style:{fontSize:'0.68rem', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', 
        background: dentroOrcamento ? '#d1fae5' : '#fee2e2',
        color: dentroOrcamento ? '#065f46' : '#991b1b'
      }
    }, (gastadoTotal/orcadoTotal*100).toFixed(0) + '% usado')
  ),
  
  // Cartões
  /*#__PURE__*/React.createElement("div", {style:{marginBottom:'20px'}},
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}},
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:C.text}}, '💳 Cartões de Crédito'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}},
          'R$ ' + totais.cartoes.toFixed(2) + ' / R$ ' + orcamento.cartoes.toFixed(2)
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'900', color: totais.cartoes <= orcamento.cartoes ? '#10b981' : '#ef4444'}},
          orcamento.cartoes > 0 ? (totais.cartoes/orcamento.cartoes*100).toFixed(0) + '%' : '—'
        ),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'600', color: orcamento.cartoes - totais.cartoes >= 0 ? '#10b981' : '#ef4444'}},
          orcamento.cartoes - totais.cartoes >= 0 ? '✅' : '⚠️'
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:C.bgTable, borderRadius:'3px', overflow:'hidden'}},
      /*#__PURE__*/React.createElement("div", {
        style:{
          height:'100%',
          width: orcamento.cartoes > 0 ? Math.min(100, totais.cartoes/orcamento.cartoes*100) + '%' : '0%',
          background: totais.cartoes <= orcamento.cartoes ? '#10b981' : '#ef4444',
          borderRadius:'3px',
          transition:'width 0.6s ease'
        }
      })
    )
  ),
  
  // Fixos
  /*#__PURE__*/React.createElement("div", {style:{marginBottom:'20px'}},
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}},
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:C.text}}, '🏠 Contas Fixas'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}},
          'R$ ' + totais.fixos.toFixed(2) + ' / R$ ' + orcamento.fixos.toFixed(2)
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'900', color: totais.fixos <= orcamento.fixos ? '#10b981' : '#ef4444'}},
          orcamento.fixos > 0 ? (totais.fixos/orcamento.fixos*100).toFixed(0) + '%' : '—'
        ),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'600', color: orcamento.fixos - totais.fixos >= 0 ? '#10b981' : '#ef4444'}},
          orcamento.fixos - totais.fixos >= 0 ? '✅' : '⚠️'
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:C.bgTable, borderRadius:'3px', overflow:'hidden'}},
      /*#__PURE__*/React.createElement("div", {
        style:{
          height:'100%',
          width: orcamento.fixos > 0 ? Math.min(100, totais.fixos/orcamento.fixos*100) + '%' : '0%',
          background: totais.fixos <= orcamento.fixos ? '#10b981' : '#ef4444',
          borderRadius:'3px',
          transition:'width 0.6s ease'
        }
      })
    )
  ),
  
  // Variáveis
  /*#__PURE__*/React.createElement("div", null,
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}},
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:C.text}}, '📊 Gastos Variáveis'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}},
          'R$ ' + totais.variaveis.toFixed(2) + ' / R$ ' + orcamento.variaveis.toFixed(2)
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'900', color: totais.variaveis <= orcamento.variaveis ? '#10b981' : '#ef4444'}},
          orcamento.variaveis > 0 ? (totais.variaveis/orcamento.variaveis*100).toFixed(0) + '%' : '—'
        ),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'600', color: orcamento.variaveis - totais.variaveis >= 0 ? '#10b981' : '#ef4444'}},
          orcamento.variaveis - totais.variaveis >= 0 ? '✅' : '⚠️'
        )
      )
    ),
    /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:C.bgTable, borderRadius:'3px', overflow:'hidden'}},
      /*#__PURE__*/React.createElement("div", {
        style:{
          height:'100%',
          width: orcamento.variaveis > 0 ? Math.min(100, totais.variaveis/orcamento.variaveis*100) + '%' : '0%',
          background: totais.variaveis <= orcamento.variaveis ? '#10b981' : '#ef4444',
          borderRadius:'3px',
          transition:'width 0.6s ease'
        }
      })
    )
  )
),

// ═══════════════════════════════════════════════════════════
// COLUNA DIREITA: Insights + Composição
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},
  
  // Card: Composição do Orçamento
  /*#__PURE__*/React.createElement("div", {
    style: {background:C.bg, borderRadius:'16px', padding:'20px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:C.textMuted, marginBottom:'14px'}}, 
      '🥧 Composição'
    ),
    orcadoTotal > 0 
      ? /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'10px'}},
          // Cartões %
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#f97316', flexShrink:0}}),
            /*#__PURE__*/React.createElement("div", {style:{flex:1}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:C.text}}, 'Cartões'),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text}},
                (orcamento.cartoes/orcadoTotal*100).toFixed(0) + '%'
              )
            )
          ),
          // Fixos %
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#fb923c', flexShrink:0}}),
            /*#__PURE__*/React.createElement("div", {style:{flex:1}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:C.text}}, 'Fixos'),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text}},
                (orcamento.fixos/orcadoTotal*100).toFixed(0) + '%'
              )
            )
          ),
          // Variáveis %
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#10b981', flexShrink:0}}),
            /*#__PURE__*/React.createElement("div", {style:{flex:1}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:C.text}}, 'Variáveis'),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text}},
                (orcamento.variaveis/orcadoTotal*100).toFixed(0) + '%'
              )
            )
          )
        )
      : /*#__PURE__*/React.createElement("div", {style:{textAlign:'center', padding:'20px 0', color:'#d1d5db'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'2rem', marginBottom:'8px'}}, '📋'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem'}}, 'Defina seu orçamento')
        )
  ),
  
  // Card: Dicas
  /*#__PURE__*/React.createElement("div", {
    style: {
      background:'#fef3c7',
      borderRadius:'16px',
      padding:'16px',
      border:'1px solid #fde68a'
    }
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:'#92400e', marginBottom:'6px'}}, 
      '💡 Dica'
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#78350f', lineHeight:1.5}},
      dentroOrcamento
        ? 'Você está dentro do orçamento! Continue monitorando seus gastos para manter o controle.'
        : orcadoTotal > 0
          ? 'Atenção: você ultrapassou o orçamento. Revise seus gastos e ajuste o planejamento.'
          : 'Defina um orçamento para cada categoria e acompanhe seus gastos mensais.'
    )
  )
)
,

// ── Feature C: Gastos Variáveis & Extras por Categoria ────────────────
(function(){
  var catV={};
  gastosVariaveis.filter(function(g){return g.mes===mesAtual&&g.ano===anoAtual;}).forEach(function(g){if(g.categoria&&g.valor)catV[g.categoria]=(catV[g.categoria]||0)+g.valor;});
  gastosExtras.filter(function(g){return g.mes===mesAtual&&g.ano===anoAtual;}).forEach(function(g){if(g.categoria&&g.valor)catV[g.categoria]=(catV[g.categoria]||0)+g.valor;});
  var arrV=Object.entries(catV).sort(function(a,b){return b[1]-a[1];});
  var totV=arrV.reduce(function(s,c){return s+c[1];},0);
  if(arrV.length===0)return null;
  var coresV=['#f97316','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#f97316','#ef4444','#ec4899','#06b6d4','#84cc16','#a78bfa','#14b8a6'];
  return React.createElement('div',{style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
    React.createElement('div',{style:{padding:'14px 20px',borderBottom:'1px solid '+C.borderLight,background:C.bgMuted,display:'flex',justifyContent:'space-between',alignItems:'center'}},
      React.createElement('div',{style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:C.textMuted}},'🏷️ Variáveis & Extras por Categoria — '+mesAtual.toUpperCase()),
      React.createElement('div',{style:{fontSize:'0.75rem',fontWeight:'800',color:C.text}},'R$ '+totV.toFixed(2))
    ),
    React.createElement('div',{style:{padding:'16px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'10px'}},
      arrV.map(function(entry,i){
        var cat=entry[0],val=entry[1];
        var p=totV>0?val/totV:0;
        var cor=coresV[i%coresV.length];
        return React.createElement('div',{key:cat,style:{padding:'10px 12px',borderRadius:'10px',background:darkMode?'rgba(255,255,255,0.03)':'#fafafa',border:'1px solid '+C.border}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}},
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
              React.createElement('div',{style:{width:'8px',height:'8px',borderRadius:'2px',background:cor,flexShrink:0}}),
              React.createElement('span',{style:{fontSize:'0.75rem',fontWeight:'700',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'140px'}},cat)
            ),
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}},
              React.createElement('span',{style:{fontSize:'0.68rem',color:C.textFaint}},(p*100).toFixed(0)+'%'),
              React.createElement('span',{style:{fontSize:'0.75rem',fontWeight:'800',color:C.text}},'R$ '+val.toFixed(2))
            )
          ),
          React.createElement('div',{style:{height:'5px',background:C.bgTable,borderRadius:'3px',overflow:'hidden'}},
            React.createElement('div',{style:{height:'100%',width:(p*100).toFixed(1)+'%',background:cor,borderRadius:'3px',transition:'width .6s ease'}})
          )
        );
      })
    )
  );
})()

)),

  (abaAtiva === 'orcamento' && subAba === 'premes') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {display:'flex', gap:'8px', marginBottom:'4px'}
    }, /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-orcamento'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: !subAba||subAba===null?'#f97316':'#f3f4f6', color: !subAba||subAba===null?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "📊 Orçamento"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-premes'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='premes'?'#f97316':'#f3f4f6', color: subAba==='premes'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "📝 Pré-Mês")),
    /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novoPlanejado'),
      className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2795 Adicionar Planejado")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Total Planejado"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-blue-600"
    }, "R$ ", totalPlanejado.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, planejadosDoMes.length, " itens")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Executado"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-green-600"
    }, "R$ ", totalExecutado.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, totalPlanejado > 0 ? (totalExecutado / totalPlanejado * 100).toFixed(0) : 0, "%")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Pendente"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-orange-600"
    }, "R$ ", totalPendente.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, planejadosDoMes.filter(p => !p.executado).length, " itens"))), totalPlanejado > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "Progresso de Execu\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, (totalExecutado / totalPlanejado * 100).toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all",
      style: {
        width: `${totalExecutado / totalPlanejado * 100}%`
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "Gastos Planejados - ", mesAtual.toUpperCase()), planejadosDoMes.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "text-center py-12 text-gray-500"
    }, "Nenhum gasto planejado para este m\xEAs.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novoPlanejado'),
      className: "mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2795 Adicionar Primeiro Planejado")) : /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, planejadosDoMes.map(planejado => /*#__PURE__*/React.createElement("div", {
      key: planejado.id,
      className: `flex items-center justify-between p-4 rounded-lg border-2 transition-all ${planejado.executado ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-gray-300'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4 flex-1"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => togglePlanejado(planejado.id),
      className: `w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${planejado.executado ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'}`
    }, planejado.executado && /*#__PURE__*/React.createElement("svg", {
      className: "w-4 h-4 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "2",
      d: "M5 13l4 4L19 7"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: `font-semibold ${planejado.executado ? 'text-green-700 line-through' : 'text-gray-800'}`
    }, planejado.descricao), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500"
    }, planejado.categoria)), /*#__PURE__*/React.createElement("div", {
      className: `text-2xl font-bold ${planejado.executado ? 'text-green-600' : 'text-gray-800'}`
    }, "R$ ", planejado.valor.toFixed(2)), /*#__PURE__*/React.createElement("button", {
      onClick: () => deletarPlanejado(planejado.id),
      className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
    }, "\uD83D\uDDD1\uFE0F")))))), planejadosDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCCA Planejado vs Real"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "Planejado"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-blue-600"
    }, "R$ ", totalPlanejado.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "Real (Gasto no M\xEAs)"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-orange-600"
    }, "R$ ", totais.total.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: `mt-4 p-4 rounded-lg ${totais.total <= totalPlanejado ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: `text-center font-bold ${totais.total <= totalPlanejado ? 'text-green-700' : 'text-red-700'}`
    }, totais.total <= totalPlanejado ? '✅ Dentro do Planejado!' : '⚠️ Acima do Planejado'), /*#__PURE__*/React.createElement("div", {
      className: "text-center text-sm mt-2"
    }, "Diferen\xE7a: R$ ", Math.abs(totalPlanejado - totais.total).toFixed(2))))),
// Novo bloco Metas redesenhado - 3 colunas profissionais
(abaAtiva === 'metas' && !subAba) && /*#__PURE__*/React.createElement("div", {
  className: "space-y-3"
}, /*#__PURE__*/React.createElement("div", {
  style: {display:'flex', gap:'8px', marginBottom:'16px'}
}, /*#__PURE__*/React.createElement("button", {
  onClick: ()=>setTelaAtiva('planejamento-metas'),
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:'#f97316', color:'#fff', transition:'all 0.15s'}
}, "🎯 Metas"), /*#__PURE__*/React.createElement("button", {
  onClick: ()=>setTelaAtiva('planejamento-dividas'),
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:C.bgTable, color:C.textMuted, transition:'all 0.15s'}
}, "💳 Dívidas")),

// GRID 3 COLUNAS
/*#__PURE__*/React.createElement("div", {
  style: {display:'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1.5fr 1fr', gap:'16px', alignItems:'start'}
},

// ═══════════════════════════════════════════════════════════
// COLUNA ESQUERDA: Resumo + Ação
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},
  
  // Card: Progresso Geral (escuro)
  /*#__PURE__*/React.createElement("div", {
    style: {
      background: percentualMetasGeral >= 75 
        ? '#065f46'
        : percentualMetasGeral >= 40
          ? '#1e1b4b'
          : '#92400e',
      borderRadius:'16px',
      padding:'20px',
      border: percentualMetasGeral >= 75 ? '1px solid rgba(16,185,129,0.3)' : percentualMetasGeral >= 40 ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(245,158,11,0.3)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      color:'#fff'
    }
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:'12px'}}, 
      '🎯 Progresso Geral'
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', fontWeight:'900', marginBottom:'8px'}},
      percentualMetasGeral.toFixed(0) + '%'
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', opacity:0.85, marginBottom:'14px'}},
      'das metas ativas'
    ),
    // Barra de progresso
    /*#__PURE__*/React.createElement("div", {style:{height:'8px', background:'rgba(255,255,255,0.15)', borderRadius:'4px', overflow:'hidden', marginBottom:'14px'}},
      /*#__PURE__*/React.createElement("div", {
        style:{
          height:'100%',
          width: percentualMetasGeral + '%',
          background:C.bg,
          borderRadius:'4px',
          transition:'width 0.8s ease'
        }
      })
    ),
    /*#__PURE__*/React.createElement("div", {style:{borderTop:'1px solid rgba(255,255,255,0.15)', paddingTop:'14px', display:'flex', justifyContent:'space-between', fontSize:'0.75rem'}},
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("div", {style:{opacity:0.6, marginBottom:'3px'}}, 'Acumulado'),
        /*#__PURE__*/React.createElement("div", {style:{fontWeight:'700'}}, 'R$ ' + totalMetasAtual.toFixed(0))
      ),
      /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
        /*#__PURE__*/React.createElement("div", {style:{opacity:0.6, marginBottom:'3px'}}, 'Objetivo'),
        /*#__PURE__*/React.createElement("div", {style:{fontWeight:'700'}}, 'R$ ' + totalMetasValor.toFixed(0))
      )
    )
  ),
  
  // Card: Estatísticas
  /*#__PURE__*/React.createElement("div", {
    style: {background:C.bg, borderRadius:'16px', padding:'20px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:C.textMuted, marginBottom:'14px'}}, 
      '📊 Estatísticas'
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', color:C.textMuted}}, 'Metas Ativas'),
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#f97316'}}, 
          metasFinanceiras.filter(m => !m.concluida).length
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', color:C.textMuted}}, 'Concluídas'),
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#10b981'}}, 
          metasConcluidas.length
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', color:C.textMuted}}, 'Falta Acumular'),
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#f59e0b'}}, 
          'R$ ' + (totalMetasValor - totalMetasAtual).toFixed(0)
        )
      )
    )
  ),

  // Botão Nova Meta
  /*#__PURE__*/React.createElement("button", {
    onClick: () => setModalAberto('novaMeta'),
    style: {
      width:'100%', padding:'14px', border:'none', borderRadius:'12px',
      background:'#f97316', 
      color:'#fff', fontSize:'0.85rem', fontWeight:'700',
      cursor:'pointer', boxShadow:'0 4px 12px rgba(249,115,22,0.3)',
      transition:'all 0.2s'
    }
  }, '➕ Nova Meta')
),

// ═══════════════════════════════════════════════════════════
// COLUNA CENTRAL: Lista de Metas
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {
  style: {background:C.bg, borderRadius:'16px', padding:'20px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
},
  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}},
    /*#__PURE__*/React.createElement("h3", {style:{fontSize:'0.9rem', fontWeight:'800', color:C.text}}, '🎯 Suas Metas'),
    metasFinanceiras.filter(m => !m.concluida).length > 0 && /*#__PURE__*/React.createElement("span", {
      style:{fontSize:'0.68rem', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:'#fff7ed', color:'#ea580c'}
    }, metasFinanceiras.filter(m => !m.concluida).length + ' ativas')
  ),
  
  metasFinanceiras.length === 0
    ? /*#__PURE__*/React.createElement("div", {style:{textAlign:'center', padding:'40px 20px', color:'#d1d5db'}},
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, '🎯'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'600', color:C.textFaint, marginBottom:'6px'}}, 
          'Nenhuma meta cadastrada'
        ),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', color:'#d1d5db'}}, 
          'Comece definindo seus objetivos financeiros'
        )
      )
    : /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},
        ...metasFinanceiras.filter(m => !m.concluida).map((meta, idx) => {
          const progresso = meta.valor > 0 ? (meta.valorAtual || 0) / meta.valor * 100 : 0;
          const falta = Math.max(0, meta.valor - (meta.valorAtual || 0));
          return /*#__PURE__*/React.createElement("div", {
            key: meta.id,
            style: {
              background: C.bgMuted || '#fafafa',
              borderRadius:'12px',
              padding:'14px',
              border:'1px solid '+C.border,
              transition:'all 0.2s'
            }
          },
            // Header: título + percentual
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}},
              /*#__PURE__*/React.createElement("div", {style:{flex:1}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text, marginBottom:'4px'}},
                  meta.titulo
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint}},
                  'R$ ' + (meta.valorAtual || 0).toFixed(2) + ' de R$ ' + meta.valor.toFixed(2)
                )
              ),
              /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'900', color:'#f97316'}},
                  progresso.toFixed(0) + '%'
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', color:C.textFaint, marginTop:'2px'}},
                  meta.prazo === 'curto' ? '📅 Curto' : meta.prazo === 'medio' ? '📅 Médio' : '📅 Longo'
                )
              )
            ),
            // Barra de progresso
            /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden', marginBottom:'8px'}},
              /*#__PURE__*/React.createElement("div", {
                style:{
                  height:'100%',
                  width: Math.min(100, progresso) + '%',
                  background: progresso >= 75 ? '#10b981' : progresso >= 40 ? '#f97316' : '#f59e0b',
                  borderRadius:'3px',
                  transition:'width 0.6s ease'
                }
              })
            ),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textMuted, marginBottom:'10px'}},
              'Faltam: R$ ' + falta.toFixed(2)
            ),
            // Botões de ação
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'6px', flexWrap:'wrap'}},
              /*#__PURE__*/React.createElement("button", {
                onClick: function(e) { e.stopPropagation(); setMetaSelecionada(meta); setDepositarValor(''); setModalMetaAberto('depositar'); },
                style:{flex:1, padding:'7px 10px', border:'none', borderRadius:'8px', background:'#059669', color:'#fff', fontSize:'0.72rem', fontWeight:'700', cursor:'pointer'}
              }, '💰 Depositar'),
              /*#__PURE__*/React.createElement("button", {
                onClick: function(e) { e.stopPropagation(); setMetaSelecionada(meta); setEditMetaForm({ titulo:meta.titulo, valor:String(meta.valor), valorAtual:String(meta.valorAtual||0), prazo:meta.prazo||'curto', dataMeta:meta.dataMeta||'' }); setModalMetaAberto('editar'); },
                style:{padding:'7px 10px', border:'1.5px solid '+C.border, borderRadius:'8px', background:'transparent', color:C.text, fontSize:'0.72rem', fontWeight:'700', cursor:'pointer'}
              }, '✏️ Editar'),
              /*#__PURE__*/React.createElement("button", {
                onClick: function(e) { e.stopPropagation(); if(confirm('Excluir a meta "'+meta.titulo+'"?')) deletarMeta(meta.id); },
                style:{padding:'7px 10px', border:'1.5px solid #fca5a5', borderRadius:'8px', background:'transparent', color:'#dc2626', fontSize:'0.72rem', fontWeight:'700', cursor:'pointer'}
              }, '🗑️')
            )
          );
        })
      )
),

// ═══════════════════════════════════════════════════════════
// COLUNA DIREITA: Dicas + Por Prazo
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},
  
  // Card: Distribuição por Prazo
  /*#__PURE__*/React.createElement("div", {
    style: {background:C.bg, borderRadius:'16px', padding:'20px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:C.textMuted, marginBottom:'14px'}}, 
      '📅 Por Prazo'
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'10px'}},
      // Curto prazo
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
        /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#10b981', flexShrink:0}}),
        /*#__PURE__*/React.createElement("div", {style:{flex:1}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:C.text}}, 'Curto Prazo'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text}},
            metasCurtoPrazo.length + ' ' + (metasCurtoPrazo.length === 1 ? 'meta' : 'metas')
          )
        )
      ),
      // Médio prazo
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
        /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#f97316', flexShrink:0}}),
        /*#__PURE__*/React.createElement("div", {style:{flex:1}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:C.text}}, 'Médio Prazo'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text}},
            metasMedioPrazo.length + ' ' + (metasMedioPrazo.length === 1 ? 'meta' : 'metas')
          )
        )
      ),
      // Longo prazo
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
        /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#f97316', flexShrink:0}}),
        /*#__PURE__*/React.createElement("div", {style:{flex:1}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:C.text}}, 'Longo Prazo'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:C.text}},
            metasLongoPrazo.length + ' ' + (metasLongoPrazo.length === 1 ? 'meta' : 'metas')
          )
        )
      )
    )
  ),
  
  // Card: Dica
  /*#__PURE__*/React.createElement("div", {
    style: {
      background:'#dbeafe',
      borderRadius:'16px',
      padding:'16px',
      border:'1px solid #bfdbfe'
    }
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:'#1e40af', marginBottom:'6px'}}, 
      '💡 Dica'
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#1e3a8a', lineHeight:1.5}},
      metasFinanceiras.filter(m => !m.concluida).length > 0
        ? percentualMetasGeral >= 50
          ? 'Você está no caminho certo! Continue guardando mensalmente para alcançar suas metas.'
          : 'Defina um valor mensal para cada meta e torne o hábito de poupar automático.'
        : 'Comece definindo suas metas financeiras: viagem, casa própria, reserva de emergência ou investimento.'
    )
  ),
  
  // Card: Metas Concluídas
  metasConcluidas.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background:'#d1fae5',
      borderRadius:'16px',
      padding:'16px',
      border:'1px solid #a7f3d0'
    }
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:'#065f46', marginBottom:'6px'}}, 
      '🎉 ' + metasConcluidas.length + ' ' + (metasConcluidas.length === 1 ? 'Meta Concluída' : 'Metas Concluídas')
    ),
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#047857', lineHeight:1.5}},
      'Parabéns! Continue definindo novos objetivos.'
    )
  )
)

)),
  (abaAtiva === 'metas' && subAba === 'dividas') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {display:'flex', gap:'8px', marginBottom:'4px'}
    }, /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-metas'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: !subAba||subAba===null?'#f97316':'#f3f4f6', color: !subAba||subAba===null?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🎯 Metas"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-dividas'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='dividas'?'#f97316':'#f3f4f6', color: subAba==='dividas'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "💳 Dívidas")),
    /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCB3 Gerenciamento de D\xEDvidas"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Estrat\xE9gias inteligentes para quitar suas d\xEDvidas")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novaDivida'),
      className: "px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
    }, "\u2795 Nova D\xEDvida")), dividas.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-12 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl mb-4"
    }, "\uD83D\uDCB3"), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-2"
    }, "Nenhuma d\xEDvida cadastrada"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600 mb-3"
    }, "Cadastre suas d\xEDvidas para calcular a melhor estrat\xE9gia de pagamento"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novaDivida'),
      className: "px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
    }, "\u2795 Cadastrar Primeira D\xEDvida")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-4 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Total de D\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-red-600"
    }, dividas.length)), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Saldo Devedor"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-orange-600"
    }, "R$ ", dividas.reduce((sum, d) => sum + d.saldoDevedor, 0).toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Parcelas M\xEDnimas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-orange-600"
    }, "R$ ", dividas.reduce((sum, d) => sum + d.parcelaMinima, 0).toFixed(2), "/m\xEAs")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Dispon\xEDvel para D\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: `text-2xl font-bold ${saldo.positivo ? 'text-green-600' : 'text-red-600'}`
    }, "R$ ", saldo.positivo ? saldo.saldo.toFixed(2) : '0.00'))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCCB Suas D\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, dividas.map(divida => /*#__PURE__*/React.createElement("div", {
      key: divida.id,
      className: "border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-start mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("h5", {
      className: "font-bold text-gray-800 text-lg"
    }, divida.nome), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mt-1"
    }, "Valor total: R$ ", divida.valorTotal.toFixed(2), " \u2022 Juros: ", divida.taxaJuros, "% a.m. \u2022 Venc: dia ", divida.vencimento)), /*#__PURE__*/React.createElement("button", {
      onClick: () => deletarDivida(divida.id),
      className: "px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
    }, "\uD83D\uDDD1\uFE0F")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-600 mb-1"
    }, "Saldo Devedor"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-red-600"
    }, "R$ ", divida.saldoDevedor.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 w-full bg-gray-200 rounded-full h-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-red-500 h-2 rounded-full",
      style: {
        width: `${divida.saldoDevedor / divida.valorTotal * 100}%`
      }
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-600 mb-1"
    }, "Parcela M\xEDnima"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-orange-600"
    }, "R$ ", divida.parcelaMinima.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500 mt-2"
    }, divida.parcelaMinima > 0 ? `~${Math.ceil(divida.saldoDevedor / divida.parcelaMinima)} meses (só mínimo)` : 'Definir parcela'))))))), estrategias && estrategias.disponivel > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#f97316',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
        padding: '1.5rem',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-2xl font-bold mb-3"
    }, "\uD83C\uDFAF Estrat\xE9gias de Pagamento"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl"
    }, "\uD83D\uDD34"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
      className: "text-xl font-bold"
    }, "Bola de Neve"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm opacity-90"
    }, "Menor saldo primeiro"))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Tempo para quitar:"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, estrategias.bolaDeNeve.meses, " meses")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Total de juros:"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, "R$ ", estrategias.bolaDeNeve.jurosTotal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 p-3 bg-white bg-opacity-30 rounded"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-semibold mb-1"
    }, "\uD83D\uDCAA Vantagem:"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs"
    }, "Vit\xF3rias r\xE1pidas aumentam motiva\xE7\xE3o")))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl"
    }, "\u26A1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
      className: "text-xl font-bold"
    }, "Avalanche"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm opacity-90"
    }, "Maior juros primeiro"))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Tempo para quitar:"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, estrategias.avalanche.meses, " meses")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Total de juros:"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, "R$ ", estrategias.avalanche.jurosTotal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 p-3 bg-white bg-opacity-30 rounded"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-semibold mb-1"
    }, "\uD83D\uDCB0 Vantagem:"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs"
    }, "Economia m\xE1xima em juros"))))), /*#__PURE__*/React.createElement("div", {
      className: "mt-3 p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold mb-2"
    }, "\uD83D\uDCCA Compara\xE7\xE3o:"), estrategias.avalanche.jurosTotal < estrategias.bolaDeNeve.jurosTotal ? /*#__PURE__*/React.createElement("div", {
      className: "text-sm"
    }, "\u26A1 ", /*#__PURE__*/React.createElement("span", {
      className: "font-bold"
    }, "Avalanche economiza R$ ", (estrategias.bolaDeNeve.jurosTotal - estrategias.avalanche.jurosTotal).toFixed(2)), " em juros!") : /*#__PURE__*/React.createElement("div", {
      className: "text-sm"
    }, "\uD83D\uDD34 ", /*#__PURE__*/React.createElement("span", {
      className: "font-bold"
    }, "Bola de Neve economiza R$ ", (estrategias.avalanche.jurosTotal - estrategias.bolaDeNeve.jurosTotal).toFixed(2)), " em juros!"))), (!estrategias || estrategias.disponivel <= 0) && /*#__PURE__*/React.createElement("div", {
      className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl"
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-yellow-800 mb-1"
    }, "Sem sobra para pagar d\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-yellow-700"
    }, "Você está gastando tudo ou mais que sua renda. Para usar as estratégias de pagamento, é preciso ter sobra mensal. Revise seus gastos no orçamento!")))))),
  (abaAtiva === 'simulacoes') && React.createElement('div', {style:{padding:'0'}},

    /* ── BARRA DE ABAS DAS 4 SIMULAÇÕES ── */
    React.createElement('div', {style:{display:'flex',gap:'6px',marginBottom:'20px',background:C.bgMuted,borderRadius:'14px',padding:'6px',border:'1px solid '+C.border,flexWrap:'wrap'}},
      [
        {key:'compra',       icon:'🛒', label:'Simul. Compra',    rota:'planejamento-compra'},
        {key:'simulador',    icon:'🎲', label:'Cenários',          rota:'planejamento-simulador'},
        {key:'aposentadoria',icon:'🏖️', label:'Aposentadoria',    rota:'planejamento-aposentadoria'},
        {key:'quitacao',     icon:'💳', label:'Quitar Dívida',     rota:'planejamento-quitacao'}
      ].map(tab =>
        React.createElement('button', {
          key: tab.key,
          onClick: () => setTelaAtiva(tab.rota),
          style:{
            flex:'1', minWidth:'120px', padding:'9px 14px', borderRadius:'10px', border:'none',
            fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', transition:'all 0.2s',
            background: subAba === tab.key ? '#f97316' : 'transparent',
            color: subAba === tab.key ? '#fff' : '#64748b',
            boxShadow: subAba === tab.key ? '0 4px 12px rgba(249,115,22,0.3)' : 'none'
          }
        }, tab.icon + ' ' + tab.label)
      )
    ),

    /* ══════════════════════════════════════════════════════
       ABA 1 — SIMULADOR DE COMPRA
    ══════════════════════════════════════════════════════ */
    (subAba === 'compra') && React.createElement('div', {style:{display:'grid',gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},

      /* Coluna Esquerda: saldo + formulário */
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        React.createElement('div', {style:{background:saldo.positivo?'#065f46':'#991b1b',borderRadius:'16px',padding:'20px',color:'#fff',border:saldo.positivo?'1px solid rgba(16,185,129,0.3)':'1px solid rgba(239,68,68,0.3)',boxShadow:'0 4px 20px rgba(0,0,0,0.25)'}},
          React.createElement('div', {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'10px'}}, '💰 Saldo Disponível'),
          React.createElement('div', {style:{fontSize:'1.8rem',fontWeight:'900',marginBottom:'4px'}}, 'R$ ' + Math.abs(saldo.saldo).toFixed(2)),
          React.createElement('div', {style:{fontSize:'0.75rem',opacity:0.8}}, saldo.positivo ? 'Sobra mensal disponível' : 'Saldo negativo — cuidado!')
        ),
        React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
          React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#f97316',marginBottom:'14px'}}, '🛒 Dados da Compra'),
          React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
            React.createElement('div', null,
              React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, 'Nome do produto'),
              React.createElement('input', {type:'text', value:simCompra.nome, onChange:e=>setSimCompra({...simCompra,nome:e.target.value}), placeholder:'Ex: Notebook, TV, Carro...', style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}})
            ),
            React.createElement('div', null,
              React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, 'Valor (R$)'),
              React.createElement('input', {type:'number', value:simCompra.valor, onChange:e=>setSimCompra({...simCompra,valor:e.target.value,resultado:null}), placeholder:'0,00', style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}})
            ),
            React.createElement('div', null,
              React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, 'Forma de pagamento'),
              React.createElement('select', {value:simCompra.forma, onChange:e=>setSimCompra({...simCompra,forma:e.target.value,resultado:null}), style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}},
                React.createElement('option', {value:'avista'}, 'À Vista'),
                React.createElement('option', {value:'parcelado'}, 'Parcelado')
              )
            ),
            simCompra.forma === 'parcelado' && React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
              React.createElement('div', null,
                React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, 'Parcelas'),
                React.createElement('input', {type:'number', value:simCompra.parcelas, onChange:e=>setSimCompra({...simCompra,parcelas:parseInt(e.target.value)||1,resultado:null}), min:'1', max:'60', style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}})
              ),
              React.createElement('div', null,
                React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, 'Juros % a.m.'),
                React.createElement('input', {type:'number', value:simCompra.taxaJuros, onChange:e=>setSimCompra({...simCompra,taxaJuros:parseFloat(e.target.value)||0,resultado:null}), step:'0.1', min:'0', style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}})
              )
            ),
            React.createElement('button', {
              onClick: () => {
                const valor = parseFloat(simCompra.valor) || 0;
                if (!valor) return;
                let totalPago, parcela, jurosTotal;
                if (simCompra.forma === 'avista') {
                  totalPago = valor; parcela = valor; jurosTotal = 0;
                } else {
                  const taxa = simCompra.taxaJuros / 100;
                  const n = simCompra.parcelas;
                  if (taxa === 0) { parcela = valor / n; } else { parcela = valor * (taxa * Math.pow(1+taxa,n)) / (Math.pow(1+taxa,n)-1); }
                  totalPago = parcela * n;
                  jurosTotal = totalPago - valor;
                }
                const novoSaldo = saldo.saldo - (simCompra.forma === 'avista' ? valor : parcela);
                const pctRenda = saldo.receitas > 0 ? (parcela / saldo.receitas * 100) : 0;
                setSimCompra({...simCompra, resultado:{totalPago,parcela,jurosTotal,novoSaldo,pctRenda,viavel:novoSaldo>=0}});
              },
              style:{background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'11px',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',width:'100%'}
            }, '📊 Simular')
          )
        )
      ),

      /* Coluna Central: resultado */
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        simCompra.resultado ? React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'20px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
          React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#f97316',marginBottom:'16px'}}, '📊 Resultado da Simulação'),
          React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'12px'}},
            React.createElement('div', {style:{background: simCompra.resultado.viavel ? '#f0fdf4' : '#fef2f2', borderRadius:'12px', padding:'14px', border: simCompra.resultado.viavel ? '1px solid #86efac' : '1px solid #fca5a5'}},
              React.createElement('div', {style:{fontSize:'1.1rem',fontWeight:'800',color: simCompra.resultado.viavel ? '#166534' : '#991b1b',marginBottom:'4px'}}, simCompra.resultado.viavel ? '✅ Compra Viável' : '❌ Compra Inviável'),
              React.createElement('div', {style:{fontSize:'0.78rem',color: simCompra.resultado.viavel ? '#166534' : '#991b1b'}}, simCompra.resultado.viavel ? 'Você tem saldo suficiente' : 'Saldo insuficiente para esta compra')
            ),
            [
              {label:'💳 Valor da parcela', value:'R$ '+simCompra.resultado.parcela.toFixed(2)},
              {label:'💰 Total a pagar', value:'R$ '+simCompra.resultado.totalPago.toFixed(2)},
              {label:'📈 Total em juros', value:'R$ '+simCompra.resultado.jurosTotal.toFixed(2), destaque: simCompra.resultado.jurosTotal > 0},
              {label:'🏦 Novo saldo mensal', value:'R$ '+simCompra.resultado.novoSaldo.toFixed(2)},
              {label:'📊 % da renda comprometida', value:simCompra.resultado.pctRenda.toFixed(1)+'%', alerta: simCompra.resultado.pctRenda > 30}
            ].map((item,i) => React.createElement('div', {key:i, style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background: item.alerta ? '#fef3c7' : '#f8fafc',borderRadius:'8px',border:'1px solid '+(item.alerta?'#fcd34d':'#e2e8f0')}},
              React.createElement('span', {style:{fontSize:'0.78rem',color:'#64748b'}}, item.label),
              React.createElement('span', {style:{fontSize:'0.88rem',fontWeight:'800',color: item.alerta ? '#92400e' : item.destaque ? '#dc2626' : '#1e293b'}}, item.value)
            ))
          )
        ) : React.createElement('div', {style:{background:C.bgMuted,borderRadius:'16px',padding:'32px',textAlign:'center',border:'1px solid '+C.border}},
          React.createElement('div', {style:{fontSize:'2.5rem',marginBottom:'12px'}}, '🛒'),
          React.createElement('div', {style:{fontSize:'0.85rem',color:'#94a3b8',fontWeight:'500'}}, 'Preencha os dados e clique em Simular para ver a análise')
        )
      ),

      /* Coluna Direita: dicas */
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#f59e0b',marginBottom:'14px'}}, '💡 Dicas Financeiras'),
        React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
          [
            {icon:'⚡',title:'Regra dos 30%',desc:'A parcela não deve comprometer mais que 30% da sua renda mensal.'},
            {icon:'🏆',title:'À vista é melhor',desc:'Sempre que possível, negocie desconto no pagamento à vista.'},
            {icon:'📉',title:'Juros compostos',desc:'Nos parcelamentos com juros, o custo final pode ser muito maior que o preço original.'},
            {icon:'🎯',title:'Reserve 3x o valor',desc:'Idealmente, tenha 3x o valor da compra reservado antes de comprar.'}
          ].map((d,i) => React.createElement('div', {key:i, style:{padding:'10px 12px',background:'#fffbeb',borderRadius:'8px',border:'1px solid #fcd34d'}},
            React.createElement('div', {style:{fontSize:'0.78rem',fontWeight:'700',color:'#92400e',marginBottom:'3px'}}, d.icon+' '+d.title),
            React.createElement('div', {style:{fontSize:'0.72rem',color:'#78350f',lineHeight:'1.4'}}, d.desc)
          ))
        )
      )
    ),

    /* ══════════════════════════════════════════════════════
       ABA 2 — SIMULADOR DE CENÁRIOS
    ══════════════════════════════════════════════════════ */
    (subAba === 'simulador') && React.createElement('div', {style:{display:'grid',gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},

      /* Coluna Esquerda: situação atual + sliders */
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        React.createElement('div', {style:{background:'#1e1b4b',borderRadius:'16px',padding:'20px',color:'#fff',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}},
          React.createElement('div', {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'14px'}}, '📊 Situação Atual'),
          React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
            React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              React.createElement('span', {style:{fontSize:'0.75rem',opacity:0.7}}, 'Receitas'),
              React.createElement('span', {style:{fontSize:'0.95rem',fontWeight:'800'}}, 'R$ '+saldo.receitas.toFixed(2))
            ),
            React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              React.createElement('span', {style:{fontSize:'0.75rem',opacity:0.7}}, 'Despesas'),
              React.createElement('span', {style:{fontSize:'0.95rem',fontWeight:'800'}}, 'R$ '+saldo.despesas.toFixed(2))
            ),
            React.createElement('div', {style:{borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}},
              React.createElement('span', {style:{fontSize:'0.8rem',fontWeight:'700'}}, 'Saldo'),
              React.createElement('span', {style:{fontSize:'1.1rem',fontWeight:'900',color:saldo.positivo?'#34d399':'#f87171'}}, 'R$ '+saldo.saldo.toFixed(2))
            )
          )
        ),
        React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
          React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#f97316',marginBottom:'14px'}}, '🎛️ Ajustar Cenário'),
          React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
            React.createElement('div', null,
              React.createElement('div', {style:{display:'flex',justifyContent:'space-between',marginBottom:'6px'}},
                React.createElement('label', {style:{fontSize:'0.75rem',fontWeight:'600',color:'#64748b'}}, '💰 Ajuste de Renda'),
                React.createElement('span', {style:{fontSize:'0.82rem',fontWeight:'800',color: simulacao.rendaAjuste >= 0 ? '#16a34a' : '#dc2626'}}, (simulacao.rendaAjuste >= 0 ? '+' : '')+simulacao.rendaAjuste+'%')
              ),
              React.createElement('input', {type:'range', min:'-50', max:'100', value:simulacao.rendaAjuste, onChange:e=>setSimulacao({...simulacao,rendaAjuste:parseInt(e.target.value)}), style:{width:'100%',accentColor:'#f97316'}})
            ),
            React.createElement('div', null,
              React.createElement('div', {style:{display:'flex',justifyContent:'space-between',marginBottom:'6px'}},
                React.createElement('label', {style:{fontSize:'0.75rem',fontWeight:'600',color:'#64748b'}}, '💸 Ajuste de Despesas'),
                React.createElement('span', {style:{fontSize:'0.82rem',fontWeight:'800',color: simulacao.gastosAjuste <= 0 ? '#16a34a' : '#dc2626'}}, (simulacao.gastosAjuste >= 0 ? '+' : '')+simulacao.gastosAjuste+'%')
              ),
              React.createElement('input', {type:'range', min:'-50', max:'50', value:simulacao.gastosAjuste, onChange:e=>setSimulacao({...simulacao,gastosAjuste:parseInt(e.target.value)}), style:{width:'100%',accentColor:'#f97316'}})
            ),
            React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}},
              React.createElement('button', {onClick:()=>setSimulacao({...simulacao,rendaAjuste:20}), style:{padding:'7px 4px',borderRadius:'8px',border:'1px solid #86efac',background:'#f0fdf4',color:'#166534',fontSize:'0.68rem',fontWeight:'700',cursor:'pointer'}}, '+20% Renda'),
              React.createElement('button', {onClick:()=>setSimulacao({...simulacao,gastosAjuste:-20}), style:{padding:'7px 4px',borderRadius:'8px',border:'1px solid #86efac',background:'#f0fdf4',color:'#166534',fontSize:'0.68rem',fontWeight:'700',cursor:'pointer'}}, '-20% Desp.'),
              React.createElement('button', {onClick:()=>setSimulacao({...simulacao,rendaAjuste:20,gastosAjuste:-20}), style:{padding:'7px 4px',borderRadius:'8px',border:'1px solid #f97316',background:'#eef2ff',color:'#c2410c',fontSize:'0.68rem',fontWeight:'700',cursor:'pointer'}}, 'Combo')
            ),
            React.createElement('button', {onClick:()=>setSimulacao({...simulacao,rendaAjuste:0,gastosAjuste:0}), style:{padding:'8px',borderRadius:'8px',border:'1px solid '+C.border,background:C.bgMuted,color:'#64748b',fontSize:'0.75rem',cursor:'pointer',width:'100%'}}, '↩️ Resetar')
          )
        )
      ),

      /* Coluna Central: resultados do cenário */
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        (() => {
          const rendaSim = saldo.receitas * (1 + simulacao.rendaAjuste/100);
          const despSim  = saldo.despesas * (1 + simulacao.gastosAjuste/100);
          const saldoSim = rendaSim - despSim;
          const txPoup   = rendaSim > 0 ? (saldoSim / rendaSim * 100) : 0;
          const meta20   = rendaSim * 0.20;
          return React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
            React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'20px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
              React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#f97316',marginBottom:'16px'}}, '🎲 Cenário Simulado'),
              React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
                [
                  {label:'💰 Receita Simulada',  value:'R$ '+rendaSim.toFixed(2),  color:'#16a34a'},
                  {label:'💸 Despesas Simuladas', value:'R$ '+despSim.toFixed(2),   color:'#dc2626'},
                  {label:'💼 Saldo Resultante',   value:'R$ '+saldoSim.toFixed(2),  color: saldoSim >= 0 ? '#16a34a' : '#dc2626'},
                  {label:'📊 Taxa de Poupança',   value:txPoup.toFixed(1)+'%',      color: txPoup >= 20 ? '#16a34a' : txPoup >= 10 ? '#f59e0b' : '#dc2626'},
                ].map((item,i) => React.createElement('div', {key:i, style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:C.bgMuted,borderRadius:'8px',border:'1px solid '+C.border}},
                  React.createElement('span', {style:{fontSize:'0.78rem',color:'#64748b'}}, item.label),
                  React.createElement('span', {style:{fontSize:'0.88rem',fontWeight:'800',color:item.color}}, item.value)
                ))
              )
            ),
            React.createElement('div', {style:{background: txPoup >= 20 ? '#f0fdf4' : txPoup >= 10 ? '#fffbeb' : '#fef2f2', borderRadius:'16px',padding:'18px',border:'1px solid '+(txPoup>=20?'#86efac':txPoup>=10?'#fcd34d':'#fca5a5')}},
              React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color: txPoup>=20?'#166534':txPoup>=10?'#92400e':'#991b1b',marginBottom:'10px'}}, '🎯 Análise do Cenário'),
              React.createElement('div', {style:{fontSize:'0.82rem',color: txPoup>=20?'#166534':txPoup>=10?'#92400e':'#991b1b',lineHeight:'1.5'}},
                txPoup >= 20 ? '🏆 Excelente! Com este cenário você economiza '+txPoup.toFixed(1)+'% da renda.' :
                txPoup >= 10 ? '⚠️ Razoável. A meta ideal é 20%. Tente reduzir mais despesas.' :
                saldoSim < 0 ? '🚨 Saldo negativo! Reveja urgentemente receitas e despesas.' :
                '📉 Poupança baixa. Foque em aumentar renda ou cortar despesas.'
              ),
              saldoSim > 0 && React.createElement('div', {style:{marginTop:'10px',padding:'8px 12px',background:'rgba(255,255,255,0.6)',borderRadius:'8px'}},
                React.createElement('div', {style:{fontSize:'0.75rem',fontWeight:'600',color:C.text}}, '💡 Meta recomendada: R$ '+meta20.toFixed(2)+'/mês (20% da renda)'),
                React.createElement('div', {style:{fontSize:'0.75rem',color:C.textMuted,marginTop:'4px'}}, 'Economia anual estimada: R$ '+(saldoSim*12).toFixed(2))
              )
            )
          );
        })()
      ),

      /* Coluna Direita: dicas */
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#f59e0b',marginBottom:'14px'}}, '💡 Estratégias'),
        React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
          [
            {icon:'📈',title:'Regra 50/30/20',desc:'50% necessidades, 30% desejos, 20% investimentos e poupança.'},
            {icon:'🎯',title:'Meta de Poupança',desc:'Guarde pelo menos 10% da renda. O ideal é 20%.'},
            {icon:'💼',title:'Renda Extra',desc:'Cada 10% a mais na renda pode transformar seu cenário financeiro.'},
            {icon:'✂️',title:'Corte Gradual',desc:'Reduza despesas variáveis 5% por mês até atingir sua meta.'}
          ].map((d,i) => React.createElement('div', {key:i, style:{padding:'10px 12px',background:'#fffbeb',borderRadius:'8px',border:'1px solid #fcd34d'}},
            React.createElement('div', {style:{fontSize:'0.78rem',fontWeight:'700',color:'#92400e',marginBottom:'3px'}}, d.icon+' '+d.title),
            React.createElement('div', {style:{fontSize:'0.72rem',color:'#78350f',lineHeight:'1.4'}}, d.desc)
          ))
        )
      )
    ),

    /* ══════════════════════════════════════════════════════
       ABA 3 — SIMULADOR DE APOSENTADORIA
    ══════════════════════════════════════════════════════ */
    (subAba === 'aposentadoria') && React.createElement('div', {style:{display:'grid',gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},

      /* Coluna Esquerda: formulário */
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#0891b2',marginBottom:'14px'}}, '🏖️ Dados da Aposentadoria'),
        React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
          [
            {label:'Idade atual', key:'idadeAtual', type:'number', min:18, max:80},
            {label:'Idade de aposentadoria', key:'idadeAposentadoria', type:'number', min:30, max:90},
            {label:'Patrimônio atual (R$)', key:'patrimonioAtual', type:'number', min:0},
            {label:'Aporte mensal (R$)', key:'aporteMensal', type:'number', min:0},
            {label:'Rentabilidade anual (%)', key:'taxaAnual', type:'number', min:0, step:0.1},
            {label:'Inflação anual (%)', key:'inflacao', type:'number', min:0, step:0.1},
            {label:'Renda desejada/mês (R$)', key:'rendaDesejada', type:'number', min:0},
          ].map(f => React.createElement('div', {key:f.key},
            React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, f.label),
            React.createElement('input', {
              type:f.type, value:simApos[f.key], min:f.min, max:f.max, step:f.step||1,
              onChange:e=>setSimApos({...simApos,[f.key]:parseFloat(e.target.value)||0,resultado:null}),
              style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}
            })
          )),
          React.createElement('button', {
            onClick: () => {
              const anos = simApos.idadeAposentadoria - simApos.idadeAtual;
              if (anos <= 0) return;
              const meses = anos * 12;
              const taxaMensal = Math.pow(1 + simApos.taxaAnual/100, 1/12) - 1;
              const patrimonioFV = simApos.patrimonioAtual * Math.pow(1+taxaMensal, meses);
              const aportesFV = taxaMensal > 0 ? simApos.aporteMensal * (Math.pow(1+taxaMensal,meses)-1) / taxaMensal : simApos.aporteMensal * meses;
              const totalAcumulado = patrimonioFV + aportesFV;
              const rendaMensal = totalAcumulado * 0.04 / 12;
              const pctMeta = simApos.rendaDesejada > 0 ? (rendaMensal / simApos.rendaDesejada * 100) : 0;
              setSimApos({...simApos, resultado:{totalAcumulado,rendaMensal,pctMeta,anos,meses}});
            },
            style:{background:'#0891b2',color:'#fff',border:'none',borderRadius:'10px',padding:'11px',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',width:'100%',marginTop:'4px'}
          }, '📊 Calcular')
        )
      ),

      /* Coluna Central: resultados */
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        simApos.resultado ? React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
          React.createElement('div', {style:{background:'#0369a1',borderRadius:'16px',padding:'20px',color:'#fff',boxShadow:'0 4px 20px rgba(0,0,0,0.25)'}},
            React.createElement('div', {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'8px'}}, '🏖️ Patrimônio na Aposentadoria'),
            React.createElement('div', {style:{fontSize:'2rem',fontWeight:'900',marginBottom:'4px'}}, 'R$ '+simApos.resultado.totalAcumulado.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})),
            React.createElement('div', {style:{fontSize:'0.78rem',opacity:0.8}}, 'Acumulado em '+simApos.resultado.anos+' anos')
          ),
          React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
            [
              {label:'💰 Renda mensal gerada', value:'R$ '+simApos.resultado.rendaMensal.toFixed(2), color: simApos.resultado.rendaMensal >= simApos.rendaDesejada ? '#16a34a' : '#f59e0b'},
              {label:'🎯 Renda desejada', value:'R$ '+simApos.rendaDesejada.toFixed(2), color:'#f97316'},
              {label:'📊 % da meta atingida', value:simApos.resultado.pctMeta.toFixed(1)+'%', color: simApos.resultado.pctMeta >= 100 ? '#16a34a' : '#dc2626'},
              {label:'📅 Meses de acumulação', value:simApos.resultado.meses+' meses', color:'#64748b'},
            ].map((item,i) => React.createElement('div', {key:i, style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:C.bgMuted,borderRadius:'8px',border:'1px solid '+C.border,marginBottom:'8px'}},
              React.createElement('span', {style:{fontSize:'0.78rem',color:'#64748b'}}, item.label),
              React.createElement('span', {style:{fontSize:'0.88rem',fontWeight:'800',color:item.color}}, item.value)
            ))
          ),
          React.createElement('div', {style:{background: simApos.resultado.pctMeta >= 100 ? '#f0fdf4' : '#fffbeb', borderRadius:'12px', padding:'14px', border:'1px solid '+(simApos.resultado.pctMeta>=100?'#86efac':'#fcd34d')}},
            React.createElement('div', {style:{fontSize:'0.82rem',color: simApos.resultado.pctMeta>=100?'#166534':'#92400e',fontWeight:'600',lineHeight:'1.5'}},
              simApos.resultado.pctMeta >= 100
                ? '🏆 Parabéns! Com este aporte você atingirá sua meta de aposentadoria!'
                : '⚠️ Você atingirá '+(simApos.resultado.pctMeta.toFixed(0))+'% da sua meta. Considere aumentar o aporte mensal em R$ '+((simApos.rendaDesejada-simApos.resultado.rendaMensal)/0.04*12/(simApos.resultado.meses||1)).toFixed(0)+'/mês.'
            )
          )
        ) : React.createElement('div', {style:{background:C.bgMuted,borderRadius:'16px',padding:'32px',textAlign:'center',border:'1px solid '+C.border}},
          React.createElement('div', {style:{fontSize:'2.5rem',marginBottom:'12px'}}, '🏖️'),
          React.createElement('div', {style:{fontSize:'0.85rem',color:'#94a3b8',fontWeight:'500'}}, 'Preencha os dados e clique em Calcular')
        )
      ),

      /* Coluna Direita: dicas */
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#0891b2',marginBottom:'14px'}}, '💡 Dicas de Aposentadoria'),
        React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
          [
            {icon:'⏰',title:'Comece cedo',desc:'Começar aos 25 anos pode gerar 2x mais patrimônio do que começar aos 35.'},
            {icon:'📈',title:'Regra dos 4%',desc:'Com a regra dos 4%, você retira 4% ao ano do patrimônio sem esgotá-lo.'},
            {icon:'🔄',title:'Aporte constante',desc:'Consistência é mais importante que valor. Não pare de investir.'},
            {icon:'🛡️',title:'Diversifique',desc:'Mescle renda fixa (segurança) e renda variável (crescimento).'}
          ].map((d,i) => React.createElement('div', {key:i, style:{padding:'10px 12px',background:'#e0f7fa',borderRadius:'8px',border:'1px solid #b2ebf2'}},
            React.createElement('div', {style:{fontSize:'0.78rem',fontWeight:'700',color:'#006064',marginBottom:'3px'}}, d.icon+' '+d.title),
            React.createElement('div', {style:{fontSize:'0.72rem',color:'#00838f',lineHeight:'1.4'}}, d.desc)
          ))
        )
      )
    ),

    /* ══════════════════════════════════════════════════════
       ABA 4 — SIMULADOR DE QUITAÇÃO DE DÍVIDAS
    ══════════════════════════════════════════════════════ */
    (subAba === 'quitacao') && React.createElement('div', {style:{display:'grid',gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},

      /* Coluna Esquerda: formulário */
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#dc2626',marginBottom:'14px'}}, '💳 Dados da Dívida'),
        React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
          [
            {label:'Nome da dívida', key:'nomeDiv', type:'text', placeholder:'Ex: Cartão, Financiamento...'},
            {label:'Saldo devedor (R$)', key:'saldoDevedor', type:'number', placeholder:'0,00'},
            {label:'Taxa de juros % a.m.', key:'taxaMensal', type:'number', placeholder:'0,00', step:'0.1'},
            {label:'Pagamento atual (R$/mês)', key:'pagamentoAtual', type:'number', placeholder:'0,00'},
            {label:'Pagamento extra (R$/mês)', key:'pagamentoExtra', type:'number', placeholder:'0,00'},
          ].map(f => React.createElement('div', {key:f.key},
            React.createElement('label', {style:{fontSize:'0.72rem',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'4px'}}, f.label),
            React.createElement('input', {
              type:f.type, value:simQuit[f.key], placeholder:f.placeholder, step:f.step||undefined,
              onChange:e=>setSimQuit({...simQuit,[f.key]:e.target.value,resultado:null}),
              style:{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1px solid '+C.border,fontSize:'0.82rem',boxSizing:'border-box'}
            })
          )),
          React.createElement('button', {
            onClick: () => {
              const saldoD   = parseFloat(simQuit.saldoDevedor) || 0;
              const taxa     = parseFloat(simQuit.taxaMensal) / 100 || 0;
              const pgtoAtual = parseFloat(simQuit.pagamentoAtual) || 0;
              const pgtoExtra = parseFloat(simQuit.pagamentoExtra) || 0;
              if (!saldoD || pgtoAtual <= saldoD * taxa) {
                setSimQuit({...simQuit, resultado:{erro:'O pagamento atual deve ser maior que os juros mensais (R$ '+(saldoD*taxa).toFixed(2)+').'}});
                return;
              }
              // Sem pagamento extra
              let sS=saldoD, mS=0, jS=0;
              while(sS>0 && mS<600){ const j=sS*taxa; jS+=j; sS+=j-pgtoAtual; if(sS<0)sS=0; mS++; }
              // Com pagamento extra
              let sC=saldoD, mC=0, jC=0;
              const pgtoTotal = pgtoAtual + pgtoExtra;
              while(sC>0 && mC<600){ const j=sC*taxa; jC+=j; sC+=j-pgtoTotal; if(sC<0)sC=0; mC++; }
              setSimQuit({...simQuit, resultado:{mesesSem:mS,mesesCom:mC,jurosSem:jS,jurosCom:jC,mesesEconomia:mS-mC,jurosEconomia:jS-jC,totalSem:saldoD+jS,totalCom:saldoD+jC}});
            },
            style:{background:'#dc2626',color:'#fff',border:'none',borderRadius:'10px',padding:'11px',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',width:'100%',marginTop:'4px'}
          }, '📊 Simular Quitação')
        )
      ),

      /* Coluna Central: resultados */
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        simQuit.resultado ? (
          simQuit.resultado.erro
            ? React.createElement('div', {style:{background:'#fef2f2',borderRadius:'16px',padding:'20px',border:'1px solid #fca5a5'}},
                React.createElement('div', {style:{fontSize:'0.88rem',fontWeight:'700',color:'#991b1b'}}, '⚠️ '+simQuit.resultado.erro)
              )
            : React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px'}},
                React.createElement('div', {style:{background:'#991b1b',borderRadius:'16px',padding:'20px',color:'#fff',boxShadow:'0 4px 20px rgba(0,0,0,0.25)'}},
                  React.createElement('div', {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'8px'}}, '💳 Resultado da Quitação'),
                  React.createElement('div', {style:{fontSize:'1.8rem',fontWeight:'900',marginBottom:'4px',color:'#fca5a5'}}, simQuit.resultado.mesesSem+' meses'),
                  React.createElement('div', {style:{fontSize:'0.78rem',opacity:0.8}}, 'para quitar sem pagamento extra')
                ),
                React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
                  React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#dc2626',marginBottom:'12px'}}, '📊 Comparativo'),
                  React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}},
                    React.createElement('div', {style:{background:'#fef2f2',borderRadius:'10px',padding:'12px',textAlign:'center'}},
                      React.createElement('div', {style:{fontSize:'0.65rem',fontWeight:'700',color:'#991b1b',marginBottom:'4px',textTransform:'uppercase'}}, 'Sem Extra'),
                      React.createElement('div', {style:{fontSize:'1.1rem',fontWeight:'900',color:'#dc2626'}}, simQuit.resultado.mesesSem+' meses'),
                      React.createElement('div', {style:{fontSize:'0.72rem',color:'#991b1b'}}, 'R$ '+simQuit.resultado.jurosSem.toFixed(2)+' em juros')
                    ),
                    React.createElement('div', {style:{background:'#f0fdf4',borderRadius:'10px',padding:'12px',textAlign:'center'}},
                      React.createElement('div', {style:{fontSize:'0.65rem',fontWeight:'700',color:'#166534',marginBottom:'4px',textTransform:'uppercase'}}, 'Com Extra'),
                      React.createElement('div', {style:{fontSize:'1.1rem',fontWeight:'900',color:'#16a34a'}}, simQuit.resultado.mesesCom+' meses'),
                      React.createElement('div', {style:{fontSize:'0.72rem',color:'#166534'}}, 'R$ '+simQuit.resultado.jurosCom.toFixed(2)+' em juros')
                    )
                  ),
                  React.createElement('div', {style:{background:'#f0fdf4',borderRadius:'10px',padding:'14px',border:'1px solid #86efac'}},
                    React.createElement('div', {style:{fontSize:'0.82rem',fontWeight:'700',color:'#166534',marginBottom:'4px'}}, '🎯 Economia com pagamento extra:'),
                    React.createElement('div', {style:{fontSize:'1.1rem',fontWeight:'900',color:'#16a34a'}}, simQuit.resultado.mesesEconomia+' meses e R$ '+simQuit.resultado.jurosEconomia.toFixed(2)+' em juros')
                  )
                )
              )
        ) : React.createElement('div', {style:{background:C.bgMuted,borderRadius:'16px',padding:'32px',textAlign:'center',border:'1px solid '+C.border}},
            React.createElement('div', {style:{fontSize:'2.5rem',marginBottom:'12px'}}, '💳'),
            React.createElement('div', {style:{fontSize:'0.85rem',color:'#94a3b8',fontWeight:'500'}}, 'Preencha os dados e clique em Simular')
          )
      ),

      /* Coluna Direita: dicas */
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',padding:'18px',border:'1px solid '+C.border,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',color:'#dc2626',marginBottom:'14px'}}, '💡 Estratégias de Quitação'),
        React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'10px'}},
          [
            {icon:'🏔️',title:'Avalanche',desc:'Pague primeiro a dívida com maior taxa de juros. Economiza mais no longo prazo.'},
            {icon:'☃️',title:'Bola de Neve',desc:'Quite primeiro a menor dívida. Gera motivação e libera renda mais rápido.'},
            {icon:'⚡',title:'Pagamento extra',desc:'Qualquer valor extra reduz drasticamente o prazo e os juros totais.'},
            {icon:'🔄',title:'Renegociação',desc:'Sempre tente renegociar a taxa antes de pagar. Bancos aceitam reduções.'}
          ].map((d,i) => React.createElement('div', {key:i, style:{padding:'10px 12px',background:'#fff1f2',borderRadius:'8px',border:'1px solid #fecdd3'}},
            React.createElement('div', {style:{fontSize:'0.78rem',fontWeight:'700',color:'#881337',marginBottom:'3px'}}, d.icon+' '+d.title),
            React.createElement('div', {style:{fontSize:'0.72rem',color:'#9f1239',lineHeight:'1.4'}}, d.desc)
          ))
        )
      )
    )
  ),
  (abaAtiva === 'historico') && React.createElement(TelaHistorico, null),

  // ── Modal: Depositar na Meta ──────────────────────────────────────────────
  modalMetaAberto === 'depositar' && metaSelecionada && React.createElement('div', {
    style:{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}
  },
    React.createElement('div', {style:{background:C.bg,borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'400px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}},
      React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}},
        React.createElement('div', {style:{fontWeight:'900',fontSize:'1.1rem',color:C.text}}, '💰 Depositar na Meta'),
        React.createElement('button', {onClick:fecharModalMeta, style:{fontSize:'1.4rem',background:'none',border:'none',cursor:'pointer',color:C.textMuted,lineHeight:1}}, '×')
      ),
      React.createElement('div', {style:{marginBottom:'18px'}},
        React.createElement('div', {style:{fontWeight:'700',fontSize:'0.95rem',color:C.text,marginBottom:'4px'}}, metaSelecionada.titulo),
        React.createElement('div', {style:{fontSize:'0.78rem',color:C.textFaint,marginBottom:'14px'}},
          'Acumulado: R$ ' + (metaSelecionada.valorAtual||0).toFixed(2) + ' / R$ ' + metaSelecionada.valor.toFixed(2)
        ),
        // Barra de progresso
        React.createElement('div', {style:{height:'6px',background:'#e5e7eb',borderRadius:'3px',overflow:'hidden',marginBottom:'18px'}},
          React.createElement('div', {style:{height:'100%',width:Math.min(100,(metaSelecionada.valorAtual||0)/metaSelecionada.valor*100)+'%',background:'#10b981',borderRadius:'3px'}})
        ),
        React.createElement('label', {style:{display:'block',fontSize:'0.78rem',fontWeight:'700',color:C.textMuted,marginBottom:'8px'}}, 'Valor a depositar (R$)'),
        React.createElement('input', {
          type:'number', min:'0.01', step:'0.01', autoFocus:true,
          value:depositarValor, onChange:function(e){setDepositarValor(e.target.value);},
          placeholder:'0,00',
          style:{width:'100%',padding:'11px 14px',border:'2px solid #f97316',borderRadius:'10px',fontSize:'1rem',fontWeight:'700',outline:'none',color:C.text,background:C.input,boxSizing:'border-box'}
        })
      ),
      React.createElement('div', {style:{display:'flex',gap:'10px'}},
        React.createElement('button', {
          onClick:fecharModalMeta,
          style:{flex:1,padding:'11px',border:'1.5px solid '+C.border,borderRadius:'10px',background:'transparent',color:C.text,fontWeight:'700',cursor:'pointer',fontSize:'0.85rem'}
        }, 'Cancelar'),
        React.createElement('button', {
          onClick:function() {
            var v = parseFloat(depositarValor);
            if (!v || v <= 0) { showToast('Informe um valor maior que zero', 'warning', 3500); return; }
            var novoAcumulado = (metaSelecionada.valorAtual||0) + v;
            var concluida = novoAcumulado >= metaSelecionada.valor;
            setMetasFinanceiras(metasFinanceiras.map(function(m) {
              return m.id === metaSelecionada.id ? {...m, valorAtual: novoAcumulado, concluida: concluida} : m;
            }));
            fecharModalMeta();
            showToast(concluida ? '🎉 Meta "'+metaSelecionada.titulo+'" concluída!' : '✅ R$ '+v.toFixed(2)+' adicionado à meta!', concluida?'success':'success', 4000);
          },
          style:{flex:1,padding:'11px',border:'none',borderRadius:'10px',background:'#059669',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'0.85rem'}
        }, '💰 Confirmar')
      )
    )
  ),

  // ── Modal: Editar Meta ────────────────────────────────────────────────────
  modalMetaAberto === 'editar' && metaSelecionada && React.createElement('div', {
    style:{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}
  },
    React.createElement('div', {style:{background:C.bg,borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}},
      React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}},
        React.createElement('div', {style:{fontWeight:'900',fontSize:'1.1rem',color:C.text}}, '✏️ Editar Meta'),
        React.createElement('button', {onClick:fecharModalMeta, style:{fontSize:'1.4rem',background:'none',border:'none',cursor:'pointer',color:C.textMuted,lineHeight:1}}, '×')
      ),
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'20px'}},
        // Título
        React.createElement('div', null,
          React.createElement('label', {style:{display:'block',fontSize:'0.75rem',fontWeight:'700',color:C.textMuted,marginBottom:'6px'}}, 'Título'),
          React.createElement('input', {
            type:'text', value:editMetaForm.titulo||'',
            onChange:function(e){setEditMetaForm(function(f){return{...f,titulo:e.target.value};});},
            style:{width:'100%',padding:'10px 12px',border:'1.5px solid '+C.border,borderRadius:'10px',background:C.input,color:C.text,fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}
          })
        ),
        // Valor objetivo + Acumulado
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}},
          React.createElement('div', null,
            React.createElement('label', {style:{display:'block',fontSize:'0.75rem',fontWeight:'700',color:C.textMuted,marginBottom:'6px'}}, 'Valor Objetivo (R$)'),
            React.createElement('input', {
              type:'number', min:'0', step:'0.01', value:editMetaForm.valor||'',
              onChange:function(e){setEditMetaForm(function(f){return{...f,valor:e.target.value};});},
              style:{width:'100%',padding:'10px 12px',border:'1.5px solid '+C.border,borderRadius:'10px',background:C.input,color:C.text,fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}
            })
          ),
          React.createElement('div', null,
            React.createElement('label', {style:{display:'block',fontSize:'0.75rem',fontWeight:'700',color:C.textMuted,marginBottom:'6px'}}, 'Já acumulado (R$)'),
            React.createElement('input', {
              type:'number', min:'0', step:'0.01', value:editMetaForm.valorAtual||'',
              onChange:function(e){setEditMetaForm(function(f){return{...f,valorAtual:e.target.value};});},
              style:{width:'100%',padding:'10px 12px',border:'1.5px solid '+C.border,borderRadius:'10px',background:C.input,color:C.text,fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}
            })
          )
        ),
        // Prazo + Data
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}},
          React.createElement('div', null,
            React.createElement('label', {style:{display:'block',fontSize:'0.75rem',fontWeight:'700',color:C.textMuted,marginBottom:'6px'}}, 'Prazo'),
            React.createElement('select', {
              value:editMetaForm.prazo||'curto',
              onChange:function(e){setEditMetaForm(function(f){return{...f,prazo:e.target.value};});},
              style:{width:'100%',padding:'10px 12px',border:'1.5px solid '+C.border,borderRadius:'10px',background:C.input,color:C.text,fontSize:'0.85rem',outline:'none',boxSizing:'border-box'}
            },
              React.createElement('option',{value:'curto'},'⚡ Curto (até 1 ano)'),
              React.createElement('option',{value:'medio'},'📅 Médio (1-5 anos)'),
              React.createElement('option',{value:'longo'},'🏆 Longo (5+ anos)')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', {style:{display:'block',fontSize:'0.75rem',fontWeight:'700',color:C.textMuted,marginBottom:'6px'}}, 'Data Meta'),
            React.createElement('input', {
              type:'date', value:editMetaForm.dataMeta||'',
              onChange:function(e){setEditMetaForm(function(f){return{...f,dataMeta:e.target.value};});},
              style:{width:'100%',padding:'10px 12px',border:'1.5px solid '+C.border,borderRadius:'10px',background:C.input,color:C.text,fontSize:'0.85rem',outline:'none',boxSizing:'border-box'}
            })
          )
        )
      ),
      React.createElement('div', {style:{display:'flex',gap:'10px'}},
        React.createElement('button', {
          onClick:fecharModalMeta,
          style:{flex:1,padding:'11px',border:'1.5px solid '+C.border,borderRadius:'10px',background:'transparent',color:C.text,fontWeight:'700',cursor:'pointer',fontSize:'0.85rem'}
        }, 'Cancelar'),
        React.createElement('button', {
          onClick:function() {
            if (!editMetaForm.titulo || !editMetaForm.valor) { showToast('Preencha título e valor', 'warning', 3500); return; }
            var novoValorAtual = parseFloat(editMetaForm.valorAtual)||0;
            var novoValor     = parseFloat(editMetaForm.valor)||0;
            setMetasFinanceiras(metasFinanceiras.map(function(m) {
              return m.id === metaSelecionada.id ? {
                ...m,
                titulo:    editMetaForm.titulo,
                valor:     novoValor,
                valorAtual:novoValorAtual,
                prazo:     editMetaForm.prazo||'curto',
                dataMeta:  editMetaForm.dataMeta||m.dataMeta,
                concluida: novoValorAtual >= novoValor
              } : m;
            }));
            fecharModalMeta();
            showToast('✅ Meta atualizada!', 'success', 3500);
          },
          style:{flex:1,padding:'11px',border:'none',borderRadius:'10px',background:'#f97316',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'0.85rem'}
        }, '💾 Salvar')
      )
    )
  )
)

  };
  // ── TELA DE RELATÓRIOS ───────────────────────────────────────────────────
  const TelaRelatorios = () => {
    const saldoMes = calcularSaldo(mesAtual);
    const fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2});
    const pctEcon = saldoMes.receitas > 0 ? (saldoMes.saldo/saldoMes.receitas*100).toFixed(1) : '0.0';
    const dadosAnuais = MESES.map(function(m){ var s=calcularSaldo(m); return {mes:m.toUpperCase(), receitas:s.receitas, despesas:s.despesas, saldo:s.saldo}; });

    const _isMobRel = window.innerWidth <= 768;
    const [heatmapView, setHeatmapView] = React.useState('calendario'); // 'calendario'|'categorias'|'treemap'

    // ── Feature 4: ref do gráfico de tendência ─────────────────────────────
    const refTendencia = React.useRef(null);
    React.useEffect(function() {
      if (!refTendencia.current) return;
      var idxAtual = MESES.indexOf(mesAtual);
      var meses6 = Array.from({length:6}, function(_,i) {
        var offset = i - 5;
        var idx = (idxAtual + offset + 12) % 12;
        var ano  = (idxAtual + offset < 0) ? anoAtual - 1 : anoAtual;
        return { mes: MESES[idx], ano: ano, label: MESES[idx].toUpperCase() };
      });
      var receitas6 = meses6.map(function(m) {
        return receitas.filter(function(r){ return r.mes===m.mes && r.ano===m.ano; }).reduce(function(s,r){return s+r.valor;},0);
      });
      var gastos6 = meses6.map(function(m) {
        var gf = gastosFixos.filter(function(g){ return g.mes===m.mes && g.ano===m.ano; }).reduce(function(s,g){return s+g.valor;},0);
        var gv = gastosVariaveis.filter(function(g){ return g.mes===m.mes && g.ano===m.ano; }).reduce(function(s,g){return s+g.valor;},0);
        var ge = gastosExtras.filter(function(g){ return g.mes===m.mes && g.ano===m.ano; }).reduce(function(s,g){return s+g.valor;},0);
        var gc = cartoes.reduce(function(s,c){ return s + (c.valores?.[m.ano]?.[m.mes]||0); },0);
        return gf + gv + ge + gc;
      });
      var saldo6 = meses6.map(function(_,i){ return receitas6[i] - gastos6[i]; });
      if (refTendencia.current._chartInstance) refTendencia.current._chartInstance.destroy();
      refTendencia.current._chartInstance = new Chart(refTendencia.current, {
        type: 'line',
        data: {
          labels: meses6.map(function(m){ return m.label; }),
          datasets: [
            { label:'Receitas', data:receitas6, borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.08)', fill:true,  tension:0.4, pointRadius:4, pointBackgroundColor:'#10b981' },
            { label:'Gastos',   data:gastos6,   borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.08)',  fill:true,  tension:0.4, pointRadius:4, pointBackgroundColor:'#ef4444' },
            { label:'Saldo',    data:saldo6,    borderColor:'#f97316', backgroundColor:'rgba(249,115,22,0.05)', fill:false, tension:0.4, pointRadius:4,
              pointBackgroundColor: saldo6.map(function(v){ return v>=0?'#10b981':'#ef4444'; }) }
          ]
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          interaction:{ mode:'index', intersect:false },
          plugins:{
            legend:{ position:'top' },
            tooltip:{ callbacks:{ label: function(ctx){ return ' R$ '+ctx.raw.toLocaleString('pt-BR',{minimumFractionDigits:2}); } } }
          },
          scales:{ y:{ ticks:{ callback: function(v){ return 'R$'+(v/1000).toFixed(0)+'k'; } } } }
        }
      });
    }, [mesAtual, anoAtual]);
    return React.createElement('div', {className:'space-y-4'},
      // Header
      React.createElement('div', {style:{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'flex-start',gap:'12px'}},
        React.createElement('div', null,
          React.createElement('h2', {style:{fontSize:'1.1rem',fontWeight:'800',color:'#1e1b4b',margin:0}}, '📊 Relatórios Financeiros'),
          React.createElement('p', {style:{fontSize:'0.75rem',color:C.textFaint,margin:'4px 0 0'}}, 'Exporte seus dados em PDF ou Excel')
        ),
        React.createElement('div', {style:{display:'flex',gap:'10px',flexWrap:'wrap'}},
          React.createElement('button', {
            onClick: exportarPDF,
            style:{display:'flex',alignItems:'center',gap:'7px',padding:'10px 18px',border:'none',borderRadius:'12px',background:'#dc2626',color:'#fff',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 14px rgba(239,68,68,0.35)'}
          }, '📄 Exportar PDF'),
          React.createElement('button', {
            onClick: exportarExcel,
            style:{display:'flex',alignItems:'center',gap:'7px',padding:'10px 18px',border:'none',borderRadius:'12px',background:'#059669',color:'#fff',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 14px rgba(16,185,129,0.35)'}
          }, '📊 Exportar Excel')
        )
      ),

      // Cards de resumo do mês
      React.createElement('div', {style:{display:'grid',gridTemplateColumns: _isMobRel ? 'repeat(2,1fr)' : 'repeat(4,1fr)',gap:'14px'}},
        [
          {label:'Receitas '+mesAtual.toUpperCase(), valor:saldoMes.receitas, bg:'#065f46', icon:'💰'},
          {label:'Despesas '+mesAtual.toUpperCase(), valor:saldoMes.despesas, bg:'#991b1b', icon:'💸'},
          {label:'Saldo '+mesAtual.toUpperCase(),    valor:saldoMes.saldo,    bg: saldoMes.positivo?'#065f46':'#991b1b', icon:'📈'},
          {label:'Taxa de Economia', valor:pctEcon+'%', bg:'#f97316', icon:'🎯', isStr:true}
        ].map(function(c,i){
          return React.createElement('div', {key:i, style:{background:c.bg,borderRadius:'16px',padding:'18px',color:'#fff',boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}},
            React.createElement('div', {style:{fontSize:'1.5rem',marginBottom:'8px'}}, c.icon),
            React.createElement('div', {style:{fontSize:'0.62rem',fontWeight:'800',letterSpacing:'1px',textTransform:'uppercase',opacity:0.7,marginBottom:'6px'}}, c.label),
            React.createElement('div', {style:{fontSize:'1.2rem',fontWeight:'900'}}, c.isStr ? c.valor : fmt(c.valor))
          );
        })
      ),

      // ── Feature 4: Gráfico de Tendência 6 Meses ────────────────────────────
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{fontSize:'0.7rem',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px',color:C.textFaint,marginBottom:'16px'}}, '📈 Tendência — Últimos 6 Meses'),
        React.createElement('div', {style:{height:'220px',position:'relative'}},
          React.createElement('canvas', {ref:refTendencia})
        )
      ),

      // ── Heatmap de Gastos ────────────────────────────────────────────────
      (function(){
        var idxHM     = MESES.indexOf(heatmapMes);
        var diasNoMes = new Date(heatmapAno, idxHM+1, 0).getDate();
        var priDiaSem = new Date(heatmapAno, idxHM, 1).getDay();

        var gvMes = gastosVariaveis.filter(function(g){return g.mes===heatmapMes&&g.ano===heatmapAno;});
        var geMes = gastosExtras.filter(function(g){return g.mes===heatmapMes&&g.ano===heatmapAno;});
        var gfMes = gastosFixos.filter(function(g){return (!g.mes||g.mes===heatmapMes)&&(!g.ano||g.ano===heatmapAno);});
        // Total cartões: fatura manual (valores) + parcelamentos já lançados no mês
        var totalCartoes = cartoes.reduce(function(s,c){
          var vBase = c.valores?.[heatmapAno]?.[heatmapMes]||0;
          var vParc = comprasParceladas.filter(function(p){return p.cartao===c.nome&&p.meses&&p.meses.includes(heatmapMes);}).reduce(function(ss,p){return ss+(p.valorParcela||0);},0);
          return s+vBase+vParc;
        },0);

        // Escala de cor: roxo único — limpo e profissional
        function corHeat(pct){
          if(!pct||pct===0) return darkMode?'rgba(255,255,255,0.04)':'#f8f7ff';
          var a = Math.max(0.12, Math.min(1, pct));
          return 'rgba(109,40,217,'+a.toFixed(2)+')';
        }
        function pct(v,max){ return (!max||!v)?0:Math.max(0.12,Math.min(1,v/max)); }
        function fmtK(v){ return v>=1000?'R$'+Math.round(v/1000)+'k':'R$'+Math.round(v); }

        // ── Calendário ──────────────────────────────────────────────────────
        var spendDay={};
        gvMes.forEach(function(g){var d=g.dataCompleta?+g.dataCompleta.split('-')[2]:0;if(d)spendDay[d]=(spendDay[d]||0)+g.valor;});
        geMes.forEach(function(g){var d=g.dataCompleta?+g.dataCompleta.split('-')[2]:0;if(d)spendDay[d]=(spendDay[d]||0)+g.valor;});
        gfMes.forEach(function(g){if(g.vencimento)spendDay[g.vencimento]=(spendDay[g.vencimento]||0)+g.valor;});
        // Cartões: fatura manual + parcelamentos lançados — plotados no dia de fechamento
        cartoes.forEach(function(c){
          var vBase = c.valores?.[heatmapAno]?.[heatmapMes]||0;
          var vParc = comprasParceladas.filter(function(p){return p.cartao===c.nome&&p.meses&&p.meses.includes(heatmapMes);}).reduce(function(ss,p){return ss+(p.valorParcela||0);},0);
          var v=vBase+vParc;
          if(v>0){var d=c.diaFechamento||c.vencimento||1;spendDay[d]=(spendDay[d]||0)+v;}
        });
        var maxDay=Math.max.apply(null,Object.values(spendDay).concat([1]));

        var cells=[];
        for(var p=0;p<priDiaSem;p++) cells.push(null);
        for(var d2=1;d2<=diasNoMes;d2++) cells.push(d2);
        while(cells.length%7) cells.push(null);

        var nomesMes={jan:'Janeiro',fev:'Fevereiro',mar:'Março',abr:'Abril',mai:'Maio',jun:'Junho',jul:'Julho',ago:'Agosto',set:'Setembro',out:'Outubro',nov:'Novembro',dez:'Dezembro'};
        var viewCalendario = React.createElement('div',null,
          // Sub-header: total do mês
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}},
            React.createElement('span',{style:{fontSize:'0.7rem',color:C.textFaint}}),
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
              React.createElement('span',{style:{fontSize:'0.6rem',color:C.textFaint}},'Sem gasto'),
              [0.15,0.35,0.55,0.75,0.95].map(function(a,i){return React.createElement('div',{key:i,style:{width:'14px',height:'14px',borderRadius:'4px',background:'rgba(109,40,217,'+a+')'}});}),
              React.createElement('span',{style:{fontSize:'0.6rem',color:C.textFaint}},'Pico')
            )
          ),
          // Cabeçalho dias da semana
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'4px'}},
            ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(function(l,i){
              return React.createElement('div',{key:i,style:{textAlign:'center',fontSize:'0.58rem',fontWeight:'600',color:C.textFaint,paddingBottom:'2px'}},l);
            })
          ),
          // Grid de dias
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}},
            cells.map(function(day,i){
              if(!day) return React.createElement('div',{key:i,style:{aspectRatio:'1'}});
              var v=spendDay[day]||0;
              var p2=pct(v,maxDay);
              var isHot=p2>0.6;
              return React.createElement('div',{key:i,
                title:'Dia '+day+(v?' — R$ '+v.toFixed(2):' — sem gastos'),
                style:{aspectRatio:'1',borderRadius:'7px',background:corHeat(v?p2:0),
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  cursor:'default',border:'1px solid '+(v?'rgba(109,40,217,0.2)':(darkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'))
                }},
                React.createElement('span',{style:{fontSize:'0.62rem',fontWeight:v?'700':'400',lineHeight:1,color:isHot?'#fff':(v?'#ea580c':C.textFaint)}},day),
                v>0&&React.createElement('span',{style:{fontSize:'0.46rem',fontWeight:'600',color:isHot?'rgba(255,255,255,0.8)':'rgba(109,40,217,0.7)',lineHeight:1,marginTop:'1px'}},fmtK(v))
              );
            })
          )
        );

        // ── Categoria × Semana ──────────────────────────────────────────────
        var matrizCat={};
        function addCS(cat,sem,val){if(!matrizCat[cat])matrizCat[cat]={1:0,2:0,3:0,4:0,5:0,tot:0};matrizCat[cat][Math.min(sem,5)]+=val;matrizCat[cat].tot+=val;}
        gvMes.concat(geMes).forEach(function(g){addCS(g.categoria,g.dataCompleta?Math.ceil(+g.dataCompleta.split('-')[2]/7):1,g.valor);});
        gfMes.forEach(function(g){addCS('🏠 Fixos',Math.ceil((g.vencimento||1)/7),g.valor);});
        if(totalCartoes>0)addCS('💳 Cartões',1,totalCartoes);
        var catsOrd=Object.keys(matrizCat).sort(function(a,b){return matrizCat[b].tot-matrizCat[a].tot;}).slice(0,9);
        var maxCat=1;
        catsOrd.forEach(function(c){[1,2,3,4,5].forEach(function(s){if(matrizCat[c][s]>maxCat)maxCat=matrizCat[c][s];});});

        var viewCategorias = catsOrd.length===0
          ? React.createElement('div',{style:{padding:'32px',textAlign:'center',color:C.textFaint,fontSize:'0.8rem'}},'Sem gastos no período')
          : React.createElement('div',{style:{overflowX:'auto'}},
              React.createElement('table',{style:{width:'100%',borderCollapse:'separate',borderSpacing:'0 3px'}},
                React.createElement('thead',null,React.createElement('tr',null,
                  React.createElement('th',{style:{textAlign:'left',padding:'0 12px 8px 0',color:C.textFaint,fontWeight:'600',fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}},'Categoria'),
                  ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Total'].map(function(s,i){
                    return React.createElement('th',{key:i,style:{textAlign:'center',padding:'0 2px 8px',color:C.textFaint,fontWeight:'600',fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.5px',minWidth:'52px'}},s);
                  })
                )),
                React.createElement('tbody',null,
                  catsOrd.map(function(cat,ci){
                    var totCat=matrizCat[cat].tot;
                    return React.createElement('tr',{key:cat},
                      React.createElement('td',{style:{padding:'2px 12px 2px 0',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},
                        React.createElement('span',{style:{fontSize:'0.72rem',fontWeight:'600',color:C.text}},cat)
                      ),
                      [1,2,3,4,5].map(function(s){
                        var v=matrizCat[cat][s];var p3=pct(v,maxCat);
                        return React.createElement('td',{key:s,
                          title:cat+' · Sem '+s+(v?' — R$ '+v.toFixed(2):' — sem gastos'),
                          style:{textAlign:'center',padding:'2px',cursor:'default'}},
                          React.createElement('div',{style:{background:corHeat(p3),borderRadius:'7px',padding:'5px 3px',
                            color:p3>0.5?'#fff':(v?'#ea580c':C.textFaint),fontWeight:'700',fontSize:'0.62rem',minWidth:'44px'}},
                            v>0?fmtK(v):'—')
                        );
                      }),
                      React.createElement('td',{style:{textAlign:'center',padding:'2px',cursor:'default'}},
                        React.createElement('div',{style:{background:darkMode?'rgba(255,255,255,0.06)':'#f3f0ff',borderRadius:'7px',padding:'5px 3px',
                          color:'#f97316',fontWeight:'800',fontSize:'0.62rem',minWidth:'44px'}},
                          fmtK(totCat))
                      )
                    );
                  })
                )
              )
            );

        // ── Treemap ─────────────────────────────────────────────────────────
        var treeCats={};
        gvMes.concat(geMes).forEach(function(g){treeCats[g.categoria]=(treeCats[g.categoria]||0)+g.valor;});
        gfMes.forEach(function(g){treeCats['🏠 Fixos']=(treeCats['🏠 Fixos']||0)+g.valor;});
        if(totalCartoes>0)treeCats['💳 Cartões']=(treeCats['💳 Cartões']||0)+totalCartoes;
        var treeArr=Object.entries(treeCats).sort(function(a,b){return b[1]-a[1];});
        var treeTot=treeArr.reduce(function(s,e){return s+e[1];},0)||1;
        // paleta distinta por categoria
        var paleta=['#f97316','#7c3aed','#8b5cf6','#a78bfa','#ea580c','#c2410c','#ea580c','#7e22ce','#9333ea','#a855f7','#c026d3','#db2777'];

        var viewTreemap = treeArr.length===0
          ? React.createElement('div',{style:{padding:'32px',textAlign:'center',color:C.textFaint}},'Sem gastos no período')
          : React.createElement('div',null,
              // Blocos proporcionais — altura fixa, largura proporcional
              React.createElement('div',{style:{display:'flex',gap:'4px',height:'120px',borderRadius:'10px',overflow:'hidden',marginBottom:'12px'}},
                treeArr.map(function(e,i){
                  var p4=e[1]/treeTot;
                  return React.createElement('div',{key:e[0],title:e[0]+' — R$ '+e[1].toFixed(2)+' ('+Math.round(p4*100)+'%)',
                    style:{flex:Math.max(p4*100,2),background:paleta[i%paleta.length],
                      display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'8px 6px',
                      cursor:'default',minWidth:'0',overflow:'hidden',position:'relative'}},
                    p4>0.06&&React.createElement('div',{style:{fontSize:'0.58rem',fontWeight:'800',color:'rgba(255,255,255,0.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:'2px'}},e[0]),
                    p4>0.04&&React.createElement('div',{style:{fontSize:'0.75rem',fontWeight:'900',color:'#fff',whiteSpace:'nowrap'}},'R$'+Math.round(e[1]).toLocaleString('pt-BR')),
                    p4>0.08&&React.createElement('div',{style:{fontSize:'0.52rem',color:'rgba(255,255,255,0.65)',marginTop:'1px'}},Math.round(p4*100)+'%')
                  );
                })
              ),
              // Legenda em grid
              React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'6px'}},
                treeArr.map(function(e,i){
                  var p5=e[1]/treeTot;
                  return React.createElement('div',{key:e[0],style:{display:'flex',alignItems:'center',gap:'6px',padding:'5px 8px',
                    borderRadius:'8px',background:darkMode?'rgba(255,255,255,0.04)':'#faf9ff',
                    border:'1px solid '+(darkMode?'rgba(255,255,255,0.06)':'rgba(109,40,217,0.1)')}},
                    React.createElement('div',{style:{width:'10px',height:'10px',borderRadius:'3px',flexShrink:0,background:paleta[i%paleta.length]}}),
                    React.createElement('span',{style:{fontSize:'0.65rem',fontWeight:'600',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}},e[0]),
                    React.createElement('span',{style:{fontSize:'0.65rem',fontWeight:'800',color:'#f97316',flexShrink:0}},Math.round(p5*100)+'%')
                  );
                })
              )
            );

        // ── Render do card ───────────────────────────────────────────────────
        var views={calendario:viewCalendario,categorias:viewCategorias,treemap:viewTreemap};
        var tabs=[{v:'calendario',l:'Calendário'},{v:'categorias',l:'Cat × Semana'},{v:'treemap',l:'Treemap'}];
        function hmPrev(){var i=MESES.indexOf(heatmapMes);if(i>0)setHeatmapMes(MESES[i-1]);else{setHeatmapMes(MESES[11]);setHeatmapAno(heatmapAno-1);}}
        function hmNext(){var i=MESES.indexOf(heatmapMes);if(i<11)setHeatmapMes(MESES[i+1]);else{setHeatmapMes(MESES[0]);setHeatmapAno(heatmapAno+1);}}

        return React.createElement('div',{style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 12px rgba(109,40,217,0.08)'}},
          // Header
          React.createElement('div',{style:{padding:'12px 18px',borderBottom:'1px solid '+C.borderLight,display:'flex',flexWrap:'wrap',alignItems:'center',gap:'10px',justifyContent:'space-between',background:darkMode?'rgba(109,40,217,0.08)':'rgba(109,40,217,0.03)'}},
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
              React.createElement('div',{style:{width:'28px',height:'28px',borderRadius:'8px',background:'#f97316',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}},'🌡️'),
              React.createElement('div',null,
                React.createElement('div',{style:{fontSize:'0.78rem',fontWeight:'800',color:C.text}},'Mapa de Calor de Gastos'),
                React.createElement('div',{style:{fontSize:'0.62rem',color:C.textFaint,marginTop:'1px'}},'Identifique onde está seu dinheiro')
              )
            ),
            // Navegação de mês + tabs
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}},
              // Seletor de mês
              React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'0',border:'1px solid '+C.border,borderRadius:'8px',overflow:'hidden'}},
                React.createElement('button',{onClick:hmPrev,style:{width:'28px',height:'28px',border:'none',background:C.bg,color:C.text,cursor:'pointer',fontSize:'0.85rem',display:'flex',alignItems:'center',justifyContent:'center',padding:0}},'‹'),
                React.createElement('span',{style:{padding:'0 10px',fontSize:'0.72rem',fontWeight:'700',color:'#f97316',background:darkMode?'rgba(249,115,22,0.12)':'#f5f3ff',height:'28px',display:'flex',alignItems:'center',whiteSpace:'nowrap'}},nomesMes[heatmapMes]+' '+heatmapAno),
                React.createElement('button',{onClick:hmNext,style:{width:'28px',height:'28px',border:'none',background:C.bg,color:C.text,cursor:'pointer',fontSize:'0.85rem',display:'flex',alignItems:'center',justifyContent:'center',padding:0}},'›')
              ),
              // Tabs
              React.createElement('div',{style:{display:'flex',background:darkMode?'rgba(255,255,255,0.06)':'#f3f0ff',borderRadius:'8px',padding:'2px',gap:'2px'}},
                tabs.map(function(t){
                  var ativo=heatmapView===t.v;
                  return React.createElement('button',{key:t.v,onClick:function(){setHeatmapView(t.v);},
                    style:{padding:'5px 11px',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'0.65rem',fontWeight:'700',transition:'all .15s',
                      background:ativo?'#f97316':'transparent',
                      color:ativo?'#fff':C.textFaint,
                      boxShadow:ativo?'0 1px 4px rgba(109,40,217,0.4)':'none'}},t.l);
                })
              )
            )
          ),
          // Conteúdo
          React.createElement('div',{style:{padding:'16px 18px'}},views[heatmapView])
        );
      })(),

      // ── Feature A: Gastos por Categoria (Consolidado) ──────────────────────
      (function(){
        var catMap={};
        function addCat(cat,val){if(!cat||!val)return;catMap[cat]=(catMap[cat]||0)+val;}
        gastosVariaveis.filter(function(g){return g.mes===mesAtual&&g.ano===anoAtual;}).forEach(function(g){addCat(g.categoria,g.valor);});
        gastosExtras.filter(function(g){return g.mes===mesAtual&&g.ano===anoAtual;}).forEach(function(g){addCat(g.categoria,g.valor);});
        gastosFixos.filter(function(g){return (!g.mes||g.mes===mesAtual)&&(!g.ano||g.ano===anoAtual);}).forEach(function(g){addCat(g.categoria||'Contas Fixas',g.valor);});
        var totalCart=cartoes.reduce(function(s,c){var vB=c.valores?.[anoAtual]?.[mesAtual]||0;var vP=comprasParceladas.filter(function(p){return p.cartao===c.nome&&p.meses&&p.meses.includes(mesAtual);}).reduce(function(ss,p){return ss+(p.valorParcela||0);},0);return s+vB+vP;},0);
        if(totalCart>0)addCat('💳 Cartões',totalCart);
        var arr=Object.entries(catMap).sort(function(a,b){return b[1]-a[1];});
        var tot=arr.reduce(function(s,c){return s+c[1];},0);
        if(arr.length===0)return null;
        var cores=['#f97316','#8b5cf6','#a78bfa','#0ea5e9','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#ec4899','#84cc16','#14b8a6'];
        return React.createElement('div',{style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
          React.createElement('div',{style:{padding:'14px 20px',borderBottom:'1px solid '+C.borderLight,background:C.bgMuted,display:'flex',justifyContent:'space-between',alignItems:'center'}},
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
              React.createElement('div',{style:{width:'28px',height:'28px',borderRadius:'8px',background:'#f97316',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}},'🏷️'),
              React.createElement('div',null,
                React.createElement('div',{style:{fontSize:'0.78rem',fontWeight:'800',color:C.text}},'Gastos por Categoria'),
                React.createElement('div',{style:{fontSize:'0.62rem',color:C.textFaint,marginTop:'1px'}},'Todos os tipos · '+mesAtual.toUpperCase()+' '+anoAtual)
              )
            ),
            React.createElement('div',{style:{fontSize:'0.78rem',fontWeight:'800',color:C.text}},fmt(tot))
          ),
          React.createElement('div',{style:{padding:'16px 20px',display:'flex',flexDirection:'column',gap:'8px'}},
            arr.map(function(entry,i){
              var cat=entry[0],val=entry[1];
              var p=tot>0?val/tot:0;
              var cor=cores[i%cores.length];
              return React.createElement('div',{key:cat},
                React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}},
                  React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
                    React.createElement('div',{style:{width:'8px',height:'8px',borderRadius:'2px',background:cor,flexShrink:0}}),
                    React.createElement('span',{style:{fontSize:'0.75rem',fontWeight:'700',color:C.text}},cat)
                  ),
                  React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
                    React.createElement('span',{style:{fontSize:'0.7rem',color:C.textFaint}},(p*100).toFixed(1)+'%'),
                    React.createElement('span',{style:{fontSize:'0.75rem',fontWeight:'800',color:C.text}},fmt(val))
                  )
                ),
                React.createElement('div',{style:{height:'6px',background:C.bgTable,borderRadius:'3px',overflow:'hidden'}},
                  React.createElement('div',{style:{height:'100%',width:(p*100).toFixed(1)+'%',background:cor,borderRadius:'3px',transition:'width .6s ease'}})
                )
              );
            })
          )
        );
      })(),

      // ── Feature B: Fluxo de Caixa por Dia ──────────────────────────────────
      (function(){
        var idxM=MESES.indexOf(mesAtual);
        var diasNoMes=new Date(anoAtual,idxM+1,0).getDate();
        var flowDay={};
        gastosVariaveis.filter(function(g){return g.mes===mesAtual&&g.ano===anoAtual;}).forEach(function(g){var d=g.dataCompleta?+g.dataCompleta.split('-')[2]:0;if(d)flowDay[d]=(flowDay[d]||0)+g.valor;});
        gastosExtras.filter(function(g){return g.mes===mesAtual&&g.ano===anoAtual;}).forEach(function(g){var d=g.dataCompleta?+g.dataCompleta.split('-')[2]:0;if(d)flowDay[d]=(flowDay[d]||0)+g.valor;});
        gastosFixos.filter(function(g){return (!g.mes||g.mes===mesAtual)&&(!g.ano||g.ano===anoAtual);}).forEach(function(g){if(g.vencimento)flowDay[g.vencimento]=(flowDay[g.vencimento]||0)+g.valor;});
        cartoes.forEach(function(c){var v=(c.valores?.[anoAtual]?.[mesAtual]||0)+comprasParceladas.filter(function(p){return p.cartao===c.nome&&p.meses&&p.meses.includes(mesAtual);}).reduce(function(ss,p){return ss+(p.valorParcela||0);},0);if(v>0){var d=c.diaFechamento||c.vencimento||1;flowDay[d]=(flowDay[d]||0)+v;}});
        if(Object.keys(flowDay).length===0)return null;
        var days=Array.from({length:diasNoMes},function(_,i){return {d:i+1,v:flowDay[i+1]||0};});
        var maxV=Math.max.apply(null,days.map(function(d){return d.v;}).concat([1]));
        var sorted=days.slice().sort(function(a,b){return b.v-a.v;});
        var top3=new Set(sorted.slice(0,3).filter(function(d){return d.v>0;}).map(function(d){return d.d;}));
        return React.createElement('div',{style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
          React.createElement('div',{style:{padding:'14px 20px',borderBottom:'1px solid '+C.borderLight,background:C.bgMuted,display:'flex',justifyContent:'space-between',alignItems:'center'}},
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
              React.createElement('div',{style:{width:'28px',height:'28px',borderRadius:'8px',background:'#f97316',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}},'📅'),
              React.createElement('div',null,
                React.createElement('div',{style:{fontSize:'0.78rem',fontWeight:'800',color:C.text}},'Fluxo de Caixa por Dia'),
                React.createElement('div',{style:{fontSize:'0.62rem',color:C.textFaint,marginTop:'1px'}},'Saídas por dia · '+mesAtual.toUpperCase()+' '+anoAtual)
              )
            )
          ),
          React.createElement('div',{style:{padding:'16px 20px'}},
            React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:'2px',height:'80px',marginBottom:'6px'}},
              days.map(function(day){
                var p2=maxV>0?day.v/maxV:0;
                var isTop=top3.has(day.d);
                var cor=isTop?'#ef4444':day.v>0?'#f97316':(darkMode?'rgba(255,255,255,0.07)':'#f1f5f9');
                return React.createElement('div',{key:day.d,title:'Dia '+day.d+(day.v?' — '+fmt(day.v):' — sem saída'),
                  style:{flex:1,height:Math.max(4,p2*100)+'%',background:cor,borderRadius:'3px 3px 0 0',minHeight:'3px'}});
              })
            ),
            React.createElement('div',{style:{display:'flex',gap:'2px',marginBottom:'12px'}},
              days.map(function(day){
                var show=day.d===1||day.d%5===0||day.d===diasNoMes;
                return React.createElement('div',{key:day.d,style:{flex:1,textAlign:'center',fontSize:'0.48rem',color:C.textFaint,fontWeight:show?'700':'400'}},show?day.d:'');
              })
            ),
            sorted.slice(0,3).filter(function(d){return d.v>0;}).length>0&&React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px',alignItems:'center'}},
              React.createElement('span',{style:{fontSize:'0.65rem',fontWeight:'700',color:C.textFaint}},'🔴 Dias mais pesados:'),
              sorted.slice(0,3).filter(function(d){return d.v>0;}).map(function(day){
                return React.createElement('span',{key:day.d,style:{fontSize:'0.65rem',fontWeight:'800',padding:'2px 8px',borderRadius:'20px',background:darkMode?'rgba(239,68,68,0.15)':'#fee2e2',color:'#991b1b'}},'Dia '+day.d+' — '+fmt(day.v));
              })
            )
          )
        );
      })(),

      // Preview anual
      React.createElement('div', {style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
        React.createElement('div', {style:{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',background:'#fafbff'}},
          React.createElement('h3', {style:{margin:0,fontSize:'0.85rem',fontWeight:'800',color:'#1e1b4b'}}, '📅 Resumo Anual ' + anoAtual),
          React.createElement('p', {style:{margin:'4px 0 0',fontSize:'0.7rem',color:C.textFaint}}, 'Clique em Exportar Excel para ver os detalhes completos em 6 abas')
        ),
        React.createElement('div', {style:{overflowX:'auto', WebkitOverflowScrolling:'touch'}},
          React.createElement('table', {style:{width:'100%',borderCollapse:'collapse',fontSize:'0.78rem'}},
            React.createElement('thead', null,
              React.createElement('tr', {style:{background:C.bgMuted}},
                ['Mês','Receitas','Despesas','Saldo'].map(function(h){
                  return React.createElement('th', {key:h, style:{padding: _isMobRel ? '8px 10px' : '10px 16px',textAlign:'left',fontWeight:'700',color:C.textMuted,letterSpacing:'0.5px',fontSize:'0.7rem',textTransform:'uppercase'}}, h);
                })
              )
            ),
            React.createElement('tbody', null,
              dadosAnuais.map(function(row, i){
                return React.createElement('tr', {key:i, style:{borderTop:'1px solid #f1f5f9', background: row.mes === mesAtual.toUpperCase() ? '#eef2ff' : 'transparent'}},
                  React.createElement('td', {style:{padding: _isMobRel ? '8px 10px' : '10px 16px',fontWeight:'700',color: row.mes===mesAtual.toUpperCase()?'#f97316':'#374151'}}, row.mes),
                  React.createElement('td', {style:{padding: _isMobRel ? '8px 10px' : '10px 16px',color:'#059669',fontWeight:'600',fontSize: _isMobRel ? '0.72rem' : '0.78rem'}}, fmt(row.receitas)),
                  React.createElement('td', {style:{padding: _isMobRel ? '8px 10px' : '10px 16px',color:'#dc2626',fontWeight:'600',fontSize: _isMobRel ? '0.72rem' : '0.78rem'}}, fmt(row.despesas)),
                  React.createElement('td', {style:{padding: _isMobRel ? '8px 10px' : '10px 16px',fontWeight:'700',color:row.saldo>=0?'#059669':'#dc2626',fontSize: _isMobRel ? '0.72rem' : '0.78rem'}}, fmt(row.saldo))
                );
              })
            )
          )
        )
      ),

      // ── Feature 6: Comparativo Mês vs. Mês Anterior ────────────────────────
      (function(){
        var idxMes     = MESES.indexOf(mesAtual);
        var mesAnt     = idxMes > 0 ? MESES[idxMes-1] : MESES[11];
        var anoAnt     = idxMes === 0 ? anoAtual-1 : anoAtual;
        var tAt        = calcularTotais(mesAtual);
        var gfAnt      = gastosFixos.filter(function(g){return g.mes===mesAnt&&g.ano===anoAnt;}).reduce(function(s,g){return s+g.valor;},0);
        var gvAnt      = gastosVariaveis.filter(function(g){return g.mes===mesAnt&&g.ano===anoAnt;}).reduce(function(s,g){return s+g.valor;},0);
        var geAnt      = gastosExtras.filter(function(g){return g.mes===mesAnt&&g.ano===anoAnt;}).reduce(function(s,g){return s+g.valor;},0);
        var gcAnt      = cartoes.reduce(function(s,c){return s+(c.valores?.[anoAnt]?.[mesAnt]||0);},0);
        var totalAnt   = gfAnt+gvAnt+geAnt+gcAnt;
        var rAt        = receitas.filter(function(r){return r.mes===mesAtual&&r.ano===anoAtual;}).reduce(function(s,r){return s+r.valor;},0);
        var rAnt       = receitas.filter(function(r){return r.mes===mesAnt&&r.ano===anoAnt;}).reduce(function(s,r){return s+r.valor;},0);
        var linhas = [
          {label:'💰 Receitas',     atual:rAt,          anterior:rAnt,    inverter:false},
          {label:'🏠 Fixos',        atual:tAt.fixos,    anterior:gfAnt,   inverter:true},
          {label:'🛒 Variáveis',    atual:tAt.variaveis,anterior:gvAnt,   inverter:true},
          {label:'⚡ Extras',       atual:tAt.extras,   anterior:geAnt,   inverter:true},
          {label:'💳 Cartões',      atual:tAt.cartoes,  anterior:gcAnt,   inverter:true},
          {label:'📊 Total Gastos', atual:tAt.total,    anterior:totalAnt,inverter:true},
          {label:'✅ Saldo',        atual:rAt-tAt.total,anterior:rAnt-totalAnt,inverter:false},
        ];
        return React.createElement('div', {style:{background:C.bg,borderRadius:'16px',border:'1px solid '+C.border,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}},
          React.createElement('div', {style:{padding:'14px 20px',borderBottom:'1px solid '+C.borderLight,display:'flex',justifyContent:'space-between',alignItems:'center',background:C.bgMuted}},
            React.createElement('div', {style:{fontWeight:'800',fontSize:'0.85rem',color:C.text}}, '⚖️ Comparativo Meses'),
            React.createElement('div', {style:{fontSize:'0.7rem',color:C.textFaint,fontWeight:'600'}}, mesAnt.toUpperCase()+' vs '+mesAtual.toUpperCase())
          ),
          React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 72px',padding:'8px 20px',background:C.bgTable,fontSize:'0.62rem',fontWeight:'800',color:C.textFaint,textTransform:'uppercase',letterSpacing:'0.5px'}},
            React.createElement('div',null,'Categoria'),
            React.createElement('div',{style:{textAlign:'right'}},mesAnt.toUpperCase()),
            React.createElement('div',{style:{textAlign:'right'}},mesAtual.toUpperCase()),
            React.createElement('div',{style:{textAlign:'right'}},'Var. %')
          ),
          linhas.map(function(linha,i){
            var diff = linha.anterior > 0 ? Math.round((linha.atual-linha.anterior)/linha.anterior*100) : null;
            var melhorou = linha.inverter ? (linha.atual < linha.anterior) : (linha.atual > linha.anterior);
            var corVar = diff===null ? C.textFaint : (melhorou ? '#10b981' : '#ef4444');
            var isLast = i===linhas.length-1;
            return React.createElement('div', {key:i, style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 72px',padding:'10px 20px',borderTop:'1px solid '+C.borderLight,background:isLast?(darkMode?'rgba(249,115,22,0.08)':'#f5f3ff'):'transparent'}},
              React.createElement('div',{style:{color:C.text,fontWeight:isLast?'800':'600',fontSize:'0.78rem'}},linha.label),
              React.createElement('div',{style:{textAlign:'right',color:C.textMuted,fontSize:'0.75rem'}},fmt(linha.anterior)),
              React.createElement('div',{style:{textAlign:'right',color:C.text,fontWeight:'700',fontSize:'0.78rem'}},fmt(linha.atual)),
              React.createElement('div',{style:{textAlign:'right',fontWeight:'800',fontSize:'0.78rem',color:corVar}},
                diff===null ? '—' : (diff>0?'+':'')+diff+'%'
              )
            );
          })
        );
      })(),

      // Botões grandes de export
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}},
        React.createElement('div', {style:{background:'#fef2f2',borderRadius:'16px',padding:'24px',border:'1.5px solid #fecaca',cursor:'pointer'},onClick:exportarPDF},
          React.createElement('div', {style:{fontSize:'2.5rem',marginBottom:'12px'}}, '📄'),
          React.createElement('h3', {style:{margin:'0 0 6px',fontSize:'1rem',fontWeight:'800',color:'#dc2626'}}, 'Relatório PDF'),
          React.createElement('p', {style:{margin:0,fontSize:'0.75rem',color:'#9f1239',lineHeight:'1.5'}}, 'Resumo completo do mês com gráficos, tabelas de despesas, lista de gastos variáveis e progresso das metas.')
        ),
        React.createElement('div', {style:{background:'#f0fdf4',borderRadius:'16px',padding:'24px',border:'1.5px solid #bbf7d0',cursor:'pointer'},onClick:exportarExcel},
          React.createElement('div', {style:{fontSize:'2.5rem',marginBottom:'12px'}}, '📊'),
          React.createElement('h3', {style:{margin:'0 0 6px',fontSize:'1rem',fontWeight:'800',color:'#059669'}}, 'Planilha Excel'),
          React.createElement('p', {style:{margin:0,fontSize:'0.75rem',color:'#065f46',lineHeight:'1.5'}}, '6 abas: Resumo, Contas Fixas, Gastos Variáveis, Cartões de Crédito, Receitas e Resumo Anual completo.')
        )
      )
    );
  };
  // ────────────────────────────────────────────────────────────────────────────

  // Casal functions
  const criarCasal = async () => {
    if (!user || !db) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    try {
      // Salva no pr\xF3prio documento do usu\xE1rio (permitido pelas regras do Firestore)
      await db.collection('usuarios').doc(user.uid).set({
        casalCodigo: code,
        casalDono: true,
        casalCriadoEm: new Date().toISOString(),
        casalParceiroUid: null,
        casalParceiroEmail: null,
      }, { merge: true });
      localStorage.setItem('coupleId', code);
      localStorage.setItem('coupleOwnerUid', user.uid);
      setCoupleId(code);
      setCoupleInfo({ emailDono: user.email, emailParceiro: null, dono: user.uid });
    } catch(e) {
      console.error('[criarCasal] Erro:', e);
      alert('Erro ao criar casal: ' + (e.message || String(e)));
    }
  };

  const entrarNoCasal = async (code) => {
    if (!user || !code || !db) return;
    const trimCode = code.trim().toUpperCase();
    try {
      // Busca usu\xE1rio dono do c\xF3digo
      const snap = await db.collection('usuarios').where('casalCodigo', '==', trimCode).limit(1).get();
      if (snap.empty) { alert('C\xF3digo n\xE3o encontrado. Verifique e tente novamente.'); return; }
      const ownerDoc = snap.docs[0];
      if (ownerDoc.id === user.uid) { alert('Este \xE9 o seu pr\xF3prio c\xF3digo de casal.'); return; }
      const ownerData = ownerDoc.data();
      // Tenta vincular no documento do dono (pode falhar se regras s\xF3 permitem escrita no pr\xF3prio doc)
      try {
        await db.collection('usuarios').doc(ownerDoc.id).update({
          casalParceiroUid: user.uid,
          casalParceiroEmail: user.email,
        });
      } catch (ruleErr) {
        console.warn('[entrarNoCasal] N\xE3o foi poss\xEDvel atualizar doc do dono (regras):', ruleErr.message);
      }
      // Salva no pr\xF3prio documento (garantido pelas regras)
      await db.collection('usuarios').doc(user.uid).set({
        casalCodigo: trimCode,
        casalDono: false,
        casalOwnerUid: ownerDoc.id,
        casalOwnerEmail: ownerData.email || '',
      }, { merge: true });
      localStorage.setItem('coupleId', trimCode);
      localStorage.setItem('coupleOwnerUid', ownerDoc.id);
      setCoupleId(trimCode);
      setCoupleInfo({ emailDono: ownerData.email || 'Parceiro(a)', emailParceiro: user.email, parceiro: user.uid, dono: ownerDoc.id });
    } catch(e) {
      console.error('[entrarNoCasal] Erro:', e);
      alert('Erro ao entrar no casal: ' + (e.message || String(e)));
    }
  };

  const sairDoCasal = async () => {
    if (!user || !coupleId) return;
    if (!window.confirm('Sair do modo casal? Seus dados voltam a ser individuais.')) return;
    try {
      await db.collection('usuarios').doc(user.uid).update({
        casalCodigo: null, casalDono: null, casalOwnerUid: null,
        casalOwnerEmail: null, casalParceiroUid: null, casalParceiroEmail: null,
      });
    } catch(e) { console.error('[sairDoCasal] Erro Firestore:', e); }
    localStorage.removeItem('coupleId');
    localStorage.removeItem('coupleOwnerUid');
    setCoupleId(null);
    setCoupleInfo(null);
  };

  const TelaConfiguracoes = () => {
    const [codigoEntrada, setCodigoEntrada] = React.useState('');
    const [mostrarEntrar, setMostrarEntrar] = React.useState(false);
    const [copiado, setCopiado] = React.useState(false);
    // Status de notificações — reativo (atualiza após o usuário clicar)
    const [notifStatus, setNotifStatus] = React.useState(function() {
      if (typeof Notification === 'undefined') return 'unsupported';
      return Notification.permission; // 'default' | 'granted' | 'denied'
    });

    const copiarCodigo = () => {
      if (coupleId) { navigator.clipboard.writeText(coupleId).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }); }
    };

    const card = (children) => React.createElement('div', {
      style:{background:C.bg, borderRadius:'16px', padding:'24px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:'16px'}
    }, children);

    const sectionTitle = (icon, title) => React.createElement('div', {
      style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'1.3px', textTransform:'uppercase', color:C.textFaint, marginBottom:'18px', display:'flex', alignItems:'center', gap:'6px'}
    }, icon, ' ', title);

    return React.createElement('div', {style:{maxWidth:'620px', margin:'0 auto', padding:'24px 20px'}},

      React.createElement('div', {style:{fontSize:'1.25rem', fontWeight:'900', color:C.text, marginBottom:'24px'}}, '⚙️ Configurações'),

      card([
        sectionTitle('☀️', 'Aparência'),
        React.createElement('div', {style:{display:'flex', alignItems:'center', justifyContent:'space-between'}},
          React.createElement('div', null,
            React.createElement('div', {style:{fontWeight:'700', color:C.text, fontSize:'0.9rem'}}, 'Modo Escuro'),
            React.createElement('div', {style:{fontSize:'0.75rem', color:C.textMuted, marginTop:'2px'}}, darkMode ? 'Tema escuro ativado' : 'Tema claro ativado')
          ),
          React.createElement('div', {
            onClick: () => setDarkMode(!darkMode),
            style:{width:'52px', height:'28px', borderRadius:'14px', background:darkMode?'#f97316':'#d1d5db', position:'relative', cursor:'pointer', transition:'background 0.2s'}
          },
            React.createElement('div', {
              style:{position:'absolute', top:'3px', left:darkMode?'25px':'3px', width:'22px', height:'22px', borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.3)', transition:'left 0.2s'}
            })
          )
        )
      ]),

      card([
        sectionTitle('👤', 'Conta'),
        React.createElement('div', {style:{display:'flex', flexDirection:'column', gap:'10px'}},
          React.createElement('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:C.bgMuted, borderRadius:'10px'}},
            React.createElement('span', {style:{fontSize:'0.78rem', color:C.textMuted}}, 'E-mail'),
            React.createElement('span', {style:{fontSize:'0.82rem', fontWeight:'700', color:C.text}}, user ? user.email : '-')
          ),
          React.createElement('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:C.bgMuted, borderRadius:'10px'}},
            React.createElement('span', {style:{fontSize:'0.78rem', color:C.textMuted}}, 'UID'),
            React.createElement('span', {style:{fontSize:'0.72rem', fontFamily:'monospace', color:C.textFaint}}, user ? user.uid.substring(0,16)+'...' : '-')
          )
        )
      ]),

      card([
        sectionTitle('💑', 'Modo Casal'),
        coupleId ? React.createElement('div', null,
          React.createElement('div', {style:{background:'#f0fdf4', borderRadius:'12px', padding:'14px', border:'1px solid #86efac', marginBottom:'14px'}},
            React.createElement('div', {style:{fontSize:'0.7rem', color:'#16a34a', fontWeight:'700', marginBottom:'4px'}}, '✅ Modo Casal Ativo'),
            React.createElement('div', {style:{fontSize:'0.82rem', fontWeight:'800', letterSpacing:'3px', color:'#15803d', margin:'8px 0', fontFamily:'monospace'}}, coupleId),
            React.createElement('button', {onClick:copiarCodigo, style:{fontSize:'0.72rem', padding:'5px 12px', border:'1px solid #16a34a', borderRadius:'7px', background:'transparent', color:'#16a34a', cursor:'pointer', fontWeight:'700'}}, copiado ? '✔ Copiado!' : 'Copiar código'),
            coupleInfo && coupleInfo.emailParceiro && React.createElement('div', {style:{fontSize:'0.72rem', color:'#166534', marginTop:'8px'}}, 'Parceiro(a): '+coupleInfo.emailParceiro)
          ),
          React.createElement('button', {onClick:sairDoCasal, style:{width:'100%', padding:'10px', border:'2px solid #fca5a5', borderRadius:'10px', background:'transparent', color:'#dc2626', fontWeight:'700', cursor:'pointer', fontSize:'0.82rem'}}, 'Sair do Modo Casal')
        ) : React.createElement('div', null,
          React.createElement('div', {style:{fontSize:'0.82rem', color:C.textMuted, marginBottom:'16px', lineHeight:'1.5'}}, 'Compartilhe seu orçamento com seu parceiro(a) em tempo real.'),
          !mostrarEntrar ? React.createElement('div', {style:{display:'flex', gap:'10px', flexWrap:'wrap'}},
            React.createElement('button', {
              onClick: criarCasal,
              style:{flex:1, padding:'11px', border:'none', borderRadius:'10px', background:'#f97316', color:'#fff', fontWeight:'800', cursor:'pointer', fontSize:'0.82rem'}
            }, '+ Criar Casal'),
            React.createElement('button', {
              onClick: () => setMostrarEntrar(true),
              style:{flex:1, padding:'11px', border:'2px solid '+C.border, borderRadius:'10px', background:'transparent', color:C.text, fontWeight:'700', cursor:'pointer', fontSize:'0.82rem'}
            }, 'Entrar em Casal')
          ) : React.createElement('div', {style:{display:'flex', gap:'8px', alignItems:'center'}},
            React.createElement('input', {
              value: codigoEntrada, onChange:e=>setCodigoEntrada(e.target.value.toUpperCase()),
              placeholder:'Código (ex: ABC123)', maxLength:6,
              style:{flex:1, padding:'10px 12px', border:'2px solid '+C.border, borderRadius:'10px', background:C.input, color:C.text, fontWeight:'700', letterSpacing:'2px', fontSize:'0.88rem', fontFamily:'monospace', outline:'none'}
            }),
            React.createElement('button', {
              onClick:()=>entrarNoCasal(codigoEntrada),
              style:{padding:'10px 16px', border:'none', borderRadius:'10px', background:'#f97316', color:'#fff', fontWeight:'800', cursor:'pointer', fontSize:'0.82rem'}
            }, 'Entrar'),
            React.createElement('button', {
              onClick:()=>setMostrarEntrar(false),
              style:{padding:'10px', border:'1px solid '+C.border, borderRadius:'10px', background:'transparent', color:C.textMuted, cursor:'pointer', fontSize:'0.88rem'}
            }, '×')
          )
        )
      ]),

      card([
        sectionTitle('💾', 'Dados'),
        React.createElement('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
          React.createElement('div', null,
            React.createElement('div', {style:{fontWeight:'700', color:C.text, fontSize:'0.88rem'}}, 'Exportar Backup'),
            React.createElement('div', {style:{fontSize:'0.72rem', color:C.textMuted, marginTop:'2px'}}, 'Baixar todos os dados em JSON')
          ),
          React.createElement('button', {
            onClick: fazerBackup,
            style:{padding:'9px 16px', border:'none', borderRadius:'10px', background:'#059669', color:'#fff', fontWeight:'700', cursor:'pointer', fontSize:'0.78rem'}
          }, '📥 Exportar')
        )
      ]),

      card([
        sectionTitle('🔔', 'Notificações'),

        // Status atual — reativo via notifStatus
        React.createElement('div', {
          style:{
            display:'flex', alignItems:'center', gap:'12px', padding:'14px',
            borderRadius:'12px', marginBottom:'16px',
            background: notifStatus === 'granted' ? '#f0fdf4' : notifStatus === 'denied' ? '#fef2f2' : C.bgMuted,
            border: '1px solid ' + (notifStatus === 'granted' ? '#86efac' : notifStatus === 'denied' ? '#fca5a5' : C.border)
          }
        },
          React.createElement('div', {style:{fontSize:'1.6rem', flexShrink:0}},
            notifStatus === 'granted' ? '✅' : notifStatus === 'denied' ? '🚫' : notifStatus === 'unsupported' ? '❌' : '🔕'
          ),
          React.createElement('div', null,
            React.createElement('div', {style:{fontSize:'0.82rem', fontWeight:'800', color: notifStatus === 'granted' ? '#166534' : notifStatus === 'denied' ? '#dc2626' : C.text}},
              notifStatus === 'granted'     ? 'Notificações ativas' :
              notifStatus === 'denied'      ? 'Bloqueadas pelo browser' :
              notifStatus === 'unsupported' ? 'Não suportado' : 'Notificações desativadas'
            ),
            React.createElement('div', {style:{fontSize:'0.72rem', color: notifStatus === 'granted' ? '#16a34a' : notifStatus === 'denied' ? '#ef4444' : C.textFaint, marginTop:'2px'}},
              notifStatus === 'granted'     ? 'Você será avisado das contas que vencem hoje' :
              notifStatus === 'denied'      ? 'Veja as instruções abaixo para desbloquear' :
              notifStatus === 'unsupported' ? 'Use um browser compatível (Chrome, Edge, Firefox)' :
              'Clique no botão abaixo para ativar'
            )
          )
        ),

        // Instruções de desbloqueio — só aparece se bloqueado
        notifStatus === 'denied' && React.createElement('div', {
          style:{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'10px', padding:'12px 14px', marginBottom:'14px', fontSize:'0.73rem', color:'#92400e', lineHeight:'1.7'}
        },
          React.createElement('div', {style:{fontWeight:'800', marginBottom:'6px'}}, '🔓 Como desbloquear no Chrome:'),
          React.createElement('ol', {style:{paddingLeft:'16px', margin:0}},
            React.createElement('li', null, 'Clique no ícone 🔒 na barra de endereço'),
            React.createElement('li', null, 'Selecione ', React.createElement('strong', null, '"Configurações do site"')),
            React.createElement('li', null, 'Em Notificações, mude de ', React.createElement('strong', null, '"Bloqueado"'), ' para ', React.createElement('strong', null, '"Permitir"')),
            React.createElement('li', null, 'Recarregue a página e clique no botão abaixo')
          )
        ),

        // Botão — muda conforme estado
        notifStatus === 'granted'
          ? React.createElement('button', {
              onClick: function() {
                var titulo = '🔔 Estratégia Finanças — Teste';
                var corpo  = 'Notificações funcionando! Você será avisado das contas do dia.';
                function enviarDireto() {
                  try {
                    new Notification(titulo, { body: corpo, icon: '/icons/icon-192.png' });
                    showToast('📲 Notificação de teste enviada!', 'success', 3500);
                  } catch(e) {
                    showToast('Erro: ' + (e.message || 'verifique as permissões'), 'error', 5000);
                  }
                }
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.ready.then(function(reg) {
                    return reg.showNotification(titulo, {
                      body: corpo, icon: '/icons/icon-192.png',
                      badge: '/icons/icon-192.png', tag: 'notif-teste'
                    });
                  }).then(function() {
                    showToast('📲 Notificação de teste enviada!', 'success', 3500);
                  }).catch(enviarDireto);
                } else {
                  enviarDireto();
                }
              },
              style:{width:'100%', padding:'11px', border:'none', borderRadius:'10px', background:'#059669', color:'#fff', fontWeight:'700', cursor:'pointer', fontSize:'0.82rem'}
            }, '📲 Enviar Notificação de Teste')
          : notifStatus === 'unsupported'
          ? React.createElement('div', {style:{padding:'11px', borderRadius:'10px', background:C.bgMuted, fontSize:'0.78rem', color:C.textFaint, textAlign:'center'}},
              'Seu browser não suporta notificações'
            )
          : React.createElement('button', {
              onClick: function() {
                if (notifStatus === 'denied') {
                  showToast('Permissão bloqueada. Siga as instruções acima para desbloquear no browser.', 'warning', 6000);
                  return;
                }
                Notification.requestPermission().then(function(p) {
                  setNotifStatus(p);
                  if (p === 'granted') {
                    showToast('🔔 Notificações ativadas! Você será avisado das contas do dia.', 'success', 4500);
                  } else if (p === 'denied') {
                    showToast('Bloqueado pelo browser. Siga as instruções acima para desbloquear.', 'warning', 6000);
                  } else {
                    showToast('Permissão não concedida. Tente novamente.', 'warning', 4000);
                  }
                });
              },
              style:{width:'100%', padding:'11px', border:'none', borderRadius:'10px', background: notifStatus === 'denied' ? '#9ca3af' : '#f97316', color:'#fff', fontWeight:'700', cursor: notifStatus === 'denied' ? 'not-allowed' : 'pointer', fontSize:'0.82rem'}
            }, notifStatus === 'denied' ? '🚫 Bloqueado — siga as instruções acima' : '🔔 Ativar Notificações do Dispositivo')
      ])
    );
  };

  const TelaFarol = () => {
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [modalPagamento, setModalPagamento] = useState(null);
    const [valorParcial, setValorParcial] = useState('');

    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const diasSem = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

    const itensTodos = [
      ...cartoes.map(c => {
        const valoresAno = c.valores?.[anoAtual] || {};
        const parcelas = calcularParcelasCartao(c.nome, mesAtual);
        const valorBase = valoresAno[mesAtual] || 0;
        const valorParc = parcelas.reduce((s,p) => s + p.valorParcela, 0);
        return { tipo:'CARTÃO', nome:c.nome, vencimento:c.vencimento, valor:valorBase+valorParc };
      }),
      ...gastosFixos.filter(g => !g.mes || g.mes===mesAtual).filter(g => !g.ano || g.ano===anoAtual).map(g => ({
        tipo:'FIXO', nome:g.descricao, vencimento:g.vencimento, valor:g.valor,
        badge: g.temporario && g.totalParcelas ? `${g.parcelaAtual}/${g.totalParcelas}` : null
      })),
      ...gastosVariaveis.filter(g => g.mostrarNoFarol && g.mes===mesAtual && g.ano===anoAtual).map(g => ({
        tipo:'VARIÁVEL', nome:g.descricao||g.categoria, vencimento:g.vencimento||1, valor:g.valor
      })),
      ...gastosExtras.filter(g => g.mostrarNoFarol && g.mes===mesAtual && g.ano===anoAtual).map(g => ({
        tipo:'EXTRA', nome:g.descricao||g.categoria, vencimento:g.vencimento||1, valor:g.valor
      }))
    ].filter(i => i.valor > 0).sort((a,b) => a.vencimento - b.vencimento);

    const pagamentos = calcularPagamentos(mesAtual);
    
    // CORREÇÃO: Só marcar como "hoje" se o mês visualizado for o mês atual do sistema
    const dataAtual = new Date();
    const mesAtualSistema = mesesOrdem[dataAtual.getMonth()];
    const anoAtualSistema = dataAtual.getFullYear();
    const estamosNoMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
    const hoje = estamosNoMesAtual ? dataAtual.getDate() : -1; // -1 = nenhum dia é "hoje" se não for o mês atual

    const vencHoje = itensTodos.filter(i => i.vencimento === hoje && getStatusFarol(i.nome,mesAtual) !== 'PAGO');
    const vencSemana = itensTodos.filter(i => i.vencimento > hoje && i.vencimento <= hoje+7 && getStatusFarol(i.nome,mesAtual) !== 'PAGO');
    const totalHoje = vencHoje.reduce((s,i) => s + i.valor, 0);
    const totalSemana = vencSemana.reduce((s,i) => s + i.valor, 0);

    const itensFiltrados = filtroStatus === 'todos' ? itensTodos :
      filtroStatus === 'pagos' ? itensTodos.filter(i => getStatusFarol(i.nome,mesAtual) === 'PAGO') :
      itensTodos.filter(i => getStatusFarol(i.nome,mesAtual) !== 'PAGO');

    const porDia = itensFiltrados.reduce((acc,i) => { (acc[i.vencimento]=acc[i.vencimento]||[]).push(i); return acc; }, {});
    const diasOrdenados = Object.keys(porDia).sort((a,b) => parseInt(a)-parseInt(b));


    return /*#__PURE__*/React.createElement(React.Fragment, null,

      /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '240px 1fr 220px', gap:'16px', alignItems:'start'}},

        /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px', minWidth:0}},
          /*#__PURE__*/React.createElement("div", {style:{background:'#f97316', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(249,115,22,0.35)', border:'1px solid rgba(255,255,255,0.1)'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'8px'}}, "\uD83D\uDCB3 CONTAS A PAGAR \xB7 " + mesAtual.toUpperCase()),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.8rem', fontWeight:'900', lineHeight:1, marginBottom:'4px'}}, "R$ " + pagamentos.total.toLocaleString('pt-BR',{minimumFractionDigits:2})),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.72rem', opacity:0.65, marginBottom:'14px'}}, "total a pagar no m\xEAs"),
            /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:'12px'}},
              /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', opacity:0.5, marginBottom:'2px'}}, "Pago"),
                /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', color:'#86efac'}}, pagamentos.percentual.toFixed(0)+"%")
              ),
              /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', opacity:0.5, marginBottom:'2px'}}, "Pendente"),
                /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', color:'#fca5a5'}}, "R$ " + pagamentos.pendente.toFixed(0))
              )
            )
          ),
          /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'14px', border:'1px solid '+C.border, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'10px'}}, "Progresso"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#f97316', marginBottom:'8px'}}, pagamentos.percentual.toFixed(1)+"%"),
            /*#__PURE__*/React.createElement("div", {style:{height:'10px', background:'#f1f5f9', borderRadius:'5px', overflow:'hidden'}},
              /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:Math.min(100,pagamentos.percentual)+'%', background:'#f97316', borderRadius:'5px', transition:'width .6s ease'}})
            ),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'#64748b', marginTop:'6px'}},
              /*#__PURE__*/React.createElement("span", null, pagamentos.qtdPago + "/" + pagamentos.qtdTotal),
              /*#__PURE__*/React.createElement("span", null, "R$ " + pagamentos.pago.toFixed(0))
            )
          ),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'6px'}},
            ...['todos','pagos','pendentes'].map(f => {
              const ativo = filtroStatus === f;
              const qtd = f==='todos' ? itensTodos.length : f==='pagos' ? pagamentos.qtdPago : pagamentos.qtdTotal-pagamentos.qtdPago;
              const cor = f==='todos' ? '#f97316' : f==='pagos' ? '#059669' : '#ea580c';
              return /*#__PURE__*/React.createElement("button", {key:f, onClick:()=>setFiltroStatus(f),
                style:{width:'100%', padding:'9px 12px', border:'none', borderRadius:'10px', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center',
                  background: ativo ? cor : '#fff',
                  color: ativo ? '#fff' : '#374151',
                  fontWeight: ativo ? '700' : '500',
                  fontSize:'0.78rem',
                  border: ativo ? 'none' : '1px solid #e5e7eb'
                }
              },
                /*#__PURE__*/React.createElement("span", null, f.charAt(0).toUpperCase()+f.slice(1)),
                /*#__PURE__*/React.createElement("span", {style:{fontWeight:'800'}}, qtd)
              );
            })
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'16px', border:'1px solid '+C.border, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
          /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid '+C.borderLight, display:'flex', justifyContent:'space-between', alignItems:'center'}},
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:C.text}}, "Contas a Pagar \u2014 " + mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:C.textFaint, marginTop:'2px'}}, 
                estamosNoMesAtual ? "Hoje: " + hoje + " de " + mesAtual : "Visualizando: " + mesAtual + "/" + anoAtual
              )
            ),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', color:'#64748b'}}, "Pago"),
              /*#__PURE__*/React.createElement("div", {style:{width:'28px', height:'4px', background:'#10b981', borderRadius:'2px'}}),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', color:'#64748b', marginLeft:'6px'}}, "Pendente"),
              /*#__PURE__*/React.createElement("div", {style:{width:'28px', height:'4px', background:'#e5e7eb', borderRadius:'2px'}})
            )
          ),
          itensFiltrados.length === 0 && /*#__PURE__*/React.createElement("div", {style:{padding:'60px 20px', textAlign:'center'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'2.5rem', marginBottom:'10px'}}, "\uD83D\uDEA6"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:C.textFaint}}, filtroStatus==='pagos' ? 'Nenhum pagamento confirmado' : filtroStatus==='pendentes' ? 'Tudo pago!' : 'Nenhum item no farol')
          ),
          itensFiltrados.length > 0 && /*#__PURE__*/React.createElement("div", {style:{maxHeight:'560px', overflowY:'auto'}},
            ...diasOrdenados.map(dia => {
              const itensDia = porDia[dia];
              const totalDia = itensDia.reduce((s,i)=>s+i.valor,0);
              const isHoje = estamosNoMesAtual && parseInt(dia) === hoje;
              const mesNum = mesesOrdem.indexOf(mesAtual);
              const dSem = diasSem[new Date(anoAtual, mesNum>=0?mesNum:new Date().getMonth(), parseInt(dia)).getDay()];

              return /*#__PURE__*/React.createElement("div", {key:dia},
                /*#__PURE__*/React.createElement("div", {style:{padding:'10px 20px', background: isHoje?'#fff7ed':'#fafafa', borderBottom:'1px solid '+C.borderLight, display:'flex', alignItems:'center', gap:'14px'}},
                  /*#__PURE__*/React.createElement("div", {style:{width:'50px', textAlign:'center'}},
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.62rem', color: isHoje?'#f97316':'#9ca3af', fontWeight:'600'}}, dSem),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize: isHoje?'1.2rem':'1rem', fontWeight:'900', color: isHoje?'#f97316':'#374151'}}, "Dia " + dia),
                    isHoje && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.55rem', fontWeight:'800', color:'#f97316'}}, "HOJE")
                  ),
                  /*#__PURE__*/React.createElement("div", {style:{flex:1, height:'2px', background:'#e5e7eb'}}),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'800', color:'#f97316'}}, "R$ " + totalDia.toFixed(0))
                ),
                ...itensDia.map((item,idx) => {
                  const status = getStatusFarol(item.nome, mesAtual);
                  const isPago = status === 'PAGO';
                  const isParcial = typeof status === 'number' && status > 0;
                  // CORREÇÃO: Só marcar atrasado se estamos no mês atual E o dia já passou
                  const isAtrasado = estamosNoMesAtual && parseInt(dia) < hoje && !isPago;

                  return /*#__PURE__*/React.createElement("div", {
                    key:idx,
                    onClick:()=>setModalPagamento(item),
                    style:{display:'flex', alignItems:'center', gap:'12px', padding:'11px 20px 11px 84px', borderBottom:'1px solid #f9fafb', transition:'background .15s', cursor:'pointer'},
                    onMouseEnter:e=>{e.currentTarget.style.background='#fafafa'},
                    onMouseLeave:e=>{e.currentTarget.style.background='transparent'}
                  },
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', flexShrink:0}}, isPago?'✅':isAtrasado?'⚠️':isParcial?'💵':'⚪'),
                    /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.82rem', fontWeight:'700', color: isPago?'#059669':'#111827', textDecoration: isPago?'line-through':'none', marginBottom:'2px'}}, item.nome),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'6px'}},
                        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.65rem', background: item.tipo==='CARTÃO'?'#dbeafe':item.tipo==='FIXO'?'#fff7ed':item.tipo==='VARIÁVEL'?'#fff7ed':'#fffbeb', color: item.tipo==='CARTÃO'?'#1e40af':item.tipo==='FIXO'?'#f97316':item.tipo==='VARIÁVEL'?'#ea580c':'#d97706', padding:'1px 7px', borderRadius:'20px', fontWeight:'600'}}, item.tipo),
                        item.badge && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.65rem', color:C.textFaint}}, item.badge)
                      )
                    ),
                    /*#__PURE__*/React.createElement("div", {style:{textAlign:'right', flexShrink:0}},
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'900', color: isPago?'#059669':'#374151'}}, "R$ " + item.valor.toFixed(2)),
                      isParcial && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#3b82f6'}}, "Pago: R$ " + status.toFixed(0))
                    )
                  );
                })
              );
            })
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},
          vencHoje.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff1f2', borderRadius:'14px', padding:'14px', border:'1px solid #fecdd3'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#be123c', marginBottom:'10px'}}, "\uD83D\uDD34 Vence HOJE"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#9f1239', marginBottom:'8px'}}, "R$ " + totalHoje.toFixed(2)),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#be123c'}}, vencHoje.length + " pagamento" + (vencHoje.length>1?"s":""))
          ),
          vencSemana.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fffbeb', borderRadius:'14px', padding:'14px', border:'1px solid #fde68a'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#92400e', marginBottom:'10px'}}, "\uD83D\uDFE1 Pr\xF3ximos 7 Dias"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#78350f', marginBottom:'8px'}}, "R$ " + totalSemana.toFixed(2)),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'5px', marginTop:'10px'}},
              ...vencSemana.slice(0,4).map((i,idx) =>
                /*#__PURE__*/React.createElement("div", {key:idx, style:{display:'flex', justifyContent:'space-between', fontSize:'0.7rem'}},
                  /*#__PURE__*/React.createElement("span", {style:{color:'#78350f', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px'}}, i.nome),
                  /*#__PURE__*/React.createElement("span", {style:{fontWeight:'700', color:'#b45309', flexShrink:0}}, "Dia " + i.vencimento)
                )
              ),
              vencSemana.length > 4 && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#92400e', fontStyle:'italic'}}, "+ " + (vencSemana.length-4) + " mais")
            )
          ),
          /*#__PURE__*/React.createElement("div", {style:{background:C.bg, borderRadius:'14px', padding:'14px', border:'1px solid '+C.border, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:C.textFaint, marginBottom:'12px'}}, "Resumo do M\xEAs"),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'8px'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', paddingBottom:'8px', borderBottom:'1px solid '+C.borderLight}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', color:'#64748b'}}, "Total a pagar"),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.82rem', fontWeight:'800', color:C.text}}, "R$ " + pagamentos.total.toFixed(0))
              ),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', paddingBottom:'8px', borderBottom:'1px solid '+C.borderLight}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', color:'#64748b'}}, "J\xE1 pago"),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.82rem', fontWeight:'800', color:'#059669'}}, "R$ " + pagamentos.pago.toFixed(0))
              ),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', color:'#64748b'}}, "Pendente"),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.82rem', fontWeight:'800', color:'#ea580c'}}, "R$ " + pagamentos.pendente.toFixed(0))
              )
            )
          )
        )
      ),

      modalPagamento && /*#__PURE__*/React.createElement("div", {
        style:{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999},
        onClick:()=>setModalPagamento(null)
      },
        /*#__PURE__*/React.createElement("div", {
          onClick:e=>e.stopPropagation(),
          style:{background:C.bg, borderRadius:'16px', padding:'24px', maxWidth:'400px', width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}
        },
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'800', color:C.text, marginBottom:'16px'}}, "\uD83D\uDCB0 Registrar Pagamento"),
          /*#__PURE__*/React.createElement("div", {style:{background:C.bgMuted, borderRadius:'12px', padding:'16px', marginBottom:'16px'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:C.text, marginBottom:'4px'}}, modalPagamento.nome),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.6rem', fontWeight:'900', color:'#f97316'}}, "R$ " + modalPagamento.valor.toFixed(2)),
            (() => {
              const st = getStatusFarol(modalPagamento.nome, mesAtual);
              if (typeof st === 'number' && st > 0) {
                return /*#__PURE__*/React.createElement("div", {style:{marginTop:'10px', paddingTop:'10px', borderTop:'1px solid '+C.border}},
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#059669', fontWeight:'600'}}, "\u2705 Pago: R$ " + st.toFixed(2)),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#ea580c', fontWeight:'600'}}, "\u23F3 Falta: R$ " + (modalPagamento.valor-st).toFixed(2))
                );
              }
              return null;
            })()
          ),
          /*#__PURE__*/React.createElement("button", {
            onClick:()=>{ marcarPago(modalPagamento.nome, mesAtual); setModalPagamento(null); },
            style:{width:'100%', padding:'12px', border:'none', borderRadius:'10px', background:'#059669', color:'#fff', fontSize:'0.85rem', fontWeight:'700', cursor:'pointer', marginBottom:'12px'}
          }, "\u2705 Marcar como PAGO"),
          /*#__PURE__*/React.createElement("div", {style:{borderTop:'1px solid '+C.border, paddingTop:'12px'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', fontWeight:'600', color:C.text, marginBottom:'8px'}}, "Pagar valor parcial:"),
            /*#__PURE__*/React.createElement("input", {
              type:"number", step:"0.01", value:valorParcial, onChange:e=>setValorParcial(e.target.value), placeholder:"Valor",
              style:{width:'100%', padding:'10px', border:'2px solid '+C.border, borderRadius:'8px', fontSize:'0.85rem', marginBottom:'8px', outline:'none'}
            }),
            /*#__PURE__*/React.createElement("button", {
              onClick:()=>{ if(valorParcial){ marcarPagoParcial(modalPagamento.nome, mesAtual, parseFloat(valorParcial)); setModalPagamento(null); setValorParcial(''); } },
              style:{width:'100%', padding:'10px', border:'none', borderRadius:'8px', background:'#3b82f6', color:'#fff', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer'}
            }, "\uD83D\uDCB5 Confirmar Pagamento Parcial")
          )
        )
      )
    );
  };


  // ── Busca Global ─────────────────────────────────────────────────────────
  const _bg = buscaGlobal.trim().toLowerCase();
  const resultadosBusca = _bg.length < 2 ? [] : [
    ...gastosFixos
      .filter(g => g.descricao?.toLowerCase().includes(_bg) || g.categoria?.toLowerCase().includes(_bg))
      .slice(0,4).map(g=>({...g,_tela:'fixos',_label:'Conta Fixa',_cor:'#f97316'})),
    ...gastosVariaveis
      .filter(g => g.mes===mesAtual && g.ano===anoAtual &&
        (g.descricao?.toLowerCase().includes(_bg) || g.categoria?.toLowerCase().includes(_bg)))
      .slice(0,4).map(g=>({...g,_tela:'variaveis',_label:'Gasto Vari\xE1vel',_cor:'#ea580c'})),
    ...gastosExtras
      .filter(g => g.mes===mesAtual && g.ano===anoAtual &&
        (g.descricao?.toLowerCase().includes(_bg) || g.categoria?.toLowerCase().includes(_bg)))
      .slice(0,4).map(g=>({...g,_tela:'extras',_label:'Gasto Extra',_cor:'#16a34a'})),
    ...receitas
      .filter(g => g.mes===mesAtual && g.ano===anoAtual &&
        (g.descricao?.toLowerCase().includes(_bg) || g.categoria?.toLowerCase().includes(_bg)))
      .slice(0,4).map(g=>({...g,_tela:'receitas',_label:'Receita',_cor:'#0284c7'})),
  ];
  // ────────────────────────────────────────────────────────────────────────

  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen",
    style: {
      background: C.bgPage
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f97316',
      boxShadow: '0 4px 24px rgba(249,115,22,0.4)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: window.innerWidth <= 768 ? '7px 12px' : '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.LOGO_B64,
    alt: "Estrat\xE9gia Finan\xE7as",
    style: {
      maxHeight: window.innerWidth <= 768 ? '26px' : '38px',
      width: 'auto',
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: window.innerWidth <= 768 ? '10px' : '16px',
      display: 'flex',
      alignItems: 'center',
      gap: window.innerWidth <= 768 ? '4px' : '8px'
    }
  }, buscaOpen
    ? /*#__PURE__*/React.createElement('input', {
        autoFocus: true,
        value: buscaGlobal,
        onChange: e => setBuscaGlobal(e.target.value),
        onBlur: () => { setTimeout(() => { if (!buscaGlobal) setBuscaOpen(false); }, 200); },
        onKeyDown: e => { if(e.key==='Escape'){setBuscaGlobal('');setBuscaOpen(false);} },
        placeholder: 'Buscar transa\xE7\xE3o...',
        style:{
          width: window.innerWidth<=768 ? '140px' : '200px',
          padding:'4px 10px', borderRadius:'20px',
          border:'1px solid rgba(255,255,255,0.3)',
          background:'rgba(255,255,255,0.12)', color:'#fff',
          fontSize:'0.8rem', outline:'none',
          '::placeholder': {color:'rgba(255,255,255,0.5)'}
        }
      })
    : /*#__PURE__*/React.createElement('button', {
        onClick: () => setBuscaOpen(true),
        title: 'Buscar',
        style:{
          width: window.innerWidth<=768 ? '28px' : '32px',
          height: window.innerWidth<=768 ? '28px' : '32px',
          minHeight:'unset', borderRadius:'50%',
          border:'1px solid rgba(255,255,255,0.25)',
          background:'rgba(255,255,255,0.12)', color:'#fff',
          fontSize:'0.9rem', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', padding:'0',
        }
      }, /*#__PURE__*/React.createElement('svg',{width:'15',height:'15',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'2.5',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'11',cy:'11',r:'8'}),React.createElement('line',{x1:'21',y1:'21',x2:'16.65',y2:'16.65'}))),
    /*#__PURE__*/React.createElement('button', {
    onClick: () => setDarkMode(!darkMode),
    title: darkMode ? 'Modo claro' : 'Modo escuro',
    style: {
      width: window.innerWidth <= 768 ? '28px' : '32px',
      height: window.innerWidth <= 768 ? '28px' : '32px',
      minHeight: 'unset',
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      transition: 'background 0.2s'
    }
  }, darkMode
    ? /*#__PURE__*/React.createElement('svg',{width:'15',height:'15',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'2',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'5'}),React.createElement('line',{x1:'12',y1:'1',x2:'12',y2:'3'}),React.createElement('line',{x1:'12',y1:'21',x2:'12',y2:'23'}),React.createElement('line',{x1:'4.22',y1:'4.22',x2:'5.64',y2:'5.64'}),React.createElement('line',{x1:'18.36',y1:'18.36',x2:'19.78',y2:'19.78'}),React.createElement('line',{x1:'1',y1:'12',x2:'3',y2:'12'}),React.createElement('line',{x1:'21',y1:'12',x2:'23',y2:'12'}),React.createElement('line',{x1:'4.22',y1:'19.78',x2:'5.64',y2:'18.36'}),React.createElement('line',{x1:'18.36',y1:'5.64',x2:'19.78',y2:'4.22'}))
    : /*#__PURE__*/React.createElement('svg',{width:'15',height:'15',viewBox:'0 0 24 24',fill:'currentColor'},React.createElement('path',{d:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'}))
  ), /*#__PURE__*/React.createElement(UserMenu, {
    user: user,
    onLogout: async () => {
      ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'orcamentos', 'metasMensais', 'metasFinanceiras', 'planejados', 'dividas', 'categorias', 'farol', '_currentUserId'].forEach(k => localStorage.removeItem(k));
      await firebase.auth().signOut();
    }
  })))
  , resultadosBusca.length > 0 && /*#__PURE__*/React.createElement('div', {
    style:{
      position:'absolute', top:'100%', left:0, right:0, zIndex:200,
      background: darkMode?'#1e293b':'#fff',
      borderTop:'1px solid rgba(0,0,0,0.08)',
      boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
      maxHeight:'320px', overflowY:'auto',
    }
  },
    /*#__PURE__*/React.createElement('div',{style:{padding:'6px 16px 4px',fontSize:'0.7rem',color:C.textFaint,fontWeight:'700',borderBottom:'1px solid '+(darkMode?'#334155':'#f3f4f6')}},
      resultadosBusca.length + ' resultado' + (resultadosBusca.length!==1?'s':'')),
    ...resultadosBusca.map((r,i) =>
      /*#__PURE__*/React.createElement('div',{
        key:i,
        onClick:()=>{ setTelaAtiva(r._tela); setBuscaGlobal(''); setBuscaOpen(false); },
        style:{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'9px 16px', cursor:'pointer',
          borderBottom:'1px solid '+(darkMode?'#334155':'#f9fafb'),
          background:'transparent',
          transition:'background 0.15s',
        },
        onMouseEnter:e=>{e.currentTarget.style.background=darkMode?'#334155':'#f8fafc'},
        onMouseLeave:e=>{e.currentTarget.style.background='transparent'},
      },
        /*#__PURE__*/React.createElement('span',{style:{
          padding:'2px 8px', borderRadius:'10px', fontSize:'0.65rem', fontWeight:'800',
          background:r._cor+'22', color:r._cor, whiteSpace:'nowrap', flexShrink:0,
        }}, r._label),
        /*#__PURE__*/React.createElement('span',{style:{flex:1,fontSize:'0.82rem',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},
          r.descricao || r.categoria || '\u2014'),
        /*#__PURE__*/React.createElement('span',{style:{fontSize:'0.82rem',fontWeight:'700',color:C.text,whiteSpace:'nowrap'}},
          'R$ '+(r.valor||0).toFixed(2))
      )
    )
  )), /*#__PURE__*/React.createElement(Sidebar, {
    telaAtiva: telaAtiva,
    setTelaAtiva: setTelaAtiva,
    mesAtual: mesAtual,
    setMesAtual: setMesAtual,
    anoAtual: anoAtual,
    setAnoAtual: setAnoAtual,
    isUserAdmin: isUserAdmin,
    userEmail: user ? user.email : '',
    onExpandChange: (expandido) => setSidebarExpandida(expandido)
  }), /*#__PURE__*/React.createElement("div", {
    className: "main-content-area",
    style: {
      marginLeft: sidebarExpandida ? '260px' : '72px',
      transition: 'margin-left 0.3s ease',
      display: !isUserAdmin && planoInfo.plano === 'trial' && planoInfo.expirado ? 'none' : 'block'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {},
    id: "meses-container",
    className: "sticky-desktop top-[57px] md:top-[57px] z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-2 md:px-4",
    style: { padding: '0', display: 'flex', alignItems: 'center' }
  },
  /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex', alignItems: 'center', gap: '2px',
      flexShrink: 0, padding: '0 8px 0 2px',
      borderRight: '1px solid rgba(0,0,0,0.1)', marginRight: '4px'
    }
  },
    /*#__PURE__*/React.createElement("button", {
      onClick: () => setAnoAtual(anoAtual - 1),
      title: 'Ano anterior',
      style: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 5px', borderRadius: '4px', lineHeight: 1 }
    }, '◀'),
    /*#__PURE__*/React.createElement("span", {
      style: { fontSize: '0.82rem', fontWeight: '700', color: '#374151', minWidth: '36px', textAlign: 'center', userSelect: 'none' }
    }, anoAtual),
    /*#__PURE__*/React.createElement("button", {
      onClick: () => setAnoAtual(anoAtual + 1),
      title: 'Próximo ano',
      style: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 5px', borderRadius: '4px', lineHeight: 1 }
    }, '▶')
  ),
  /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1
    }
  }, MESES.map(mes => /*#__PURE__*/React.createElement("button", {
    key: mes,
    onClick: () => setMesAtual(mes),
    className: `mes-btn${mesAtual === mes ? ' ativo' : ''}`
  }, mes.charAt(0).toUpperCase() + mes.slice(1)))))), /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 main-content animate-in"
  }, React.useMemo(() => {
    if (telaAtiva !== 'dashboard') return null;
    return /*#__PURE__*/React.createElement(Dashboard, {
      key: `${mesAtual}-${anoAtual}`
    });
  }, [telaAtiva === 'dashboard', mesAtual, anoAtual]), telaAtiva === 'admin' && /*#__PURE__*/React.createElement(TelaAdmin, {
    isUserAdmin: isUserAdmin
  }), telaAtiva.startsWith('planejamento') && /*#__PURE__*/React.createElement(TelaPlanejamento, null), telaAtiva === 'receitas' && /*#__PURE__*/React.createElement(TelaReceitas, null), telaAtiva === 'cartoes' && /*#__PURE__*/React.createElement(TelaCartoes, null), telaAtiva === 'fixos' && /*#__PURE__*/React.createElement(TelaGastosFixos, null), telaAtiva === 'variaveis' && /*#__PURE__*/React.createElement(TelaGastosVariaveis, null), telaAtiva === 'extras' && /*#__PURE__*/React.createElement(TelaGastosExtras, null), telaAtiva === 'configuracoes' && /*#__PURE__*/React.createElement(TelaConfiguracoes, null), telaAtiva === 'farol' && /*#__PURE__*/React.createElement(TelaFarol, null), telaAtiva === 'relatorios' && /*#__PURE__*/React.createElement(TelaRelatorios, null)), modalAberto === 'editar' && itemEditando && /*#__PURE__*/React.createElement(Modal, {
    titulo: `✏️ Editar ${tipoEditando === 'receita' ? 'Receita' : tipoEditando === 'cartao' ? 'Cartão de Crédito' : tipoEditando === 'fixo' ? 'Conta Fixa' : 'Gasto Variável'}`,
    onClose: () => {
      setModalAberto(null);
      setItemEditando(null);
      setTipoEditando(null);
    }
  }, /*#__PURE__*/React.createElement(FormEdicao, {
    item: itemEditando,
    tipo: tipoEditando,
    onSalvar: dadosAtualizados => {
      if (tipoEditando === 'receita') {
        editarReceita(itemEditando.id, dadosAtualizados);
      } else if (tipoEditando === 'cartao') {
        editarCartao(itemEditando.id, dadosAtualizados);
      } else if (tipoEditando === 'fixo') {
        editarGastoFixo(itemEditando.id, dadosAtualizados);
      } else if (tipoEditando === 'variavel') {
        editarGastoVariavel(itemEditando.id, dadosAtualizados);
      } else if (tipoEditando === 'extra') {
        editarGastoExtra(itemEditando.id, dadosAtualizados);
      }
    }
  })), modalAberto === 'novaDivida' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83D\uDCB3 Nova D\xEDvida",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Nome da D\xEDvida"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "dividaNome",
    placeholder: "Ex: Cart\xE3o Nubank",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Valor Total"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "dividaValorTotal",
    step: "0.01",
    placeholder: "5000.00",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Saldo Devedor Atual"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "dividaSaldoDevedor",
    step: "0.01",
    placeholder: "3500.00",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Taxa de Juros (% ao m\xEAs)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "dividaTaxaJuros",
    step: "0.01",
    placeholder: "12.5",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Parcela M\xEDnima"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "dividaParcelaMinima",
    step: "0.01",
    placeholder: "350.00",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Dia do Vencimento"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "dividaVencimento",
    min: "1",
    max: "31",
    placeholder: "10",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      try {
        const nome = document.getElementById('dividaNome').value;
        const valorTotal = document.getElementById('dividaValorTotal').value;
        const saldoDevedor = document.getElementById('dividaSaldoDevedor').value;
        const taxaJuros = document.getElementById('dividaTaxaJuros').value;
        const parcelaMinima = document.getElementById('dividaParcelaMinima').value;
        const vencimento = document.getElementById('dividaVencimento').value;
        if (!nome || !valorTotal || !saldoDevedor || !taxaJuros || !parcelaMinima || !vencimento) {
          alert('⚠️ Preencha todos os campos!');
          return;
        }
        adicionarDivida({
          nome,
          valorTotal,
          saldoDevedor,
          taxaJuros,
          parcelaMinima,
          vencimento
        });
        setModalAberto(null);
        alert('✅ Dívida cadastrada com sucesso!');
      } catch (error) {
        alert('❌ Erro: ' + error.message);
      }
    },
    className: "w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
  }, "\u2705 Cadastrar D\xEDvida"))), modalAberto === 'gerenciarCategorias' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83C\uDFF7\uFE0F Gerenciar Categorias",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800 mb-3"
  }, "\uD83C\uDFE0 Gastos Fixos"), /*#__PURE__*/React.createElement("div", {
    className: "bg-orange-50 rounded-lg p-4 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Categorias Padr\xE3o:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['MORADIA', 'ESTUDO', 'TRANSPORTE', 'SERVIÇOS', 'SAÚDE'].map(cat => /*#__PURE__*/React.createElement("span", {
    key: cat,
    className: "px-3 py-1 bg-white border-2 border-orange-300 rounded-lg text-sm font-semibold text-gray-700"
  }, cat)))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-orange-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), categoriasPersonalizadas.gastosFixos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosFixos.map(cat => /*#__PURE__*/React.createElement("div", {
    key: cat,
    className: "flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-lg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-orange-700"
  }, cat), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (confirm(`Excluir categoria "${cat}"?`)) {
        setCategoriasPersonalizadas({
          ...categoriasPersonalizadas,
          gastosFixos: categoriasPersonalizadas.gastosFixos.filter(c => c !== cat)
        });
      }
    },
    className: "text-red-600 hover:text-red-700 text-xs"
  }, "\u2715")))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800 mb-3"
  }, "\uD83D\uDCCA Gastos Vari\xE1veis"), /*#__PURE__*/React.createElement("div", {
    className: "bg-orange-50 rounded-lg p-4 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Categorias Padr\xE3o:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['MERCADO', 'FARMÁCIA', 'ALIMENTAÇÃO', 'TRANSPORTE', 'GASOLINA', 'LAZER'].map(cat => /*#__PURE__*/React.createElement("span", {
    key: cat,
    className: "px-3 py-1 bg-white border-2 border-orange-300 rounded-lg text-sm font-semibold text-gray-700"
  }, cat)))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-orange-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), categoriasPersonalizadas.gastosVariaveis.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosVariaveis.map(cat => /*#__PURE__*/React.createElement("div", {
    key: cat,
    className: "flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-lg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-orange-700"
  }, cat), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (confirm(`Excluir categoria "${cat}"?`)) {
        setCategoriasPersonalizadas({
          ...categoriasPersonalizadas,
          gastosVariaveis: categoriasPersonalizadas.gastosVariaveis.filter(c => c !== cat)
        });
      }
    },
    className: "text-red-600 hover:text-red-700 text-xs"
  }, "\u2715")))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800 mb-3"
  }, "\u26A1 Gastos Extras"), /*#__PURE__*/React.createElement("div", {
    className: "bg-amber-50 rounded-lg p-4 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Categorias Padr\xE3o:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['VIAGEM', 'PRESENTE', 'EMERGÊNCIA', 'MÉDICO', 'VETERINÁRIO', 'MANUTENÇÃO', 'REFORMA', 'FESTA'].map(cat => /*#__PURE__*/React.createElement("span", {
    key: cat,
    className: "px-3 py-1 bg-white border-2 border-amber-300 rounded-lg text-sm font-semibold text-gray-700"
  }, cat)))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-amber-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), !categoriasPersonalizadas.gastosExtras || categoriasPersonalizadas.gastosExtras.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosExtras.map(cat => /*#__PURE__*/React.createElement("div", {
    key: cat,
    className: "flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-lg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-amber-700"
  }, cat), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (confirm(`Excluir categoria "${cat}"?`)) {
        setCategoriasPersonalizadas({
          ...categoriasPersonalizadas,
          gastosExtras: categoriasPersonalizadas.gastosExtras.filter(c => c !== cat)
        });
      }
    },
    className: "text-red-600 hover:text-red-700 text-xs"
  }, "\u2715")))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-blue-800"
  }, "\uD83D\uDCA1 ", /*#__PURE__*/React.createElement("strong", null, "Dica:"), " Para criar novas categorias, clique em \"\u2795 Novo Gasto\" e escolha \"Criar nova categoria\"")))), modalAberto === 'novaMeta' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83C\uDFAF Nova Meta Financeira",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "T\xEDtulo da Meta"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "metaTitulo",
    placeholder: "Ex: Reserva de Emerg\xEAncia",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Valor da Meta (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "metaValor",
    step: "0.01",
    placeholder: "50000.00",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Prazo"), /*#__PURE__*/React.createElement("select", {
    id: "metaPrazo",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true,
    onChange: e => {
      const prazo = e.target.value;
      const meses = prazo === 'curto' ? 12 : prazo === 'medio' ? 60 : 120;
      const hoje = new Date();
      const dataFutura = new Date(hoje.setMonth(hoje.getMonth() + meses));
      const inputData = document.getElementById('metaData');
      if (inputData) {
        inputData.value = dataFutura.toISOString().split('T')[0];
      }
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "curto"
  }, "\u26A1 Curto (at\xE9 1 ano)"), /*#__PURE__*/React.createElement("option", {
    value: "medio"
  }, "\uD83D\uDCC5 M\xE9dio (1-5 anos)"), /*#__PURE__*/React.createElement("option", {
    value: "longo"
  }, "\uD83C\uDFC6 Longo (5+ anos)")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500 mt-1"
  }, "A data meta ser\xE1 ajustada automaticamente")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Categoria"), /*#__PURE__*/React.createElement("select", {
    id: "metaCategoria",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: "reserva"
  }, "\uD83C\uDD98 Reserva Emerg\xEAncia"), /*#__PURE__*/React.createElement("option", {
    value: "viagem"
  }, "\u2708\uFE0F Viagem"), /*#__PURE__*/React.createElement("option", {
    value: "investimento"
  }, "\uD83D\uDCB0 Investimento"), /*#__PURE__*/React.createElement("option", {
    value: "compra"
  }, "\uD83D\uDED2 Compra"), /*#__PURE__*/React.createElement("option", {
    value: "outros"
  }, "\uD83D\uDCE6 Outros")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Prioridade"), /*#__PURE__*/React.createElement("select", {
    id: "metaPrioridade",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "5"
  }, "\u2B50\u2B50\u2B50\u2B50\u2B50 Muito Alta"), /*#__PURE__*/React.createElement("option", {
    value: "4"
  }, "\u2B50\u2B50\u2B50\u2B50 Alta"), /*#__PURE__*/React.createElement("option", {
    value: "3",
    selected: true
  }, "\u2B50\u2B50\u2B50 M\xE9dia"), /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "\u2B50\u2B50 Baixa"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "\u2B50 Muito Baixa"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Data Meta"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    id: "metaData",
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true,
    defaultValue: (() => {
      const hoje = new Date();
      const prazoInput = document.getElementById('metaPrazo');
      const prazo = prazoInput ? prazoInput.value : 'curto';
      const meses = prazo === 'curto' ? 12 : prazo === 'medio' ? 60 : 120;
      const dataFutura = new Date(hoje.setMonth(hoje.getMonth() + meses));
      return dataFutura.toISOString().split('T')[0];
    })()
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500 mt-1"
  }, "\u26A0\uFE0F Campo obrigat\xF3rio - ajuste conforme necess\xE1rio"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      try {
        const titulo = document.getElementById('metaTitulo').value;
        const valor = document.getElementById('metaValor').value;
        const prazo = document.getElementById('metaPrazo').value;
        const categoria = document.getElementById('metaCategoria').value;
        const prioridade = document.getElementById('metaPrioridade').value;
        const dataMeta = document.getElementById('metaData').value;
        if (!titulo || !valor) {
          alert('⚠️ Preencha o título e valor!');
          return;
        }
        if (!dataMeta) {
          alert('⚠️ Preencha a Data Meta!\n\nClique no campo de data e escolha quando você quer alcançar essa meta.');
          return;
        }
        const novaMeta = {
          id: Date.now(),
          titulo: titulo,
          valor: safeFloat(valor),
          valorAtual: 0,
          prazo: prazo,
          prioridade: parseInt(prioridade),
          dataInicio: new Date().toISOString(),
          dataMeta: dataMeta,
          categoria: categoria,
          concluida: false
        };
        setMetasFinanceiras([...metasFinanceiras, novaMeta]);
        setModalAberto(null);
        alert('✅ Meta criada com sucesso!');
      } catch (error) {
        alert('❌ Erro: ' + error.message);
      }
    },
    className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
  }, "\u2705 Criar Meta"))), modalAberto === 'novoCartao' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Cart\xE3o",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovoCartao, null)), modalAberto === 'novoGastoFixo' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Nova Conta Fixa",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovoGastoFixo, null)), modalAberto === 'novoGastoVariavel' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Gasto Vari\xE1vel",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovoGastoVariavel, null)), modalAberto === 'importarCSV' && /*#__PURE__*/React.createElement(Modal, {
    titulo: '\uD83D\uDCE5 Importar Extrato CSV',
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormImportarCSV, null)), modalAberto === 'novoGastoExtra' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Gasto Extra",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovoGastoExtra, null)), modalAberto === 'metas' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83C\uDFAF Definir Metas",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormMetas, null)), modalAberto === 'orcamento' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2699\uFE0F Definir Or\xE7amento",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormOrcamento, null)), modalAberto === 'novoPlanejado' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Adicionar Planejado",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormPlanejado, null)), modalAberto === 'novaReceita' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Nova Receita",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovaReceita, null)), modalAberto === 'compraParcelada' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83D\uDED2 Nova Compra Parcelada",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormCompraParcelada, null)), modalAberto === 'importarFatura' && /*#__PURE__*/React.createElement(Modal, {
    titulo: '\u2B06 Importar Fatura' + (cartaoImport ? ' \u2014 ' + cartaoImport.nome : ''),
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormImportarFatura, null)), modalAberto === 'gerenciarCartoes' && /*#__PURE__*/React.createElement(Modal, {
    titulo: '\u2699\uFE0F Gerenciar Cart\xF5es',
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormGerenciarCartoes, null))
  , modalAberto === 'quickAdd' && /*#__PURE__*/React.createElement(Modal, {
    titulo: '\u2795 Adicionar Despesa',
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:'12px',padding:'4px 0'}},
    /*#__PURE__*/React.createElement('div', {
      onClick: () => { setCartaoParaNovaCompra(null); setModalAberto('compraParcelada'); },
      style:{display:'flex',alignItems:'center',gap:'16px',padding:'18px 20px',borderRadius:'14px',background:'#fff7ed',border:'1.5px solid #fdba74',cursor:'pointer',transition:'opacity .15s'},
      onMouseEnter: e => e.currentTarget.style.opacity='0.85',
      onMouseLeave: e => e.currentTarget.style.opacity='1'
    },
      /*#__PURE__*/React.createElement('div',{style:{fontSize:'2rem',lineHeight:1}},'\uD83D\uDCB3'),
      /*#__PURE__*/React.createElement('div',null,
        /*#__PURE__*/React.createElement('div',{style:{fontWeight:'800',fontSize:'1rem',color:'#ea580c'}},'Compra no Cart\u00e3o'),
        /*#__PURE__*/React.createElement('div',{style:{fontSize:'0.78rem',color:'#f97316',marginTop:'3px'}},'Parcelada ou \u00e0 vista no cr\u00e9dito')
      )
    ),
    /*#__PURE__*/React.createElement('div', {
      onClick: () => setModalAberto('novoGastoVariavel'),
      style:{display:'flex',alignItems:'center',gap:'16px',padding:'18px 20px',borderRadius:'14px',background:'#fff7ed',border:'1.5px solid #fdba74',cursor:'pointer',transition:'opacity .15s'},
      onMouseEnter: e => e.currentTarget.style.opacity='0.85',
      onMouseLeave: e => e.currentTarget.style.opacity='1'
    },
      /*#__PURE__*/React.createElement('div',{style:{fontSize:'2rem',lineHeight:1}},'\uD83D\uDED2'),
      /*#__PURE__*/React.createElement('div',null,
        /*#__PURE__*/React.createElement('div',{style:{fontWeight:'800',fontSize:'1rem',color:'#c2410c'}},'Gasto Vari\u00e1vel'),
        /*#__PURE__*/React.createElement('div',{style:{fontSize:'0.78rem',color:'#ea580c',marginTop:'3px'}},'Mercado, farm\u00e1cia, transporte...')
      )
    ),
    /*#__PURE__*/React.createElement('div', {
      onClick: () => setModalAberto('novoGastoExtra'),
      style:{display:'flex',alignItems:'center',gap:'16px',padding:'18px 20px',borderRadius:'14px',background:'#ecfdf5',border:'1.5px solid #6ee7b7',cursor:'pointer',transition:'opacity .15s'},
      onMouseEnter: e => e.currentTarget.style.opacity='0.85',
      onMouseLeave: e => e.currentTarget.style.opacity='1'
    },
      /*#__PURE__*/React.createElement('div',{style:{fontSize:'2rem',lineHeight:1}},'\u26A1'),
      /*#__PURE__*/React.createElement('div',null,
        /*#__PURE__*/React.createElement('div',{style:{fontWeight:'800',fontSize:'1rem',color:'#065f46'}},'Gasto Extra'),
        /*#__PURE__*/React.createElement('div',{style:{fontSize:'0.78rem',color:'#059669',marginTop:'3px'}},'Viagem, presente, emerg\u00eancia...')
      )
    )
  )))
  , inputDialog && /*#__PURE__*/React.createElement(InputDialog, {
      titulo: inputDialog.titulo,
      label: inputDialog.label,
      valorPadrao: String(inputDialog.valorPadrao ?? ''),
      onConfirm: (v) => { setInputDialog(null); inputDialog.callback(v); },
      onCancel: () => setInputDialog(null)
    })
  , /*#__PURE__*/React.createElement('button', {
      onClick: () => setModalAberto('quickAdd'),
      title: 'Adicionar Despesa',
      onMouseEnter: e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(249,115,22,0.7)'; },
      onMouseLeave: e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.5)'; },
      style: {
        position: 'fixed', bottom: window.innerWidth <= 768 ? '76px' : '28px', right: '28px', zIndex: 2000,
        width: '56px', height: '56px', borderRadius: '50%', border: 'none',
        background: '#f97316',
        color: '#fff', fontSize: '28px', fontWeight: '300', lineHeight: 1,
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(249,115,22,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }
    }, '+')
  , mostrarOnboarding && receitas.length === 0 && gastosFixos.length === 0 && (function() {
    var STEPS = [
      { icon:'💰', cor:'#10b981', rgb:'16,185,129', tela:'receitas',
        titulo:'Cadastre suas Receitas',
        desc:'Registre seu salário e outras entradas mensais para saber exatamente quanto você tem disponível.',
        dica:'💡 Sem saber o que entra, fica difícil planejar o que sai.' },
      { icon:'🏠', cor:'#f97316', rgb:'249,115,22', tela:'fixos',
        titulo:'Adicione Contas Fixas',
        desc:'Aluguel, internet, academia, assinaturas — tudo que você paga todo mês sem falta.',
        dica:'💡 O sistema avisa automaticamente quando estão vencendo.' },
      { icon:'💳', cor:'#8b5cf6', rgb:'139,92,246', tela:'cartoes',
        titulo:'Cadastre seus Cartões',
        desc:'Adicione seus cartões de crédito e acompanhe cada fatura em tempo real.',
        dica:'💡 Importe a fatura completa via arquivo CSV com um clique.' },
      { icon:'📊', cor:'#0284c7', rgb:'2,132,199', tela:'variaveis',
        titulo:'Registre Gastos Variáveis',
        desc:'Mercado, combustível, farmácia, restaurante — registre no dia e tenha controle total.',
        dica:'💡 Categorias detectadas automaticamente na importação.' },
    ];
    var s = STEPS[stepOnboarding];
    var isUltimo = stepOnboarding === 3;

    return /*#__PURE__*/React.createElement('div', {
      style:{position:'fixed',inset:0,zIndex:99999,background:'rgba(2,6,23,0.85)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'},
      onClick: dispensarOnboarding
    },
      /*#__PURE__*/React.createElement('div', {
        onClick: function(e){e.stopPropagation();},
        style:{
          background: darkMode ? '#0f172a' : '#ffffff',
          borderRadius:'28px', width:'100%', maxWidth:'420px',
          boxShadow:'0 40px 100px rgba(0,0,0,0.6)',
          border:'1px solid '+(darkMode?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'),
          overflow:'hidden', position:'relative'
        }
      },

        /* ── Área colorida do topo com ícone ── */
        /*#__PURE__*/React.createElement('div', {style:{
          background:'linear-gradient(135deg, '+s.cor+'22 0%, '+s.cor+'08 100%)',
          borderBottom:'1px solid '+s.cor+'33',
          padding:'36px 28px 28px',
          textAlign:'center', position:'relative'
        }},
          /* Bolinha de glow atrás do ícone */
          /*#__PURE__*/React.createElement('div', {style:{
            width:'96px', height:'96px', borderRadius:'50%',
            background:'radial-gradient(circle, rgba('+s.rgb+',0.25) 0%, transparent 70%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 6px',
            boxShadow:'0 0 0 16px rgba('+s.rgb+',0.06), 0 0 0 32px rgba('+s.rgb+',0.03)'
          }},
            /*#__PURE__*/React.createElement('span', {style:{fontSize:'3.2rem', lineHeight:1, filter:'drop-shadow(0 4px 12px rgba('+s.rgb+',0.5))'}}, s.icon)
          ),
          /* Progresso: bolinhas */
          /*#__PURE__*/React.createElement('div', {style:{display:'flex',gap:'6px',justifyContent:'center',marginTop:'20px'}},
            ...[0,1,2,3].map(function(i){
              return /*#__PURE__*/React.createElement('div', {key:i, style:{
                width: i===stepOnboarding ? '20px' : '6px',
                height:'6px', borderRadius:'3px',
                background: i===stepOnboarding ? s.cor : (darkMode?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)'),
                transition:'all 0.3s ease'
              }});
            })
          )
        ),

        /* ── Conteúdo ── */
        /*#__PURE__*/React.createElement('div', {style:{padding:'24px 28px 28px'}},
          /*#__PURE__*/React.createElement('div', {style:{fontSize:'0.72rem', fontWeight:'700', letterSpacing:'0.08em', color:s.cor, textTransform:'uppercase', marginBottom:'8px'}},
            'Passo '+(stepOnboarding+1)+' de 4'),
          /*#__PURE__*/React.createElement('div', {style:{
            fontSize:'1.25rem', fontWeight:'900', letterSpacing:'-0.02em',
            color: darkMode?'#f1f5f9':'#0f172a', marginBottom:'10px', lineHeight:'1.3'
          }}, s.titulo),
          /*#__PURE__*/React.createElement('div', {style:{
            fontSize:'0.83rem', color: darkMode?'#94a3b8':'#64748b',
            lineHeight:'1.6', marginBottom:'14px'
          }}, s.desc),
          /*#__PURE__*/React.createElement('div', {style:{
            fontSize:'0.75rem', color: darkMode?'rgba('+s.rgb+',0.85)':'rgba('+s.rgb+',0.9)',
            background:'rgba('+s.rgb+',0.08)', border:'1px solid rgba('+s.rgb+',0.2)',
            borderRadius:'10px', padding:'10px 14px', lineHeight:'1.5'
          }}, s.dica),

          /* ── Botões de navegação ── */
          /*#__PURE__*/React.createElement('div', {style:{display:'flex',gap:'10px',marginTop:'22px',alignItems:'center'}},
            /* Pular / Anterior */
            stepOnboarding === 0
              ? /*#__PURE__*/React.createElement('button', {
                  onClick: dispensarOnboarding,
                  style:{flex:1,border:'none',background:'transparent',cursor:'pointer',fontSize:'0.8rem',color:darkMode?'#475569':'#94a3b8',padding:'12px 0',borderRadius:'12px',fontWeight:'500'}
                }, 'Pular')
              : /*#__PURE__*/React.createElement('button', {
                  onClick: function(){ setStepOnboarding(stepOnboarding-1); },
                  style:{flex:1,border:'1px solid '+(darkMode?'rgba(255,255,255,0.1)':'#e2e8f0'),background:'transparent',cursor:'pointer',fontSize:'0.82rem',color:darkMode?'#94a3b8':'#64748b',padding:'12px 0',borderRadius:'12px',fontWeight:'500',transition:'border-color 0.15s'},
                  onMouseEnter:function(e){e.currentTarget.style.borderColor=s.cor;},
                  onMouseLeave:function(e){e.currentTarget.style.borderColor=darkMode?'rgba(255,255,255,0.1)':'#e2e8f0';}
                }, '← Anterior'),

            /* Próximo / Ir agora */
            /*#__PURE__*/React.createElement('button', {
              onClick: isUltimo
                ? function(){ dispensarOnboarding(); setTelaAtiva(s.tela); }
                : function(){ setStepOnboarding(stepOnboarding+1); },
              style:{
                flex:2, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:'700',
                padding:'13px 0', borderRadius:'12px', color:'#fff',
                background:'linear-gradient(135deg,'+s.cor+' 0%,rgba('+s.rgb+',0.75) 100%)',
                boxShadow:'0 4px 20px rgba('+s.rgb+',0.45)',
                transition:'all 0.18s ease'
              },
              onMouseEnter:function(e){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba('+s.rgb+',0.55)';},
              onMouseLeave:function(e){e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba('+s.rgb+',0.45)';}
            }, isUltimo ? 'Começar agora 🚀' : 'Próximo →')
          )
        )
      )
    );
  })()
  , /*#__PURE__*/React.createElement(ToastContainer, null)
  );
}
const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(/*#__PURE__*/React.createElement(AuthWrapper, null));
