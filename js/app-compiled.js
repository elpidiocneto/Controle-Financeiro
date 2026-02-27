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
            console.log('⚠️ Usuário não existe no Firestore. Criando como PENDENTE...');
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
      // ISOLAMENTO DE DADOS POR USUÁRIO
      // Compara o uid atual com o uid salvo no localStorage.
      // Se mudou (troca de conta), limpa tudo, carrega do Firestore
      // e dá reload para forçar o React a reinicializar com dados limpos.
      // ===================================================
      if (user) {
        const uidAnterior = localStorage.getItem('_currentUserId');
        const uidMudou = uidAnterior && uidAnterior !== user.uid;
        const primeiroLogin = !uidAnterior;
        if (uidMudou || primeiroLogin) {
          try {
            // 1. Limpar TODOS os dados do localStorage
            const keysToRemove = ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'farol', 'metas', 'metasFinanceiras', 'orcamento', 'orcamentosMensais', 'orcamentoAnual', 'planejadosMes', 'comprasParceladas', 'dividas', 'reservaEmergencia', 'categoriasPersonalizadas', 'anoAtual', 'mesAtual'];
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // 2. Carregar dados do Firestore do usuário atual
            const backupDoc = await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
            if (backupDoc.exists) {
              const dadosBackup = backupDoc.data().dados || {};
              if (dadosBackup.cartoes) localStorage.setItem('cartoes', JSON.stringify(dadosBackup.cartoes));
              if (dadosBackup.gastosFixos) localStorage.setItem('gastosFixos', JSON.stringify(dadosBackup.gastosFixos));
              if (dadosBackup.gastosVariaveis) localStorage.setItem('gastosVariaveis', JSON.stringify(dadosBackup.gastosVariaveis));
              if (dadosBackup.gastosExtras) localStorage.setItem('gastosExtras', JSON.stringify(dadosBackup.gastosExtras));
              if (dadosBackup.receitas) localStorage.setItem('receitas', JSON.stringify(dadosBackup.receitas));
              if (dadosBackup.farol) localStorage.setItem('farol', JSON.stringify(dadosBackup.farol));
              if (dadosBackup.metas) localStorage.setItem('metas', JSON.stringify(dadosBackup.metas));
              if (dadosBackup.metasFinanceiras) localStorage.setItem('metasFinanceiras', JSON.stringify(dadosBackup.metasFinanceiras));
              if (dadosBackup.orcamento) localStorage.setItem('orcamento', JSON.stringify(dadosBackup.orcamento));
              if (dadosBackup.orcamentosMensais) localStorage.setItem('orcamentosMensais', JSON.stringify(dadosBackup.orcamentosMensais));
              if (dadosBackup.orcamentoAnual) localStorage.setItem('orcamentoAnual', JSON.stringify(dadosBackup.orcamentoAnual));
              if (dadosBackup.planejadosMes) localStorage.setItem('planejadosMes', JSON.stringify(dadosBackup.planejadosMes));
              if (dadosBackup.comprasParceladas) localStorage.setItem('comprasParceladas', JSON.stringify(dadosBackup.comprasParceladas));
              if (dadosBackup.dividas) localStorage.setItem('dividas', JSON.stringify(dadosBackup.dividas));
              if (dadosBackup.reservaEmergencia !== undefined) localStorage.setItem('reservaEmergencia', dadosBackup.reservaEmergencia.toString());
              if (dadosBackup.categoriasPersonalizadas) localStorage.setItem('categoriasPersonalizadas', JSON.stringify(dadosBackup.categoriasPersonalizadas));
              console.log('✅ Dados do usuário', user.uid, 'carregados do Firestore');
            } else {
              console.log('🆕 Usuário', user.uid, '- sem backup, iniciando do zero');
            }

            // 3. Salvar o uid atual para comparação futura
            localStorage.setItem('_currentUserId', user.uid);

            // 4. Se o uid MUDOU (troca de conta), recarregar a página
            //    para que os useState do React reinicializem com os dados corretos
            if (uidMudou) {
              console.log('🔄 Troca de conta detectada, recarregando...');
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
        newsletter: aceitaNewsletter,
        notificacoes: {
          vencimentos: true,
          metas: true,
          newsletter: aceitaNewsletter
        },
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Usuário salvo no Firestore');

      // 3. Enviar email de verificação
      await userCredential.user.sendEmailVerification({
        url: window.location.href,
        handleCodeInApp: false
      });
      console.log('✅ Email de verificação enviado');

      // 4. Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Fazer logout
      await firebase.auth().signOut();
      console.log('✅ Logout realizado');

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
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
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
        background: authMode === mode ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: authMode === mode ? '#fff' : 'rgba(255,255,255,0.45)'
      }
    }, mode === 'login' ? 'Entrar' : 'Criar Conta'))), authMode === 'register' && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.2))',
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
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        transition: 'transform 0.1s, box-shadow 0.2s'
      }
    }, authMode === 'login' ? '→ Entrar na conta' : '→ Criar minha conta grátis')), authMode === 'login' && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        marginTop: '1rem'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        const emailInput = prompt('📧 Digite seu email:');
        if (emailInput) {
          const passwordInput = prompt('🔒 Digite sua senha:');
          if (passwordInput) {
            try {
              const userCredential = await firebase.auth().signInWithEmailAndPassword(emailInput, passwordInput);
              if (!userCredential.user.emailVerified) {
                await userCredential.user.sendEmailVerification();
                await firebase.auth().signOut();
                alert('✅ Email de verificação reenviado! Verifique sua caixa de entrada.');
              } else {
                await firebase.auth().signOut();
                alert('✅ Email já verificado! Tente fazer login normalmente.');
              }
            } catch (error) {
              alert('❌ Email ou senha incorretos');
            }
          }
        }
      },
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
    }, item)))));
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
  console.log('🔍 FormEdicao - item recebido:', item);
  console.log('🔍 FormEdicao - formData inicial:', formData);
  const handleChange = (campo, valor) => {
    console.log(`🔄 Mudando ${campo} para:`, valor);
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    console.log('💾 Salvando formData:', formData);

    // Garantir que ano seja número
    const dadosParaSalvar = {
      ...formData,
      ano: parseInt(formData.ano) || new Date().getFullYear(),
      valor: parseFloat(formData.valor)
    };
    console.log('💾 Dados após processamento:', dadosParaSalvar);
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
      gap: '8px',
      padding: '6px 12px',
      borderRadius: '8px',
      background: aberto ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.15)',
      cursor: 'pointer',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '0.9rem',
      color: '#fff',
      flexShrink: 0
    }
  }, inicial), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.85rem',
      fontWeight: '600',
      maxWidth: '120px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, nome), /*#__PURE__*/React.createElement("span", {
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
      border: '1px solid rgba(99,102,241,0.4)',
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
  
  // 🔒 LOGOUT AUTOMÁTICO POR INATIVIDADE - 30 MINUTOS
  const [ultimaAtividade, setUltimaAtividade] = useState(Date.now());
  
  useEffect(() => {
    if (!user) return;
    
    const TIMEOUT_INATIVIDADE = 30 * 60 * 1000; // 30 minutos
    
    // Atualizar timestamp de atividade
    const registrarAtividade = () => setUltimaAtividade(Date.now());
    
    // Monitorar eventos do usuário
    window.addEventListener('mousedown', registrarAtividade);
    window.addEventListener('keydown', registrarAtividade);
    window.addEventListener('scroll', registrarAtividade);
    window.addEventListener('touchstart', registrarAtividade);
    
    // Verificar inatividade a cada 1 minuto
    const intervalo = setInterval(() => {
      const tempoInativo = Date.now() - ultimaAtividade;
      
      if (tempoInativo >= TIMEOUT_INATIVIDADE) {
        console.log('🔒 Logout automático: 30 minutos de inatividade');
        alert('⏰ Sua sessão expirou por inatividade (30 minutos).\\n\\nPor segurança, você será desconectado.');
        
        // Limpar todos os dados
        ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'orcamentos', 'metasMensais', 'metasFinanceiras', 'planejados', 'dividas', 'categorias', 'farol', '_currentUserId'].forEach(k => localStorage.removeItem(k));
        
        // Fazer logout
        firebase.auth().signOut();
      }
    }, 60000); // Verificar a cada 1 minuto
    
    // Cleanup ao desmontar
    return () => {
      window.removeEventListener('mousedown', registrarAtividade);
      window.removeEventListener('keydown', registrarAtividade);
      window.removeEventListener('scroll', registrarAtividade);
      window.removeEventListener('touchstart', registrarAtividade);
      clearInterval(intervalo);
    };
  }, [user, ultimaAtividade]);
  
  const [modalAberto, setModalAberto] = useState(null);
  
  // Listener para abrir modal via evento global
  React.useEffect(() => {
    const handleAbrirModal = (e) => {
      console.log('🎯 Evento abrirModal recebido:', e.detail);
      setModalAberto(e.detail.tipo);
    };
    
    window.addEventListener('abrirModal', handleAbrirModal);
    return () => window.removeEventListener('abrirModal', handleAbrirModal);
  }, []);
  const [itemEditando, setItemEditando] = useState(null);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [gastosFixos, setGastosFixos] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return DADOS_INICIAIS.gastosFixos;
    const saved = localStorage.getItem('gastosFixos');
    return saved ? JSON.parse(saved) : DADOS_INICIAIS.gastosFixos;
  });
  const [cartoes, setCartoes] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return DADOS_INICIAIS.cartoes;
    const saved = localStorage.getItem('cartoes');
    return saved ? JSON.parse(saved) : DADOS_INICIAIS.cartoes;
  });
  const [gastosVariaveis, setGastosVariaveis] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const saved = localStorage.getItem('gastosVariaveis');
    const gastos = saved ? JSON.parse(saved) : [];

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
          console.log('📅 Convertendo data BR:', gasto.data, '→', dataGasto.toISOString().split('T')[0]);
        }
        // 2. Se ID é timestamp válido
        else if (gasto.id && !isNaN(gasto.id) && gasto.id > 1000000000000) {
          dataGasto = new Date(gasto.id);
          console.log('📅 Usando ID como timestamp:', gasto.id, '→', dataGasto.toISOString().split('T')[0]);
        }
        // 3. Fallback: usar mês e ano atuais com dia 1
        else {
          const anoGasto = gasto.ano || new Date().getFullYear();
          const mesGasto = gasto.mes || 'jan';
          const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          const mesNum = meses.indexOf(mesGasto.toLowerCase());
          dataGasto = new Date(anoGasto, mesNum >= 0 ? mesNum : 0, 1);
          console.log('📅 Fallback mês/ano:', mesGasto, anoGasto, '→', dataGasto.toISOString().split('T')[0]);
        }
        const dataCompletaGerada = dataGasto.toISOString().split('T')[0];
        const dataFormatada = dataGasto.toLocaleDateString('pt-BR');
        console.log('✅ Migrado:', gasto.descricao || 'Sem descrição', '-', dataCompletaGerada);
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
      console.log('💾 Salvando', gastosMigrados.length, 'gastos migrados no localStorage...');
      setTimeout(() => {
        localStorage.setItem('gastosVariaveis', JSON.stringify(gastosMigrados));
        console.log('✅ Migração de datas concluída para gastos variáveis');
      }, 100);
    }
    return gastosMigrados;
  });
  const [gastosExtras, setGastosExtras] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const saved = localStorage.getItem('gastosExtras');
    const gastos = saved ? JSON.parse(saved) : [];

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
        localStorage.setItem('gastosExtras', JSON.stringify(gastosMigrados));
        console.log('✅ Migração de datas concluída:', gastosMigrados.length, 'gastos extras');
      }, 100);
    }
    return gastosMigrados;
  });
  const [receitas, setReceitas] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const saved = localStorage.getItem('receitas');
    return saved ? JSON.parse(saved) : [];
  });
  const [farol, setFarol] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return {};
    const saved = localStorage.getItem('farol');
    return saved ? JSON.parse(saved) : {};
  });
  const [metas, setMetas] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return {};
    const saved = localStorage.getItem('metas');
    return saved ? JSON.parse(saved) : {
      mensal: 0,
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
    };
  });

  // 🎯 METAS FINANCEIRAS (Curto/Médio/Longo Prazo)
  const [metasFinanceiras, setMetasFinanceiras] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const saved = localStorage.getItem('metasFinanceiras');
    return saved ? JSON.parse(saved) : [];
  });

  // 💰 RESERVA DE EMERGÊNCIA ATUAL
  const [reservaEmergencia, setReservaEmergencia] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return 0;
    const saved = localStorage.getItem('reservaEmergencia');
    return saved ? parseFloat(saved) : 0;
  });

  // 💳 DÍVIDAS
  const [dividas, setDividas] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return [];
    const saved = localStorage.getItem('dividas');
    return saved ? JSON.parse(saved) : [];
  });
  const [orcamento, setOrcamento] = useState(() => {
    const currentUserId = localStorage.getItem('_currentUserId');
    if (!currentUserId) return {};
    const saved = localStorage.getItem('orcamento');
    return saved ? JSON.parse(saved) : {
      cartoes: 0,
      fixos: 0,
      variaveis: 0
    };
  });

  // Categorias personalizadas
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState(() => {
    const saved = localStorage.getItem('categoriasPersonalizadas');
    return saved ? JSON.parse(saved) : {
      gastosFixos: [],
      gastosVariaveis: [],
      gastosExtras: []
    };
  });
  const [orcamentosMensais, setOrcamentosMensais] = useState(() => {
    const saved = localStorage.getItem('orcamentosMensais');
    return saved ? JSON.parse(saved) : {
      jan: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      fev: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      mar: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      abr: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      mai: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      jun: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      jul: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      ago: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      set: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      out: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      nov: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      },
      dez: {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      }
    };
  });
  const [orcamentoAnual, setOrcamentoAnual] = useState(() => {
    const saved = localStorage.getItem('orcamentoAnual');
    return saved ? JSON.parse(saved) : {
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
    };
  });
  const [planejadosMes, setPlanejadosMes] = useState(() => {
    const saved = localStorage.getItem('planejadosMes');
    return saved ? JSON.parse(saved) : [];
  });
  const [comprasParceladas, setComprasParceladas] = useState(() => {
    const saved = localStorage.getItem('comprasParceladas');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('anoAtual', anoAtual.toString());
  }, [anoAtual]);
  useEffect(() => {
    localStorage.setItem('gastosFixos', JSON.stringify(gastosFixos));
  }, [gastosFixos]);
  useEffect(() => {
    localStorage.setItem('categoriasPersonalizadas', JSON.stringify(categoriasPersonalizadas));
  }, [categoriasPersonalizadas]);
  useEffect(() => {
    console.log('💾 Salvando cartões:', cartoes.length, 'cartões');
    localStorage.setItem('cartoes', JSON.stringify(cartoes));
  }, [cartoes]);
  useEffect(() => {
    localStorage.setItem('gastosVariaveis', JSON.stringify(gastosVariaveis));
  }, [gastosVariaveis]);
  useEffect(() => {
    localStorage.setItem('gastosExtras', JSON.stringify(gastosExtras));
  }, [gastosExtras]);
  useEffect(() => {
    localStorage.setItem('receitas', JSON.stringify(receitas));
  }, [receitas]);
  useEffect(() => {
    localStorage.setItem('farol', JSON.stringify(farol));
  }, [farol]);
  useEffect(() => {
    localStorage.setItem('metas', JSON.stringify(metas));
  }, [metas]);
  useEffect(() => {
    localStorage.setItem('metasFinanceiras', JSON.stringify(metasFinanceiras));
  }, [metasFinanceiras]);
  useEffect(() => {
    localStorage.setItem('reservaEmergencia', reservaEmergencia.toString());
  }, [reservaEmergencia]);
  useEffect(() => {
    localStorage.setItem('dividas', JSON.stringify(dividas));
  }, [dividas]);
  useEffect(() => {
    localStorage.setItem('orcamento', JSON.stringify(orcamento));
  }, [orcamento]);
  useEffect(() => {
    localStorage.setItem('orcamentosMensais', JSON.stringify(orcamentosMensais));
  }, [orcamentosMensais]);

  // 🔥 AUTO-SAVE NA NUVEM - Salva automaticamente após cada mudança
  useEffect(() => {
    const autoSave = async () => {
      if (!db || !user) return;
      setSalvando(true);
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
        setUltimoSave(new Date());
      } catch (error) {
        console.error('Erro no auto-save:', error);
      } finally {
        setSalvando(false);
      }
    };

    // Debounce de 2 segundos para evitar salvar demais
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [cartoes, gastosFixos, gastosVariaveis, receitas, farol, metas, orcamento, orcamentosMensais, orcamentoAnual, planejadosMes, comprasParceladas]);

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
              console.log('✅ Primeiro usuário promovido a admin automaticamente');
              console.log('🔍 DEBUG: isUserAdmin setado para TRUE (primeiro usuário)');
            } else {
              setIsUserAdmin(false);
              console.log('⚠️ DEBUG: isUserAdmin setado para FALSE (não é primeiro usuário)');
              console.log('📊 DEBUG: Total de usuários:', allUsers.size);
            }
          } else {
            // Já tem campo definido, usar o valor
            const adminStatus = userData.isAdmin === true;
            setIsUserAdmin(adminStatus);
            console.log('🔍 DEBUG: isAdmin do Firestore:', userData.isAdmin);
            console.log('🔍 DEBUG: isUserAdmin setado para:', adminStatus);
          }

          // Se não tem status, é usuário antigo - aprovar automaticamente
          if (!userData.status) {
            await db.collection('usuarios').doc(user.uid).update({
              status: 'APROVADO',
              emailVerificado: true,
              plano: 'premium' // Usuários antigos viram premium
            });
            console.log('✅ Usuário antigo aprovado e verificado automaticamente');
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
          console.log('❌ DEBUG: Documento do usuário não existe no Firestore');
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
          console.log('✅ Dados carregados da nuvem');
        }
      } catch (error) {
        console.error('Erro ao carregar da nuvem:', error);
      }
    };
    carregarDaNuvem();
  }, []);
  useEffect(() => {
    localStorage.setItem('orcamentoAnual', JSON.stringify(orcamentoAnual));
  }, [orcamentoAnual]);
  useEffect(() => {
    localStorage.setItem('planejadosMes', JSON.stringify(planejadosMes));
  }, [planejadosMes]);
  useEffect(() => {
    localStorage.setItem('comprasParceladas', JSON.stringify(comprasParceladas));
  }, [comprasParceladas]);

  // MIGRAÇÃO AUTOMÁTICA PARA ESTRUTURA MULTI-ANO
  useEffect(() => {
    const migrated = localStorage.getItem('dataMigradaMultiAno');
    if (migrated) return; // Já migrado

    console.log('🔄 Iniciando migração para estrutura multi-ano...');

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
    console.log('✅ Migração concluída com sucesso!');
  }, []);
  const calcularTotais = mes => {
    // Valor base dos cartões - AGORA USA ANO
    const totalCartoesBase = cartoes.reduce((sum, c) => {
      const valoresAno = c.valores?.[anoAtual] || {};
      return sum + (valoresAno[mes] || 0);
    }, 0);

    // Adicionar parcelas do mês
    const parcelasDoMes = comprasParceladas.filter(compra => compra.meses && compra.meses.includes(mes)).reduce((sum, compra) => sum + (compra.valorParcela || 0), 0);
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
    console.log('Adicionando cartão:', dados);
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
    alert('Cartão adicionado com sucesso!');
  };
  const adicionarGastoFixo = dados => {
    console.log('Adicionando gasto fixo:', dados);
    const novoGasto = {
      id: Date.now(),
      categoria: dados.categoria.toUpperCase(),
      descricao: dados.descricao.toUpperCase(),
      valor: parseFloat(dados.valor),
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
      alert('Gasto fixo adicionado com sucesso!');
    }
  };
  const adicionarGastoVariavel = dados => {
    console.log('Adicionando gasto variável:', dados);
    const novoGasto = {
      id: Date.now(),
      categoria: dados.categoria,
      descricao: dados.descricao || '',
      valor: parseFloat(dados.valor),
      mes: mesAtual,
      ano: anoAtual,
      data: dados.data || new Date().toLocaleDateString('pt-BR'),
      dataCompleta: dados.dataCompleta || new Date().toISOString().split('T')[0] // YYYY-MM-DD para ordenar
    };
    setGastosVariaveis([...gastosVariaveis, novoGasto]);
    setModalAberto(null);
    alert('Gasto variável adicionado com sucesso!');
  };
  const deletarCartao = id => {
    if (confirm('Tem certeza?')) {
      setCartoes(cartoes.filter(c => c.id !== id));
    }
  };
  const editarCartao = async (id, dadosAtualizados) => {
    console.log('✏️ Editando cartão:', id, dadosAtualizados);
    const novosCartoes = [];
    cartoes.forEach(c => {
      if (c.id === id) {
        const cartaoAtualizado = {
          ...c,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || c.ano || 2026,
          valor: parseFloat(dadosAtualizados.valor) || c.valor,
          limite: parseFloat(dadosAtualizados.limite) || c.limite || 0,
          // IMPORTANTE!
          diaFechamento: parseInt(dadosAtualizados.diaFechamento) || c.diaFechamento
        };
        console.log('✅ Cartão atualizado:', cartaoAtualizado);
        novosCartoes.push(cartaoAtualizado);
      } else {
        novosCartoes.push(c);
      }
    });
    setCartoes([]);
    setTimeout(() => setCartoes(novosCartoes), 10);
    setModalAberto(null);
    alert('✅ Cartão atualizado com sucesso!');

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
    alert('✅ Cartão atualizado!');
  };
  const duplicarCartao = cartao => {
    const novoCartao = {
      ...cartao,
      id: Date.now(),
      nome: cartao.nome + ' (Cópia)'
    };
    setCartoes([...cartoes, novoCartao]);
    alert('✅ Cartão duplicado com sucesso!');
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
          ano: parseInt(dadosAtualizados.ano) || g.ano || 2026,
          valor: parseFloat(dadosAtualizados.valor) || g.valor
        });
      } else {
        novosGastos.push(g);
      }
    });
    setGastosFixos([]);
    setTimeout(() => setGastosFixos(novosGastos), 10);

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
    alert('✅ Gasto fixo atualizado!');
  };
  const duplicarGastoFixo = gasto => {
    const novoGasto = {
      ...gasto,
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    };
    setGastosFixos([...gastosFixos, novoGasto]);
    alert('✅ Gasto fixo duplicado com sucesso!');
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
          ano: parseInt(dadosAtualizados.ano) || g.ano || 2026,
          valor: parseFloat(dadosAtualizados.valor) || g.valor
        });
      } else {
        novosGastos.push(g);
      }
    });
    setGastosVariaveis([]);
    setTimeout(() => setGastosVariaveis(novosGastos), 10);

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
    alert('✅ Gasto variável atualizado com sucesso!');
  };
  const duplicarGastoVariavel = gasto => {
    const novoGasto = {
      ...gasto,
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    };
    setGastosVariaveis([...gastosVariaveis, novoGasto]);
    alert('✅ Gasto variável duplicado com sucesso!');
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
          ano: parseInt(dadosAtualizados.ano) || g.ano || 2026,
          valor: parseFloat(dadosAtualizados.valor) || g.valor
        });
      } else {
        novosGastos.push(g);
      }
    });
    setGastosExtras([]);
    setTimeout(() => setGastosExtras(novosGastos), 10);

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
    alert('✅ Gasto extra duplicado com sucesso!');
  };

  // 💳 MIGRAÇÃO DE VALORES DE CARTÕES 2025 → 2026 (MOVE, NÃO COPIA)
  const migrarValoresCartoes = async (anoOrigem, anoDestino) => {
    if (!confirm(`💳 MOVER VALORES DE CARTÕES\n\nIsso vai MOVER todos os valores de ${anoOrigem} para ${anoDestino}.\n\n⚠️ ATENÇÃO:\n✅ Valores vão para ${anoDestino}\n❌ Valores de ${anoOrigem} serão APAGADOS\n\nExemplo:\nNubank ${anoOrigem}: R$ 1.500\n  ↓\nNubank ${anoDestino}: R$ 1.500\nNubank ${anoOrigem}: R$ 0 (zerado!)\n\nDeseja continuar?`)) {
      return;
    }
    try {
      console.log('💳 Iniciando migração de cartões...');
      console.log('📋 Cartões antes:', cartoes);
      let cartoesAtualizados = 0;
      let valoresMigrados = 0;
      const novosCartoes = cartoes.map(cartao => {
        // Verificar se tem valores no ano de origem
        const valoresOrigem = cartao.valores?.[anoOrigem];
        if (valoresOrigem && Object.keys(valoresOrigem).length > 0) {
          console.log(`💳 Movendo cartão: ${cartao.nome}`);
          console.log(`  Valores ${anoOrigem} (antes):`, valoresOrigem);

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
          console.log(`  Valores ${anoDestino} (depois):`, novoCartao.valores[anoDestino]);
          console.log(`  Valores ${anoOrigem} (depois):`, novoCartao.valores[anoOrigem]);
          cartoesAtualizados++;
          valoresMigrados += Object.keys(valoresOrigem).length;
          return novoCartao;
        }
        return cartao;
      });
      console.log('📋 Cartões depois:', novosCartoes);
      if (cartoesAtualizados === 0) {
        alert(`⚠️ Nenhum cartão tinha valores em ${anoOrigem}!\n\nVerifique se os cartões estão cadastrados.`);
        return;
      }

      // Atualizar estado
      setCartoes(novosCartoes);

      // Salvar no Firestore
      if (db && user) {
        console.log('💾 Salvando no Firestore...');
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
        console.log('✅ Salvo no Firestore!');
      }
      alert(`✅ Migração de cartões concluída!\n\n` + `💳 Cartões movidos: ${cartoesAtualizados}\n` + `📅 Valores mensais migrados: ${valoresMigrados}\n\n` + `✅ Valores copiados para ${anoDestino}\n` + `❌ Valores de ${anoOrigem} foram ZERADOS\n\n` + `Veja o console (F12) para detalhes.`);
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      alert('❌ Erro na migração: ' + error.message);
    }
  };

  // 🔍 DIAGNÓSTICO COMPLETO - LOCALSTORAGE + FIRESTORE
  const diagnosticarStorage = async () => {
    console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO...');

    // 1. Ver o que tem no localStorage
    const localReceitas = JSON.parse(localStorage.getItem('receitas') || '[]');
    const localCartoes = JSON.parse(localStorage.getItem('cartoes') || '[]');
    const localFixos = JSON.parse(localStorage.getItem('gastosFixos') || '[]');
    const localVariaveis = JSON.parse(localStorage.getItem('gastosVariaveis') || '[]');
    console.log('💾 LOCALSTORAGE:');
    console.log('  Receitas:', localReceitas);
    console.log('  Cartões:', localCartoes);
    console.log('  Fixos:', localFixos);
    console.log('  Variáveis:', localVariaveis);

    // 2. Ver o que tem no Firestore
    let firestoreData = null;
    if (db && user) {
      try {
        const doc = await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
        if (doc.exists) {
          firestoreData = doc.data();
          console.log('☁️ FIRESTORE:', firestoreData.dados);
        }
      } catch (error) {
        console.error('Erro ao buscar Firestore:', error);
      }
    }

    // 3. Ver o que tem nos estados React
    console.log('⚛️ REACT STATES:');
    console.log('  Receitas:', receitas);
    console.log('  Cartões:', cartoes);
    console.log('  Fixos:', gastosFixos);
    console.log('  Variáveis:', gastosVariaveis);

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
    console.log('📊 CONTAGEM:', contagem);
    alert(`🔍 DIAGNÓSTICO COMPLETO\n\n` + `💾 LOCALSTORAGE:\n` + `  Receitas: ${contagem.localStorage.receitas}\n` + `  Cartões: ${contagem.localStorage.cartoes}\n` + `  Fixos: ${contagem.localStorage.fixos}\n` + `  Variáveis: ${contagem.localStorage.variaveis}\n\n` + `☁️ FIRESTORE:\n` + `  Receitas: ${contagem.firestore?.receitas || 0}\n` + `  Cartões: ${contagem.firestore?.cartoes || 0}\n` + `  Fixos: ${contagem.firestore?.fixos || 0}\n` + `  Variáveis: ${contagem.firestore?.variaveis || 0}\n\n` + `⚛️ REACT (sendo usado agora):\n` + `  Receitas: ${contagem.react.receitas}\n` + `  Cartões: ${contagem.react.cartoes}\n` + `  Fixos: ${contagem.react.fixos}\n` + `  Variáveis: ${contagem.react.variaveis}\n\n` + `Veja o CONSOLE (F12) para detalhes completos!`);
  };

  // 🔍 DIAGNÓSTICO DE ANOS E MESES
  const diagnosticarAnos = () => {
    console.log('📊 RECEITAS:', receitas);
    console.log('💳 CARTÕES:', cartoes);
    console.log('🏠 FIXOS:', gastosFixos);
    console.log('🛒 VARIÁVEIS:', gastosVariaveis);
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
    console.log('📊 DIAGNÓSTICO COMPLETO:', diagnostico);

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
    console.log('📊 CONTAGEM POR ANO:', anos);

    // Verificar mês atual
    const janeiroAtual = {
      receitas: receitas.filter(r => r.mes === 'Janeiro' && r.ano === 2026).length,
      variaveis: gastosVariaveis.filter(g => g.mes === 'Janeiro' && g.ano === 2026).length
    };
    alert(`📊 DIAGNÓSTICO COMPLETO\n\n` + `📈 TOTAL DE LANÇAMENTOS:\n` + `  Receitas: ${totais.receitas}\n` + `  Cartões: ${totais.cartoes}\n` + `  Fixos: ${totais.fixos}\n` + `  Variáveis: ${totais.variaveis}\n\n` + `📅 EM JANEIRO/2026:\n` + `  Receitas: ${janeiroAtual.receitas}\n` + `  Variáveis: ${janeiroAtual.variaveis}\n\n` + `📊 DISTRIBUIÇÃO POR ANO:\n` + `RECEITAS: ${Object.entries(anos.receitas).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` + `CARTÕES: ${Object.entries(anos.cartoes).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` + `FIXOS: ${Object.entries(anos.fixos).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` + `VARIÁVEIS: ${Object.entries(anos.variaveis).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n\n` + `Veja o console (F12) para LISTA COMPLETA!`);
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
    console.log('Adicionando receita:', dados);
    const novaReceita = {
      id: Date.now(),
      categoria: dados.categoria,
      descricao: dados.descricao || '',
      valor: parseFloat(dados.valor),
      mes: mesAtual,
      ano: anoAtual,
      // ADICIONADO
      data: new Date().toLocaleDateString('pt-BR')
    };
    setReceitas([...receitas, novaReceita]);
    setModalAberto(null);
    alert('Receita adicionada com sucesso!');
  };
  const deletarReceita = id => {
    if (confirm('Tem certeza?')) {
      setReceitas(receitas.filter(r => r.id !== id));
    }
  };
  const editarReceita = async (id, dadosAtualizados) => {
    console.log('📝 editarReceita - ID:', id);
    console.log('📝 editarReceita - dadosAtualizados:', dadosAtualizados);
    console.log('📝 receitas atuais:', receitas);

    // Criar NOVA array para forçar re-render
    const novasReceitas = [];
    receitas.forEach(r => {
      if (r.id === id) {
        const receitaAtualizada = {
          ...r,
          ...dadosAtualizados,
          ano: parseInt(dadosAtualizados.ano) || r.ano || 2026,
          valor: parseFloat(dadosAtualizados.valor) || r.valor
        };
        console.log('✅ Receita ANTES:', r);
        console.log('✅ Receita DEPOIS:', receitaAtualizada);
        novasReceitas.push(receitaAtualizada);
      } else {
        novasReceitas.push(r);
      }
    });
    console.log('📋 NOVA lista de receitas:', novasReceitas);

    // Forçar atualização
    setReceitas([]);
    setTimeout(() => {
      setReceitas(novasReceitas);
    }, 10);

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
        console.log('💾 Salvando no Firestore...');
        await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
        console.log('✅ Salvo no Firestore com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao salvar no Firestore:', error);
        alert('⚠️ Dados atualizados localmente mas erro ao salvar na nuvem: ' + error.message);
      }
    }
    setItemEditando(null);
    setTipoEditando(null);
    setModalAberto(null);
    alert('✅ Receita atualizada! Verifique o badge.');
  };
  const duplicarReceita = receita => {
    const novaReceita = {
      ...receita,
      id: Date.now(),
      descricao: receita.descricao + ' (Cópia)'
    };
    setReceitas([...receitas, novaReceita]);
    alert('✅ Receita duplicada com sucesso!');
  };
  const adicionarPlanejado = dados => {
    const novoPlanejado = {
      id: Date.now(),
      mes: mesAtual,
      descricao: dados.descricao,
      valor: parseFloat(dados.valor),
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
          valor: parseFloat(valor) || 0
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
    const {
      jsPDF
    } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatorio Financeiro', 20, 20);
    doc.setFontSize(12);
    doc.text(`Mes: ${mesAtual}`, 20, 30);
    let y = 45;
    doc.text(`Cartoes: R$ ${totais.cartoes.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Gastos Fixos: R$ ${totais.fixos.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Gastos Variaveis: R$ ${totais.variaveis.toFixed(2)}`, 20, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: R$ ${totais.total.toFixed(2)}`, 20, y);
    doc.save(`relatorio-${mesAtual}.pdf`);
  };
  const exportarExcel = () => {
    const dados = [['Relatório Financeiro', mesAtual], [], ['Categoria', 'Valor'], ['Cartões', totais.cartoes], ['Gastos Fixos', totais.fixos], ['Gastos Variáveis', totais.variaveis], ['TOTAL', totais.total]];
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `relatorio-${mesAtual}.xlsx`);
  };
  const moverDadosEntreAnos = (anoOrigem, anoDestino) => {
    if (!confirm(`⚠️ Confirma MOVER todos os dados de ${anoOrigem} para ${anoDestino}?\n\nIsso vai:\n✅ Copiar cartões, receitas e gastos\n✅ Mover status de pagamentos\n⚠️ APAGAR dados de ${anoOrigem}`)) {
      return;
    }
    console.log(`🔄 Movendo dados de ${anoOrigem} para ${anoDestino}...`);

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
    console.log('✅ Migração concluída!');
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
    const valorParcela = valorTotal / parcelas;
    const indiceMesInicio = MESES.indexOf(mesInicio);
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
      meses: mesesCompra
    };
    console.log('💾 Salvando compra parcelada:', novaCompra);
    setComprasParceladas([...comprasParceladas, novaCompra]);
  };
  const excluirCompraParcelada = id => {
    if (confirm('Tem certeza que deseja excluir esta compra parcelada? Ela será removida de todos os meses.')) {
      setComprasParceladas(comprasParceladas.filter(c => c.id !== id));
    }
  };
  const calcularParcelasCartao = (nomeCartao, mes) => {
    return comprasParceladas.filter(c => c.cartao === nomeCartao && c.meses && c.meses.includes(mes)).map(c => ({
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
      console.log('Submit cartão:', {
        nome,
        vencimento,
        diaFechamento,
        limite
      });
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
            console.log(`📦 Criando parcela ${i + 1}/${totalParcelas}: ${mesParcela}/${anoAtualParcela}`);
            novasParcelas.push(novaParcela);
          }

          // ADICIONAR TODAS DE UMA VEZ
          setGastosFixos(prev => [...prev, ...novasParcelas]);
          console.log(`✅ Total de parcelas criadas: ${novasParcelas.length}`);
          setModalAberto(null);
          alert(`✅ ${novasParcelas.length} ${totalParcelas === 1 ? 'gasto temporário criado' : 'parcelas criadas'} com sucesso!`);
        } else {
          // Gasto fixo normal
          const novoGasto = {
            categoria: categoriaFinal,
            descricao,
            valor: parseFloat(valor),
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
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
    }, todasCategorias.map(cat => /*#__PURE__*/React.createElement("option", {
      key: cat,
      value: cat
    }, cat))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setMostrarNovaCategoria(true),
      className: "mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: e => setNovaCategoria(e.target.value),
      className: "w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500",
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
      className: "text-purple-600"
    }, "(base)")), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: descricao,
      onChange: e => setDescricao(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500",
      placeholder: temporario ? "Ex: IPVA 2026" : "Ex: Aluguel",
      required: true
    }), temporario && /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "\uD83D\uDCA1 Sistema adicionar\xE1 \" - 1/3\", \" - 2/3\", etc.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor ", temporario && /*#__PURE__*/React.createElement("span", {
      className: "text-purple-600"
    }, "(total)")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: e => setValor(e.target.value),
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500",
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
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "bg-purple-50 border-2 border-purple-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("label", {
      className: "flex items-center gap-2 cursor-pointer"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: temporario,
      onChange: e => setTemporario(e.target.checked),
      className: "w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
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
      className: "w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm",
      placeholder: "3",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "M\xEAs de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: mesInicio,
      onChange: e => setMesInicio(e.target.value),
      className: "w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
    }, mesesList.map((mes, idx) => /*#__PURE__*/React.createElement("option", {
      key: mes,
      value: mes
    }, mesesNomes[idx])))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "Ano de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: anoInicio,
      onChange: e => setAnoInicio(parseInt(e.target.value)),
      className: "w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
    }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => /*#__PURE__*/React.createElement("option", {
      key: ano,
      value: ano
    }, ano))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded p-3 text-xs space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-purple-700"
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
      className: "w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
    }, temporario ? `✅ Criar ${totalParcelas} Parcelas` : '✅ Adicionar Gasto Fixo'));
  };
  const FormNovoGastoVariavel = () => {
    const [categoria, setCategoria] = useState('MERCADO');
    const [novaCategoria, setNovaCategoria] = useState('');
    const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [mostrarNoFarol, setMostrarNoFarol] = useState(false);

    // Categorias padrão + personalizadas
    const categoriasVariaveisDefault = ['MERCADO', 'FARMÁCIA', 'ALIMENTAÇÃO', 'TRANSPORTE', 'GASOLINA', 'LAZER'];
    const todasCategorias = [...categoriasVariaveisDefault, ...categoriasPersonalizadas.gastosVariaveis];
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
    }, "\uD83D\uDEA6 Mostrar no Gestão de Pagamentos")), /*#__PURE__*/React.createElement("p", {
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
    const categoriasExtrasDefault = ['VIAGEM', 'PRESENTE', 'EMERGÊNCIA', 'MÉDICO', 'VETERINÁRIO', 'MANUTENÇÃO', 'REFORMA', 'FESTA'];
    const todasCategorias = [...categoriasExtrasDefault, ...(categoriasPersonalizadas.gastosExtras || [])];
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
          valor: parseFloat(valor),
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
    }, "\uD83D\uDEA6 Mostrar no Gestão de Pagamentos")), /*#__PURE__*/React.createElement("p", {
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
    }, "\uD83C\uDFE0 Or\xE7amento para Gastos Fixos"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: fixos,
      onChange: e => setFixos(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "5500.00"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCCA Or\xE7amento para Gastos Vari\xE1veis"), /*#__PURE__*/React.createElement("input", {
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
    const [cartao, setCartao] = useState(cartoes[0]?.nome || '');
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
          valorTotal: parseFloat(valorTotal),
          parcelas: parseInt(parcelas),
          mesInicio
        });
        setModalAberto(null);
        alert('✅ Compra parcelada adicionada com sucesso!');
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
    }, "\uD83D\uDCB3 ", c.nome)))), /*#__PURE__*/React.createElement("div", {
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
    const handleSubmit = e => {
      e.preventDefault();
      console.log('Submit receita:', {
        categoria,
        descricao,
        valor
      });
      if (valor) {
        adicionarReceita({
          categoria,
          descricao,
          valor
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
    window.__dashCtx = {
      totais, saldo, cartoes, gastosFixos, receitas,
      mesAtual, anoAtual, metaMensal, pagamentos,
      getStatusFarol,
    };
    return window.DashboardComponent ? window.DashboardComponent() : /*#__PURE__*/React.createElement('div', null, 'Carregando...');
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
        console.log('❌ DB ou User não disponível');
        return;
      }
      try {
        setLoading(true);
        console.log('📥 Carregando usuários do Firestore...');
        const usersSnapshot = await db.collection('usuarios').get();
        console.log('📊 Documentos retornados:', usersSnapshot.size);
        const usersList = [];
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('👤 Usuário:', doc.id, data);
          usersList.push({
            uid: doc.id,
            ...data
          });
        });
        console.log('📋 Total de usuários carregados:', usersList.length);

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
        console.log('📊 Estatísticas:', {
          total: usersList.length,
          pendentes,
          ativos,
          novos
        });
        setStats({
          total: usersList.length,
          pendentes: pendentes,
          ativos: ativos,
          novos: novos
        });
        setUsuarios(usersList);
        console.log('✅ Usuários carregados com sucesso!');
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
    console.log('🔐 TelaAdmin - isUserAdminProp:', isUserAdminProp);
    console.log('🔐 TelaAdmin - user:', user?.uid, user?.email);
    console.log('🔐 TelaAdmin - db:', db ? 'Conectado' : 'Desconectado');
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
      className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "text-xl font-bold mb-2"
    }, "\uD83D\uDC51 Painel de Administra\xE7\xE3o"), /*#__PURE__*/React.createElement("p", {
      className: "opacity-90"
    }, "Gerencie usu\xE1rios e visualize estat\xEDsticas do sistema")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        console.log('🔍 DIAGNÓSTICO COMPLETO:');
        console.log('• isUserAdmin:', isUserAdminProp);
        console.log('• user:', user);
        console.log('• db:', db);
        console.log('• usuarios.length:', usuarios.length);
        console.log('• stats:', stats);
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
      className: "bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\uD83C\uDD95 Novos (7 dias)"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-purple-600"
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
      className: `px-3 py-1 rounded-full text-xs font-semibold ${usuario.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`
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
  const TelaCartoes = () => {
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesNome  = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'};

    // CORREÇÃO: Verificar se estamos no mês atual para calcular "vencido"
    const dataAtual = new Date();
    const mesAtualSistema = mesesOrdem[dataAtual.getMonth()];
    const anoAtualSistema = dataAtual.getFullYear();
    const estamosNoMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
    const hoje = estamosNoMesAtual ? dataAtual.getDate() : -1;

    // Totais do mês
    const totaisPorCartao = {};
    let totalGeralMes = 0;
    cartoes.forEach(c => {
      const valoresAno = c.valores?.[anoAtual] || {};
      const valorBase  = valoresAno[mesAtual] || 0;
      const parcelas   = calcularParcelasCartao(c.nome, mesAtual);
      const valorParc  = parcelas.reduce((s,p) => s + p.valorParcela, 0);
      const total      = valorBase + valorParc;
      totaisPorCartao[c.nome] = { total, valorBase, valorParc, parcelas };
      totalGeralMes += total;
    });

    // Dívida acumulada total
    let totalDivida = 0;
    cartoes.forEach(c => {
      const valoresAno = c.valores?.[anoAtual] || {};
      mesesOrdem.forEach(mes => {
        const vb  = valoresAno[mes] || 0;
        const vp  = calcularParcelasCartao(c.nome, mes).reduce((s,p) => s + p.valorParcela, 0);
        const tot = vb + vp;
        const st  = getStatusFarol(c.nome, mes);
        if (st !== 'PAGO' && typeof st !== 'number') totalDivida += tot;
        else if (typeof st === 'number') totalDivida += Math.max(0, tot - st);
      });
    });

    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'240px 1fr 220px', gap:'16px', alignItems:'start'}},

      // ══════════════════════════════════════════════════════════════════
      // COLUNA ESQUERDA
      // ══════════════════════════════════════════════════════════════════
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},

        // Hero
        /*#__PURE__*/React.createElement("div", {
          style:{background:'linear-gradient(150deg,#0c4a6e,#0369a1,#0284c7)', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(3,105,161,0.45)', border:'1px solid rgba(125,211,252,0.2)'}
        },
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'8px'}}, "\uD83D\uDCB3 CART\xD5ES \xB7 " + mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.8rem', fontWeight:'900', lineHeight:1, marginBottom:'12px'}}, "R$ " + totalGeralMes.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:'12px'}},
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', opacity:0.5, marginBottom:'2px'}}, "Cart\xF5es"),
              /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800'}}, cartoes.length)
            ),
            /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', opacity:0.5, marginBottom:'2px'}}, "D\xEDvida acum."),
              /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', color: totalDivida > 0 ? '#fca5a5' : '#86efac'}}, "R$ " + totalDivida.toFixed(0))
            )
          )
        ),

        // Lista de navegação rápida
        cartoes.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'14px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'12px'}}, "\uD83C\uDFAF Navega\xE7\xE3o R\xE1pida"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'6px'}},
            ...cartoes.map(c => {
              const info = totaisPorCartao[c.nome] || {total:0};
              const st   = getStatusFarol(c.nome, mesAtual);
              const pago = st === 'PAGO';
              return /*#__PURE__*/React.createElement("button", {
                key:c.id,
                onClick: () => { const el = document.getElementById('cartao-'+c.nome); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); },
                style:{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', border:'none', borderRadius:'8px', cursor:'pointer', textAlign:'left', background: pago?'#f0fdf4':'#f8fafc', borderLeft: pago?'3px solid #059669':'3px solid #0284c7'}
              },
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'700', color: pago?'#059669':'#0284c7'}}, c.nome),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', fontWeight:'800', color: pago?'#059669':'#374151'}}, "R$ " + info.total.toFixed(0))
              );
            })
          )
        ),

        /*#__PURE__*/React.createElement("button", {
          onClick:()=>window.abrirModal('novoCartao'),
          style:{width:'100%', padding:'12px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#0284c7,#0369a1)', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(2,132,199,0.35)'}
        }, "\u2795 Novo Cart\xE3o")
      ),

      // ══════════════════════════════════════════════════════════════════
      // COLUNA CENTRAL - Cards dos cartões
      // ══════════════════════════════════════════════════════════════════
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'16px'}},

        cartoes.length === 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\uD83D\uDCB3"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'700', color:'#9ca3af', marginBottom:'20px'}}, "Nenhum cart\xE3o cadastrado"),
          /*#__PURE__*/React.createElement("button", {
            onClick:()=>window.abrirModal('novoCartao'),
            style:{padding:'11px 28px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#0284c7,#0369a1)', color:'#fff', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer'}
          }, "\u2795 Adicionar Primeiro Cart\xE3o")
        ),

        ...cartoes.map(cartao => {
          const valoresAno = cartao.valores?.[anoAtual] || {};
          const valorBase  = valoresAno[mesAtual] || 0;
          const parcelas   = calcularParcelasCartao(cartao.nome, mesAtual);
          const valorParc  = parcelas.reduce((s,p) => s + p.valorParcela, 0);
          const valorTotal = valorBase + valorParc;
          const limite     = cartao.limite || 0;

          // Status da fatura
          const fech = cartao.diaFechamento || cartao.vencimento - 7;
          
          // Verificar se foi pago no farol
          const chaveStatusFarol = cartao.nome + '-' + mesAtual + '-' + anoAtual;
          const statusPagamento = getStatusFarol(cartao.nome, mesAtual);
          const estaPago = statusPagamento === 'PAGO';
          
          // Determinar status da fatura
          let statusFat;
          if (estaPago) {
            statusFat = 'PAGA'; // Se está marcado como pago no farol
          } else if (estamosNoMesAtual) {
            statusFat = hoje <= fech ? 'ABERTA' : hoje <= cartao.vencimento ? 'FECHADA' : 'VENCIDA';
          } else {
            statusFat = 'ABERTA'; // Meses futuros/passados não pagos
          }
          
          const corStatus = statusFat==='PAGA' ? {bg:'#d1fae5',txt:'#065f46'} : statusFat==='ABERTA' ? {bg:'#dbeafe',txt:'#1e40af'} : statusFat==='FECHADA' ? {bg:'#fef3c7',txt:'#92400e'} : {bg:'#fecdd3',txt:'#be123c'};

          // Limite usado (simplificado)
          let totalUsado = 0, totalPago = 0;
          mesesOrdem.forEach(mes => {
            const vb = valoresAno[mes] || 0;
            const vp = calcularParcelasCartao(cartao.nome, mes).reduce((s,p) => s + p.valorParcela, 0);
            totalUsado += vb + vp;
            const st = getStatusFarol(cartao.nome, mes);
            if (st === 'PAGO') totalPago += vb + vp;
            else if (typeof st === 'number') totalPago += st;
          });
          const usado      = Math.max(0, totalUsado - totalPago);
          const disponivel = limite > 0 ? Math.max(0, limite - usado) : 0;
          const pctLimite  = limite > 0 ? Math.min(100, usado/limite*100) : 0;

          return /*#__PURE__*/React.createElement("div", {
            key:cartao.id, id:'cartao-'+cartao.nome,
            style:{background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}
          },

            // Header
            /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center'}},
              /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem', fontWeight:'800', color:'#111827', marginBottom:'4px'}}, cartao.nome),
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'12px', fontSize:'0.7rem', color:'#9ca3af'}},
                  /*#__PURE__*/React.createElement("span", null, "Fecha dia " + (fech)),
                  /*#__PURE__*/React.createElement("span", null, "\u2022"),
                  /*#__PURE__*/React.createElement("span", null, "Vence dia " + cartao.vencimento),
                  /*#__PURE__*/React.createElement("span", {style:{padding:'2px 8px', borderRadius:'12px', fontSize:'0.65rem', fontWeight:'700', background:corStatus.bg, color:corStatus.txt}}, statusFat)
                )
              ),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'6px'}},
                /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(cartao);setTipoEditando('cartao');setModalAberto('editar');}, style:{width:'30px',height:'30px',border:'none',borderRadius:'8px',background:'#eff6ff',color:'#3b82f6',cursor:'pointer',fontSize:'0.78rem',display:'flex',alignItems:'center',justifyContent:'center'}}, "\u270F\uFE0F"),
                /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarCartao(cartao), style:{width:'30px',height:'30px',border:'none',borderRadius:'8px',background:'#faf5ff',color:'#8b5cf6',cursor:'pointer',fontSize:'0.78rem',display:'flex',alignItems:'center',justifyContent:'center'}}, "\uD83D\uDCCB"),
                /*#__PURE__*/React.createElement("button", {onClick:()=>deletarCartao(cartao.id), style:{width:'30px',height:'30px',border:'none',borderRadius:'8px',background:'#fff1f2',color:'#f43f5e',cursor:'pointer',fontSize:'0.78rem',display:'flex',alignItems:'center',justifyContent:'center'}}, "\uD83D\uDDD1\uFE0F")
              )
            ),

            // Grid 2 colunas: Fatura + Limite
            /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}},

              // Fatura do mês
              /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83D\uDCB5 Fatura " + mesAtual.toUpperCase()),
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'8px'}},
                  /*#__PURE__*/React.createElement("input", {
                    type:"number", step:"0.01", value:valorBase,
                    onChange:e=>editarValorCartao(cartao.id, mesAtual, e.target.value),
                    placeholder:"Base",
                    style:{width:'100px', padding:'6px 8px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.82rem', textAlign:'right', outline:'none'}
                  }),
                  valorParc > 0 && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', color:'#9ca3af'}}, "+ R$ " + valorParc.toFixed(0))
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.6rem', fontWeight:'900', color:'#0284c7'}}, "R$ " + valorTotal.toFixed(2)),
                parcelas.length > 0 && /*#__PURE__*/React.createElement("div", {style:{marginTop:'10px', fontSize:'0.68rem', color:'#64748b'}},
                  parcelas.length + " parcela" + (parcelas.length>1?"s":"") + " ativa" + (parcelas.length>1?"s":"")
                )
              ),

              // Limite
              /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83C\uDFAF Limite"),
                limite > 0
                  ? /*#__PURE__*/React.createElement("div", null,
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:'8px'}},
                        /*#__PURE__*/React.createElement("span", {style:{color:'#64748b'}}, "Usado"),
                        /*#__PURE__*/React.createElement("span", {style:{fontWeight:'800', color: pctLimite>80?'#ef4444':pctLimite>60?'#f59e0b':'#374151'}}, "R$ " + usado.toFixed(0))
                      ),
                      /*#__PURE__*/React.createElement("div", {style:{height:'8px', background:'#f1f5f9', borderRadius:'4px', overflow:'hidden', marginBottom:'10px'}},
                        /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:pctLimite+'%', background: pctLimite>80?'#ef4444':pctLimite>60?'#f59e0b':'#0284c7', borderRadius:'4px', transition:'width .6s ease'}})
                      ),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', fontSize:'0.78rem'}},
                        /*#__PURE__*/React.createElement("span", {style:{color:'#64748b'}}, "Dispon\xEDvel"),
                        /*#__PURE__*/React.createElement("span", {style:{fontWeight:'800', color:'#059669'}}, "R$ " + disponivel.toFixed(0))
                      )
                    )
                  : /*#__PURE__*/React.createElement("div", null,
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:'#9ca3af', marginBottom:'12px'}}, "Limite n\xE3o definido"),
                      /*#__PURE__*/React.createElement("button", {
                        onClick:()=>{ const v=prompt('Limite do cart\xE3o:','10000'); if(v&&!isNaN(v)){ const n=cartoes.map(c=>c.id===cartao.id?{...c,limite:parseFloat(v)}:c); setCartoes(n); localStorage.setItem('cartoes',JSON.stringify(n)); } },
                        style:{fontSize:'0.75rem', padding:'6px 14px', border:'none', borderRadius:'8px', background:'#0284c7', color:'#fff', cursor:'pointer', fontWeight:'600'}
                      }, "\u2795 Definir")
                    )
              )
            ),

            // Parcelas ativas expandidas
            parcelas.length > 0 && /*#__PURE__*/React.createElement("div", {style:{padding:'0 20px 16px', borderTop:'1px solid #f9fafb', paddingTop:'14px'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83D\uDCE6 Parcelas Ativas"),
              /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'8px'}},
                ...parcelas.map((p,i) =>
                  /*#__PURE__*/React.createElement("div", {key:i, style:{padding:'8px 10px', background:'#f8fafc', borderRadius:'8px', border:'1px solid #e5e7eb'}},
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', fontWeight:'700', color:'#374151', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}, p.descricao),
                    /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
                      /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.68rem', color:'#9ca3af'}}, p.parcelaAtual + "/" + p.totalParcelas),
                      /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', fontWeight:'800', color:'#0284c7'}}, "R$ " + p.valorParcela.toFixed(0))
                    )
                  )
                )
              )
            )
          );
        })
      ),

      // ══════════════════════════════════════════════════════════════════
      // COLUNA DIREITA - Resumos e contexto
      // ══════════════════════════════════════════════════════════════════
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},

        // Próximos vencimentos
        cartoes.filter(c=>{
          const st = getStatusFarol(c.nome, mesAtual);
          return st !== 'PAGO' && totaisPorCartao[c.nome]?.total > 0;
        }).length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'14px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'12px'}}, "\u23F0 Pr\xF3ximos Vencimentos"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'8px'}},
            ...cartoes
              .filter(c=>{const st=getStatusFarol(c.nome,mesAtual); return st!=='PAGO' && totaisPorCartao[c.nome]?.total>0;})
              .sort((a,b)=>a.vencimento-b.vencimento)
              .map(c => {
                const diasRestantes = estamosNoMesAtual ? c.vencimento - hoje : 999; // 999 = não mostrar alerta se não for mês atual
                const info = totaisPorCartao[c.nome];
                return /*#__PURE__*/React.createElement("div", {key:c.id, style:{padding:'8px 10px', borderRadius:'8px', background: diasRestantes<=3?'#fff1f2':diasRestantes<=7?'#fffbeb':'#f9fafb', border:'1px solid '+(diasRestantes<=3?'#fecdd3':diasRestantes<=7?'#fde68a':'#f3f4f6')}},
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', marginBottom:'3px'}},
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'700', color:'#111827'}}, c.nome),
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', fontWeight:'800', color:'#0284c7'}}, "R$ " + info.total.toFixed(0))
                  ),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', color: diasRestantes===0?'#ef4444':diasRestantes<=3?'#f59e0b':'#9ca3af'}},
                    estamosNoMesAtual ? (
                      diasRestantes === 0 ? "Vence HOJE!" : diasRestantes < 0 ? "Vencido h\xE1 " + Math.abs(diasRestantes) + " dias" : "Vence em " + diasRestantes + " dia" + (diasRestantes>1?"s":"")
                    ) : (
                      "Vence dia " + c.vencimento
                    )
                  )
                );
              })
          )
        ),

        // % do total despesas
        totais.total > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#dbeafe,#bfdbfe)', borderRadius:'14px', padding:'14px', border:'1px solid #93c5fd'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#1e40af', marginBottom:'10px'}}, "\uD83D\uDCCA % do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#0c4a6e', marginBottom:'6px'}}, (totalGeralMes/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:'rgba(255,255,255,0.6)', borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalGeralMes/totais.total*100)+'%', background:'linear-gradient(90deg,#3b82f6,#2563eb)', borderRadius:'3px', transition:'width .6s ease'}})
          ),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#1e40af', marginTop:'6px'}}, "de R$ " + totais.total.toLocaleString('pt-BR',{minimumFractionDigits:2}) + " total")
        ),

        // Dívida total alert
        totalDivida > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#fff1f2,#ffe4e6)', borderRadius:'14px', padding:'14px', border:'1px solid #fecdd3'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#be123c', marginBottom:'10px'}}, "\uD83D\uDD34 D\xEDvida Acumulada"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#9f1239', marginBottom:'6px'}}, "R$ " + totalDivida.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#be123c'}}, "Valor n\xE3o pago no ano")
        )
      )
    );
  };

  const TelaGastosFixos = ({setModalAberto}) => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

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
    const gastosFiltrados = categoriaFiltro==='TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria===categoriaFiltro);
    const totalFiltrado = gastosFiltrados.reduce((s,g) => s+g.valor, 0);

    // Agrupar por vencimento
    const porDia = {};
    gastosFiltrados.forEach(g => {
      const dia = g.vencimento || 1;
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(g);
    });
    const diasOrdenados = Object.keys(porDia).sort((a,b) => parseInt(a)-parseInt(b));
    const hoje = estamosNoMesAtual ? dataAtual.getDate() : -1;

    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'200px 1fr', gap:'16px', alignItems:'start'}},

      // COLUNA ESQUERDA — totais + filtro
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},

        // Hero total
        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(150deg,#4c1d95,#6d28d9,#7c3aed)', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(109,40,217,0.4)', border:'1px solid rgba(255,255,255,0.1)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, "\uD83C\uDFE0 FIXOS \xB7 "+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.9rem', fontWeight:'900', marginBottom:'4px', lineHeight:1}}, "R$ "+totalGeral.toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', opacity:0.65}}, gastosDoMes.length+" gasto"+(gastosDoMes.length!==1?"s":"")+" fixo"+(gastosDoMes.length!==1?"s":""))
        ),

        // % do total de despesas
        totais.total>0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'12px', padding:'14px', border:'1px solid #e5e7eb'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'8px'}}, "\uD83D\uDCCA Do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#6d28d9', marginBottom:'6px'}}, (totalGeral/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalGeral/totais.total*100)+'%', background:'linear-gradient(90deg,#8b5cf6,#a78bfa)', borderRadius:'3px', transition:'width .6s ease'}})
          )
        ),

        // Filtro por categoria
        /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'12px', padding:'14px', border:'1px solid #e5e7eb'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83C\uDFF7\uFE0F Categorias"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'5px'}},
            ...categorias.map(cat =>
              /*#__PURE__*/React.createElement("button", {
                key:cat,
                onClick:()=>setCategoriaFiltro(cat),
                style:{
                  width:'100%', padding:'7px 10px', border:'none', borderRadius:'8px', cursor:'pointer',
                  textAlign:'left', fontSize:'0.75rem', fontWeight:'600',
                  background: categoriaFiltro===cat?'#ede9fe':'transparent',
                  color:       categoriaFiltro===cat?'#6d28d9':'#6b7280',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }
              },
                /*#__PURE__*/React.createElement("span", null, cat==='TODAS'?'Todas':cat),
                cat!=='TODAS' && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.7rem', fontWeight:'700', color:categoriaFiltro===cat?'#6d28d9':'#9ca3af'}},
                  "R$ "+(totaisPorCat[cat]||0).toFixed(0)
                )
              )
            )
          )
        ),

        // Botões de ação
        /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('novoGastoFixo'), onclick:"window.abrirModal('novoGastoFixo')", style:{width:'100%', padding:'12px', border:'none', borderRadius:'12px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(124,58,237,0.35)'}}, "\u2795 Novo Gasto Fixo"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('gerenciarCategorias'), style:{width:'100%', padding:'10px', border:'2px solid #e5e7eb', borderRadius:'12px', background:'#fff', color:'#6b7280', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer'}}, "\uD83C\uDFF7\uFE0F Gerenciar Categorias")
      ),

      // COLUNA DIREITA — lista por vencimento
      /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},

        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:'#111827'}}, categoriaFiltro==='TODAS'?"Todos os Gastos Fixos":"Gastos Fixos \xB7 "+categoriaFiltro),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}}, gastosFiltrados.length+" item"+(gastosFiltrados.length!==1?"s":"")+" \xB7 ordenados por vencimento")
          ),
          /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.1rem', color:'#6d28d9'}}, "R$ "+totalFiltrado.toFixed(2))
        ),

        gastosFiltrados.length===0
          ? /*#__PURE__*/React.createElement("div", {style:{padding:'50px 20px', textAlign:'center'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\uD83C\uDFE0"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:'#9ca3af', marginBottom:'6px'}}, "Nenhum gasto fixo"),
              /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('novoGastoFixo'), style:{padding:'9px 22px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer'}}, "\u2795 Adicionar")
            )
          : /*#__PURE__*/React.createElement("div", {style:{maxHeight:'580px', overflowY:'auto'}},
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
                      background: isHoje?'#ede9fe':'#f9fafb',
                      borderBottom:'1px solid #f3f4f6'
                    }
                  },
                    /*#__PURE__*/React.createElement("div", {style:{width:'48px', textAlign:'center', flexShrink:0}},
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'700', color: isHoje?'#7c3aed':'#9ca3af', textTransform:'uppercase'}}, diaSemana),
                      /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color: isHoje?'#6d28d9':'#374151', lineHeight:1.1}}, dia),
                      isHoje && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.55rem', fontWeight:'800', color:'#7c3aed', textTransform:'uppercase'}}, "Hoje")
                    ),
                    /*#__PURE__*/React.createElement("div", {style:{flex:1}}),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', fontWeight:'700', color: isHoje?'#6d28d9':'#6b7280'}},
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
                          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.82rem', fontWeight:'700', color:'#111827'}}, gasto.descricao),
                          gasto.temporario && gasto.totalParcelas && /*#__PURE__*/React.createElement("span", {style:{padding:'2px 8px', borderRadius:'20px', background:'#ede9fe', color:'#6d28d9', fontSize:'0.65rem', fontWeight:'700'}}, (gasto.parcelaAtual||1)+"/"+gasto.totalParcelas)
                        ),
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#9ca3af', marginTop:'2px'}}, gasto.categoria)
                      ),
                      /*#__PURE__*/React.createElement("input", {
                        type:"number", step:"0.01", value:gasto.valor,
                        onChange:e=>editarValorGastoFixo(gasto.id,e.target.value),
                        style:{width:'88px', padding:'5px 8px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.82rem', fontWeight:'700', textAlign:'right', outline:'none'}
                      }),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px'}},
                        /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(gasto);setTipoEditando('fixo');setModalAberto('editar');}, style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\u270F\uFE0F"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarGastoFixo(gasto), style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#faf5ff', color:'#8b5cf6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDCCB"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>deletarGastoFixo(gasto.id), style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDDD1\uFE0F")
                      )
                    )
                  )
                );
              })
            ),

        gastosFiltrados.length>1 && /*#__PURE__*/React.createElement("div", {style:{padding:'12px 20px', borderTop:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa'}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:'#6b7280'}}, "Total \xB7 "+gastosFiltrados.length+" gastos"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#6d28d9'}}, "R$ "+totalFiltrado.toFixed(2))
        )
      )
    );
  };

  const TelaGastosVariaveis = ({setModalAberto}) => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    
    // CORREÇÃO: Verificar se estamos no mês atual
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const dataAtual = new Date();
    const mesAtualSistema = mesesOrdem[dataAtual.getMonth()];
    const anoAtualSistema = dataAtual.getFullYear();
    const estamosNoMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
    
    const gastosDoMes = gastosVariaveis.filter(g => g.mes===mesAtual && g.ano===anoAtual);
    const totaisPorCat = {};
    gastosDoMes.forEach(g => { totaisPorCat[g.categoria] = (totaisPorCat[g.categoria]||0) + g.valor; });
    const totalMes = gastosDoMes.reduce((s,g) => s+g.valor, 0);
    const gastosFiltrados = categoriaFiltro==='TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria===categoriaFiltro);
    const totalFiltrado = gastosFiltrados.reduce((s,g) => s+g.valor, 0);
    const categorias = ['TODAS', ...Object.keys(totaisPorCat).sort((a,b)=>totaisPorCat[b]-totaisPorCat[a])];

    // Agrupar por data
    const porData = {};
    gastosFiltrados.forEach(g => {
      const key = g.dataCompleta||g.data||'Sem data';
      if (!porData[key]) porData[key] = [];
      porData[key].push(g);
    });
    const datasOrdenadas = Object.keys(porData).sort((a,b)=>a==='Sem data'?1:b==='Sem data'?-1:b.localeCompare(a));
    const hoje = estamosNoMesAtual ? dataAtual : null;

    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'200px 1fr', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},

        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(150deg,#7c2d12,#c2410c,#ea580c)', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(194,65,12,0.4)', border:'1px solid rgba(255,255,255,0.1)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, "\uD83D\uDCCA VARI\xC1VEIS \xB7 "+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.9rem', fontWeight:'900', marginBottom:'4px', lineHeight:1}}, "R$ "+totalMes.toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', opacity:0.65}}, gastosDoMes.length+" gasto"+(gastosDoMes.length!==1?"s":""))
        ),

        totais.total>0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'12px', padding:'14px', border:'1px solid #e5e7eb'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'8px'}}, "\uD83D\uDCCA Do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#c2410c', marginBottom:'6px'}}, (totalMes/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalMes/totais.total*100)+'%', background:'linear-gradient(90deg,#f97316,#fb923c)', borderRadius:'3px', transition:'width .6s ease'}})
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'12px', padding:'14px', border:'1px solid #e5e7eb'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83C\uDFF7\uFE0F Categorias"),
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

        /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('novoGastoVariavel'), style:{width:'100%', padding:'12px', border:'none', borderRadius:'12px', background:'linear-gradient(135deg,#ea580c,#c2410c)', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(234,88,12,0.35)'}}, "\u2795 Novo Gasto Vari\xE1vel"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('gerenciarCategorias'), style:{width:'100%', padding:'10px', border:'2px solid #e5e7eb', borderRadius:'12px', background:'#fff', color:'#6b7280', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer'}}, "\uD83C\uDFF7\uFE0F Gerenciar Categorias")
      ),

      /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:'#111827'}}, categoriaFiltro==='TODAS'?"Todos os Gastos Vari\xE1veis":"Gastos \xB7 "+categoriaFiltro),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}}, gastosFiltrados.length+" gasto"+(gastosFiltrados.length!==1?"s":"")+" \xB7 mais recentes primeiro")
          ),
          gastosFiltrados.length>0 && /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.1rem', color:'#c2410c'}}, "R$ "+totalFiltrado.toFixed(2))
        ),

        gastosFiltrados.length===0
          ? /*#__PURE__*/React.createElement("div", {style:{padding:'50px 20px', textAlign:'center'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\uD83D\uDCCA"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:'#9ca3af', marginBottom:'6px'}}, categoriaFiltro==='TODAS'?"Nenhum gasto vari\xE1vel em "+mesAtual:"Nenhum gasto em "+categoriaFiltro),
              /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('novoGastoVariavel'), style:{padding:'9px 22px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#ea580c,#c2410c)', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer'}}, "\u2795 Adicionar")
            )
          : /*#__PURE__*/React.createElement("div", {style:{maxHeight:'560px', overflowY:'auto'}},
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
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'12px', padding:'10px 20px', background:isHoje?'#fff7ed':'#f9fafb', borderBottom:'1px solid #f3f4f6'}},
                    dataKey!=='Sem data'
                      ? /*#__PURE__*/React.createElement("div", {style:{width:'48px', textAlign:'center', flexShrink:0}},
                          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem', fontWeight:'700', color:isHoje?'#c2410c':'#9ca3af', textTransform:'uppercase'}}, diaSemana),
                          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:isHoje?'#c2410c':'#374151', lineHeight:1.1}}, diaNum),
                          isHoje && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.55rem', fontWeight:'800', color:'#c2410c', textTransform:'uppercase'}}, "Hoje")
                        )
                      : /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.72rem', fontWeight:'700', color:'#9ca3af'}}, "Sem data"),
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
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.82rem', fontWeight:'700', color:'#111827'}}, gasto.descricao||'Sem descri\xE7\xE3o'),
                        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#9ca3af', marginTop:'2px'}}, gasto.categoria)
                      ),
                      /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', fontSize:'0.9rem', color:'#c2410c', flexShrink:0, marginRight:'8px'}}, "R$ "+gasto.valor.toFixed(2)),
                      /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px'}},
                        /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(gasto);setTipoEditando('variavel');setModalAberto('editar');}, style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\u270F\uFE0F"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarGastoVariavel(gasto), style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#faf5ff', color:'#8b5cf6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDCCB"),
                        /*#__PURE__*/React.createElement("button", {onClick:()=>deletarGastoVariavel(gasto.id), style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDDD1\uFE0F")
                      )
                    )
                  )
                );
              })
            ),

        gastosFiltrados.length>1 && /*#__PURE__*/React.createElement("div", {style:{padding:'12px 20px', borderTop:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa'}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:'#6b7280'}}, "Total \xB7 "+gastosFiltrados.length+" gastos"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#c2410c'}}, "R$ "+totalFiltrado.toFixed(2))
        )
      )
    );
  };

  const TelaGastosExtras = ({setModalAberto}) => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const gastosDoMes = gastosExtras.filter(g => g.mes===mesAtual && g.ano===anoAtual);
    const totaisPorCat = {};
    gastosDoMes.forEach(g => { totaisPorCat[g.categoria] = (totaisPorCat[g.categoria]||0) + g.valor; });
    const totalMes = gastosDoMes.reduce((s,g) => s+g.valor, 0);
    const gastosFiltrados = categoriaFiltro==='TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria===categoriaFiltro);
    const totalFiltrado = gastosFiltrados.reduce((s,g) => s+g.valor, 0);
    const categorias = ['TODAS', ...Object.keys(totaisPorCat).sort((a,b)=>totaisPorCat[b]-totaisPorCat[a])];
    const sortedGastos = [...gastosFiltrados].sort((a,b) => (b.data||'').localeCompare(a.data||''));

    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'200px 1fr', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},

        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(150deg,#78350f,#b45309,#d97706)', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(180,83,9,0.4)', border:'1px solid rgba(255,255,255,0.1)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'10px'}}, "\u26A1 EXTRAS \xB7 "+mesAtual.toUpperCase()),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.9rem', fontWeight:'900', marginBottom:'4px', lineHeight:1}}, "R$ "+totalMes.toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', opacity:0.65}}, gastosDoMes.length+" gasto"+(gastosDoMes.length!==1?"s":"")+" extra"+(gastosDoMes.length!==1?"s":""))
        ),

        totais.total>0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'12px', padding:'14px', border:'1px solid #e5e7eb'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'8px'}}, "\uD83D\uDCCA Do Total de Despesas"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#b45309', marginBottom:'6px'}}, (totalMes/totais.total*100).toFixed(0)+"%"),
          /*#__PURE__*/React.createElement("div", {style:{height:'5px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden'}},
            /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalMes/totais.total*100)+'%', background:'linear-gradient(90deg,#d97706,#fbbf24)', borderRadius:'3px', transition:'width .6s ease'}})
          )
        ),

        Object.keys(totaisPorCat).length>0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'12px', padding:'14px', border:'1px solid #e5e7eb'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.2px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83C\uDFF7\uFE0F Categorias"),
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

        /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('novoGastoExtra'), style:{width:'100%', padding:'12px', border:'none', borderRadius:'12px', background:'linear-gradient(135deg,#d97706,#b45309)', color:'#fff', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(217,119,6,0.35)'}}, "\u2795 Novo Gasto Extra"),
        /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('gerenciarCategorias'), style:{width:'100%', padding:'10px', border:'2px solid #e5e7eb', borderRadius:'12px', background:'#fff', color:'#6b7280', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer'}}, "\uD83C\uDFF7\uFE0F Gerenciar Categorias")
      ),

      /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
        /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:'#111827'}}, categoriaFiltro==='TODAS'?"Todos os Gastos Extras":"Gastos \xB7 "+categoriaFiltro),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}}, gastosFiltrados.length+" item"+(gastosFiltrados.length!==1?"s":""))
          ),
          gastosFiltrados.length>0 && /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.1rem', color:'#b45309'}}, "R$ "+totalFiltrado.toFixed(2))
        ),

        gastosFiltrados.length===0
          ? /*#__PURE__*/React.createElement("div", {style:{padding:'50px 20px', textAlign:'center'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\u26A1"),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:'#9ca3af', marginBottom:'6px'}}, categoriaFiltro==='TODAS'?"Nenhum gasto extra em "+mesAtual:"Nenhum gasto em "+categoriaFiltro),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:'#d1d5db', marginBottom:'18px'}}, "Registre compras pontuais, surpresas ou gastos imprevistos"),
              /*#__PURE__*/React.createElement("button", {onClick:()=>window.abrirModal('novoGastoExtra'), style:{padding:'9px 22px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#d97706,#b45309)', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer'}}, "\u2795 Adicionar")
            )
          : /*#__PURE__*/React.createElement("div", {style:{maxHeight:'560px', overflowY:'auto'}},
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
                      /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem', fontWeight:'700', color:'#111827'}}, gasto.categoria),
                      gasto.descricao && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.73rem', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px'}}, "\xB7 "+gasto.descricao)
                    ),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#d1d5db'}}, gasto.data||'')
                  ),
                  /*#__PURE__*/React.createElement("div", {style:{fontWeight:'800', fontSize:'0.92rem', color:'#b45309', flexShrink:0, marginRight:'8px'}}, "R$ "+gasto.valor.toFixed(2)),
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px', flexShrink:0}},
                    /*#__PURE__*/React.createElement("button", {onClick:()=>{setItemEditando(gasto);setTipoEditando('extra');setModalAberto('editar');}, style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\u270F\uFE0F"),
                    /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarGastoExtra(gasto), style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#faf5ff', color:'#8b5cf6', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDCCB"),
                    /*#__PURE__*/React.createElement("button", {onClick:()=>deletarGastoExtra(gasto.id), style:{width:'28px', height:'28px', border:'none', borderRadius:'7px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDDD1\uFE0F")
                  )
                )
              )
            ),

        gastosFiltrados.length>1 && /*#__PURE__*/React.createElement("div", {style:{padding:'12px 20px', borderTop:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa'}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:'#6b7280'}}, "Total \xB7 "+gastosFiltrados.length+" gastos"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#b45309'}}, "R$ "+totalFiltrado.toFixed(2))
        )
      )
    );
  };

  const TelaReceitas = () => {
    const mesesOrdem = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesNome  = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'};
    const catIcone   = {'Salário':'💼','Freelance':'🖥️','Investimento':'📈','Aluguel':'🏠','Bônus':'🎯','13º Salário':'🎁','Pensão':'👨‍👩‍👧','Outros':'💰'};

    const receitasDoMes = receitas.filter(r => r.mes === mesAtual && r.ano === anoAtual);
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

    return /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'240px 1fr 220px', gap:'16px', alignItems:'start'}},

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},

        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(150deg,#064e3b 0%,#065f46 60%,#047857 100%)', borderRadius:'16px', padding:'22px', color:'#fff', boxShadow:'0 6px 28px rgba(6,78,59,0.4)', border:'1px solid rgba(16,185,129,0.25)'}},
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

        /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83D\uDCC5 Acumulado " + anoAtual),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#065f46'}}, "R$ " + totalAno.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'3px'}}, receitasAno.length + " lan\xE7amentos no ano")
        ),

        catList.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'14px'}}, "\uD83E\uDD67 Por Categoria"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'11px'}},
            ...catList.map(([cat, val]) =>
              /*#__PURE__*/React.createElement("div", {key:cat},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', marginBottom:'4px', alignItems:'center'}},
                  /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'6px'}},
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem'}}, catIcone[cat] || '\uD83D\uDCB0'),
                    /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:'#374151'}}, cat)
                  ),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', fontWeight:'800', color:'#065f46'}}, (totalMes > 0 ? val/totalMes*100 : 0).toFixed(0) + "%")
                ),
                /*#__PURE__*/React.createElement("div", {style:{height:'4px', background:'#f0fdf4', borderRadius:'2px', overflow:'hidden'}},
                  /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:(totalMes > 0 ? val/totalMes*100 : 0)+'%', background:'linear-gradient(90deg,#10b981,#34d399)', borderRadius:'2px', transition:'width .6s ease'}})
                )
              )
            )
          )
        ),

        /*#__PURE__*/React.createElement("button", {
          onClick: () => setModalAberto('novaReceita'),
          style:{width:'100%', padding:'13px', border:'none', borderRadius:'12px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontSize:'0.83rem', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 14px rgba(16,185,129,0.35)', letterSpacing:'0.3px'}
        }, "\u2795 Nova Receita")
      ),

      /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
        /*#__PURE__*/React.createElement("div", {style:{padding:'18px 22px', borderBottom:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center'}},
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:'#111827'}}, "Receitas de " + mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}}, receitasDoMes.length === 0 ? "Nenhum lan\xE7amento ainda" : receitasDoMes.length + " " + (receitasDoMes.length === 1 ? "lan\xE7amento" : "lan\xE7amentos"))
          ),
          receitasDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'1.15rem', color:'#10b981'}}, "R$ " + totalMes.toLocaleString('pt-BR',{minimumFractionDigits:2}))
        ),

        receitasDoMes.length === 0 && /*#__PURE__*/React.createElement("div", {style:{padding:'60px 20px', textAlign:'center'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, "\uD83D\uDCB0"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'700', color:'#9ca3af', marginBottom:'6px'}}, "Nenhuma receita em " + mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:'#d1d5db', marginBottom:'22px'}}, "Registre sal\xE1rio, freelance, b\xF4nus ou qualquer entrada"),
          /*#__PURE__*/React.createElement("button", {
            onClick: () => setModalAberto('novaReceita'),
            style:{padding:'10px 26px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer', boxShadow:'0 3px 10px rgba(16,185,129,0.3)'}
          }, "\u2795 Registrar Receita")
        ),

        receitasDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {style:{maxHeight:'500px', overflowY:'auto'}},
          ...receitasDoMes.sort((a,b) => (b.data||'').localeCompare(a.data||'')).map((receita, idx) =>
            /*#__PURE__*/React.createElement("div", {
              key: receita.id,
              style:{display:'flex', alignItems:'center', gap:'14px', padding:'13px 22px', borderBottom: idx < receitasDoMes.length-1 ? '1px solid #f9fafb' : 'none', transition:'background .15s'},
              onMouseEnter: e => { e.currentTarget.style.background = '#fafafa'; },
              onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; }
            },
              /*#__PURE__*/React.createElement("div", {style:{width:'42px', height:'42px', borderRadius:'11px', background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.15rem', border:'1px solid #d1fae5'}}, catIcone[receita.categoria] || '\uD83D\uDCB0'),
              /*#__PURE__*/React.createElement("div", {style:{flex:1, minWidth:0}},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.85rem', fontWeight:'700', color:'#111827'}}, receita.categoria),
                  receita.descricao && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.73rem', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px'}}, "\xB7 " + receita.descricao)
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem', color:'#d1d5db'}}, receita.data || '')
              ),
              /*#__PURE__*/React.createElement("div", {style:{fontWeight:'900', fontSize:'0.95rem', color:'#059669', flexShrink:0, marginRight:'8px'}}, "R$ " + receita.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px', flexShrink:0}},
                /*#__PURE__*/React.createElement("button", {onClick:()=>{ setItemEditando(receita); setTipoEditando('receita'); setModalAberto('editar'); }, title:"Editar", style:{width:'30px', height:'30px', border:'none', borderRadius:'8px', background:'#eff6ff', color:'#3b82f6', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\u270F\uFE0F"),
                /*#__PURE__*/React.createElement("button", {onClick:()=>duplicarReceita(receita), title:"Duplicar", style:{width:'30px', height:'30px', border:'none', borderRadius:'8px', background:'#faf5ff', color:'#8b5cf6', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDCCB"),
                /*#__PURE__*/React.createElement("button", {onClick:()=>deletarReceita(receita.id), title:"Excluir", style:{width:'30px', height:'30px', border:'none', borderRadius:'8px', background:'#fff1f2', color:'#f43f5e', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center'}}, "\uD83D\uDDD1\uFE0F")
              )
            )
          )
        ),

        receitasDoMes.length > 1 && /*#__PURE__*/React.createElement("div", {style:{padding:'13px 22px', borderTop:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa'}},
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', fontWeight:'600', color:'#6b7280'}}, "Total de " + receitasDoMes.length + " receitas"),
          /*#__PURE__*/React.createElement("span", {style:{fontSize:'1rem', fontWeight:'900', color:'#059669'}}, "R$ " + totalMes.toLocaleString('pt-BR',{minimumFractionDigits:2}))
        )
      ),

      /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},

        /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'14px'}}, "\uD83D\uDCCA \xDAltimos 6 Meses"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'flex-end', gap:'5px', height:'72px', marginBottom:'8px'}},
            ...ultimos6.map(m =>
              /*#__PURE__*/React.createElement("div", {key:m.mes, style:{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%'}},
                m.total > 0
                  ? /*#__PURE__*/React.createElement("div", {title:"R$ " + m.total.toFixed(2), style:{width:'100%', height: Math.max(4, m.total/maxBar*68)+'px', background: m.atual ? 'linear-gradient(180deg,#10b981,#059669)' : '#bbf7d0', borderRadius:'4px 4px 0 0', transition:'height .5s ease', boxShadow: m.atual ? '0 2px 8px rgba(16,185,129,0.4)' : 'none'}})
                  : /*#__PURE__*/React.createElement("div", {style:{width:'100%', height:'3px', background:'#f3f4f6', borderRadius:'2px'}})
              )
            )
          ),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', gap:'5px'}},
            ...ultimos6.map(m =>
              /*#__PURE__*/React.createElement("div", {key:m.mes, style:{flex:1, textAlign:'center', fontSize:'0.58rem', fontWeight: m.atual ? '800' : '500', color: m.atual ? '#059669' : '#9ca3af'}}, m.label)
            )
          )
        ),

        /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "\uD83D\uDCD0 M\xE9dia Mensal"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.15rem', fontWeight:'900', color:'#111827', marginBottom:'8px'}}, "R$ " + mediaUlt6.toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'700', background: variacaoMes >= 0 ? '#ecfdf5' : '#fff1f2', color: variacaoMes >= 0 ? '#059669' : '#e11d48'}},
            variacaoMes >= 0 ? '\u25B2' : '\u25BC', " " + Math.abs(variacaoMes).toFixed(1) + "% este m\xEAs"
          )
        ),

        saldo.receitas > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'12px'}}, "\u2696\uFE0F Comprometimento"),
          (function() {
            var pct = saldo.receitas > 0 ? saldo.despesas / saldo.receitas * 100 : 0;
            var cor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981';
            var bg  = pct > 90 ? '#fff1f2' : pct > 70 ? '#fffbeb' : '#f0fdf4';
            return /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', marginBottom:'8px'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.73rem', color:'#6b7280'}}, "Despesas / Receita"),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.92rem', fontWeight:'900', color:cor}}, pct.toFixed(0) + "%")
              ),
              /*#__PURE__*/React.createElement("div", {style:{height:'7px', background:'#f3f4f6', borderRadius:'4px', overflow:'hidden', marginBottom:'10px'}},
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
          style:{borderRadius:'14px', padding:'16px', background: saldo.positivo ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)' : 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: saldo.positivo ? '1px solid #a7f3d0' : '1px solid #fecdd3'}
        },
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color: saldo.positivo ? '#065f46' : '#be123c', marginBottom:'10px'}}, saldo.positivo ? "\u2705 Sobra do M\xEAs" : "\u26A0\uFE0F D\xE9ficit do M\xEAs"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color: saldo.positivo ? '#059669' : '#e11d48'}}, "R$ " + Math.abs(saldo.saldo).toLocaleString('pt-BR',{minimumFractionDigits:2})),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color: saldo.positivo ? '#065f46' : '#be123c', marginTop:'5px', opacity:0.8}}, saldo.positivo ? "Dispon\xEDvel para poupar ou investir" : "Receitas menores que as despesas")
        )
      )
    );
  };

  const TelaPlanejamento = () => {
    // Controlar aba via telaAtiva do menu
    const abaAtiva = telaAtiva === 'planejamento-orcamento' || telaAtiva === 'planejamento-premes' ? 'orcamento' : telaAtiva === 'planejamento-metas' || telaAtiva === 'planejamento-dividas' ? 'metas' : telaAtiva === 'planejamento-compra' || telaAtiva === 'planejamento-simulador' ? 'simulacoes' : 'diagnostico';
    const subAba = telaAtiva === 'planejamento-premes' ? 'premes' : telaAtiva === 'planejamento-dividas' ? 'dividas' : telaAtiva === 'planejamento-compra' ? 'compra' : telaAtiva === 'planejamento-simulador' ? 'simulador' : telaAtiva === 'planejamento-timeline' ? 'timeline' : null;

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
      console.log('📝 Adicionando meta:', meta);
      const novaMeta = {
        id: Date.now(),
        titulo: meta.titulo,
        valor: parseFloat(meta.valor),
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
      console.log('✅ Meta criada:', novaMeta);
      setMetasFinanceiras([...metasFinanceiras, novaMeta]);
      console.log('💾 Salvando meta no estado');
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
        valorTotal: parseFloat(divida.valorTotal),
        saldoDevedor: parseFloat(divida.saldoDevedor),
        taxaJuros: parseFloat(divida.taxaJuros),
        parcelaMinima: parseFloat(divida.parcelaMinima),
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
    }, "\uD83D\uDCCB Planejamento")), abaAtiva === 'diagnostico' && (() => {
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
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:'#6366f1', color:'#fff', transition:'all 0.15s'}
}, "📊 Orçamento"), /*#__PURE__*/React.createElement("button", {
  onClick: ()=>setTelaAtiva('planejamento-premes'),
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:'#f3f4f6', color:'#6b7280', transition:'all 0.15s'}
}, "📝 Pré-Mês")),

// GRID 3 COLUNAS
/*#__PURE__*/React.createElement("div", {
  style: {display:'grid', gridTemplateColumns:'1fr 1.5fr 1fr', gap:'16px', alignItems:'start'}
},

// ═══════════════════════════════════════════════════════════
// COLUNA ESQUERDA: Resumo + Ação
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},
  
  // Card: Status Orçamento (escuro)
  /*#__PURE__*/React.createElement("div", {
    style: {
      background: dentroOrcamento 
        ? 'linear-gradient(135deg, #064e3b, #065f46)' 
        : 'linear-gradient(135deg, #7f1d1d, #991b1b)',
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
    style: {background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'#6b7280', marginBottom:'14px'}}, 
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
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem', color:'#374151', marginBottom:'6px'}},
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
      background:'linear-gradient(135deg, #6366f1, #8b5cf6)', 
      color:'#fff', fontSize:'0.85rem', fontWeight:'700',
      cursor:'pointer', boxShadow:'0 4px 12px rgba(99,102,241,0.3)',
      transition:'all 0.2s'
    }
  }, '⚙️ ' + (orcadoTotal > 0 ? 'Ajustar Orçamento' : 'Definir Orçamento'))
),

// ═══════════════════════════════════════════════════════════
// COLUNA CENTRAL: Detalhamento por Categoria
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {
  style: {background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
},
  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}},
    /*#__PURE__*/React.createElement("h3", {style:{fontSize:'0.9rem', fontWeight:'800', color:'#111827'}}, '📋 Detalhamento'),
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
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:'#111827'}}, '💳 Cartões'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}},
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
    /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden'}},
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
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:'#111827'}}, '🏠 Gastos Fixos'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}},
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
    /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden'}},
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
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'700', color:'#111827'}}, '📊 Gastos Variáveis'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}},
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
    /*#__PURE__*/React.createElement("div", {style:{height:'6px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden'}},
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
    style: {background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'#6b7280', marginBottom:'14px'}}, 
      '🥧 Composição'
    ),
    orcadoTotal > 0 
      ? /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'10px'}},
          // Cartões %
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#6366f1', flexShrink:0}}),
            /*#__PURE__*/React.createElement("div", {style:{flex:1}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#374151'}}, 'Cartões'),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827'}},
                (orcamento.cartoes/orcadoTotal*100).toFixed(0) + '%'
              )
            )
          ),
          // Fixos %
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#8b5cf6', flexShrink:0}}),
            /*#__PURE__*/React.createElement("div", {style:{flex:1}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#374151'}}, 'Fixos'),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827'}},
                (orcamento.fixos/orcadoTotal*100).toFixed(0) + '%'
              )
            )
          ),
          // Variáveis %
          /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#10b981', flexShrink:0}}),
            /*#__PURE__*/React.createElement("div", {style:{flex:1}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#374151'}}, 'Variáveis'),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827'}},
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
      background:'linear-gradient(135deg, #fef3c7, #fde68a)',
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

)),

  (abaAtiva === 'orcamento' && subAba === 'premes') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {display:'flex', gap:'8px', marginBottom:'4px'}
    }, /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-orcamento'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: !subAba||subAba===null?'#6366f1':'#f3f4f6', color: !subAba||subAba===null?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "📊 Orçamento"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-premes'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='premes'?'#6366f1':'#f3f4f6', color: subAba==='premes'?'#fff':'#6b7280', transition:'all 0.15s'}
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
      className: "text-xl font-bold text-purple-600"
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
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:'#6366f1', color:'#fff', transition:'all 0.15s'}
}, "🎯 Metas"), /*#__PURE__*/React.createElement("button", {
  onClick: ()=>setTelaAtiva('planejamento-dividas'),
  style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background:'#f3f4f6', color:'#6b7280', transition:'all 0.15s'}
}, "💳 Dívidas")),

// GRID 3 COLUNAS
/*#__PURE__*/React.createElement("div", {
  style: {display:'grid', gridTemplateColumns:'1fr 1.5fr 1fr', gap:'16px', alignItems:'start'}
},

// ═══════════════════════════════════════════════════════════
// COLUNA ESQUERDA: Resumo + Ação
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'14px'}},
  
  // Card: Progresso Geral (escuro)
  /*#__PURE__*/React.createElement("div", {
    style: {
      background: percentualMetasGeral >= 75 
        ? 'linear-gradient(135deg, #064e3b, #065f46)'
        : percentualMetasGeral >= 40
          ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
          : 'linear-gradient(135deg, #78350f, #92400e)',
      borderRadius:'16px',
      padding:'20px',
      border: percentualMetasGeral >= 75 ? '1px solid rgba(16,185,129,0.3)' : percentualMetasGeral >= 40 ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(245,158,11,0.3)',
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
          background:'#fff',
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
    style: {background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'#6b7280', marginBottom:'14px'}}, 
      '📊 Estatísticas'
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', color:'#6b7280'}}, 'Metas Ativas'),
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#6366f1'}}, 
          metasFinanceiras.filter(m => !m.concluida).length
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', color:'#6b7280'}}, 'Concluídas'),
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#10b981'}}, 
          metasConcluidas.length
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.78rem', color:'#6b7280'}}, 'Falta Acumular'),
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
      background:'linear-gradient(135deg, #6366f1, #8b5cf6)', 
      color:'#fff', fontSize:'0.85rem', fontWeight:'700',
      cursor:'pointer', boxShadow:'0 4px 12px rgba(99,102,241,0.3)',
      transition:'all 0.2s'
    }
  }, '➕ Nova Meta')
),

// ═══════════════════════════════════════════════════════════
// COLUNA CENTRAL: Lista de Metas
// ═══════════════════════════════════════════════════════════
/*#__PURE__*/React.createElement("div", {
  style: {background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
},
  /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}},
    /*#__PURE__*/React.createElement("h3", {style:{fontSize:'0.9rem', fontWeight:'800', color:'#111827'}}, '🎯 Suas Metas'),
    metasFinanceiras.filter(m => !m.concluida).length > 0 && /*#__PURE__*/React.createElement("span", {
      style:{fontSize:'0.68rem', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:'#ede9fe', color:'#5b21b6'}
    }, metasFinanceiras.filter(m => !m.concluida).length + ' ativas')
  ),
  
  metasFinanceiras.length === 0
    ? /*#__PURE__*/React.createElement("div", {style:{textAlign:'center', padding:'40px 20px', color:'#d1d5db'}},
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'3rem', marginBottom:'12px'}}, '🎯'),
        /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.95rem', fontWeight:'600', color:'#9ca3af', marginBottom:'6px'}}, 
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
              background:'#fafafa',
              borderRadius:'12px',
              padding:'14px',
              border:'1px solid #e5e7eb',
              transition:'all 0.2s',
              cursor:'pointer'
            },
            onClick: () => {
              setItemEditando(meta);
              setTipoEditando('meta');
              setModalAberto('editar');
            }
          },
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}},
              /*#__PURE__*/React.createElement("div", {style:{flex:1}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827', marginBottom:'4px'}}, 
                  meta.titulo
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af'}},
                  'R$ ' + (meta.valorAtual || 0).toFixed(0) + ' de R$ ' + meta.valor.toFixed(0)
                )
              ),
              /*#__PURE__*/React.createElement("div", {style:{textAlign:'right'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'900', color:'#6366f1'}},
                  progresso.toFixed(0) + '%'
                ),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', color:'#9ca3af', marginTop:'2px'}},
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
                  background: progresso >= 75 ? '#10b981' : progresso >= 40 ? '#6366f1' : '#f59e0b',
                  borderRadius:'3px',
                  transition:'width 0.6s ease'
                }
              })
            ),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#6b7280'}},
              'Faltam: R$ ' + falta.toFixed(0)
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
    style: {background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'#6b7280', marginBottom:'14px'}}, 
      '📅 Por Prazo'
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'10px'}},
      // Curto prazo
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
        /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#10b981', flexShrink:0}}),
        /*#__PURE__*/React.createElement("div", {style:{flex:1}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#374151'}}, 'Curto Prazo'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827'}},
            metasCurtoPrazo.length + ' ' + (metasCurtoPrazo.length === 1 ? 'meta' : 'metas')
          )
        )
      ),
      // Médio prazo
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
        /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#6366f1', flexShrink:0}}),
        /*#__PURE__*/React.createElement("div", {style:{flex:1}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#374151'}}, 'Médio Prazo'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827'}},
            metasMedioPrazo.length + ' ' + (metasMedioPrazo.length === 1 ? 'meta' : 'metas')
          )
        )
      ),
      // Longo prazo
      /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'10px'}},
        /*#__PURE__*/React.createElement("div", {style:{width:'12px', height:'12px', borderRadius:'50%', background:'#8b5cf6', flexShrink:0}}),
        /*#__PURE__*/React.createElement("div", {style:{flex:1}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#374151'}}, 'Longo Prazo'),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem', fontWeight:'800', color:'#111827'}},
            metasLongoPrazo.length + ' ' + (metasLongoPrazo.length === 1 ? 'meta' : 'metas')
          )
        )
      )
    )
  ),
  
  // Card: Dica
  /*#__PURE__*/React.createElement("div", {
    style: {
      background:'linear-gradient(135deg, #dbeafe, #bfdbfe)',
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
      background:'linear-gradient(135deg, #d1fae5, #a7f3d0)',
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
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: !subAba||subAba===null?'#6366f1':'#f3f4f6', color: !subAba||subAba===null?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🎯 Metas"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-dividas'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='dividas'?'#6366f1':'#f3f4f6', color: subAba==='dividas'?'#fff':'#6b7280', transition:'all 0.15s'}
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
      className: "text-2xl font-bold text-purple-600"
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
      className: "text-xl font-bold text-purple-600"
    }, "R$ ", divida.parcelaMinima.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500 mt-2"
    }, divida.parcelaMinima > 0 ? `~${Math.ceil(divida.saldoDevedor / divida.parcelaMinima)} meses (só mínimo)` : 'Definir parcela'))))))), estrategias && estrategias.disponivel > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
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
    }, "Você está gastando tudo ou mais que sua renda. Para usar as estratégias de pagamento, é preciso ter sobra mensal. Revise seus gastos no orçamento!"))))),
  (abaAtiva === 'simulacoes' && subAba === 'compra') && /*#__PURE__*/React.createElement("div", {className:"space-y-3"},
    /*#__PURE__*/React.createElement("div", {style:{display:'flex',gap:'8px',marginBottom:'16px'}},
      /*#__PURE__*/React.createElement("button", {onClick:()=>setTelaAtiva('planejamento-compra'),style:{padding:'6px 16px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:'700',background:'#6366f1',color:'#fff'}}, "🛒 Simul. Compra"),
      /*#__PURE__*/React.createElement("button", {onClick:()=>setTelaAtiva('planejamento-simulador'),style:{padding:'6px 16px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:'700',background:'#f3f4f6',color:'#6b7280'}}, "🎲 Simulador")
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'grid',gridTemplateColumns:'1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        /*#__PURE__*/React.createElement("div", {style:{background:saldo.positivo?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)',borderRadius:'16px',padding:'20px',color:'#fff',border:saldo.positivo?'1px solid rgba(16,185,129,0.3)':'1px solid rgba(239,68,68,0.3)',boxShadow:'0 4px 20px rgba(0,0,0,0.25)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'10px'}}, "💰 Saldo Disponível"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.8rem',fontWeight:'900',marginBottom:'4px'}}, "R$ " + Math.abs(saldo.saldo).toFixed(2)),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem',opacity:0.8}}, saldo.positivo ? "Sobra mensal disponível" : "Saldo negativo — cuidado!")
        ),
        /*#__PURE__*/React.createElement("div", {style:{background:'#fff',borderRadius:'16px',padding:'20px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'#6b7280',marginBottom:'16px'}}, "📝 Detalhes da Compra"),
          /*#__PURE__*/React.createElement("div", {style:{marginBottom:'12px'}},
            /*#__PURE__*/React.createElement("label", {style:{fontSize:'0.75rem',fontWeight:'700',color:'#374151',display:'block',marginBottom:'6px'}}, "Produto / Serviço"),
            /*#__PURE__*/React.createElement("input", {type:"text",placeholder:"Ex: Geladeira, TV, Curso...",value:simCompra.nome,onChange:e=>setSimCompra({...simCompra,nome:e.target.value,resultado:null}),style:{width:'100%',padding:'10px 12px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'0.82rem',outline:'none',boxSizing:'border-box'}})
          ),
          /*#__PURE__*/React.createElement("div", {style:{marginBottom:'12px'}},
            /*#__PURE__*/React.createElement("label", {style:{fontSize:'0.75rem',fontWeight:'700',color:'#374151',display:'block',marginBottom:'6px'}}, "Valor Total (R$)"),
            /*#__PURE__*/React.createElement("input", {type:"number",placeholder:"0,00",step:"0.01",value:simCompra.valor,onChange:e=>setSimCompra({...simCompra,valor:e.target.value,resultado:null}),style:{width:'100%',padding:'10px 12px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'0.82rem',outline:'none',boxSizing:'border-box'}})
          ),
          /*#__PURE__*/React.createElement("div", {style:{marginBottom:'12px'}},
            /*#__PURE__*/React.createElement("label", {style:{fontSize:'0.75rem',fontWeight:'700',color:'#374151',display:'block',marginBottom:'6px'}}, "Forma de Pagamento"),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',gap:'8px'}},
              /*#__PURE__*/React.createElement("button", {onClick:()=>setSimCompra({...simCompra,forma:'avista',resultado:null}),style:{flex:1,padding:'10px',borderRadius:'10px',border:'2px solid',borderColor:simCompra.forma==='avista'?'#6366f1':'#e5e7eb',background:simCompra.forma==='avista'?'#eef2ff':'#fff',color:simCompra.forma==='avista'?'#4f46e5':'#6b7280',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer'}}, "💵 À Vista"),
              /*#__PURE__*/React.createElement("button", {onClick:()=>setSimCompra({...simCompra,forma:'parcelado',resultado:null}),style:{flex:1,padding:'10px',borderRadius:'10px',border:'2px solid',borderColor:simCompra.forma==='parcelado'?'#6366f1':'#e5e7eb',background:simCompra.forma==='parcelado'?'#eef2ff':'#fff',color:simCompra.forma==='parcelado'?'#4f46e5':'#6b7280',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer'}}, "💳 Parcelado")
            )
          ),
          simCompra.forma === 'parcelado' && /*#__PURE__*/React.createElement("div", {style:{marginBottom:'12px'}},
            /*#__PURE__*/React.createElement("div", {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
              /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("label", {style:{fontSize:'0.75rem',fontWeight:'700',color:'#374151',display:'block',marginBottom:'6px'}}, "Parcelas"),
                /*#__PURE__*/React.createElement("select", {value:simCompra.parcelas,onChange:e=>setSimCompra({...simCompra,parcelas:parseInt(e.target.value),resultado:null}),style:{width:'100%',padding:'10px 12px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'0.82rem',outline:'none'}},
                  [2,3,4,6,8,10,12,18,24,36,48,60].map(n => /*#__PURE__*/React.createElement("option", {key:n,value:n}, n+"x"))
                )
              ),
              /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("label", {style:{fontSize:'0.75rem',fontWeight:'700',color:'#374151',display:'block',marginBottom:'6px'}}, "Juros/mês (%)"),
                /*#__PURE__*/React.createElement("input", {type:"number",step:"0.1",placeholder:"2.5",value:simCompra.taxaJuros,onChange:e=>setSimCompra({...simCompra,taxaJuros:parseFloat(e.target.value)||0,resultado:null}),style:{width:'100%',padding:'10px 12px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'0.82rem',outline:'none',boxSizing:'border-box'}})
              )
            )
          ),
          /*#__PURE__*/React.createElement("button", {
            onClick:()=>{
              const v=parseFloat(simCompra.valor)||0;
              if(!v)return;
              let resultado;
              if(simCompra.forma==='avista'){
                const novoSaldo=saldo.saldo-v;
                const pctRenda=saldo.receitas>0?v/saldo.receitas*100:0;
                resultado={tipo:'avista',totalPago:v,impactoMensal:v,meses:1,totalJuros:0,novoSaldo,pctRenda,viavel:novoSaldo>=0};
              } else {
                const taxa=simCompra.taxaJuros/100;
                const n=simCompra.parcelas;
                const parcela=taxa>0?v*(taxa*Math.pow(1+taxa,n))/(Math.pow(1+taxa,n)-1):v/n;
                const totalPago=parcela*n;
                resultado={tipo:'parcelado',parcela,totalPago,totalJuros:totalPago-v,meses:n,impactoMensal:parcela,novoSaldoMensal:saldo.saldo-parcela,pctRenda:saldo.receitas>0?parcela/saldo.receitas*100:0,viavel:saldo.saldo-parcela>=0};
              }
              setSimCompra({...simCompra,resultado});
            },
            style:{width:'100%',padding:'13px',border:'none',borderRadius:'12px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'0.88rem',fontWeight:'800',cursor:'pointer',boxShadow:'0 4px 12px rgba(99,102,241,0.3)',marginTop:'4px'}
          }, "🔍 Simular Compra")
        )
      ),
      simCompra.resultado === null
        ? /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',borderRadius:'16px',padding:'40px 20px',textAlign:'center',border:'2px dashed #e2e8f0',color:'#94a3b8'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'3.5rem',marginBottom:'12px',opacity:0.5}}, "🛒"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem',fontWeight:'700',color:'#64748b',marginBottom:'6px'}}, "Preencha e simule"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem'}}, "Veja o impacto da compra no seu orçamento")
          )
        : /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'14px'}},
            /*#__PURE__*/React.createElement("div", {style:{background:simCompra.resultado.viavel?'linear-gradient(135deg,#064e3b,#065f46)':'linear-gradient(135deg,#7f1d1d,#991b1b)',borderRadius:'16px',padding:'22px',color:'#fff',border:simCompra.resultado.viavel?'1px solid rgba(16,185,129,0.3)':'1px solid rgba(239,68,68,0.3)',boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'10px'}}, simCompra.resultado.viavel?"✅ Compra Viável":"⚠️ Atenção — Impacto Alto"),
              simCompra.nome && /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem',fontWeight:'700',marginBottom:'8px',opacity:0.9}}, simCompra.nome),
              /*#__PURE__*/React.createElement("div", {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'12px'}},
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',opacity:0.6,marginBottom:'4px'}}, simCompra.resultado.tipo==='parcelado'?"Parcela Mensal":"Desembolso"),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.6rem',fontWeight:'900'}}, "R$ "+simCompra.resultado.impactoMensal.toFixed(2))
                ),
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',opacity:0.6,marginBottom:'4px'}}, "% da Renda"),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.6rem',fontWeight:'900',color:simCompra.resultado.pctRenda>30?'#fca5a5':'#86efac'}}, simCompra.resultado.pctRenda.toFixed(1)+"%")
                )
              )
            ),
            /*#__PURE__*/React.createElement("div", {style:{background:'#fff',borderRadius:'16px',padding:'20px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'#6b7280',marginBottom:'14px'}}, "📋 Resumo"),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'10px'}},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #f3f4f6'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',color:'#6b7280'}}, "Total Pago"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:'#111827'}}, "R$ "+simCompra.resultado.totalPago.toFixed(2))
                ),
                simCompra.resultado.tipo==='parcelado' && /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #f3f4f6'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',color:'#6b7280'}}, "Juros Totais"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:'#ef4444'}}, "R$ "+simCompra.resultado.totalJuros.toFixed(2))
                ),
                simCompra.resultado.tipo==='parcelado' && /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #f3f4f6'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',color:'#6b7280'}}, "Prazo"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:'#111827'}}, simCompra.resultado.meses+" meses")
                ),
                /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',color:'#6b7280'}}, simCompra.resultado.tipo==='parcelado'?"Saldo Após Parcela":"Saldo Após Compra"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:(simCompra.resultado.novoSaldo??simCompra.resultado.novoSaldoMensal)>=0?'#10b981':'#ef4444'}}, "R$ "+(simCompra.resultado.novoSaldo??simCompra.resultado.novoSaldoMensal).toFixed(2))
                )
              )
            )
          ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        /*#__PURE__*/React.createElement("div", {style:{background:'#fff',borderRadius:'16px',padding:'20px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'#6b7280',marginBottom:'14px'}}, "📏 Regra dos 30%"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem',color:'#374151',lineHeight:1.6,marginBottom:'12px'}}, "Especialistas recomendam que nenhuma compra comprometa mais de ", /*#__PURE__*/React.createElement("strong", null, "30% da renda mensal.")),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'8px'}},
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',color:'#6b7280'}}, "Limite recomendado"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',fontWeight:'800',color:'#10b981'}}, "R$ "+(saldo.receitas*0.3).toFixed(0))
            ),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',color:'#6b7280'}}, "Sua renda mensal"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',fontWeight:'800',color:'#111827'}}, "R$ "+saldo.receitas.toFixed(0))
            )
          )
        ),
        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#ede9fe,#ddd6fe)',borderRadius:'16px',padding:'16px',border:'1px solid #ddd6fe'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem',fontWeight:'700',color:'#5b21b6',marginBottom:'8px'}}, "⚡ À Vista vs Parcelado"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem',color:'#4c1d95',lineHeight:1.6}}, "Parcelado parece mais barato, mas os juros acumulam. Se tiver o valor disponível, pagar à vista sempre sai mais em conta.")
        ),
        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#fef3c7,#fde68a)',borderRadius:'16px',padding:'16px',border:'1px solid #fde68a'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem',fontWeight:'700',color:'#92400e',marginBottom:'6px'}}, "💡 Dica"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem',color:'#78350f',lineHeight:1.5}},
            simCompra.resultado
              ? simCompra.resultado.viavel
                ? simCompra.resultado.pctRenda < 15
                  ? "Ótima compra! O impacto na sua renda é baixo e cabe bem no orçamento."
                  : "Compra viável, mas representa uma fatia significativa da sua renda."
                : "Esta compra compromete seu saldo. Considere poupar antes ou parcelar em mais vezes."
              : "Preencha os dados para receber uma análise personalizada da compra."
          )
        )
      )
    )
  ),

  (abaAtiva === 'simulacoes' && subAba === 'simulador') && /*#__PURE__*/React.createElement("div", {className:"space-y-3"},
    /*#__PURE__*/React.createElement("div", {style:{display:'flex',gap:'8px',marginBottom:'16px'}},
      /*#__PURE__*/React.createElement("button", {onClick:()=>setTelaAtiva('planejamento-compra'),style:{padding:'6px 16px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:'700',background:'#f3f4f6',color:'#6b7280'}}, "🛒 Simul. Compra"),
      /*#__PURE__*/React.createElement("button", {onClick:()=>setTelaAtiva('planejamento-simulador'),style:{padding:'6px 16px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:'700',background:'#6366f1',color:'#fff'}}, "🎲 Simulador")
    ),
    /*#__PURE__*/React.createElement("div", {style:{display:'grid',gridTemplateColumns:'1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        /*#__PURE__*/React.createElement("div", {style:{background:saldo.positivo?'linear-gradient(135deg,#1e1b4b,#312e81)':'linear-gradient(135deg,#7f1d1d,#991b1b)',borderRadius:'16px',padding:'20px',color:'#fff',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'14px'}}, "📊 Situação Atual"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'10px'}},
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',opacity:0.7}}, "Receitas"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.95rem',fontWeight:'800'}}, "R$ "+saldo.receitas.toFixed(2))
            ),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',opacity:0.7}}, "Despesas"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.95rem',fontWeight:'800'}}, "R$ "+totais.total.toFixed(2))
            ),
            /*#__PURE__*/React.createElement("div", {style:{borderTop:'1px solid rgba(255,255,255,0.15)',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',opacity:0.7}}, "Saldo"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.3rem',fontWeight:'900',color:saldo.positivo?'#86efac':'#fca5a5'}}, "R$ "+saldo.saldo.toFixed(2))
            ),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',opacity:0.7}}, "Score Saúde"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.1rem',fontWeight:'900',color:'#fde68a'}}, scoreSaude.score+" pts")
            )
          )
        ),
        /*#__PURE__*/React.createElement("div", {style:{background:'#fff',borderRadius:'16px',padding:'20px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'#6b7280',marginBottom:'14px'}}, "⚡ Cenários Rápidos"),
          /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'8px'}},
            /*#__PURE__*/React.createElement("button", {onClick:()=>setSimulacao({...simulacao,rendaAjuste:20,gastosAjuste:0}),style:{width:'100%',padding:'12px',borderRadius:'10px',textAlign:'left',border:'2px solid #d1fae5',background:simulacao.rendaAjuste===20&&simulacao.gastosAjuste===0?'#d1fae5':'#fff',cursor:'pointer'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'flex',alignItems:'center',gap:'10px'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.3rem'}}, "📈"),
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem',fontWeight:'700',color:'#065f46'}}, "Promoção +20%"),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem',color:'#6b7280'}}, "Aumento de renda")
                )
              )
            ),
            /*#__PURE__*/React.createElement("button", {onClick:()=>setSimulacao({...simulacao,rendaAjuste:0,gastosAjuste:-20}),style:{width:'100%',padding:'12px',borderRadius:'10px',textAlign:'left',border:'2px solid #dbeafe',background:simulacao.rendaAjuste===0&&simulacao.gastosAjuste===-20?'#dbeafe':'#fff',cursor:'pointer'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'flex',alignItems:'center',gap:'10px'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.3rem'}}, "💰"),
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem',fontWeight:'700',color:'#1e40af'}}, "Economizar -20%"),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem',color:'#6b7280'}}, "Redução de gastos")
                )
              )
            ),
            /*#__PURE__*/React.createElement("button", {onClick:()=>setSimulacao({...simulacao,rendaAjuste:20,gastosAjuste:-20}),style:{width:'100%',padding:'12px',borderRadius:'10px',textAlign:'left',border:'2px solid #ede9fe',background:simulacao.rendaAjuste===20&&simulacao.gastosAjuste===-20?'#ede9fe':'#fff',cursor:'pointer'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'flex',alignItems:'center',gap:'10px'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'1.3rem'}}, "🚀"),
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.78rem',fontWeight:'700',color:'#5b21b6'}}, "Combo Perfeito"),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.68rem',color:'#6b7280'}}, "+20% renda e -20% gastos")
                )
              )
            ),
            /*#__PURE__*/React.createElement("button", {onClick:()=>setSimulacao({rendaAjuste:0,gastosAjuste:0,quitarDivida:null,novaReceita:0,novaDespesa:0}),style:{width:'100%',padding:'10px',borderRadius:'10px',border:'2px solid #f3f4f6',background:'#fff',cursor:'pointer',fontSize:'0.75rem',fontWeight:'700',color:'#9ca3af'}}, "🔄 Resetar")
          )
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        /*#__PURE__*/React.createElement("div", {style:{background:'#fff',borderRadius:'16px',padding:'20px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'#6b7280',marginBottom:'18px'}}, "🎮 Ajuste os Valores"),
          /*#__PURE__*/React.createElement("div", {style:{marginBottom:'20px'}},
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',fontWeight:'700',color:'#374151'}}, "💰 Ajuste de Renda"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'900',color:simulacao.rendaAjuste>0?'#10b981':simulacao.rendaAjuste<0?'#ef4444':'#6b7280'}}, (simulacao.rendaAjuste>0?'+':'')+simulacao.rendaAjuste+"%")
            ),
            /*#__PURE__*/React.createElement("input", {type:"range",min:"-50",max:"100",step:"1",value:simulacao.rendaAjuste,onChange:e=>setSimulacao({...simulacao,rendaAjuste:parseFloat(e.target.value)}),style:{width:'100%',accentColor:'#10b981',cursor:'pointer'}}),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#9ca3af',marginTop:'4px'}},
              /*#__PURE__*/React.createElement("span", null, "-50%"),
              /*#__PURE__*/React.createElement("span", null, "+100%")
            )
          ),
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.8rem',fontWeight:'700',color:'#374151'}}, "📉 Ajuste de Gastos"),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'900',color:simulacao.gastosAjuste<0?'#10b981':simulacao.gastosAjuste>0?'#ef4444':'#6b7280'}}, (simulacao.gastosAjuste>0?'+':'')+simulacao.gastosAjuste+"%")
            ),
            /*#__PURE__*/React.createElement("input", {type:"range",min:"-50",max:"50",step:"1",value:simulacao.gastosAjuste,onChange:e=>setSimulacao({...simulacao,gastosAjuste:parseFloat(e.target.value)}),style:{width:'100%',accentColor:'#6366f1',cursor:'pointer'}}),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#9ca3af',marginTop:'4px'}},
              /*#__PURE__*/React.createElement("span", null, "-50%"),
              /*#__PURE__*/React.createElement("span", null, "+50%")
            )
          )
        ),
        /*#__PURE__*/React.createElement("div", {
          style:{
            background: simulacao.rendaAjuste===0&&simulacao.gastosAjuste===0 ? 'linear-gradient(135deg,#f8fafc,#f1f5f9)' : (saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))>=0 ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)',
            borderRadius:'16px',padding:'20px',
            color: simulacao.rendaAjuste===0&&simulacao.gastosAjuste===0?'#64748b':'#fff',
            border: simulacao.rendaAjuste===0&&simulacao.gastosAjuste===0?'2px dashed #e2e8f0':'1px solid rgba(255,255,255,0.2)',
            boxShadow: simulacao.rendaAjuste===0&&simulacao.gastosAjuste===0?'none':'0 4px 24px rgba(0,0,0,0.25)'
          }
        },
          simulacao.rendaAjuste===0&&simulacao.gastosAjuste===0
            ? /*#__PURE__*/React.createElement("div", {style:{textAlign:'center',padding:'10px 0'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'2.5rem',marginBottom:'8px',opacity:0.4}}, "🎲"),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.85rem',fontWeight:'600'}}, "Mova os controles para ver o cenário simulado")
              )
            : /*#__PURE__*/React.createElement("div", null,
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.6rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'14px'}}, "🔮 Cenário Simulado"),
                /*#__PURE__*/React.createElement("div", {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}},
                  /*#__PURE__*/React.createElement("div", null,
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',opacity:0.6,marginBottom:'4px'}}, "Receitas"),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem',fontWeight:'900'}}, "R$ "+(saldo.receitas*(1+simulacao.rendaAjuste/100)).toFixed(0)),
                    simulacao.rendaAjuste!==0&&/*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem',color:simulacao.rendaAjuste>=0?'#86efac':'#fca5a5'}}, (simulacao.rendaAjuste>=0?'▲ +':'▼ ')+"R$ "+Math.abs(saldo.receitas*simulacao.rendaAjuste/100).toFixed(0))
                  ),
                  /*#__PURE__*/React.createElement("div", null,
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',opacity:0.6,marginBottom:'4px'}}, "Despesas"),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'1rem',fontWeight:'900'}}, "R$ "+(totais.total*(1+simulacao.gastosAjuste/100)).toFixed(0)),
                    simulacao.gastosAjuste!==0&&/*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem',color:simulacao.gastosAjuste<=0?'#86efac':'#fca5a5'}}, (simulacao.gastosAjuste>=0?'▲ +':'▼ ')+"R$ "+Math.abs(totais.total*simulacao.gastosAjuste/100).toFixed(0))
                  ),
                  /*#__PURE__*/React.createElement("div", null,
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',opacity:0.6,marginBottom:'4px'}}, "Saldo"),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem',fontWeight:'900',color:(saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))>=0?'#86efac':'#fca5a5'}}, "R$ "+(saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100)).toFixed(0))
                  ),
                  /*#__PURE__*/React.createElement("div", null,
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',opacity:0.6,marginBottom:'4px'}}, "Score Est."),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem',fontWeight:'900',color:'#fde68a'}},
                      Math.min(100, Math.max(0,
                        ((saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))>=0?30:0)+
                        (totais.total*(1+simulacao.gastosAjuste/100)<=saldo.receitas*(1+simulacao.rendaAjuste/100)*0.9?25:0)+
                        Math.min(30,Math.floor(reservaEmergencia/(totais.total*(1+simulacao.gastosAjuste/100)*6)*30))
                      ))+" pts"
                    )
                  )
                )
              )
        )
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'14px'}},
        /*#__PURE__*/React.createElement("div", {style:{background:'#fff',borderRadius:'16px',padding:'20px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.65rem',fontWeight:'800',letterSpacing:'1.1px',textTransform:'uppercase',color:'#6b7280',marginBottom:'14px'}}, "🔬 Análise de Impacto"),
          simulacao.rendaAjuste===0&&simulacao.gastosAjuste===0
            ? /*#__PURE__*/React.createElement("div", {style:{textAlign:'center',padding:'20px 0',color:'#d1d5db'}},
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'2rem',marginBottom:'8px'}}, "⬆️"),
                /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem'}}, "Ajuste os controles para ver a análise")
              )
            : /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap:'10px'}},
                /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #f3f4f6'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',color:'#6b7280'}}, "Taxa Poupança"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:((saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))/saldo.receitas*(1+simulacao.rendaAjuste/100)*100)>=20?'#10b981':((saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))/saldo.receitas*(1+simulacao.rendaAjuste/100)*100)>=10?'#f59e0b':'#ef4444'}},
                    Math.max(0,(saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))/(saldo.receitas*(1+simulacao.rendaAjuste/100))*100).toFixed(1)+"%"
                  )
                ),
                (saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))>0&&/*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #f3f4f6'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',color:'#6b7280'}}, "Poupança/mês"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:'#6366f1'}}, "R$ "+(saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100)).toFixed(0))
                ),
                (saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))>0&&/*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem',color:'#6b7280'}}, "Poupança/ano"),
                  /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.9rem',fontWeight:'800',color:'#10b981'}}, "R$ "+((saldo.receitas*(1+simulacao.rendaAjuste/100)-totais.total*(1+simulacao.gastosAjuste/100))*12).toFixed(0))
                )
              )
        ),
        /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#fef3c7,#fde68a)',borderRadius:'16px',padding:'16px',border:'1px solid #fde68a'}},
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem',fontWeight:'700',color:'#92400e',marginBottom:'6px'}}, "💡 Meta Recomendada"),
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem',color:'#78350f',lineHeight:1.5}},
            "Economistas recomendam poupar pelo menos ",
            /*#__PURE__*/React.createElement("strong", null, "20% da renda"),
            ". Com sua renda isso seria ",
            /*#__PURE__*/React.createElement("strong", null, "R$ "+(saldo.receitas*0.2).toFixed(0)+"/mês"),
            "."
          )
        )
      )
    )
)))

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

      /*#__PURE__*/React.createElement("div", {style:{display:'grid', gridTemplateColumns:'240px 1fr 220px', gap:'16px', alignItems:'start'}},

        /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'12px'}},
          /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(150deg,#4c1d95,#5b21b6,#6d28d9)', borderRadius:'16px', padding:'20px', color:'#fff', boxShadow:'0 6px 24px rgba(91,33,182,0.45)', border:'1px solid rgba(167,139,250,0.2)'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:'8px'}}, "\uD83D\uDEA6 FAROL \xB7 " + mesAtual.toUpperCase()),
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
          /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'14px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'10px'}}, "Progresso"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.2rem', fontWeight:'900', color:'#6d28d9', marginBottom:'8px'}}, pagamentos.percentual.toFixed(1)+"%"),
            /*#__PURE__*/React.createElement("div", {style:{height:'10px', background:'#f1f5f9', borderRadius:'5px', overflow:'hidden'}},
              /*#__PURE__*/React.createElement("div", {style:{height:'100%', width:Math.min(100,pagamentos.percentual)+'%', background:'linear-gradient(90deg,#8b5cf6,#7c3aed)', borderRadius:'5px', transition:'width .6s ease'}})
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
              const cor = f==='todos' ? '#6d28d9' : f==='pagos' ? '#059669' : '#ea580c';
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

        /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden'}},
          /*#__PURE__*/React.createElement("div", {style:{padding:'16px 20px', borderBottom:'2px solid #f9fafb', display:'flex', justifyContent:'space-between', alignItems:'center'}},
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.88rem', fontWeight:'800', color:'#111827'}}, "Gestão de Pagamentos \u2014 " + mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)),
              /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px'}}, 
                estamosNoMesAtual ? "Hoje: " + hoje + " de " + mesAtual : "Visualizando: " + mesAtual + "/" + anoAtual
              )
            ),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', alignItems:'center', gap:'6px'}},
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', color:'#64748b'}}, "Pago"),
              /*#__PURE__*/React.createElement("div", {style:{width:'28px', height:'4px', background:'linear-gradient(90deg,#10b981,#059669)', borderRadius:'2px'}}),
              /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.72rem', color:'#64748b', marginLeft:'6px'}}, "Pendente"),
              /*#__PURE__*/React.createElement("div", {style:{width:'28px', height:'4px', background:'#e5e7eb', borderRadius:'2px'}})
            )
          ),
          itensFiltrados.length === 0 && /*#__PURE__*/React.createElement("div", {style:{padding:'60px 20px', textAlign:'center'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'2.5rem', marginBottom:'10px'}}, "\uD83D\uDEA6"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:'#9ca3af'}}, filtroStatus==='pagos' ? 'Nenhum pagamento confirmado' : filtroStatus==='pendentes' ? 'Tudo pago!' : 'Nenhum item no farol')
          ),
          itensFiltrados.length > 0 && /*#__PURE__*/React.createElement("div", {style:{maxHeight:'560px', overflowY:'auto'}},
            ...diasOrdenados.map(dia => {
              const itensDia = porDia[dia];
              const totalDia = itensDia.reduce((s,i)=>s+i.valor,0);
              const isHoje = estamosNoMesAtual && parseInt(dia) === hoje;
              const mesNum = mesesOrdem.indexOf(mesAtual);
              const dSem = diasSem[new Date(anoAtual, mesNum>=0?mesNum:new Date().getMonth(), parseInt(dia)).getDay()];

              return /*#__PURE__*/React.createElement("div", {key:dia},
                /*#__PURE__*/React.createElement("div", {style:{padding:'10px 20px', background: isHoje?'#faf5ff':'#fafafa', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:'14px'}},
                  /*#__PURE__*/React.createElement("div", {style:{width:'50px', textAlign:'center'}},
                    /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.62rem', color: isHoje?'#6d28d9':'#9ca3af', fontWeight:'600'}}, dSem),
                    /*#__PURE__*/React.createElement("div", {style:{fontSize: isHoje?'1.2rem':'1rem', fontWeight:'900', color: isHoje?'#6d28d9':'#374151'}}, "Dia " + dia),
                    isHoje && /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.55rem', fontWeight:'800', color:'#6d28d9'}}, "HOJE")
                  ),
                  /*#__PURE__*/React.createElement("div", {style:{flex:1, height:'2px', background:'linear-gradient(90deg,#e5e7eb,transparent)'}}),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.8rem', fontWeight:'800', color:'#6d28d9'}}, "R$ " + totalDia.toFixed(0))
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
                        /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.65rem', background: item.tipo==='CARTÃO'?'#dbeafe':item.tipo==='FIXO'?'#f3e8ff':item.tipo==='VARIÁVEL'?'#fff7ed':'#fffbeb', color: item.tipo==='CARTÃO'?'#1e40af':item.tipo==='FIXO'?'#6d28d9':item.tipo==='VARIÁVEL'?'#ea580c':'#d97706', padding:'1px 7px', borderRadius:'20px', fontWeight:'600'}}, item.tipo),
                        item.badge && /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.65rem', color:'#9ca3af'}}, item.badge)
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
          vencHoje.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#fff1f2,#ffe4e6)', borderRadius:'14px', padding:'14px', border:'1px solid #fecdd3'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#be123c', marginBottom:'10px'}}, "\uD83D\uDD34 Vence HOJE"),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.4rem', fontWeight:'900', color:'#9f1239', marginBottom:'8px'}}, "R$ " + totalHoje.toFixed(2)),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.7rem', color:'#be123c'}}, vencHoje.length + " pagamento" + (vencHoje.length>1?"s":""))
          ),
          vencSemana.length > 0 && /*#__PURE__*/React.createElement("div", {style:{background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:'14px', padding:'14px', border:'1px solid #fde68a'}},
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
          /*#__PURE__*/React.createElement("div", {style:{background:'#fff', borderRadius:'14px', padding:'14px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.58rem', fontWeight:'800', letterSpacing:'1.4px', textTransform:'uppercase', color:'#9ca3af', marginBottom:'12px'}}, "Resumo do M\xEAs"),
            /*#__PURE__*/React.createElement("div", {style:{display:'flex', flexDirection:'column', gap:'8px'}},
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', paddingBottom:'8px', borderBottom:'1px solid #f3f4f6'}},
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.75rem', color:'#64748b'}}, "Total a pagar"),
                /*#__PURE__*/React.createElement("span", {style:{fontSize:'0.82rem', fontWeight:'800', color:'#374151'}}, "R$ " + pagamentos.total.toFixed(0))
              ),
              /*#__PURE__*/React.createElement("div", {style:{display:'flex', justifyContent:'space-between', paddingBottom:'8px', borderBottom:'1px solid #f3f4f6'}},
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
          style:{background:'#fff', borderRadius:'16px', padding:'24px', maxWidth:'400px', width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}
        },
          /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.1rem', fontWeight:'800', color:'#111827', marginBottom:'16px'}}, "\uD83D\uDCB0 Registrar Pagamento"),
          /*#__PURE__*/React.createElement("div", {style:{background:'#f8fafc', borderRadius:'12px', padding:'16px', marginBottom:'16px'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.9rem', fontWeight:'700', color:'#374151', marginBottom:'4px'}}, modalPagamento.nome),
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'1.6rem', fontWeight:'900', color:'#6d28d9'}}, "R$ " + modalPagamento.valor.toFixed(2)),
            (() => {
              const st = getStatusFarol(modalPagamento.nome, mesAtual);
              if (typeof st === 'number' && st > 0) {
                return /*#__PURE__*/React.createElement("div", {style:{marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #e5e7eb'}},
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#059669', fontWeight:'600'}}, "\u2705 Pago: R$ " + st.toFixed(2)),
                  /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', color:'#ea580c', fontWeight:'600'}}, "\u23F3 Falta: R$ " + (modalPagamento.valor-st).toFixed(2))
                );
              }
              return null;
            })()
          ),
          /*#__PURE__*/React.createElement("button", {
            onClick:()=>{ marcarPago(modalPagamento.nome, mesAtual); setModalPagamento(null); },
            style:{width:'100%', padding:'12px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontSize:'0.85rem', fontWeight:'700', cursor:'pointer', marginBottom:'12px'}
          }, "\u2705 Marcar como PAGO"),
          /*#__PURE__*/React.createElement("div", {style:{borderTop:'1px solid #e5e7eb', paddingTop:'12px'}},
            /*#__PURE__*/React.createElement("div", {style:{fontSize:'0.75rem', fontWeight:'600', color:'#374151', marginBottom:'8px'}}, "Pagar valor parcial:"),
            /*#__PURE__*/React.createElement("input", {
              type:"number", step:"0.01", value:valorParcial, onChange:e=>setValorParcial(e.target.value), placeholder:"Valor",
              style:{width:'100%', padding:'10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.85rem', marginBottom:'8px', outline:'none'}
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


  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen",
    style: {
      background: '#f0f2f8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #0f3460 100%)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '14px 16px',
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
      maxHeight: '38px',
      width: 'auto',
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: '16px'
    }
  }, /*#__PURE__*/React.createElement(UserMenu, {
    user: user,
    onLogout: async () => {
      ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'orcamentos', 'metasMensais', 'metasFinanceiras', 'planejados', 'dividas', 'categorias', 'farol', '_currentUserId'].forEach(k => localStorage.removeItem(k));
      await firebase.auth().signOut();
    }
  })))), /*#__PURE__*/React.createElement(Sidebar, {
    telaAtiva: telaAtiva,
    setTelaAtiva: setTelaAtiva,
    mesAtual: mesAtual,
    setMesAtual: setMesAtual,
    anoAtual: anoAtual,
    setAnoAtual: setAnoAtual,
    isUserAdmin: isUserAdmin,
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
    style: {
      padding: '0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '4px',
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }
  }, MESES.map(mes => /*#__PURE__*/React.createElement("button", {
    key: mes,
    onClick: () => setMesAtual(mes),
    className: `mes-btn${mesAtual === mes ? ' ativo' : ''}`
  }, mes.charAt(0).toUpperCase() + mes.slice(1)))))), /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 main-content"
  }, React.useMemo(() => {
    if (telaAtiva !== 'dashboard') return null;
    return /*#__PURE__*/React.createElement(Dashboard, {
      key: `${mesAtual}-${anoAtual}`
    });
  }, [telaAtiva === 'dashboard', mesAtual, anoAtual]), telaAtiva === 'admin' && /*#__PURE__*/React.createElement(TelaAdmin, {
    isUserAdmin: isUserAdmin
  }), telaAtiva.startsWith('planejamento') && /*#__PURE__*/React.createElement(TelaPlanejamento, null), telaAtiva === 'receitas' && /*#__PURE__*/React.createElement(TelaReceitas, null), telaAtiva === 'cartoes' && /*#__PURE__*/React.createElement(TelaCartoes, {
    key: JSON.stringify(farol)
  }), telaAtiva === 'fixos' && /*#__PURE__*/React.createElement(TelaGastosFixos, {setModalAberto}), telaAtiva === 'variaveis' && /*#__PURE__*/React.createElement(TelaGastosVariaveis, {setModalAberto}), telaAtiva === 'extras' && /*#__PURE__*/React.createElement(TelaGastosExtras, {setModalAberto}), telaAtiva === 'farol' && /*#__PURE__*/React.createElement(TelaFarol, null)), modalAberto === 'editar' && itemEditando && /*#__PURE__*/React.createElement(Modal, {
    titulo: `✏️ Editar ${tipoEditando === 'receita' ? 'Receita' : tipoEditando === 'cartao' ? 'Cartão' : tipoEditando === 'fixo' ? 'Gasto Fixo' : 'Gasto Variável'}`,
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
    className: "bg-purple-50 rounded-lg p-4 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Categorias Padr\xE3o:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['MORADIA', 'ESTUDO', 'TRANSPORTE', 'SERVIÇOS', 'SAÚDE'].map(cat => /*#__PURE__*/React.createElement("span", {
    key: cat,
    className: "px-3 py-1 bg-white border-2 border-purple-300 rounded-lg text-sm font-semibold text-gray-700"
  }, cat)))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-purple-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), categoriasPersonalizadas.gastosFixos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosFixos.map(cat => /*#__PURE__*/React.createElement("div", {
    key: cat,
    className: "flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-lg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-purple-700"
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
          valor: parseFloat(valor),
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
    titulo: "\u2795 Novo Gasto Fixo",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovoGastoFixo, null)), modalAberto === 'novoGastoVariavel' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Gasto Vari\xE1vel",
    onClose: () => setModalAberto(null)
  }, /*#__PURE__*/React.createElement(FormNovoGastoVariavel, null)), modalAberto === 'novoGastoExtra' && /*#__PURE__*/React.createElement(Modal, {
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
  }, /*#__PURE__*/React.createElement(FormCompraParcelada, null))));
}
const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(/*#__PURE__*/React.createElement(AuthWrapper, null));
