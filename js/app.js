        const { useState, useEffect } = React;

        // Firebase já foi inicializado no firebase-config.js
        // Usando db global do window


        const DADOS_INICIAIS = {
            gastosFixos: [
                { id: 1, categoria: "MORADIA", descricao: "ALUGUEL", valor: 550, vencimento: 10 },
                { id: 2, categoria: "MORADIA", descricao: "CONDOMINIO", valor: 440, vencimento: 10 },
                { id: 3, categoria: "MORADIA", descricao: "APARTAMENTO", valor: 660, vencimento: 8 },
                { id: 4, categoria: "MORADIA", descricao: "INTERNET", valor: 100, vencimento: 15 },
                { id: 5, categoria: "MORADIA", descricao: "ENERGIA", valor: 300, vencimento: 20 },
                { id: 6, categoria: "ESTUDO", descricao: "CONDUÇÃO", valor: 250, vencimento: 5 },
                { id: 7, categoria: "ESTUDO", descricao: "PÓS GRADUAÇÃO", valor: 98, vencimento: 10 },
                { id: 8, categoria: "ESTUDO", descricao: "ESCOLA", valor: 620, vencimento: 12 },
                { id: 9, categoria: "ESTUDO", descricao: "FACULDADE CAMILLY", valor: 720, vencimento: 15 },
                { id: 10, categoria: "TRANSPORTE", descricao: "CARRO", valor: 1300, vencimento: 25 },
                { id: 11, categoria: "SERVIÇOS", descricao: "UNHA", valor: 80, vencimento: 18 }
            ],
            cartoes: [
                { id: 1, nome: "CAMILLY", vencimento: 5, valores: { 
                    jan: 200, fev: 200, mar: 0, abr: 0, mai: 0, jun: 0, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 2, nome: "UNICLASS", vencimento: 5, valores: { 
                    jan: 2920, fev: 2577, mar: 1952, abr: 1852, mai: 1676, jun: 1565, jul: 1565, ago: 111, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 3, nome: "PÃO DE AÇUCAR", vencimento: 5, valores: { 
                    jan: 2760, fev: 1621, mar: 1621, abr: 1621, mai: 1621, jun: 0, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 4, nome: "NUBANK", vencimento: 7, valores: { 
                    jan: 3296, fev: 2613, mar: 2430, abr: 1493, mai: 338, jun: 338, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 5, nome: "NEON", vencimento: 11, valores: { 
                    jan: 150, fev: 0, mar: 0, abr: 0, mai: 0, jun: 0, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 6, nome: "RIACHUELLO", vencimento: 15, valores: { 
                    jan: 250, fev: 0, mar: 0, abr: 0, mai: 0, jun: 0, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 7, nome: "PLATINUN", vencimento: 11, valores: { 
                    jan: 570, fev: 570, mar: 333, abr: 333, mai: 333, jun: 333, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }},
                { id: 8, nome: "SIGNATURE", vencimento: 20, valores: { 
                    jan: 953, fev: 567, mar: 567, abr: 567, mai: 516, jun: 333, jul: 309, ago: 0, set: 0, out: 0, nov: 0, dez: 0 
                }}
            ]
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
                const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
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
                    
                    setUser(user);
                    setLoading(false);
                });
                return () => unsubscribe();
            }, [registering]);

            const handleLogin = async (e) => {
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

            const handleRegister = async (e) => {
                e.preventDefault();
                setError('');
                setRegistering(true); // Bloquear onAuthStateChanged
                
                try {
                    // 1. Criar usuário
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    await userCredential.user.updateProfile({ displayName: nome });
                    
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
                return (
                    <div className="loading-screen">
                        <img src="data:image/png;base64,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yHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzhxuTHYq748JBiZ4D/2Q==" alt="Estratégia Finanças" style={{maxHeight:'80px', width:'auto', marginBottom:'1rem'}} />
                        <div className="loading-title">Estratégia Finanças</div>
                        <div className="loading-subtitle">Carregando seu controle financeiro...</div>
                        <div className="loading-dots">
                            <span/><span/><span/>
                        </div>
                    </div>
                );
            }
            
            if (registering) {
                return (
                    <div className="loading-screen">
                        <div className="loading-icon">🎉</div>
                        <div className="loading-title">Criando sua conta...</div>
                        <div className="loading-subtitle">Preparando tudo para você!</div>
                        <div className="loading-dots">
                            <span/><span/><span/>
                        </div>
                        <div style={{color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', marginTop:'1.5rem'}}>
                            ✨ 2 meses gratuitos já liberados
                        </div>
                    </div>
                );
            }

            if (!user) {
                return (
                    <div style={{
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #0f3460 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        fontFamily: "'Segoe UI', system-ui, sans-serif",
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Elementos decorativos de fundo */}
                        <div style={{
                            position: 'absolute', top: '-20%', right: '-10%',
                            width: '600px', height: '600px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}/>
                        <div style={{
                            position: 'absolute', bottom: '-20%', left: '-10%',
                            width: '500px', height: '500px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}/>

                        {/* Card principal */}
                        <div style={{
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '2.5rem',
                            width: '100%',
                            maxWidth: '420px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
                        }}>
                            {/* Logo e título */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <img 
                                    src="data:image/png;base64,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yHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzhxuTHYq748JBiZ4D/2Q=="
                                    alt="Estratégia Finanças"
                                    style={{maxHeight:'70px', width:'auto', objectFit:'contain', marginBottom:'0.5rem'}}
                                />
                                
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
                                    {authMode === 'login' ? 'Bem-vindo de volta' : '2 meses grátis para começar'}
                                </p>
                            </div>

                            {/* Tabs Login/Cadastro */}
                            <div style={{
                                display: 'flex', background: 'rgba(255,255,255,0.06)',
                                borderRadius: '12px', padding: '4px', marginBottom: '1.5rem'
                            }}>
                                {['login', 'register'].map(mode => (
                                    <button key={mode}
                                        onClick={() => { setAuthMode(mode); setError(''); }}
                                        style={{
                                            flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                                            borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600',
                                            transition: 'all 0.2s',
                                            background: authMode === mode ? 'rgba(255,255,255,0.15)' : 'transparent',
                                            color: authMode === mode ? '#fff' : 'rgba(255,255,255,0.45)'
                                        }}
                                    >
                                        {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                                    </button>
                                ))}
                            </div>

                            {/* Trial badge no cadastro */}
                            {authMode === 'register' && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.2))',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    borderRadius: '12px', padding: '0.75rem 1rem',
                                    marginBottom: '1.25rem', textAlign: 'center'
                                }}>
                                    <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                                        ✨ 2 meses grátis • Depois apenas R$ 29,90/mês • Cancele quando quiser
                                    </span>
                                </div>
                            )}

                            {/* Erro */}
                            {error && (
                                <div style={{
                                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '10px', padding: '0.75rem 1rem',
                                    marginBottom: '1rem', color: '#fca5a5', fontSize: '0.875rem'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Formulário */}
                            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                                {authMode === 'register' && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                                            SEU NOME
                                        </label>
                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            placeholder="Como devemos te chamar?"
                                            required
                                            style={{
                                                width: '100%', padding: '0.75rem 1rem',
                                                background: 'rgba(255,255,255,0.08)',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                borderRadius: '10px', color: '#fff',
                                                fontSize: '0.9rem', outline: 'none',
                                                boxSizing: 'border-box',
                                                transition: 'border 0.2s'
                                            }}
                                        />
                                    </div>
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                                        EMAIL
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '10px', color: '#fff',
                                            fontSize: '0.9rem', outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                                        SENHA
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength="6"
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '10px', color: '#fff',
                                            fontSize: '0.9rem', outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <button type="submit" style={{
                                    width: '100%', padding: '0.875rem',
                                    background: 'linear-gradient(135deg, #6366f1, #10b981)',
                                    border: 'none', borderRadius: '12px',
                                    color: '#fff', fontSize: '1rem', fontWeight: '700',
                                    cursor: 'pointer', letterSpacing: '0.3px',
                                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                                    transition: 'transform 0.1s, box-shadow 0.2s'
                                }}>
                                    {authMode === 'login' ? '→ Entrar na conta' : '→ Criar minha conta grátis'}
                                </button>
                            </form>

                            {/* Link reenvio de email */}
                            {authMode === 'login' && (
                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button
                                        onClick={async () => {
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
                                        }}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Não recebeu o email de verificação?
                                    </button>
                                </div>
                            )}

                            {/* Rodapé segurança */}
                            <div style={{
                                marginTop: '1.5rem', paddingTop: '1.25rem',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', justifyContent: 'center', gap: '1.5rem'
                            }}>
                                {['🔒 SSL Seguro', '☁️ Nuvem', '🇧🇷 Brasil'].map((item, i) => (
                                    <span key={i} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }

            return <App user={user} />;
        }

        // Componente de Formulário de Edição Universal
        function FormEdicao({ item, tipo, onSalvar }) {
            const [formData, setFormData] = useState({...item});
            
            // Debug: ver dados iniciais
            console.log('🔍 FormEdicao - item recebido:', item);
            console.log('🔍 FormEdicao - formData inicial:', formData);
            
            const handleChange = (campo, valor) => {
                console.log(`🔄 Mudando ${campo} para:`, valor);
                setFormData(prev => ({...prev, [campo]: valor}));
            };
            
            const handleSubmit = (e) => {
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
            
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Descrição/Nome */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {tipo === 'cartao' ? 'Nome do Cartão' : 'Descrição'}
                        </label>
                        <input
                            type="text"
                            value={formData[tipo === 'cartao' ? 'nome' : 'descricao'] || ''}
                            onChange={(e) => handleChange(tipo === 'cartao' ? 'nome' : 'descricao', e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    {/* Valor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valor (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.valor || ''}
                            onChange={(e) => handleChange('valor', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    {/* Ano */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ano
                        </label>
                        <select
                            value={formData.ano || new Date().getFullYear()}
                            onChange={(e) => handleChange('ano', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                        >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Vencimento (se for cartão ou fixo) */}
                    {(tipo === 'cartao' || tipo === 'fixo') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Dia do Vencimento
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={formData.vencimento || ''}
                                onChange={(e) => handleChange('vencimento', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                required
                            />
                        </div>
                    )}
                    
                    {/* Campos específicos de Cartão */}
                    {tipo === 'cartao' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Dia de Fechamento
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.diaFechamento || ''}
                                    onChange={(e) => handleChange('diaFechamento', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                    placeholder={`Padrão: ${(formData.vencimento || 15) - 7}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">Deixe vazio para 7 dias antes do vencimento</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Limite do Cartão (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.limite || ''}
                                    onChange={(e) => handleChange('limite', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                    placeholder="Ex: 10000.00"
                                />
                                <p className="text-xs text-gray-500 mt-1">Deixe 0 para não controlar limite</p>
                            </div>
                        </>
                    )}
                    
                    {/* Categoria (se for receita) */}
                    {tipo === 'receita' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Categoria
                            </label>
                            <select
                                value={formData.categoria || 'Salário'}
                                onChange={(e) => handleChange('categoria', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                            >
                                <option>Salário</option>
                                <option>Freelance</option>
                                <option>Investimentos</option>
                                <option>Outros</option>
                            </select>
                        </div>
                    )}
                    
                    {/* Mês (se for variável ou receita) */}
                    {(tipo === 'variavel' || tipo === 'receita' || tipo === 'extra') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mês
                            </label>
                            <select
                                value={formData.mes || 'Janeiro'}
                                onChange={(e) => handleChange('mes', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                            >
                                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(mes => (
                                    <option key={mes} value={mes}>{mes}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {/* Data específica (se for variável ou extra) */}
                    {(tipo === 'variavel' || tipo === 'extra') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Data do Gasto
                            </label>
                            <input
                                type="date"
                                value={formData.dataCompleta || ''}
                                onChange={(e) => {
                                    const dataInput = e.target.value;
                                    const dataObj = new Date(dataInput + 'T00:00:00');
                                    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                                    handleChange('dataCompleta', dataInput);
                                    handleChange('data', dataFormatada);
                                }}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                required
                            />
                            {formData.data && (
                                <p className="text-xs text-gray-500 mt-1">Exibido como: {formData.data}</p>
                            )}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                        💾 Salvar Alterações
                    </button>
                </form>
            );
        }

        function App({ user }) {
            const [salvando, setSalvando] = useState(false);
            const [ultimoSave, setUltimoSave] = useState(null);
            const [isUserAdmin, setIsUserAdmin] = useState(false);
            const [planoInfo, setPlanoInfo] = useState({ plano: 'trial', diasRestantes: 60, expirado: false });
            
            const [anoAtual, setAnoAtual] = useState(() => {
                const saved = localStorage.getItem('anoAtual');
                return saved ? parseInt(saved) : 2025;
            });
            const [mesAtual, setMesAtual] = useState('jan');
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
                            dataCompleta: dataGasto.toISOString().split('T')[0], // YYYY-MM-DD
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
                    mensal: 20000,
                    jan: 18000, fev: 16000, mar: 15000, abr: 14000, mai: 13000, jun: 12000,
                    jul: 12000, ago: 12000, set: 13000, out: 14000, nov: 15000, dez: 18000
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
                    cartoes: 8000,
                    fixos: 5500,
                    variaveis: 2000
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
                    jan: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    fev: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    mar: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    abr: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    mai: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    jun: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    jul: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    ago: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    set: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    out: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    nov: { cartoes: 8000, fixos: 5500, variaveis: 2000 },
                    dez: { cartoes: 8000, fixos: 5500, variaveis: 2000 }
                };
            });

            const [orcamentoAnual, setOrcamentoAnual] = useState(() => {
                const saved = localStorage.getItem('orcamentoAnual');
                return saved ? JSON.parse(saved) : {
                    jan: 15000, fev: 15000, mar: 15000, abr: 15000, mai: 15000, jun: 15000,
                    jul: 15000, ago: 15000, set: 15000, out: 15000, nov: 15000, dez: 15000
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

            useEffect(() => { localStorage.setItem('anoAtual', anoAtual.toString()); }, [anoAtual]);
            useEffect(() => { localStorage.setItem('gastosFixos', JSON.stringify(gastosFixos)); }, [gastosFixos]);
            useEffect(() => { localStorage.setItem('categoriasPersonalizadas', JSON.stringify(categoriasPersonalizadas)); }, [categoriasPersonalizadas]);
            useEffect(() => { 
                console.log('💾 Salvando cartões:', cartoes.length, 'cartões'); 
                localStorage.setItem('cartoes', JSON.stringify(cartoes)); 
            }, [cartoes]);
            useEffect(() => { localStorage.setItem('gastosVariaveis', JSON.stringify(gastosVariaveis)); }, [gastosVariaveis]);
            useEffect(() => { localStorage.setItem('gastosExtras', JSON.stringify(gastosExtras)); }, [gastosExtras]);
            useEffect(() => { localStorage.setItem('receitas', JSON.stringify(receitas)); }, [receitas]);
            useEffect(() => { localStorage.setItem('farol', JSON.stringify(farol)); }, [farol]);
            useEffect(() => { localStorage.setItem('metas', JSON.stringify(metas)); }, [metas]);
            useEffect(() => { localStorage.setItem('metasFinanceiras', JSON.stringify(metasFinanceiras)); }, [metasFinanceiras]);
            useEffect(() => { localStorage.setItem('reservaEmergencia', reservaEmergencia.toString()); }, [reservaEmergencia]);
            useEffect(() => { localStorage.setItem('dividas', JSON.stringify(dividas)); }, [dividas]);
            useEffect(() => { localStorage.setItem('orcamento', JSON.stringify(orcamento)); }, [orcamento]);
            useEffect(() => { localStorage.setItem('orcamentosMensais', JSON.stringify(orcamentosMensais)); }, [orcamentosMensais]);

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
                                cartoes, gastosFixos, gastosVariaveis, receitas,
                                farol, metas, orcamento, orcamentosMensais,
                                orcamentoAnual, planejadosMes, comprasParceladas
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
                                    plano: 'premium', // Usuários antigos viram premium
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
                                setPlanoInfo({ plano: planoAtual, diasRestantes: Math.max(0, diasRestantes), expirado });
                            } else if (planoAtual === 'premium') {
                                setPlanoInfo({ plano: 'premium', diasRestantes: 0, expirado: false });
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
                            setMetas(dadosBackup.dados.metas || { mensal: 20000 });
                            setOrcamento(dadosBackup.dados.orcamento || { cartoes: 8000, fixos: 5500, variaveis: 2000 });
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

            useEffect(() => { localStorage.setItem('orcamentoAnual', JSON.stringify(orcamentoAnual)); }, [orcamentoAnual]);
            useEffect(() => { localStorage.setItem('planejadosMes', JSON.stringify(planejadosMes)); }, [planejadosMes]);
            useEffect(() => { localStorage.setItem('comprasParceladas', JSON.stringify(comprasParceladas)); }, [comprasParceladas]);

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
                            2025: { ...cartao.valores }
                        }
                    };
                });

                // Migrar Receitas
                const receitasAtualizadas = receitas.map(receita => {
                    if (receita.ano) return receita; // Já tem ano
                    return { ...receita, ano: 2025 };
                });

                // Migrar Gastos Variáveis
                const variaveisAtualizados = gastosVariaveis.map(gasto => {
                    if (gasto.ano) return gasto;
                    return { ...gasto, ano: 2025 };
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

            const calcularTotais = (mes) => {
                // Valor base dos cartões - AGORA USA ANO
                const totalCartoesBase = cartoes.reduce((sum, c) => {
                    const valoresAno = c.valores?.[anoAtual] || {};
                    return sum + (valoresAno[mes] || 0);
                }, 0);
                
                // Adicionar parcelas do mês
                const parcelasDoMes = comprasParceladas
                    .filter(compra => compra.meses && compra.meses.includes(mes))
                    .reduce((sum, compra) => sum + (compra.valorParcela || 0), 0);
                
                const totalCartoes = totalCartoesBase + parcelasDoMes;
                
                // FIXOS: filtrar por mês/ano (gastos temporários) OU mostrar permanentes
                const totalFixos = gastosFixos
                    .filter(g => {
                        // Se tem mes e ano, filtrar por eles
                        if (g.mes && g.ano) {
                            return g.mes === mes && g.ano === anoAtual;
                        }
                        // Se não tem, é permanente (aparece sempre)
                        return true;
                    })
                    .reduce((sum, g) => sum + g.valor, 0);
                
                // Variáveis agora filtram por ANO também
                const totalVariaveis = gastosVariaveis
                    .filter(g => g.mes === mes && g.ano === anoAtual)
                    .reduce((sum, g) => sum + g.valor, 0);
                
                // Extras também filtram por ANO
                const totalExtras = gastosExtras
                    .filter(g => g.mes === mes && g.ano === anoAtual)
                    .reduce((sum, g) => sum + g.valor, 0);
                
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
            const calcularSaldo = (mes) => {
                // Receitas agora filtram por ANO também
                const totalReceitas = receitas
                    .filter(r => r.mes === mes && r.ano === anoAtual)
                    .reduce((sum, r) => sum + r.valor, 0);
                const totalDespesas = calcularTotais(mes).total;
                const saldo = totalReceitas - totalDespesas;
                
                return {
                    receitas: totalReceitas,
                    despesas: totalDespesas,
                    saldo: saldo,
                    positivo: saldo >= 0
                };
            };

            const calcularPagamentos = (mes) => {
                const itensPagamento = [
                    ...cartoes.map(c => {
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
                    }),
                    ...gastosFixos
                        .filter(g => {
                            // Se tem mes e ano, filtrar por eles
                            if (g.mes && g.ano) {
                                return g.mes === mes && g.ano === anoAtual;
                            }
                            // Se não tem, é permanente (aparece sempre)
                            return true;
                        })
                        .map(g => {
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
                        })
                ].filter(item => item.valor > 0);

                const totalPagar = itensPagamento.reduce((sum, item) => sum + item.valor, 0);
                const totalPago = itensPagamento.reduce((sum, item) => sum + item.valorPago, 0);
                const totalPendente = totalPagar - totalPago;
                const percentualPago = totalPagar > 0 ? (totalPago / totalPagar) * 100 : 0;
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
                    return { temAnterior: false };
                }

                const totaisAtual = calcularTotais(mesAtual);
                const totaisAnterior = calcularTotais(mesAnterior);

                const diferenca = totaisAtual.total - totaisAnterior.total;
                const variacao = totaisAnterior.total > 0 
                    ? ((diferenca / totaisAnterior.total) * 100).toFixed(1)
                    : 0;

                // Calcular melhor e pior mês do ano
                const todosMeses = MESES.map(mes => ({
                    mes,
                    total: calcularTotais(mes).total
                })).filter(m => m.total > 0);

                const melhorMes = todosMeses.length > 0 
                    ? todosMeses.reduce((min, m) => m.total < min.total ? m : min)
                    : null;
                
                const piorMes = todosMeses.length > 0
                    ? todosMeses.reduce((max, m) => m.total > max.total ? m : max)
                    : null;

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
                    const percentualMeta = (totais.total / metas.mensal) * 100;
                    
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
                    const percentualCategoria = (categoriaMaior[1] / totais.fixos) * 100;

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
            const adicionarCartao = (dados) => {
                console.log('Adicionando cartão:', dados);
                const novoCartao = {
                    id: Date.now(),
                    nome: dados.nome.toUpperCase(),
                    vencimento: parseInt(dados.vencimento),
                    diaFechamento: parseInt(dados.diaFechamento || dados.vencimento - 7), // 7 dias antes do vencimento por padrão
                    limite: parseFloat(dados.limite || 0),
                    valores: { jan: 0, fev: 0, mar: 0, abr: 0, mai: 0, jun: 0, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 }
                };
                setCartoes([...cartoes, novoCartao]);
                setModalAberto(null);
                alert('Cartão adicionado com sucesso!');
            };

            const adicionarGastoFixo = (dados) => {
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

            const adicionarGastoVariavel = (dados) => {
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

            const deletarCartao = (id) => {
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
                            limite: parseFloat(dadosAtualizados.limite) || c.limite || 0, // IMPORTANTE!
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
            
            const duplicarCartao = (cartao) => {
                const novoCartao = {
                    ...cartao,
                    id: Date.now(),
                    nome: cartao.nome + ' (Cópia)'
                };
                setCartoes([...cartoes, novoCartao]);
                alert('✅ Cartão duplicado com sucesso!');
            };

            const deletarGastoFixo = (id) => {
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
            
            const duplicarGastoFixo = (gasto) => {
                const novoGasto = {
                    ...gasto,
                    id: Date.now(),
                    descricao: gasto.descricao + ' (Cópia)'
                };
                setGastosFixos([...gastosFixos, novoGasto]);
                alert('✅ Gasto fixo duplicado com sucesso!');
            };

            const deletarGastoVariavel = (id) => {
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
            
            const duplicarGastoVariavel = (gasto) => {
                const novoGasto = {
                    ...gasto,
                    id: Date.now(),
                    descricao: gasto.descricao + ' (Cópia)'
                };
                setGastosVariaveis([...gastosVariaveis, novoGasto]);
                alert('✅ Gasto variável duplicado com sucesso!');
            };

            // Funções para Gastos Extras
            const deletarGastoExtra = (id) => {
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
            
            const duplicarGastoExtra = (gasto) => {
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
                                    [anoDestino]: {...valoresOrigem},  // Copia para destino
                                    [anoOrigem]: valoresZerados         // Zera origem
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
                    
                    alert(`✅ Migração de cartões concluída!\n\n` +
                        `💳 Cartões movidos: ${cartoesAtualizados}\n` +
                        `📅 Valores mensais migrados: ${valoresMigrados}\n\n` +
                        `✅ Valores copiados para ${anoDestino}\n` +
                        `❌ Valores de ${anoOrigem} foram ZERADOS\n\n` +
                        `Veja o console (F12) para detalhes.`
                    );
                    
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
                
                alert(`🔍 DIAGNÓSTICO COMPLETO\n\n` +
                    `💾 LOCALSTORAGE:\n` +
                    `  Receitas: ${contagem.localStorage.receitas}\n` +
                    `  Cartões: ${contagem.localStorage.cartoes}\n` +
                    `  Fixos: ${contagem.localStorage.fixos}\n` +
                    `  Variáveis: ${contagem.localStorage.variaveis}\n\n` +
                    `☁️ FIRESTORE:\n` +
                    `  Receitas: ${contagem.firestore?.receitas || 0}\n` +
                    `  Cartões: ${contagem.firestore?.cartoes || 0}\n` +
                    `  Fixos: ${contagem.firestore?.fixos || 0}\n` +
                    `  Variáveis: ${contagem.firestore?.variaveis || 0}\n\n` +
                    `⚛️ REACT (sendo usado agora):\n` +
                    `  Receitas: ${contagem.react.receitas}\n` +
                    `  Cartões: ${contagem.react.cartoes}\n` +
                    `  Fixos: ${contagem.react.fixos}\n` +
                    `  Variáveis: ${contagem.react.variaveis}\n\n` +
                    `Veja o CONSOLE (F12) para detalhes completos!`
                );
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
                
                alert(`📊 DIAGNÓSTICO COMPLETO\n\n` +
                    `📈 TOTAL DE LANÇAMENTOS:\n` +
                    `  Receitas: ${totais.receitas}\n` +
                    `  Cartões: ${totais.cartoes}\n` +
                    `  Fixos: ${totais.fixos}\n` +
                    `  Variáveis: ${totais.variaveis}\n\n` +
                    `📅 EM JANEIRO/2026:\n` +
                    `  Receitas: ${janeiroAtual.receitas}\n` +
                    `  Variáveis: ${janeiroAtual.variaveis}\n\n` +
                    `📊 DISTRIBUIÇÃO POR ANO:\n` +
                    `RECEITAS: ${Object.entries(anos.receitas).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` +
                    `CARTÕES: ${Object.entries(anos.cartoes).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` +
                    `FIXOS: ${Object.entries(anos.fixos).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n` +
                    `VARIÁVEIS: ${Object.entries(anos.variaveis).map(([ano, qtd]) => `${ano}=${qtd}`).join(', ')}\n\n` +
                    `Veja o console (F12) para LISTA COMPLETA!`
                );
            };
            
            // 🔧 CORRIGIR ANOS UNDEFINED → 2025
            const corrigirAnosUndefined = async () => {
                if (!confirm(`🔧 CORRIGIR ANOS\n\nIsso vai adicionar ano = 2025 em todos os lançamentos que não têm ano definido.\n\nDeseja continuar?`)) {
                    return;
                }
                
                const novasReceitas = receitas.map(r => 
                    !r.ano ? {...r, ano: 2025} : r
                );
                
                const novosCartoes = cartoes.map(c => 
                    !c.ano ? {...c, ano: 2025} : c
                );
                
                const novosFixos = gastosFixos.map(g => 
                    !g.ano ? {...g, ano: 2025} : g
                );
                
                const novosVariaveis = gastosVariaveis.map(g => 
                    !g.ano ? {...g, ano: 2025} : g
                );
                
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
                
                alert(`✅ Anos corrigidos!\n\n` +
                    `📊 Receitas: ${count.receitas}\n` +
                    `💳 Cartões: ${count.cartoes}\n` +
                    `🏠 Fixos: ${count.fixos}\n` +
                    `🛒 Variáveis: ${count.variaveis}\n\n` +
                    `Total: ${count.receitas + count.cartoes + count.fixos + count.variaveis} corrigidos!\n\n` +
                    `Agora você pode migrar para 2026!`
                );
            };

            // 🔄 MIGRAÇÃO EM MASSA 2025 → 2026
            const migrarAno = async (de, para) => {
                if (!confirm(`⚠️ ATENÇÃO!\n\nVocê vai MIGRAR todos os lançamentos de ${de} para ${para}.\n\nIsso vai:\n✅ Mudar o ano de ${de} → ${para}\n✅ Manter o mesmo mês\n✅ Salvar no Firestore\n\nDeseja continuar?`)) {
                    return;
                }
                
                try {
                    // Migrar receitas
                    const novasReceitas = receitas.map(r => 
                        r.ano === de ? {...r, ano: para} : r
                    );
                    
                    // Migrar cartões
                    const novosCartoes = cartoes.map(c => 
                        c.ano === de ? {...c, ano: para} : c
                    );
                    
                    // Migrar fixos
                    const novosFixos = gastosFixos.map(g => 
                        g.ano === de ? {...g, ano: para} : g
                    );
                    
                    // Migrar variáveis
                    const novosVariaveis = gastosVariaveis.map(g => 
                        g.ano === de ? {...g, ano: para} : g
                    );
                    
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
                    
                    alert(`✅ Migração concluída!\n\n` +
                        `📊 Receitas: ${count.receitas}\n` +
                        `💳 Cartões: ${count.cartoes}\n` +
                        `🏠 Fixos: ${count.fixos}\n` +
                        `🛒 Variáveis: ${count.variaveis}\n\n` +
                        `Total: ${count.receitas + count.cartoes + count.fixos + count.variaveis} lançamentos migrados!`
                    );
                } catch (error) {
                    alert('❌ Erro na migração: ' + error.message);
                    console.error(error);
                }
            };

            const adicionarReceita = (dados) => {
                console.log('Adicionando receita:', dados);
                const novaReceita = {
                    id: Date.now(),
                    categoria: dados.categoria,
                    descricao: dados.descricao || '',
                    valor: parseFloat(dados.valor),
                    mes: mesAtual,
                    ano: anoAtual, // ADICIONADO
                    data: new Date().toLocaleDateString('pt-BR')
                };
                setReceitas([...receitas, novaReceita]);
                setModalAberto(null);
                alert('Receita adicionada com sucesso!');
            };

            const deletarReceita = (id) => {
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
                                receitas: novasReceitas,  // <- USA A NOVA LISTA!
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
            
            const duplicarReceita = (receita) => {
                const novaReceita = {
                    ...receita,
                    id: Date.now(),
                    descricao: receita.descricao + ' (Cópia)'
                };
                setReceitas([...receitas, novaReceita]);
                alert('✅ Receita duplicada com sucesso!');
            };

            const adicionarPlanejado = (dados) => {
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

            const togglePlanejado = (id) => {
                setPlanejadosMes(planejadosMes.map(p => 
                    p.id === id ? { ...p, executado: !p.executado } : p
                ));
            };

            const deletarPlanejado = (id) => {
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
                        return { ...g, valor: parseFloat(valor) || 0 };
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
                const { jsPDF } = window.jspdf;
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
                const dados = [
                    ['Relatório Financeiro', mesAtual],
                    [],
                    ['Categoria', 'Valor'],
                    ['Cartões', totais.cartoes],
                    ['Gastos Fixos', totais.fixos],
                    ['Gastos Variáveis', totais.variaveis],
                    ['TOTAL', totais.total]
                ];
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
                        return { ...receita, ano: anoDestino };
                    }
                    return receita;
                });

                // Mover Gastos Variáveis
                const variaveisAtualizados = gastosVariaveis.map(gasto => {
                    if (gasto.ano === anoOrigem) {
                        return { ...gasto, ano: anoDestino };
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
                    const blob = new Blob([json], { type: 'application/json' });
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
                
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
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
                                setMetas(dadosBackup.dados.metas || { mensal: 20000 });
                                setOrcamento(dadosBackup.dados.orcamento || { cartoes: 8000, fixos: 5500, variaveis: 2000 });
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
                            cartoes, gastosFixos, gastosVariaveis, receitas,
                            farol, metas, orcamento, orcamentosMensais,
                            orcamentoAnual, planejadosMes, comprasParceladas
                        }
                    };

                    await db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
                    
                    alert('✅ Dados salvos na nuvem com sucesso!\n\n' +
                          'Seus dados estão seguros e sincronizados.');
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
                    
                    if (confirm('⚠️ ATENÇÃO!\n\nBackup encontrado!\nData: ' + 
                               (dadosBackup.dataBackup ? new Date(dadosBackup.dataBackup.toDate()).toLocaleString('pt-BR') : 'Desconhecida') +
                               '\n\nIsso vai substituir TODOS os dados atuais.\n\nContinuar?')) {
                        
                        setCartoes(dadosBackup.dados.cartoes || []);
                        setGastosFixos(dadosBackup.dados.gastosFixos || []);
                        setGastosVariaveis(dadosBackup.dados.gastosVariaveis || []);
                        setReceitas(dadosBackup.dados.receitas || []);
                        setFarol(dadosBackup.dados.farol || {});
                        setMetas(dadosBackup.dados.metas || { mensal: 20000 });
                        setOrcamento(dadosBackup.dados.orcamento || { cartoes: 8000, fixos: 5500, variaveis: 2000 });
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
            const adicionarCompraParcelada = (dados) => {
                const { descricao, cartao, valorTotal, parcelas, mesInicio } = dados;
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
                    totalParcelas: parcelas, // CAMPO IMPORTANTE!
                    parcelas, // Mantém por compatibilidade
                    valorParcela,
                    parcelaPaga: 0, // COMEÇA EM ZERO!
                    mesInicio,
                    meses: mesesCompra
                };
                
                console.log('💾 Salvando compra parcelada:', novaCompra);
                setComprasParceladas([...comprasParceladas, novaCompra]);
            };

            const excluirCompraParcelada = (id) => {
                if (confirm('Tem certeza que deseja excluir esta compra parcelada? Ela será removida de todos os meses.')) {
                    setComprasParceladas(comprasParceladas.filter(c => c.id !== id));
                }
            };

            const calcularParcelasCartao = (nomeCartao, mes) => {
                return comprasParceladas
                    .filter(c => c.cartao === nomeCartao && c.meses && c.meses.includes(mes))
                    .map(c => ({
                        ...c,
                        parcelaAtual: c.meses.indexOf(mes) + 1
                    }));
            };

            // Modal Component
            const Modal = ({ titulo, children, onClose }) => (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
                        </div>
                        {children}
                    </div>
                </div>
            );

            // Forms
            const FormNovoCartao = () => {
                const [nome, setNome] = useState('');
                const [vencimento, setVencimento] = useState(5);
                const [diaFechamento, setDiaFechamento] = useState('');
                const [limite, setLimite] = useState('');

                const handleSubmit = (e) => {
                    e.preventDefault();
                    console.log('Submit cartão:', { nome, vencimento, diaFechamento, limite });
                    if (nome.trim()) {
                        adicionarCartao({ 
                            nome, 
                            vencimento,
                            diaFechamento: diaFechamento || (parseInt(vencimento) - 7),
                            limite: limite || 0
                        });
                    } else {
                        alert('Preencha o nome do cartão!');
                    }
                };

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Cartão</label>
                            <input 
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: Nubank"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Dia de Fechamento</label>
                                <input 
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={diaFechamento}
                                    onChange={(e) => setDiaFechamento(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder={`Ex: ${parseInt(vencimento) - 7}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">Deixe vazio para 7 dias antes do vencimento</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Dia do Vencimento</label>
                                <input 
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={vencimento}
                                    onChange={(e) => setVencimento(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Limite do Cartão (Opcional)</label>
                            <input 
                                type="number"
                                step="0.01"
                                min="0"
                                value={limite}
                                onChange={(e) => setLimite(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: 10000.00"
                            />
                            <p className="text-xs text-gray-500 mt-1">Deixe vazio se não quiser controlar limite</p>
                        </div>
                        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                            ✅ Adicionar Cartão
                        </button>
                    </form>
                );
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

                const handleSubmit = (e) => {
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

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                            {!mostrarNovaCategoria ? (
                                <>
                                    <select 
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                                    >
                                        {todasCategorias.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarNovaCategoria(true)}
                                        className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                    >
                                        ➕ Criar nova categoria
                                    </button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={novaCategoria}
                                        onChange={(e) => setNovaCategoria(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500"
                                        placeholder="Ex: PETS, INVESTIMENTOS, ASSINATURAS..."
                                        autoFocus
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMostrarNovaCategoria(false);
                                                setNovaCategoria('');
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-700"
                                        >
                                            ← Voltar para categorias
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">💡 Será salvo automaticamente em MAIÚSCULAS</p>
                                </>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Descrição {temporario && <span className="text-purple-600">(base)</span>}
                            </label>
                            <input 
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                                placeholder={temporario ? "Ex: IPVA 2026" : "Ex: Aluguel"}
                                required
                            />
                            {temporario && (
                                <p className="text-xs text-gray-500 mt-1">
                                    💡 Sistema adicionará " - 1/3", " - 2/3", etc.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Valor {temporario && <span className="text-purple-600">(total)</span>}
                            </label>
                            <input 
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                                placeholder="0.00"
                                required
                            />
                            {temporario && valor && totalParcelas > 0 && (
                                <p className="text-xs text-green-600 font-semibold mt-1">
                                    💰 Cada parcela: R$ {calcularValorParcela()}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dia do Vencimento</label>
                            <input 
                                type="number"
                                min="1"
                                max="31"
                                value={vencimento}
                                onChange={(e) => setVencimento(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                                required
                            />
                        </div>
                        
                        {/* CHECKBOX TEMPORÁRIO */}
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={temporario}
                                    onChange={(e) => setTemporario(e.target.checked)}
                                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">
                                    ⏱️ Parcelar este gasto (criar parcelas automaticamente)
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-7">
                                Exemplo: IPVA, financiamento, etc.
                            </p>
                            
                            {/* CAMPOS CONDICIONAIS */}
                            {temporario && (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Número de Parcelas
                                        </label>
                                        <input 
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={totalParcelas}
                                            onChange={(e) => setTotalParcelas(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
                                            placeholder="3"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Mês de Início
                                            </label>
                                            <select
                                                value={mesInicio}
                                                onChange={(e) => setMesInicio(e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
                                            >
                                                {mesesList.map((mes, idx) => (
                                                    <option key={mes} value={mes}>{mesesNomes[idx]}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Ano de Início
                                            </label>
                                            <select
                                                value={anoInicio}
                                                onChange={(e) => setAnoInicio(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
                                            >
                                                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => (
                                                    <option key={ano} value={ano}>{ano}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded p-3 text-xs space-y-1">
                                        <div className="font-semibold text-purple-700">📋 Resumo do Parcelamento:</div>
                                        <div className="text-gray-600">
                                            • Total: R$ {valor || '0.00'}
                                        </div>
                                        <div className="text-gray-600">
                                            • {totalParcelas}x de R$ {calcularValorParcela()}
                                        </div>
                                        <div className="text-gray-600">
                                            • Início: {mesesNomes[mesesList.indexOf(mesInicio)]}/{anoInicio}
                                        </div>
                                        <div className="text-gray-600">
                                            • Vencimento: todo dia {vencimento}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
                            {temporario ? `✅ Criar ${totalParcelas} Parcelas` : '✅ Adicionar Gasto Fixo'}
                        </button>
                    </form>
                );
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

                const handleSubmit = (e) => {
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

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                            {!mostrarNovaCategoria ? (
                                <>
                                    <select 
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
                                    >
                                        {todasCategorias.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarNovaCategoria(true)}
                                        className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
                                    >
                                        ➕ Criar nova categoria
                                    </button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={novaCategoria}
                                        onChange={(e) => setNovaCategoria(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500"
                                        placeholder="Ex: VESTUÁRIO, ELETRÔNICOS, PRESENTES..."
                                        autoFocus
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMostrarNovaCategoria(false);
                                                setNovaCategoria('');
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-700"
                                        >
                                            ← Voltar para categorias
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">💡 Será salvo automaticamente em MAIÚSCULAS</p>
                                </>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Data do Gasto</label>
                            <input 
                                type="date"
                                id="dataGastoVariavel"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição (Opcional)</label>
                            <input 
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
                                placeholder="Ex: Supermercado Extra"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        
                        {/* Checkbox Mostrar no Farol */}
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={mostrarNoFarol}
                                    onChange={(e) => setMostrarNoFarol(e.target.checked)}
                                    className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">
                                    🚦 Mostrar no Farol de Pagamentos
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-7">
                                Para gastos recorrentes como IPTU, seguro anual, etc.
                            </p>
                        </div>
                        
                        <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
                            ✅ Adicionar Gasto Variável
                        </button>
                    </form>
                );
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

                const handleSubmit = (e) => {
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
                            dataCompleta: dataInput, // YYYY-MM-DD
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

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                            {!mostrarNovaCategoria ? (
                                <>
                                    <select 
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500"
                                    >
                                        {todasCategorias.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarNovaCategoria(true)}
                                        className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-semibold"
                                    >
                                        ➕ Criar nova categoria
                                    </button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={novaCategoria}
                                        onChange={(e) => setNovaCategoria(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500"
                                        placeholder="Ex: CURSO, EQUIPAMENTO..."
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMostrarNovaCategoria(false);
                                            setNovaCategoria('');
                                        }}
                                        className="mt-2 text-sm text-gray-600 hover:text-gray-700"
                                    >
                                        ← Voltar
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">💡 Salvo em MAIÚSCULAS</p>
                                </>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Data do Gasto</label>
                            <input 
                                type="date"
                                id="dataGastoExtra"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                            <input 
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500"
                                placeholder="Ex: Passagem aérea"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        
                        {/* Checkbox Mostrar no Farol */}
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={mostrarNoFarol}
                                    onChange={(e) => setMostrarNoFarol(e.target.checked)}
                                    className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">
                                    🚦 Mostrar no Farol de Pagamentos
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-7">
                                Para gastos recorrentes como seguro, licenciamento, etc.
                            </p>
                        </div>
                        
                        <button type="submit" className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
                            ✅ Adicionar Gasto Extra
                        </button>
                    </form>
                );
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
                        jan: valor, fev: valor, mar: valor, abr: valor,
                        mai: valor, jun: valor, jul: valor, ago: valor,
                        set: valor, out: valor, nov: valor, dez: valor
                    });
                };

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Padrão</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={metasTemp.mensal}
                                onChange={(e) => setMetasTemp({...metasTemp, mensal: parseFloat(e.target.value) || 0})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="20000.00"
                            />
                            <button 
                                onClick={aplicarParaTodos}
                                className="mt-2 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                            >
                                📋 Aplicar para Todos os Meses
                            </button>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-bold text-gray-800 mb-3">Metas por Mês</h4>
                            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => (
                                    <div key={mes}>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">{mes}</label>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={metasTemp[mes]}
                                            onChange={(e) => setMetasTemp({...metasTemp, [mes]: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="text-sm text-gray-600 mb-3">
                                <strong>Total Anual:</strong> R$ {(
                                    metasTemp.jan + metasTemp.fev + metasTemp.mar + metasTemp.abr +
                                    metasTemp.mai + metasTemp.jun + metasTemp.jul + metasTemp.ago +
                                    metasTemp.set + metasTemp.out + metasTemp.nov + metasTemp.dez
                                ).toFixed(2)}
                            </div>
                            <button onClick={handleSalvar} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                ✅ Salvar Metas
                            </button>
                        </div>
                    </div>
                );
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

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">💳 Orçamento para Cartões</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={cartoes}
                                onChange={(e) => setCartoes(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="8000.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">🏠 Orçamento para Gastos Fixos</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={fixos}
                                onChange={(e) => setFixos(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="5500.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Orçamento para Gastos Variáveis</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={variaveis}
                                onChange={(e) => setVariaveis(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="2000.00"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <div className="text-sm text-gray-600 mb-3">
                                <strong>Total Orçado:</strong> R$ {total.toFixed(2)}
                            </div>
                            <button onClick={handleSalvar} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                ✅ Salvar Orçamento
                            </button>
                        </div>
                    </div>
                );
            };

            const FormPlanejado = () => {
                const [descricao, setDescricao] = useState('');
                const [valor, setValor] = useState('');
                const [categoria, setCategoria] = useState('CARTÃO');

                const handleSubmit = (e) => {
                    e.preventDefault();
                    if (descricao && valor) {
                        adicionarPlanejado({ descricao, valor, categoria });
                    } else {
                        alert('Preencha descrição e valor!');
                    }
                };

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                            <input 
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: Aluguel, Mercado, Gasolina..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                            <select 
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="CARTÃO">💳 Cartão</option>
                                <option value="FIXO">🏠 Fixo</option>
                                <option value="VARIÁVEL">📊 Variável</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Planejado</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                            ✅ Adicionar Planejado
                        </button>
                    </form>
                );
            };

            const FormCompraParcelada = () => {
                const [descricao, setDescricao] = useState('');
                const [cartao, setCartao] = useState(cartoes[0]?.nome || '');
                const [valorTotal, setValorTotal] = useState('');
                const [parcelas, setParcelas] = useState('1');
                const [mesInicio, setMesInicio] = useState(mesAtual);

                const valorParcela = valorTotal && parcelas ? (parseFloat(valorTotal) / parseInt(parcelas)).toFixed(2) : 0;

                const handleSubmit = (e) => {
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

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição da Compra</label>
                            <input 
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: Notebook Dell, Geladeira Samsung..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cartão</label>
                            <select 
                                value={cartao}
                                onChange={(e) => setCartao(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                {cartoes.map(c => (
                                    <option key={c.nome} value={c.nome}>💳 {c.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Total</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={valorTotal}
                                    onChange={(e) => setValorTotal(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="1200.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Parcelas</label>
                                <select 
                                    value={parcelas}
                                    onChange={(e) => setParcelas(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                >
                                    {[1,2,3,4,5,6,7,8,9,10,11,12,15,18,24].map(num => (
                                        <option key={num} value={num}>{num}x</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mês de Início</label>
                            <select 
                                value={mesInicio}
                                onChange={(e) => setMesInicio(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {MESES.map(mes => (
                                    <option key={mes} value={mes}>{mes.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        {valorTotal && parcelas && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <div className="text-sm font-semibold text-gray-700 mb-2">📋 Preview:</div>
                                <div className="text-2xl font-bold text-blue-600 mb-2">
                                    {parcelas}x de R$ {valorParcela}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Meses: {mesesPreview.join(', ')}
                                    {parseInt(parcelas) > 12 && <span className="text-orange-600"> (continua no ano seguinte)</span>}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                            ✅ Adicionar Compra Parcelada
                        </button>
                    </form>
                );
            };

            const FormNovaReceita = () => {
                const [categoria, setCategoria] = useState('SALÁRIO');
                const [descricao, setDescricao] = useState('');
                const [valor, setValor] = useState('');

                const handleSubmit = (e) => {
                    e.preventDefault();
                    console.log('Submit receita:', { categoria, descricao, valor });
                    if (valor) {
                        adicionarReceita({ categoria, descricao, valor });
                    } else {
                        alert('Preencha o valor!');
                    }
                };

                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                            <select 
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="SALÁRIO">💼 Salário</option>
                                <option value="FREELANCE">💻 Freelance</option>
                                <option value="INVESTIMENTOS">📈 Investimentos</option>
                                <option value="ALUGUEL">🏠 Aluguel Recebido</option>
                                <option value="BÔNUS">🎁 Bônus</option>
                                <option value="OUTROS">💰 Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição (Opcional)</label>
                            <input 
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: Salário CLT"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                            ✅ Adicionar Receita
                        </button>
                    </form>
                );
            };

            // Componente Menu isolado para não afetar Dashboard
            const MenuNavegacao = React.memo(({ telaAtiva, setTelaAtiva, isUserAdmin }) => {
                const [submenuAberto, setSubmenuAberto] = useState(null);
                const menuRef = React.useRef(null);

                // Fechar submenu ao clicar fora
                React.useEffect(() => {
                    const handleClickOutside = (e) => {
                        if (menuRef.current && !menuRef.current.contains(e.target)) {
                            setSubmenuAberto(null);
                        }
                    };
                    document.addEventListener('mousedown', handleClickOutside);
                    return () => document.removeEventListener('mousedown', handleClickOutside);
                }, []);

                const menuBtnStyle = (ativo) => ({
                    padding: '6px 14px', border: 'none', cursor: 'pointer',
                    borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                    background: ativo ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color: ativo ? '#fff' : 'rgba(255,255,255,0.65)',
                    borderBottom: ativo ? '2px solid rgba(16,185,129,0.8)' : '2px solid transparent',
                    letterSpacing: '0.3px'
                });

                return (
                    <div ref={menuRef} style={{display:'flex', alignItems:'center', gap:'2px', overflowX:'auto', scrollbarWidth:'none'}}>
                        {/* Dashboard */}
                        <button onClick={() => setTelaAtiva('dashboard')} style={menuBtnStyle(telaAtiva === 'dashboard')}>
                            📊 Dashboard
                        </button>

                        {/* Admin */}
                        {isUserAdmin && (
                            <button onClick={() => setTelaAtiva('admin')} style={menuBtnStyle(telaAtiva === 'admin')}>
                                👑 Admin
                            </button>
                        )}

                        {/* Planejamento com Submenu */}
                        <div style={{position:'relative'}}>
                            <button
                                onClick={() => setSubmenuAberto(submenuAberto === 'planejamento' ? null : 'planejamento')}
                                style={menuBtnStyle(telaAtiva.startsWith('planejamento'))}
                            >
                                📋 Planejar ▾
                            </button>
                            {submenuAberto === 'planejamento' && (
                                <div style={{
                                    position:'absolute', top:'calc(100% + 8px)', left:0, zIndex:50,
                                    background:'#1e1b4b', borderRadius:'12px', minWidth:'180px',
                                    boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
                                    border:'1px solid rgba(99,102,241,0.3)', overflow:'hidden'
                                }}>
                                    {[
                                        {id:'planejamento', label:'🏥 Diagnóstico'},
                                        {id:'planejamento-orcamento', label:'📊 Orçamento'},
                                        {id:'planejamento-premes', label:'📝 Pré-Mês'},
                                        {id:'planejamento-metas', label:'🎯 Metas'},
                                        {id:'planejamento-dividas', label:'💳 Dívidas'},
                                        {id:'planejamento-compra', label:'🛒 Simul. Compra'},
                                        {id:'planejamento-simulador', label:'🎲 Simulador'},
                                        {id:'planejamento-timeline', label:'📈 Timeline'},
                                    ].map(item => (
                                        <div key={item.id} onClick={() => { setTelaAtiva(item.id); setSubmenuAberto(null); }} style={{
                                            padding:'10px 16px', cursor:'pointer', fontSize:'0.82rem',
                                            color: telaAtiva === item.id ? '#10b981' : 'rgba(255,255,255,0.8)',
                                            background: telaAtiva === item.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                                            fontWeight: telaAtiva === item.id ? '700' : '500',
                                            borderLeft: telaAtiva === item.id ? '3px solid #10b981' : '3px solid transparent',
                                            transition: 'all 0.15s'
                                        }}>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Receitas */}
                        <button onClick={() => setTelaAtiva('receitas')} style={menuBtnStyle(telaAtiva === 'receitas')}>
                            💰 Receitas
                        </button>

                        {/* Despesas com Submenu */}
                        <div style={{position:'relative'}}>
                            <button
                                onClick={() => setSubmenuAberto(submenuAberto === 'despesas' ? null : 'despesas')}
                                style={menuBtnStyle(['cartoes', 'fixos', 'variaveis', 'extras'].includes(telaAtiva))}
                            >
                                💸 Despesas ▾
                            </button>
                            {submenuAberto === 'despesas' && (
                                <div style={{
                                    position:'absolute', top:'calc(100% + 8px)', left:0, zIndex:50,
                                    background:'#1e1b4b', borderRadius:'12px', minWidth:'170px',
                                    boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
                                    border:'1px solid rgba(99,102,241,0.3)', overflow:'hidden'
                                }}>
                                    {[
                                        {id:'cartoes', label:'💳 Cartões'},
                                        {id:'fixos', label:'🏠 Gastos Fixos'},
                                        {id:'variaveis', label:'📊 Gastos Variáveis'},
                                        {id:'extras', label:'⚡ Gastos Extras'},
                                    ].map(item => (
                                        <div key={item.id} onClick={() => { setTelaAtiva(item.id); setSubmenuAberto(null); }} style={{
                                            padding:'10px 16px', cursor:'pointer', fontSize:'0.82rem',
                                            color: telaAtiva === item.id ? '#10b981' : 'rgba(255,255,255,0.8)',
                                            background: telaAtiva === item.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                                            fontWeight: telaAtiva === item.id ? '700' : '500',
                                            borderLeft: telaAtiva === item.id ? '3px solid #10b981' : '3px solid transparent',
                                            transition: 'all 0.15s'
                                        }}>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Farol */}
                        <button onClick={() => setTelaAtiva('farol')} style={menuBtnStyle(telaAtiva === 'farol')}>
                            🚦 Farol
                        </button>
                    </div>
                );
            });

            // Screens
            const Dashboard = () => {
                const progressoMeta = metas.mensal > 0 ? (totais.total / metas.mensal) * 100 : 0;
                const economia = metas.mensal - totais.total;

                return (
                    <div className="space-y-3">
                        {/* CARDS DE RESUMO - DESIGN MODERNO */}
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {/* Pagamentos */}
                            <div style={{
                                background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                                borderRadius:'14px', padding:'14px', boxShadow:'0 4px 16px rgba(49,46,129,0.25)',
                                border:'1px solid rgba(99,102,241,0.3)'
                            }}>
                                <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.6)', fontWeight:'700', letterSpacing:'0.8px', marginBottom:'4px'}}>✔️ PAGOS</div>
                                <div style={{fontSize:'1.5rem', fontWeight:'800', color:'#fff', lineHeight:1}}>{pagamentos.percentual.toFixed(0)}%</div>
                                <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', marginTop:'4px'}}>{pagamentos.qtdPago}/{pagamentos.qtdTotal}</div>
                            </div>

                            {/* Meta Mensal */}
                            {metaMensal > 0 ? (
                                <div style={{
                                    background:'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                                    borderRadius:'14px', padding:'14px', boxShadow:'0 4px 16px rgba(6,95,70,0.25)',
                                    border:'1px solid rgba(16,185,129,0.3)'
                                }}>
                                    <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.6)', fontWeight:'700', letterSpacing:'0.8px', marginBottom:'4px'}}>🎯 META {mesAtual.toUpperCase()}</div>
                                    <div style={{fontSize:'1.5rem', fontWeight:'800', color:'#fff', lineHeight:1}}>{((totais.total / metaMensal) * 100).toFixed(0)}%</div>
                                    <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', marginTop:'4px'}}>R$ {metaMensal.toFixed(0)}</div>
                                </div>
                            ) : (
                                <div style={{
                                    background:'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                                    borderRadius:'14px', padding:'14px', boxShadow:'0 4px 16px rgba(6,95,70,0.25)',
                                    border:'1px solid rgba(16,185,129,0.3)'
                                }}>
                                    <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.6)', fontWeight:'700', letterSpacing:'0.8px', marginBottom:'4px'}}>🎯 META</div>
                                    <div style={{fontSize:'1.5rem', fontWeight:'800', color:'#fff', lineHeight:1}}>-</div>
                                    <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', marginTop:'4px'}}>Não definida</div>
                                </div>
                            )}

                            {/* Pendentes */}
                            <div style={{
                                background:'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
                                borderRadius:'14px', padding:'14px', boxShadow:'0 4px 16px rgba(124,45,18,0.25)',
                                border:'1px solid rgba(251,146,60,0.3)'
                            }}>
                                <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.6)', fontWeight:'700', letterSpacing:'0.8px', marginBottom:'4px'}}>⏳ PENDENTES</div>
                                <div className="text-xl font-bold mt-1 text-gray-900">
                                    {(() => {
                                        const hoje = new Date().getDate();
                                        const pendentes = [
                                            ...cartoes.map(c => ({ nome: c.nome, vencimento: c.vencimento, status: getStatusFarol(c.nome, mesAtual) })),
                                            ...gastosFixos.map(g => ({ nome: g.descricao, vencimento: g.vencimento, status: getStatusFarol(g.descricao, mesAtual) }))
                                        ].filter(v => v.vencimento >= hoje && v.status === 'PENDENTE').length;
                                        return pendentes;
                                    })()}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">A pagar</div>
                            </div>

                            {/* Cartões */}
                            <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="rounded-xl shadow-sm compact-card">
                                <div className="text-xs text-gray-500">💳 CARTÕES</div>
                                <div className="text-xl font-bold mt-1 text-gray-900">R$ {totais.cartoes.toFixed(0)}</div>
                            </div>

                            {/* Fixos */}
                            <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="rounded-xl shadow-sm compact-card">
                                <div className="text-xs text-gray-500">🏠 FIXOS</div>
                                <div className="text-xl font-bold mt-1 text-gray-900">R$ {totais.fixos.toFixed(0)}</div>
                            </div>

                            {/* Variáveis */}
                            <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="rounded-xl shadow-sm compact-card">
                                <div className="text-xs text-gray-500">📊 VARIÁVEIS</div>
                                <div className="text-xl font-bold mt-1 text-gray-900">R$ {totais.variaveis.toFixed(0)}</div>
                            </div>

                            {/* Total */}
                            <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="rounded-xl shadow-sm compact-card">
                                <div className="text-xs text-gray-500">💰 TOTAL</div>
                                <div className="text-xl font-bold mt-1 text-gray-900">R$ {totais.total.toFixed(0)}</div>
                            </div>
                        </div>

                        {/* CARD DE SALDO REAL - COMPACTO */}
                        <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="rounded-xl shadow-sm compact-card">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">💰 Receitas</div>
                                    <div className="text-xl font-bold text-gray-900">R$ {saldo.receitas.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">💸 Despesas</div>
                                    <div className="text-xl font-bold text-gray-900">R$ {saldo.despesas.toFixed(2)}</div>
                                </div>
                                <div className="text-center border-l-2" style={{ borderColor: saldo.positivo ? '#10B981' : '#EF4444' }}>
                                    <div className="text-xs mb-1" style={{ color: saldo.positivo ? '#10B981' : '#EF4444', fontWeight: '600' }}>
                                        {saldo.positivo ? '✅ Positivo' : '⚠️ Negativo'}
                                    </div>
                                    <div className="text-2xl font-bold" style={{ color: saldo.positivo ? '#10B981' : '#EF4444' }}>
                                        {saldo.positivo ? '+' : '-'}R$ {Math.abs(saldo.saldo).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button 
                                    onClick={() => setModalAberto('novaReceita')} 
                                    className="px-4 py-2 rounded-lg font-semibold transition-all"
                                    style={{ background: '#3B82F6', color: 'white' }}
                                    onMouseOver={(e) => e.target.style.background = '#2563EB'}
                                    onMouseOut={(e) => e.target.style.background = '#3B82F6'}
                                >
                                    ➕ Adicionar Receita
                                </button>
                            </div>
                        </div>

                        {/* SEÇÃO DE GRÁFICOS - COMPACTA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Gráfico de Pizza - Distribuição de Gastos */}
                            <div className="bg-white rounded-xl shadow-sm compact-card" style={{ border: '1px solid #E5E7EB' }}>
                                <h3 className="compact-title font-bold text-gray-800">📊 Distribuição</h3>
                                <div className="flex justify-center" style={{ height: '200px' }}>
                                    <canvas id="chartPieGastos" width="200" height="200"></canvas>
                                </div>
                                {React.useEffect(() => {
                                    const ctx = document.getElementById('chartPieGastos');
                                    if (ctx && window.Chart) {
                                        new Chart(ctx, {
                                            type: 'doughnut',
                                            data: {
                                                labels: ['💳 Cartões', '🏠 Fixos', '📊 Variáveis'],
                                                datasets: [{
                                                    data: [totais.cartoes, totais.fixos, totais.variaveis],
                                                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                                                    borderWidth: 2,
                                                    borderColor: '#fff'
                                                }]
                                            },
                                            options: {
                                                responsive: true,
                                                maintainAspectRatio: true,
                                                plugins: {
                                                    legend: { position: 'bottom' },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const value = context.parsed;
                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }, [totais])}
                                <div className="mt-2 text-center text-xs text-gray-600">
                                    Total: R$ {totais.total.toFixed(2)}
                                </div>
                            </div>

                            {/* Gráfico de Barras - Comparação com Meta */}
                            <div className="bg-white rounded-xl shadow-sm compact-card" style={{ border: '1px solid #E5E7EB' }}>
                                <h3 className="compact-title font-bold text-gray-800">📈 Real vs Orçado</h3>
                                <div className="flex justify-center" style={{ height: '200px' }}>
                                    <canvas id="chartBarOrcamento" width="200" height="200"></canvas>
                                </div>
                                {React.useEffect(() => {
                                    const ctx = document.getElementById('chartBarOrcamento');
                                    if (ctx && window.Chart) {
                                        const orcadoTotal = orcamento.cartoes + orcamento.fixos + orcamento.variaveis;
                                        new Chart(ctx, {
                                            type: 'bar',
                                            data: {
                                                labels: ['Cartões', 'Fixos', 'Variáveis', 'TOTAL'],
                                                datasets: [{
                                                    label: 'Realizado',
                                                    data: [totais.cartoes, totais.fixos, totais.variaveis, totais.total],
                                                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
                                                    borderRadius: 8
                                                }, {
                                                    label: 'Orçado',
                                                    data: [orcamento.cartoes, orcamento.fixos, orcamento.variaveis, orcadoTotal],
                                                    backgroundColor: ['#93c5fd', '#6ee7b7', '#fcd34d', '#a5b4fc'],
                                                    borderRadius: 8
                                                }]
                                            },
                                            options: {
                                                responsive: true,
                                                maintainAspectRatio: true,
                                                plugins: {
                                                    legend: { position: 'bottom' },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `${context.dataset.label}: R$ ${context.parsed.y.toFixed(2)}`
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            callback: (value) => `R$ ${value.toFixed(0)}`
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }, [totais, orcamento])}
                            </div>
                        </div>

                        {/* CARD DE PAGAMENTOS - COMPACTO */}
                        <div className="bg-white rounded-xl shadow-sm compact-card" style={{ border: '1px solid #E5E7EB' }}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="compact-title font-bold text-gray-800">💰 Pagamentos - {mesAtual.toUpperCase()}</h3>
                                <button 
                                    onClick={() => setTelaAtiva('farol')}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                >
                                    Ver Todos →
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <div style={{ background: '#F0F9FF', border: '1px solid #BFDBFE' }} className="rounded-lg p-3">
                                    <div className="text-xs text-gray-600">Total</div>
                                    <div className="text-lg font-bold" style={{ color: '#3B82F6' }}>R$ {pagamentos.total.toFixed(2)}</div>
                                </div>
                                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }} className="rounded-lg p-3">
                                    <div className="text-xs text-gray-600">✅ Pago</div>
                                    <div className="text-lg font-bold" style={{ color: '#10B981' }}>R$ {pagamentos.pago.toFixed(2)}</div>
                                </div>
                                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }} className="rounded-lg p-3">
                                    <div className="text-xs text-gray-600">⏳ Pendente</div>
                                    <div className="text-lg font-bold" style={{ color: '#F59E0B' }}>R$ {pagamentos.pendente.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-gray-700">Progresso</span>
                                    <span className="font-bold text-gray-800">{pagamentos.percentual.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className={`h-4 rounded-full transition-all ${
                                            pagamentos.percentual >= 100 ? 'bg-green-500' :
                                            pagamentos.percentual >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(pagamentos.percentual, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {pagamentos.items.slice(0, 5).length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 mb-2">Próximos Pagamentos:</div>
                                    <div className="space-y-2">
                                        {pagamentos.items.slice(0, 5).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{item.pago ? '✅' : '⏳'}</span>
                                                    <span className={`font-medium ${item.pago ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                        {item.nome}
                                                    </span>
                                                </div>
                                                <span className={`font-bold ${item.pago ? 'text-green-600' : 'text-gray-800'}`}>
                                                    R$ {item.valor.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* VISÃO ANUAL RETRÁTIL */}
                        {(() => {
                            const [expandido, setExpandido] = React.useState(false);
                            
                            const mesesComDados = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
                                .filter(mes => calcularTotais(mes).total > 0);
                            
                            const totalGastoAnoAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
                                .reduce((sum, mes) => sum + calcularTotais(mes).total, 0);
                            
                            const totalMetaAno = metas.jan + metas.fev + metas.mar + metas.abr + metas.mai + metas.jun + 
                                                 metas.jul + metas.ago + metas.set + metas.out + metas.nov + metas.dez;

                            return (
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div 
                                        onClick={() => setExpandido(!expandido)}
                                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                    📊 Resumo Anual 2025
                                                    <span className={`text-2xl transition-transform ${expandido ? 'rotate-180' : ''}`}>▼</span>
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {mesesComDados.length} meses com dados • R$ {totalGastoAnoAteAgora.toFixed(2)} gastos no ano
                                                </p>
                                            </div>
                                            <button 
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTelaAtiva('planejamento');
                                                }}
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>

                                    {expandido && (
                                        <div className="px-4 pb-6 border-t">
                                            <div className="mt-4 space-y-2">
                                                {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => {
                                                    const gasto = calcularTotais(mes).total;
                                                    const meta = metas[mes] || 0;
                                                    const percentual = meta > 0 ? (gasto / meta) * 100 : 0;
                                                    const dentroMeta = gasto <= meta && gasto > 0;
                                                    const semDados = gasto === 0;
                                                    const mesAtualBool = mes === mesAtual;
                                                    
                                                    return (
                                                        <div 
                                                            key={mes}
                                                            onClick={() => setMesAtual(mes)}
                                                            className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                                                                mesAtualBool ? 'bg-blue-50 border-2 border-blue-300' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="w-12 text-center">
                                                                {mesAtualBool && <span className="text-blue-600 font-bold">►</span>}
                                                            </div>
                                                            <div className="w-16">
                                                                <span className="font-bold text-gray-800 uppercase">{mes}</span>
                                                            </div>
                                                            <div className="w-32">
                                                                <span className={`font-semibold ${semDados ? 'text-gray-400' : 'text-gray-800'}`}>
                                                                    R$ {gasto.toFixed(0)}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                                    <div 
                                                                        className={`h-3 rounded-full transition-all ${
                                                                            semDados ? 'bg-gray-300' :
                                                                            dentroMeta ? 'bg-green-500' : 
                                                                            'bg-red-500'
                                                                        }`}
                                                                        style={{ width: meta > 0 ? `${Math.min((gasto / meta) * 100, 100)}%` : '0%' }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <div className="w-24 text-right">
                                                                <span className={`font-bold ${
                                                                    semDados ? 'text-gray-400' :
                                                                    dentroMeta ? 'text-green-600' : 
                                                                    'text-red-600'
                                                                }`}>
                                                                    {semDados ? '-' : `${percentual.toFixed(0)}%`}
                                                                </span>
                                                            </div>
                                                            <div className="w-12 text-center text-2xl">
                                                                {semDados ? '⏳' : dentroMeta ? '✅' : '❌'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-3 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Total Gasto (Ano):</span>
                                                    <span className="font-bold text-gray-800 ml-2">R$ {totalGastoAnoAteAgora.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Meta Anual:</span>
                                                    <span className="font-bold text-gray-800 ml-2">R$ {totalMetaAno.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* COMPARAÇÃO ENTRE MESES */}
                        {comparacao.temAnterior && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Comparação com Mês Anterior</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Comparação Direta */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="text-sm text-gray-600">Mês Anterior ({comparacao.mesAnterior.toUpperCase()})</div>
                                                <div className="text-lg font-bold text-gray-800">
                                                    R$ {comparacao.totaisAnterior.total.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                                            <div>
                                                <div className="text-sm text-blue-600 font-semibold">Mês Atual ({mesAtual.toUpperCase()})</div>
                                                <div className="text-2xl font-bold text-blue-800">
                                                    R$ {comparacao.totaisAtual.total.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Variação */}
                                        <div className={`p-6 rounded-xl text-center ${
                                            comparacao.aumentou 
                                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                                : 'bg-gradient-to-r from-green-500 to-green-600'
                                        } text-white`}>
                                            <div className="text-sm opacity-90">Variação</div>
                                            <div className="text-2xl font-bold mt-2">
                                                {comparacao.aumentou ? '↗️' : '↘️'} {Math.abs(comparacao.variacao)}%
                                            </div>
                                            <div className="text-lg mt-2">
                                                {comparacao.aumentou ? '+' : '-'} R$ {Math.abs(comparacao.diferenca).toFixed(2)}
                                            </div>
                                            <div className="text-sm mt-3 opacity-90">
                                                {comparacao.aumentou 
                                                    ? '⚠️ Você gastou MAIS este mês'
                                                    : '✅ Você gastou MENOS este mês'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalhamento por Categoria */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-700">Comparativo Detalhado:</h4>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-semibold text-gray-700">💳 Cartões</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-800">
                                                        R$ {comparacao.totaisAtual.cartoes.toFixed(2)}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        comparacao.totaisAtual.cartoes > comparacao.totaisAnterior.cartoes 
                                                            ? 'text-red-600' 
                                                            : 'text-green-600'
                                                    }`}>
                                                        {comparacao.totaisAtual.cartoes > comparacao.totaisAnterior.cartoes ? '↗️' : '↘️'}
                                                        {' '}R$ {Math.abs(comparacao.totaisAtual.cartoes - comparacao.totaisAnterior.cartoes).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-semibold text-gray-700">🏠 Fixos</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-800">
                                                        R$ {comparacao.totaisAtual.fixos.toFixed(2)}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        comparacao.totaisAtual.fixos > comparacao.totaisAnterior.fixos 
                                                            ? 'text-red-600' 
                                                            : 'text-green-600'
                                                    }`}>
                                                        {comparacao.totaisAtual.fixos > comparacao.totaisAnterior.fixos ? '↗️' : '↘️'}
                                                        {' '}R$ {Math.abs(comparacao.totaisAtual.fixos - comparacao.totaisAnterior.fixos).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-semibold text-gray-700">📊 Variáveis</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-800">
                                                        R$ {comparacao.totaisAtual.variaveis.toFixed(2)}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        comparacao.totaisAtual.variaveis > comparacao.totaisAnterior.variaveis 
                                                            ? 'text-red-600' 
                                                            : 'text-green-600'
                                                    }`}>
                                                        {comparacao.totaisAtual.variaveis > comparacao.totaisAnterior.variaveis ? '↗️' : '↘️'}
                                                        {' '}R$ {Math.abs(comparacao.totaisAtual.variaveis - comparacao.totaisAnterior.variaveis).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Melhor e Pior Mês */}
                                        {comparacao.melhorMes && comparacao.piorMes && (
                                            <div className="mt-4 pt-4 border-t space-y-2">
                                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div>
                                                        <div className="text-xs text-green-600 font-semibold">🏆 MELHOR MÊS</div>
                                                        <div className="font-bold text-green-700">
                                                            {comparacao.melhorMes.mes.toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="text-lg font-bold text-green-600">
                                                        R$ {comparacao.melhorMes.total.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <div>
                                                        <div className="text-xs text-red-600 font-semibold">📉 PIOR MÊS</div>
                                                        <div className="font-bold text-red-700">
                                                            {comparacao.piorMes.mes.toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="text-lg font-bold text-red-600">
                                                        R$ {comparacao.piorMes.total.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INSIGHTS AUTOMÁTICOS */}
                        {insights.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Insights e Alertas Inteligentes</h3>
                                
                                <div className="space-y-3">
                                    {insights.map((insight, idx) => {
                                        const cores = {
                                            red: 'bg-red-50 border-red-200 text-red-800',
                                            green: 'bg-green-50 border-green-200 text-green-800',
                                            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                                            blue: 'bg-blue-50 border-blue-200 text-blue-800',
                                            orange: 'bg-orange-50 border-orange-200 text-orange-800',
                                            purple: 'bg-purple-50 border-purple-200 text-purple-800'
                                        };

                                        return (
                                            <div 
                                                key={idx}
                                                className={`p-4 rounded-lg border-l-4 ${cores[insight.cor]}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="text-2xl">{insight.icone}</div>
                                                    <div className="flex-1">
                                                        <div className="font-bold mb-1">{insight.titulo}</div>
                                                        <div className="text-sm">{insight.mensagem}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                                    💡 <strong>Dica:</strong> Estes insights são gerados automaticamente com base nos seus gastos e metas.
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        {metas.mensal > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">🎯 Meta Mensal</h3>
                                    <button onClick={() => setModalAberto('metas')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                        Editar
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Gasto Atual</span>
                                        <span className="font-semibold">R$ {totais.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Meta</span>
                                        <span className="font-semibold">R$ {metas.mensal.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full ${progressoMeta > 100 ? 'bg-red-500' : progressoMeta > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold" style={{ color: progressoMeta > 100 ? '#ef4444' : progressoMeta > 80 ? '#f59e0b' : '#10b981' }}>
                                            {progressoMeta.toFixed(1)}%
                                        </span>
                                        {economia > 0 ? (
                                            <span className="text-green-600 font-semibold">✅ Economizou R$ {economia.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">❌ Ultrapassou R$ {Math.abs(economia).toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button onClick={() => setModalAberto('novoCartao')} className="px-4 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                ➕ Novo Cartão
                            </button>
                            <button onClick={() => setModalAberto('novoGastoFixo')} className="px-4 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
                                ➕ Gasto Fixo
                            </button>
                            <button onClick={() => setModalAberto('novoGastoVariavel')} className="px-4 py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
                                ➕ Gasto Variável
                            </button>
                            <button onClick={() => setModalAberto('metas')} className="px-4 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                🎯 Definir Metas
                            </button>
                        </div>

                        {/* Exportar */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">📤 Exportar Dados</h3>
                            <div className="flex gap-3">
                                <button onClick={exportarPDF} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                                    📄 Baixar PDF
                                </button>
                                <button onClick={exportarExcel} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                    📊 Baixar Excel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            };

            // 👑 PAINEL DE ADMINISTRAÇÃO
            const TelaAdmin = ({ isUserAdmin: isUserAdminProp }) => {
                const [usuarios, setUsuarios] = useState([]);
                const [loading, setLoading] = useState(true);
                const [stats, setStats] = useState({ total: 0, ativos: 0, novos: 0 });

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
                    return (
                        <div className="max-w-4xl mx-auto p-8">
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                                <div className="text-6xl mb-4">🚫</div>
                                <h2 className="text-2xl font-bold text-red-800 mb-2">Acesso Negado</h2>
                                <p className="text-red-600 mb-4">Você não tem permissões de administrador.</p>
                                <div className="bg-white rounded-lg p-4 text-left space-y-2 text-sm">
                                    <div><strong>DEBUG INFO:</strong></div>
                                    <div>• isUserAdminProp: <code className="bg-gray-200 px-2 py-1 rounded">{String(isUserAdminProp)}</code></div>
                                    <div>• User UID: <code className="bg-gray-200 px-2 py-1 rounded">{user?.uid || 'null'}</code></div>
                                    <div>• User Email: <code className="bg-gray-200 px-2 py-1 rounded">{user?.email || 'null'}</code></div>
                                    <div>• Firestore: <code className="bg-gray-200 px-2 py-1 rounded">{db ? 'Conectado' : 'Desconectado'}</code></div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!db || !user) {
                                            alert('❌ DB ou User não disponível');
                                            return;
                                        }
                                        try {
                                            const doc = await db.collection('usuarios').doc(user.uid).get();
                                            if (doc.exists) {
                                                const data = doc.data();
                                                alert(`📊 DADOS DO FIRESTORE:\n\n` +
                                                    `Nome: ${data.nome}\n` +
                                                    `Email: ${data.email}\n` +
                                                    `isAdmin: ${data.isAdmin}\n` +
                                                    `Status: ${data.status}\n\n` +
                                                    `Para ser admin, isAdmin deve ser true!`);
                                            } else {
                                                alert('❌ Seu usuário não existe no Firestore!');
                                            }
                                        } catch (error) {
                                            alert('❌ Erro ao verificar: ' + error.message);
                                        }
                                    }}
                                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    🔍 Verificar Meus Dados no Firestore
                                </button>
                            </div>
                        </div>
                    );
                }

                if (loading) {
                    return (
                        <div className="max-w-6xl mx-auto p-4">
                            <div className="text-center py-12">
                                <div className="text-2xl mb-4">⏳</div>
                                <p className="text-gray-600">Carregando usuários...</p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="max-w-6xl mx-auto p-4 space-y-3">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-xl font-bold mb-2">👑 Painel de Administração</h1>
                                    <p className="opacity-90">Gerencie usuários e visualize estatísticas do sistema</p>
                                </div>
                                <button
                                    onClick={() => {
                                        console.log('🔍 DIAGNÓSTICO COMPLETO:');
                                        console.log('• isUserAdmin:', isUserAdminProp);
                                        console.log('• user:', user);
                                        console.log('• db:', db);
                                        console.log('• usuarios.length:', usuarios.length);
                                        console.log('• stats:', stats);
                                        alert(`🔍 DIAGNÓSTICO:\n\n` +
                                            `Admin: ${isUserAdminProp}\n` +
                                            `User: ${user?.email}\n` +
                                            `DB: ${db ? 'OK' : 'ERRO'}\n` +
                                            `Usuários: ${usuarios.length}\n\n` +
                                            `Veja console (F12) para mais detalhes`);
                                    }}
                                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-all"
                                >
                                    🔍 Diagnóstico
                                </button>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                                <div className="text-sm text-gray-600 mb-2">👥 Total de Usuários</div>
                                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200">
                                <div className="text-sm text-gray-600 mb-2">⏳ Aguardando Aprovação</div>
                                <div className="text-2xl font-bold text-yellow-600">{stats.pendentes || 0}</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
                                <div className="text-sm text-gray-600 mb-2">✅ Ativos Hoje</div>
                                <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                                <div className="text-sm text-gray-600 mb-2">🆕 Novos (7 dias)</div>
                                <div className="text-2xl font-bold text-purple-600">{stats.novos}</div>
                            </div>
                        </div>

                        {/* Solicitações Pendentes */}
                        {(() => {
                            const pendentes = usuarios.filter(u => u.status === 'PENDENTE');
                            if (pendentes.length === 0) return null;
                            
                            return (
                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-4 bg-yellow-100 border-b border-yellow-300">
                                        <h2 className="text-xl font-bold text-yellow-900">
                                            ⏳ Solicitações Pendentes ({pendentes.length})
                                        </h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {pendentes.map(usuario => (
                                            <div key={usuario.uid} className="bg-white border-2 border-yellow-200 rounded-lg p-4">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-2xl">👤</span>
                                                            <div className="flex-1">
                                                                <div className="font-bold text-lg text-gray-800">{usuario.nome}</div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <span>{usuario.email}</span>
                                                                    {usuario.emailVerificado ? (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                                            ✅ Verificado
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                                                            ⚠️ Não verificado
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            📅 Solicitou em: {(() => {
                                                                try {
                                                                    return usuario.criadoEm && usuario.criadoEm.toDate 
                                                                        ? new Date(usuario.criadoEm.toDate()).toLocaleString('pt-BR')
                                                                        : 'Data desconhecida';
                                                                } catch {
                                                                    return 'Data desconhecida';
                                                                }
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
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
                                                            }}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                                        >
                                                            ✅ Aprovar
                                                        </button>
                                                        <button
                                                            onClick={async () => {
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
                                                            }}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                                        >
                                                            ❌ Rejeitar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Lista de Usuários */}
                        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b">
                                <h2 className="text-base font-bold text-gray-800">📋 Lista de Usuários</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Usuário</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cadastro</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tipo</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {usuarios.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                                                    <div className="text-4xl mb-2">👥</div>
                                                    <div className="font-semibold">Nenhum usuário encontrado</div>
                                                    <div className="text-sm mt-1">Os usuários aparecerão aqui após o cadastro</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            usuarios.map((usuario, index) => (
                                                <tr key={usuario.uid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{usuario.isAdmin ? '👑' : '👤'}</span>
                                                        <span className="font-semibold">{usuario.nome || 'Sem nome'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span>{usuario.email}</span>
                                                        {usuario.emailVerificado ? (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold" title="Email verificado">
                                                                ✅
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold" title="Email não verificado">
                                                                ⚠️
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {(() => {
                                                        try {
                                                            return usuario.criadoEm && usuario.criadoEm.toDate 
                                                                ? new Date(usuario.criadoEm.toDate()).toLocaleDateString('pt-BR') 
                                                                : 'N/A';
                                                        } catch {
                                                            return 'N/A';
                                                        }
                                                    })()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        usuario.status === 'APROVADO' ? 'bg-green-100 text-green-800' :
                                                        usuario.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                                                        usuario.status === 'REJEITADO' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {usuario.status === 'APROVADO' ? '✅ APROVADO' :
                                                         usuario.status === 'PENDENTE' ? '⏳ PENDENTE' :
                                                         usuario.status === 'REJEITADO' ? '❌ REJEITADO' :
                                                         '✅ ATIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        usuario.isAdmin 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {usuario.isAdmin ? 'ADMIN' : 'USUÁRIO'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {usuario.uid !== user.uid && (
                                                        <button
                                                            onClick={() => toggleAdmin(usuario.uid, usuario.isAdmin)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                                                usuario.isAdmin
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                        >
                                                            {usuario.isAdmin ? '⬇️ Rebaixar' : '⬆️ Promover'}
                                                        </button>
                                                    )}
                                                    {usuario.uid === user.uid && (
                                                        <span className="text-xs text-gray-500 italic">Você</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Informações */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informações</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>Admin:</strong> Pode acessar este painel e gerenciar outros usuários</li>
                                <li>• <strong>Usuário:</strong> Acessa apenas seus próprios dados financeiros</li>
                                <li>• Você não pode alterar suas próprias permissões</li>
                                <li>• Para gerenciar contas (excluir, desativar), use o Firebase Console</li>
                            </ul>
                        </div>

                        {/* Botão atualizar */}
                        <div className="flex justify-center">
                            <button
                                onClick={carregarUsuarios}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                🔄 Atualizar Lista
                            </button>
                        </div>
                    </div>
                );
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
                const calcularProjecao = (cartao) => {
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
                
                console.log(`🔴 DÍVIDA TOTAL: R$ ${totalDivida.toFixed(2)} (${totalLimites > 0 ? ((totalDivida/totalLimites)*100).toFixed(0) : 0}% dos limites)`);

                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">💳 Cartões de Crédito - {mesAtual.toUpperCase()} / {anoAtual}</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setModalAberto('compraParcelada')} 
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm"
                                >
                                    🛒 Nova Compra Parcelada
                                </button>
                                <button 
                                    onClick={() => setModalAberto('novoCartao')} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm"
                                >
                                    ➕ Novo Cartão
                                </button>
                            </div>
                        </div>

                        {/* Cards de Resumo por Cartão */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                            {/* Card Total do Mês */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-3 cursor-pointer transition-transform hover:scale-105">
                                <div className="text-white/80 text-xs font-semibold mb-1">💳 TOTAL MÊS</div>
                                <div className="text-xl font-bold text-white">R$ {totalGeralMes.toFixed(2)}</div>
                                <div className="text-white/70 text-xs mt-0.5">{mesAtual.toUpperCase()}/{anoAtual}</div>
                            </div>

                            {/* Cards por Cartão */}
                            {Object.entries(totaisPorCartao)
                                .sort((a, b) => b[1] - a[1]) // Ordena por valor (maior primeiro)
                                .map(([nomeCartao, valor]) => {
                                    const percentual = totalGeralMes > 0 ? (valor / totalGeralMes) * 100 : 0;
                                    const cartao = cartoes.find(c => c.nome === nomeCartao);
                                    const limite = cartao?.limite || 0;
                                    
                                    return (
                                        <div 
                                            key={nomeCartao}
                                            className="bg-white rounded-lg shadow-md p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border border-gray-200"
                                            onClick={() => {
                                                const elemento = document.getElementById(`cartao-${nomeCartao}`);
                                                if (elemento) {
                                                    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    elemento.style.transform = 'scale(1.02)';
                                                    setTimeout(() => {
                                                        elemento.style.transform = 'scale(1)';
                                                    }, 300);
                                                }
                                            }}
                                        >
                                            <div className="text-gray-600 text-xs font-semibold mb-1 truncate">{nomeCartao}</div>
                                            <div className="text-lg font-bold text-blue-600">R$ {valor.toFixed(2)}</div>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <div className="text-blue-600 text-xs font-semibold">{percentual.toFixed(0)}%</div>
                                                {limite > 0 && (
                                                    <div className="text-gray-500 text-xs" title="Limite do cartão">
                                                        Lim: {limite.toFixed(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {limite > 0 && (
                                                <div className="mt-1.5">
                                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                                        <div 
                                                            className={`h-1 rounded-full ${
                                                                (valor / limite) * 100 > 80 ? 'bg-red-500' :
                                                                (valor / limite) * 100 > 60 ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                            }`}
                                                            style={{ width: `${Math.min((valor / limite) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            
                            {/* Card Dívida Total - NO FINAL */}
                            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-md p-3 transition-transform hover:scale-105">
                                <div className="text-white/80 text-xs font-semibold mb-1">🔴 DÍVIDA TOTAL</div>
                                <div className="text-xl font-bold text-white">R$ {totalDivida.toFixed(2)}</div>
                                <div className="text-white/70 text-xs mt-0.5">
                                    {totalLimites > 0 ? `${((totalDivida / totalLimites) * 100).toFixed(0)}% limites` : 'Ano completo'}
                                </div>
                            </div>
                        </div>

                        {/* Lista de Cartões */}
                        {cartoes.map(cartao => {
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
                                const percentualUsado = limite > 0 ? (usado / limite) * 100 : 0;
                                
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
                            
                            return (
                                <div 
                                    key={cartao.id} 
                                    id={`cartao-${cartao.nome}`}
                                    className="bg-white rounded-xl shadow-lg p-4"
                                    style={{ transition: 'transform 0.3s ease' }}
                                >
                                    {/* Header do Cartão */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg font-bold text-gray-800">{cartao.nome}</span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    statusFatura === 'ABERTA' ? 'bg-blue-100 text-blue-700' :
                                                    statusFatura === 'FECHADA' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {statusFatura === 'ABERTA' ? '⏳ FATURA ABERTA' :
                                                     statusFatura === 'FECHADA' ? '✅ FATURA FECHADA' :
                                                     '⚠️ VENCIDA'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <div>📅 Fecha dia {cartao.diaFechamento || cartao.vencimento - 7} • Vence dia {cartao.vencimento}</div>
                                                {valorParcelas > 0 && <div>📦 {parcelasCartao.length} parcela(s) ativas: R$ {valorParcelas.toFixed(2)}</div>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setItemEditando(cartao);
                                                    setTipoEditando('cartao');
                                                    setModalAberto('editar');
                                                }}
                                                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => duplicarCartao(cartao)}
                                                className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm"
                                            >
                                                📋
                                            </button>
                                            <button 
                                                onClick={() => deletarCartao(cartao.id)} 
                                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grid de Informações */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {/* Fatura do Mês */}
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="text-xs text-gray-600 mb-1">💳 FATURA {mesAtual.toUpperCase()}</div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    value={valorBase}
                                                    onChange={(e) => editarValorCartao(cartao.id, mesAtual, e.target.value)}
                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                                                    placeholder="Base"
                                                />
                                                <span className="text-xs text-gray-500">+</span>
                                                <span className="text-sm text-gray-600">{valorParcelas.toFixed(2)}</span>
                                            </div>
                                            <div className="text-xl font-bold text-blue-600">R$ {valorTotal.toFixed(2)}</div>
                                        </div>

                                        {/* Limite */}
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="text-xs text-gray-600 mb-3">🎯 LIMITE</div>
                                            {limite > 0 ? (
                                                <>
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Limite Total:</span>
                                                            <span className="font-semibold text-gray-800">R$ {limite.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Limite Utilizado:</span>
                                                            <span className="font-semibold text-red-600">R$ {limiteInfo.usado.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm border-t pt-2">
                                                            <span className="text-gray-600 font-semibold">Limite Disponível:</span>
                                                            <span className="font-bold text-green-600">R$ {limiteInfo.disponivel.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div 
                                                            className={`h-3 rounded-full transition-all ${limiteInfo.percentual > 80 ? 'bg-red-500' : limiteInfo.percentual > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(limiteInfo.percentual, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-sm text-gray-500 mb-1">Não definido</div>
                                                    <div className="text-sm text-blue-600 font-semibold">Gasto atual: R$ {valorTotal.toFixed(2)}</div>
                                                    <button 
                                                        onClick={() => {
                                                            const novoLimite = prompt('Defina o limite do cartão:', '10000');
                                                            if (novoLimite && !isNaN(novoLimite)) {
                                                                const cartoesAtualizados = cartoes.map(c => 
                                                                    c.id === cartao.id ? {...c, limite: parseFloat(novoLimite)} : c
                                                                );
                                                                console.log('✅ Atualizando limite:', novoLimite);
                                                                setCartoes(cartoesAtualizados);
                                                                // Força salvamento imediato
                                                                localStorage.setItem('cartoes', JSON.stringify(cartoesAtualizados));
                                                                alert(`✅ Limite definido: R$ ${parseFloat(novoLimite).toFixed(2)}`);
                                                            }
                                                        }}
                                                        className="mt-2 text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        ➕ Definir Limite
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Parcelas Detalhadas */}
                                        {parcelasCartao.length > 0 && (
                                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                                <div className="text-xs text-gray-600 mb-2">📦 PARCELAS ATIVAS</div>
                                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                                    {parcelasCartao.map((p, idx) => (
                                                        <div key={idx} className="text-xs text-gray-700">
                                                            {p.descricao}: {p.parcelaAtual}/{p.totalParcelas} • R$ {p.valorParcela.toFixed(2)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Projeção Futura */}
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
                                        <div className="text-xs text-gray-600 mb-2">📈 PROJEÇÃO PRÓXIMOS 6 MESES</div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {projecao.map((p, idx) => (
                                                <div key={idx} className="text-center">
                                                    <div className="text-xs font-semibold text-gray-700">{p.mes}</div>
                                                    <div className="text-sm font-bold text-purple-600">R$ {p.valor.toFixed(0)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
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
                const gastosFiltrados = categoriaFiltro === 'TODAS' 
                    ? gastosDoMesAno 
                    : gastosDoMesAno.filter(g => g.categoria === categoriaFiltro);
                
                // Calcular total por categoria
                const totalCategoria = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
                
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">🏠 Gastos Fixos - {mesAtual.toUpperCase()} / {anoAtual}</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setModalAberto('gerenciarCategorias')} 
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
                                >
                                    🏷️ Categorias
                                </button>
                                <button 
                                    onClick={() => setModalAberto('novoGastoFixo')} 
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                                >
                                    ➕ Novo Gasto
                                </button>
                            </div>
                        </div>

                        {/* Cards por Categoria */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Card Total Geral */}
                            <div 
                                className={`bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
                                    categoriaFiltro === 'TODAS' ? 'ring-4 ring-purple-300' : ''
                                }`}
                                onClick={() => setCategoriaFiltro('TODAS')}
                            >
                                <div className="text-white/80 text-xs font-semibold mb-1">💰 TOTAL GERAL</div>
                                <div className="text-2xl font-bold text-white">R$ {totalGeral.toFixed(2)}</div>
                                <div className="text-white/70 text-xs mt-1">{gastosFixos.length} gastos</div>
                            </div>

                            {/* Cards por Categoria */}
                            {Object.entries(totaisPorCategoria)
                                .sort((a, b) => b[1] - a[1]) // Ordena por valor (maior primeiro)
                                .map(([categoria, total]) => {
                                    const quantidade = gastosFixos.filter(g => g.categoria === categoria).length;
                                    const percentual = totalGeral > 0 ? (total / totalGeral) * 100 : 0;
                                    
                                    return (
                                        <div 
                                            key={categoria}
                                            className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${
                                                categoriaFiltro === categoria 
                                                    ? 'border-purple-500 ring-2 ring-purple-300' 
                                                    : 'border-gray-200'
                                            }`}
                                            onClick={() => setCategoriaFiltro(categoria)}
                                        >
                                            <div className="text-gray-600 text-xs font-semibold mb-1 truncate">{categoria}</div>
                                            <div className="text-xl font-bold text-purple-600">R$ {total.toFixed(2)}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="text-gray-500 text-xs">{quantidade} gasto{quantidade > 1 ? 's' : ''}</div>
                                                <div className="text-purple-600 text-xs font-semibold">{percentual.toFixed(0)}%</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Filtro por Categoria (agora só visual, cards fazem o filtro) */}
                        <div className="bg-white rounded-xl shadow-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        🔍 Mostrando: <span className="text-purple-600">{categoriaFiltro}</span>
                                    </span>
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                    R$ {totalCategoria.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Lista de Gastos - AGRUPADA POR DATA */}
                        <div className="space-y-3">
                        {gastosFiltrados.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <div className="text-4xl mb-3">🔍</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum gasto encontrado</h3>
                                <p className="text-gray-600">
                                    {categoriaFiltro === 'TODAS' 
                                        ? 'Adicione seu primeiro gasto fixo!' 
                                        : `Nenhum gasto na categoria "${categoriaFiltro}"`}
                                </p>
                            </div>
                        ) : (
                            (() => {
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
                                    
                                    return (
                                        <div key={dia} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                            isHoje ? 'bg-purple-50 border-2 border-purple-500' : 'bg-purple-50 border border-purple-200'
                                        }`}>
                                            {/* Data na lateral */}
                                            <div className={`flex-shrink-0 w-16 text-center ${isHoje ? 'text-purple-600' : 'text-gray-600'}`}>
                                                <div className="text-xs font-semibold">{diaSemana}</div>
                                                <div className={`text-2xl font-bold ${isHoje ? 'text-purple-700' : 'text-gray-700'}`}>{dia}</div>
                                                {isHoje && <div className="text-xs font-bold text-purple-600">HOJE</div>}
                                            </div>
                                            
                                            {/* Conteúdo do dia */}
                                            <div className="flex-1">
                                                <div className="space-y-2">
                                                    {gastosDoDia.map(gasto => (
                                                        <div key={gasto.id} className="flex items-center justify-between bg-white rounded p-2 shadow-sm">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-semibold text-sm text-gray-800">{gasto.descricao}</div>
                                                                    {gasto.temporario && gasto.totalParcelas && (
                                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                                                            {gasto.parcelaAtual || 1}/{gasto.totalParcelas}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{gasto.categoria}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={gasto.valor}
                                                                    onChange={(e) => editarValorGastoFixo(gasto.id, e.target.value)}
                                                                    className="w-28 px-2 py-1 border border-gray-300 rounded text-right text-sm font-bold"
                                                                />
                                                                <button 
                                                                    onClick={() => {
                                                                        setItemEditando(gasto);
                                                                        setTipoEditando('fixo');
                                                                        setModalAberto('editar');
                                                                    }}
                                                                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button 
                                                                    onClick={() => duplicarGastoFixo(gasto)}
                                                                    className="px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-sm"
                                                                >
                                                                    📋
                                                                </button>
                                                                <button 
                                                                    onClick={() => deletarGastoFixo(gasto.id)} 
                                                                    className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="text-xs text-right font-bold text-gray-600 pt-1 border-t">
                                                        Total do dia: R$ {totalDia.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()
                        )}
                        </div>
                    </div>
                );
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
                const gastosFiltrados = categoriaFiltro === 'TODAS' 
                    ? gastosDoMes 
                    : gastosDoMes.filter(g => g.categoria === categoriaFiltro);
                
                const totalCategoria = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);

                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">📊 Gastos Variáveis - {mesAtual.toUpperCase()} / {anoAtual}</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
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
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 border-2 border-green-700"
                                >
                                    🔧 Migrar Datas
                                </button>
                                <button 
                                    onClick={() => {
                                        console.log('🔍 DEBUG GASTOS VARIÁVEIS:');
                                        console.log('Total de gastos:', gastosVariaveis.length);
                                        gastosVariaveis.forEach((g, i) => {
                                            console.log(`Gasto ${i+1}:`, {
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
                                    }} 
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 border-2 border-blue-300"
                                >
                                    🔍 Debug
                                </button>
                                <button 
                                    onClick={() => setModalAberto('gerenciarCategorias')} 
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
                                >
                                    🏷️ Categorias
                                </button>
                                <button 
                                    onClick={() => setModalAberto('novoGastoVariavel')} 
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
                                >
                                    ➕ Novo Gasto
                                </button>
                            </div>
                        </div>

                        {/* Cards por Categoria */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Card Total Geral */}
                            <div 
                                className={`bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
                                    categoriaFiltro === 'TODAS' ? 'ring-4 ring-orange-300' : ''
                                }`}
                                onClick={() => setCategoriaFiltro('TODAS')}
                            >
                                <div className="text-white/80 text-xs font-semibold mb-1">💰 TOTAL DO MÊS</div>
                                <div className="text-2xl font-bold text-white">R$ {totalMes.toFixed(2)}</div>
                                <div className="text-white/70 text-xs mt-1">{gastosDoMes.length} gastos</div>
                            </div>

                            {/* Cards por Categoria */}
                            {Object.entries(totaisPorCategoria)
                                .sort((a, b) => b[1] - a[1]) // Ordena por valor (maior primeiro)
                                .map(([categoria, total]) => {
                                    const quantidade = gastosDoMes.filter(g => g.categoria === categoria).length;
                                    const percentual = totalMes > 0 ? (total / totalMes) * 100 : 0;
                                    
                                    return (
                                        <div 
                                            key={categoria}
                                            className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${
                                                categoriaFiltro === categoria 
                                                    ? 'border-orange-500 ring-2 ring-orange-300' 
                                                    : 'border-gray-200'
                                            }`}
                                            onClick={() => setCategoriaFiltro(categoria)}
                                        >
                                            <div className="text-gray-600 text-xs font-semibold mb-1 truncate">{categoria}</div>
                                            <div className="text-xl font-bold text-orange-600">R$ {total.toFixed(2)}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="text-gray-500 text-xs">{quantidade} gasto{quantidade > 1 ? 's' : ''}</div>
                                                <div className="text-orange-600 text-xs font-semibold">{percentual.toFixed(0)}%</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Barra de Filtro Atual */}
                        {gastosDoMes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            🔍 Mostrando: <span className="text-orange-600">{categoriaFiltro}</span>
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold text-orange-600">
                                        R$ {totalCategoria.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Extrato por Categoria → Data → Itens */}
                        <div className="space-y-4">
                            {gastosFiltrados.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                    <div className="text-4xl mb-3">
                                        {gastosDoMes.length === 0 ? '📊' : '🔍'}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {gastosDoMes.length === 0 
                                            ? 'Nenhum gasto variável' 
                                            : 'Nenhum gasto encontrado'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {gastosDoMes.length === 0 
                                            ? 'Adicione gastos variáveis para este mês!' 
                                            : `Nenhum gasto na categoria "${categoriaFiltro}"`}
                                    </p>
                                </div>
                            ) : (
                                (() => {
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
                                        
                                        return (
                                            <div key={categoria} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                                {/* Header da Categoria */}
                                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                                                    <div className="flex items-center justify-between text-white">
                                                        <h3 className="text-lg font-bold">📁 {categoria}</h3>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold">R$ {totalCategoria.toFixed(2)}</div>
                                                            <div className="text-xs opacity-90">{gastosCategoria.length} gasto{gastosCategoria.length > 1 ? 's' : ''}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Datas da Categoria */}
                                                <div className="p-4 space-y-3">
                                                    {datasOrdenadas.map(dataKey => {
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
                                                        
                                                        return (
                                                            <div key={dataKey} className={`rounded-lg border-2 overflow-hidden ${
                                                                isHoje ? 'border-orange-500 bg-orange-50' : 'border-orange-200 bg-orange-50'
                                                            }`}>
                                                                {/* Header da Data */}
                                                                <div className="flex items-center gap-3 p-2 bg-white border-b border-orange-200">
                                                                    <div className={`flex-shrink-0 w-14 text-center ${isHoje ? 'text-orange-600' : 'text-gray-600'}`}>
                                                                        {dataKey !== 'Sem data' ? (
                                                                            <>
                                                                                <div className="text-xs font-semibold">{diaSemana}</div>
                                                                                <div className={`text-xl font-bold ${isHoje ? 'text-orange-700' : 'text-gray-700'}`}>{diaNumero}</div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="text-xs font-semibold text-gray-500">SEM DATA</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="text-sm font-semibold text-gray-700">{dataFormatada}</div>
                                                                        {isHoje && <div className="text-xs font-bold text-orange-600">HOJE</div>}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-sm font-bold text-orange-600">R$ {totalData.toFixed(2)}</div>
                                                                        <div className="text-xs text-gray-500">{gastosDaData.length} item{gastosDaData.length > 1 ? 's' : ''}</div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Itens da Data */}
                                                                <div className="divide-y divide-orange-100">
                                                                    {gastosDaData.map(gasto => (
                                                                        <div key={gasto.id} className="flex items-center justify-between p-2 bg-white hover:bg-orange-50 transition-colors">
                                                                            <div className="flex-1 pl-4">
                                                                                <div className="text-sm text-gray-800">{gasto.descricao || 'Sem descrição'}</div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="font-bold text-orange-600">R$ {gasto.valor.toFixed(2)}</div>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        setItemEditando(gasto);
                                                                                        setTipoEditando('variavel');
                                                                                        setModalAberto('editar');
                                                                                    }}
                                                                                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
                                                                                >
                                                                                    ✏️
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => duplicarGastoVariavel(gasto)}
                                                                                    className="px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-xs"
                                                                                >
                                                                                    📋
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => deletarGastoVariavel(gasto.id)} 
                                                                                    className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                                                                                >
                                                                                    🗑️
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()
                            )}
                        </div>
                    </div>
                );
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
                const gastosFiltrados = categoriaFiltro === 'TODAS' 
                    ? gastosDoMes 
                    : gastosDoMes.filter(g => g.categoria === categoriaFiltro);
                
                const totalCategoria = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);

                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">⚡ Gastos Extras - {mesAtual.toUpperCase()} / {anoAtual}</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setModalAberto('gerenciarCategorias')} 
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
                                >
                                    🏷️ Categorias
                                </button>
                                <button 
                                    onClick={() => setModalAberto('novoGastoExtra')} 
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
                                >
                                    ➕ Novo Gasto Extra
                                </button>
                            </div>
                        </div>

                        {/* Cards por Categoria */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Card Total Geral */}
                            <div 
                                className={`bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
                                    categoriaFiltro === 'TODAS' ? 'ring-4 ring-amber-300' : ''
                                }`}
                                onClick={() => setCategoriaFiltro('TODAS')}
                            >
                                <div className="text-white/80 text-xs font-semibold mb-1">⚡ TOTAL DO MÊS</div>
                                <div className="text-2xl font-bold text-white">R$ {totalMes.toFixed(2)}</div>
                                <div className="text-white/70 text-xs mt-1">{gastosDoMes.length} gastos extras</div>
                            </div>

                            {/* Cards por Categoria */}
                            {Object.entries(totaisPorCategoria)
                                .sort((a, b) => b[1] - a[1])
                                .map(([categoria, total]) => {
                                    const quantidade = gastosDoMes.filter(g => g.categoria === categoria).length;
                                    const percentual = totalMes > 0 ? (total / totalMes) * 100 : 0;
                                    
                                    return (
                                        <div 
                                            key={categoria}
                                            className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${
                                                categoriaFiltro === categoria 
                                                    ? 'border-amber-500 ring-2 ring-amber-300' 
                                                    : 'border-gray-200'
                                            }`}
                                            onClick={() => setCategoriaFiltro(categoria)}
                                        >
                                            <div className="text-gray-600 text-xs font-semibold mb-1 truncate">{categoria}</div>
                                            <div className="text-xl font-bold text-amber-600">R$ {total.toFixed(2)}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="text-gray-500 text-xs">{quantidade} gasto{quantidade > 1 ? 's' : ''}</div>
                                                <div className="text-amber-600 text-xs font-semibold">{percentual.toFixed(0)}%</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Barra de Filtro Atual */}
                        {gastosDoMes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            🔍 Mostrando: <span className="text-amber-600">{categoriaFiltro}</span>
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold text-amber-600">
                                        R$ {totalCategoria.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lista de Gastos */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="space-y-2">
                                {gastosFiltrados.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-4xl mb-3">
                                            {gastosDoMes.length === 0 ? '⚡' : '🔍'}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {gastosDoMes.length === 0 
                                                ? 'Nenhum gasto extra' 
                                                : 'Nenhum gasto encontrado'}
                                        </h3>
                                        <p className="text-gray-600">
                                            {gastosDoMes.length === 0 
                                                ? 'Adicione gastos extras para este mês!' 
                                                : `Nenhum gasto na categoria "${categoriaFiltro}"`}
                                        </p>
                                    </div>
                                ) : (
                                    gastosFiltrados.map(gasto => (
                                        <div key={gasto.id} className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-800">{gasto.categoria}</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        gasto.ano === 2026 ? 'bg-blue-100 text-blue-700' : 
                                                        gasto.ano === 2025 ? 'bg-yellow-100 text-yellow-700' : 
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {gasto.ano || anoAtual}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">{gasto.descricao} • {gasto.data}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xl font-bold text-amber-600">R$ {gasto.valor.toFixed(2)}</div>
                                                <button 
                                                    onClick={() => {
                                                        setItemEditando(gasto);
                                                        setTipoEditando('extra');
                                                        setModalAberto('editar');
                                                    }}
                                                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold"
                                                    title="Editar gasto extra"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={() => duplicarGastoExtra(gasto)}
                                                    className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-semibold"
                                                    title="Duplicar gasto extra"
                                                >
                                                    📋
                                                </button>
                                                <button 
                                                    onClick={() => deletarGastoExtra(gasto.id)} 
                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                                                    title="Excluir gasto extra"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            };

            const TelaReceitas = () => {
                const receitasDoMes = receitas.filter(r => r.mes === mesAtual && r.ano === anoAtual);
                const totalMes = receitasDoMes.reduce((sum, r) => sum + r.valor, 0);

                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">💰 Receitas e Ganhos</h2>
                            <button onClick={() => setModalAberto('novaReceita')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                ➕ Nova Receita
                            </button>
                        </div>

                        {/* Resumo do Saldo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="text-sm opacity-90">RECEITAS</div>
                                <div className="text-xl font-bold mt-2">R$ {saldo.receitas.toFixed(2)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="text-sm opacity-90">DESPESAS</div>
                                <div className="text-xl font-bold mt-2">R$ {saldo.despesas.toFixed(2)}</div>
                            </div>
                            <div className={`rounded-xl shadow-lg p-6 text-white ${
                                saldo.positivo ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                            }`}>
                                <div className="text-sm opacity-90">SALDO</div>
                                <div className="text-xl font-bold mt-2">
                                    {saldo.positivo ? '+' : '-'} R$ {Math.abs(saldo.saldo).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Lista de Receitas */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold text-gray-800">Receitas de {mesAtual.toUpperCase()}</h3>
                                <div className="text-2xl font-bold text-green-600">
                                    R$ {totalMes.toFixed(2)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {receitasDoMes.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        Nenhuma receita registrada neste mês.
                                        <br />
                                        <button 
                                            onClick={() => setModalAberto('novaReceita')}
                                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                                        >
                                            ➕ Adicionar Primeira Receita
                                        </button>
                                    </div>
                                ) : (
                                    receitasDoMes.map(receita => (
                                        <div key={receita.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-gray-800">{receita.categoria}</span>
                                                    {receita.descricao && (
                                                        <span className="text-sm text-gray-500">• {receita.descricao}</span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        receita.ano === 2026 ? 'bg-blue-100 text-blue-700' : 
                                                        receita.ano === 2025 ? 'bg-yellow-100 text-yellow-700' : 
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {receita.ano}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">{receita.data}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-2xl font-bold text-green-600">
                                                    R$ {receita.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setItemEditando(receita);
                                                        setTipoEditando('receita');
                                                        setModalAberto('editar');
                                                    }}
                                                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold"
                                                    title="Editar receita"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={() => duplicarReceita(receita)}
                                                    className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-semibold"
                                                    title="Duplicar receita"
                                                >
                                                    📋
                                                </button>
                                                <button 
                                                    onClick={() => deletarReceita(receita.id)}
                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                                                    title="Excluir receita"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Gráfico Receitas vs Despesas */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Receitas vs Despesas</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-green-600">Receitas</span>
                                        <span className="text-sm font-semibold">R$ {saldo.receitas.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-6">
                                        <div 
                                            className="bg-green-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                                            style={{ width: saldo.receitas > 0 ? '100%' : '0%' }}
                                        >
                                            <span className="text-xs text-white font-bold">100%</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-red-600">Despesas</span>
                                        <span className="text-sm font-semibold">R$ {saldo.despesas.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-6">
                                        <div 
                                            className="bg-red-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                                            style={{ width: saldo.receitas > 0 ? `${(saldo.despesas / saldo.receitas) * 100}%` : '0%' }}
                                        >
                                            <span className="text-xs text-white font-bold">
                                                {saldo.receitas > 0 ? ((saldo.despesas / saldo.receitas) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            };

            const TelaPlanejamento = () => {
                // Controlar aba via telaAtiva do menu
                const abaAtiva = telaAtiva === 'planejamento-orcamento' ? 'orcamento' :
                                 telaAtiva === 'planejamento-premes' ? 'premes' :
                                 telaAtiva === 'planejamento-metas' ? 'metas' :
                                 telaAtiva === 'planejamento-dividas' ? 'dividas' :
                                 telaAtiva === 'planejamento-compra' ? 'compra' :
                                 telaAtiva === 'planejamento-simulador' ? 'simulador' :
                                 telaAtiva === 'planejamento-timeline' ? 'timeline' :
                                 'diagnostico';
                
                // Estados do Simulador
                const [simulacao, setSimulacao] = useState({
                    rendaAjuste: 0, // % de ajuste
                    gastosAjuste: 0, // % de ajuste
                    quitarDivida: null, // ID da dívida
                    novaReceita: 0, // valor adicional
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
                        criterios.push({ nome: '✅ Saldo Positivo', pontos: 30 });
                    } else {
                        criterios.push({ nome: '❌ Saldo Negativo', pontos: 0 });
                    }
                    
                    // 2. Dentro do orçamento (25 pontos)
                    if (dentroOrcamento) {
                        score += 25;
                        criterios.push({ nome: '✅ Dentro do Orçamento', pontos: 25 });
                    } else {
                        criterios.push({ nome: '⚠️ Acima do Orçamento', pontos: 0 });
                    }
                    
                    // 3. Reserva de emergência (30 pontos)
                    const reservaIdeal = gastadoTotal * 6; // 6 meses de despesas
                    const reservaAtual = reservaEmergencia; // Valor real informado pelo usuário
                    const percentualReserva = reservaIdeal > 0 ? (reservaAtual / reservaIdeal) * 100 : 0;
                    
                    if (percentualReserva >= 100) {
                        score += 30;
                        criterios.push({ nome: '✅ Reserva Completa (6+ meses)', pontos: 30 });
                    } else if (percentualReserva >= 50) {
                        score += 20;
                        criterios.push({ nome: '⚠️ Reserva Parcial (3-6 meses)', pontos: 20 });
                    } else if (percentualReserva >= 16) {
                        score += 10;
                        criterios.push({ nome: '⚠️ Reserva Baixa (1-3 meses)', pontos: 10 });
                    } else {
                        criterios.push({ nome: '❌ Sem Reserva Adequada', pontos: 0 });
                    }
                    
                    // 4. Capacidade de poupança (15 pontos)
                    const percentualPoupanca = saldo.positivo ? (saldo.saldo / saldo.receitas) * 100 : 0;
                    
                    if (percentualPoupanca >= 20) {
                        score += 15;
                        criterios.push({ nome: '✅ Economiza 20%+', pontos: 15 });
                    } else if (percentualPoupanca >= 10) {
                        score += 10;
                        criterios.push({ nome: '⚠️ Economiza 10-20%', pontos: 10 });
                    } else if (percentualPoupanca > 0) {
                        score += 5;
                        criterios.push({ nome: '⚠️ Economiza menos de 10%', pontos: 5 });
                    } else {
                        criterios.push({ nome: '❌ Não está economizando', pontos: 0 });
                    }
                    
                    return { score, criterios, reservaIdeal, reservaAtual, percentualReserva, percentualPoupanca };
                };
                
                const scoreSaude = calcularScore();
                
                // Determinar cor e label do score
                const getScoreColor = (score) => {
                    if (score >= 80) return { bg: 'from-green-500 to-green-600', text: 'Excelente', emoji: '🎉' };
                    if (score >= 60) return { bg: 'from-blue-500 to-blue-600', text: 'Bom', emoji: '👍' };
                    if (score >= 40) return { bg: 'from-yellow-500 to-yellow-600', text: 'Regular', emoji: '⚠️' };
                    return { bg: 'from-red-500 to-red-600', text: 'Crítico', emoji: '🚨' };
                };
                
                const scoreInfo = getScoreColor(scoreSaude.score);
                
                // 🎯 FUNÇÕES DE METAS FINANCEIRAS
                const adicionarMeta = (meta) => {
                    console.log('📝 Adicionando meta:', meta);
                    const novaMeta = {
                        id: Date.now(),
                        titulo: meta.titulo,
                        valor: parseFloat(meta.valor),
                        valorAtual: 0,
                        prazo: meta.prazo, // 'curto', 'medio', 'longo'
                        prioridade: parseInt(meta.prioridade), // 1-5
                        dataInicio: new Date().toISOString(),
                        dataMeta: meta.dataMeta,
                        categoria: meta.categoria, // 'reserva', 'viagem', 'investimento', 'compra', 'outros'
                        concluida: false
                    };
                    console.log('✅ Meta criada:', novaMeta);
                    setMetasFinanceiras([...metasFinanceiras, novaMeta]);
                    console.log('💾 Salvando meta no estado');
                    setModalAberto(null);
                    alert('✅ Meta criada com sucesso!');
                };
                
                const atualizarProgressoMeta = (id, novoValor) => {
                    setMetasFinanceiras(metasFinanceiras.map(m => 
                        m.id === id ? {...m, valorAtual: parseFloat(novoValor)} : m
                    ));
                };
                
                const concluirMeta = (id) => {
                    setMetasFinanceiras(metasFinanceiras.map(m => 
                        m.id === id ? {...m, concluida: true, valorAtual: m.valor} : m
                    ));
                };
                
                const deletarMeta = (id) => {
                    if (confirm('Tem certeza que deseja excluir esta meta?')) {
                        setMetasFinanceiras(metasFinanceiras.filter(m => m.id !== id));
                    }
                };
                
                // 💳 FUNÇÕES DE DÍVIDAS
                const adicionarDivida = (divida) => {
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
                    setDividas(dividas.map(d => 
                        d.id === id ? {...d, [campo]: parseFloat(valor)} : d
                    ));
                };
                
                const deletarDivida = (id) => {
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
                    const simularEstrategia = (ordem) => {
                        let dividasSimuladas = ordem.map(d => ({...d}));
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
                        
                        return { meses, jurosTotal };
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
                const percentualMetasGeral = totalMetasValor > 0 ? (totalMetasAtual / totalMetasValor) * 100 : 0;

                return (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-800">📋 Planejamento</h2>
                        </div>

                        {/* Conteúdo Aba Diagnóstico */}
                        {abaAtiva === 'diagnostico' && (
                            <div className="space-y-3">
                                {/* Score de Saúde Financeira */}
                                <div className={`bg-gradient-to-r ${scoreInfo.bg} rounded-xl shadow-lg p-4 text-white`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-xs opacity-90 mb-1">Score de Saúde Financeira</div>
                                            <div className="text-xl font-bold">{scoreSaude.score}</div>
                                            <div className="text-lg mt-1">{scoreInfo.emoji} {scoreInfo.text}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl opacity-20">{scoreInfo.emoji}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 bg-white bg-opacity-20 rounded-lg p-3">
                                        <div className="text-xs mb-2">Critérios Avaliados:</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {scoreSaude.criterios.map((c, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span>{c.nome}</span>
                                                    <span className="font-bold">{c.pontos} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cards de Diagnóstico */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Situação Atual */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600 mb-2">💰 Situação Atual</div>
                                        <div className={`text-xl font-bold mb-2 ${saldo.positivo ? 'text-green-600' : 'text-red-600'}`}>
                                            {saldo.positivo ? 'Superávit' : 'Déficit'}
                                        </div>
                                        <div className="text-base font-bold text-gray-800">
                                            R$ {Math.abs(saldo.saldo).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            {saldo.positivo ? '✅ Sobrando no mês' : '⚠️ Faltando no mês'}
                                        </div>
                                    </div>

                                    {/* Percentual Comprometido */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600 mb-2">📊 Renda Comprometida</div>
                                        <div className={`text-xl font-bold mb-2 ${
                                            (totais.total / saldo.receitas * 100) <= 70 ? 'text-green-600' : 
                                            (totais.total / saldo.receitas * 100) <= 90 ? 'text-yellow-600' : 
                                            'text-red-600'
                                        }`}>
                                            {saldo.receitas > 0 ? ((totais.total / saldo.receitas) * 100).toFixed(0) : 0}%
                                        </div>
                                        <div className="text-sm text-gray-800">
                                            R$ {totais.total.toFixed(2)} de R$ {saldo.receitas.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            {(totais.total / saldo.receitas * 100) <= 70 ? '✅ Saudável' : 
                                             (totais.total / saldo.receitas * 100) <= 90 ? '⚠️ Atenção' : 
                                             '🚨 Crítico'}
                                        </div>
                                    </div>

                                    {/* Capacidade de Poupança */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600 mb-2">💵 Capacidade de Poupança</div>
                                        <div className={`text-xl font-bold mb-2 ${
                                            scoreSaude.percentualPoupanca >= 20 ? 'text-green-600' : 
                                            scoreSaude.percentualPoupanca >= 10 ? 'text-yellow-600' : 
                                            'text-red-600'
                                        }`}>
                                            {scoreSaude.percentualPoupanca.toFixed(0)}%
                                        </div>
                                        <div className="text-sm text-gray-800">
                                            R$ {saldo.positivo ? saldo.saldo.toFixed(2) : '0.00'} por mês
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            {scoreSaude.percentualPoupanca >= 20 ? '✅ Excelente' : 
                                             scoreSaude.percentualPoupanca >= 10 ? '⚠️ Regular' : 
                                             '🚨 Insuficiente'}
                                        </div>
                                    </div>
                                </div>

                                {/* Reserva de Emergência */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-base font-bold text-gray-800">🆘 Reserva de Emergência</h3>
                                        <button
                                            onClick={() => {
                                                const valor = prompt('Quanto você tem de reserva de emergência?', reservaEmergencia);
                                                if (valor !== null) {
                                                    setReservaEmergencia(parseFloat(valor) || 0);
                                                }
                                            }}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                                        >
                                            ✏️ Informar Valor
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <div className="text-sm text-gray-600">Meta Ideal (6 meses)</div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                R$ {scoreSaude.reservaIdeal.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Reserva Atual</div>
                                            <div className="text-2xl font-bold text-purple-600">
                                                R$ {scoreSaude.reservaAtual.toFixed(2)}
                                            </div>
                                            {scoreSaude.reservaAtual === 0 && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    ⚠️ Clique em "Informar Valor" acima
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Falta Acumular</div>
                                            <div className="text-2xl font-bold text-orange-600">
                                                R$ {Math.max(0, scoreSaude.reservaIdeal - scoreSaude.reservaAtual).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barra de Progresso */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-gray-700">Progresso da Reserva</span>
                                            <span className="font-semibold text-gray-700">
                                                {Math.min(scoreSaude.percentualReserva, 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-6">
                                            <div 
                                                className={`h-6 rounded-full transition-all ${
                                                    scoreSaude.percentualReserva >= 100 ? 'bg-green-500' :
                                                    scoreSaude.percentualReserva >= 50 ? 'bg-blue-500' :
                                                    scoreSaude.percentualReserva >= 16 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(scoreSaude.percentualReserva, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Plano de Ação */}
                                    {scoreSaude.percentualReserva < 100 && saldo.positivo && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="font-semibold text-blue-800 mb-2">💡 Plano de Ação:</div>
                                            <div className="text-sm text-blue-700">
                                                Economizando R$ {saldo.saldo.toFixed(2)} por mês, você completará sua reserva em{' '}
                                                <span className="font-bold">
                                                    {Math.ceil((scoreSaude.reservaIdeal - scoreSaude.reservaAtual) / saldo.saldo)} meses
                                                </span>
                                                {' '}({new Date(Date.now() + (Math.ceil((scoreSaude.reservaIdeal - scoreSaude.reservaAtual) / saldo.saldo) * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
                                            </div>
                                        </div>
                                    )}

                                    {scoreSaude.percentualReserva >= 100 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                            <div className="text-2xl mb-2">🎉</div>
                                            <div className="font-bold text-green-800">Parabéns! Sua reserva de emergência está completa!</div>
                                            <div className="text-sm text-green-700 mt-1">Você tem segurança financeira para 6+ meses</div>
                                        </div>
                                    )}

                                    {!saldo.positivo && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="font-semibold text-red-800 mb-2">⚠️ Atenção:</div>
                                            <div className="text-sm text-red-700">
                                                Você está com déficit mensal. Priorize equilibrar suas contas antes de focar na reserva de emergência.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Alertas Inteligentes */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">🔔 Alertas Inteligentes</h3>
                                    <div className="space-y-3">
                                        {/* Alerta de Orçamento */}
                                        {!dentroOrcamento && (
                                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                                <div className="text-2xl">🚨</div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-red-800">Orçamento Estourado</div>
                                                    <div className="text-sm text-red-700">
                                                        Você gastou R$ {Math.abs(diferenca).toFixed(2)} a mais que o orçamento planejado este mês.
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Alerta 80% do Orçamento */}
                                        {dentroOrcamento && ((gastadoTotal / orcadoTotal) * 100) >= 80 && (
                                            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="text-2xl">⚠️</div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-yellow-800">Atenção ao Orçamento</div>
                                                    <div className="text-sm text-yellow-700">
                                                        Você já usou {((gastadoTotal / orcadoTotal) * 100).toFixed(0)}% do seu orçamento. Fique atento aos gastos!
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Alerta de Reserva */}
                                        {scoreSaude.percentualReserva < 16 && (
                                            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                                <div className="text-2xl">🆘</div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-orange-800">Reserva Insuficiente</div>
                                                    <div className="text-sm text-orange-700">
                                                        Sua reserva cobre menos de 1 mês de despesas. Priorize construir uma reserva de emergência!
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Alerta Positivo */}
                                        {dentroOrcamento && saldo.positivo && scoreSaude.percentualPoupanca >= 20 && (
                                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="text-2xl">✅</div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-green-800">Parabéns!</div>
                                                    <div className="text-sm text-green-700">
                                                        Você está dentro do orçamento e economizando {scoreSaude.percentualPoupanca.toFixed(0)}% da sua renda. Continue assim!
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Nenhum alerta crítico */}
                                        {dentroOrcamento && scoreSaude.percentualReserva >= 16 && ((gastadoTotal / orcadoTotal) * 100) < 80 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <div className="text-2xl mb-2">😊</div>
                                                <div className="font-semibold">Tudo sob controle!</div>
                                                <div className="text-sm">Não há alertas críticos no momento.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conteúdo Aba Orçamento */}
                        {abaAtiva === 'orcamento' && (
                            <div className="space-y-3">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => setModalAberto('orcamento')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                    >
                                        ⚙️ Definir Orçamento
                                    </button>
                                </div>

                                {/* Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="text-sm text-gray-600">Orçado</div>
                                <div className="text-xl font-bold text-blue-600">R$ {orcadoTotal.toFixed(2)}</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="text-sm text-gray-600">Gasto</div>
                                <div className="text-xl font-bold text-purple-600">R$ {gastadoTotal.toFixed(2)}</div>
                            </div>
                            <div className={`rounded-xl shadow-lg p-6 ${dentroOrcamento ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
                                <div className="text-sm opacity-90">{dentroOrcamento ? 'Sobrou' : 'Excedeu'}</div>
                                <div className="text-xl font-bold">R$ {Math.abs(diferenca).toFixed(2)}</div>
                                <div className="text-sm mt-2">{dentroOrcamento ? '✅ Dentro do orçamento' : '⚠️ Acima do orçamento'}</div>
                            </div>
                        </div>

                        {/* Por Categoria */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Por Categoria</h3>
                            <div className="space-y-3">
                                {/* Cartões */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <div className="font-bold text-gray-800">💳 Cartões</div>
                                            <div className="text-sm text-gray-600">R$ {totais.cartoes.toFixed(2)} / R$ {orcamento.cartoes.toFixed(2)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${totais.cartoes <= orcamento.cartoes ? 'text-green-600' : 'text-red-600'}`}>
                                                {((totais.cartoes / orcamento.cartoes) * 100).toFixed(0)}%
                                            </div>
                                            <div className={`text-sm ${(orcamento.cartoes - totais.cartoes) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {(orcamento.cartoes - totais.cartoes) >= 0 ? '✅' : '⚠️'} R$ {Math.abs(orcamento.cartoes - totais.cartoes).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full ${totais.cartoes <= orcamento.cartoes ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min((totais.cartoes / orcamento.cartoes) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Fixos */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <div className="font-bold text-gray-800">🏠 Gastos Fixos</div>
                                            <div className="text-sm text-gray-600">R$ {totais.fixos.toFixed(2)} / R$ {orcamento.fixos.toFixed(2)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${totais.fixos <= orcamento.fixos ? 'text-green-600' : 'text-red-600'}`}>
                                                {((totais.fixos / orcamento.fixos) * 100).toFixed(0)}%
                                            </div>
                                            <div className={`text-sm ${(orcamento.fixos - totais.fixos) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {(orcamento.fixos - totais.fixos) >= 0 ? '✅' : '⚠️'} R$ {Math.abs(orcamento.fixos - totais.fixos).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full ${totais.fixos <= orcamento.fixos ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min((totais.fixos / orcamento.fixos) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Variáveis */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <div className="font-bold text-gray-800">📊 Gastos Variáveis</div>
                                            <div className="text-sm text-gray-600">R$ {totais.variaveis.toFixed(2)} / R$ {orcamento.variaveis.toFixed(2)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${totais.variaveis <= orcamento.variaveis ? 'text-green-600' : 'text-red-600'}`}>
                                                {orcamento.variaveis > 0 ? ((totais.variaveis / orcamento.variaveis) * 100).toFixed(0) : 0}%
                                            </div>
                                            <div className={`text-sm ${(orcamento.variaveis - totais.variaveis) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {(orcamento.variaveis - totais.variaveis) >= 0 ? '✅' : '⚠️'} R$ {Math.abs(orcamento.variaveis - totais.variaveis).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full ${totais.variaveis <= orcamento.variaveis ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: orcamento.variaveis > 0 ? `${Math.min((totais.variaveis / orcamento.variaveis) * 100, 100)}%` : '0%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            </div>
                        )}

                        {/* Conteúdo Aba Pré-Mês */}
                        {abaAtiva === 'premes' && (
                            <div className="space-y-3">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => setModalAberto('novoPlanejado')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                                    >
                                        ➕ Adicionar Planejado
                                    </button>
                                </div>

                                {/* Cards de Resumo */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Total Planejado</div>
                                        <div className="text-xl font-bold text-blue-600">R$ {totalPlanejado.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500 mt-2">{planejadosDoMes.length} itens</div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Executado</div>
                                        <div className="text-xl font-bold text-green-600">R$ {totalExecutado.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            {totalPlanejado > 0 ? ((totalExecutado / totalPlanejado) * 100).toFixed(0) : 0}%
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Pendente</div>
                                        <div className="text-xl font-bold text-orange-600">R$ {totalPendente.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            {planejadosDoMes.filter(p => !p.executado).length} itens
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de Progresso */}
                                {totalPlanejado > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-700">Progresso de Execução</span>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {((totalExecutado / totalPlanejado) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div 
                                                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all"
                                                style={{ width: `${(totalExecutado / totalPlanejado) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Lista de Planejados */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Gastos Planejados - {mesAtual.toUpperCase()}</h3>
                                    
                                    {planejadosDoMes.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            Nenhum gasto planejado para este mês.
                                            <br />
                                            <button 
                                                onClick={() => setModalAberto('novoPlanejado')}
                                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                                            >
                                                ➕ Adicionar Primeiro Planejado
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {planejadosDoMes.map(planejado => (
                                                <div 
                                                    key={planejado.id}
                                                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                                                        planejado.executado 
                                                            ? 'bg-green-50 border-green-300' 
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <button
                                                            onClick={() => togglePlanejado(planejado.id)}
                                                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                                                planejado.executado 
                                                                    ? 'bg-green-500 border-green-500' 
                                                                    : 'border-gray-300 hover:border-green-500'
                                                            }`}
                                                        >
                                                            {planejado.executado && (
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                </svg>
                                                            )}
                                                        </button>
                                                        
                                                        <div className="flex-1">
                                                            <div className={`font-semibold ${planejado.executado ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                                                                {planejado.descricao}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {planejado.categoria}
                                                            </div>
                                                        </div>

                                                        <div className={`text-2xl font-bold ${planejado.executado ? 'text-green-600' : 'text-gray-800'}`}>
                                                            R$ {planejado.valor.toFixed(2)}
                                                        </div>

                                                        <button
                                                            onClick={() => deletarPlanejado(planejado.id)}
                                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Comparação Planejado vs Real */}
                                {planejadosDoMes.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Planejado vs Real</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-sm text-gray-600 mb-2">Planejado</div>
                                                <div className="text-xl font-bold text-blue-600">R$ {totalPlanejado.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-2">Real (Gasto no Mês)</div>
                                                <div className="text-xl font-bold text-purple-600">R$ {totais.total.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div className={`mt-4 p-4 rounded-lg ${
                                            totais.total <= totalPlanejado ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                        }`}>
                                            <div className={`text-center font-bold ${
                                                totais.total <= totalPlanejado ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                                {totais.total <= totalPlanejado ? '✅ Dentro do Planejado!' : '⚠️ Acima do Planejado'}
                                            </div>
                                            <div className="text-center text-sm mt-2">
                                                Diferença: R$ {Math.abs(totalPlanejado - totais.total).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Conteúdo Aba Metas Financeiras */}
                        {abaAtiva === 'metas' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">🎯 Suas Metas Financeiras</h3>
                                        <p className="text-gray-600">Defina e acompanhe seus objetivos</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setModalAberto('novaMeta');
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                    >
                                        ➕ Nova Meta
                                    </button>
                                </div>

                                {/* Resumo Geral */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Total em Metas</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            R$ {totalMetasValor.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {metasFinanceiras.filter(m => !m.concluida).length} ativas
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Já Acumulado</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            R$ {totalMetasAtual.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {percentualMetasGeral.toFixed(0)}% do total
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Falta Acumular</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            R$ {(totalMetasValor - totalMetasAtual).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {(100 - percentualMetasGeral).toFixed(0)}% restante
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Concluídas</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {metasConcluidas.length}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            🎉 Objetivos alcançados
                                        </div>
                                    </div>
                                </div>

                                {metasFinanceiras.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                        <div className="text-xl mb-4">🎯</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma meta cadastrada</h3>
                                        <p className="text-gray-600 mb-3">Comece definindo seus objetivos financeiros!</p>
                                        <button 
                                            onClick={() => {
                                                setModalAberto('novaMeta');
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                        >
                                            ➕ Criar Primeira Meta
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Curto Prazo */}
                                        {metasCurtoPrazo.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">⚡ Curto Prazo (até 1 ano)</h4>
                                                <div className="space-y-3">
                                                    {metasCurtoPrazo.map(meta => {
                                                        const progresso = (meta.valorAtual / meta.valor) * 100;
                                                        return (
                                                            <div key={meta.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h5 className="font-bold text-gray-800">{meta.titulo}</h5>
                                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold">
                                                                                {meta.categoria}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Meta: R$ {meta.valor.toFixed(2)} • Atual: R$ {meta.valorAtual.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={() => {
                                                                                const valor = prompt('Digite o valor acumulado:', meta.valorAtual);
                                                                                if (valor !== null) atualizarProgressoMeta(meta.id, valor);
                                                                            }}
                                                                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                                                                            title="Atualizar progresso"
                                                                        >
                                                                            💰
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => concluirMeta(meta.id)}
                                                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                                                                            title="Marcar como concluída"
                                                                        >
                                                                            ✓
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => deletarMeta(meta.id)}
                                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                                                            title="Excluir"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Progresso</span>
                                                                        <span className="font-bold text-blue-600">{progresso.toFixed(0)}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                                        <div 
                                                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                                                                            style={{ width: `${Math.min(progresso, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                {meta.valorAtual < meta.valor && (
                                                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                        <div className="text-sm font-semibold text-blue-800 mb-2">💰 Plano de Investimento:</div>
                                                                        {(() => {
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
                                                                                mensagemData = ` (até ${dataFim.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})})`;
                                                                            } else {
                                                                                mesesParaCalculo = 12; // padrão curto prazo
                                                                                mensagemData = ' (sem data definida)';
                                                                            }
                                                                            
                                                                            const porMes = falta / mesesParaCalculo;
                                                                            const porSemana = porMes / 4;
                                                                            const porDia = porMes / 30;
                                                                            
                                                                            return (
                                                                                <div className="space-y-1 text-xs text-blue-700">
                                                                                    <div>📅 <span className="font-bold">Por mês:</span> R$ {porMes.toFixed(2)}</div>
                                                                                    <div>📆 <span className="font-bold">Por semana:</span> R$ {porSemana.toFixed(2)}</div>
                                                                                    <div>📌 <span className="font-bold">Por dia:</span> R$ {porDia.toFixed(2)}</div>
                                                                                    <div className="mt-2 text-blue-600">
                                                                                        ⏱️ Para alcançar em {mesesParaCalculo} {mesesParaCalculo === 1 ? 'mês' : 'meses'}{mensagemData}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Médio Prazo */}
                                        {metasMedioPrazo.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">📅 Médio Prazo (1-5 anos)</h4>
                                                <div className="space-y-3">
                                                    {metasMedioPrazo.map(meta => {
                                                        const progresso = (meta.valorAtual / meta.valor) * 100;
                                                        return (
                                                            <div key={meta.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h5 className="font-bold text-gray-800">{meta.titulo}</h5>
                                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold">
                                                                                {meta.categoria}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Meta: R$ {meta.valor.toFixed(2)} • Atual: R$ {meta.valorAtual.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={() => {
                                                                                const valor = prompt('Digite o valor acumulado:', meta.valorAtual);
                                                                                if (valor !== null) atualizarProgressoMeta(meta.id, valor);
                                                                            }}
                                                                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                                                                        >
                                                                            💰
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => concluirMeta(meta.id)}
                                                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                                                                        >
                                                                            ✓
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => deletarMeta(meta.id)}
                                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Progresso</span>
                                                                        <span className="font-bold text-green-600">{progresso.toFixed(0)}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                                        <div 
                                                                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                                                                            style={{ width: `${Math.min(progresso, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                {meta.valorAtual < meta.valor && (
                                                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                        <div className="text-sm font-semibold text-green-800 mb-2">💰 Plano de Investimento:</div>
                                                                        {(() => {
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
                                                                            
                                                                            return (
                                                                                <div className="space-y-1 text-xs text-green-700">
                                                                                    <div>📅 <span className="font-bold">Por mês:</span> R$ {porMes.toFixed(2)}</div>
                                                                                    <div>📆 <span className="font-bold">Por semana:</span> R$ {porSemana.toFixed(2)}</div>
                                                                                    <div>📌 <span className="font-bold">Por dia:</span> R$ {porDia.toFixed(2)}</div>
                                                                                    <div className="mt-2 text-green-600">
                                                                                        ⏱️ Para alcançar em {mesesParaCalculo} {mesesParaCalculo === 1 ? 'mês' : 'meses'}
                                                                                        {meta.dataMeta && ` (até ${new Date(meta.dataMeta).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})})`}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Longo Prazo */}
                                        {metasLongoPrazo.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">🏆 Longo Prazo (5+ anos)</h4>
                                                <div className="space-y-3">
                                                    {metasLongoPrazo.map(meta => {
                                                        const progresso = (meta.valorAtual / meta.valor) * 100;
                                                        return (
                                                            <div key={meta.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h5 className="font-bold text-gray-800">{meta.titulo}</h5>
                                                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-semibold">
                                                                                {meta.categoria}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Meta: R$ {meta.valor.toFixed(2)} • Atual: R$ {meta.valorAtual.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={() => {
                                                                                const valor = prompt('Digite o valor acumulado:', meta.valorAtual);
                                                                                if (valor !== null) atualizarProgressoMeta(meta.id, valor);
                                                                            }}
                                                                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                                                                        >
                                                                            💰
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => concluirMeta(meta.id)}
                                                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                                                                        >
                                                                            ✓
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => deletarMeta(meta.id)}
                                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Progresso</span>
                                                                        <span className="font-bold text-purple-600">{progresso.toFixed(0)}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                                        <div 
                                                                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                                                                            style={{ width: `${Math.min(progresso, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                {meta.valorAtual < meta.valor && (
                                                                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                                        <div className="text-sm font-semibold text-purple-800 mb-2">💰 Plano de Investimento:</div>
                                                                        {(() => {
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
                                                                            
                                                                            return (
                                                                                <div className="space-y-1 text-xs text-purple-700">
                                                                                    <div>📅 <span className="font-bold">Por mês:</span> R$ {porMes.toFixed(2)}</div>
                                                                                    <div>📆 <span className="font-bold">Por semana:</span> R$ {porSemana.toFixed(2)}</div>
                                                                                    <div>📌 <span className="font-bold">Por dia:</span> R$ {porDia.toFixed(2)}</div>
                                                                                    <div className="mt-2 text-purple-600">
                                                                                        ⏱️ Para alcançar em {mesesParaCalculo} {mesesParaCalculo === 1 ? 'mês' : 'meses'}
                                                                                        {meta.dataMeta && ` (até ${new Date(meta.dataMeta).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})})`}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Metas Concluídas */}
                                        {metasConcluidas.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">🎉 Metas Concluídas</h4>
                                                <div className="space-y-2">
                                                    {metasConcluidas.map(meta => (
                                                        <div key={meta.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-green-800 line-through">{meta.titulo}</div>
                                                                <div className="text-sm text-green-600">R$ {meta.valor.toFixed(2)} ✓</div>
                                                            </div>
                                                            <button 
                                                                onClick={() => deletarMeta(meta.id)}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Conteúdo Aba Dívidas */}
                        {abaAtiva === 'dividas' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">💳 Gerenciamento de Dívidas</h3>
                                        <p className="text-gray-600">Estratégias inteligentes para quitar suas dívidas</p>
                                    </div>
                                    <button 
                                        onClick={() => setModalAberto('novaDivida')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                    >
                                        ➕ Nova Dívida
                                    </button>
                                </div>

                                {dividas.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                        <div className="text-xl mb-4">💳</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma dívida cadastrada</h3>
                                        <p className="text-gray-600 mb-3">Cadastre suas dívidas para calcular a melhor estratégia de pagamento</p>
                                        <button 
                                            onClick={() => setModalAberto('novaDivida')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                        >
                                            ➕ Cadastrar Primeira Dívida
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Resumo */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <div className="text-sm text-gray-600">Total de Dívidas</div>
                                                <div className="text-2xl font-bold text-red-600">
                                                    {dividas.length}
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <div className="text-sm text-gray-600">Saldo Devedor</div>
                                                <div className="text-2xl font-bold text-orange-600">
                                                    R$ {dividas.reduce((sum, d) => sum + d.saldoDevedor, 0).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <div className="text-sm text-gray-600">Parcelas Mínimas</div>
                                                <div className="text-2xl font-bold text-purple-600">
                                                    R$ {dividas.reduce((sum, d) => sum + d.parcelaMinima, 0).toFixed(2)}/mês
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <div className="text-sm text-gray-600">Disponível para Dívidas</div>
                                                <div className={`text-2xl font-bold ${saldo.positivo ? 'text-green-600' : 'text-red-600'}`}>
                                                    R$ {saldo.positivo ? saldo.saldo.toFixed(2) : '0.00'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lista de Dívidas */}
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Suas Dívidas</h4>
                                            <div className="space-y-3">
                                                {dividas.map(divida => (
                                                    <div key={divida.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1">
                                                                <h5 className="font-bold text-gray-800 text-lg">{divida.nome}</h5>
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    Valor total: R$ {divida.valorTotal.toFixed(2)} • 
                                                                    Juros: {divida.taxaJuros}% a.m. • 
                                                                    Venc: dia {divida.vencimento}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => deletarDivida(divida.id)}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <div className="text-xs text-gray-600 mb-1">Saldo Devedor</div>
                                                                <div className="text-xl font-bold text-red-600">
                                                                    R$ {divida.saldoDevedor.toFixed(2)}
                                                                </div>
                                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-red-500 h-2 rounded-full"
                                                                        style={{ width: `${(divida.saldoDevedor / divida.valorTotal) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-600 mb-1">Parcela Mínima</div>
                                                                <div className="text-xl font-bold text-purple-600">
                                                                    R$ {divida.parcelaMinima.toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-2">
                                                                    {divida.parcelaMinima > 0 ? 
                                                                        `~${Math.ceil(divida.saldoDevedor / divida.parcelaMinima)} meses (só mínimo)` :
                                                                        'Definir parcela'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Estratégias */}
                                        {estrategias && estrategias.disponivel > 0 && (
                                            <div style={{background:'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', borderRadius:'16px', boxShadow:'0 8px 24px rgba(99,102,241,0.3)', padding:'1.5rem', color:'#fff'}}>
                                                <h4 className="text-2xl font-bold mb-3">🎯 Estratégias de Pagamento</h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Bola de Neve */}
                                                    <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="text-xl">🔴</div>
                                                            <div>
                                                                <h5 className="text-xl font-bold">Bola de Neve</h5>
                                                                <p className="text-sm opacity-90">Menor saldo primeiro</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="text-sm opacity-75">Tempo para quitar:</div>
                                                                <div className="text-xl font-bold">{estrategias.bolaDeNeve.meses} meses</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm opacity-75">Total de juros:</div>
                                                                <div className="text-2xl font-bold">R$ {estrategias.bolaDeNeve.jurosTotal.toFixed(2)}</div>
                                                            </div>
                                                            <div className="mt-4 p-3 bg-white bg-opacity-30 rounded">
                                                                <div className="text-sm font-semibold mb-1">💪 Vantagem:</div>
                                                                <div className="text-xs">Vitórias rápidas aumentam motivação</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Avalanche */}
                                                    <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="text-xl">⚡</div>
                                                            <div>
                                                                <h5 className="text-xl font-bold">Avalanche</h5>
                                                                <p className="text-sm opacity-90">Maior juros primeiro</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="text-sm opacity-75">Tempo para quitar:</div>
                                                                <div className="text-xl font-bold">{estrategias.avalanche.meses} meses</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm opacity-75">Total de juros:</div>
                                                                <div className="text-2xl font-bold">R$ {estrategias.avalanche.jurosTotal.toFixed(2)}</div>
                                                            </div>
                                                            <div className="mt-4 p-3 bg-white bg-opacity-30 rounded">
                                                                <div className="text-sm font-semibold mb-1">💰 Vantagem:</div>
                                                                <div className="text-xs">Economia máxima em juros</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Comparação */}
                                                <div className="mt-3 p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                                                    <div className="text-lg font-bold mb-2">📊 Comparação:</div>
                                                    {estrategias.avalanche.jurosTotal < estrategias.bolaDeNeve.jurosTotal ? (
                                                        <div className="text-sm">
                                                            ⚡ <span className="font-bold">Avalanche economiza R$ {(estrategias.bolaDeNeve.jurosTotal - estrategias.avalanche.jurosTotal).toFixed(2)}</span> em juros!
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm">
                                                            🔴 <span className="font-bold">Bola de Neve economiza R$ {(estrategias.avalanche.jurosTotal - estrategias.bolaDeNeve.jurosTotal).toFixed(2)}</span> em juros!
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(!estrategias || estrategias.disponivel <= 0) && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="text-2xl">⚠️</div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-yellow-800 mb-1">Sem sobra para pagar dívidas</div>
                                                        <div className="text-sm text-yellow-700">
                                                            Você está gastando tudo ou mais que sua renda. Para usar as estratégias de pagamento, 
                                                            é preciso ter sobra mensal. Revise seus gastos no orçamento!
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Conteúdo Aba Simulador de Compra */}
                        {abaAtiva === 'compra' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">🛒 Simulador de Compra</h3>
                                        <p className="text-gray-600">Simule uma compra e veja o impacto no seu orçamento</p>
                                    </div>
                                </div>

                                {/* Formulário de Simulação */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h4 className="text-base font-bold text-gray-800 mb-4">📝 Detalhes da Compra</h4>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nome do Produto/Serviço
                                            </label>
                                            <input 
                                                type="text" 
                                                id="simNomeProduto"
                                                placeholder="Ex: Geladeira, TV, Curso..."
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Valor Total
                                                </label>
                                                <input 
                                                    type="number" 
                                                    id="simValorTotal"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Forma de Pagamento
                                                </label>
                                                <select 
                                                    id="simFormaPagamento"
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                    onChange={(e) => {
                                                        const parcelasDiv = document.getElementById('simParcelasDiv');
                                                        if (e.target.value === 'parcelado') {
                                                            parcelasDiv.style.display = 'block';
                                                        } else {
                                                            parcelasDiv.style.display = 'none';
                                                        }
                                                    }}
                                                >
                                                    <option value="avista">À Vista</option>
                                                    <option value="parcelado">Parcelado</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div id="simParcelasDiv" style={{ display: 'none' }}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Número de Parcelas
                                            </label>
                                            <input 
                                                type="number" 
                                                id="simNumeroParcelas"
                                                min="2"
                                                max="48"
                                                placeholder="Ex: 12"
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Mês da Primeira Parcela/Pagamento
                                            </label>
                                            <input 
                                                type="month" 
                                                id="simMesPagamento"
                                                defaultValue={mesAtual}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => {
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
                                                const percentualRenda = (impactoMensal / receitasMensal) * 100;
                                                const comprometimentoTotal = (novasDespesas / receitasMensal) * 100;

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
                                                                        ${sufoca ? 
                                                                            'Com essa compra, você ficará com ' + comprometimentoTotal.toFixed(0) + '% da renda comprometida. ' +
                                                                            (novoSaldo < 0 ? 'Você terá déficit de R$ ' + Math.abs(novoSaldo).toFixed(2) + ' no mês. ' : '') +
                                                                            'Considere reduzir gastos ou aumentar o prazo de pagamento.' 
                                                                            : 
                                                                            'Você ainda terá R$ ' + novoSaldo.toFixed(2) + ' sobrando por mês. Está dentro do recomendado manter menos de 70% da renda comprometida.'
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        ${forma === 'parcelado' ? `
                                                            <div class="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                                                <div class="font-bold text-blue-800 mb-2">📅 Cronograma de Pagamento</div>
                                                                <div class="text-sm text-blue-700">
                                                                    Primeira parcela: ${new Date(mesPagamento + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}<br>
                                                                    Última parcela: ${(() => {
                                                                        const data = new Date(mesPagamento + '-01');
                                                                        data.setMonth(data.getMonth() + parcelas - 1);
                                                                        return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                                                                    })()}<br>
                                                                    Durante ${parcelas} meses você terá um compromisso de R$ ${valorParcela.toFixed(2)} mensais.
                                                                </div>
                                                            </div>
                                                        ` : ''}
                                                    </div>
                                                `;

                                                divResultado.innerHTML = html;
                                                divResultado.style.display = 'block';
                                            }}
                                            style={{width:"100%", padding:"12px 24px", background:"linear-gradient(135deg, #6366f1, #10b981)", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(99,102,241,0.4)"}}
                                        >
                                            🔍 Simular Compra
                                        </button>
                                    </div>
                                </div>

                                {/* Resultado da Simulação */}
                                <div id="simResultado" style={{ display: 'none' }}></div>

                                {/* Dicas */}
                                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                                    <h4 className="text-lg font-bold mb-3">💡 Dicas para uma Compra Consciente</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <div className="text-lg">✅</div>
                                            <div><strong>Mantenha até 70% da renda comprometida:</strong> Isso garante margem para imprevistos</div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="text-lg">✅</div>
                                            <div><strong>Compare à vista vs parcelado:</strong> Às vezes o desconto à vista compensa</div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="text-lg">✅</div>
                                            <div><strong>Avalie a necessidade:</strong> É desejo ou necessidade? Pode esperar?</div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="text-lg">✅</div>
                                            <div><strong>Considere sua reserva de emergência:</strong> Não comprometa seu fundo de emergência</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conteúdo Aba Simulador */}
                        {abaAtiva === 'simulador' && (
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">🎲 Simulador de Cenários</h3>
                                    <p className="text-gray-600">Veja o impacto de mudanças nas suas finanças</p>
                                </div>

                                {/* Cenário Atual */}
                                <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl shadow-lg p-6 text-white">
                                    <h4 className="text-xl font-bold mb-4">📊 Cenário Atual</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm opacity-75">Receitas</div>
                                            <div className="text-2xl font-bold">R$ {saldo.receitas.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">Despesas</div>
                                            <div className="text-2xl font-bold">R$ {totais.total.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">Saldo</div>
                                            <div className={`text-2xl font-bold ${saldo.positivo ? 'text-green-300' : 'text-red-300'}`}>
                                                R$ {saldo.saldo.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">Score</div>
                                            <div className="text-2xl font-bold">{scoreSaude.score}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controles de Simulação */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4">🎮 Ajuste os Valores</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Renda */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                💰 Ajuste de Renda (%)
                                            </label>
                                            <input 
                                                type="range" 
                                                min="-50" 
                                                max="100" 
                                                value={simulacao.rendaAjuste}
                                                onChange={(e) => setSimulacao({...simulacao, rendaAjuste: parseFloat(e.target.value)})}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm mt-2">
                                                <span className="text-red-600">-50%</span>
                                                <span className={`font-bold ${simulacao.rendaAjuste >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {simulacao.rendaAjuste > 0 ? '+' : ''}{simulacao.rendaAjuste}%
                                                </span>
                                                <span className="text-green-600">+100%</span>
                                            </div>
                                        </div>

                                        {/* Gastos */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                📉 Ajuste de Gastos (%)
                                            </label>
                                            <input 
                                                type="range" 
                                                min="-50" 
                                                max="50" 
                                                value={simulacao.gastosAjuste}
                                                onChange={(e) => setSimulacao({...simulacao, gastosAjuste: parseFloat(e.target.value)})}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm mt-2">
                                                <span className="text-green-600">-50%</span>
                                                <span className={`font-bold ${simulacao.gastosAjuste <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {simulacao.gastosAjuste > 0 ? '+' : ''}{simulacao.gastosAjuste}%
                                                </span>
                                                <span className="text-red-600">+50%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSimulacao({ rendaAjuste: 0, gastosAjuste: 0, quitarDivida: null, novaReceita: 0, novaDespesa: 0 })}
                                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                                    >
                                        🔄 Resetar
                                    </button>
                                </div>

                                {/* Cenário Simulado */}
                                {(() => {
                                    const receitaSimulada = saldo.receitas * (1 + simulacao.rendaAjuste / 100);
                                    const despesaSimulada = totais.total * (1 + simulacao.gastosAjuste / 100);
                                    const saldoSimulado = receitaSimulada - despesaSimulada;
                                    const positivoSimulado = saldoSimulado >= 0;
                                    
                                    // Calcular novo score
                                    let scoreSimulado = 0;
                                    if (positivoSimulado) scoreSimulado += 30;
                                    if (despesaSimulada <= (receitaSimulada * 0.9)) scoreSimulado += 25;
                                    scoreSimulado += Math.min(30, Math.floor((reservaEmergencia / (despesaSimulada * 6)) * 30));
                                    if (positivoSimulado) scoreSimulado += Math.min(15, Math.floor((saldoSimulado / receitaSimulada) * 100 / 20 * 15));
                                    
                                    const diferenca = {
                                        receita: receitaSimulada - saldo.receitas,
                                        despesa: despesaSimulada - totais.total,
                                        saldo: saldoSimulado - saldo.saldo,
                                        score: scoreSimulado - scoreSaude.score
                                    };
                                    
                                    return (
                                        <div style={{background:'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', borderRadius:'16px', boxShadow:'0 8px 24px rgba(99,102,241,0.3)', padding:'1.5rem', color:'#fff'}}>
                                            <h4 className="text-xl font-bold mb-4">🔮 Cenário Simulado</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <div className="text-sm opacity-75">Receitas</div>
                                                    <div className="text-2xl font-bold">R$ {receitaSimulada.toFixed(2)}</div>
                                                    <div className={`text-sm ${diferenca.receita >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {diferenca.receita >= 0 ? '▲' : '▼'} R$ {Math.abs(diferenca.receita).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm opacity-75">Despesas</div>
                                                    <div className="text-2xl font-bold">R$ {despesaSimulada.toFixed(2)}</div>
                                                    <div className={`text-sm ${diferenca.despesa <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {diferenca.despesa >= 0 ? '▲' : '▼'} R$ {Math.abs(diferenca.despesa).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm opacity-75">Saldo</div>
                                                    <div className={`text-2xl font-bold ${positivoSimulado ? 'text-green-300' : 'text-red-300'}`}>
                                                        R$ {saldoSimulado.toFixed(2)}
                                                    </div>
                                                    <div className={`text-sm ${diferenca.saldo >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {diferenca.saldo >= 0 ? '▲' : '▼'} R$ {Math.abs(diferenca.saldo).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm opacity-75">Score</div>
                                                    <div className="text-2xl font-bold">{scoreSimulado}</div>
                                                    <div className={`text-sm ${diferenca.score >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {diferenca.score >= 0 ? '▲' : '▼'} {Math.abs(diferenca.score)} pts
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Análise do Impacto */}
                                            <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                                <h5 className="font-bold mb-2">📊 Análise de Impacto:</h5>
                                                <div className="space-y-1 text-sm">
                                                    {diferenca.saldo > 0 && (
                                                        <div>✅ Melhora no saldo mensal de R$ {diferenca.saldo.toFixed(2)}</div>
                                                    )}
                                                    {diferenca.saldo < 0 && (
                                                        <div>⚠️ Piora no saldo mensal de R$ {Math.abs(diferenca.saldo).toFixed(2)}</div>
                                                    )}
                                                    {diferenca.score > 0 && (
                                                        <div>📈 Score de saúde aumenta {diferenca.score} pontos</div>
                                                    )}
                                                    {diferenca.score < 0 && (
                                                        <div>📉 Score de saúde diminui {Math.abs(diferenca.score)} pontos</div>
                                                    )}
                                                    {positivoSimulado && !saldo.positivo && (
                                                        <div>🎉 Você sairia do vermelho!</div>
                                                    )}
                                                    {!positivoSimulado && saldo.positivo && (
                                                        <div>🚨 Você entraria no vermelho!</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Cenários Rápidos */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4">⚡ Cenários Rápidos</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button 
                                            onClick={() => setSimulacao({...simulacao, rendaAjuste: 20, gastosAjuste: 0})}
                                            className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left"
                                        >
                                            <div className="text-2xl mb-2">📈</div>
                                            <div className="font-bold text-gray-800">Promoção +20%</div>
                                            <div className="text-sm text-gray-600">Aumento de renda</div>
                                        </button>
                                        <button 
                                            onClick={() => setSimulacao({...simulacao, rendaAjuste: 0, gastosAjuste: -20})}
                                            className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left"
                                        >
                                            <div className="text-2xl mb-2">💰</div>
                                            <div className="font-bold text-gray-800">Economia -20%</div>
                                            <div className="text-sm text-gray-600">Redução de gastos</div>
                                        </button>
                                        <button 
                                            onClick={() => setSimulacao({...simulacao, rendaAjuste: 20, gastosAjuste: -20})}
                                            className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 text-left"
                                        >
                                            <div className="text-2xl mb-2">🚀</div>
                                            <div className="font-bold text-gray-800">Combo Perfeito</div>
                                            <div className="text-sm text-gray-600">+20% renda, -20% gastos</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conteúdo Aba Timeline */}
                        {abaAtiva === 'timeline' && (
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">📈 Linha do Tempo Financeira</h3>
                                    <p className="text-gray-600">Visualize sua jornada financeira e projeções futuras</p>
                                </div>

                                {/* Situação Atual */}
                                <div style={{background:'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', borderRadius:'16px', boxShadow:'0 8px 24px rgba(99,102,241,0.3)', padding:'1.5rem', color:'#fff'}}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-xl">📍</div>
                                        <div>
                                            <h4 className="text-xl font-bold">Você está aqui</h4>
                                            <p className="text-sm opacity-90">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm opacity-75">Score</div>
                                            <div className="text-xl font-bold">{scoreSaude.score}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">Saldo Mensal</div>
                                            <div className="text-2xl font-bold">R$ {saldo.saldo.toFixed(0)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">Metas Ativas</div>
                                            <div className="text-xl font-bold">{metasFinanceiras.filter(m => !m.concluida).length}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">Dívidas</div>
                                            <div className="text-xl font-bold">{dividas.length}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Visual */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-3">🗓️ Próximos Marcos</h4>
                                    
                                    <div className="relative">
                                        {/* Linha vertical */}
                                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                                        
                                        <div className="space-y-4">
                                            {/* Metas futuras */}
                                            {metasFinanceiras
                                                .filter(m => !m.concluida && m.dataMeta)
                                                .sort((a, b) => new Date(a.dataMeta) - new Date(b.dataMeta))
                                                .slice(0, 5)
                                                .map(meta => {
                                                    const progresso = (meta.valorAtual / meta.valor) * 100;
                                                    const dataMeta = new Date(meta.dataMeta);
                                                    const hoje = new Date();
                                                    const diasRestantes = Math.ceil((dataMeta - hoje) / (1000 * 60 * 60 * 24));
                                                    
                                                    return (
                                                        <div key={meta.id} className="relative flex items-start gap-4">
                                                            <div className="relative z-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                                                                🎯
                                                            </div>
                                                            <div className="flex-1 bg-blue-50 rounded-lg p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h5 className="font-bold text-gray-800">{meta.titulo}</h5>
                                                                        <p className="text-sm text-gray-600">
                                                                            {dataMeta.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                                            {diasRestantes > 0 && ` • ${diasRestantes} dias restantes`}
                                                                        </p>
                                                                    </div>
                                                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                                                                        {progresso.toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 bg-white rounded-full h-3">
                                                                        <div 
                                                                            className="bg-blue-600 h-3 rounded-full transition-all"
                                                                            style={{ width: `${Math.min(progresso, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-gray-700">
                                                                        R$ {meta.valorAtual.toFixed(0)} / R$ {meta.valor.toFixed(0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            }

                                            {/* Quitação de dívidas */}
                                            {dividas.length > 0 && estrategias && estrategias.disponivel > 0 && (
                                                <div className="relative flex items-start gap-4">
                                                    <div className="relative z-10 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl">
                                                        ✅
                                                    </div>
                                                    <div className="flex-1 bg-green-50 rounded-lg p-4">
                                                        <h5 className="font-bold text-gray-800">Todas as Dívidas Quitadas</h5>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {(() => {
                                                                const meses = Math.min(estrategias.bolaDeNeve.meses, estrategias.avalanche.meses);
                                                                const dataQuita = new Date();
                                                                dataQuita.setMonth(dataQuita.getMonth() + meses);
                                                                return dataQuita.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                                                            })()}
                                                        </p>
                                                        <div className="text-sm">
                                                            <span className="font-semibold">Estratégia recomendada:</span>{' '}
                                                            {estrategias.avalanche.jurosTotal < estrategias.bolaDeNeve.jurosTotal ? 
                                                                '⚡ Avalanche (economia máxima)' : 
                                                                '🔴 Bola de Neve (motivação)'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reserva de emergência */}
                                            {scoreSaude.percentualReserva < 100 && (
                                                <div className="relative flex items-start gap-4">
                                                    <div className="relative z-10 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                                                        🆘
                                                    </div>
                                                    <div className="flex-1 bg-purple-50 rounded-lg p-4">
                                                        <h5 className="font-bold text-gray-800">Reserva de Emergência Completa</h5>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {saldo.positivo && saldo.saldo > 0 ? (
                                                                (() => {
                                                                    const falta = scoreSaude.reservaIdeal - scoreSaude.reservaAtual;
                                                                    const mesesRestantes = Math.ceil(falta / saldo.saldo);
                                                                    const dataCompleta = new Date();
                                                                    dataCompleta.setMonth(dataCompleta.getMonth() + mesesRestantes);
                                                                    return dataCompleta.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                                                                })()
                                                            ) : 'Defina seu saldo para calcular'}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-white rounded-full h-3">
                                                                <div 
                                                                    className="bg-purple-600 h-3 rounded-full"
                                                                    style={{ width: `${Math.min(scoreSaude.percentualReserva, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-700">
                                                                {scoreSaude.percentualReserva.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Score 100 */}
                                            {scoreSaude.score < 100 && (
                                                <div className="relative flex items-start gap-4">
                                                    <div className="relative z-10 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl">
                                                        🏆
                                                    </div>
                                                    <div className="flex-1 bg-yellow-50 rounded-lg p-4">
                                                        <h5 className="font-bold text-gray-800">Score de Saúde 100</h5>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Meta de excelência financeira
                                                        </p>
                                                        <div className="text-sm">
                                                            <span className="font-semibold">Faltam:</span> {100 - scoreSaude.score} pontos
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {metasFinanceiras.filter(m => !m.concluida && m.dataMeta).length === 0 && 
                                     dividas.length === 0 && 
                                     scoreSaude.percentualReserva >= 100 && 
                                     scoreSaude.score >= 100 && (
                                        <div className="text-center py-12">
                                            <div className="text-xl mb-4">🎉</div>
                                            <h4 className="text-xl font-bold text-gray-800 mb-2">Parabéns!</h4>
                                            <p className="text-gray-600">Você alcançou todos os marcos financeiros!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Projeção de Patrimônio */}
                                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                                    <h4 className="text-xl font-bold mb-4">💰 Projeção de Patrimônio</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <div className="text-sm opacity-75">1 Ano</div>
                                            <div className="text-xl font-bold">
                                                R$ {(reservaEmergencia + (saldo.positivo ? saldo.saldo * 12 : 0)).toFixed(0)}
                                            </div>
                                            <div className="text-sm opacity-90 mt-1">
                                                {saldo.positivo ? `+R$ ${(saldo.saldo * 12).toFixed(0)} acumulado` : 'Sem acúmulo'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">3 Anos</div>
                                            <div className="text-xl font-bold">
                                                R$ {(reservaEmergencia + (saldo.positivo ? saldo.saldo * 36 : 0)).toFixed(0)}
                                            </div>
                                            <div className="text-sm opacity-90 mt-1">
                                                {saldo.positivo ? `+R$ ${(saldo.saldo * 36).toFixed(0)} acumulado` : 'Sem acúmulo'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-75">5 Anos</div>
                                            <div className="text-xl font-bold">
                                                R$ {(reservaEmergencia + (saldo.positivo ? saldo.saldo * 60 : 0)).toFixed(0)}
                                            </div>
                                            <div className="text-sm opacity-90 mt-1">
                                                {saldo.positivo ? `+R$ ${(saldo.saldo * 60).toFixed(0)} acumulado` : 'Sem acúmulo'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white bg-opacity-20 rounded backdrop-blur-sm text-sm">
                                        ⚠️ Projeção considerando economia mensal constante, sem investimentos ou inflação
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conteúdo Aba Metas Anuais */}
                        {abaAtiva === 'metasanuais' && (
                            <div className="space-y-3">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => setModalAberto('metas')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                                    >
                                        📝 Editar Metas
                                    </button>
                                </div>

                                {/* Cards de Resumo Anual */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Total Planejado (Ano)</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            R$ {(metas.jan + metas.fev + metas.mar + metas.abr + metas.mai + metas.jun + 
                                                 metas.jul + metas.ago + metas.set + metas.out + metas.nov + metas.dez).toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="text-sm text-gray-600">Gasto (até {mesAtual.toUpperCase()})</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            R$ {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
                                                .slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1)
                                                .reduce((sum, mes) => sum + calcularTotais(mes).total, 0).toFixed(2)}
                                        </div>
                                    </div>

                                    {(() => {
                                        const totalMetaAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
                                            .slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1)
                                            .reduce((sum, mes) => sum + (metas[mes] || 0), 0);
                                        const totalGastoAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
                                            .slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1)
                                            .reduce((sum, mes) => sum + calcularTotais(mes).total, 0);
                                        const diferenca = totalMetaAteAgora - totalGastoAteAgora;
                                        const dentroMeta = diferenca >= 0;
                                        
                                        return (
                                            <div className={`rounded-xl shadow-lg p-6 ${dentroMeta ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
                                                <div className="text-sm opacity-90">{dentroMeta ? 'Economia' : 'Excesso'}</div>
                                                <div className="text-2xl font-bold">R$ {Math.abs(diferenca).toFixed(2)}</div>
                                                <div className="text-sm mt-2">{dentroMeta ? '✅ Abaixo da meta' : '⚠️ Acima da meta'}</div>
                                            </div>
                                        );
                                    })()}

                                    {(() => {
                                        const mesesAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
                                            .slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1);
                                        const mesesNoTarget = mesesAteAgora.filter(mes => {
                                            const meta = metas[mes] || 0;
                                            const gasto = calcularTotais(mes).total;
                                            return gasto <= meta;
                                        }).length;
                                        
                                        return (
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <div className="text-sm text-gray-600">Performance</div>
                                                <div className="text-2xl font-bold text-green-600">{mesesNoTarget}/{mesesAteAgora.length}</div>
                                                <div className="text-sm text-gray-500 mt-2">Meses no target ({((mesesNoTarget/mesesAteAgora.length)*100).toFixed(0)}%)</div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Tabela de Metas Mensais */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Metas por Mês</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="text-left py-2 px-4 font-bold text-gray-700">Mês</th>
                                                    <th className="text-right py-2 px-4 font-bold text-gray-700">Meta</th>
                                                    <th className="text-right py-2 px-4 font-bold text-gray-700">Real</th>
                                                    <th className="text-right py-2 px-4 font-bold text-gray-700">Diferença</th>
                                                    <th className="text-center py-2 px-4 font-bold text-gray-700">Status</th>
                                                    <th className="text-right py-2 px-4 font-bold text-gray-700">%</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => {
                                                    const meta = metas[mes] || 0;
                                                    const real = calcularTotais(mes).total;
                                                    const diferenca = meta - real;
                                                    const percentual = meta > 0 ? (real / meta) * 100 : 0;
                                                    const dentroMeta = real <= meta && real > 0;
                                                    const pendente = real === 0;
                                                    
                                                    return (
                                                        <tr key={mes} className={`border-b border-gray-100 hover:bg-gray-50 ${mes === mesAtual ? 'bg-blue-50' : ''}`}>
                                                            <td className="py-2 px-4">
                                                                <span className="font-semibold uppercase">{mes}</span>
                                                                {mes === mesAtual && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Atual</span>}
                                                            </td>
                                                            <td className="text-right py-2 px-4 text-blue-600 font-semibold">
                                                                R$ {meta.toFixed(2)}
                                                            </td>
                                                            <td className="text-right py-2 px-4 font-semibold">
                                                                R$ {real.toFixed(2)}
                                                            </td>
                                                            <td className={`text-right py-2 px-4 font-bold ${diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {diferenca >= 0 ? '+' : ''}R$ {diferenca.toFixed(2)}
                                                            </td>
                                                            <td className="text-center py-2 px-4 text-2xl">
                                                                {pendente ? '⏳' : dentroMeta ? '✅' : '❌'}
                                                            </td>
                                                            <td className={`text-right py-2 px-4 font-bold ${dentroMeta ? 'text-green-600' : pendente ? 'text-gray-400' : 'text-red-600'}`}>
                                                                {percentual.toFixed(0)}%
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Gráfico Visual Simples */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Evolução Anual</h3>
                                    <div className="space-y-3">
                                        {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(mes => {
                                            const meta = metas[mes] || 0;
                                            const real = calcularTotais(mes).total;
                                            const maxValor = Math.max(meta, real, 1);
                                            const larguraMeta = (meta / maxValor) * 100;
                                            const larguraReal = (real / maxValor) * 100;
                                            
                                            return (
                                                <div key={mes}>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-semibold uppercase text-gray-700 w-12">{mes}</span>
                                                        <div className="flex-1 relative h-10">
                                                            <div 
                                                                className="absolute top-0 left-0 h-4 bg-blue-200 rounded"
                                                                style={{ width: `${larguraMeta}%` }}
                                                                title={`Meta: R$ ${meta.toFixed(2)}`}
                                                            ></div>
                                                            <div 
                                                                className={`absolute top-5 left-0 h-4 rounded ${real <= meta ? 'bg-green-500' : 'bg-red-500'}`}
                                                                style={{ width: `${larguraReal}%` }}
                                                                title={`Real: R$ ${real.toFixed(2)}`}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-3 mt-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                            <span>Meta Planejada</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                                            <span>Gasto Real (Dentro)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                                            <span>Gasto Real (Acima)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
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
                    ...gastosFixos
                        .filter(g => !g.mes || g.mes === mesAtual) // Se não tem mês OU é do mês atual
                        .filter(g => !g.ano || g.ano === anoAtual) // Se não tem ano OU é do ano atual
                        .map(g => ({ 
                            tipo: 'FIXO', 
                            nome: g.descricao, 
                            vencimento: g.vencimento, 
                            valor: g.valor,
                            badge: g.temporario && g.totalParcelas ? `${g.parcelaAtual}/${g.totalParcelas}` : null
                        })),
                    // Gastos Variáveis que devem aparecer no Farol
                    ...gastosVariaveis
                        .filter(g => g.mostrarNoFarol && g.mes === mesAtual && g.ano === anoAtual)
                        .map(g => ({
                            tipo: 'VARIÁVEL',
                            nome: g.descricao || g.categoria,
                            vencimento: g.vencimento || 1,
                            valor: g.valor
                        })),
                    // Gastos Extras que devem aparecer no Farol
                    ...gastosExtras
                        .filter(g => g.mostrarNoFarol && g.mes === mesAtual && g.ano === anoAtual)
                        .map(g => ({
                            tipo: 'EXTRA',
                            nome: g.descricao || g.categoria,
                            vencimento: g.vencimento || 1,
                            valor: g.valor
                        }))
                ].filter(item => item.valor > 0).sort((a, b) => a.vencimento - b.vencimento);

                const itensFiltrados = filtroStatus === 'todos' ? itensTodos :
                    filtroStatus === 'pagos' ? itensTodos.filter(item => getStatusFarol(item.nome, mesAtual) === 'PAGO') :
                    itensTodos.filter(item => getStatusFarol(item.nome, mesAtual) === 'PENDENTE');

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

                return (
                    <div className="space-y-3">
                        {/* Card Vencimentos da Semana - COMPACTO */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-lg p-4 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    📅 Vencimentos da Semana
                                </h3>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                    Hoje: {diaHoje} {mesAtual.toUpperCase()}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Vence Hoje */}
                                <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-red-300">
                                    <div className="text-xs opacity-90 mb-1">🔴 VENCE HOJE</div>
                                    <div className="text-2xl font-bold mb-1">R$ {totalHoje.toFixed(2)}</div>
                                    <div className="text-xs opacity-80 mb-1">{vencimentosHoje.length} {vencimentosHoje.length === 1 ? 'item' : 'itens'}</div>
                                    {vencimentosHoje.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {vencimentosHoje.slice(0, 2).map((item, idx) => (
                                                <div key={idx} className="text-xs opacity-80 truncate">• {item.nome}</div>
                                            ))}
                                            {vencimentosHoje.length > 2 && (
                                                <div className="text-xs opacity-70">+ {vencimentosHoje.length - 2} mais</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Próximos 7 Dias */}
                                <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-yellow-300">
                                    <div className="text-xs opacity-90 mb-1">🟡 PRÓXIMOS 7 DIAS</div>
                                    <div className="text-2xl font-bold mb-1">R$ {totalSemana.toFixed(2)}</div>
                                    <div className="text-xs opacity-80 mb-1">{vencimentosSemana.length} {vencimentosSemana.length === 1 ? 'item' : 'itens'}</div>
                                    {vencimentosSemana.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {vencimentosSemana.slice(0, 2).map((item, idx) => (
                                                <div key={idx} className="text-xs opacity-80 truncate">• {item.nome} (dia {item.vencimento})</div>
                                            ))}
                                            {vencimentosSemana.length > 2 && (
                                                <div className="text-xs opacity-70">+ {vencimentosSemana.length - 2} mais</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Total da Semana */}
                                <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/50">
                                    <div className="text-xs opacity-90 mb-1">💰 TOTAL SEMANA</div>
                                    <div className="text-2xl font-bold mb-1">R$ {(totalHoje + totalSemana).toFixed(2)}</div>
                                    <div className="text-xs opacity-80 mb-2">{vencimentosHoje.length + vencimentosSemana.length} itens total</div>
                                    <button
                                        onClick={() => setMostrarTimeline(!mostrarTimeline)}
                                        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors w-full"
                                    >
                                        {mostrarTimeline ? '📅 Ocultar' : '📅 Ver'} Timeline
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Semanal - NOVO */}
                        {mostrarTimeline && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">📆 Timeline da Semana</h3>
                                <div className="space-y-3">
                                    {[...Array(7)].map((_, i) => {
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
                                        
                                        return (
                                            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                                isHoje ? 'bg-purple-50 border-2 border-purple-500' : 
                                                vencimentosDia.length > 0 ? 'bg-orange-50 border border-orange-200' : 
                                                'bg-gray-50 border border-gray-200'
                                            }`}>
                                                <div className={`flex-shrink-0 w-16 text-center ${isHoje ? 'text-purple-600' : 'text-gray-600'}`}>
                                                    <div className="text-xs font-semibold">{diaSemana}</div>
                                                    <div className={`text-2xl font-bold ${isHoje ? 'text-purple-700' : 'text-gray-700'}`}>{dia}</div>
                                                    {isHoje && <div className="text-xs font-bold text-purple-600">HOJE</div>}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    {vencimentosDia.length === 0 ? (
                                                        <div className="text-sm text-gray-400 italic py-2">Nenhum vencimento</div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {vencimentosDia.map((item, idx) => {
                                                                const status = getStatusFarol(item.nome, mesAtual);
                                                                const isPago = status === 'PAGO';
                                                                return (
                                                                    <div key={idx} className="flex items-center justify-between bg-white rounded p-2 shadow-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-lg">{isPago ? '✅' : '⚪'}</span>
                                                                            <div>
                                                                                <div className="font-semibold text-sm text-gray-800">{item.nome}</div>
                                                                                <div className="text-xs text-gray-500">{item.tipo}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-bold text-gray-800">R$ {item.valor.toFixed(2)}</div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            <div className="text-xs text-right font-bold text-gray-600 pt-1 border-t">
                                                                Total do dia: R$ {totalDia.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">🚦 Farol de Pagamentos - {mesAtual.toUpperCase()} / {anoAtual}</h2>
                            
                            {/* Cards de Resumo */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                    <div className="text-sm text-gray-600 mb-1">Total a Pagar</div>
                                    <div className="text-xl font-bold text-blue-600">R$ {pagamentos.total.toFixed(2)}</div>
                                    <div className="text-sm text-gray-500 mt-2">{pagamentos.qtdTotal} itens</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                    <div className="text-sm text-gray-600 mb-1">✅ Já Pago</div>
                                    <div className="text-xl font-bold text-green-600">R$ {pagamentos.pago.toFixed(2)}</div>
                                    <div className="text-sm text-gray-500 mt-2">{pagamentos.qtdPago} pagos • {pagamentos.percentual.toFixed(0)}%</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                                    <div className="text-sm text-gray-600 mb-1">⏳ Ainda Falta</div>
                                    <div className="text-xl font-bold text-orange-600">R$ {pagamentos.pendente.toFixed(2)}</div>
                                    <div className="text-sm text-gray-500 mt-2">{pagamentos.qtdTotal - pagamentos.qtdPago} pendentes</div>
                                </div>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold text-gray-700">Progresso de Pagamentos</span>
                                    <span className="font-bold text-gray-800">{pagamentos.percentual.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-6">
                                    <div 
                                        className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-xs font-bold ${
                                            pagamentos.percentual >= 100 ? 'bg-green-500' :
                                            pagamentos.percentual >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(pagamentos.percentual, 100)}%` }}
                                    >
                                        {pagamentos.percentual >= 10 && `${pagamentos.percentual.toFixed(0)}%`}
                                    </div>
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="flex gap-2 mb-3">
                                <button 
                                    onClick={() => setFiltroStatus('todos')}
                                    className={`px-4 py-2 rounded-lg font-semibold ${
                                        filtroStatus === 'todos' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Todos ({itensTodos.length})
                                </button>
                                <button 
                                    onClick={() => setFiltroStatus('pagos')}
                                    className={`px-4 py-2 rounded-lg font-semibold ${
                                        filtroStatus === 'pagos' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    ✅ Pagos ({pagamentos.qtdPago})
                                </button>
                                <button 
                                    onClick={() => setFiltroStatus('pendentes')}
                                    className={`px-4 py-2 rounded-lg font-semibold ${
                                        filtroStatus === 'pendentes' 
                                            ? 'bg-orange-600 text-white' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    ⏳ Pendentes ({pagamentos.qtdTotal - pagamentos.qtdPago})
                                </button>
                            </div>

                            {/* Lista de Pagamentos - IGUAL À TIMELINE */}
                            <div className="space-y-3">
                                {(() => {
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
                                        
                                        return (
                                            <div key={dia} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                                isHoje ? 'bg-purple-50 border-2 border-purple-500' : 
                                                itensDoDia.length > 0 ? 'bg-orange-50 border border-orange-200' : 
                                                'bg-gray-50 border border-gray-200'
                                            }`}>
                                                {/* Data na lateral - IGUAL TIMELINE */}
                                                <div className={`flex-shrink-0 w-16 text-center ${isHoje ? 'text-purple-600' : 'text-gray-600'}`}>
                                                    <div className="text-xs font-semibold">{diaSemana}</div>
                                                    <div className={`text-2xl font-bold ${isHoje ? 'text-purple-700' : 'text-gray-700'}`}>{dia}</div>
                                                    {isHoje && <div className="text-xs font-bold text-purple-600">HOJE</div>}
                                                </div>
                                                
                                                {/* Conteúdo do dia */}
                                                <div className="flex-1">
                                                    {itensDoDia.length === 0 ? (
                                                        <div className="text-sm text-gray-400 italic py-2">Nenhum vencimento</div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {itensDoDia.map((item, idx) => {
                                                                const status = getStatusFarol(item.nome, mesAtual);
                                                                const isPago = status === 'PAGO';
                                                                const isParcial = typeof status === 'number' && status > 0;
                                                                const valorPago = isParcial ? status : 0;
                                                                const isAtrasado = parseInt(dia) < hoje && !isPago;
                                                                
                                                                return (
                                                                    <div 
                                                                        key={idx} 
                                                                        className="flex items-center justify-between bg-white rounded p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                                        onClick={() => setModalPagamento(item)}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-lg">
                                                                                {isPago ? '✅' : isAtrasado ? '⚠️' : isParcial ? '💵' : '⚪'}
                                                                            </span>
                                                                            <div>
                                                                                <div className={`font-semibold text-sm ${isPago ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                                                                                    {item.nome}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">{item.tipo}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className={`font-bold ${isPago ? 'text-green-600' : 'text-gray-800'}`}>
                                                                                R$ {item.valor.toFixed(2)}
                                                                            </div>
                                                                            {isParcial && (
                                                                                <div className="text-xs text-blue-600">Pago: R$ {valorPago.toFixed(2)}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            <div className="text-xs text-right font-bold text-gray-600 pt-1 border-t">
                                                                Total do dia: R$ {totalDia.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                        </div>

                        {/* Modal de Pagamento */}
                        {modalPagamento && (
                            <div className="modal-overlay" onClick={() => setModalPagamento(null)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-xl font-bold mb-4">💰 Registrar Pagamento</h3>
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="font-bold">{modalPagamento.nome}</div>
                                        <div className="text-2xl font-bold text-blue-600 mt-2">
                                            Total: R$ {modalPagamento.valor.toFixed(2)}
                                        </div>
                                        {(() => {
                                            const statusAtual = getStatusFarol(modalPagamento.nome, mesAtual);
                                            if (typeof statusAtual === 'number' && statusAtual > 0) {
                                                const restante = modalPagamento.valor - statusAtual;
                                                return (
                                                    <div className="mt-3 pt-3 border-t border-blue-300">
                                                        <div className="text-sm text-green-600 font-semibold">
                                                            ✅ Já pago: R$ {statusAtual.toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-orange-600 font-semibold">
                                                            ⏳ Falta pagar: R$ {restante.toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                marcarPago(modalPagamento.nome, mesAtual);
                                                setModalPagamento(null);
                                            }}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                                        >
                                            ✅ Marcar como PAGO
                                        </button>
                                        <div className="border-t pt-3">
                                            <label className="block text-sm font-semibold mb-2">Pagar valor parcial:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={valorParcial}
                                                onChange={(e) => setValorParcial(e.target.value)}
                                                placeholder="Digite o valor"
                                                className="w-full px-4 py-2 border rounded-lg mb-2"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (valorParcial && parseFloat(valorParcial) > 0) {
                                                        pagarParcial(modalPagamento.nome, mesAtual, valorParcial);
                                                        setModalPagamento(null);
                                                        setValorParcial('');
                                                    }
                                                }}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                            >
                                                💰 Pagar Parcial
                                            </button>
                                        </div>
                                        {(() => {
                                            const statusAtual = getStatusFarol(modalPagamento.nome, mesAtual);
                                            // Mostrar botão de resetar para PAGO ou PARCIAL
                                            if (statusAtual === 'PAGO' || (typeof statusAtual === 'number' && statusAtual > 0)) {
                                                return (
                                                    <div className="border-t pt-3">
                                                        <button
                                                            onClick={() => {
                                                                const tipoPagamento = statusAtual === 'PAGO' ? 'integral' : 'parcial';
                                                                const valorPago = statusAtual === 'PAGO' 
                                                                    ? modalPagamento.valor.toFixed(2)
                                                                    : statusAtual.toFixed(2);
                                                                
                                                                if (confirm(`🔄 DESFAZER PAGAMENTO?\n\n` +
                                                                    `Tipo: ${tipoPagamento.toUpperCase()}\n` +
                                                                    `Valor pago: R$ ${valorPago}\n\n` +
                                                                    `Este item voltará para PENDENTE.\n\n` +
                                                                    `Confirma?`)) {
                                                                    const chave = `${modalPagamento.nome}-${mesAtual}-${anoAtual}`;
                                                                    setFarol(prev => {
                                                                        const novoFarol = {...prev};
                                                                        delete novoFarol[chave]; // Remove do farol
                                                                        return novoFarol;
                                                                    });
                                                                    setModalPagamento(null);
                                                                    alert('✅ Pagamento desfeito! Item voltou para PENDENTE.');
                                                                }
                                                            }}
                                                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                                                        >
                                                            🔄 Desfazer Pagamento
                                                        </button>
                                                        <div className="text-xs text-center text-gray-500 mt-2">
                                                            ⚠️ Esta ação voltará o item para PENDENTE
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <button
                                            onClick={() => setModalPagamento(null)}
                                            className="w-full px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            };

            return (
                <div className="min-h-screen" style={{ background: '#f0f2f8' }}>
                    {/* Header Escuro Profissional */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #0f3460 100%)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                        position: 'sticky', top: 0, zIndex: 20,
                        borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div className="max-w-7xl mx-auto px-3 md:px-4" style={{padding:'10px 16px'}}>
                            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
                                {/* Seletor de ano */}
                                <div className="order-2 md:order-1">
                                    <select 
                                        value={anoAtual} 
                                        onChange={(e) => setAnoAtual(parseInt(e.target.value))}
                                        style={{
                                            padding:'6px 12px', borderRadius:'8px',
                                            border:'1px solid rgba(99,102,241,0.5)',
                                            background:'rgba(255,255,255,0.08)',
                                            color:'#fff', fontSize:'0.875rem',
                                            fontWeight:'600', cursor:'pointer', minWidth:'90px'
                                        }}
                                    >
                                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(ano => (
                                            <option key={ano} value={ano} style={{background:'#1a1a4e'}}>{ano}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Logo centralizado */}
                                <div className="order-1 md:order-2 flex justify-center items-center" style={{gap:'10px'}}>
                                    <div style={{
                                        width:'32px', height:'32px', borderRadius:'8px',
                                        background:'linear-gradient(135deg, #6366f1, #10b981)',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        fontSize:'16px', flexShrink:0
                                    <img 
                                        src="data:image/png;base64,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yHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzg5jzgDIcx5wcx5wBkOY84OY84AyHMecHMecAZDmPODmPOAMhzHnBzHnAGQ5jzhxuTHYq748JBiZ4D/2Q=="
                                        alt="Estratégia Finanças"
                                        style={maxHeight:'40px', width:'auto', objectFit:'contain'}
                                    />
                                </div>
                                {/* ÁREA DO USUÁRIO - DIREITA */}
                                {(() => {
                                    const [userMenuAberto, setUserMenuAberto] = React.useState(false);
                                    const userMenuRef = React.useRef(null);
                                    
                                    React.useEffect(() => {
                                        const handle = (e) => {
                                            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuAberto(false);
                                        };
                                        document.addEventListener('mousedown', handle);
                                        return () => document.removeEventListener('mousedown', handle);
                                    }, []);
                                    
                                    const nomeUsuario = user.displayName || user.email?.split('@')[0] || 'Usuário';
                                    const inicialUsuario = nomeUsuario.charAt(0).toUpperCase();
                                    
                                    return (
                                        <div ref={userMenuRef} style={{position:'relative', flexShrink:0}}>
                                            {/* Botão do usuário */}
                                            <button
                                                onClick={() => setUserMenuAberto(!userMenuAberto)}
                                                style={{
                                                    display:'flex', alignItems:'center', gap:'8px',
                                                    padding:'6px 12px', borderRadius:'8px',
                                                    background: userMenuAberto ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
                                                    border:'1px solid rgba(255,255,255,0.15)',
                                                    cursor:'pointer', color:'#fff',
                                                    transition:'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width:'28px', height:'28px', borderRadius:'50%',
                                                    background:'linear-gradient(135deg, #f97316, #ea580c)',
                                                    display:'flex', alignItems:'center', justifyContent:'center',
                                                    fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0
                                                }}>{inicialUsuario}</div>
                                                <span style={{fontSize:'0.85rem', fontWeight:'600', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                                                    {nomeUsuario}
                                                </span>
                                                {isUserAdmin && (
                                                    <span style={{fontSize:'9px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', padding:'1px 5px', borderRadius:'3px', fontWeight:'700'}}>
                                                        ADMIN
                                                    </span>
                                                )}
                                                <span style={{fontSize:'10px', opacity:0.7}}>{userMenuAberto ? '▲' : '▼'}</span>
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {userMenuAberto && (
                                                <div style={{
                                                    position:'absolute', top:'calc(100% + 8px)', right:0,
                                                    background:'#fff', borderRadius:'14px', minWidth:'240px',
                                                    boxShadow:'0 12px 40px rgba(0,0,0,0.2)', zIndex:100,
                                                    border:'1px solid #e2e8f0', overflow:'hidden'
                                                }}>
                                                    {/* Info do usuário */}
                                                    <div style={{padding:'16px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'12px'}}>
                                                        <div style={{
                                                            width:'44px', height:'44px', borderRadius:'50%',
                                                            background:'linear-gradient(135deg, #f97316, #ea580c)',
                                                            display:'flex', alignItems:'center', justifyContent:'center',
                                                            fontSize:'18px', fontWeight:'700', color:'#fff', flexShrink:0
                                                        }}>{inicialUsuario}</div>
                                                        <div>
                                                            <div style={{fontWeight:'700', fontSize:'0.92rem', color:'#1e293b'}}>{nomeUsuario}</div>
                                                            <div style={{fontSize:'0.75rem', color:'#64748b'}}>{user.email}</div>
                                                            {salvando && <div style={{fontSize:'0.7rem', color:'#f59e0b', marginTop:'2px'}}>⏳ Salvando...</div>}
                                                            {!salvando && ultimoSave && <div style={{fontSize:'0.7rem', color:'#10b981', marginTop:'2px'}}>✅ Salvo</div>}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Opções */}
                                                    <div style={{padding:'8px'}}>
                                                        <button onClick={() => { fazerBackup(); setUserMenuAberto(false); }} style={{
                                                            width:'100%', textAlign:'left', padding:'10px 12px',
                                                            borderRadius:'8px', border:'none', cursor:'pointer',
                                                            fontSize:'0.85rem', color:'#374151', background:'transparent',
                                                            display:'flex', alignItems:'center', gap:'10px',
                                                            transition:'background 0.15s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                                        >
                                                            <span style={{fontSize:'16px'}}>💾</span>
                                                            <span>Baixar backup</span>
                                                        </button>
                                                        <button onClick={() => { restaurarBackup(); setUserMenuAberto(false); }} style={{
                                                            width:'100%', textAlign:'left', padding:'10px 12px',
                                                            borderRadius:'8px', border:'none', cursor:'pointer',
                                                            fontSize:'0.85rem', color:'#374151', background:'transparent',
                                                            display:'flex', alignItems:'center', gap:'10px',
                                                            transition:'background 0.15s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                                        >
                                                            <span style={{fontSize:'16px'}}>📥</span>
                                                            <span>Restaurar backup</span>
                                                        </button>
                                                        <button onClick={() => { if (confirm('⚠️ Isso vai APAGAR todos os dados locais. Confirma?')) { localStorage.clear(); window.location.reload(); } setUserMenuAberto(false); }} style={{
                                                            width:'100%', textAlign:'left', padding:'10px 12px',
                                                            borderRadius:'8px', border:'none', cursor:'pointer',
                                                            fontSize:'0.85rem', color:'#ef4444', background:'transparent',
                                                            display:'flex', alignItems:'center', gap:'10px',
                                                            transition:'background 0.15s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background='#fff5f5'}
                                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                                        >
                                                            <span style={{fontSize:'16px'}}>🔄</span>
                                                            <span>Resetar dados locais</span>
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Linha separadora */}
                                                    <div style={{borderTop:'1px solid #f1f5f9', padding:'8px'}}>
                                                        <div style={{padding:'8px 12px', fontSize:'0.75rem', color:'#94a3b8', fontStyle:'italic'}}>
                                                            Logado como: {user.email}
                                                        </div>
                                                        <button onClick={() => { if (confirm('Deseja sair da sua conta?')) { firebase.auth().signOut(); } }} style={{
                                                            width:'100%', textAlign:'left', padding:'10px 12px',
                                                            borderRadius:'8px', border:'none', cursor:'pointer',
                                                            fontSize:'0.85rem', color:'#ef4444', background:'transparent',
                                                            display:'flex', alignItems:'center', gap:'10px',
                                                            fontWeight:'600',
                                                            transition:'background 0.15s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background='#fff5f5'}
                                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                                        >
                                                            <span style={{fontSize:'16px'}}>⏻</span>
                                                            <span>Sair da conta</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* BANNER DE TRIAL */}
                    {!isUserAdmin && planoInfo.plano === 'trial' && !planoInfo.expirado && planoInfo.diasRestantes <= 30 && (
                        <div className={`text-center py-2 px-4 text-sm font-semibold ${planoInfo.diasRestantes <= 7 ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                            {planoInfo.diasRestantes <= 7 
                                ? `🚨 Seu trial vence em ${planoInfo.diasRestantes} dia(s)! Assine agora para não perder o acesso.`
                                : `⏳ Período de teste: ${planoInfo.diasRestantes} dias restantes. Aproveite o sistema completo gratuitamente!`
                            }
                            {' '}
                            <a href="mailto:contato@seusite.com.br?subject=Quero assinar o Sistema Financeiro" 
                               className="underline font-bold hover:opacity-80">
                                Assinar por R$ 29,90/mês →
                            </a>
                        </div>
                    )}

                    {/* TELA DE TRIAL EXPIRADO - BLOQUEIA O RESTO */}
                    {!isUserAdmin && planoInfo.plano === 'trial' && planoInfo.expirado && (
                        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F9FAFB' }}>
                            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                                <div className="text-6xl mb-4">⏰</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu período de teste encerrou!</h2>
                                <p className="text-gray-600 mb-6">
                                    Seus 2 meses gratuitos chegaram ao fim. Assine agora para continuar acessando todos os seus dados e funcionalidades.
                                </p>
                                
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                                    <div className="text-sm opacity-90 mb-1">Plano Completo</div>
                                    <div className="text-4xl font-bold mb-1">R$ 29,90</div>
                                    <div className="text-sm opacity-90">por mês • Cancele quando quiser</div>
                                </div>

                                <div className="text-left space-y-2 mb-6">
                                    {['✅ Acesso completo a todas as funcionalidades', '✅ Dados salvos na nuvem com segurança', '✅ Relatórios e exportação PDF/Excel', '✅ Simulador de compras', '✅ Planejamento e metas financeiras', '✅ Suporte por email'].map((item, i) => (
                                        <div key={i} className="text-sm text-gray-700">{item}</div>
                                    ))}
                                </div>

                                <a 
                                    href="mailto:contato@seusite.com.br?subject=Quero assinar o Sistema Financeiro - R$ 29,90/mês"
                                    style={{display:"block", width:"100%", padding:"14px", background:"linear-gradient(135deg, #6366f1, #10b981)", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"700", fontSize:"1.05rem", cursor:"pointer", boxShadow:"0 4px 20px rgba(99,102,241,0.4)", marginBottom:"12px"}}
                                >
                                    🚀 Assinar Agora - R$ 29,90/mês
                                </a>
                                
                                <button 
                                    onClick={() => firebase.auth().signOut()}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Sair da conta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CONTEÚDO PRINCIPAL - oculto se trial expirou */}
                    <div className="main-content-area" style={{display: (!isUserAdmin && planoInfo.plano === 'trial' && planoInfo.expirado) ? 'none' : 'block'}}>

                    {/* Meses */}
                    <div style={{
                    }} id="meses-container" className="sticky-desktop top-[57px] md:top-[57px] z-10">
                        <div className="max-w-7xl mx-auto px-2 md:px-4" style={{padding:'0'}}>
                            <div style={{display:'flex', gap:'4px', overflowX:'auto', scrollbarWidth:'none'}}>
                                {MESES.map(mes => (
                                    <button 
                                        key={mes} 
                                        onClick={() => setMesAtual(mes)} 
                                        className={`mes-btn${mesAtual === mes ? ' ativo' : ''}`}
                                    >
                                        {mes.charAt(0).toUpperCase() + mes.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MENU PRINCIPAL - NO LUGAR DO HEADER */}
                    <div style={{
                        background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
                        borderBottom: '1px solid rgba(99,102,241,0.3)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
                    }} className="sticky-desktop top-[57px] md:top-[57px] z-10">
                        <div className="max-w-7xl mx-auto px-2 md:px-4 py-2">
                            <MenuNavegacao telaAtiva={telaAtiva} setTelaAtiva={setTelaAtiva} isUserAdmin={isUserAdmin} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 main-content animate-in">
                        {React.useMemo(() => {
                            if (telaAtiva !== 'dashboard') return null;
                            return <Dashboard key={`${mesAtual}-${anoAtual}`} />;
                        }, [telaAtiva === 'dashboard', mesAtual, anoAtual])}
                        {telaAtiva === 'admin' && <TelaAdmin isUserAdmin={isUserAdmin} />}
                        {telaAtiva.startsWith('planejamento') && <TelaPlanejamento />}
                        {telaAtiva === 'receitas' && <TelaReceitas />}
                        {telaAtiva === 'cartoes' && <TelaCartoes key={JSON.stringify(farol)} />}
                        {telaAtiva === 'fixos' && <TelaGastosFixos />}
                        {telaAtiva === 'variaveis' && <TelaGastosVariaveis />}
                        {telaAtiva === 'extras' && <TelaGastosExtras />}
                        {telaAtiva === 'farol' && <TelaFarol />}
                    </div>

                    {/* Modal de Edição Universal */}
                    {modalAberto === 'editar' && itemEditando && (
                        <Modal 
                            titulo={`✏️ Editar ${
                                tipoEditando === 'receita' ? 'Receita' :
                                tipoEditando === 'cartao' ? 'Cartão' :
                                tipoEditando === 'fixo' ? 'Gasto Fixo' :
                                'Gasto Variável'
                            }`} 
                            onClose={() => {
                                setModalAberto(null);
                                setItemEditando(null);
                                setTipoEditando(null);
                            }}
                        >
                            <FormEdicao 
                                item={itemEditando}
                                tipo={tipoEditando}
                                onSalvar={(dadosAtualizados) => {
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
                                }}
                            />
                        </Modal>
                    )}

                    {/* Modals */}
                    {/* Modal Nova Dívida */}
                    {modalAberto === 'novaDivida' && (
                        <Modal titulo="💳 Nova Dívida" onClose={() => setModalAberto(null)}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Dívida</label>
                                    <input 
                                        type="text" 
                                        id="dividaNome"
                                        placeholder="Ex: Cartão Nubank"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Total</label>
                                        <input 
                                            type="number" 
                                            id="dividaValorTotal"
                                            step="0.01"
                                            placeholder="5000.00"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Saldo Devedor Atual</label>
                                        <input 
                                            type="number" 
                                            id="dividaSaldoDevedor"
                                            step="0.01"
                                            placeholder="3500.00"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Taxa de Juros (% ao mês)</label>
                                        <input 
                                            type="number" 
                                            id="dividaTaxaJuros"
                                            step="0.01"
                                            placeholder="12.5"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Parcela Mínima</label>
                                        <input 
                                            type="number" 
                                            id="dividaParcelaMinima"
                                            step="0.01"
                                            placeholder="350.00"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dia do Vencimento</label>
                                    <input 
                                        type="number" 
                                        id="dividaVencimento"
                                        min="1"
                                        max="31"
                                        placeholder="10"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <button 
                                    onClick={() => {
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
                                    }}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                >
                                    ✅ Cadastrar Dívida
                                </button>
                            </div>
                        </Modal>
                    )}

                    {/* Modal Nova Meta */}
                    {/* Modal Gerenciar Categorias */}
                    {modalAberto === 'gerenciarCategorias' && (
                        <Modal titulo="🏷️ Gerenciar Categorias" onClose={() => setModalAberto(null)}>
                            <div className="space-y-6">
                                {/* Gastos Fixos */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">🏠 Gastos Fixos</h3>
                                    <div className="bg-purple-50 rounded-lg p-4 mb-3">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Categorias Padrão:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['MORADIA', 'ESTUDO', 'TRANSPORTE', 'SERVIÇOS', 'SAÚDE'].map(cat => (
                                                <span key={cat} className="px-3 py-1 bg-white border-2 border-purple-300 rounded-lg text-sm font-semibold text-gray-700">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Suas Categorias Personalizadas:</div>
                                        {categoriasPersonalizadas.gastosFixos.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">Nenhuma categoria personalizada ainda</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {categoriasPersonalizadas.gastosFixos.map(cat => (
                                                    <div key={cat} className="flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-lg">
                                                        <span className="text-sm font-semibold text-purple-700">{cat}</span>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Excluir categoria "${cat}"?`)) {
                                                                    setCategoriasPersonalizadas({
                                                                        ...categoriasPersonalizadas,
                                                                        gastosFixos: categoriasPersonalizadas.gastosFixos.filter(c => c !== cat)
                                                                    });
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-700 text-xs"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gastos Variáveis */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Gastos Variáveis</h3>
                                    <div className="bg-orange-50 rounded-lg p-4 mb-3">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Categorias Padrão:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['MERCADO', 'FARMÁCIA', 'ALIMENTAÇÃO', 'TRANSPORTE', 'GASOLINA', 'LAZER'].map(cat => (
                                                <span key={cat} className="px-3 py-1 bg-white border-2 border-orange-300 rounded-lg text-sm font-semibold text-gray-700">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border-2 border-orange-200 p-4">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Suas Categorias Personalizadas:</div>
                                        {categoriasPersonalizadas.gastosVariaveis.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">Nenhuma categoria personalizada ainda</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {categoriasPersonalizadas.gastosVariaveis.map(cat => (
                                                    <div key={cat} className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-lg">
                                                        <span className="text-sm font-semibold text-orange-700">{cat}</span>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Excluir categoria "${cat}"?`)) {
                                                                    setCategoriasPersonalizadas({
                                                                        ...categoriasPersonalizadas,
                                                                        gastosVariaveis: categoriasPersonalizadas.gastosVariaveis.filter(c => c !== cat)
                                                                    });
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-700 text-xs"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gastos Extras */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">⚡ Gastos Extras</h3>
                                    <div className="bg-amber-50 rounded-lg p-4 mb-3">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Categorias Padrão:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['VIAGEM', 'PRESENTE', 'EMERGÊNCIA', 'MÉDICO', 'VETERINÁRIO', 'MANUTENÇÃO', 'REFORMA', 'FESTA'].map(cat => (
                                                <span key={cat} className="px-3 py-1 bg-white border-2 border-amber-300 rounded-lg text-sm font-semibold text-gray-700">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border-2 border-amber-200 p-4">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Suas Categorias Personalizadas:</div>
                                        {(!categoriasPersonalizadas.gastosExtras || categoriasPersonalizadas.gastosExtras.length === 0) ? (
                                            <p className="text-sm text-gray-500 italic">Nenhuma categoria personalizada ainda</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {categoriasPersonalizadas.gastosExtras.map(cat => (
                                                    <div key={cat} className="flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-lg">
                                                        <span className="text-sm font-semibold text-amber-700">{cat}</span>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Excluir categoria "${cat}"?`)) {
                                                                    setCategoriasPersonalizadas({
                                                                        ...categoriasPersonalizadas,
                                                                        gastosExtras: categoriasPersonalizadas.gastosExtras.filter(c => c !== cat)
                                                                    });
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-700 text-xs"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                    <div className="text-sm text-blue-800">
                                        💡 <strong>Dica:</strong> Para criar novas categorias, clique em "➕ Novo Gasto" e escolha "Criar nova categoria"
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {modalAberto === 'novaMeta' && (
                        <Modal titulo="🎯 Nova Meta Financeira" onClose={() => setModalAberto(null)}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Meta</label>
                                    <input 
                                        type="text" 
                                        id="metaTitulo"
                                        placeholder="Ex: Reserva de Emergência"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor da Meta (R$)</label>
                                    <input 
                                        type="number" 
                                        id="metaValor"
                                        step="0.01"
                                        placeholder="50000.00"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo</label>
                                        <select 
                                            id="metaPrazo"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                            onChange={(e) => {
                                                const prazo = e.target.value;
                                                const meses = prazo === 'curto' ? 12 : prazo === 'medio' ? 60 : 120;
                                                const hoje = new Date();
                                                const dataFutura = new Date(hoje.setMonth(hoje.getMonth() + meses));
                                                const inputData = document.getElementById('metaData');
                                                if (inputData) {
                                                    inputData.value = dataFutura.toISOString().split('T')[0];
                                                }
                                            }}
                                        >
                                            <option value="curto">⚡ Curto (até 1 ano)</option>
                                            <option value="medio">📅 Médio (1-5 anos)</option>
                                            <option value="longo">🏆 Longo (5+ anos)</option>
                                        </select>
                                        <div className="text-xs text-gray-500 mt-1">
                                            A data meta será ajustada automaticamente
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                                        <select 
                                            id="metaCategoria"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                        >
                                            <option value="reserva">🆘 Reserva Emergência</option>
                                            <option value="viagem">✈️ Viagem</option>
                                            <option value="investimento">💰 Investimento</option>
                                            <option value="compra">🛒 Compra</option>
                                            <option value="outros">📦 Outros</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade</label>
                                        <select 
                                            id="metaPrioridade"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ Muito Alta</option>
                                            <option value="4">⭐⭐⭐⭐ Alta</option>
                                            <option value="3" selected>⭐⭐⭐ Média</option>
                                            <option value="2">⭐⭐ Baixa</option>
                                            <option value="1">⭐ Muito Baixa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Data Meta</label>
                                        <input 
                                            type="date" 
                                            id="metaData"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                                            required
                                            defaultValue={(() => {
                                                const hoje = new Date();
                                                const prazoInput = document.getElementById('metaPrazo');
                                                const prazo = prazoInput ? prazoInput.value : 'curto';
                                                const meses = prazo === 'curto' ? 12 : prazo === 'medio' ? 60 : 120;
                                                const dataFutura = new Date(hoje.setMonth(hoje.getMonth() + meses));
                                                return dataFutura.toISOString().split('T')[0];
                                            })()}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            ⚠️ Campo obrigatório - ajuste conforme necessário
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
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
                                    }}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    ✅ Criar Meta
                                </button>
                            </div>
                        </Modal>
                    )}

                    {/* Modal Novo Cartão */}
                    {modalAberto === 'novoCartao' && (
                        <Modal titulo="➕ Novo Cartão" onClose={() => setModalAberto(null)}>
                            <FormNovoCartao />
                        </Modal>
                    )}
                    {modalAberto === 'novoGastoFixo' && (
                        <Modal titulo="➕ Novo Gasto Fixo" onClose={() => setModalAberto(null)}>
                            <FormNovoGastoFixo />
                        </Modal>
                    )}
                    {modalAberto === 'novoGastoVariavel' && (
                        <Modal titulo="➕ Novo Gasto Variável" onClose={() => setModalAberto(null)}>
                            <FormNovoGastoVariavel />
                        </Modal>
                    )}
                    {modalAberto === 'novoGastoExtra' && (
                        <Modal titulo="➕ Novo Gasto Extra" onClose={() => setModalAberto(null)}>
                            <FormNovoGastoExtra />
                        </Modal>
                    )}
                    {modalAberto === 'metas' && (
                        <Modal titulo="🎯 Definir Metas" onClose={() => setModalAberto(null)}>
                            <FormMetas />
                        </Modal>
                    )}
                    {modalAberto === 'orcamento' && (
                        <Modal titulo="⚙️ Definir Orçamento" onClose={() => setModalAberto(null)}>
                            <FormOrcamento />
                        </Modal>
                    )}
                    {modalAberto === 'novoPlanejado' && (
                        <Modal titulo="➕ Adicionar Planejado" onClose={() => setModalAberto(null)}>
                            <FormPlanejado />
                        </Modal>
                    )}
                    {modalAberto === 'novaReceita' && (
                        <Modal titulo="➕ Nova Receita" onClose={() => setModalAberto(null)}>
                            <FormNovaReceita />
                        </Modal>
                    )}
                    {modalAberto === 'compraParcelada' && (
                        <Modal titulo="🛒 Nova Compra Parcelada" onClose={() => setModalAberto(null)}>
                            <FormCompraParcelada />
                        </Modal>
                    )}
                    </div> {/* fim conteudo principal */}
                </div>
            );
        }

        ReactDOM.render(<AuthWrapper />, document.getElementById('root'));
