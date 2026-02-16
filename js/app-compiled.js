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
        marginBottom: '0.5rem'
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
  const [modalAberto, setModalAberto] = useState(null);
  const [itemEditando, setItemEditando] = useState(null);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [gastosFixos, setGastosFixos] = useState(() => {
    const saved = localStorage.getItem('gastosFixos');
    return saved ? JSON.parse(saved) : DADOS_INICIAIS.gastosFixos;
  });
  const [cartoes, setCartoes] = useState(() => {
    const saved = localStorage.getItem('cartoes');
    return saved ? JSON.parse(saved) : DADOS_INICIAIS.cartoes;
  });
  const [gastosVariaveis, setGastosVariaveis] = useState(() => {
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
    const saved = localStorage.getItem('receitas');
    return saved ? JSON.parse(saved) : [];
  });
  const [farol, setFarol] = useState(() => {
    const saved = localStorage.getItem('farol');
    return saved ? JSON.parse(saved) : {};
  });
  const [metas, setMetas] = useState(() => {
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
    const saved = localStorage.getItem('metasFinanceiras');
    return saved ? JSON.parse(saved) : [];
  });

  // 💰 RESERVA DE EMERGÊNCIA ATUAL
  const [reservaEmergencia, setReservaEmergencia] = useState(() => {
    const saved = localStorage.getItem('reservaEmergencia');
    return saved ? parseFloat(saved) : 0;
  });

  // 💳 DÍVIDAS
  const [dividas, setDividas] = useState(() => {
    const saved = localStorage.getItem('dividas');
    return saved ? JSON.parse(saved) : [];
  });
  const [orcamento, setOrcamento] = useState(() => {
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
    }, "\uD83D\uDEA6 Mostrar no Farol de Pagamentos")), /*#__PURE__*/React.createElement("p", {
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
    }, "\uD83D\uDEA6 Mostrar no Farol de Pagamentos")), /*#__PURE__*/React.createElement("p", {
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
    // Calcular status da fatura para cada cartão
    const calcularStatusFatura = (cartao, mes) => {
      const hoje = new Date().getDate();
      const diaFechamento = cartao.diaFechamento || cartao.vencimento - 7;
      if (hoje <= diaFechamento) {
        return 'ABERTA';
      } else if (hoje > diaFechamento && hoje <= cartao.vencimento) {
        return 'FECHADA';
      } else {
        return 'VENCIDA';
      }
    };

    // Calcular projeção de 6 meses
    const calcularProjecao = cartao => {
      const mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const mesAtualIndex = mesesOrdem.indexOf(mesAtual);
      const projecao = [];
      for (let i = 0; i < 6; i++) {
        const mesIndex = (mesAtualIndex + i) % 12;
        const mes = mesesOrdem[mesIndex];
        const parcelasDoMes = calcularParcelasCartao(cartao.nome, mes);
        const valoresAno = cartao.valores?.[anoAtual] || {};
        const valorBase = valoresAno[mes] || 0;
        const valorParcelas = parcelasDoMes.reduce((sum, c) => sum + c.valorParcela, 0);
        const total = valorBase + valorParcelas;
        projecao.push({
          mes: mes.toUpperCase(),
          valor: total
        });
      }
      return projecao;
    };

    // Calcular totais por cartão para os cards
    const totaisPorCartao = {};
    let totalGeralMes = 0;
    let totalDivida = 0;
    let totalLimites = 0;
    cartoes.forEach(cartao => {
      const parcelasCartao = calcularParcelasCartao(cartao.nome, mesAtual);
      const valoresAno = cartao.valores?.[anoAtual] || {};
      const valorBase = valoresAno[mesAtual] || 0;
      const valorParcelas = parcelasCartao.reduce((sum, c) => sum + c.valorParcela, 0);
      const valorTotal = valorBase + valorParcelas;
      totaisPorCartao[cartao.nome] = valorTotal;
      totalGeralMes += valorTotal;

      // Calcular dívida de TODOS os cartões (com ou sem limite)
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      let gastoTotal = 0;
      let pagoTotal = 0;
      meses.forEach(mes => {
        const val = parseFloat(valoresAno[mes]) || 0;
        const parc = calcularParcelasCartao(cartao.nome, mes).reduce((s, c) => s + parseFloat(c.valorParcela || 0), 0);
        const total = val + parc;
        gastoTotal += total;
        const st = getStatusFarol(cartao.nome, mes);
        if (st === 'PAGO') {
          pagoTotal += total;
        } else if (typeof st === 'number') {
          pagoTotal += parseFloat(st) || 0;
        }
      });
      const div = Math.max(gastoTotal - pagoTotal, 0);
      if (div > 0) {
        console.log(`💳 ${cartao.nome}: Gasto=${gastoTotal.toFixed(2)} Pago=${pagoTotal.toFixed(2)} Dívida=${div.toFixed(2)}`);
      }
      totalDivida += div;

      // Somar limites apenas dos cartões que têm limite definido
      if (cartao.limite > 0) {
        totalLimites += cartao.limite;
      }
    });
    console.log(`🔴 DÍVIDA TOTAL: R$ ${totalDivida.toFixed(2)} (${totalLimites > 0 ? (totalDivida / totalLimites * 100).toFixed(0) : 0}% dos limites)`);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCB3 Cart\xF5es de Cr\xE9dito - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('compraParcelada'),
      className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm"
    }, "\uD83D\uDED2 Nova Compra Parcelada"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novoCartao'),
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm"
    }, "\u2795 Novo Cart\xE3o"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-6 gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-3 cursor-pointer transition-transform hover:scale-105"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\uD83D\uDCB3 TOTAL M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-white"
    }, "R$ ", totalGeralMes.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-0.5"
    }, mesAtual.toUpperCase(), "/", anoAtual)), Object.entries(totaisPorCartao).sort((a, b) => b[1] - a[1]) // Ordena por valor (maior primeiro)
    .map(([nomeCartao, valor]) => {
      const percentual = totalGeralMes > 0 ? valor / totalGeralMes * 100 : 0;
      const cartao = cartoes.find(c => c.nome === nomeCartao);
      const limite = cartao?.limite || 0;
      return /*#__PURE__*/React.createElement("div", {
        key: nomeCartao,
        className: "bg-white rounded-lg shadow-md p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border border-gray-200",
        onClick: () => {
          const elemento = document.getElementById(`cartao-${nomeCartao}`);
          if (elemento) {
            elemento.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            elemento.style.transform = 'scale(1.02)';
            setTimeout(() => {
              elemento.style.transform = 'scale(1)';
            }, 300);
          }
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-600 text-xs font-semibold mb-1 truncate"
      }, nomeCartao), /*#__PURE__*/React.createElement("div", {
        className: "text-lg font-bold text-blue-600"
      }, "R$ ", valor.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mt-0.5"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-blue-600 text-xs font-semibold"
      }, percentual.toFixed(0), "%"), limite > 0 && /*#__PURE__*/React.createElement("div", {
        className: "text-gray-500 text-xs",
        title: "Limite do cart\xE3o"
      }, "Lim: ", limite.toFixed(0))), limite > 0 && /*#__PURE__*/React.createElement("div", {
        className: "mt-1.5"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-full bg-gray-200 rounded-full h-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: `h-1 rounded-full ${valor / limite * 100 > 80 ? 'bg-red-500' : valor / limite * 100 > 60 ? 'bg-yellow-500' : 'bg-green-500'}`,
        style: {
          width: `${Math.min(valor / limite * 100, 100)}%`
        }
      }))));
    }), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-md p-3 transition-transform hover:scale-105"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\uD83D\uDD34 D\xCDVIDA TOTAL"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-white"
    }, "R$ ", totalDivida.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-0.5"
    }, totalLimites > 0 ? `${(totalDivida / totalLimites * 100).toFixed(0)}% limites` : 'Ano completo'))), cartoes.map(cartao => {
      const parcelasCartao = calcularParcelasCartao(cartao.nome, mesAtual);
      const valoresAno = cartao.valores?.[anoAtual] || {};
      const valorBase = valoresAno[mesAtual] || 0;
      const valorParcelas = parcelasCartao.reduce((sum, c) => sum + c.valorParcela, 0);
      const valorTotal = valorBase + valorParcelas;
      const statusFatura = calcularStatusFatura(cartao, mesAtual);
      const limite = cartao.limite || 0;

      // Calcular limite disponível real (TODOS OS MESES)
      const calcularLimiteDisponivel = () => {
        const mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        console.log(`\n💳 ========== CÁLCULO LIMITE: ${cartao.nome} ==========`);

        // 1. VALORES BASE: Somar valores cadastrados em cada mês
        let totalValoresBase = 0;
        mesesOrdem.forEach(mes => {
          const valorMes = valoresAno[mes] || 0;
          if (valorMes > 0) {
            console.log(`  📅 ${mes.toUpperCase()}: Valor base = R$ ${valorMes.toFixed(2)}`);
            totalValoresBase += valorMes;
          }
        });
        console.log(`  ✅ Total valores base: R$ ${totalValoresBase.toFixed(2)}`);

        // 2. PARCELAS: Somar todas as parcelas de TODOS os meses
        let totalParcelas = 0;
        mesesOrdem.forEach(mes => {
          const parcelasDoMes = calcularParcelasCartao(cartao.nome, mes);
          const valorParcelasMes = parcelasDoMes.reduce((sum, c) => sum + c.valorParcela, 0);
          if (valorParcelasMes > 0) {
            console.log(`  📦 ${mes.toUpperCase()}: Parcelas = R$ ${valorParcelasMes.toFixed(2)} (${parcelasDoMes.length} parcelas)`);
            totalParcelas += valorParcelasMes;
          }
        });
        console.log(`  ✅ Total parcelas: R$ ${totalParcelas.toFixed(2)}`);

        // 3. TOTAL GASTO (Base + Parcelas)
        const totalGasto = totalValoresBase + totalParcelas;
        console.log(`  💰 TOTAL GASTO NO ANO: R$ ${totalGasto.toFixed(2)}`);

        // 4. PAGAMENTOS: Subtrair valores já pagos (libera o limite)
        let totalPago = 0;
        mesesOrdem.forEach(mes => {
          const status = getStatusFarol(cartao.nome, mes);
          const valorMes = valoresAno[mes] || 0;
          const parcelasDoMes = calcularParcelasCartao(cartao.nome, mes);
          const valorParcelasMes = parcelasDoMes.reduce((sum, c) => sum + c.valorParcela, 0);
          const totalMes = valorMes + valorParcelasMes;
          if (status === 'PAGO') {
            // Pagamento integral (libera valor base + parcelas)
            console.log(`  ✅ ${mes.toUpperCase()}: PAGO INTEGRAL = R$ ${totalMes.toFixed(2)}`);
            totalPago += totalMes;
          } else if (typeof status === 'number') {
            // Pagamento parcial
            console.log(`  💵 ${mes.toUpperCase()}: PAGO PARCIAL = R$ ${status.toFixed(2)}`);
            totalPago += status;
          }
        });
        console.log(`  ✅ Total pago (libera limite): R$ ${totalPago.toFixed(2)}`);

        // 5. USADO = Total Gasto - Total Pago
        const usado = totalGasto - totalPago;
        console.log(`  🔴 USADO (Gasto - Pago): R$ ${usado.toFixed(2)}`);

        // 6. DISPONÍVEL = Limite - Usado
        const disponivel = limite > 0 ? Math.max(limite - usado, 0) : 0;
        const percentualUsado = limite > 0 ? usado / limite * 100 : 0;
        console.log(`  📊 LIMITE: R$ ${limite.toFixed(2)}`);
        console.log(`  🟢 DISPONÍVEL: R$ ${disponivel.toFixed(2)}`);
        console.log(`  📈 PERCENTUAL USADO: ${percentualUsado.toFixed(1)}%`);
        console.log(`  ========================================\n`);
        return {
          totalCadastrado: totalValoresBase,
          totalParcelas: totalParcelas,
          totalGasto: totalGasto,
          totalPago: totalPago,
          usado: usado,
          disponivel: disponivel,
          percentual: percentualUsado
        };
      };
      const limiteInfo = calcularLimiteDisponivel();
      const projecao = calcularProjecao(cartao);
      return /*#__PURE__*/React.createElement("div", {
        key: cartao.id,
        id: `cartao-${cartao.nome}`,
        className: "bg-white rounded-xl shadow-lg p-4",
        style: {
          transition: 'transform 0.3s ease'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start mb-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mb-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-lg font-bold text-gray-800"
      }, cartao.nome), /*#__PURE__*/React.createElement("span", {
        className: `px-2 py-1 rounded text-xs font-bold ${statusFatura === 'ABERTA' ? 'bg-blue-100 text-blue-700' : statusFatura === 'FECHADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`
      }, statusFatura === 'ABERTA' ? '⏳ FATURA ABERTA' : statusFatura === 'FECHADA' ? '✅ FATURA FECHADA' : '⚠️ VENCIDA')), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500 space-y-1"
      }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC5 Fecha dia ", cartao.diaFechamento || cartao.vencimento - 7, " \u2022 Vence dia ", cartao.vencimento), valorParcelas > 0 && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCE6 ", parcelasCartao.length, " parcela(s) ativas: R$ ", valorParcelas.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setItemEditando(cartao);
          setTipoEditando('cartao');
          setModalAberto('editar');
        },
        className: "px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
      }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
        onClick: () => duplicarCartao(cartao),
        className: "px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm"
      }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
        onClick: () => deletarCartao(cartao.id),
        className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
      }, "\uD83D\uDDD1\uFE0F"))), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-blue-50 rounded-lg p-3 border border-blue-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-1"
      }, "\uD83D\uDCB3 FATURA ", mesAtual.toUpperCase()), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mb-2"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        step: "0.01",
        value: valorBase,
        onChange: e => editarValorCartao(cartao.id, mesAtual, e.target.value),
        className: "flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-right",
        placeholder: "Base"
      }), /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-gray-500"
      }, "+"), /*#__PURE__*/React.createElement("span", {
        className: "text-sm text-gray-600"
      }, valorParcelas.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "text-xl font-bold text-blue-600"
      }, "R$ ", valorTotal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "bg-gray-50 rounded-lg p-3 border border-gray-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-3"
      }, "\uD83C\uDFAF LIMITE"), limite > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "space-y-2 mb-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between text-sm"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Limite Total:"), /*#__PURE__*/React.createElement("span", {
        className: "font-semibold text-gray-800"
      }, "R$ ", limite.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between text-sm"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Limite Utilizado:"), /*#__PURE__*/React.createElement("span", {
        className: "font-semibold text-red-600"
      }, "R$ ", limiteInfo.usado.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between text-sm border-t pt-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600 font-semibold"
      }, "Limite Dispon\xEDvel:"), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-green-600"
      }, "R$ ", limiteInfo.disponivel.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
        className: "w-full bg-gray-200 rounded-full h-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: `h-3 rounded-full transition-all ${limiteInfo.percentual > 80 ? 'bg-red-500' : limiteInfo.percentual > 50 ? 'bg-yellow-500' : 'bg-green-500'}`,
        style: {
          width: `${Math.min(limiteInfo.percentual, 100)}%`
        }
      }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500 mb-1"
      }, "N\xE3o definido"), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-blue-600 font-semibold"
      }, "Gasto atual: R$ ", valorTotal.toFixed(2)), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          const novoLimite = prompt('Defina o limite do cartão:', '10000');
          if (novoLimite && !isNaN(novoLimite)) {
            const cartoesAtualizados = cartoes.map(c => c.id === cartao.id ? {
              ...c,
              limite: parseFloat(novoLimite)
            } : c);
            console.log('✅ Atualizando limite:', novoLimite);
            setCartoes(cartoesAtualizados);
            // Força salvamento imediato
            localStorage.setItem('cartoes', JSON.stringify(cartoesAtualizados));
            alert(`✅ Limite definido: R$ ${parseFloat(novoLimite).toFixed(2)}`);
          }
        },
        className: "mt-2 text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      }, "\u2795 Definir Limite"))), parcelasCartao.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "bg-green-50 rounded-lg p-3 border border-green-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-2"
      }, "\uD83D\uDCE6 PARCELAS ATIVAS"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-1 max-h-20 overflow-y-auto"
      }, parcelasCartao.map((p, idx) => /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "text-xs text-gray-700"
      }, p.descricao, ": ", p.parcelaAtual, "/", p.totalParcelas, " \u2022 R$ ", p.valorParcela.toFixed(2)))))), /*#__PURE__*/React.createElement("div", {
        className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-2"
      }, "\uD83D\uDCC8 PROJE\xC7\xC3O PR\xD3XIMOS 6 MESES"), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-6 gap-2"
      }, projecao.map((p, idx) => /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "text-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs font-semibold text-gray-700"
      }, p.mes), /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-bold text-purple-600"
      }, "R$ ", p.valor.toFixed(0)))))));
    }));
  };
  const TelaGastosFixos = () => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

    // FILTRAR POR MÊS E ANO ATUAL
    const gastosDoMesAno = gastosFixos.filter(g => {
      // Se tem mes e ano definidos, filtrar por eles
      if (g.mes && g.ano) {
        return g.mes === mesAtual && g.ano === anoAtual;
      }
      // Se não tem mes/ano, é gasto fixo permanente (aparece sempre)
      return true;
    });

    // Categorias únicas dos gastos fixos do mês
    const categorias = ['TODAS', ...new Set(gastosDoMesAno.map(g => g.categoria))];

    // Calcular total por cada categoria
    const totaisPorCategoria = {};
    gastosDoMesAno.forEach(g => {
      if (!totaisPorCategoria[g.categoria]) {
        totaisPorCategoria[g.categoria] = 0;
      }
      totaisPorCategoria[g.categoria] += g.valor;
    });

    // Total geral
    const totalGeral = gastosDoMesAno.reduce((sum, g) => sum + g.valor, 0);

    // Filtrar por categoria
    const gastosFiltrados = categoriaFiltro === 'TODAS' ? gastosDoMesAno : gastosDoMesAno.filter(g => g.categoria === categoriaFiltro);

    // Calcular total por categoria
    const totalCategoria = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83C\uDFE0 Gastos Fixos - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('gerenciarCategorias'),
      className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
    }, "\uD83C\uDFF7\uFE0F Categorias"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novoGastoFixo'),
      className: "px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
    }, "\u2795 Novo Gasto"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: `bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${categoriaFiltro === 'TODAS' ? 'ring-4 ring-purple-300' : ''}`,
      onClick: () => setCategoriaFiltro('TODAS')
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\uD83D\uDCB0 TOTAL GERAL"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-white"
    }, "R$ ", totalGeral.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-1"
    }, gastosFixos.length, " gastos")), Object.entries(totaisPorCategoria).sort((a, b) => b[1] - a[1]) // Ordena por valor (maior primeiro)
    .map(([categoria, total]) => {
      const quantidade = gastosFixos.filter(g => g.categoria === categoria).length;
      const percentual = totalGeral > 0 ? total / totalGeral * 100 : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: categoria,
        className: `bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${categoriaFiltro === categoria ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200'}`,
        onClick: () => setCategoriaFiltro(categoria)
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-600 text-xs font-semibold mb-1 truncate"
      }, categoria), /*#__PURE__*/React.createElement("div", {
        className: "text-xl font-bold text-purple-600"
      }, "R$ ", total.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mt-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-500 text-xs"
      }, quantidade, " gasto", quantidade > 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
        className: "text-purple-600 text-xs font-semibold"
      }, percentual.toFixed(0), "%")));
    })), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDD0D Mostrando: ", /*#__PURE__*/React.createElement("span", {
      className: "text-purple-600"
    }, categoriaFiltro))), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold text-purple-600"
    }, "R$ ", totalCategoria.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, gastosFiltrados.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-12 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-4xl mb-3"
    }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-2"
    }, "Nenhum gasto encontrado"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, categoriaFiltro === 'TODAS' ? 'Adicione seu primeiro gasto fixo!' : `Nenhum gasto na categoria "${categoriaFiltro}"`)) : (() => {
      // Agrupar gastos por data de vencimento
      const gastosPorData = {};
      gastosFiltrados.forEach(gasto => {
        const dia = gasto.vencimento;
        if (!gastosPorData[dia]) {
          gastosPorData[dia] = [];
        }
        gastosPorData[dia].push(gasto);
      });

      // Ordenar dias
      const diasOrdenados = Object.keys(gastosPorData).sort((a, b) => parseInt(a) - parseInt(b));
      return diasOrdenados.map(dia => {
        const gastosDoDia = gastosPorData[dia];
        const totalDia = gastosDoDia.reduce((sum, g) => sum + g.valor, 0);
        const hoje = new Date().getDate();
        const isHoje = parseInt(dia) === hoje;

        // Calcular dia da semana
        const dataAtual = new Date();
        const anoNum = dataAtual.getFullYear();
        const mesNum = dataAtual.getMonth();
        const dataVencimento = new Date(anoNum, mesNum, parseInt(dia));
        const diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataVencimento.getDay()];
        return /*#__PURE__*/React.createElement("div", {
          key: dia,
          className: `flex items-start gap-3 p-3 rounded-lg transition-all ${isHoje ? 'bg-purple-50 border-2 border-purple-500' : 'bg-purple-50 border border-purple-200'}`
        }, /*#__PURE__*/React.createElement("div", {
          className: `flex-shrink-0 w-16 text-center ${isHoje ? 'text-purple-600' : 'text-gray-600'}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-semibold"
        }, diaSemana), /*#__PURE__*/React.createElement("div", {
          className: `text-2xl font-bold ${isHoje ? 'text-purple-700' : 'text-gray-700'}`
        }, dia), isHoje && /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-bold text-purple-600"
        }, "HOJE")), /*#__PURE__*/React.createElement("div", {
          className: "flex-1"
        }, /*#__PURE__*/React.createElement("div", {
          className: "space-y-2"
        }, gastosDoDia.map(gasto => /*#__PURE__*/React.createElement("div", {
          key: gasto.id,
          className: "flex items-center justify-between bg-white rounded p-2 shadow-sm"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex-1"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center gap-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "font-semibold text-sm text-gray-800"
        }, gasto.descricao), gasto.temporario && gasto.totalParcelas && /*#__PURE__*/React.createElement("span", {
          className: "px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded"
        }, gasto.parcelaAtual || 1, "/", gasto.totalParcelas)), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-gray-500"
        }, gasto.categoria)), /*#__PURE__*/React.createElement("div", {
          className: "flex items-center gap-2"
        }, /*#__PURE__*/React.createElement("input", {
          type: "number",
          step: "0.01",
          value: gasto.valor,
          onChange: e => editarValorGastoFixo(gasto.id, e.target.value),
          className: "w-28 px-2 py-1 border border-gray-300 rounded text-right text-sm font-bold"
        }), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            setItemEditando(gasto);
            setTipoEditando('fixo');
            setModalAberto('editar');
          },
          className: "px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
        }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
          onClick: () => duplicarGastoFixo(gasto),
          className: "px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-sm"
        }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
          onClick: () => deletarGastoFixo(gasto.id),
          className: "px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
        }, "\uD83D\uDDD1\uFE0F")))), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-right font-bold text-gray-600 pt-1 border-t"
        }, "Total do dia: R$ ", totalDia.toFixed(2)))));
      });
    })()));
  };
  const TelaGastosVariaveis = () => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const gastosDoMes = gastosVariaveis.filter(g => g.mes === mesAtual && g.ano === anoAtual);

    // Calcular total por cada categoria
    const totaisPorCategoria = {};
    gastosDoMes.forEach(g => {
      if (!totaisPorCategoria[g.categoria]) {
        totaisPorCategoria[g.categoria] = 0;
      }
      totaisPorCategoria[g.categoria] += g.valor;
    });
    const totalMes = gastosDoMes.reduce((sum, g) => sum + g.valor, 0);

    // Filtrar por categoria
    const gastosFiltrados = categoriaFiltro === 'TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria === categoriaFiltro);
    const totalCategoria = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCCA Gastos Vari\xE1veis - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        console.log('🔧 FORÇANDO MIGRAÇÃO MANUAL...');
        const migrados = gastosVariaveis.map(gasto => {
          if (!gasto.dataCompleta) {
            let dataGasto;

            // 1. Tentar converter data BR
            if (gasto.data && gasto.data.includes('/')) {
              const [dia, mes, ano] = gasto.data.split('/');
              dataGasto = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
              console.log('📅 Convertendo:', gasto.data, '→', dataGasto.toISOString().split('T')[0]);
            }
            // 2. Fallback: usar mês/ano
            else {
              const anoGasto = gasto.ano || 2026;
              const mesGasto = gasto.mes || 'jan';
              const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
              const mesNum = meses.indexOf(mesGasto.toLowerCase());
              dataGasto = new Date(anoGasto, mesNum >= 0 ? mesNum : 0, 1);
              console.log('📅 Fallback:', mesGasto, anoGasto, '→', dataGasto.toISOString().split('T')[0]);
            }
            return {
              ...gasto,
              dataCompleta: dataGasto.toISOString().split('T')[0],
              data: dataGasto.toLocaleDateString('pt-BR')
            };
          }
          return gasto;
        });
        console.log('💾 Salvando gastos migrados...');
        setGastosVariaveis(migrados);
        localStorage.setItem('gastosVariaveis', JSON.stringify(migrados));
        alert('✅ Migração concluída! Recarregue a página (F5)');
      },
      className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 border-2 border-green-700"
    }, "\uD83D\uDD27 Migrar Datas"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        console.log('🔍 DEBUG GASTOS VARIÁVEIS:');
        console.log('Total de gastos:', gastosVariaveis.length);
        gastosVariaveis.forEach((g, i) => {
          console.log(`Gasto ${i + 1}:`, {
            id: g.id,
            categoria: g.categoria,
            descricao: g.descricao,
            valor: g.valor,
            data: g.data,
            dataCompleta: g.dataCompleta,
            mes: g.mes,
            ano: g.ano
          });
        });
        alert('✅ Dados dos gastos no console (F12)');
      },
      className: "px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 border-2 border-blue-300"
    }, "\uD83D\uDD0D Debug"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('gerenciarCategorias'),
      className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
    }, "\uD83C\uDFF7\uFE0F Categorias"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novoGastoVariavel'),
      className: "px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
    }, "\u2795 Novo Gasto"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: `bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${categoriaFiltro === 'TODAS' ? 'ring-4 ring-orange-300' : ''}`,
      onClick: () => setCategoriaFiltro('TODAS')
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\uD83D\uDCB0 TOTAL DO M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-white"
    }, "R$ ", totalMes.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-1"
    }, gastosDoMes.length, " gastos")), Object.entries(totaisPorCategoria).sort((a, b) => b[1] - a[1]) // Ordena por valor (maior primeiro)
    .map(([categoria, total]) => {
      const quantidade = gastosDoMes.filter(g => g.categoria === categoria).length;
      const percentual = totalMes > 0 ? total / totalMes * 100 : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: categoria,
        className: `bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${categoriaFiltro === categoria ? 'border-orange-500 ring-2 ring-orange-300' : 'border-gray-200'}`,
        onClick: () => setCategoriaFiltro(categoria)
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-600 text-xs font-semibold mb-1 truncate"
      }, categoria), /*#__PURE__*/React.createElement("div", {
        className: "text-xl font-bold text-orange-600"
      }, "R$ ", total.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mt-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-500 text-xs"
      }, quantidade, " gasto", quantidade > 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
        className: "text-orange-600 text-xs font-semibold"
      }, percentual.toFixed(0), "%")));
    })), gastosDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDD0D Mostrando: ", /*#__PURE__*/React.createElement("span", {
      className: "text-orange-600"
    }, categoriaFiltro))), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold text-orange-600"
    }, "R$ ", totalCategoria.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, gastosFiltrados.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-12 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-4xl mb-3"
    }, gastosDoMes.length === 0 ? '📊' : '🔍'), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-2"
    }, gastosDoMes.length === 0 ? 'Nenhum gasto variável' : 'Nenhum gasto encontrado'), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, gastosDoMes.length === 0 ? 'Adicione gastos variáveis para este mês!' : `Nenhum gasto na categoria "${categoriaFiltro}"`)) : (() => {
      // Agrupar por CATEGORIA primeiro
      const gastosPorCategoria = {};
      gastosFiltrados.forEach(gasto => {
        const cat = gasto.categoria;
        if (!gastosPorCategoria[cat]) {
          gastosPorCategoria[cat] = [];
        }
        gastosPorCategoria[cat].push(gasto);
      });

      // Ordenar categorias alfabeticamente
      const categoriasOrdenadas = Object.keys(gastosPorCategoria).sort();
      return categoriasOrdenadas.map(categoria => {
        const gastosCategoria = gastosPorCategoria[categoria];

        // Agrupar por DATA dentro da categoria
        const gastosPorData = {};
        gastosCategoria.forEach(gasto => {
          const dataKey = gasto.dataCompleta || gasto.data || 'Sem data';
          if (!gastosPorData[dataKey]) {
            gastosPorData[dataKey] = [];
          }
          gastosPorData[dataKey].push(gasto);
        });

        // Ordenar datas (mais recente primeiro)
        const datasOrdenadas = Object.keys(gastosPorData).sort((a, b) => {
          if (a === 'Sem data') return 1;
          if (b === 'Sem data') return -1;
          return b.localeCompare(a);
        });
        const totalCategoria = gastosCategoria.reduce((sum, g) => sum + g.valor, 0);
        return /*#__PURE__*/React.createElement("div", {
          key: categoria,
          className: "bg-white rounded-xl shadow-lg overflow-hidden"
        }, /*#__PURE__*/React.createElement("div", {
          className: "bg-gradient-to-r from-orange-500 to-orange-600 p-4"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center justify-between text-white"
        }, /*#__PURE__*/React.createElement("h3", {
          className: "text-lg font-bold"
        }, "\uD83D\uDCC1 ", categoria), /*#__PURE__*/React.createElement("div", {
          className: "text-right"
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-2xl font-bold"
        }, "R$ ", totalCategoria.toFixed(2)), /*#__PURE__*/React.createElement("div", {
          className: "text-xs opacity-90"
        }, gastosCategoria.length, " gasto", gastosCategoria.length > 1 ? 's' : '')))), /*#__PURE__*/React.createElement("div", {
          className: "p-4 space-y-3"
        }, datasOrdenadas.map(dataKey => {
          const gastosDaData = gastosPorData[dataKey];
          const totalData = gastosDaData.reduce((sum, g) => sum + g.valor, 0);

          // Calcular informações da data
          let diaSemana = '';
          let diaNumero = '';
          let dataFormatada = dataKey;
          let isHoje = false;
          if (dataKey !== 'Sem data') {
            const dataObj = new Date(dataKey + 'T00:00:00');
            const hoje = new Date();
            isHoje = dataObj.toDateString() === hoje.toDateString();
            diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataObj.getDay()];
            diaNumero = dataObj.getDate();
            dataFormatada = dataObj.toLocaleDateString('pt-BR');
          }
          return /*#__PURE__*/React.createElement("div", {
            key: dataKey,
            className: `rounded-lg border-2 overflow-hidden ${isHoje ? 'border-orange-500 bg-orange-50' : 'border-orange-200 bg-orange-50'}`
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex items-center gap-3 p-2 bg-white border-b border-orange-200"
          }, /*#__PURE__*/React.createElement("div", {
            className: `flex-shrink-0 w-14 text-center ${isHoje ? 'text-orange-600' : 'text-gray-600'}`
          }, dataKey !== 'Sem data' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            className: "text-xs font-semibold"
          }, diaSemana), /*#__PURE__*/React.createElement("div", {
            className: `text-xl font-bold ${isHoje ? 'text-orange-700' : 'text-gray-700'}`
          }, diaNumero)) : /*#__PURE__*/React.createElement("div", {
            className: "text-xs font-semibold text-gray-500"
          }, "SEM DATA")), /*#__PURE__*/React.createElement("div", {
            className: "flex-1"
          }, /*#__PURE__*/React.createElement("div", {
            className: "text-sm font-semibold text-gray-700"
          }, dataFormatada), isHoje && /*#__PURE__*/React.createElement("div", {
            className: "text-xs font-bold text-orange-600"
          }, "HOJE")), /*#__PURE__*/React.createElement("div", {
            className: "text-right"
          }, /*#__PURE__*/React.createElement("div", {
            className: "text-sm font-bold text-orange-600"
          }, "R$ ", totalData.toFixed(2)), /*#__PURE__*/React.createElement("div", {
            className: "text-xs text-gray-500"
          }, gastosDaData.length, " item", gastosDaData.length > 1 ? 's' : ''))), /*#__PURE__*/React.createElement("div", {
            className: "divide-y divide-orange-100"
          }, gastosDaData.map(gasto => /*#__PURE__*/React.createElement("div", {
            key: gasto.id,
            className: "flex items-center justify-between p-2 bg-white hover:bg-orange-50 transition-colors"
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex-1 pl-4"
          }, /*#__PURE__*/React.createElement("div", {
            className: "text-sm text-gray-800"
          }, gasto.descricao || 'Sem descrição')), /*#__PURE__*/React.createElement("div", {
            className: "flex items-center gap-2"
          }, /*#__PURE__*/React.createElement("div", {
            className: "font-bold text-orange-600"
          }, "R$ ", gasto.valor.toFixed(2)), /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              setItemEditando(gasto);
              setTipoEditando('variavel');
              setModalAberto('editar');
            },
            className: "px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
          }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
            onClick: () => duplicarGastoVariavel(gasto),
            className: "px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-xs"
          }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
            onClick: () => deletarGastoVariavel(gasto.id),
            className: "px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
          }, "\uD83D\uDDD1\uFE0F"))))));
        })));
      });
    })()));
  };
  const TelaGastosExtras = () => {
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const gastosDoMes = gastosExtras.filter(g => g.mes === mesAtual && g.ano === anoAtual);

    // Calcular total por cada categoria
    const totaisPorCategoria = {};
    gastosDoMes.forEach(g => {
      if (!totaisPorCategoria[g.categoria]) {
        totaisPorCategoria[g.categoria] = 0;
      }
      totaisPorCategoria[g.categoria] += g.valor;
    });
    const totalMes = gastosDoMes.reduce((sum, g) => sum + g.valor, 0);

    // Filtrar por categoria
    const gastosFiltrados = categoriaFiltro === 'TODAS' ? gastosDoMes : gastosDoMes.filter(g => g.categoria === categoriaFiltro);
    const totalCategoria = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\u26A1 Gastos Extras - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('gerenciarCategorias'),
      className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
    }, "\uD83C\uDFF7\uFE0F Categorias"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novoGastoExtra'),
      className: "px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
    }, "\u2795 Novo Gasto Extra"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: `bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${categoriaFiltro === 'TODAS' ? 'ring-4 ring-amber-300' : ''}`,
      onClick: () => setCategoriaFiltro('TODAS')
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\u26A1 TOTAL DO M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-white"
    }, "R$ ", totalMes.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-1"
    }, gastosDoMes.length, " gastos extras")), Object.entries(totaisPorCategoria).sort((a, b) => b[1] - a[1]).map(([categoria, total]) => {
      const quantidade = gastosDoMes.filter(g => g.categoria === categoria).length;
      const percentual = totalMes > 0 ? total / totalMes * 100 : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: categoria,
        className: `bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${categoriaFiltro === categoria ? 'border-amber-500 ring-2 ring-amber-300' : 'border-gray-200'}`,
        onClick: () => setCategoriaFiltro(categoria)
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-600 text-xs font-semibold mb-1 truncate"
      }, categoria), /*#__PURE__*/React.createElement("div", {
        className: "text-xl font-bold text-amber-600"
      }, "R$ ", total.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mt-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-gray-500 text-xs"
      }, quantidade, " gasto", quantidade > 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
        className: "text-amber-600 text-xs font-semibold"
      }, percentual.toFixed(0), "%")));
    })), gastosDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDD0D Mostrando: ", /*#__PURE__*/React.createElement("span", {
      className: "text-amber-600"
    }, categoriaFiltro))), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold text-amber-600"
    }, "R$ ", totalCategoria.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, gastosFiltrados.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "text-center py-12"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-4xl mb-3"
    }, gastosDoMes.length === 0 ? '⚡' : '🔍'), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-2"
    }, gastosDoMes.length === 0 ? 'Nenhum gasto extra' : 'Nenhum gasto encontrado'), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, gastosDoMes.length === 0 ? 'Adicione gastos extras para este mês!' : `Nenhum gasto na categoria "${categoriaFiltro}"`)) : gastosFiltrados.map(gasto => /*#__PURE__*/React.createElement("div", {
      key: gasto.id,
      className: "flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-gray-800"
    }, gasto.categoria), /*#__PURE__*/React.createElement("span", {
      className: `px-2 py-1 rounded text-xs font-bold ${gasto.ano === 2026 ? 'bg-blue-100 text-blue-700' : gasto.ano === 2025 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`
    }, gasto.ano || anoAtual)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500"
    }, gasto.descricao, " \u2022 ", gasto.data)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-amber-600"
    }, "R$ ", gasto.valor.toFixed(2)), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setItemEditando(gasto);
        setTipoEditando('extra');
        setModalAberto('editar');
      },
      className: "px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold",
      title: "Editar gasto extra"
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      onClick: () => duplicarGastoExtra(gasto),
      className: "px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-semibold",
      title: "Duplicar gasto extra"
    }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
      onClick: () => deletarGastoExtra(gasto.id),
      className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm",
      title: "Excluir gasto extra"
    }, "\uD83D\uDDD1\uFE0F")))))));
  };
  const TelaReceitas = () => {
    const receitasDoMes = receitas.filter(r => r.mes === mesAtual && r.ano === anoAtual);
    const totalMes = receitasDoMes.reduce((sum, r) => sum + r.valor, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCB0 Receitas e Ganhos"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novaReceita'),
      className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2795 Nova Receita")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90"
    }, "RECEITAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-2"
    }, "R$ ", saldo.receitas.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90"
    }, "DESPESAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-2"
    }, "R$ ", saldo.despesas.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: `rounded-xl shadow-lg p-6 text-white ${saldo.positivo ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90"
    }, "SALDO"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-2"
    }, saldo.positivo ? '+' : '-', " R$ ", Math.abs(saldo.saldo).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-3"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "Receitas de ", mesAtual.toUpperCase()), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-green-600"
    }, "R$ ", totalMes.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, receitasDoMes.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "text-center py-12 text-gray-500"
    }, "Nenhuma receita registrada neste m\xEAs.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalAberto('novaReceita'),
      className: "mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2795 Adicionar Primeira Receita")) : receitasDoMes.map(receita => /*#__PURE__*/React.createElement("div", {
      key: receita.id,
      className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-gray-800"
    }, receita.categoria), receita.descricao && /*#__PURE__*/React.createElement("span", {
      className: "text-sm text-gray-500"
    }, "\u2022 ", receita.descricao), /*#__PURE__*/React.createElement("span", {
      className: `px-2 py-1 rounded text-xs font-bold ${receita.ano === 2026 ? 'bg-blue-100 text-blue-700' : receita.ano === 2025 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`
    }, receita.ano)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-1"
    }, receita.data)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-green-600"
    }, "R$ ", receita.valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setItemEditando(receita);
        setTipoEditando('receita');
        setModalAberto('editar');
      },
      className: "px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold",
      title: "Editar receita"
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      onClick: () => duplicarReceita(receita),
      className: "px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-semibold",
      title: "Duplicar receita"
    }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
      onClick: () => deletarReceita(receita.id),
      className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm",
      title: "Excluir receita"
    }, "\uD83D\uDDD1\uFE0F")))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCCA Receitas vs Despesas"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-green-600"
    }, "Receitas"), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold"
    }, "R$ ", saldo.receitas.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-green-500 h-6 rounded-full transition-all flex items-center justify-end pr-2",
      style: {
        width: saldo.receitas > 0 ? '100%' : '0%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-white font-bold"
    }, "100%")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-red-600"
    }, "Despesas"), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold"
    }, "R$ ", saldo.despesas.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-red-500 h-6 rounded-full transition-all flex items-center justify-end pr-2",
      style: {
        width: saldo.receitas > 0 ? `${saldo.despesas / saldo.receitas * 100}%` : '0%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-white font-bold"
    }, saldo.receitas > 0 ? (saldo.despesas / saldo.receitas * 100).toFixed(0) : 0, "%")))))));
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
    })(), abaAtiva === 'metasanuais' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setModalAberto('metas'),
    className: "px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
  }, "\uD83D\uDCDD Editar Metas")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-lg p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-600"
  }, "Total Planejado (Ano)"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-bold text-blue-600"
  }, "R$ ", (metas.jan + metas.fev + metas.mar + metas.abr + metas.mai + metas.jun + metas.jul + metas.ago + metas.set + metas.out + metas.nov + metas.dez).toFixed(2))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-lg p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-600"
  }, "Gasto (at\xE9 ", mesAtual.toUpperCase(), ")"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-bold text-purple-600"
  }, "R$ ", ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1).reduce((sum, mes) => sum + calcularTotais(mes).total, 0).toFixed(2))), (() => {
    const totalMetaAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1).reduce((sum, mes) => sum + (metas[mes] || 0), 0);
    const totalGastoAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1).reduce((sum, mes) => sum + calcularTotais(mes).total, 0);
    const diferenca = totalMetaAteAgora - totalGastoAteAgora;
    const dentroMeta = diferenca >= 0;
    return /*#__PURE__*/React.createElement("div", {
      className: `rounded-xl shadow-lg p-6 ${dentroMeta ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90"
    }, dentroMeta ? 'Economia' : 'Excesso'), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, "R$ ", Math.abs(diferenca).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm mt-2"
    }, dentroMeta ? '✅ Abaixo da meta' : '⚠️ Acima da meta'));
  })(), (() => {
    const mesesAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1);
    const mesesNoTarget = mesesAteAgora.filter(mes => {
      const meta = metas[mes] || 0;
      const gasto = calcularTotais(mes).total;
      return gasto <= meta;
    }).length;
    return /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Performance"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-green-600"
    }, mesesNoTarget, "/", mesesAteAgora.length), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, "Meses no target (", (mesesNoTarget / mesesAteAgora.length * 100).toFixed(0), "%)"));
  })()), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-lg p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-4"
  }, "Metas por M\xEAs"), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b-2 border-gray-200"
  }, /*#__PURE__*/React.createElement("th", {
    className: "text-left py-2 px-4 font-bold text-gray-700"
  }, "M\xEAs"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 px-4 font-bold text-gray-700"
  }, "Meta"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 px-4 font-bold text-gray-700"
  }, "Real"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 px-4 font-bold text-gray-700"
  }, "Diferen\xE7a"), /*#__PURE__*/React.createElement("th", {
    className: "text-center py-2 px-4 font-bold text-gray-700"
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 px-4 font-bold text-gray-700"
  }, "%"))), /*#__PURE__*/React.createElement("tbody", null, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => {
    const meta = metas[mes] || 0;
    const real = calcularTotais(mes).total;
    const diferenca = meta - real;
    const percentual = meta > 0 ? real / meta * 100 : 0;
    const dentroMeta = real <= meta && real > 0;
    const pendente = real === 0;
    return /*#__PURE__*/React.createElement("tr", {
      key: mes,
      className: `border-b border-gray-100 hover:bg-gray-50 ${mes === mesAtual ? 'bg-blue-50' : ''}`
    }, /*#__PURE__*/React.createElement("td", {
      className: "py-2 px-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold uppercase"
    }, mes), mes === mesAtual && /*#__PURE__*/React.createElement("span", {
      className: "ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded"
    }, "Atual")), /*#__PURE__*/React.createElement("td", {
      className: "text-right py-2 px-4 text-blue-600 font-semibold"
    }, "R$ ", meta.toFixed(2)), /*#__PURE__*/React.createElement("td", {
      className: "text-right py-2 px-4 font-semibold"
    }, "R$ ", real.toFixed(2)), /*#__PURE__*/React.createElement("td", {
      className: `text-right py-2 px-4 font-bold ${diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`
    }, diferenca >= 0 ? '+' : '', "R$ ", diferenca.toFixed(2)), /*#__PURE__*/React.createElement("td", {
      className: "text-center py-2 px-4 text-2xl"
    }, pendente ? '⏳' : dentroMeta ? '✅' : '❌'), /*#__PURE__*/React.createElement("td", {
      className: `text-right py-2 px-4 font-bold ${dentroMeta ? 'text-green-600' : pendente ? 'text-gray-400' : 'text-red-600'}`
    }, percentual.toFixed(0), "%"));
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-lg p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-4"
  }, "Evolu\xE7\xE3o Anual"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => {
    const meta = metas[mes] || 0;
    const real = calcularTotais(mes).total;
    const maxValor = Math.max(meta, real, 1);
    const larguraMeta = meta / maxValor * 100;
    const larguraReal = real / maxValor * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: mes
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 mb-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold uppercase text-gray-700 w-12"
    }, mes), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 relative h-10"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute top-0 left-0 h-4 bg-blue-200 rounded",
      style: {
        width: `${larguraMeta}%`
      },
      title: `Meta: R$ ${meta.toFixed(2)}`
    }), /*#__PURE__*/React.createElement("div", {
      className: `absolute top-5 left-0 h-4 rounded ${real <= meta ? 'bg-green-500' : 'bg-red-500'}`,
      style: {
        width: `${larguraReal}%`
      },
      title: `Real: R$ ${real.toFixed(2)}`
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3 mt-3 text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 bg-blue-200 rounded"
  }), /*#__PURE__*/React.createElement("span", null, "Meta Planejada")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 bg-green-500 rounded"
  }), /*#__PURE__*/React.createElement("span", null, "Gasto Real (Dentro)")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 bg-red-500 rounded"
  }), /*#__PURE__*/React.createElement("span", null, "Gasto Real (Acima)")))));, abaAtiva === 'orcamento' && /*#__PURE__*/React.createElement("div", {
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
      onClick: () => setModalAberto('orcamento'),
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2699\uFE0F Definir Or\xE7amento")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Or\xE7ado"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-blue-600"
    }, "R$ ", orcadoTotal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Gasto"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-purple-600"
    }, "R$ ", gastadoTotal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: `rounded-xl shadow-lg p-6 ${dentroOrcamento ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90"
    }, dentroOrcamento ? 'Sobrou' : 'Excedeu'), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, "R$ ", Math.abs(diferenca).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm mt-2"
    }, dentroOrcamento ? '✅ Dentro do orçamento' : '⚠️ Acima do orçamento'))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-3"
    }, "Por Categoria"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "\uD83D\uDCB3 Cart\xF5es"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "R$ ", totais.cartoes.toFixed(2), " / R$ ", orcamento.cartoes.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: `text-2xl font-bold ${totais.cartoes <= orcamento.cartoes ? 'text-green-600' : 'text-red-600'}`
    }, (totais.cartoes / orcamento.cartoes * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      className: `text-sm ${orcamento.cartoes - totais.cartoes >= 0 ? 'text-green-600' : 'text-red-600'}`
    }, orcamento.cartoes - totais.cartoes >= 0 ? '✅' : '⚠️', " R$ ", Math.abs(orcamento.cartoes - totais.cartoes).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: `h-4 rounded-full ${totais.cartoes <= orcamento.cartoes ? 'bg-green-500' : 'bg-red-500'}`,
      style: {
        width: `${Math.min(totais.cartoes / orcamento.cartoes * 100, 100)}%`
      }
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "\uD83C\uDFE0 Gastos Fixos"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "R$ ", totais.fixos.toFixed(2), " / R$ ", orcamento.fixos.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: `text-2xl font-bold ${totais.fixos <= orcamento.fixos ? 'text-green-600' : 'text-red-600'}`
    }, (totais.fixos / orcamento.fixos * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      className: `text-sm ${orcamento.fixos - totais.fixos >= 0 ? 'text-green-600' : 'text-red-600'}`
    }, orcamento.fixos - totais.fixos >= 0 ? '✅' : '⚠️', " R$ ", Math.abs(orcamento.fixos - totais.fixos).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: `h-4 rounded-full ${totais.fixos <= orcamento.fixos ? 'bg-green-500' : 'bg-red-500'}`,
      style: {
        width: `${Math.min(totais.fixos / orcamento.fixos * 100, 100)}%`
      }
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "\uD83D\uDCCA Gastos Vari\xE1veis"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "R$ ", totais.variaveis.toFixed(2), " / R$ ", orcamento.variaveis.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: `text-2xl font-bold ${totais.variaveis <= orcamento.variaveis ? 'text-green-600' : 'text-red-600'}`
    }, orcamento.variaveis > 0 ? (totais.variaveis / orcamento.variaveis * 100).toFixed(0) : 0, "%"), /*#__PURE__*/React.createElement("div", {
      className: `text-sm ${orcamento.variaveis - totais.variaveis >= 0 ? 'text-green-600' : 'text-red-600'}`
    }, orcamento.variaveis - totais.variaveis >= 0 ? '✅' : '⚠️', " R$ ", Math.abs(orcamento.variaveis - totais.variaveis).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: `h-4 rounded-full ${totais.variaveis <= orcamento.variaveis ? 'bg-green-500' : 'bg-red-500'}`,
      style: {
        width: orcamento.variaveis > 0 ? `${Math.min(totais.variaveis / orcamento.variaveis * 100, 100)}%` : '0%'
      }
    })))))), (abaAtiva === 'orcamento' && subAba === 'premes') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
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
    }, "Diferen\xE7a: R$ ", Math.abs(totalPlanejado - totais.total).toFixed(2))))), abaAtiva === 'metas' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {display:'flex', gap:'8px', marginBottom:'4px'}
    }, /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-metas'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba!=='dividas'?'#6366f1':'#f3f4f6', color: subAba!=='dividas'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🎯 Metas"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-dividas'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='dividas'?'#6366f1':'#f3f4f6', color: subAba==='dividas'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "💳 Dívidas")),/*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83C\uDFAF Suas Metas Financeiras"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Defina e acompanhe seus objetivos")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setModalAberto('novaMeta');
      },
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2795 Nova Meta")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-4 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Total em Metas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-600"
    }, "R$ ", totalMetasValor.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-1"
    }, metasFinanceiras.filter(m => !m.concluida).length, " ativas")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "J\xE1 Acumulado"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-green-600"
    }, "R$ ", totalMetasAtual.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-1"
    }, percentualMetasGeral.toFixed(0), "% do total")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Falta Acumular"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-orange-600"
    }, "R$ ", (totalMetasValor - totalMetasAtual).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-1"
    }, (100 - percentualMetasGeral).toFixed(0), "% restante")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Conclu\xEDdas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-purple-600"
    }, metasConcluidas.length), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-1"
    }, "\uD83C\uDF89 Objetivos alcan\xE7ados"))), metasFinanceiras.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-12 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl mb-4"
    }, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-2"
    }, "Nenhuma meta cadastrada"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600 mb-3"
    }, "Comece definindo seus objetivos financeiros!"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setModalAberto('novaMeta');
      },
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2795 Criar Primeira Meta")) : /*#__PURE__*/React.createElement(React.Fragment, null, metasCurtoPrazo.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\u26A1 Curto Prazo (at\xE9 1 ano)"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, metasCurtoPrazo.map(meta => {
      const progresso = meta.valorAtual / meta.valor * 100;
      return /*#__PURE__*/React.createElement("div", {
        key: meta.id,
        className: "border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start mb-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mb-1"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "font-bold text-gray-800"
      }, meta.titulo), /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold"
      }, meta.categoria)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-600"
      }, "Meta: R$ ", meta.valor.toFixed(2), " \u2022 Atual: R$ ", meta.valorAtual.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          const valor = prompt('Digite o valor acumulado:', meta.valorAtual);
          if (valor !== null) atualizarProgressoMeta(meta.id, valor);
        },
        className: "px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200",
        title: "Atualizar progresso"
      }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("button", {
        onClick: () => concluirMeta(meta.id),
        className: "px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200",
        title: "Marcar como conclu\xEDda"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: () => deletarMeta(meta.id),
        className: "px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200",
        title: "Excluir"
      }, "\uD83D\uDDD1\uFE0F"))), /*#__PURE__*/React.createElement("div", {
        className: "mb-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between text-sm mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Progresso"), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-blue-600"
      }, progresso.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
        className: "w-full bg-gray-200 rounded-full h-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all",
        style: {
          width: `${Math.min(progresso, 100)}%`
        }
      }))), meta.valorAtual < meta.valor && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold text-blue-800 mb-2"
      }, "\uD83D\uDCB0 Plano de Investimento:"), (() => {
        const falta = meta.valor - meta.valorAtual;

        // Calcular meses baseado na data meta ou prazo
        let mesesParaCalculo;
        let mensagemData = '';
        if (meta.dataMeta) {
          const hoje = new Date();
          const dataFim = new Date(meta.dataMeta);
          const diffTime = dataFim - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          mesesParaCalculo = Math.max(1, Math.ceil(diffDays / 30));
          mensagemData = ` (até ${dataFim.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          })})`;
        } else {
          mesesParaCalculo = 12; // padrão curto prazo
          mensagemData = ' (sem data definida)';
        }
        const porMes = falta / mesesParaCalculo;
        const porSemana = porMes / 4;
        const porDia = porMes / 30;
        return /*#__PURE__*/React.createElement("div", {
          className: "space-y-1 text-xs text-blue-700"
        }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC5 ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por m\xEAs:"), " R$ ", porMes.toFixed(2)), /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC6 ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por semana:"), " R$ ", porSemana.toFixed(2)), /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCCC ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por dia:"), " R$ ", porDia.toFixed(2)), /*#__PURE__*/React.createElement("div", {
          className: "mt-2 text-blue-600"
        }, "\u23F1\uFE0F Para alcan\xE7ar em ", mesesParaCalculo, " ", mesesParaCalculo === 1 ? 'mês' : 'meses', mensagemData));
      })()));
    }))), metasMedioPrazo.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCC5 M\xE9dio Prazo (1-5 anos)"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, metasMedioPrazo.map(meta => {
      const progresso = meta.valorAtual / meta.valor * 100;
      return /*#__PURE__*/React.createElement("div", {
        key: meta.id,
        className: "border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start mb-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mb-1"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "font-bold text-gray-800"
      }, meta.titulo), /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold"
      }, meta.categoria)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-600"
      }, "Meta: R$ ", meta.valor.toFixed(2), " \u2022 Atual: R$ ", meta.valorAtual.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          const valor = prompt('Digite o valor acumulado:', meta.valorAtual);
          if (valor !== null) atualizarProgressoMeta(meta.id, valor);
        },
        className: "px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
      }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("button", {
        onClick: () => concluirMeta(meta.id),
        className: "px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: () => deletarMeta(meta.id),
        className: "px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
      }, "\uD83D\uDDD1\uFE0F"))), /*#__PURE__*/React.createElement("div", {
        className: "mb-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between text-sm mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Progresso"), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-green-600"
      }, progresso.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
        className: "w-full bg-gray-200 rounded-full h-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all",
        style: {
          width: `${Math.min(progresso, 100)}%`
        }
      }))), meta.valorAtual < meta.valor && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold text-green-800 mb-2"
      }, "\uD83D\uDCB0 Plano de Investimento:"), (() => {
        const falta = meta.valor - meta.valorAtual;

        // Calcular meses baseado na data meta ou prazo
        let mesesParaCalculo;
        if (meta.dataMeta) {
          const hoje = new Date();
          const dataFim = new Date(meta.dataMeta);
          const diffTime = dataFim - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          mesesParaCalculo = Math.max(1, Math.ceil(diffDays / 30));
        } else {
          mesesParaCalculo = 60; // padrão médio prazo
        }
        const porMes = falta / mesesParaCalculo;
        const porSemana = porMes / 4;
        const porDia = porMes / 30;
        return /*#__PURE__*/React.createElement("div", {
          className: "space-y-1 text-xs text-green-700"
        }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC5 ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por m\xEAs:"), " R$ ", porMes.toFixed(2)), /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC6 ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por semana:"), " R$ ", porSemana.toFixed(2)), /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCCC ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por dia:"), " R$ ", porDia.toFixed(2)), /*#__PURE__*/React.createElement("div", {
          className: "mt-2 text-green-600"
        }, "\u23F1\uFE0F Para alcan\xE7ar em ", mesesParaCalculo, " ", mesesParaCalculo === 1 ? 'mês' : 'meses', meta.dataMeta && ` (até ${new Date(meta.dataMeta).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        })})`));
      })()));
    }))), metasLongoPrazo.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83C\uDFC6 Longo Prazo (5+ anos)"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, metasLongoPrazo.map(meta => {
      const progresso = meta.valorAtual / meta.valor * 100;
      return /*#__PURE__*/React.createElement("div", {
        key: meta.id,
        className: "border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start mb-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mb-1"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "font-bold text-gray-800"
      }, meta.titulo), /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-semibold"
      }, meta.categoria)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-600"
      }, "Meta: R$ ", meta.valor.toFixed(2), " \u2022 Atual: R$ ", meta.valorAtual.toFixed(2))), /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          const valor = prompt('Digite o valor acumulado:', meta.valorAtual);
          if (valor !== null) atualizarProgressoMeta(meta.id, valor);
        },
        className: "px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
      }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("button", {
        onClick: () => concluirMeta(meta.id),
        className: "px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: () => deletarMeta(meta.id),
        className: "px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
      }, "\uD83D\uDDD1\uFE0F"))), /*#__PURE__*/React.createElement("div", {
        className: "mb-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between text-sm mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Progresso"), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-purple-600"
      }, progresso.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
        className: "w-full bg-gray-200 rounded-full h-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all",
        style: {
          width: `${Math.min(progresso, 100)}%`
        }
      }))), meta.valorAtual < meta.valor && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold text-purple-800 mb-2"
      }, "\uD83D\uDCB0 Plano de Investimento:"), (() => {
        const falta = meta.valor - meta.valorAtual;

        // Calcular meses baseado na data meta ou prazo
        let mesesParaCalculo;
        if (meta.dataMeta) {
          const hoje = new Date();
          const dataFim = new Date(meta.dataMeta);
          const diffTime = dataFim - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          mesesParaCalculo = Math.max(1, Math.ceil(diffDays / 30));
        } else {
          mesesParaCalculo = 120; // padrão longo prazo
        }
        const porMes = falta / mesesParaCalculo;
        const porSemana = porMes / 4;
        const porDia = porMes / 30;
        return /*#__PURE__*/React.createElement("div", {
          className: "space-y-1 text-xs text-purple-700"
        }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC5 ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por m\xEAs:"), " R$ ", porMes.toFixed(2)), /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC6 ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por semana:"), " R$ ", porSemana.toFixed(2)), /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCCC ", /*#__PURE__*/React.createElement("span", {
          className: "font-bold"
        }, "Por dia:"), " R$ ", porDia.toFixed(2)), /*#__PURE__*/React.createElement("div", {
          className: "mt-2 text-purple-600"
        }, "\u23F1\uFE0F Para alcan\xE7ar em ", mesesParaCalculo, " ", mesesParaCalculo === 1 ? 'mês' : 'meses', meta.dataMeta && ` (até ${new Date(meta.dataMeta).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        })})`));
      })()));
    }))), metasConcluidas.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83C\uDF89 Metas Conclu\xEDdas"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, metasConcluidas.map(meta => /*#__PURE__*/React.createElement("div", {
      key: meta.id,
      className: "flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-green-800 line-through"
    }, meta.titulo), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-green-600"
    }, "R$ ", meta.valor.toFixed(2), " \u2713")), /*#__PURE__*/React.createElement("button", {
      onClick: () => deletarMeta(meta.id),
      className: "px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
    }, "\uD83D\uDDD1\uFE0F"))))))), (abaAtiva === 'metas' && subAba === 'dividas') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
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
    }, "Voc\xEA est\xE1 gastando tudo ou mais que sua renda. Para usar as estrat\xE9gias de pagamento, \xE9 preciso ter sobra mensal. Revise seus gastos no or\xE7amento!")))))), (abaAtiva === 'simulacoes' && subAba === 'compra') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {display:'flex', gap:'8px', marginBottom:'4px'}
    }, /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-compra'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='compra'?'#6366f1':'#f3f4f6', color: subAba==='compra'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🛒 Simul. Compra"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-simulador'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='simulador'?'#6366f1':'#f3f4f6', color: subAba==='simulador'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🎲 Simulador"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-timeline'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='timeline'?'#6366f1':'#f3f4f6', color: subAba==='timeline'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "📈 Timeline")),/*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDED2 Simulador de Compra"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Simule uma compra e veja o impacto no seu or\xE7amento"))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-base font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCDD Detalhes da Compra"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Nome do Produto/Servi\xE7o"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      id: "simNomeProduto",
      placeholder: "Ex: Geladeira, TV, Curso...",
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor Total"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      id: "simValorTotal",
      step: "0.01",
      placeholder: "0.00",
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Forma de Pagamento"), /*#__PURE__*/React.createElement("select", {
      id: "simFormaPagamento",
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none",
      onChange: e => {
        const parcelasDiv = document.getElementById('simParcelasDiv');
        if (e.target.value === 'parcelado') {
          parcelasDiv.style.display = 'block';
        } else {
          parcelasDiv.style.display = 'none';
        }
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "avista"
    }, "\xC0 Vista"), /*#__PURE__*/React.createElement("option", {
      value: "parcelado"
    }, "Parcelado")))), /*#__PURE__*/React.createElement("div", {
      id: "simParcelasDiv",
      style: {
        display: 'none'
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "N\xFAmero de Parcelas"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      id: "simNumeroParcelas",
      min: "2",
      max: "48",
      placeholder: "Ex: 12",
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "M\xEAs da Primeira Parcela/Pagamento"), /*#__PURE__*/React.createElement("input", {
      type: "month",
      id: "simMesPagamento",
      defaultValue: mesAtual,
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        const nome = document.getElementById('simNomeProduto').value;
        const valor = parseFloat(document.getElementById('simValorTotal').value);
        const forma = document.getElementById('simFormaPagamento').value;
        const parcelas = forma === 'parcelado' ? parseInt(document.getElementById('simNumeroParcelas').value) : 1;
        const mesPagamento = document.getElementById('simMesPagamento').value;
        if (!nome || !valor || valor <= 0) {
          alert('⚠️ Preencha o nome e o valor da compra!');
          return;
        }
        if (forma === 'parcelado' && (!parcelas || parcelas < 2)) {
          alert('⚠️ Informe o número de parcelas (mínimo 2)!');
          return;
        }

        // Mostrar resultado
        const divResultado = document.getElementById('simResultado');
        const valorParcela = valor / parcelas;

        // Buscar dados atuais
        const saldoAtual = saldo.saldo;
        const receitasMensal = saldo.receitas;
        const despesasMensal = totais.total;
        const orcamentoTotal = orcadoTotal;
        const impactoMensal = forma === 'avista' ? valor : valorParcela;
        const novasDespesas = despesasMensal + impactoMensal;
        const novoSaldo = receitasMensal - novasDespesas;
        const percentualRenda = impactoMensal / receitasMensal * 100;
        const comprometimentoTotal = novasDespesas / receitasMensal * 100;
        const sufoca = comprometimentoTotal > 90 || novoSaldo < 0;
        let html = `
                          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <h4 class="text-xl font-bold mb-4">📊 Resultado da Simulação</h4>
                            
                            <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                              <div class="text-sm opacity-90 mb-1">Produto</div>
                              <div class="text-2xl font-bold">${nome}</div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 mb-4">
                              <div class="bg-white bg-opacity-20 rounded-lg p-4">
                                <div class="text-sm opacity-90 mb-1">Valor Total</div>
                                <div class="text-xl font-bold">R$ ${valor.toFixed(2)}</div>
                              </div>
                              <div class="bg-white bg-opacity-20 rounded-lg p-4">
                                <div class="text-sm opacity-90 mb-1">${forma === 'avista' ? 'Pagamento' : 'Parcelas'}</div>
                                <div class="text-xl font-bold">${forma === 'avista' ? 'À Vista' : parcelas + 'x'}</div>
                              </div>
                            </div>

                            ${forma === 'parcelado' ? `
                              <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                                <div class="text-sm opacity-90 mb-1">Valor por Parcela</div>
                                <div class="text-2xl font-bold">R$ ${valorParcela.toFixed(2)}</div>
                              </div>
                            ` : ''}
                          </div>
                        `;
        html += `
                          <div class="bg-white rounded-xl shadow-lg p-6 mt-4">
                            <h4 class="text-lg font-bold text-gray-800 mb-4">💰 Impacto no Orçamento</h4>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div class="border-2 border-gray-200 rounded-lg p-4">
                                <div class="text-sm text-gray-600 mb-1">Suas Receitas</div>
                                <div class="text-xl font-bold text-green-600">R$ ${receitasMensal.toFixed(2)}</div>
                              </div>
                              <div class="border-2 border-gray-200 rounded-lg p-4">
                                <div class="text-sm text-gray-600 mb-1">Despesas Atuais</div>
                                <div class="text-xl font-bold text-orange-600">R$ ${despesasMensal.toFixed(2)}</div>
                              </div>
                              <div class="border-2 border-gray-200 rounded-lg p-4">
                                <div class="text-sm text-gray-600 mb-1">Saldo Atual</div>
                                <div class="text-xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}">
                                  R$ ${saldoAtual.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div class="border-t-2 border-gray-200 pt-4 mt-4">
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                  <div class="text-sm text-blue-700 mb-1">Impacto Mensal</div>
                                  <div class="text-2xl font-bold text-blue-600">R$ ${impactoMensal.toFixed(2)}</div>
                                  <div class="text-xs text-blue-600 mt-1">${percentualRenda.toFixed(1)}% da renda</div>
                                </div>
                                <div class="${sufoca ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border-2 rounded-lg p-4">
                                  <div class="text-sm ${sufoca ? 'text-red-700' : 'text-green-700'} mb-1">Novo Saldo</div>
                                  <div class="text-2xl font-bold ${sufoca ? 'text-red-600' : 'text-green-600'}">
                                    R$ ${novoSaldo.toFixed(2)}
                                  </div>
                                  <div class="text-xs ${sufoca ? 'text-red-600' : 'text-green-600'} mt-1">
                                    ${novoSaldo >= 0 ? 'Sobrando' : 'Faltando'}
                                  </div>
                                </div>
                                <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                  <div class="text-sm text-purple-700 mb-1">Renda Comprometida</div>
                                  <div class="text-2xl font-bold ${comprometimentoTotal > 90 ? 'text-red-600' : 'text-purple-600'}">
                                    ${comprometimentoTotal.toFixed(0)}%
                                  </div>
                                  <div class="text-xs text-purple-600 mt-1">
                                    ${comprometimentoTotal <= 70 ? '✅ Saudável' : comprometimentoTotal <= 90 ? '⚠️ Atenção' : '🚨 Crítico'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="mt-4 p-4 rounded-lg ${sufoca ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}">
                              <div class="flex items-start gap-3">
                                <div class="text-2xl">${sufoca ? '🚨' : '✅'}</div>
                                <div class="flex-1">
                                  <div class="font-bold ${sufoca ? 'text-red-800' : 'text-green-800'} mb-2">
                                    ${sufoca ? 'ATENÇÃO: Esta compra pode sufocar seu orçamento!' : 'Esta compra está dentro do seu orçamento!'}
                                  </div>
                                  <div class="text-sm ${sufoca ? 'text-red-700' : 'text-green-700'}">
                                    ${sufoca ? 'Com essa compra, você ficará com ' + comprometimentoTotal.toFixed(0) + '% da renda comprometida. ' + (novoSaldo < 0 ? 'Você terá déficit de R$ ' + Math.abs(novoSaldo).toFixed(2) + ' no mês. ' : '') + 'Considere reduzir gastos ou aumentar o prazo de pagamento.' : 'Você ainda terá R$ ' + novoSaldo.toFixed(2) + ' sobrando por mês. Está dentro do recomendado manter menos de 70% da renda comprometida.'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            ${forma === 'parcelado' ? `
                              <div class="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <div class="font-bold text-blue-800 mb-2">📅 Cronograma de Pagamento</div>
                                <div class="text-sm text-blue-700">
                                  Primeira parcela: ${new Date(mesPagamento + '-01').toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        })}<br>
                                  Última parcela: ${(() => {
          const data = new Date(mesPagamento + '-01');
          data.setMonth(data.getMonth() + parcelas - 1);
          return data.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          });
        })()}<br>
                                  Durante ${parcelas} meses você terá um compromisso de R$ ${valorParcela.toFixed(2)} mensais.
                                </div>
                              </div>
                            ` : ''}
                          </div>
                        `;
        divResultado.innerHTML = html;
        divResultado.style.display = 'block';
      },
      style: {
        width: "100%",
        padding: "12px 24px",
        background: "linear-gradient(135deg, #6366f1, #10b981)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(99,102,241,0.4)"
      }
    }, "\uD83D\uDD0D Simular Compra"))), /*#__PURE__*/React.createElement("div", {
      id: "simResultado",
      style: {
        display: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold mb-3"
    }, "\uD83D\uDCA1 Dicas para uma Compra Consciente"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2 text-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-lg"
    }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Mantenha at\xE9 70% da renda comprometida:"), " Isso garante margem para imprevistos")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-lg"
    }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Compare \xE0 vista vs parcelado:"), " \xC0s vezes o desconto \xE0 vista compensa")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-lg"
    }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Avalie a necessidade:"), " \xC9 desejo ou necessidade? Pode esperar?")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-lg"
    }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Considere sua reserva de emerg\xEAncia:"), " N\xE3o comprometa seu fundo de emerg\xEAncia"))))), (abaAtiva === 'simulacoes' && subAba === 'simulador') && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {display:'flex', gap:'8px', marginBottom:'4px'}
    }, /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-compra'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='compra'?'#6366f1':'#f3f4f6', color: subAba==='compra'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🛒 Simul. Compra"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-simulador'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='simulador'?'#6366f1':'#f3f4f6', color: subAba==='simulador'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "🎲 Simulador"), /*#__PURE__*/React.createElement("button", {
      onClick: ()=>setTelaAtiva('planejamento-timeline'),
      style: {padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700', background: subAba==='timeline'?'#6366f1':'#f3f4f6', color: subAba==='timeline'?'#fff':'#6b7280', transition:'all 0.15s'}
    }, "📈 Timeline")),/*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83C\uDFB2 Simulador de Cen\xE1rios"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Veja o impacto de mudan\xE7as nas suas finan\xE7as")), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl shadow-lg p-6 text-white"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-xl font-bold mb-4"
    }, "\uD83D\uDCCA Cen\xE1rio Atual"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Receitas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, "R$ ", saldo.receitas.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Despesas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, "R$ ", totais.total.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Saldo"), /*#__PURE__*/React.createElement("div", {
      className: `text-2xl font-bold ${saldo.positivo ? 'text-green-300' : 'text-red-300'}`
    }, "R$ ", saldo.saldo.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Score"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, scoreSaude.score)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83C\uDFAE Ajuste os Valores"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCB0 Ajuste de Renda (%)"), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "-50",
      max: "100",
      value: simulacao.rendaAjuste,
      onChange: e => setSimulacao({
        ...simulacao,
        rendaAjuste: parseFloat(e.target.value)
      }),
      className: "w-full"
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mt-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-red-600"
    }, "-50%"), /*#__PURE__*/React.createElement("span", {
      className: `font-bold ${simulacao.rendaAjuste >= 0 ? 'text-green-600' : 'text-red-600'}`
    }, simulacao.rendaAjuste > 0 ? '+' : '', simulacao.rendaAjuste, "%"), /*#__PURE__*/React.createElement("span", {
      className: "text-green-600"
    }, "+100%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCC9 Ajuste de Gastos (%)"), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "-50",
      max: "50",
      value: simulacao.gastosAjuste,
      onChange: e => setSimulacao({
        ...simulacao,
        gastosAjuste: parseFloat(e.target.value)
      }),
      className: "w-full"
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mt-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-green-600"
    }, "-50%"), /*#__PURE__*/React.createElement("span", {
      className: `font-bold ${simulacao.gastosAjuste <= 0 ? 'text-green-600' : 'text-red-600'}`
    }, simulacao.gastosAjuste > 0 ? '+' : '', simulacao.gastosAjuste, "%"), /*#__PURE__*/React.createElement("span", {
      className: "text-red-600"
    }, "+50%")))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSimulacao({
        rendaAjuste: 0,
        gastosAjuste: 0,
        quitarDivida: null,
        novaReceita: 0,
        novaDespesa: 0
      }),
      className: "mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
    }, "\uD83D\uDD04 Resetar")), (() => {
      const receitaSimulada = saldo.receitas * (1 + simulacao.rendaAjuste / 100);
      const despesaSimulada = totais.total * (1 + simulacao.gastosAjuste / 100);
      const saldoSimulado = receitaSimulada - despesaSimulada;
      const positivoSimulado = saldoSimulado >= 0;

      // Calcular novo score
      let scoreSimulado = 0;
      if (positivoSimulado) scoreSimulado += 30;
      if (despesaSimulada <= receitaSimulada * 0.9) scoreSimulado += 25;
      scoreSimulado += Math.min(30, Math.floor(reservaEmergencia / (despesaSimulada * 6) * 30));
      if (positivoSimulado) scoreSimulado += Math.min(15, Math.floor(saldoSimulado / receitaSimulada * 100 / 20 * 15));
      const diferenca = {
        receita: receitaSimulada - saldo.receitas,
        despesa: despesaSimulada - totais.total,
        saldo: saldoSimulado - saldo.saldo,
        score: scoreSimulado - scoreSaude.score
      };
      return /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          padding: '1.5rem',
          color: '#fff'
        }
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xl font-bold mb-4"
      }, "\uD83D\uDD2E Cen\xE1rio Simulado"), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Receitas"), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold"
      }, "R$ ", receitaSimulada.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: `text-sm ${diferenca.receita >= 0 ? 'text-green-300' : 'text-red-300'}`
      }, diferenca.receita >= 0 ? '▲' : '▼', " R$ ", Math.abs(diferenca.receita).toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Despesas"), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold"
      }, "R$ ", despesaSimulada.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: `text-sm ${diferenca.despesa <= 0 ? 'text-green-300' : 'text-red-300'}`
      }, diferenca.despesa >= 0 ? '▲' : '▼', " R$ ", Math.abs(diferenca.despesa).toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Saldo"), /*#__PURE__*/React.createElement("div", {
        className: `text-2xl font-bold ${positivoSimulado ? 'text-green-300' : 'text-red-300'}`
      }, "R$ ", saldoSimulado.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: `text-sm ${diferenca.saldo >= 0 ? 'text-green-300' : 'text-red-300'}`
      }, diferenca.saldo >= 0 ? '▲' : '▼', " R$ ", Math.abs(diferenca.saldo).toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Score"), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold"
      }, scoreSimulado), /*#__PURE__*/React.createElement("div", {
        className: `text-sm ${diferenca.score >= 0 ? 'text-green-300' : 'text-red-300'}`
      }, diferenca.score >= 0 ? '▲' : '▼', " ", Math.abs(diferenca.score), " pts"))), /*#__PURE__*/React.createElement("div", {
        className: "bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "font-bold mb-2"
      }, "\uD83D\uDCCA An\xE1lise de Impacto:"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-1 text-sm"
      }, diferenca.saldo > 0 && /*#__PURE__*/React.createElement("div", null, "\u2705 Melhora no saldo mensal de R$ ", diferenca.saldo.toFixed(2)), diferenca.saldo < 0 && /*#__PURE__*/React.createElement("div", null, "\u26A0\uFE0F Piora no saldo mensal de R$ ", Math.abs(diferenca.saldo).toFixed(2)), diferenca.score > 0 && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC8 Score de sa\xFAde aumenta ", diferenca.score, " pontos"), diferenca.score < 0 && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC9 Score de sa\xFAde diminui ", Math.abs(diferenca.score), " pontos"), positivoSimulado && !saldo.positivo && /*#__PURE__*/React.createElement("div", null, "\uD83C\uDF89 Voc\xEA sairia do vermelho!"), !positivoSimulado && saldo.positivo && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDEA8 Voc\xEA entraria no vermelho!"))));
    })(), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\u26A1 Cen\xE1rios R\xE1pidos"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSimulacao({
        ...simulacao,
        rendaAjuste: 20,
        gastosAjuste: 0
      }),
      className: "p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDCC8"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "Promo\xE7\xE3o +20%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Aumento de renda")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSimulacao({
        ...simulacao,
        rendaAjuste: 0,
        gastosAjuste: -20
      }),
      className: "p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "Economia -20%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Redu\xE7\xE3o de gastos")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSimulacao({
        ...simulacao,
        rendaAjuste: 20,
        gastosAjuste: -20
      }),
      className: "p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDE80"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "Combo Perfeito"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "+20% renda, -20% gastos")))))
  };
  const TelaFarol = () => {
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [modalPagamento, setModalPagamento] = useState(null);
    const [valorParcial, setValorParcial] = useState('');
    const [mostrarTimeline, setMostrarTimeline] = useState(false); // INICIA FECHADO

    const itensTodos = [
    // CORRIGIDO: Acessa valores do ano atual
    ...cartoes.map(c => {
      const valoresAno = c.valores?.[anoAtual] || {};
      return {
        tipo: 'CARTÃO',
        nome: c.nome,
        vencimento: c.vencimento,
        valor: valoresAno[mesAtual] || 0
      };
    }),
    // Filtrar gastos fixos por mês (se tiverem mês definido) ou mostrar todos sem mês
    ...gastosFixos.filter(g => !g.mes || g.mes === mesAtual) // Se não tem mês OU é do mês atual
    .filter(g => !g.ano || g.ano === anoAtual) // Se não tem ano OU é do ano atual
    .map(g => ({
      tipo: 'FIXO',
      nome: g.descricao,
      vencimento: g.vencimento,
      valor: g.valor,
      badge: g.temporario && g.totalParcelas ? `${g.parcelaAtual}/${g.totalParcelas}` : null
    })),
    // Gastos Variáveis que devem aparecer no Farol
    ...gastosVariaveis.filter(g => g.mostrarNoFarol && g.mes === mesAtual && g.ano === anoAtual).map(g => ({
      tipo: 'VARIÁVEL',
      nome: g.descricao || g.categoria,
      vencimento: g.vencimento || 1,
      valor: g.valor
    })),
    // Gastos Extras que devem aparecer no Farol
    ...gastosExtras.filter(g => g.mostrarNoFarol && g.mes === mesAtual && g.ano === anoAtual).map(g => ({
      tipo: 'EXTRA',
      nome: g.descricao || g.categoria,
      vencimento: g.vencimento || 1,
      valor: g.valor
    }))].filter(item => item.valor > 0).sort((a, b) => a.vencimento - b.vencimento);
    const itensFiltrados = filtroStatus === 'todos' ? itensTodos : filtroStatus === 'pagos' ? itensTodos.filter(item => getStatusFarol(item.nome, mesAtual) === 'PAGO') : itensTodos.filter(item => getStatusFarol(item.nome, mesAtual) === 'PENDENTE');

    // Calcular vencimentos da semana
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const proximaSemana = diaHoje + 7;
    const vencimentosHoje = itensTodos.filter(item => {
      const status = getStatusFarol(item.nome, mesAtual);
      return item.vencimento === diaHoje && status !== 'PAGO';
    });
    const vencimentosSemana = itensTodos.filter(item => {
      const status = getStatusFarol(item.nome, mesAtual);
      return item.vencimento > diaHoje && item.vencimento <= proximaSemana && status !== 'PAGO';
    });
    const totalHoje = vencimentosHoje.reduce((sum, item) => sum + item.valor, 0);
    const totalSemana = vencimentosSemana.reduce((sum, item) => sum + item.valor, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-lg p-4 text-white"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between mb-3"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold flex items-center gap-2"
    }, "\uD83D\uDCC5 Vencimentos da Semana"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs bg-white/20 px-2 py-1 rounded-full"
    }, "Hoje: ", diaHoje, " ", mesAtual.toUpperCase())), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white/10 backdrop-blur rounded-lg p-3 border border-red-300"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-90 mb-1"
    }, "\uD83D\uDD34 VENCE HOJE"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold mb-1"
    }, "R$ ", totalHoje.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-80 mb-1"
    }, vencimentosHoje.length, " ", vencimentosHoje.length === 1 ? 'item' : 'itens'), vencimentosHoje.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-1 space-y-0.5"
    }, vencimentosHoje.slice(0, 2).map((item, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "text-xs opacity-80 truncate"
    }, "\u2022 ", item.nome)), vencimentosHoje.length > 2 && /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-70"
    }, "+ ", vencimentosHoje.length - 2, " mais"))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/10 backdrop-blur rounded-lg p-3 border border-yellow-300"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-90 mb-1"
    }, "\uD83D\uDFE1 PR\xD3XIMOS 7 DIAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold mb-1"
    }, "R$ ", totalSemana.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-80 mb-1"
    }, vencimentosSemana.length, " ", vencimentosSemana.length === 1 ? 'item' : 'itens'), vencimentosSemana.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-1 space-y-0.5"
    }, vencimentosSemana.slice(0, 2).map((item, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "text-xs opacity-80 truncate"
    }, "\u2022 ", item.nome, " (dia ", item.vencimento, ")")), vencimentosSemana.length > 2 && /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-70"
    }, "+ ", vencimentosSemana.length - 2, " mais"))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/10 backdrop-blur rounded-lg p-3 border border-white/50"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-90 mb-1"
    }, "\uD83D\uDCB0 TOTAL SEMANA"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold mb-1"
    }, "R$ ", (totalHoje + totalSemana).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-80 mb-2"
    }, vencimentosHoje.length + vencimentosSemana.length, " itens total"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setMostrarTimeline(!mostrarTimeline),
      className: "text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors w-full"
    }, mostrarTimeline ? '📅 Ocultar' : '📅 Ver', " Timeline")))), mostrarTimeline && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCC6 Timeline da Semana"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, [...Array(7)].map((_, i) => {
      const dia = diaHoje + i;
      const vencimentosDia = itensTodos.filter(item => {
        const status = getStatusFarol(item.nome, mesAtual);
        return item.vencimento === dia && status !== 'PAGO';
      });
      const totalDia = vencimentosDia.reduce((sum, item) => sum + item.valor, 0);
      const dataFutura = new Date(hoje);
      dataFutura.setDate(dia);
      const diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataFutura.getDay()];
      const isHoje = i === 0;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: `flex items-start gap-3 p-3 rounded-lg transition-all ${isHoje ? 'bg-purple-50 border-2 border-purple-500' : vencimentosDia.length > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: `flex-shrink-0 w-16 text-center ${isHoje ? 'text-purple-600' : 'text-gray-600'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs font-semibold"
      }, diaSemana), /*#__PURE__*/React.createElement("div", {
        className: `text-2xl font-bold ${isHoje ? 'text-purple-700' : 'text-gray-700'}`
      }, dia), isHoje && /*#__PURE__*/React.createElement("div", {
        className: "text-xs font-bold text-purple-600"
      }, "HOJE")), /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, vencimentosDia.length === 0 ? /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-400 italic py-2"
      }, "Nenhum vencimento") : /*#__PURE__*/React.createElement("div", {
        className: "space-y-2"
      }, vencimentosDia.map((item, idx) => {
        const status = getStatusFarol(item.nome, mesAtual);
        const isPago = status === 'PAGO';
        return /*#__PURE__*/React.createElement("div", {
          key: idx,
          className: "flex items-center justify-between bg-white rounded p-2 shadow-sm"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center gap-2"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-lg"
        }, isPago ? '✅' : '⚪'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "font-semibold text-sm text-gray-800"
        }, item.nome), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-gray-500"
        }, item.tipo))), /*#__PURE__*/React.createElement("div", {
          className: "text-right"
        }, /*#__PURE__*/React.createElement("div", {
          className: "font-bold text-gray-800"
        }, "R$ ", item.valor.toFixed(2))));
      }), /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-right font-bold text-gray-600 pt-1 border-t"
      }, "Total do dia: R$ ", totalDia.toFixed(2)))));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-bold text-gray-800 mb-3"
    }, "\uD83D\uDEA6 Farol de Pagamentos - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-1"
    }, "Total a Pagar"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-blue-600"
    }, "R$ ", pagamentos.total.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, pagamentos.qtdTotal, " itens")), /*#__PURE__*/React.createElement("div", {
      className: "bg-green-50 rounded-lg p-4 border-2 border-green-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-1"
    }, "\u2705 J\xE1 Pago"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-green-600"
    }, "R$ ", pagamentos.pago.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, pagamentos.qtdPago, " pagos \u2022 ", pagamentos.percentual.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
      className: "bg-orange-50 rounded-lg p-4 border-2 border-orange-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-1"
    }, "\u23F3 Ainda Falta"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-orange-600"
    }, "R$ ", pagamentos.pendente.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, pagamentos.qtdTotal - pagamentos.qtdPago, " pendentes"))), /*#__PURE__*/React.createElement("div", {
      className: "mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-gray-700"
    }, "Progresso de Pagamentos"), /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-gray-800"
    }, pagamentos.percentual.toFixed(1), "%")), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: `h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-xs font-bold ${pagamentos.percentual >= 100 ? 'bg-green-500' : pagamentos.percentual >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`,
      style: {
        width: `${Math.min(pagamentos.percentual, 100)}%`
      }
    }, pagamentos.percentual >= 10 && `${pagamentos.percentual.toFixed(0)}%`))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mb-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setFiltroStatus('todos'),
      className: `px-4 py-2 rounded-lg font-semibold ${filtroStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
    }, "Todos (", itensTodos.length, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setFiltroStatus('pagos'),
      className: `px-4 py-2 rounded-lg font-semibold ${filtroStatus === 'pagos' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
    }, "\u2705 Pagos (", pagamentos.qtdPago, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setFiltroStatus('pendentes'),
      className: `px-4 py-2 rounded-lg font-semibold ${filtroStatus === 'pendentes' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
    }, "\u23F3 Pendentes (", pagamentos.qtdTotal - pagamentos.qtdPago, ")")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, (() => {
      // Agrupar itens por data de vencimento
      const itensPorData = {};
      itensFiltrados.forEach(item => {
        const dia = item.vencimento;
        if (!itensPorData[dia]) {
          itensPorData[dia] = [];
        }
        itensPorData[dia].push(item);
      });

      // Ordenar dias
      const diasOrdenados = Object.keys(itensPorData).sort((a, b) => parseInt(a) - parseInt(b));
      return diasOrdenados.map(dia => {
        const itensDoDia = itensPorData[dia];
        const totalDia = itensDoDia.reduce((sum, item) => sum + item.valor, 0);
        const hoje = new Date().getDate();
        const isHoje = parseInt(dia) === hoje;

        // Calcular dia da semana
        const dataAtual = new Date();
        const anoNum = dataAtual.getFullYear();
        const mesNum = dataAtual.getMonth();
        const dataVencimento = new Date(anoNum, mesNum, parseInt(dia));
        const diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataVencimento.getDay()];
        return /*#__PURE__*/React.createElement("div", {
          key: dia,
          className: `flex items-start gap-3 p-3 rounded-lg transition-all ${isHoje ? 'bg-purple-50 border-2 border-purple-500' : itensDoDia.length > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`
        }, /*#__PURE__*/React.createElement("div", {
          className: `flex-shrink-0 w-16 text-center ${isHoje ? 'text-purple-600' : 'text-gray-600'}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-semibold"
        }, diaSemana), /*#__PURE__*/React.createElement("div", {
          className: `text-2xl font-bold ${isHoje ? 'text-purple-700' : 'text-gray-700'}`
        }, dia), isHoje && /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-bold text-purple-600"
        }, "HOJE")), /*#__PURE__*/React.createElement("div", {
          className: "flex-1"
        }, itensDoDia.length === 0 ? /*#__PURE__*/React.createElement("div", {
          className: "text-sm text-gray-400 italic py-2"
        }, "Nenhum vencimento") : /*#__PURE__*/React.createElement("div", {
          className: "space-y-2"
        }, itensDoDia.map((item, idx) => {
          const status = getStatusFarol(item.nome, mesAtual);
          const isPago = status === 'PAGO';
          const isParcial = typeof status === 'number' && status > 0;
          const valorPago = isParcial ? status : 0;
          const isAtrasado = parseInt(dia) < hoje && !isPago;
          return /*#__PURE__*/React.createElement("div", {
            key: idx,
            className: "flex items-center justify-between bg-white rounded p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
            onClick: () => setModalPagamento(item)
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex items-center gap-2"
          }, /*#__PURE__*/React.createElement("span", {
            className: "text-lg"
          }, isPago ? '✅' : isAtrasado ? '⚠️' : isParcial ? '💵' : '⚪'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: `font-semibold text-sm ${isPago ? 'text-green-700 line-through' : 'text-gray-800'}`
          }, item.nome), /*#__PURE__*/React.createElement("div", {
            className: "text-xs text-gray-500"
          }, item.tipo))), /*#__PURE__*/React.createElement("div", {
            className: "text-right"
          }, /*#__PURE__*/React.createElement("div", {
            className: `font-bold ${isPago ? 'text-green-600' : 'text-gray-800'}`
          }, "R$ ", item.valor.toFixed(2)), isParcial && /*#__PURE__*/React.createElement("div", {
            className: "text-xs text-blue-600"
          }, "Pago: R$ ", valorPago.toFixed(2))));
        }), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-right font-bold text-gray-600 pt-1 border-t"
        }, "Total do dia: R$ ", totalDia.toFixed(2)))));
      });
    })())), modalPagamento && /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: () => setModalPagamento(null)
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-content",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold mb-4"
    }, "\uD83D\uDCB0 Registrar Pagamento"), /*#__PURE__*/React.createElement("div", {
      className: "mb-4 p-4 bg-blue-50 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold"
    }, modalPagamento.nome), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-600 mt-2"
    }, "Total: R$ ", modalPagamento.valor.toFixed(2)), (() => {
      const statusAtual = getStatusFarol(modalPagamento.nome, mesAtual);
      if (typeof statusAtual === 'number' && statusAtual > 0) {
        const restante = modalPagamento.valor - statusAtual;
        return /*#__PURE__*/React.createElement("div", {
          className: "mt-3 pt-3 border-t border-blue-300"
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-sm text-green-600 font-semibold"
        }, "\u2705 J\xE1 pago: R$ ", statusAtual.toFixed(2)), /*#__PURE__*/React.createElement("div", {
          className: "text-sm text-orange-600 font-semibold"
        }, "\u23F3 Falta pagar: R$ ", restante.toFixed(2)));
      }
      return null;
    })()), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        marcarPago(modalPagamento.nome, mesAtual);
        setModalPagamento(null);
      },
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Marcar como PAGO"), /*#__PURE__*/React.createElement("div", {
      className: "border-t pt-3"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold mb-2"
    }, "Pagar valor parcial:"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valorParcial,
      onChange: e => setValorParcial(e.target.value),
      placeholder: "Digite o valor",
      className: "w-full px-4 py-2 border rounded-lg mb-2"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (valorParcial && parseFloat(valorParcial) > 0) {
          pagarParcial(modalPagamento.nome, mesAtual, valorParcial);
          setModalPagamento(null);
          setValorParcial('');
        }
      },
      className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\uD83D\uDCB0 Pagar Parcial")), (() => {
      const statusAtual = getStatusFarol(modalPagamento.nome, mesAtual);
      // Mostrar botão de resetar para PAGO ou PARCIAL
      if (statusAtual === 'PAGO' || typeof statusAtual === 'number' && statusAtual > 0) {
        return /*#__PURE__*/React.createElement("div", {
          className: "border-t pt-3"
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            const tipoPagamento = statusAtual === 'PAGO' ? 'integral' : 'parcial';
            const valorPago = statusAtual === 'PAGO' ? modalPagamento.valor.toFixed(2) : statusAtual.toFixed(2);
            if (confirm(`🔄 DESFAZER PAGAMENTO?\n\n` + `Tipo: ${tipoPagamento.toUpperCase()}\n` + `Valor pago: R$ ${valorPago}\n\n` + `Este item voltará para PENDENTE.\n\n` + `Confirma?`)) {
              const chave = `${modalPagamento.nome}-${mesAtual}-${anoAtual}`;
              setFarol(prev => {
                const novoFarol = {
                  ...prev
                };
                delete novoFarol[chave]; // Remove do farol
                return novoFarol;
              });
              setModalPagamento(null);
              alert('✅ Pagamento desfeito! Item voltou para PENDENTE.');
            }
          },
          className: "w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
        }, "\uD83D\uDD04 Desfazer Pagamento"), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-center text-gray-500 mt-2"
        }, "\u26A0\uFE0F Esta a\xE7\xE3o voltar\xE1 o item para PENDENTE"));
      }
      return null;
    })(), /*#__PURE__*/React.createElement("button", {
      onClick: () => setModalPagamento(null),
      className: "w-full px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
    }, "Cancelar")))));
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
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(UserMenu, {
    user: user,
    onLogout: async () => {
      ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'orcamentos', 'metasMensais', 'metasFinanceiras', 'planejados', 'dividas', 'categorias', 'farol', '_currentUserId'].forEach(k => localStorage.removeItem(k));
      await firebase.auth().signOut();
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.LOGO_B64,
    alt: "Estrat\xE9gia Finan\xE7as",
    style: {
      maxHeight: '38px',
      width: 'auto',
      objectFit: 'contain'
    }
  })), /*#__PURE__*/React.createElement("select", {
    value: anoAtual,
    onChange: e => setAnoAtual(parseInt(e.target.value)),
    style: {
      padding: '6px 10px',
      borderRadius: '8px',
      border: '1px solid rgba(99,102,241,0.5)',
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      minWidth: '85px'
    }
  }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => /*#__PURE__*/React.createElement("option", {
    key: ano,
    value: ano,
    style: {
      background: '#1a1a4e'
    }
  }, ano))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      borderBottom: '1px solid rgba(99,102,241,0.3)',
      position: 'sticky',
      top: '57px',
      zIndex: 45,
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '4px 16px',
      overflow: 'visible',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(MenuNavegacao, {
    telaAtiva: telaAtiva,
    setTelaAtiva: setTelaAtiva,
    isUserAdmin: isUserAdmin
  }))), /*#__PURE__*/React.createElement("div", {
    className: "main-content-area",
    style: {
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
    className: "max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 main-content animate-in"
  }, React.useMemo(() => {
    if (telaAtiva !== 'dashboard') return null;
    return /*#__PURE__*/React.createElement(Dashboard, {
      key: `${mesAtual}-${anoAtual}`
    });
  }, [telaAtiva === 'dashboard', mesAtual, anoAtual]), telaAtiva === 'admin' && /*#__PURE__*/React.createElement(TelaAdmin, {
    isUserAdmin: isUserAdmin
  }), telaAtiva.startsWith('planejamento') && /*#__PURE__*/React.createElement(TelaPlanejamento, null), telaAtiva === 'receitas' && /*#__PURE__*/React.createElement(TelaReceitas, null), telaAtiva === 'cartoes' && /*#__PURE__*/React.createElement(TelaCartoes, {
    key: JSON.stringify(farol)
  }), telaAtiva === 'fixos' && /*#__PURE__*/React.createElement(TelaGastosFixos, null), telaAtiva === 'variaveis' && /*#__PURE__*/React.createElement(TelaGastosVariaveis, null), telaAtiva === 'extras' && /*#__PURE__*/React.createElement(TelaGastosExtras, null), telaAtiva === 'farol' && /*#__PURE__*/React.createElement(TelaFarol, null)), modalAberto === 'editar' && itemEditando && /*#__PURE__*/React.createElement(Modal, {
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
