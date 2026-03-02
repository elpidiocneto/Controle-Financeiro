function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect;

// Firebase já foi inicializado no firebase-config.js
// Usando db global do window

var DADOS_INICIAIS = {
  // Novos usuários começam com dados completamente vazios.
  // Cartões e gastos são cadastrados pelo próprio usuário.
  gastosFixos: [],
  cartoes: []
};
var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Modal genérico de input (substitui prompt() nativo)
function InputDialog(_ref) {
  var titulo = _ref.titulo,
    label = _ref.label,
    _ref$valorPadrao = _ref.valorPadrao,
    valorPadrao = _ref$valorPadrao === void 0 ? '' : _ref$valorPadrao,
    onConfirm = _ref.onConfirm,
    onCancel = _ref.onCancel;
  var _useState = useState(valorPadrao),
    _useState2 = _slicedToArray(_useState, 2),
    valor = _useState2[0],
    setValor = _useState2[1];
  var handleConfirm = function handleConfirm() {
    return onConfirm(valor);
  };
  var handleKeyDown = function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onCancel();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      width: '100%',
      maxWidth: '380px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 0.75rem',
      fontSize: '1.05rem',
      fontWeight: '700',
      color: '#1e1b4b'
    }
  }, titulo), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 0.75rem',
      fontSize: '0.9rem',
      color: '#4b5563'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: valor,
    onChange: function onChange(e) {
      return setValor(e.target.value);
    },
    onKeyDown: handleKeyDown,
    autoFocus: true,
    style: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1.5px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1rem',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      padding: '0.5rem 1.1rem',
      border: '1.5px solid #d1d5db',
      borderRadius: '8px',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '0.9rem',
      color: '#6b7280'
    }
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: handleConfirm,
    style: {
      padding: '0.5rem 1.25rem',
      border: 'none',
      borderRadius: '8px',
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '700'
    }
  }, "Confirmar"))));
}

// COMPONENTE DE AUTENTICAÇÃO
function AuthWrapper() {
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    user = _useState4[0],
    setUser = _useState4[1];
  var _useState5 = useState(true),
    _useState6 = _slicedToArray(_useState5, 2),
    loading = _useState6[0],
    setLoading = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    registering = _useState8[0],
    setRegistering = _useState8[1];
  var _useState9 = useState('login'),
    _useState0 = _slicedToArray(_useState9, 2),
    authMode = _useState0[0],
    setAuthMode = _useState0[1];
  var _useState1 = useState(''),
    _useState10 = _slicedToArray(_useState1, 2),
    email = _useState10[0],
    setEmail = _useState10[1];
  var _useState11 = useState(''),
    _useState12 = _slicedToArray(_useState11, 2),
    password = _useState12[0],
    setPassword = _useState12[1];
  var _useState13 = useState(''),
    _useState14 = _slicedToArray(_useState13, 2),
    nome = _useState14[0],
    setNome = _useState14[1];
  var _useState15 = useState(''),
    _useState16 = _slicedToArray(_useState15, 2),
    error = _useState16[0],
    setError = _useState16[1];
  var _useState17 = useState(false),
    _useState18 = _slicedToArray(_useState17, 2),
    reenviarModal = _useState18[0],
    setReenviarModal = _useState18[1];
  var _useState19 = useState(''),
    _useState20 = _slicedToArray(_useState19, 2),
    reenviarEmail = _useState20[0],
    setReenviarEmail = _useState20[1];
  var _useState21 = useState(''),
    _useState22 = _slicedToArray(_useState21, 2),
    reenviarSenha = _useState22[0],
    setReenviarSenha = _useState22[1];
  useEffect(function () {
    var unsubscribe = firebase.auth().onAuthStateChanged(/*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(user) {
        var isUserAdmin, userDoc, userData, _userDoc, _userData, uidAnterior, uidMudou, keysToRemove, backupDoc, dadosBackup, _t, _t2, _t3;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              if (!registering) {
                _context.n = 1;
                break;
              }
              return _context.a(2);
            case 1:
              if (!(user && db)) {
                _context.n = 22;
                break;
              }
              // Primeiro verificar se é admin ANTES de bloquear por email
              isUserAdmin = false;
              _context.p = 2;
              _context.n = 3;
              return db.collection('usuarios').doc(user.uid).get();
            case 3:
              userDoc = _context.v;
              if (userDoc.exists) {
                userData = userDoc.data();
                isUserAdmin = userData.isAdmin === true;
              }
              _context.n = 5;
              break;
            case 4:
              _context.p = 4;
              _t = _context.v;
              console.error('Erro ao verificar admin:', _t);
            case 5:
              if (!(!user.emailVerified && !isUserAdmin)) {
                _context.n = 7;
                break;
              }
              _context.n = 6;
              return firebase.auth().signOut();
            case 6:
              alert('📧 Email não verificado!\n\n⚠️ Você precisa confirmar seu email antes de fazer login.\n\nVerifique sua caixa de entrada (e spam) e clique no link de verificação.\n\n💡 Não recebeu? Tente fazer login novamente para reenviar o email.');
              setUser(null);
              setLoading(false);
              return _context.a(2);
            case 7:
              _context.p = 7;
              _context.n = 8;
              return db.collection('usuarios').doc(user.uid).get();
            case 8:
              _userDoc = _context.v;
              if (_userDoc.exists) {
                _context.n = 11;
                break;
              }
              console.log('⚠️ Usuário não existe no Firestore. Criando como PENDENTE...');
              _context.n = 9;
              return db.collection('usuarios').doc(user.uid).set({
                nome: user.displayName || '',
                email: user.email,
                isAdmin: false,
                status: 'PENDENTE',
                emailVerificado: user.emailVerified,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
              });
            case 9:
              _context.n = 10;
              return firebase.auth().signOut();
            case 10:
              alert('⏳ Sua conta foi criada e está aguardando aprovação do administrador.\n\nPor favor, aguarde a liberação do seu acesso.');
              setUser(null);
              setLoading(false);
              return _context.a(2);
            case 11:
              _userData = _userDoc.data(); // Atualizar status de email verificado no Firestore
              if (!(user.emailVerified && !_userData.emailVerificado)) {
                _context.n = 12;
                break;
              }
              _context.n = 12;
              return db.collection('usuarios').doc(user.uid).update({
                emailVerificado: true
              });
            case 12:
              if (_userData.isAdmin) {
                _context.n = 19;
                break;
              }
              if (!(_userData.status === 'PENDENTE')) {
                _context.n = 14;
                break;
              }
              _context.n = 13;
              return firebase.auth().signOut();
            case 13:
              alert('⏳ Sua conta ainda está aguardando aprovação do administrador.\n\nPor favor, aguarde a liberação do seu acesso.');
              setUser(null);
              setLoading(false);
              return _context.a(2);
            case 14:
              if (!(_userData.status === 'REJEITADO')) {
                _context.n = 16;
                break;
              }
              _context.n = 15;
              return firebase.auth().signOut();
            case 15:
              alert('❌ Sua solicitação de cadastro foi rejeitada.\n\nEntre em contato com o administrador para mais informações.');
              setUser(null);
              setLoading(false);
              return _context.a(2);
            case 16:
              if (!(_userData.status !== 'APROVADO')) {
                _context.n = 19;
                break;
              }
              _context.n = 17;
              return db.collection('usuarios').doc(user.uid).update({
                status: 'PENDENTE'
              });
            case 17:
              _context.n = 18;
              return firebase.auth().signOut();
            case 18:
              alert('⏳ Sua conta precisa ser aprovada pelo administrador.\n\nPor favor, aguarde a liberação do seu acesso.');
              setUser(null);
              setLoading(false);
              return _context.a(2);
            case 19:
              _context.n = 22;
              break;
            case 20:
              _context.p = 20;
              _t2 = _context.v;
              console.error('Erro ao verificar status:', _t2);
              // Em caso de erro, bloquear acesso por segurança
              _context.n = 21;
              return firebase.auth().signOut();
            case 21:
              alert('❌ Erro ao verificar suas permissões.\n\nTente novamente mais tarde.');
              setUser(null);
              setLoading(false);
              return _context.a(2);
            case 22:
              if (!user) {
                _context.n = 27;
                break;
              }
              uidAnterior = localStorage.getItem('_currentUserId');
              uidMudou = uidAnterior && uidAnterior !== user.uid; // Sempre sincroniza: garante dados atualizados em multi-dispositivo e após limpeza de cache
              if (!true) {
                _context.n = 27;
                break;
              }
              _context.p = 23;
              // 1. Limpar TODOS os dados do localStorage
              keysToRemove = ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'farol', 'metas', 'metasFinanceiras', 'orcamento', 'orcamentosMensais', 'orcamentoAnual', 'planejadosMes', 'comprasParceladas', 'dividas', 'reservaEmergencia', 'categoriasPersonalizadas', 'anoAtual', 'mesAtual'];
              keysToRemove.forEach(function (key) {
                return localStorage.removeItem(key);
              });

              // 2. Carregar dados do Firestore do usuário atual
              _context.n = 24;
              return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
            case 24:
              backupDoc = _context.v;
              if (backupDoc.exists) {
                dadosBackup = backupDoc.data().dados || {};
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
              if (!uidMudou) {
                _context.n = 25;
                break;
              }
              console.log('🔄 Troca de conta detectada, recarregando...');
              window.location.reload();
              return _context.a(2);
            case 25:
              _context.n = 27;
              break;
            case 26:
              _context.p = 26;
              _t3 = _context.v;
              console.error('Erro ao isolar dados do usuário:', _t3);
            case 27:
              setUser(user);
              setLoading(false);
            case 28:
              return _context.a(2);
          }
        }, _callee, null, [[23, 26], [7, 20], [2, 4]]);
      }));
      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
    return function () {
      return unsubscribe();
    };
  }, [registering]);
  var handleLogin = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(e) {
      var userCredential, messages, _t4;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            e.preventDefault();
            setError('');
            _context2.p = 1;
            _context2.n = 2;
            return firebase.auth().signInWithEmailAndPassword(email, password);
          case 2:
            userCredential = _context2.v;
            _context2.n = 3;
            return db.collection('usuarios').doc(userCredential.user.uid).update({
              ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(function () {
              // Se não existir, criar
              db.collection('usuarios').doc(userCredential.user.uid).set({
                nome: userCredential.user.displayName || '',
                email: userCredential.user.email,
                isAdmin: false,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
              });
            });
          case 3:
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t4 = _context2.v;
            messages = {
              'auth/user-not-found': 'Usuário não encontrado',
              'auth/wrong-password': 'Senha incorreta',
              'auth/invalid-email': 'Email inválido'
            };
            setError(messages[_t4.code] || 'Erro ao fazer login');
          case 5:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 4]]);
    }));
    return function handleLogin(_x2) {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleRegister = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(e) {
      var userCredential, agora, fimTrial, messages, _t5;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            e.preventDefault();
            setError('');
            setRegistering(true); // Bloquear onAuthStateChanged
            _context3.p = 1;
            _context3.n = 2;
            return firebase.auth().createUserWithEmailAndPassword(email, password);
          case 2:
            userCredential = _context3.v;
            _context3.n = 3;
            return userCredential.user.updateProfile({
              displayName: nome
            });
          case 3:
            // 2. Criar documento no Firestore com dados de trial
            agora = new Date();
            fimTrial = new Date(agora);
            fimTrial.setDate(fimTrial.getDate() + 60); // 60 dias = 2 meses
            _context3.n = 4;
            return db.collection('usuarios').doc(userCredential.user.uid).set({
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
          case 4:
            console.log('✅ Usuário salvo no Firestore');

            // 3. Enviar email de verificação
            _context3.n = 5;
            return userCredential.user.sendEmailVerification({
              url: window.location.href,
              handleCodeInApp: false
            });
          case 5:
            console.log('✅ Email de verificação enviado');

            // 4. Aguardar um pouco para garantir que tudo foi processado
            _context3.n = 6;
            return new Promise(function (resolve) {
              return setTimeout(resolve, 1000);
            });
          case 6:
            _context3.n = 7;
            return firebase.auth().signOut();
          case 7:
            console.log('✅ Logout realizado');

            // 6. Resetar estados
            setRegistering(false);
            setEmail('');
            setPassword('');
            setNome('');
            setAuthMode('login');

            // 7. Mostrar mensagem de sucesso
            alert('✅ Cadastro realizado com sucesso!\n\n📧 Enviamos um email de verificação para: ' + email + '\n\n⚠️ IMPORTANTE:\n1. Verifique sua caixa de entrada (e spam)\n2. Clique no link do email para confirmar\n3. Depois aguarde aprovação do administrador\n\nSem a verificação do email, você não poderá fazer login!');
            _context3.n = 9;
            break;
          case 8:
            _context3.p = 8;
            _t5 = _context3.v;
            setRegistering(false);
            messages = {
              'auth/email-already-in-use': 'Email já cadastrado',
              'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
              'auth/invalid-email': 'Email inválido'
            };
            setError(messages[_t5.code] || 'Erro ao cadastrar: ' + _t5.message);
            console.error('Erro no cadastro:', _t5);
          case 9:
            return _context3.a(2);
        }
      }, _callee3, null, [[1, 8]]);
    }));
    return function handleRegister(_x3) {
      return _ref4.apply(this, arguments);
    };
  }();
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
    }, ['login', 'register'].map(function (mode) {
      return /*#__PURE__*/React.createElement("button", {
        key: mode,
        onClick: function onClick() {
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
      }, mode === 'login' ? 'Entrar' : 'Criar Conta');
    })), authMode === 'register' && /*#__PURE__*/React.createElement("div", {
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
      onChange: function onChange(e) {
        return setNome(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setEmail(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setPassword(e.target.value);
      },
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
      onClick: function onClick() {
        setReenviarEmail('');
        setReenviarSenha('');
        setReenviarModal(true);
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
    }, ['🔒 SSL Seguro', '☁️ Nuvem', '🇧🇷 Brasil'].map(function (item, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.75rem'
        }
      }, item);
    }))), reenviarModal && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: '16px',
        padding: '1.75rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 1rem',
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#1e1b4b'
      }
    }, "\uD83D\uDCE7 Reenviar Email de Verifica\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '0.75rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'block',
        fontSize: '0.85rem',
        color: '#4b5563',
        marginBottom: '0.3rem'
      }
    }, "Email"), /*#__PURE__*/React.createElement("input", {
      type: "email",
      value: reenviarEmail,
      onChange: function onChange(e) {
        return setReenviarEmail(e.target.value);
      },
      placeholder: "seu@email.com",
      style: {
        width: '100%',
        padding: '0.6rem 0.75rem',
        border: '1.5px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        boxSizing: 'border-box'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '1rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'block',
        fontSize: '0.85rem',
        color: '#4b5563',
        marginBottom: '0.3rem'
      }
    }, "Senha"), /*#__PURE__*/React.createElement("input", {
      type: "password",
      value: reenviarSenha,
      onChange: function onChange(e) {
        return setReenviarSenha(e.target.value);
      },
      placeholder: "Sua senha",
      style: {
        width: '100%',
        padding: '0.6rem 0.75rem',
        border: '1.5px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        boxSizing: 'border-box'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setReenviarModal(false);
      },
      style: {
        padding: '0.5rem 1.1rem',
        border: '1.5px solid #d1d5db',
        borderRadius: '8px',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#6b7280'
      }
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      onClick: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
        var userCredential, _t6;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              if (!(!reenviarEmail || !reenviarSenha)) {
                _context4.n = 1;
                break;
              }
              return _context4.a(2);
            case 1:
              _context4.p = 1;
              _context4.n = 2;
              return firebase.auth().signInWithEmailAndPassword(reenviarEmail, reenviarSenha);
            case 2:
              userCredential = _context4.v;
              if (userCredential.user.emailVerified) {
                _context4.n = 5;
                break;
              }
              _context4.n = 3;
              return userCredential.user.sendEmailVerification();
            case 3:
              _context4.n = 4;
              return firebase.auth().signOut();
            case 4:
              setError('✅ Email de verificação reenviado! Verifique sua caixa de entrada.');
              _context4.n = 7;
              break;
            case 5:
              _context4.n = 6;
              return firebase.auth().signOut();
            case 6:
              setError('✅ Email já verificado! Tente fazer login normalmente.');
            case 7:
              _context4.n = 9;
              break;
            case 8:
              _context4.p = 8;
              _t6 = _context4.v;
              setError('❌ Email ou senha incorretos');
            case 9:
              setReenviarModal(false);
            case 10:
              return _context4.a(2);
          }
        }, _callee4, null, [[1, 8]]);
      })),
      style: {
        padding: '0.5rem 1.25rem',
        border: 'none',
        borderRadius: '8px',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '700'
      }
    }, "Enviar")))));
  }
  return /*#__PURE__*/React.createElement(App, {
    user: user
  });
}

// Componente de Formulário de Edição Universal
function FormEdicao(_ref6) {
  var item = _ref6.item,
    tipo = _ref6.tipo,
    onSalvar = _ref6.onSalvar;
  var _useState23 = useState(_objectSpread({}, item)),
    _useState24 = _slicedToArray(_useState23, 2),
    formData = _useState24[0],
    setFormData = _useState24[1];

  // Debug: ver dados iniciais
  console.log('🔍 FormEdicao - item recebido:', item);
  console.log('🔍 FormEdicao - formData inicial:', formData);
  var handleChange = function handleChange(campo, valor) {
    console.log("\uD83D\uDD04 Mudando ".concat(campo, " para:"), valor);
    setFormData(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, campo, valor));
    });
  };
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    console.log('💾 Salvando formData:', formData);

    // Garantir que ano seja número
    var dadosParaSalvar = _objectSpread(_objectSpread({}, formData), {}, {
      ano: parseInt(formData.ano) || new Date().getFullYear(),
      valor: parseFloat(formData.valor)
    });
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
    onChange: function onChange(e) {
      return handleChange(tipo === 'cartao' ? 'nome' : 'descricao', e.target.value);
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: formData.valor || '',
    onChange: function onChange(e) {
      return handleChange('valor', parseFloat(e.target.value));
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Ano"), /*#__PURE__*/React.createElement("select", {
    value: formData.ano || new Date().getFullYear(),
    onChange: function onChange(e) {
      return handleChange('ano', parseInt(e.target.value));
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(function (ano) {
    return /*#__PURE__*/React.createElement("option", {
      key: ano,
      value: ano
    }, ano);
  }))), (tipo === 'cartao' || tipo === 'fixo') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Dia do Vencimento"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "31",
    value: formData.vencimento || '',
    onChange: function onChange(e) {
      return handleChange('vencimento', parseInt(e.target.value));
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    required: true
  })), tipo === 'cartao' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Dia de Fechamento"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "31",
    value: formData.diaFechamento || '',
    onChange: function onChange(e) {
      return handleChange('diaFechamento', parseInt(e.target.value));
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    placeholder: "Padr\xE3o: ".concat((formData.vencimento || 15) - 7)
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "Deixe vazio para 7 dias antes do vencimento")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Limite do Cart\xE3o (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    min: "0",
    value: formData.limite || '',
    onChange: function onChange(e) {
      return handleChange('limite', parseFloat(e.target.value) || 0);
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500",
    placeholder: "Ex: 10000.00"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "Deixe 0 para n\xE3o controlar limite"))), tipo === 'receita' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Categoria"), /*#__PURE__*/React.createElement("select", {
    value: formData.categoria || 'Salário',
    onChange: function onChange(e) {
      return handleChange('categoria', e.target.value);
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, /*#__PURE__*/React.createElement("option", null, "Sal\xE1rio"), /*#__PURE__*/React.createElement("option", null, "Freelance"), /*#__PURE__*/React.createElement("option", null, "Investimentos"), /*#__PURE__*/React.createElement("option", null, "Outros"))), (tipo === 'variavel' || tipo === 'receita' || tipo === 'extra') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "M\xEAs"), /*#__PURE__*/React.createElement("select", {
    value: formData.mes || 'Janeiro',
    onChange: function onChange(e) {
      return handleChange('mes', e.target.value);
    },
    className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
  }, ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(function (mes) {
    return /*#__PURE__*/React.createElement("option", {
      key: mes,
      value: mes
    }, mes);
  }))), (tipo === 'variavel' || tipo === 'extra') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-semibold text-gray-700 mb-2"
  }, "Data do Gasto"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: formData.dataCompleta || '',
    onChange: function onChange(e) {
      var dataInput = e.target.value;
      var dataObj = new Date(dataInput + 'T00:00:00');
      var dataFormatada = dataObj.toLocaleDateString('pt-BR');
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
var MenuNavegacao = window.MenuNavegacao;

// Componente UserMenu (escopo global)
var UserMenu = function UserMenu(_ref7) {
  var _user$email;
  var user = _ref7.user,
    onLogout = _ref7.onLogout;
  var _React$useState = React.useState(false),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    aberto = _React$useState2[0],
    setAberto = _React$useState2[1];
  var ref = React.useRef(null);
  React.useEffect(function () {
    if (!aberto) return;
    var fechar = function fechar() {
      return setAberto(false);
    };
    var timer = setTimeout(function () {
      document.addEventListener('click', fechar, {
        once: true
      });
    }, 0);
    return function () {
      clearTimeout(timer);
      document.removeEventListener('click', fechar);
    };
  }, [aberto]);
  var nome = user.displayName || ((_user$email = user.email) === null || _user$email === void 0 ? void 0 : _user$email.split('@')[0]) || 'Usuário';
  var inicial = nome.charAt(0).toUpperCase();
  var email = user.email || '';
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      setAberto(function (p) {
        return !p;
      });
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
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
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
function App(_ref8) {
  var _inputDialog$valorPad;
  var user = _ref8.user;
  var _useState25 = useState(false),
    _useState26 = _slicedToArray(_useState25, 2),
    salvando = _useState26[0],
    setSalvando = _useState26[1];
  var _useState27 = useState(null),
    _useState28 = _slicedToArray(_useState27, 2),
    ultimoSave = _useState28[0],
    setUltimoSave = _useState28[1];
  var _useState29 = useState(false),
    _useState30 = _slicedToArray(_useState29, 2),
    isUserAdmin = _useState30[0],
    setIsUserAdmin = _useState30[1];
  var _useState31 = useState({
      plano: 'trial',
      diasRestantes: 60,
      expirado: false
    }),
    _useState32 = _slicedToArray(_useState31, 2),
    planoInfo = _useState32[0],
    setPlanoInfo = _useState32[1];
  var _useState33 = useState(function () {
      var saved = localStorage.getItem('anoAtual');
      return saved ? parseInt(saved) : new Date().getFullYear();
    }),
    _useState34 = _slicedToArray(_useState33, 2),
    anoAtual = _useState34[0],
    setAnoAtual = _useState34[1];
  var _useState35 = useState(function () {
      var saved = localStorage.getItem('mesAtual');
      if (saved) return saved;
      var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return meses[new Date().getMonth()];
    }),
    _useState36 = _slicedToArray(_useState35, 2),
    mesAtual = _useState36[0],
    setMesAtual = _useState36[1];
  var _useState37 = useState('dashboard'),
    _useState38 = _slicedToArray(_useState37, 2),
    telaAtiva = _useState38[0],
    setTelaAtiva = _useState38[1];
  var _useState39 = useState(null),
    _useState40 = _slicedToArray(_useState39, 2),
    modalAberto = _useState40[0],
    setModalAberto = _useState40[1];
  var _useState41 = useState(null),
    _useState42 = _slicedToArray(_useState41, 2),
    itemEditando = _useState42[0],
    setItemEditando = _useState42[1];
  var _useState43 = useState(null),
    _useState44 = _slicedToArray(_useState43, 2),
    tipoEditando = _useState44[0],
    setTipoEditando = _useState44[1];
  var _useState45 = useState(null),
    _useState46 = _slicedToArray(_useState45, 2),
    inputDialog = _useState46[0],
    setInputDialog = _useState46[1];
  var _useState47 = useState(function () {
      var saved = localStorage.getItem('gastosFixos');
      return saved ? JSON.parse(saved) : DADOS_INICIAIS.gastosFixos;
    }),
    _useState48 = _slicedToArray(_useState47, 2),
    gastosFixos = _useState48[0],
    setGastosFixos = _useState48[1];
  var _useState49 = useState(function () {
      var saved = localStorage.getItem('cartoes');
      return saved ? JSON.parse(saved) : DADOS_INICIAIS.cartoes;
    }),
    _useState50 = _slicedToArray(_useState49, 2),
    cartoes = _useState50[0],
    setCartoes = _useState50[1];
  var _useState51 = useState(function () {
      var saved = localStorage.getItem('gastosVariaveis');
      var gastos = saved ? JSON.parse(saved) : [];

      // Migração: adicionar dataCompleta para gastos que não têm
      var precisaSalvar = false;
      var gastosMigrados = gastos.map(function (gasto) {
        if (!gasto.dataCompleta) {
          precisaSalvar = true;

          // Tentar diferentes fontes para a data
          var dataGasto;

          // 1. Se já tem data em formato BR, converter
          if (gasto.data && gasto.data.includes('/')) {
            var _gasto$data$split = gasto.data.split('/'),
              _gasto$data$split2 = _slicedToArray(_gasto$data$split, 3),
              dia = _gasto$data$split2[0],
              mes = _gasto$data$split2[1],
              ano = _gasto$data$split2[2];
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
            var anoGasto = gasto.ano || new Date().getFullYear();
            var mesGasto = gasto.mes || 'jan';
            var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            var mesNum = meses.indexOf(mesGasto.toLowerCase());
            dataGasto = new Date(anoGasto, mesNum >= 0 ? mesNum : 0, 1);
            console.log('📅 Fallback mês/ano:', mesGasto, anoGasto, '→', dataGasto.toISOString().split('T')[0]);
          }
          var dataCompletaGerada = dataGasto.toISOString().split('T')[0];
          var dataFormatada = dataGasto.toLocaleDateString('pt-BR');
          console.log('✅ Migrado:', gasto.descricao || 'Sem descrição', '-', dataCompletaGerada);
          return _objectSpread(_objectSpread({}, gasto), {}, {
            dataCompleta: dataCompletaGerada,
            data: dataFormatada
          });
        }
        return gasto;
      });

      // Salvar automaticamente se teve migração
      if (precisaSalvar) {
        console.log('💾 Salvando', gastosMigrados.length, 'gastos migrados no localStorage...');
        setTimeout(function () {
          localStorage.setItem('gastosVariaveis', JSON.stringify(gastosMigrados));
          console.log('✅ Migração de datas concluída para gastos variáveis');
        }, 100);
      }
      return gastosMigrados;
    }),
    _useState52 = _slicedToArray(_useState51, 2),
    gastosVariaveis = _useState52[0],
    setGastosVariaveis = _useState52[1];
  var _useState53 = useState(function () {
      var saved = localStorage.getItem('gastosExtras');
      var gastos = saved ? JSON.parse(saved) : [];

      // Migração: adicionar dataCompleta para gastos que não têm
      var precisaSalvar = false;
      var gastosMigrados = gastos.map(function (gasto) {
        if (!gasto.dataCompleta) {
          precisaSalvar = true;

          // Tentar diferentes fontes para a data
          var dataGasto;

          // 1. Se já tem data em formato BR, converter
          if (gasto.data && gasto.data.includes('/')) {
            var _gasto$data$split3 = gasto.data.split('/'),
              _gasto$data$split4 = _slicedToArray(_gasto$data$split3, 3),
              dia = _gasto$data$split4[0],
              mes = _gasto$data$split4[1],
              ano = _gasto$data$split4[2];
            dataGasto = new Date(ano, mes - 1, dia);
          }
          // 2. Se ID é timestamp válido
          else if (gasto.id && !isNaN(gasto.id) && gasto.id > 1000000000000) {
            dataGasto = new Date(gasto.id);
          }
          // 3. Fallback: usar mês e ano atuais com dia 1
          else {
            var anoGasto = gasto.ano || new Date().getFullYear();
            var mesGasto = gasto.mes || 'jan';
            var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            var mesNum = meses.indexOf(mesGasto.toLowerCase());
            dataGasto = new Date(anoGasto, mesNum, 1);
          }
          return _objectSpread(_objectSpread({}, gasto), {}, {
            dataCompleta: dataGasto.toISOString().split('T')[0],
            // YYYY-MM-DD
            data: dataGasto.toLocaleDateString('pt-BR')
          });
        }
        return gasto;
      });

      // Salvar automaticamente se teve migração
      if (precisaSalvar) {
        setTimeout(function () {
          localStorage.setItem('gastosExtras', JSON.stringify(gastosMigrados));
          console.log('✅ Migração de datas concluída:', gastosMigrados.length, 'gastos extras');
        }, 100);
      }
      return gastosMigrados;
    }),
    _useState54 = _slicedToArray(_useState53, 2),
    gastosExtras = _useState54[0],
    setGastosExtras = _useState54[1];
  var _useState55 = useState(function () {
      var saved = localStorage.getItem('receitas');
      return saved ? JSON.parse(saved) : [];
    }),
    _useState56 = _slicedToArray(_useState55, 2),
    receitas = _useState56[0],
    setReceitas = _useState56[1];
  var _useState57 = useState(function () {
      var saved = localStorage.getItem('farol');
      return saved ? JSON.parse(saved) : {};
    }),
    _useState58 = _slicedToArray(_useState57, 2),
    farol = _useState58[0],
    setFarol = _useState58[1];
  var _useState59 = useState(function () {
      var saved = localStorage.getItem('metas');
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
    }),
    _useState60 = _slicedToArray(_useState59, 2),
    metas = _useState60[0],
    setMetas = _useState60[1];

  // 🎯 METAS FINANCEIRAS (Curto/Médio/Longo Prazo)
  var _useState61 = useState(function () {
      var saved = localStorage.getItem('metasFinanceiras');
      return saved ? JSON.parse(saved) : [];
    }),
    _useState62 = _slicedToArray(_useState61, 2),
    metasFinanceiras = _useState62[0],
    setMetasFinanceiras = _useState62[1];

  // 💰 RESERVA DE EMERGÊNCIA ATUAL
  var _useState63 = useState(function () {
      var saved = localStorage.getItem('reservaEmergencia');
      return saved ? parseFloat(saved) : 0;
    }),
    _useState64 = _slicedToArray(_useState63, 2),
    reservaEmergencia = _useState64[0],
    setReservaEmergencia = _useState64[1];

  // 💳 DÍVIDAS
  var _useState65 = useState(function () {
      var saved = localStorage.getItem('dividas');
      return saved ? JSON.parse(saved) : [];
    }),
    _useState66 = _slicedToArray(_useState65, 2),
    dividas = _useState66[0],
    setDividas = _useState66[1];
  var _useState67 = useState(function () {
      var saved = localStorage.getItem('orcamento');
      return saved ? JSON.parse(saved) : {
        cartoes: 0,
        fixos: 0,
        variaveis: 0
      };
    }),
    _useState68 = _slicedToArray(_useState67, 2),
    orcamento = _useState68[0],
    setOrcamento = _useState68[1];

  // Categorias personalizadas
  var _useState69 = useState(function () {
      var saved = localStorage.getItem('categoriasPersonalizadas');
      return saved ? JSON.parse(saved) : {
        gastosFixos: [],
        gastosVariaveis: [],
        gastosExtras: []
      };
    }),
    _useState70 = _slicedToArray(_useState69, 2),
    categoriasPersonalizadas = _useState70[0],
    setCategoriasPersonalizadas = _useState70[1];
  var _useState71 = useState(function () {
      var saved = localStorage.getItem('orcamentosMensais');
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
    }),
    _useState72 = _slicedToArray(_useState71, 2),
    orcamentosMensais = _useState72[0],
    setOrcamentosMensais = _useState72[1];
  var _useState73 = useState(function () {
      var saved = localStorage.getItem('orcamentoAnual');
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
    }),
    _useState74 = _slicedToArray(_useState73, 2),
    orcamentoAnual = _useState74[0],
    setOrcamentoAnual = _useState74[1];
  var _useState75 = useState(function () {
      var saved = localStorage.getItem('planejadosMes');
      return saved ? JSON.parse(saved) : [];
    }),
    _useState76 = _slicedToArray(_useState75, 2),
    planejadosMes = _useState76[0],
    setPlanejadosMes = _useState76[1];
  var _useState77 = useState(function () {
      var saved = localStorage.getItem('comprasParceladas');
      return saved ? JSON.parse(saved) : [];
    }),
    _useState78 = _slicedToArray(_useState77, 2),
    comprasParceladas = _useState78[0],
    setComprasParceladas = _useState78[1];
  useEffect(function () {
    localStorage.setItem('anoAtual', anoAtual.toString());
  }, [anoAtual]);
  useEffect(function () {
    localStorage.setItem('gastosFixos', JSON.stringify(gastosFixos));
  }, [gastosFixos]);
  useEffect(function () {
    localStorage.setItem('categoriasPersonalizadas', JSON.stringify(categoriasPersonalizadas));
  }, [categoriasPersonalizadas]);
  useEffect(function () {
    console.log('💾 Salvando cartões:', cartoes.length, 'cartões');
    localStorage.setItem('cartoes', JSON.stringify(cartoes));
  }, [cartoes]);
  useEffect(function () {
    localStorage.setItem('gastosVariaveis', JSON.stringify(gastosVariaveis));
  }, [gastosVariaveis]);
  useEffect(function () {
    localStorage.setItem('gastosExtras', JSON.stringify(gastosExtras));
  }, [gastosExtras]);
  useEffect(function () {
    localStorage.setItem('receitas', JSON.stringify(receitas));
  }, [receitas]);
  useEffect(function () {
    localStorage.setItem('farol', JSON.stringify(farol));
  }, [farol]);
  useEffect(function () {
    localStorage.setItem('metas', JSON.stringify(metas));
  }, [metas]);
  useEffect(function () {
    localStorage.setItem('metasFinanceiras', JSON.stringify(metasFinanceiras));
  }, [metasFinanceiras]);
  useEffect(function () {
    localStorage.setItem('reservaEmergencia', reservaEmergencia.toString());
  }, [reservaEmergencia]);
  useEffect(function () {
    localStorage.setItem('dividas', JSON.stringify(dividas));
  }, [dividas]);
  useEffect(function () {
    localStorage.setItem('orcamento', JSON.stringify(orcamento));
  }, [orcamento]);
  useEffect(function () {
    localStorage.setItem('orcamentosMensais', JSON.stringify(orcamentosMensais));
  }, [orcamentosMensais]);

  // 🔥 AUTO-SAVE NA NUVEM - Salva automaticamente após cada mudança
  useEffect(function () {
    var autoSave = /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
        var dadosBackup, _t7;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.p = _context5.n) {
            case 0:
              if (!(!db || !user)) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2);
            case 1:
              setSalvando(true);
              _context5.p = 2;
              dadosBackup = {
                versao: '3.1',
                dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
                email: user.email,
                nome: user.displayName,
                dados: {
                  cartoes: cartoes,
                  gastosFixos: gastosFixos,
                  gastosVariaveis: gastosVariaveis,
                  gastosExtras: gastosExtras,
                  receitas: receitas,
                  farol: farol,
                  metas: metas,
                  metasFinanceiras: metasFinanceiras,
                  orcamento: orcamento,
                  orcamentosMensais: orcamentosMensais,
                  orcamentoAnual: orcamentoAnual,
                  planejadosMes: planejadosMes,
                  comprasParceladas: comprasParceladas,
                  dividas: dividas,
                  reservaEmergencia: reservaEmergencia,
                  categoriasPersonalizadas: categoriasPersonalizadas
                }
              };
              _context5.n = 3;
              return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
            case 3:
              setUltimoSave(new Date());
              _context5.n = 5;
              break;
            case 4:
              _context5.p = 4;
              _t7 = _context5.v;
              console.error('Erro no auto-save:', _t7);
            case 5:
              _context5.p = 5;
              setSalvando(false);
              return _context5.f(5);
            case 6:
              return _context5.a(2);
          }
        }, _callee5, null, [[2, 4, 5, 6]]);
      }));
      return function autoSave() {
        return _ref9.apply(this, arguments);
      };
    }();

    // Debounce de 2 segundos para evitar salvar demais
    var timer = setTimeout(autoSave, 2000);
    return function () {
      return clearTimeout(timer);
    };
  }, [cartoes, gastosFixos, gastosVariaveis, gastosExtras, receitas, farol, metas, metasFinanceiras, orcamento, orcamentosMensais, orcamentoAnual, planejadosMes, comprasParceladas, dividas, reservaEmergencia, categoriasPersonalizadas]);

  // Carregar dados da nuvem ao iniciar
  useEffect(function () {
    var carregarDaNuvem = /*#__PURE__*/function () {
      var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
        var userDoc, userData, allUsers, adminStatus, planoAtual, agora, fimTrial, diasRestantes, expirado, doc, dadosBackup, _t8;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.p = _context6.n) {
            case 0:
              if (!(!db || !user)) {
                _context6.n = 1;
                break;
              }
              return _context6.a(2);
            case 1:
              _context6.p = 1;
              _context6.n = 2;
              return db.collection('usuarios').doc(user.uid).get();
            case 2:
              userDoc = _context6.v;
              if (!userDoc.exists) {
                _context6.n = 11;
                break;
              }
              userData = userDoc.data(); // Se não tem campo isAdmin definido, verificar se é o primeiro usuário
              if (!(userData.isAdmin === undefined || userData.isAdmin === null)) {
                _context6.n = 7;
                break;
              }
              _context6.n = 3;
              return db.collection('usuarios').get();
            case 3:
              allUsers = _context6.v;
              if (!(allUsers.size === 1)) {
                _context6.n = 5;
                break;
              }
              _context6.n = 4;
              return db.collection('usuarios').doc(user.uid).update({
                isAdmin: true
              });
            case 4:
              setIsUserAdmin(true);
              console.log('✅ Primeiro usuário promovido a admin automaticamente');
              console.log('🔍 DEBUG: isUserAdmin setado para TRUE (primeiro usuário)');
              _context6.n = 6;
              break;
            case 5:
              setIsUserAdmin(false);
              console.log('⚠️ DEBUG: isUserAdmin setado para FALSE (não é primeiro usuário)');
              console.log('📊 DEBUG: Total de usuários:', allUsers.size);
            case 6:
              _context6.n = 8;
              break;
            case 7:
              // Já tem campo definido, usar o valor
              adminStatus = userData.isAdmin === true;
              setIsUserAdmin(adminStatus);
              console.log('🔍 DEBUG: isAdmin do Firestore:', userData.isAdmin);
              console.log('🔍 DEBUG: isUserAdmin setado para:', adminStatus);
            case 8:
              if (userData.status) {
                _context6.n = 10;
                break;
              }
              _context6.n = 9;
              return db.collection('usuarios').doc(user.uid).update({
                status: 'APROVADO',
                emailVerificado: true,
                plano: 'premium' // Usuários antigos viram premium
              });
            case 9:
              console.log('✅ Usuário antigo aprovado e verificado automaticamente');
            case 10:
              // ✅ VERIFICAR PLANO E TRIAL
              planoAtual = userData.plano || 'trial';
              if (planoAtual === 'trial' && userData.dataFimTrial) {
                agora = new Date();
                fimTrial = userData.dataFimTrial.toDate ? userData.dataFimTrial.toDate() : new Date(userData.dataFimTrial);
                diasRestantes = Math.ceil((fimTrial - agora) / (1000 * 60 * 60 * 24));
                expirado = diasRestantes <= 0;
                setPlanoInfo({
                  plano: planoAtual,
                  diasRestantes: Math.max(0, diasRestantes),
                  expirado: expirado
                });
              } else if (planoAtual === 'premium') {
                setPlanoInfo({
                  plano: 'premium',
                  diasRestantes: 0,
                  expirado: false
                });
              }
              _context6.n = 12;
              break;
            case 11:
              setIsUserAdmin(false);
              console.log('❌ DEBUG: Documento do usuário não existe no Firestore');
            case 12:
              _context6.n = 13;
              return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
            case 13:
              doc = _context6.v;
              if (doc.exists) {
                dadosBackup = doc.data();
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
              _context6.n = 15;
              break;
            case 14:
              _context6.p = 14;
              _t8 = _context6.v;
              console.error('Erro ao carregar da nuvem:', _t8);
            case 15:
              return _context6.a(2);
          }
        }, _callee6, null, [[1, 14]]);
      }));
      return function carregarDaNuvem() {
        return _ref0.apply(this, arguments);
      };
    }();
    carregarDaNuvem();
  }, []);
  useEffect(function () {
    localStorage.setItem('orcamentoAnual', JSON.stringify(orcamentoAnual));
  }, [orcamentoAnual]);
  useEffect(function () {
    localStorage.setItem('planejadosMes', JSON.stringify(planejadosMes));
  }, [planejadosMes]);
  useEffect(function () {
    localStorage.setItem('comprasParceladas', JSON.stringify(comprasParceladas));
  }, [comprasParceladas]);

  // MIGRAÇÃO AUTOMÁTICA PARA ESTRUTURA MULTI-ANO
  useEffect(function () {
    var migrated = localStorage.getItem('dataMigradaMultiAno');
    if (migrated) return; // Já migrado

    console.log('🔄 Iniciando migração para estrutura multi-ano...');

    // Migrar Cartões
    var cartoesAtualizados = cartoes.map(function (cartao) {
      // Se já tem estrutura de ano, mantém
      if (cartao.valores && _typeof(cartao.valores) === 'object' && cartao.valores['2025']) {
        return cartao;
      }
      // Se tem estrutura antiga (valores diretos por mês), migra para 2025
      return _objectSpread(_objectSpread({}, cartao), {}, {
        valores: {
          2025: _objectSpread({}, cartao.valores)
        }
      });
    });

    // Migrar Receitas
    var receitasAtualizadas = receitas.map(function (receita) {
      if (receita.ano) return receita; // Já tem ano
      return _objectSpread(_objectSpread({}, receita), {}, {
        ano: 2025
      });
    });

    // Migrar Gastos Variáveis
    var variaveisAtualizados = gastosVariaveis.map(function (gasto) {
      if (gasto.ano) return gasto;
      return _objectSpread(_objectSpread({}, gasto), {}, {
        ano: 2025
      });
    });

    // Migrar Farol (chave antiga: "nome-mes" -> nova: "nome-mes-ano")
    var farolAtualizado = {};
    Object.keys(farol).forEach(function (chave) {
      if (chave.includes('-2025') || chave.includes('-2024')) {
        farolAtualizado[chave] = farol[chave]; // Já tem ano
      } else {
        // Adiciona ano 2025 às chaves antigas
        farolAtualizado["".concat(chave, "-2025")] = farol[chave];
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
  var calcularTotais = function calcularTotais(mes) {
    // Valor base dos cartões - AGORA USA ANO
    var totalCartoesBase = cartoes.reduce(function (sum, c) {
      var _c$valores;
      var valoresAno = ((_c$valores = c.valores) === null || _c$valores === void 0 ? void 0 : _c$valores[anoAtual]) || {};
      return sum + (valoresAno[mes] || 0);
    }, 0);

    // Adicionar parcelas do mês
    var parcelasDoMes = comprasParceladas.filter(function (compra) {
      return compra.meses && compra.meses.includes(mes);
    }).reduce(function (sum, compra) {
      return sum + (compra.valorParcela || 0);
    }, 0);
    var totalCartoes = totalCartoesBase + parcelasDoMes;

    // FIXOS: filtrar por mês/ano (gastos temporários) OU mostrar permanentes
    var totalFixos = gastosFixos.filter(function (g) {
      // Se tem mes e ano, filtrar por eles
      if (g.mes && g.ano) {
        return g.mes === mes && g.ano === anoAtual;
      }
      // Se não tem, é permanente (aparece sempre)
      return true;
    }).reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);

    // Variáveis agora filtram por ANO também
    var totalVariaveis = gastosVariaveis.filter(function (g) {
      return g.mes === mes && g.ano === anoAtual;
    }).reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);

    // Extras também filtram por ANO
    var totalExtras = gastosExtras.filter(function (g) {
      return g.mes === mes && g.ano === anoAtual;
    }).reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);
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
  var totais = calcularTotais(mesAtual);
  var metaMensal = metas[mesAtual] || metas.mensal;
  var orcamentoMensal = orcamentosMensais[mesAtual] || orcamento;

  // CÁLCULO DE RECEITAS E SALDO
  var calcularSaldo = function calcularSaldo(mes) {
    // Receitas agora filtram por ANO também
    var totalReceitas = receitas.filter(function (r) {
      return r.mes === mes && r.ano === anoAtual;
    }).reduce(function (sum, r) {
      return sum + r.valor;
    }, 0);
    var totalDespesas = calcularTotais(mes).total;
    var saldo = totalReceitas - totalDespesas;
    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: saldo,
      positivo: saldo >= 0
    };
  };
  var calcularPagamentos = function calcularPagamentos(mes) {
    var itensPagamento = [].concat(_toConsumableArray(cartoes.map(function (c) {
      var _c$valores2;
      var valoresAno = ((_c$valores2 = c.valores) === null || _c$valores2 === void 0 ? void 0 : _c$valores2[anoAtual]) || {};
      var valorTotal = valoresAno[mes] || 0;
      var statusFarol = farol["".concat(c.nome, "-").concat(mes, "-").concat(anoAtual)];

      // Verifica se é PAGO, PARCIAL (número) ou PENDENTE
      var valorPago = 0;
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
    })), _toConsumableArray(gastosFixos.filter(function (g) {
      // Se tem mes e ano, filtrar por eles
      if (g.mes && g.ano) {
        return g.mes === mes && g.ano === anoAtual;
      }
      // Se não tem, é permanente (aparece sempre)
      return true;
    }).map(function (g) {
      var statusFarol = farol["".concat(g.descricao, "-").concat(mes, "-").concat(anoAtual)];
      var valorPago = 0;
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
    }))).filter(function (item) {
      return item.valor > 0;
    });
    var totalPagar = itensPagamento.reduce(function (sum, item) {
      return sum + item.valor;
    }, 0);
    var totalPago = itensPagamento.reduce(function (sum, item) {
      return sum + item.valorPago;
    }, 0);
    var totalPendente = totalPagar - totalPago;
    var percentualPago = totalPagar > 0 ? totalPago / totalPagar * 100 : 0;
    var quantidadePaga = itensPagamento.filter(function (item) {
      return item.pago;
    }).length;
    var quantidadeTotal = itensPagamento.length;
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
  var saldo = calcularSaldo(mesAtual);
  var pagamentos = calcularPagamentos(mesAtual);

  // COMPARAÇÃO ENTRE MESES
  var compararMeses = function compararMeses() {
    var indiceMesAtual = MESES.indexOf(mesAtual);
    var mesAnterior = indiceMesAtual > 0 ? MESES[indiceMesAtual - 1] : null;
    if (!mesAnterior) {
      return {
        temAnterior: false
      };
    }
    var totaisAtual = calcularTotais(mesAtual);
    var totaisAnterior = calcularTotais(mesAnterior);
    var diferenca = totaisAtual.total - totaisAnterior.total;
    var variacao = totaisAnterior.total > 0 ? (diferenca / totaisAnterior.total * 100).toFixed(1) : 0;

    // Calcular melhor e pior mês do ano
    var todosMeses = MESES.map(function (mes) {
      return {
        mes: mes,
        total: calcularTotais(mes).total
      };
    }).filter(function (m) {
      return m.total > 0;
    });
    var melhorMes = todosMeses.length > 0 ? todosMeses.reduce(function (min, m) {
      return m.total < min.total ? m : min;
    }) : null;
    var piorMes = todosMeses.length > 0 ? todosMeses.reduce(function (max, m) {
      return m.total > max.total ? m : max;
    }) : null;
    return {
      temAnterior: true,
      mesAnterior: mesAnterior,
      totaisAtual: totaisAtual,
      totaisAnterior: totaisAnterior,
      diferenca: diferenca,
      variacao: variacao,
      aumentou: diferenca > 0,
      melhorMes: melhorMes,
      piorMes: piorMes
    };
  };
  var comparacao = compararMeses();

  // INSIGHTS AUTOMÁTICOS
  var gerarInsights = function gerarInsights() {
    var insights = [];

    // Insight 1: Comparação com mês anterior
    if (comparacao.temAnterior) {
      if (comparacao.aumentou && Math.abs(comparacao.variacao) > 10) {
        insights.push({
          tipo: 'alerta',
          icone: '⚠️',
          titulo: 'Gastos aumentaram significativamente',
          mensagem: "Seus gastos aumentaram ".concat(comparacao.variacao, "% comparado a ").concat(comparacao.mesAnterior.toUpperCase(), ". Isso representa +R$ ").concat(Math.abs(comparacao.diferenca).toFixed(2), "."),
          cor: 'red'
        });
      } else if (!comparacao.aumentou && Math.abs(comparacao.variacao) > 10) {
        insights.push({
          tipo: 'sucesso',
          icone: '✅',
          titulo: 'Parabéns! Você economizou',
          mensagem: "Seus gastos diminu\xEDram ".concat(Math.abs(comparacao.variacao), "% comparado a ").concat(comparacao.mesAnterior.toUpperCase(), ". Economia de R$ ").concat(Math.abs(comparacao.diferenca).toFixed(2), "!"),
          cor: 'green'
        });
      }

      // Insight sobre categorias específicas
      var difCartoes = comparacao.totaisAtual.cartoes - comparacao.totaisAnterior.cartoes;
      var difVariaveis = comparacao.totaisAtual.variaveis - comparacao.totaisAnterior.variaveis;
      if (difCartoes > 500) {
        insights.push({
          tipo: 'info',
          icone: '💳',
          titulo: 'Gastos com cartões em alta',
          mensagem: "Seus gastos com cart\xF5es aumentaram R$ ".concat(difCartoes.toFixed(2), " este m\xEAs. Revise suas faturas."),
          cor: 'orange'
        });
      }
      if (difVariaveis > 500) {
        insights.push({
          tipo: 'info',
          icone: '📊',
          titulo: 'Gastos variáveis elevados',
          mensagem: "Seus gastos vari\xE1veis aumentaram R$ ".concat(difVariaveis.toFixed(2), ". Considere revisar seus h\xE1bitos de consumo."),
          cor: 'blue'
        });
      }
    }

    // Insight 2: Meta
    if (metas.mensal > 0) {
      var percentualMeta = totais.total / metas.mensal * 100;
      if (percentualMeta > 100) {
        insights.push({
          tipo: 'alerta',
          icone: '🔴',
          titulo: 'Meta ultrapassada!',
          mensagem: "Voc\xEA ultrapassou sua meta em ".concat((percentualMeta - 100).toFixed(1), "%. Total gasto: R$ ").concat(totais.total.toFixed(2), " de R$ ").concat(metas.mensal.toFixed(2), "."),
          cor: 'red'
        });
      } else if (percentualMeta > 80) {
        insights.push({
          tipo: 'aviso',
          icone: '⚡',
          titulo: 'Atenção: Meta próxima do limite',
          mensagem: "Voc\xEA j\xE1 usou ".concat(percentualMeta.toFixed(1), "% da sua meta mensal. Restam apenas R$ ").concat((metas.mensal - totais.total).toFixed(2), "."),
          cor: 'yellow'
        });
      } else if (percentualMeta < 70) {
        insights.push({
          tipo: 'sucesso',
          icone: '🎉',
          titulo: 'Dentro da meta!',
          mensagem: "Voc\xEA est\xE1 usando apenas ".concat(percentualMeta.toFixed(1), "% da sua meta. Continue assim!"),
          cor: 'green'
        });
      }
    }

    // Insight 3: Análise de categorias
    if (gastosFixos.length > 0) {
      var categorias = gastosFixos.reduce(function (acc, g) {
        acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
        return acc;
      }, {});
      var categoriaMaior = Object.entries(categorias).sort(function (a, b) {
        return b[1] - a[1];
      })[0];
      var percentualCategoria = categoriaMaior[1] / totais.fixos * 100;
      if (percentualCategoria > 40) {
        insights.push({
          tipo: 'info',
          icone: '📌',
          titulo: "Categoria ".concat(categoriaMaior[0], " representa ").concat(percentualCategoria.toFixed(0), "%"),
          mensagem: "A categoria ".concat(categoriaMaior[0], " representa ").concat(percentualCategoria.toFixed(0), "% dos seus gastos fixos (R$ ").concat(categoriaMaior[1].toFixed(2), ")."),
          cor: 'purple'
        });
      }
    }

    // Insight 4: Sugestões
    if (gastosVariaveis.filter(function (g) {
      return g.mes === mesAtual && g.ano === anoAtual;
    }).length === 0) {
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
  var insights = gerarInsights();

  // CRUD Functions
  var adicionarCartao = function adicionarCartao(dados) {
    console.log('Adicionando cartão:', dados);
    var novoCartao = {
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
    setCartoes([].concat(_toConsumableArray(cartoes), [novoCartao]));
    setModalAberto(null);
    alert('Cartão adicionado com sucesso!');
  };
  var adicionarGastoFixo = function adicionarGastoFixo(dados) {
    console.log('Adicionando gasto fixo:', dados);
    var novoGasto = {
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
    setGastosFixos([].concat(_toConsumableArray(gastosFixos), [novoGasto]));

    // Só mostra alert se for gasto único (não parcelado)
    if (!dados.temporario || dados.totalParcelas <= 1) {
      setModalAberto(null);
      alert('Gasto fixo adicionado com sucesso!');
    }
  };
  var adicionarGastoVariavel = function adicionarGastoVariavel(dados) {
    console.log('Adicionando gasto variável:', dados);
    var novoGasto = {
      id: Date.now(),
      categoria: dados.categoria,
      descricao: dados.descricao || '',
      valor: parseFloat(dados.valor),
      mes: mesAtual,
      ano: anoAtual,
      data: dados.data || new Date().toLocaleDateString('pt-BR'),
      dataCompleta: dados.dataCompleta || new Date().toISOString().split('T')[0] // YYYY-MM-DD para ordenar
    };
    setGastosVariaveis([].concat(_toConsumableArray(gastosVariaveis), [novoGasto]));
    setModalAberto(null);
    alert('Gasto variável adicionado com sucesso!');
  };
  var deletarCartao = function deletarCartao(id) {
    if (confirm('Tem certeza?')) {
      setCartoes(cartoes.filter(function (c) {
        return c.id !== id;
      }));
    }
  };
  var editarCartao = /*#__PURE__*/function () {
    var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(id, dadosAtualizados) {
      var novosCartoes, _t9;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            console.log('✏️ Editando cartão:', id, dadosAtualizados);
            novosCartoes = [];
            cartoes.forEach(function (c) {
              if (c.id === id) {
                var cartaoAtualizado = _objectSpread(_objectSpread(_objectSpread({}, c), dadosAtualizados), {}, {
                  ano: parseInt(dadosAtualizados.ano) || c.ano || 2026,
                  valor: parseFloat(dadosAtualizados.valor) || c.valor,
                  limite: parseFloat(dadosAtualizados.limite) || c.limite || 0,
                  // IMPORTANTE!
                  diaFechamento: parseInt(dadosAtualizados.diaFechamento) || c.diaFechamento
                });
                console.log('✅ Cartão atualizado:', cartaoAtualizado);
                novosCartoes.push(cartaoAtualizado);
              } else {
                novosCartoes.push(c);
              }
            });
            setCartoes([]);
            setTimeout(function () {
              return setCartoes(novosCartoes);
            }, 10);
            setModalAberto(null);
            alert('✅ Cartão atualizado com sucesso!');

            // Salvar no Firestore
            if (!(db && user)) {
              _context7.n = 4;
              break;
            }
            _context7.p = 1;
            _context7.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: novosCartoes,
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
            });
          case 2:
            _context7.n = 4;
            break;
          case 3:
            _context7.p = 3;
            _t9 = _context7.v;
            console.error('Erro ao salvar:', _t9);
          case 4:
            setItemEditando(null);
            setTipoEditando(null);
            setModalAberto(null);
            alert('✅ Cartão atualizado!');
          case 5:
            return _context7.a(2);
        }
      }, _callee7, null, [[1, 3]]);
    }));
    return function editarCartao(_x4, _x5) {
      return _ref1.apply(this, arguments);
    };
  }();
  var duplicarCartao = function duplicarCartao(cartao) {
    var novoCartao = _objectSpread(_objectSpread({}, cartao), {}, {
      id: Date.now(),
      nome: cartao.nome + ' (Cópia)'
    });
    setCartoes([].concat(_toConsumableArray(cartoes), [novoCartao]));
    alert('✅ Cartão duplicado com sucesso!');
  };
  var deletarGastoFixo = function deletarGastoFixo(id) {
    if (confirm('Tem certeza?')) {
      setGastosFixos(gastosFixos.filter(function (g) {
        return g.id !== id;
      }));
    }
  };
  var editarGastoFixo = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(id, dadosAtualizados) {
      var novosGastos, _t0;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            novosGastos = [];
            gastosFixos.forEach(function (g) {
              if (g.id === id) {
                novosGastos.push(_objectSpread(_objectSpread(_objectSpread({}, g), dadosAtualizados), {}, {
                  ano: parseInt(dadosAtualizados.ano) || g.ano || 2026,
                  valor: parseFloat(dadosAtualizados.valor) || g.valor
                }));
              } else {
                novosGastos.push(g);
              }
            });
            setGastosFixos([]);
            setTimeout(function () {
              return setGastosFixos(novosGastos);
            }, 10);

            // Salvar no Firestore
            if (!(db && user)) {
              _context8.n = 4;
              break;
            }
            _context8.p = 1;
            _context8.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: cartoes,
                gastosFixos: novosGastos,
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
            });
          case 2:
            _context8.n = 4;
            break;
          case 3:
            _context8.p = 3;
            _t0 = _context8.v;
            console.error('Erro ao salvar:', _t0);
          case 4:
            setItemEditando(null);
            setTipoEditando(null);
            setModalAberto(null);
            alert('✅ Gasto fixo atualizado!');
          case 5:
            return _context8.a(2);
        }
      }, _callee8, null, [[1, 3]]);
    }));
    return function editarGastoFixo(_x6, _x7) {
      return _ref10.apply(this, arguments);
    };
  }();
  var duplicarGastoFixo = function duplicarGastoFixo(gasto) {
    var novoGasto = _objectSpread(_objectSpread({}, gasto), {}, {
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    });
    setGastosFixos([].concat(_toConsumableArray(gastosFixos), [novoGasto]));
    alert('✅ Gasto fixo duplicado com sucesso!');
  };
  var deletarGastoVariavel = function deletarGastoVariavel(id) {
    if (confirm('Tem certeza?')) {
      setGastosVariaveis(gastosVariaveis.filter(function (g) {
        return g.id !== id;
      }));
    }
  };
  var editarGastoVariavel = /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(id, dadosAtualizados) {
      var novosGastos, _t1;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.p = _context9.n) {
          case 0:
            novosGastos = [];
            gastosVariaveis.forEach(function (g) {
              if (g.id === id) {
                novosGastos.push(_objectSpread(_objectSpread(_objectSpread({}, g), dadosAtualizados), {}, {
                  ano: parseInt(dadosAtualizados.ano) || g.ano || 2026,
                  valor: parseFloat(dadosAtualizados.valor) || g.valor
                }));
              } else {
                novosGastos.push(g);
              }
            });
            setGastosVariaveis([]);
            setTimeout(function () {
              return setGastosVariaveis(novosGastos);
            }, 10);

            // Salvar no Firestore
            if (!(db && user)) {
              _context9.n = 4;
              break;
            }
            _context9.p = 1;
            _context9.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: cartoes,
                gastosFixos: gastosFixos,
                gastosVariaveis: novosGastos,
                receitas: receitas,
                farol: farol,
                metas: metas,
                orcamento: orcamento,
                orcamentosMensais: orcamentosMensais,
                orcamentoAnual: orcamentoAnual,
                planejadosMes: planejadosMes,
                comprasParceladas: comprasParceladas
              }
            });
          case 2:
            _context9.n = 4;
            break;
          case 3:
            _context9.p = 3;
            _t1 = _context9.v;
            console.error('Erro ao salvar:', _t1);
          case 4:
            setItemEditando(null);
            setTipoEditando(null);
            setModalAberto(null);
            alert('✅ Gasto variável atualizado com sucesso!');
          case 5:
            return _context9.a(2);
        }
      }, _callee9, null, [[1, 3]]);
    }));
    return function editarGastoVariavel(_x8, _x9) {
      return _ref11.apply(this, arguments);
    };
  }();
  var duplicarGastoVariavel = function duplicarGastoVariavel(gasto) {
    var novoGasto = _objectSpread(_objectSpread({}, gasto), {}, {
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    });
    setGastosVariaveis([].concat(_toConsumableArray(gastosVariaveis), [novoGasto]));
    alert('✅ Gasto variável duplicado com sucesso!');
  };

  // Funções para Gastos Extras
  var deletarGastoExtra = function deletarGastoExtra(id) {
    if (confirm('Tem certeza?')) {
      setGastosExtras(gastosExtras.filter(function (g) {
        return g.id !== id;
      }));
    }
  };
  var editarGastoExtra = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(id, dadosAtualizados) {
      var novosGastos, _t10;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.p = _context0.n) {
          case 0:
            novosGastos = [];
            gastosExtras.forEach(function (g) {
              if (g.id === id) {
                novosGastos.push(_objectSpread(_objectSpread(_objectSpread({}, g), dadosAtualizados), {}, {
                  ano: parseInt(dadosAtualizados.ano) || g.ano || 2026,
                  valor: parseFloat(dadosAtualizados.valor) || g.valor
                }));
              } else {
                novosGastos.push(g);
              }
            });
            setGastosExtras([]);
            setTimeout(function () {
              return setGastosExtras(novosGastos);
            }, 10);

            // Salvar no Firestore
            if (!(db && user)) {
              _context0.n = 4;
              break;
            }
            _context0.p = 1;
            _context0.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').update({
              'dados.gastosExtras': novosGastos
            });
          case 2:
            _context0.n = 4;
            break;
          case 3:
            _context0.p = 3;
            _t10 = _context0.v;
            console.error('Erro ao salvar:', _t10);
          case 4:
            return _context0.a(2);
        }
      }, _callee0, null, [[1, 3]]);
    }));
    return function editarGastoExtra(_x0, _x1) {
      return _ref12.apply(this, arguments);
    };
  }();
  var duplicarGastoExtra = function duplicarGastoExtra(gasto) {
    var novoGasto = _objectSpread(_objectSpread({}, gasto), {}, {
      id: Date.now(),
      descricao: gasto.descricao + ' (Cópia)'
    });
    setGastosExtras([].concat(_toConsumableArray(gastosExtras), [novoGasto]));
    alert('✅ Gasto extra duplicado com sucesso!');
  };

  // 💳 MIGRAÇÃO DE VALORES DE CARTÕES 2025 → 2026 (MOVE, NÃO COPIA)
  var migrarValoresCartoes = /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(anoOrigem, anoDestino) {
      var cartoesAtualizados, valoresMigrados, novosCartoes, _t11;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            if (confirm("\uD83D\uDCB3 MOVER VALORES DE CART\xD5ES\n\nIsso vai MOVER todos os valores de ".concat(anoOrigem, " para ").concat(anoDestino, ".\n\n\u26A0\uFE0F ATEN\xC7\xC3O:\n\u2705 Valores v\xE3o para ").concat(anoDestino, "\n\u274C Valores de ").concat(anoOrigem, " ser\xE3o APAGADOS\n\nExemplo:\nNubank ").concat(anoOrigem, ": R$ 1.500\n  \u2193\nNubank ").concat(anoDestino, ": R$ 1.500\nNubank ").concat(anoOrigem, ": R$ 0 (zerado!)\n\nDeseja continuar?"))) {
              _context1.n = 1;
              break;
            }
            return _context1.a(2);
          case 1:
            _context1.p = 1;
            console.log('💳 Iniciando migração de cartões...');
            console.log('📋 Cartões antes:', cartoes);
            cartoesAtualizados = 0;
            valoresMigrados = 0;
            novosCartoes = cartoes.map(function (cartao) {
              var _cartao$valores;
              // Verificar se tem valores no ano de origem
              var valoresOrigem = (_cartao$valores = cartao.valores) === null || _cartao$valores === void 0 ? void 0 : _cartao$valores[anoOrigem];
              if (valoresOrigem && Object.keys(valoresOrigem).length > 0) {
                console.log("\uD83D\uDCB3 Movendo cart\xE3o: ".concat(cartao.nome));
                console.log("  Valores ".concat(anoOrigem, " (antes):"), valoresOrigem);

                // Criar objeto de valores zerados para o ano de origem
                var valoresZerados = {};
                Object.keys(valoresOrigem).forEach(function (mes) {
                  valoresZerados[mes] = 0;
                });

                // Criar novo cartão com valores movidos
                var novoCartao = _objectSpread(_objectSpread({}, cartao), {}, {
                  valores: _objectSpread(_objectSpread({}, cartao.valores), {}, _defineProperty(_defineProperty({}, anoDestino, _objectSpread({}, valoresOrigem)), anoOrigem, valoresZerados))
                });
                console.log("  Valores ".concat(anoDestino, " (depois):"), novoCartao.valores[anoDestino]);
                console.log("  Valores ".concat(anoOrigem, " (depois):"), novoCartao.valores[anoOrigem]);
                cartoesAtualizados++;
                valoresMigrados += Object.keys(valoresOrigem).length;
                return novoCartao;
              }
              return cartao;
            });
            console.log('📋 Cartões depois:', novosCartoes);
            if (!(cartoesAtualizados === 0)) {
              _context1.n = 2;
              break;
            }
            alert("\u26A0\uFE0F Nenhum cart\xE3o tinha valores em ".concat(anoOrigem, "!\n\nVerifique se os cart\xF5es est\xE3o cadastrados."));
            return _context1.a(2);
          case 2:
            // Atualizar estado
            setCartoes(novosCartoes);

            // Salvar no Firestore
            if (!(db && user)) {
              _context1.n = 4;
              break;
            }
            console.log('💾 Salvando no Firestore...');
            _context1.n = 3;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: novosCartoes,
                gastosFixos: gastosFixos,
                gastosVariaveis: gastosVariaveis,
                gastosExtras: gastosExtras,
                receitas: receitas,
                farol: farol,
                metas: metas,
                orcamento: orcamento,
                orcamentosMensais: orcamentosMensais,
                orcamentoAnual: orcamentoAnual,
                planejadosMes: planejadosMes,
                comprasParceladas: comprasParceladas
              }
            });
          case 3:
            console.log('✅ Salvo no Firestore!');
          case 4:
            alert("\u2705 Migra\xE7\xE3o de cart\xF5es conclu\xEDda!\n\n" + "\uD83D\uDCB3 Cart\xF5es movidos: ".concat(cartoesAtualizados, "\n") + "\uD83D\uDCC5 Valores mensais migrados: ".concat(valoresMigrados, "\n\n") + "\u2705 Valores copiados para ".concat(anoDestino, "\n") + "\u274C Valores de ".concat(anoOrigem, " foram ZERADOS\n\n") + "Veja o console (F12) para detalhes.");
            _context1.n = 6;
            break;
          case 5:
            _context1.p = 5;
            _t11 = _context1.v;
            console.error('❌ Erro na migração:', _t11);
            alert('❌ Erro na migração: ' + _t11.message);
          case 6:
            return _context1.a(2);
        }
      }, _callee1, null, [[1, 5]]);
    }));
    return function migrarValoresCartoes(_x10, _x11) {
      return _ref13.apply(this, arguments);
    };
  }();

  // 🔍 DIAGNÓSTICO COMPLETO - LOCALSTORAGE + FIRESTORE
  var diagnosticarStorage = /*#__PURE__*/function () {
    var _ref14 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
      var _firestoreData$dados$, _firestoreData$dados$2, _firestoreData$dados$3, _firestoreData$dados$4, _contagem$firestore, _contagem$firestore2, _contagem$firestore3, _contagem$firestore4;
      var localReceitas, localCartoes, localFixos, localVariaveis, firestoreData, doc, contagem, _t12;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.p = _context10.n) {
          case 0:
            console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO...');

            // 1. Ver o que tem no localStorage
            localReceitas = JSON.parse(localStorage.getItem('receitas') || '[]');
            localCartoes = JSON.parse(localStorage.getItem('cartoes') || '[]');
            localFixos = JSON.parse(localStorage.getItem('gastosFixos') || '[]');
            localVariaveis = JSON.parse(localStorage.getItem('gastosVariaveis') || '[]');
            console.log('💾 LOCALSTORAGE:');
            console.log('  Receitas:', localReceitas);
            console.log('  Cartões:', localCartoes);
            console.log('  Fixos:', localFixos);
            console.log('  Variáveis:', localVariaveis);

            // 2. Ver o que tem no Firestore
            firestoreData = null;
            if (!(db && user)) {
              _context10.n = 4;
              break;
            }
            _context10.p = 1;
            _context10.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
          case 2:
            doc = _context10.v;
            if (doc.exists) {
              firestoreData = doc.data();
              console.log('☁️ FIRESTORE:', firestoreData.dados);
            }
            _context10.n = 4;
            break;
          case 3:
            _context10.p = 3;
            _t12 = _context10.v;
            console.error('Erro ao buscar Firestore:', _t12);
          case 4:
            // 3. Ver o que tem nos estados React
            console.log('⚛️ REACT STATES:');
            console.log('  Receitas:', receitas);
            console.log('  Cartões:', cartoes);
            console.log('  Fixos:', gastosFixos);
            console.log('  Variáveis:', gastosVariaveis);

            // 4. Contar por fonte
            contagem = {
              localStorage: {
                receitas: localReceitas.length,
                cartoes: localCartoes.length,
                fixos: localFixos.length,
                variaveis: localVariaveis.length
              },
              firestore: firestoreData ? {
                receitas: ((_firestoreData$dados$ = firestoreData.dados.receitas) === null || _firestoreData$dados$ === void 0 ? void 0 : _firestoreData$dados$.length) || 0,
                cartoes: ((_firestoreData$dados$2 = firestoreData.dados.cartoes) === null || _firestoreData$dados$2 === void 0 ? void 0 : _firestoreData$dados$2.length) || 0,
                fixos: ((_firestoreData$dados$3 = firestoreData.dados.gastosFixos) === null || _firestoreData$dados$3 === void 0 ? void 0 : _firestoreData$dados$3.length) || 0,
                variaveis: ((_firestoreData$dados$4 = firestoreData.dados.gastosVariaveis) === null || _firestoreData$dados$4 === void 0 ? void 0 : _firestoreData$dados$4.length) || 0
              } : null,
              react: {
                receitas: receitas.length,
                cartoes: cartoes.length,
                fixos: gastosFixos.length,
                variaveis: gastosVariaveis.length
              }
            };
            console.log('📊 CONTAGEM:', contagem);
            alert("\uD83D\uDD0D DIAGN\xD3STICO COMPLETO\n\n" + "\uD83D\uDCBE LOCALSTORAGE:\n" + "  Receitas: ".concat(contagem.localStorage.receitas, "\n") + "  Cart\xF5es: ".concat(contagem.localStorage.cartoes, "\n") + "  Fixos: ".concat(contagem.localStorage.fixos, "\n") + "  Vari\xE1veis: ".concat(contagem.localStorage.variaveis, "\n\n") + "\u2601\uFE0F FIRESTORE:\n" + "  Receitas: ".concat(((_contagem$firestore = contagem.firestore) === null || _contagem$firestore === void 0 ? void 0 : _contagem$firestore.receitas) || 0, "\n") + "  Cart\xF5es: ".concat(((_contagem$firestore2 = contagem.firestore) === null || _contagem$firestore2 === void 0 ? void 0 : _contagem$firestore2.cartoes) || 0, "\n") + "  Fixos: ".concat(((_contagem$firestore3 = contagem.firestore) === null || _contagem$firestore3 === void 0 ? void 0 : _contagem$firestore3.fixos) || 0, "\n") + "  Vari\xE1veis: ".concat(((_contagem$firestore4 = contagem.firestore) === null || _contagem$firestore4 === void 0 ? void 0 : _contagem$firestore4.variaveis) || 0, "\n\n") + "\u269B\uFE0F REACT (sendo usado agora):\n" + "  Receitas: ".concat(contagem.react.receitas, "\n") + "  Cart\xF5es: ".concat(contagem.react.cartoes, "\n") + "  Fixos: ".concat(contagem.react.fixos, "\n") + "  Vari\xE1veis: ".concat(contagem.react.variaveis, "\n\n") + "Veja o CONSOLE (F12) para detalhes completos!");
          case 5:
            return _context10.a(2);
        }
      }, _callee10, null, [[1, 3]]);
    }));
    return function diagnosticarStorage() {
      return _ref14.apply(this, arguments);
    };
  }();

  // 🔍 DIAGNÓSTICO DE ANOS E MESES
  var diagnosticarAnos = function diagnosticarAnos() {
    console.log('📊 RECEITAS:', receitas);
    console.log('💳 CARTÕES:', cartoes);
    console.log('🏠 FIXOS:', gastosFixos);
    console.log('🛒 VARIÁVEIS:', gastosVariaveis);
    var diagnostico = {
      receitas: receitas.map(function (r) {
        return {
          descricao: r.descricao || r.categoria,
          ano: r.ano,
          mes: r.mes,
          valor: r.valor
        };
      }),
      cartoes: cartoes.map(function (c) {
        return {
          nome: c.nome,
          ano: c.ano,
          valor: c.valor
        };
      }),
      fixos: gastosFixos.map(function (g) {
        return {
          descricao: g.descricao,
          ano: g.ano,
          valor: g.valor
        };
      }),
      variaveis: gastosVariaveis.map(function (g) {
        return {
          descricao: g.descricao,
          ano: g.ano,
          mes: g.mes,
          valor: g.valor
        };
      })
    };
    console.log('📊 DIAGNÓSTICO COMPLETO:', diagnostico);

    // Contar totais
    var totais = {
      receitas: receitas.length,
      cartoes: cartoes.length,
      fixos: gastosFixos.length,
      variaveis: gastosVariaveis.length
    };

    // Contar por ano
    var anos = {
      receitas: {},
      cartoes: {},
      fixos: {},
      variaveis: {}
    };
    receitas.forEach(function (r) {
      var ano = r.ano || 'undefined';
      anos.receitas[ano] = (anos.receitas[ano] || 0) + 1;
    });
    cartoes.forEach(function (c) {
      var ano = c.ano || 'undefined';
      anos.cartoes[ano] = (anos.cartoes[ano] || 0) + 1;
    });
    gastosFixos.forEach(function (g) {
      var ano = g.ano || 'undefined';
      anos.fixos[ano] = (anos.fixos[ano] || 0) + 1;
    });
    gastosVariaveis.forEach(function (g) {
      var ano = g.ano || 'undefined';
      anos.variaveis[ano] = (anos.variaveis[ano] || 0) + 1;
    });
    console.log('📊 CONTAGEM POR ANO:', anos);

    // Verificar mês atual
    var janeiroAtual = {
      receitas: receitas.filter(function (r) {
        return r.mes === 'Janeiro' && r.ano === 2026;
      }).length,
      variaveis: gastosVariaveis.filter(function (g) {
        return g.mes === 'Janeiro' && g.ano === 2026;
      }).length
    };
    alert("\uD83D\uDCCA DIAGN\xD3STICO COMPLETO\n\n" + "\uD83D\uDCC8 TOTAL DE LAN\xC7AMENTOS:\n" + "  Receitas: ".concat(totais.receitas, "\n") + "  Cart\xF5es: ".concat(totais.cartoes, "\n") + "  Fixos: ".concat(totais.fixos, "\n") + "  Vari\xE1veis: ".concat(totais.variaveis, "\n\n") + "\uD83D\uDCC5 EM JANEIRO/2026:\n" + "  Receitas: ".concat(janeiroAtual.receitas, "\n") + "  Vari\xE1veis: ".concat(janeiroAtual.variaveis, "\n\n") + "\uD83D\uDCCA DISTRIBUI\xC7\xC3O POR ANO:\n" + "RECEITAS: ".concat(Object.entries(anos.receitas).map(function (_ref15) {
      var _ref16 = _slicedToArray(_ref15, 2),
        ano = _ref16[0],
        qtd = _ref16[1];
      return "".concat(ano, "=").concat(qtd);
    }).join(', '), "\n") + "CART\xD5ES: ".concat(Object.entries(anos.cartoes).map(function (_ref17) {
      var _ref18 = _slicedToArray(_ref17, 2),
        ano = _ref18[0],
        qtd = _ref18[1];
      return "".concat(ano, "=").concat(qtd);
    }).join(', '), "\n") + "FIXOS: ".concat(Object.entries(anos.fixos).map(function (_ref19) {
      var _ref20 = _slicedToArray(_ref19, 2),
        ano = _ref20[0],
        qtd = _ref20[1];
      return "".concat(ano, "=").concat(qtd);
    }).join(', '), "\n") + "VARI\xC1VEIS: ".concat(Object.entries(anos.variaveis).map(function (_ref21) {
      var _ref22 = _slicedToArray(_ref21, 2),
        ano = _ref22[0],
        qtd = _ref22[1];
      return "".concat(ano, "=").concat(qtd);
    }).join(', '), "\n\n") + "Veja o console (F12) para LISTA COMPLETA!");
  };

  // 🔧 CORRIGIR ANOS UNDEFINED → 2025
  var corrigirAnosUndefined = /*#__PURE__*/function () {
    var _ref23 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
      var novasReceitas, novosCartoes, novosFixos, novosVariaveis, count;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.n) {
          case 0:
            if (confirm("\uD83D\uDD27 CORRIGIR ANOS\n\nIsso vai adicionar ano = 2025 em todos os lan\xE7amentos que n\xE3o t\xEAm ano definido.\n\nDeseja continuar?")) {
              _context11.n = 1;
              break;
            }
            return _context11.a(2);
          case 1:
            novasReceitas = receitas.map(function (r) {
              return !r.ano ? _objectSpread(_objectSpread({}, r), {}, {
                ano: 2025
              }) : r;
            });
            novosCartoes = cartoes.map(function (c) {
              return !c.ano ? _objectSpread(_objectSpread({}, c), {}, {
                ano: 2025
              }) : c;
            });
            novosFixos = gastosFixos.map(function (g) {
              return !g.ano ? _objectSpread(_objectSpread({}, g), {}, {
                ano: 2025
              }) : g;
            });
            novosVariaveis = gastosVariaveis.map(function (g) {
              return !g.ano ? _objectSpread(_objectSpread({}, g), {}, {
                ano: 2025
              }) : g;
            });
            count = {
              receitas: novasReceitas.filter(function (r) {
                return !receitas.find(function (old) {
                  return old.id === r.id && old.ano;
                });
              }).length,
              cartoes: novosCartoes.filter(function (c) {
                return !cartoes.find(function (old) {
                  return old.id === c.id && old.ano;
                });
              }).length,
              fixos: novosFixos.filter(function (g) {
                return !gastosFixos.find(function (old) {
                  return old.id === g.id && old.ano;
                });
              }).length,
              variaveis: novosVariaveis.filter(function (g) {
                return !gastosVariaveis.find(function (old) {
                  return old.id === g.id && old.ano;
                });
              }).length
            };
            setReceitas(novasReceitas);
            setCartoes(novosCartoes);
            setGastosFixos(novosFixos);
            setGastosVariaveis(novosVariaveis);

            // Salvar no Firestore
            if (!(db && user)) {
              _context11.n = 2;
              break;
            }
            _context11.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: novosCartoes,
                gastosFixos: novosFixos,
                gastosVariaveis: novosVariaveis,
                receitas: novasReceitas,
                farol: farol,
                metas: metas,
                orcamento: orcamento,
                orcamentosMensais: orcamentosMensais,
                orcamentoAnual: orcamentoAnual,
                planejadosMes: planejadosMes,
                comprasParceladas: comprasParceladas
              }
            });
          case 2:
            alert("\u2705 Anos corrigidos!\n\n" + "\uD83D\uDCCA Receitas: ".concat(count.receitas, "\n") + "\uD83D\uDCB3 Cart\xF5es: ".concat(count.cartoes, "\n") + "\uD83C\uDFE0 Fixos: ".concat(count.fixos, "\n") + "\uD83D\uDED2 Vari\xE1veis: ".concat(count.variaveis, "\n\n") + "Total: ".concat(count.receitas + count.cartoes + count.fixos + count.variaveis, " corrigidos!\n\n") + "Agora voc\xEA pode migrar para 2026!");
          case 3:
            return _context11.a(2);
        }
      }, _callee11);
    }));
    return function corrigirAnosUndefined() {
      return _ref23.apply(this, arguments);
    };
  }();

  // 🔄 MIGRAÇÃO EM MASSA 2025 → 2026
  var migrarAno = /*#__PURE__*/function () {
    var _ref24 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(de, para) {
      var novasReceitas, novosCartoes, novosFixos, novosVariaveis, count, _t13;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.p = _context12.n) {
          case 0:
            if (confirm("\u26A0\uFE0F ATEN\xC7\xC3O!\n\nVoc\xEA vai MIGRAR todos os lan\xE7amentos de ".concat(de, " para ").concat(para, ".\n\nIsso vai:\n\u2705 Mudar o ano de ").concat(de, " \u2192 ").concat(para, "\n\u2705 Manter o mesmo m\xEAs\n\u2705 Salvar no Firestore\n\nDeseja continuar?"))) {
              _context12.n = 1;
              break;
            }
            return _context12.a(2);
          case 1:
            _context12.p = 1;
            // Migrar receitas
            novasReceitas = receitas.map(function (r) {
              return r.ano === de ? _objectSpread(_objectSpread({}, r), {}, {
                ano: para
              }) : r;
            }); // Migrar cartões
            novosCartoes = cartoes.map(function (c) {
              return c.ano === de ? _objectSpread(_objectSpread({}, c), {}, {
                ano: para
              }) : c;
            }); // Migrar fixos
            novosFixos = gastosFixos.map(function (g) {
              return g.ano === de ? _objectSpread(_objectSpread({}, g), {}, {
                ano: para
              }) : g;
            }); // Migrar variáveis
            novosVariaveis = gastosVariaveis.map(function (g) {
              return g.ano === de ? _objectSpread(_objectSpread({}, g), {}, {
                ano: para
              }) : g;
            }); // Contar quantos foram migrados
            count = {
              receitas: novasReceitas.filter(function (r) {
                return r.ano === para;
              }).length - receitas.filter(function (r) {
                return r.ano === para;
              }).length,
              cartoes: novosCartoes.filter(function (c) {
                return c.ano === para;
              }).length - cartoes.filter(function (c) {
                return c.ano === para;
              }).length,
              fixos: novosFixos.filter(function (g) {
                return g.ano === para;
              }).length - gastosFixos.filter(function (g) {
                return g.ano === para;
              }).length,
              variaveis: novosVariaveis.filter(function (g) {
                return g.ano === para;
              }).length - gastosVariaveis.filter(function (g) {
                return g.ano === para;
              }).length
            }; // Atualizar estados
            setReceitas(novasReceitas);
            setCartoes(novosCartoes);
            setGastosFixos(novosFixos);
            setGastosVariaveis(novosVariaveis);

            // Salvar no Firestore
            if (!(db && user)) {
              _context12.n = 2;
              break;
            }
            _context12.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set({
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: novosCartoes,
                gastosFixos: novosFixos,
                gastosVariaveis: novosVariaveis,
                receitas: novasReceitas,
                farol: farol,
                metas: metas,
                orcamento: orcamento,
                orcamentosMensais: orcamentosMensais,
                orcamentoAnual: orcamentoAnual,
                planejadosMes: planejadosMes,
                comprasParceladas: comprasParceladas
              }
            });
          case 2:
            alert("\u2705 Migra\xE7\xE3o conclu\xEDda!\n\n" + "\uD83D\uDCCA Receitas: ".concat(count.receitas, "\n") + "\uD83D\uDCB3 Cart\xF5es: ".concat(count.cartoes, "\n") + "\uD83C\uDFE0 Fixos: ".concat(count.fixos, "\n") + "\uD83D\uDED2 Vari\xE1veis: ".concat(count.variaveis, "\n\n") + "Total: ".concat(count.receitas + count.cartoes + count.fixos + count.variaveis, " lan\xE7amentos migrados!"));
            _context12.n = 4;
            break;
          case 3:
            _context12.p = 3;
            _t13 = _context12.v;
            alert('❌ Erro na migração: ' + _t13.message);
            console.error(_t13);
          case 4:
            return _context12.a(2);
        }
      }, _callee12, null, [[1, 3]]);
    }));
    return function migrarAno(_x12, _x13) {
      return _ref24.apply(this, arguments);
    };
  }();
  var adicionarReceita = function adicionarReceita(dados) {
    console.log('Adicionando receita:', dados);
    var novaReceita = {
      id: Date.now(),
      categoria: dados.categoria,
      descricao: dados.descricao || '',
      valor: parseFloat(dados.valor),
      mes: mesAtual,
      ano: anoAtual,
      // ADICIONADO
      data: new Date().toLocaleDateString('pt-BR')
    };
    setReceitas([].concat(_toConsumableArray(receitas), [novaReceita]));
    setModalAberto(null);
    alert('Receita adicionada com sucesso!');
  };
  var deletarReceita = function deletarReceita(id) {
    if (confirm('Tem certeza?')) {
      setReceitas(receitas.filter(function (r) {
        return r.id !== id;
      }));
    }
  };
  var editarReceita = /*#__PURE__*/function () {
    var _ref25 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(id, dadosAtualizados) {
      var novasReceitas, dadosBackup, _t14;
      return _regenerator().w(function (_context13) {
        while (1) switch (_context13.p = _context13.n) {
          case 0:
            console.log('📝 editarReceita - ID:', id);
            console.log('📝 editarReceita - dadosAtualizados:', dadosAtualizados);
            console.log('📝 receitas atuais:', receitas);

            // Criar NOVA array para forçar re-render
            novasReceitas = [];
            receitas.forEach(function (r) {
              if (r.id === id) {
                var receitaAtualizada = _objectSpread(_objectSpread(_objectSpread({}, r), dadosAtualizados), {}, {
                  ano: parseInt(dadosAtualizados.ano) || r.ano || 2026,
                  valor: parseFloat(dadosAtualizados.valor) || r.valor
                });
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
            setTimeout(function () {
              setReceitas(novasReceitas);
            }, 10);

            // 🔥 SALVAR IMEDIATAMENTE NO FIRESTORE
            if (!(db && user)) {
              _context13.n = 4;
              break;
            }
            _context13.p = 1;
            dadosBackup = {
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
              dados: {
                cartoes: cartoes,
                gastosFixos: gastosFixos,
                gastosVariaveis: gastosVariaveis,
                receitas: novasReceitas,
                // <- USA A NOVA LISTA!
                farol: farol,
                metas: metas,
                orcamento: orcamento,
                orcamentosMensais: orcamentosMensais,
                orcamentoAnual: orcamentoAnual,
                planejadosMes: planejadosMes,
                comprasParceladas: comprasParceladas
              }
            };
            console.log('💾 Salvando no Firestore...');
            _context13.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
          case 2:
            console.log('✅ Salvo no Firestore com sucesso!');
            _context13.n = 4;
            break;
          case 3:
            _context13.p = 3;
            _t14 = _context13.v;
            console.error('❌ Erro ao salvar no Firestore:', _t14);
            alert('⚠️ Dados atualizados localmente mas erro ao salvar na nuvem: ' + _t14.message);
          case 4:
            setItemEditando(null);
            setTipoEditando(null);
            setModalAberto(null);
            alert('✅ Receita atualizada! Verifique o badge.');
          case 5:
            return _context13.a(2);
        }
      }, _callee13, null, [[1, 3]]);
    }));
    return function editarReceita(_x14, _x15) {
      return _ref25.apply(this, arguments);
    };
  }();
  var duplicarReceita = function duplicarReceita(receita) {
    var novaReceita = _objectSpread(_objectSpread({}, receita), {}, {
      id: Date.now(),
      descricao: receita.descricao + ' (Cópia)'
    });
    setReceitas([].concat(_toConsumableArray(receitas), [novaReceita]));
    alert('✅ Receita duplicada com sucesso!');
  };
  var adicionarPlanejado = function adicionarPlanejado(dados) {
    var novoPlanejado = {
      id: Date.now(),
      mes: mesAtual,
      descricao: dados.descricao,
      valor: parseFloat(dados.valor),
      categoria: dados.categoria,
      executado: false
    };
    setPlanejadosMes([].concat(_toConsumableArray(planejadosMes), [novoPlanejado]));
    setModalAberto(null);
  };
  var togglePlanejado = function togglePlanejado(id) {
    setPlanejadosMes(planejadosMes.map(function (p) {
      return p.id === id ? _objectSpread(_objectSpread({}, p), {}, {
        executado: !p.executado
      }) : p;
    }));
  };
  var deletarPlanejado = function deletarPlanejado(id) {
    if (confirm('Tem certeza?')) {
      setPlanejadosMes(planejadosMes.filter(function (p) {
        return p.id !== id;
      }));
    }
  };
  var editarValorCartao = function editarValorCartao(id, mes, valor) {
    setCartoes(cartoes.map(function (c) {
      if (c.id === id) {
        // Garante que a estrutura do ano existe
        var valoresAtuais = c.valores || {};
        var valoresAno = valoresAtuais[anoAtual] || {};
        return _objectSpread(_objectSpread({}, c), {}, {
          valores: _objectSpread(_objectSpread({}, valoresAtuais), {}, _defineProperty({}, anoAtual, _objectSpread(_objectSpread({}, valoresAno), {}, _defineProperty({}, mes, parseFloat(valor) || 0))))
        });
      }
      return c;
    }));
  };
  var editarValorGastoFixo = function editarValorGastoFixo(id, valor) {
    setGastosFixos(gastosFixos.map(function (g) {
      if (g.id === id) {
        return _objectSpread(_objectSpread({}, g), {}, {
          valor: parseFloat(valor) || 0
        });
      }
      return g;
    }));
  };
  var getStatusFarol = function getStatusFarol(item, mes) {
    var valor = farol["".concat(item, "-").concat(mes, "-").concat(anoAtual)];
    // Compatibilidade: retorna string 'PAGO'/'PENDENTE' ou número (valor pago)
    return valor || 'PENDENTE';
  };
  var toggleFarol = function toggleFarol(item, mes) {
    var chave = "".concat(item, "-").concat(mes, "-").concat(anoAtual);
    setFarol(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, chave, prev[chave] === 'PAGO' ? 'PENDENTE' : 'PAGO'));
    });
  };

  // NOVAS FUNÇÕES para pagamento parcial
  var pagarParcial = function pagarParcial(item, mes, valor) {
    var chave = "".concat(item, "-").concat(mes, "-").concat(anoAtual);
    var atual = farol[chave];
    var jaFoiPago = typeof atual === 'number' ? atual : 0;
    setFarol(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, chave, jaFoiPago + parseFloat(valor)));
    });
  };
  var marcarPago = function marcarPago(item, mes) {
    var chave = "".concat(item, "-").concat(mes, "-").concat(anoAtual);
    setFarol(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, chave, 'PAGO'));
    });
  };
  var exportarPDF = function exportarPDF() {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatorio Financeiro', 20, 20);
    doc.setFontSize(12);
    doc.text("Mes: ".concat(mesAtual), 20, 30);
    var y = 45;
    doc.text("Cartoes: R$ ".concat(totais.cartoes.toFixed(2)), 20, y);
    y += 10;
    doc.text("Gastos Fixos: R$ ".concat(totais.fixos.toFixed(2)), 20, y);
    y += 10;
    doc.text("Gastos Variaveis: R$ ".concat(totais.variaveis.toFixed(2)), 20, y);
    y += 10;
    doc.setFontSize(14);
    doc.text("TOTAL: R$ ".concat(totais.total.toFixed(2)), 20, y);
    doc.save("relatorio-".concat(mesAtual, ".pdf"));
  };
  var exportarExcel = function exportarExcel() {
    var dados = [['Relatório Financeiro', mesAtual], [], ['Categoria', 'Valor'], ['Cartões', totais.cartoes], ['Gastos Fixos', totais.fixos], ['Gastos Variáveis', totais.variaveis], ['TOTAL', totais.total]];
    var ws = XLSX.utils.aoa_to_sheet(dados);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, "relatorio-".concat(mesAtual, ".xlsx"));
  };
  var moverDadosEntreAnos = function moverDadosEntreAnos(anoOrigem, anoDestino) {
    if (!confirm("\u26A0\uFE0F Confirma MOVER todos os dados de ".concat(anoOrigem, " para ").concat(anoDestino, "?\n\nIsso vai:\n\u2705 Copiar cart\xF5es, receitas e gastos\n\u2705 Mover status de pagamentos\n\u26A0\uFE0F APAGAR dados de ").concat(anoOrigem))) {
      return;
    }
    console.log("\uD83D\uDD04 Movendo dados de ".concat(anoOrigem, " para ").concat(anoDestino, "..."));

    // Mover Cartões
    var cartoesAtualizados = cartoes.map(function (cartao) {
      var valoresOriginais = cartao.valores || {};
      var dadosOrigem = valoresOriginais[anoOrigem] || {};
      return _objectSpread(_objectSpread({}, cartao), {}, {
        valores: _objectSpread(_objectSpread({}, valoresOriginais), {}, _defineProperty(_defineProperty({}, anoDestino, dadosOrigem), anoOrigem, {}))
      });
    });

    // Mover Receitas
    var receitasAtualizadas = receitas.map(function (receita) {
      if (receita.ano === anoOrigem) {
        return _objectSpread(_objectSpread({}, receita), {}, {
          ano: anoDestino
        });
      }
      return receita;
    });

    // Mover Gastos Variáveis
    var variaveisAtualizados = gastosVariaveis.map(function (gasto) {
      if (gasto.ano === anoOrigem) {
        return _objectSpread(_objectSpread({}, gasto), {}, {
          ano: anoDestino
        });
      }
      return gasto;
    });

    // Mover Farol
    var farolAtualizado = {};
    Object.keys(farol).forEach(function (chave) {
      if (chave.endsWith("-".concat(anoOrigem))) {
        var novaChave = chave.replace("-".concat(anoOrigem), "-".concat(anoDestino));
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
    alert("\u2705 Dados movidos de ".concat(anoOrigem, " para ").concat(anoDestino, " com sucesso!"));
    console.log('✅ Migração concluída!');
  };
  var fazerBackup = function fazerBackup() {
    try {
      var dadosBackup = {
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
      var json = JSON.stringify(dadosBackup, null, 2);
      var blob = new Blob([json], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = "backup-financeiro-".concat(new Date().toISOString().split('T')[0], ".json");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('✅ Backup realizado com sucesso!\n\nArquivo salvo: backup-financeiro-' + new Date().toISOString().split('T')[0] + '.json');
    } catch (error) {
      alert('❌ Erro ao fazer backup: ' + error.message);
    }
  };
  var restaurarBackup = function restaurarBackup() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (event) {
        try {
          var dadosBackup = JSON.parse(event.target.result);
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
  var salvarNaNuvem = /*#__PURE__*/function () {
    var _ref26 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14() {
      var dadosBackup, _t15;
      return _regenerator().w(function (_context14) {
        while (1) switch (_context14.p = _context14.n) {
          case 0:
            if (!(!db || !user)) {
              _context14.n = 1;
              break;
            }
            alert('⚠️ Erro ao salvar!\n\nVerifique sua conexão.');
            return _context14.a(2);
          case 1:
            _context14.p = 1;
            dadosBackup = {
              versao: '3.0',
              dataBackup: firebase.firestore.FieldValue.serverTimestamp(),
              email: user.email,
              nome: user.displayName,
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
            _context14.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').set(dadosBackup);
          case 2:
            alert('✅ Dados salvos na nuvem com sucesso!\n\n' + 'Seus dados estão seguros e sincronizados.');
            _context14.n = 4;
            break;
          case 3:
            _context14.p = 3;
            _t15 = _context14.v;
            alert('❌ Erro ao salvar na nuvem: ' + _t15.message);
          case 4:
            return _context14.a(2);
        }
      }, _callee14, null, [[1, 3]]);
    }));
    return function salvarNaNuvem() {
      return _ref26.apply(this, arguments);
    };
  }();
  var restaurarDaNuvem = /*#__PURE__*/function () {
    var _ref27 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15() {
      var doc, dadosBackup, _t16;
      return _regenerator().w(function (_context15) {
        while (1) switch (_context15.p = _context15.n) {
          case 0:
            if (!(!db || !user)) {
              _context15.n = 1;
              break;
            }
            alert('⚠️ Erro ao restaurar!\n\nVerifique sua conexão.');
            return _context15.a(2);
          case 1:
            _context15.p = 1;
            _context15.n = 2;
            return db.collection('usuarios').doc(user.uid).collection('backups').doc('atual').get();
          case 2:
            doc = _context15.v;
            if (doc.exists) {
              _context15.n = 3;
              break;
            }
            alert('❌ Nenhum backup encontrado.\n\nSalve seus dados na nuvem primeiro usando o botão ☁️ Nuvem');
            return _context15.a(2);
          case 3:
            dadosBackup = doc.data();
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
            _context15.n = 5;
            break;
          case 4:
            _context15.p = 4;
            _t16 = _context15.v;
            alert('❌ Erro ao restaurar da nuvem: ' + _t16.message);
          case 5:
            return _context15.a(2);
        }
      }, _callee15, null, [[1, 4]]);
    }));
    return function restaurarDaNuvem() {
      return _ref27.apply(this, arguments);
    };
  }();

  // FUNÇÕES DE COMPRAS PARCELADAS
  var adicionarCompraParcelada = function adicionarCompraParcelada(dados) {
    var descricao = dados.descricao,
      cartao = dados.cartao,
      valorTotal = dados.valorTotal,
      parcelas = dados.parcelas,
      mesInicio = dados.mesInicio;
    var valorParcela = valorTotal / parcelas;
    var indiceMesInicio = MESES.indexOf(mesInicio);
    var mesesCompra = [];
    for (var i = 0; i < parcelas; i++) {
      var indiceMes = (indiceMesInicio + i) % 12;
      mesesCompra.push(MESES[indiceMes]);
    }
    var novaCompra = {
      id: Date.now().toString(),
      descricao: descricao,
      cartao: cartao,
      valorTotal: valorTotal,
      totalParcelas: parcelas,
      // CAMPO IMPORTANTE!
      parcelas: parcelas,
      // Mantém por compatibilidade
      valorParcela: valorParcela,
      parcelaPaga: 0,
      // COMEÇA EM ZERO!
      mesInicio: mesInicio,
      meses: mesesCompra
    };
    console.log('💾 Salvando compra parcelada:', novaCompra);
    setComprasParceladas([].concat(_toConsumableArray(comprasParceladas), [novaCompra]));
  };
  var excluirCompraParcelada = function excluirCompraParcelada(id) {
    if (confirm('Tem certeza que deseja excluir esta compra parcelada? Ela será removida de todos os meses.')) {
      setComprasParceladas(comprasParceladas.filter(function (c) {
        return c.id !== id;
      }));
    }
  };
  var calcularParcelasCartao = function calcularParcelasCartao(nomeCartao, mes) {
    return comprasParceladas.filter(function (c) {
      return c.cartao === nomeCartao && c.meses && c.meses.includes(mes);
    }).map(function (c) {
      return _objectSpread(_objectSpread({}, c), {}, {
        parcelaAtual: c.meses.indexOf(mes) + 1
      });
    });
  };

  // Modal Component
  var Modal = function Modal(_ref28) {
    var titulo = _ref28.titulo,
      children = _ref28.children,
      onClose = _ref28.onClose;
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-content",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, titulo), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      className: "text-gray-500 hover:text-gray-700 text-xl font-bold"
    }, "\xD7")), children));
  };

  // Forms
  var FormNovoCartao = function FormNovoCartao() {
    var _useState79 = useState(''),
      _useState80 = _slicedToArray(_useState79, 2),
      nome = _useState80[0],
      setNome = _useState80[1];
    var _useState81 = useState(5),
      _useState82 = _slicedToArray(_useState81, 2),
      vencimento = _useState82[0],
      setVencimento = _useState82[1];
    var _useState83 = useState(''),
      _useState84 = _slicedToArray(_useState83, 2),
      diaFechamento = _useState84[0],
      setDiaFechamento = _useState84[1];
    var _useState85 = useState(''),
      _useState86 = _slicedToArray(_useState85, 2),
      limite = _useState86[0],
      setLimite = _useState86[1];
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      console.log('Submit cartão:', {
        nome: nome,
        vencimento: vencimento,
        diaFechamento: diaFechamento,
        limite: limite
      });
      if (nome.trim()) {
        adicionarCartao({
          nome: nome,
          vencimento: vencimento,
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
      onChange: function onChange(e) {
        return setNome(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setDiaFechamento(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: ".concat(parseInt(vencimento) - 7)
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "Deixe vazio para 7 dias antes do vencimento")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Dia do Vencimento"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: "31",
      value: vencimento,
      onChange: function onChange(e) {
        return setVencimento(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      required: true
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Limite do Cart\xE3o (Opcional)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      min: "0",
      value: limite,
      onChange: function onChange(e) {
        return setLimite(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: 10000.00"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "Deixe vazio se n\xE3o quiser controlar limite")), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2705 Adicionar Cart\xE3o"));
  };
  var FormNovoGastoFixo = function FormNovoGastoFixo() {
    var _useState87 = useState('MORADIA'),
      _useState88 = _slicedToArray(_useState87, 2),
      categoria = _useState88[0],
      setCategoria = _useState88[1];
    var _useState89 = useState(''),
      _useState90 = _slicedToArray(_useState89, 2),
      novaCategoria = _useState90[0],
      setNovaCategoria = _useState90[1];
    var _useState91 = useState(false),
      _useState92 = _slicedToArray(_useState91, 2),
      mostrarNovaCategoria = _useState92[0],
      setMostrarNovaCategoria = _useState92[1];
    var _useState93 = useState(''),
      _useState94 = _slicedToArray(_useState93, 2),
      descricao = _useState94[0],
      setDescricao = _useState94[1];
    var _useState95 = useState(''),
      _useState96 = _slicedToArray(_useState95, 2),
      valor = _useState96[0],
      setValor = _useState96[1];
    var _useState97 = useState(10),
      _useState98 = _slicedToArray(_useState97, 2),
      vencimento = _useState98[0],
      setVencimento = _useState98[1];
    var _useState99 = useState(false),
      _useState100 = _slicedToArray(_useState99, 2),
      temporario = _useState100[0],
      setTemporario = _useState100[1];
    var _useState101 = useState(1),
      _useState102 = _slicedToArray(_useState101, 2),
      totalParcelas = _useState102[0],
      setTotalParcelas = _useState102[1];
    var _useState103 = useState('jan'),
      _useState104 = _slicedToArray(_useState103, 2),
      mesInicio = _useState104[0],
      setMesInicio = _useState104[1];
    var _useState105 = useState(anoAtual),
      _useState106 = _slicedToArray(_useState105, 2),
      anoInicio = _useState106[0],
      setAnoInicio = _useState106[1];

    // Categorias padrão + personalizadas
    var categoriasFixasDefault = ['MORADIA', 'ESTUDO', 'TRANSPORTE', 'SERVIÇOS', 'SAÚDE'];
    var todasCategorias = [].concat(categoriasFixasDefault, _toConsumableArray(categoriasPersonalizadas.gastosFixos));
    var mesesList = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var calcularValorParcela = function calcularValorParcela() {
      if (temporario && valor && totalParcelas > 0) {
        return (parseFloat(valor) / parseInt(totalParcelas)).toFixed(2);
      }
      return valor;
    };
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      var categoriaFinal = categoria;

      // Se está criando nova categoria
      if (mostrarNovaCategoria && novaCategoria.trim()) {
        categoriaFinal = novaCategoria.trim().toUpperCase();

        // Adicionar à lista de categorias personalizadas
        if (!todasCategorias.includes(categoriaFinal)) {
          setCategoriasPersonalizadas(_objectSpread(_objectSpread({}, categoriasPersonalizadas), {}, {
            gastosFixos: [].concat(_toConsumableArray(categoriasPersonalizadas.gastosFixos), [categoriaFinal])
          }));
        }
      }
      if (descricao.trim() && valor) {
        // Se é temporário, criar múltiplas parcelas OU única parcela com mes/ano
        if (temporario && totalParcelas >= 1) {
          var valorParcela = parseFloat(valor) / parseInt(totalParcelas);
          var mesInicioIdx = mesesList.indexOf(mesInicio);

          // CRIAR ARRAY COM TODAS AS PARCELAS PRIMEIRO
          var novasParcelas = [];
          var baseTime = Date.now();
          for (var i = 0; i < parseInt(totalParcelas); i++) {
            // Calcular mês e ano da parcela
            var mesesAFrente = mesInicioIdx + i;
            var mesParcelaIdx = mesesAFrente % 12;
            var anosAFrente = Math.floor(mesesAFrente / 12);
            var mesParcela = mesesList[mesParcelaIdx];
            var anoAtualParcela = anoInicio + anosAFrente;
            var novaParcela = {
              id: baseTime + i,
              categoria: categoriaFinal,
              descricao: totalParcelas > 1 ? "".concat(descricao, " - ").concat(i + 1, "/").concat(totalParcelas) : descricao,
              valor: valorParcela,
              vencimento: parseInt(vencimento),
              temporario: true,
              totalParcelas: parseInt(totalParcelas),
              parcelaAtual: i + 1,
              mes: mesParcela,
              ano: anoAtualParcela
            };
            console.log("\uD83D\uDCE6 Criando parcela ".concat(i + 1, "/").concat(totalParcelas, ": ").concat(mesParcela, "/").concat(anoAtualParcela));
            novasParcelas.push(novaParcela);
          }

          // ADICIONAR TODAS DE UMA VEZ
          setGastosFixos(function (prev) {
            return [].concat(_toConsumableArray(prev), novasParcelas);
          });
          console.log("\u2705 Total de parcelas criadas: ".concat(novasParcelas.length));
          setModalAberto(null);
          alert("\u2705 ".concat(novasParcelas.length, " ").concat(totalParcelas === 1 ? 'gasto temporário criado' : 'parcelas criadas', " com sucesso!"));
        } else {
          // Gasto fixo normal
          var novoGasto = {
            categoria: categoriaFinal,
            descricao: descricao,
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
      onChange: function onChange(e) {
        return setCategoria(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
    }, todasCategorias.map(function (cat) {
      return /*#__PURE__*/React.createElement("option", {
        key: cat,
        value: cat
      }, cat);
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return setMostrarNovaCategoria(true);
      },
      className: "mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: function onChange(e) {
        return setNovaCategoria(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500",
      placeholder: "Ex: PETS, INVESTIMENTOS, ASSINATURAS...",
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mt-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
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
      onChange: function onChange(e) {
        return setDescricao(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setValor(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setVencimento(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "bg-purple-50 border-2 border-purple-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("label", {
      className: "flex items-center gap-2 cursor-pointer"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: temporario,
      onChange: function onChange(e) {
        return setTemporario(e.target.checked);
      },
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
      onChange: function onChange(e) {
        return setTotalParcelas(e.target.value);
      },
      className: "w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm",
      placeholder: "3",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "M\xEAs de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: mesInicio,
      onChange: function onChange(e) {
        return setMesInicio(e.target.value);
      },
      className: "w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
    }, mesesList.map(function (mes, idx) {
      return /*#__PURE__*/React.createElement("option", {
        key: mes,
        value: mes
      }, mesesNomes[idx]);
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-xs font-semibold text-gray-700 mb-1"
    }, "Ano de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: anoInicio,
      onChange: function onChange(e) {
        return setAnoInicio(parseInt(e.target.value));
      },
      className: "w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-sm"
    }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(function (ano) {
      return /*#__PURE__*/React.createElement("option", {
        key: ano,
        value: ano
      }, ano);
    })))), /*#__PURE__*/React.createElement("div", {
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
    }, temporario ? "\u2705 Criar ".concat(totalParcelas, " Parcelas") : '✅ Adicionar Gasto Fixo'));
  };
  var FormNovoGastoVariavel = function FormNovoGastoVariavel() {
    var _useState107 = useState('MERCADO'),
      _useState108 = _slicedToArray(_useState107, 2),
      categoria = _useState108[0],
      setCategoria = _useState108[1];
    var _useState109 = useState(''),
      _useState110 = _slicedToArray(_useState109, 2),
      novaCategoria = _useState110[0],
      setNovaCategoria = _useState110[1];
    var _useState111 = useState(false),
      _useState112 = _slicedToArray(_useState111, 2),
      mostrarNovaCategoria = _useState112[0],
      setMostrarNovaCategoria = _useState112[1];
    var _useState113 = useState(''),
      _useState114 = _slicedToArray(_useState113, 2),
      descricao = _useState114[0],
      setDescricao = _useState114[1];
    var _useState115 = useState(''),
      _useState116 = _slicedToArray(_useState115, 2),
      valor = _useState116[0],
      setValor = _useState116[1];
    var _useState117 = useState(false),
      _useState118 = _slicedToArray(_useState117, 2),
      mostrarNoFarol = _useState118[0],
      setMostrarNoFarol = _useState118[1];

    // Categorias padrão + personalizadas
    var categoriasVariaveisDefault = ['MERCADO', 'FARMÁCIA', 'ALIMENTAÇÃO', 'TRANSPORTE', 'GASOLINA', 'LAZER'];
    var todasCategorias = [].concat(categoriasVariaveisDefault, _toConsumableArray(categoriasPersonalizadas.gastosVariaveis));
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      var categoriaFinal = categoria;

      // Se está criando nova categoria
      if (mostrarNovaCategoria && novaCategoria.trim()) {
        categoriaFinal = novaCategoria.trim().toUpperCase();

        // Adicionar à lista de categorias personalizadas
        if (!todasCategorias.includes(categoriaFinal)) {
          setCategoriasPersonalizadas(_objectSpread(_objectSpread({}, categoriasPersonalizadas), {}, {
            gastosVariaveis: [].concat(_toConsumableArray(categoriasPersonalizadas.gastosVariaveis), [categoriaFinal])
          }));
        }
      }
      if (valor) {
        var dataInput = document.getElementById('dataGastoVariavel').value;
        var dataObj = new Date(dataInput + 'T00:00:00');
        var dataFormatada = dataObj.toLocaleDateString('pt-BR');
        var dia = dataObj.getDate();
        adicionarGastoVariavel({
          categoria: categoriaFinal,
          descricao: descricao,
          valor: valor,
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
      onChange: function onChange(e) {
        return setCategoria(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
    }, todasCategorias.map(function (cat) {
      return /*#__PURE__*/React.createElement("option", {
        key: cat,
        value: cat
      }, cat);
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return setMostrarNovaCategoria(true);
      },
      className: "mt-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: function onChange(e) {
        return setNovaCategoria(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500",
      placeholder: "Ex: VESTU\xC1RIO, ELETR\xD4NICOS, PRESENTES...",
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mt-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
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
      onChange: function onChange(e) {
        return setDescricao(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500",
      placeholder: "Ex: Supermercado Extra"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: function onChange(e) {
        return setValor(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setMostrarNoFarol(e.target.checked);
      },
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
  var FormNovoGastoExtra = function FormNovoGastoExtra() {
    var _useState119 = useState('VIAGEM'),
      _useState120 = _slicedToArray(_useState119, 2),
      categoria = _useState120[0],
      setCategoria = _useState120[1];
    var _useState121 = useState(''),
      _useState122 = _slicedToArray(_useState121, 2),
      novaCategoria = _useState122[0],
      setNovaCategoria = _useState122[1];
    var _useState123 = useState(false),
      _useState124 = _slicedToArray(_useState123, 2),
      mostrarNovaCategoria = _useState124[0],
      setMostrarNovaCategoria = _useState124[1];
    var _useState125 = useState(''),
      _useState126 = _slicedToArray(_useState125, 2),
      descricao = _useState126[0],
      setDescricao = _useState126[1];
    var _useState127 = useState(''),
      _useState128 = _slicedToArray(_useState127, 2),
      valor = _useState128[0],
      setValor = _useState128[1];
    var _useState129 = useState(false),
      _useState130 = _slicedToArray(_useState129, 2),
      mostrarNoFarol = _useState130[0],
      setMostrarNoFarol = _useState130[1];

    // Categorias padrão para gastos extras
    var categoriasExtrasDefault = ['VIAGEM', 'PRESENTE', 'EMERGÊNCIA', 'MÉDICO', 'VETERINÁRIO', 'MANUTENÇÃO', 'REFORMA', 'FESTA'];
    var todasCategorias = [].concat(categoriasExtrasDefault, _toConsumableArray(categoriasPersonalizadas.gastosExtras || []));
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      var categoriaFinal = categoria;
      if (mostrarNovaCategoria && novaCategoria.trim()) {
        categoriaFinal = novaCategoria.trim().toUpperCase();
        if (!todasCategorias.includes(categoriaFinal)) {
          setCategoriasPersonalizadas(_objectSpread(_objectSpread({}, categoriasPersonalizadas), {}, {
            gastosExtras: [].concat(_toConsumableArray(categoriasPersonalizadas.gastosExtras || []), [categoriaFinal])
          }));
        }
      }
      if (valor) {
        var dataInput = document.getElementById('dataGastoExtra').value;
        var dataObj = new Date(dataInput + 'T00:00:00');
        var dataFormatada = dataObj.toLocaleDateString('pt-BR');
        var dia = dataObj.getDate();
        var novoGasto = {
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
        setGastosExtras([].concat(_toConsumableArray(gastosExtras), [novoGasto]));
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
      onChange: function onChange(e) {
        return setCategoria(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500"
    }, todasCategorias.map(function (cat) {
      return /*#__PURE__*/React.createElement("option", {
        key: cat,
        value: cat
      }, cat);
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return setMostrarNovaCategoria(true);
      },
      className: "mt-2 text-sm text-amber-600 hover:text-amber-700 font-semibold"
    }, "\u2795 Criar nova categoria")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: novaCategoria,
      onChange: function onChange(e) {
        return setNovaCategoria(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500",
      placeholder: "Ex: CURSO, EQUIPAMENTO...",
      autoFocus: true
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
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
      onChange: function onChange(e) {
        return setDescricao(e.target.value);
      },
      className: "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500",
      placeholder: "Ex: Passagem a\xE9rea"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor (R$)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: function onChange(e) {
        return setValor(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setMostrarNoFarol(e.target.checked);
      },
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
  var FormMetas = function FormMetas() {
    var _useState131 = useState(metas),
      _useState132 = _slicedToArray(_useState131, 2),
      metasTemp = _useState132[0],
      setMetasTemp = _useState132[1];
    var handleSalvar = function handleSalvar() {
      setMetas(metasTemp);
      setModalAberto(null);
      alert('Metas salvas com sucesso!');
    };
    var aplicarParaTodos = function aplicarParaTodos() {
      var valor = metasTemp.mensal;
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
      onChange: function onChange(e) {
        return setMetasTemp(_objectSpread(_objectSpread({}, metasTemp), {}, {
          mensal: parseFloat(e.target.value) || 0
        }));
      },
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
    }, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(function (mes) {
      return /*#__PURE__*/React.createElement("div", {
        key: mes
      }, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-semibold text-gray-700 mb-1 uppercase"
      }, mes), /*#__PURE__*/React.createElement("input", {
        type: "number",
        step: "0.01",
        value: metasTemp[mes],
        onChange: function onChange(e) {
          return setMetasTemp(_objectSpread(_objectSpread({}, metasTemp), {}, _defineProperty({}, mes, parseFloat(e.target.value) || 0)));
        },
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      }));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "pt-4 border-t"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-3"
    }, /*#__PURE__*/React.createElement("strong", null, "Total Anual:"), " R$ ", (metasTemp.jan + metasTemp.fev + metasTemp.mar + metasTemp.abr + metasTemp.mai + metasTemp.jun + metasTemp.jul + metasTemp.ago + metasTemp.set + metasTemp.out + metasTemp.nov + metasTemp.dez).toFixed(2)), /*#__PURE__*/React.createElement("button", {
      onClick: handleSalvar,
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Salvar Metas")));
  };
  var FormOrcamento = function FormOrcamento() {
    var _useState133 = useState(orcamento.cartoes),
      _useState134 = _slicedToArray(_useState133, 2),
      cartoes = _useState134[0],
      setCartoes = _useState134[1];
    var _useState135 = useState(orcamento.fixos),
      _useState136 = _slicedToArray(_useState135, 2),
      fixos = _useState136[0],
      setFixos = _useState136[1];
    var _useState137 = useState(orcamento.variaveis),
      _useState138 = _slicedToArray(_useState137, 2),
      variaveis = _useState138[0],
      setVariaveis = _useState138[1];
    var handleSalvar = function handleSalvar() {
      setOrcamento({
        cartoes: parseFloat(cartoes) || 0,
        fixos: parseFloat(fixos) || 0,
        variaveis: parseFloat(variaveis) || 0
      });
      setModalAberto(null);
      alert('Orçamento salvo com sucesso!');
    };
    var total = (parseFloat(cartoes) || 0) + (parseFloat(fixos) || 0) + (parseFloat(variaveis) || 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCB3 Or\xE7amento para Cart\xF5es"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: cartoes,
      onChange: function onChange(e) {
        return setCartoes(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "8000.00"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83C\uDFE0 Or\xE7amento para Gastos Fixos"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: fixos,
      onChange: function onChange(e) {
        return setFixos(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "5500.00"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCCA Or\xE7amento para Gastos Vari\xE1veis"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: variaveis,
      onChange: function onChange(e) {
        return setVariaveis(e.target.value);
      },
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
  var FormPlanejado = function FormPlanejado() {
    var _useState139 = useState(''),
      _useState140 = _slicedToArray(_useState139, 2),
      descricao = _useState140[0],
      setDescricao = _useState140[1];
    var _useState141 = useState(''),
      _useState142 = _slicedToArray(_useState141, 2),
      valor = _useState142[0],
      setValor = _useState142[1];
    var _useState143 = useState('CARTÃO'),
      _useState144 = _slicedToArray(_useState143, 2),
      categoria = _useState144[0],
      setCategoria = _useState144[1];
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      if (descricao && valor) {
        adicionarPlanejado({
          descricao: descricao,
          valor: valor,
          categoria: categoria
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
      onChange: function onChange(e) {
        return setDescricao(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Aluguel, Mercado, Gasolina...",
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Categoria"), /*#__PURE__*/React.createElement("select", {
      value: categoria,
      onChange: function onChange(e) {
        return setCategoria(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setValor(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Adicionar Planejado"));
  };
  var FormCompraParcelada = function FormCompraParcelada() {
    var _cartoes$;
    var _useState145 = useState(''),
      _useState146 = _slicedToArray(_useState145, 2),
      descricao = _useState146[0],
      setDescricao = _useState146[1];
    var _useState147 = useState(((_cartoes$ = cartoes[0]) === null || _cartoes$ === void 0 ? void 0 : _cartoes$.nome) || ''),
      _useState148 = _slicedToArray(_useState147, 2),
      cartao = _useState148[0],
      setCartao = _useState148[1];
    var _useState149 = useState(''),
      _useState150 = _slicedToArray(_useState149, 2),
      valorTotal = _useState150[0],
      setValorTotal = _useState150[1];
    var _useState151 = useState('1'),
      _useState152 = _slicedToArray(_useState151, 2),
      parcelas = _useState152[0],
      setParcelas = _useState152[1];
    var _useState153 = useState(mesAtual),
      _useState154 = _slicedToArray(_useState153, 2),
      mesInicio = _useState154[0],
      setMesInicio = _useState154[1];
    var valorParcela = valorTotal && parcelas ? (parseFloat(valorTotal) / parseInt(parcelas)).toFixed(2) : 0;
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      if (descricao && cartao && valorTotal && parcelas) {
        adicionarCompraParcelada({
          descricao: descricao,
          cartao: cartao,
          valorTotal: parseFloat(valorTotal),
          parcelas: parseInt(parcelas),
          mesInicio: mesInicio
        });
        setModalAberto(null);
        alert('✅ Compra parcelada adicionada com sucesso!');
      } else {
        alert('❌ Preencha todos os campos!');
      }
    };
    var indiceMesInicio = MESES.indexOf(mesInicio);
    var mesesPreview = [];
    for (var i = 0; i < Math.min(parseInt(parcelas) || 0, 12); i++) {
      var indiceMes = (indiceMesInicio + i) % 12;
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
      onChange: function onChange(e) {
        return setDescricao(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Notebook Dell, Geladeira Samsung...",
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Cart\xE3o"), /*#__PURE__*/React.createElement("select", {
      value: cartao,
      onChange: function onChange(e) {
        return setCartao(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      required: true
    }, cartoes.map(function (c) {
      return /*#__PURE__*/React.createElement("option", {
        key: c.nome,
        value: c.nome
      }, "\uD83D\uDCB3 ", c.nome);
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor Total"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valorTotal,
      onChange: function onChange(e) {
        return setValorTotal(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "1200.00",
      required: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Parcelas"), /*#__PURE__*/React.createElement("select", {
      value: parcelas,
      onChange: function onChange(e) {
        return setParcelas(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      required: true
    }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24].map(function (num) {
      return /*#__PURE__*/React.createElement("option", {
        key: num,
        value: num
      }, num, "x");
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "M\xEAs de In\xEDcio"), /*#__PURE__*/React.createElement("select", {
      value: mesInicio,
      onChange: function onChange(e) {
        return setMesInicio(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg"
    }, MESES.map(function (mes) {
      return /*#__PURE__*/React.createElement("option", {
        key: mes,
        value: mes
      }, mes.toUpperCase());
    }))), valorTotal && parcelas && /*#__PURE__*/React.createElement("div", {
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
  var FormNovaReceita = function FormNovaReceita() {
    var _useState155 = useState('SALÁRIO'),
      _useState156 = _slicedToArray(_useState155, 2),
      categoria = _useState156[0],
      setCategoria = _useState156[1];
    var _useState157 = useState(''),
      _useState158 = _slicedToArray(_useState157, 2),
      descricao = _useState158[0],
      setDescricao = _useState158[1];
    var _useState159 = useState(''),
      _useState160 = _slicedToArray(_useState159, 2),
      valor = _useState160[0],
      setValor = _useState160[1];
    var handleSubmit = function handleSubmit(e) {
      e.preventDefault();
      console.log('Submit receita:', {
        categoria: categoria,
        descricao: descricao,
        valor: valor
      });
      if (valor) {
        adicionarReceita({
          categoria: categoria,
          descricao: descricao,
          valor: valor
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
      onChange: function onChange(e) {
        return setCategoria(e.target.value);
      },
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
      onChange: function onChange(e) {
        return setDescricao(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "Ex: Sal\xE1rio CLT"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "Valor"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "0.01",
      value: valor,
      onChange: function onChange(e) {
        return setValor(e.target.value);
      },
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2705 Adicionar Receita"));
  };

  // Screens
  var Dashboard = function Dashboard() {
    var progressoMeta = metas.mensal > 0 ? totais.total / metas.mensal * 100 : 0;
    var economia = metas.mensal - totais.total;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-7 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: '14px',
        padding: '14px',
        boxShadow: '0 4px 16px rgba(49,46,129,0.25)',
        border: '1px solid rgba(99,102,241,0.3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        letterSpacing: '0.8px',
        marginBottom: '4px'
      }
    }, "\u2714\uFE0F PAGOS"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#fff',
        lineHeight: 1
      }
    }, pagamentos.percentual.toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        marginTop: '4px'
      }
    }, pagamentos.qtdPago, "/", pagamentos.qtdTotal)), metaMensal > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        borderRadius: '14px',
        padding: '14px',
        boxShadow: '0 4px 16px rgba(6,95,70,0.25)',
        border: '1px solid rgba(16,185,129,0.3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        letterSpacing: '0.8px',
        marginBottom: '4px'
      }
    }, "\uD83C\uDFAF META ", mesAtual.toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#fff',
        lineHeight: 1
      }
    }, (totais.total / metaMensal * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        marginTop: '4px'
      }
    }, "R$ ", metaMensal.toFixed(0))) : /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        borderRadius: '14px',
        padding: '14px',
        boxShadow: '0 4px 16px rgba(6,95,70,0.25)',
        border: '1px solid rgba(16,185,129,0.3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        letterSpacing: '0.8px',
        marginBottom: '4px'
      }
    }, "\uD83C\uDFAF META"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#fff',
        lineHeight: 1
      }
    }, "-"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        marginTop: '4px'
      }
    }, "N\xE3o definida")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
        borderRadius: '14px',
        padding: '14px',
        boxShadow: '0 4px 16px rgba(124,45,18,0.25)',
        border: '1px solid rgba(251,146,60,0.3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        letterSpacing: '0.8px',
        marginBottom: '4px'
      }
    }, "\u23F3 PENDENTES"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-1 text-gray-900"
    }, function () {
      var hoje = new Date().getDate();
      var pendentes = [].concat(_toConsumableArray(cartoes.map(function (c) {
        return {
          nome: c.nome,
          vencimento: c.vencimento,
          status: getStatusFarol(c.nome, mesAtual)
        };
      })), _toConsumableArray(gastosFixos.map(function (g) {
        return {
          nome: g.descricao,
          vencimento: g.vencimento,
          status: getStatusFarol(g.descricao, mesAtual)
        };
      }))).filter(function (v) {
        return v.vencimento >= hoje && v.status === 'PENDENTE';
      }).length;
      return pendentes;
    }()), /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500 mt-1"
    }, "A pagar")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'white',
        border: '1px solid #E5E7EB'
      },
      className: "rounded-xl shadow-sm compact-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500"
    }, "\uD83D\uDCB3 CART\xD5ES"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-1 text-gray-900"
    }, "R$ ", totais.cartoes.toFixed(0))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'white',
        border: '1px solid #E5E7EB'
      },
      className: "rounded-xl shadow-sm compact-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500"
    }, "\uD83C\uDFE0 FIXOS"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-1 text-gray-900"
    }, "R$ ", totais.fixos.toFixed(0))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'white',
        border: '1px solid #E5E7EB'
      },
      className: "rounded-xl shadow-sm compact-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500"
    }, "\uD83D\uDCCA VARI\xC1VEIS"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-1 text-gray-900"
    }, "R$ ", totais.variaveis.toFixed(0))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'white',
        border: '1px solid #E5E7EB'
      },
      className: "rounded-xl shadow-sm compact-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500"
    }, "\uD83D\uDCB0 TOTAL"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mt-1 text-gray-900"
    }, "R$ ", totais.total.toFixed(0)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'white',
        border: '1px solid #E5E7EB'
      },
      className: "rounded-xl shadow-sm compact-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500 mb-1"
    }, "\uD83D\uDCB0 Receitas"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-gray-900"
    }, "R$ ", saldo.receitas.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-500 mb-1"
    }, "\uD83D\uDCB8 Despesas"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold text-gray-900"
    }, "R$ ", saldo.despesas.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "text-center border-l-2",
      style: {
        borderColor: saldo.positivo ? '#10B981' : '#EF4444'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs mb-1",
      style: {
        color: saldo.positivo ? '#10B981' : '#EF4444',
        fontWeight: '600'
      }
    }, saldo.positivo ? '✅ Positivo' : '⚠️ Negativo'), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold",
      style: {
        color: saldo.positivo ? '#10B981' : '#EF4444'
      }
    }, saldo.positivo ? '+' : '-', "R$ ", Math.abs(saldo.saldo).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "mt-3 flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novaReceita');
      },
      className: "px-4 py-2 rounded-lg font-semibold transition-all",
      style: {
        background: '#3B82F6',
        color: 'white'
      },
      onMouseOver: function onMouseOver(e) {
        return e.target.style.background = '#2563EB';
      },
      onMouseOut: function onMouseOut(e) {
        return e.target.style.background = '#3B82F6';
      }
    }, "\u2795 Adicionar Receita"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-sm compact-card",
      style: {
        border: '1px solid #E5E7EB'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "compact-title font-bold text-gray-800"
    }, "\uD83D\uDCCA Distribui\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center",
      style: {
        height: '200px'
      }
    }, /*#__PURE__*/React.createElement("canvas", {
      id: "chartPieGastos",
      width: "200",
      height: "200"
    })), React.useEffect(function () {
      var ctx = document.getElementById('chartPieGastos');
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
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function label(context) {
                    var value = context.parsed;
                    var total = context.dataset.data.reduce(function (a, b) {
                      return a + b;
                    }, 0);
                    var percentage = (value / total * 100).toFixed(1);
                    return "".concat(context.label, ": R$ ").concat(value.toFixed(2), " (").concat(percentage, "%)");
                  }
                }
              }
            }
          }
        });
      }
    }, [totais]), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-center text-xs text-gray-600"
    }, "Total: R$ ", totais.total.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-sm compact-card",
      style: {
        border: '1px solid #E5E7EB'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "compact-title font-bold text-gray-800"
    }, "\uD83D\uDCC8 Real vs Or\xE7ado"), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center",
      style: {
        height: '200px'
      }
    }, /*#__PURE__*/React.createElement("canvas", {
      id: "chartBarOrcamento",
      width: "200",
      height: "200"
    })), React.useEffect(function () {
      var ctx = document.getElementById('chartBarOrcamento');
      if (ctx && window.Chart) {
        var orcadoTotal = orcamento.cartoes + orcamento.fixos + orcamento.variaveis;
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
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function label(context) {
                    return "".concat(context.dataset.label, ": R$ ").concat(context.parsed.y.toFixed(2));
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function callback(value) {
                    return "R$ ".concat(value.toFixed(0));
                  }
                }
              }
            }
          }
        });
      }
    }, [totais, orcamento]))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-sm compact-card",
      style: {
        border: '1px solid #E5E7EB'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-3"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "compact-title font-bold text-gray-800"
    }, "\uD83D\uDCB0 Pagamentos - ", mesAtual.toUpperCase()), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setTelaAtiva('farol');
      },
      className: "px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
    }, "Ver Todos \u2192")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-3 mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#F0F9FF',
        border: '1px solid #BFDBFE'
      },
      className: "rounded-lg p-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-600"
    }, "Total"), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold",
      style: {
        color: '#3B82F6'
      }
    }, "R$ ", pagamentos.total.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#F0FDF4',
        border: '1px solid #BBF7D0'
      },
      className: "rounded-lg p-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-600"
    }, "\u2705 Pago"), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold",
      style: {
        color: '#10B981'
      }
    }, "R$ ", pagamentos.pago.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFBEB',
        border: '1px solid #FDE68A'
      },
      className: "rounded-lg p-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-gray-600"
    }, "\u23F3 Pendente"), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold",
      style: {
        color: '#F59E0B'
      }
    }, "R$ ", pagamentos.pendente.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-xs mb-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-gray-700"
    }, "Progresso"), /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-gray-800"
    }, pagamentos.percentual.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 rounded-full transition-all ".concat(pagamentos.percentual >= 100 ? 'bg-green-500' : pagamentos.percentual >= 50 ? 'bg-yellow-500' : 'bg-red-500'),
      style: {
        width: "".concat(Math.min(pagamentos.percentual, 100), "%")
      }
    }))), pagamentos.items.slice(0, 5).length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-semibold text-gray-700 mb-2"
    }, "Pr\xF3ximos Pagamentos:"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, pagamentos.items.slice(0, 5).map(function (item, idx) {
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "flex justify-between items-center p-2 bg-gray-50 rounded"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-lg"
      }, item.pago ? '✅' : '⏳'), /*#__PURE__*/React.createElement("span", {
        className: "font-medium ".concat(item.pago ? 'text-gray-500 line-through' : 'text-gray-800')
      }, item.nome)), /*#__PURE__*/React.createElement("span", {
        className: "font-bold ".concat(item.pago ? 'text-green-600' : 'text-gray-800')
      }, "R$ ", item.valor.toFixed(2)));
    })))), function () {
      var _React$useState3 = React.useState(false),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        expandido = _React$useState4[0],
        setExpandido = _React$useState4[1];
      var mesesComDados = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].filter(function (mes) {
        return calcularTotais(mes).total > 0;
      });
      var totalGastoAnoAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].reduce(function (sum, mes) {
        return sum + calcularTotais(mes).total;
      }, 0);
      var totalMetaAno = metas.jan + metas.fev + metas.mar + metas.abr + metas.mai + metas.jun + metas.jul + metas.ago + metas.set + metas.out + metas.nov + metas.dez;
      return /*#__PURE__*/React.createElement("div", {
        className: "bg-white rounded-xl shadow-lg overflow-hidden"
      }, /*#__PURE__*/React.createElement("div", {
        onClick: function onClick() {
          return setExpandido(!expandido);
        },
        className: "p-6 cursor-pointer hover:bg-gray-50 transition-colors"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
        className: "text-xl font-bold text-gray-800 flex items-center gap-2"
      }, "\uD83D\uDCCA Resumo Anual 2025", /*#__PURE__*/React.createElement("span", {
        className: "text-2xl transition-transform ".concat(expandido ? 'rotate-180' : '')
      }, "\u25BC")), /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-600 mt-1"
      }, mesesComDados.length, " meses com dados \u2022 R$ ", totalGastoAnoAteAgora.toFixed(2), " gastos no ano")), /*#__PURE__*/React.createElement("button", {
        className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700",
        onClick: function onClick(e) {
          e.stopPropagation();
          setTelaAtiva('planejamento');
        }
      }, "Ver Detalhes"))), expandido && /*#__PURE__*/React.createElement("div", {
        className: "px-4 pb-6 border-t"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mt-4 space-y-2"
      }, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(function (mes) {
        var gasto = calcularTotais(mes).total;
        var meta = metas[mes] || 0;
        var percentual = meta > 0 ? gasto / meta * 100 : 0;
        var dentroMeta = gasto <= meta && gasto > 0;
        var semDados = gasto === 0;
        var mesAtualBool = mes === mesAtual;
        return /*#__PURE__*/React.createElement("div", {
          key: mes,
          onClick: function onClick() {
            return setMesAtual(mes);
          },
          className: "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ".concat(mesAtualBool ? 'bg-blue-50 border-2 border-blue-300' : 'hover:bg-gray-50')
        }, /*#__PURE__*/React.createElement("div", {
          className: "w-12 text-center"
        }, mesAtualBool && /*#__PURE__*/React.createElement("span", {
          className: "text-blue-600 font-bold"
        }, "\u25BA")), /*#__PURE__*/React.createElement("div", {
          className: "w-16"
        }, /*#__PURE__*/React.createElement("span", {
          className: "font-bold text-gray-800 uppercase"
        }, mes)), /*#__PURE__*/React.createElement("div", {
          className: "w-32"
        }, /*#__PURE__*/React.createElement("span", {
          className: "font-semibold ".concat(semDados ? 'text-gray-400' : 'text-gray-800')
        }, "R$ ", gasto.toFixed(0))), /*#__PURE__*/React.createElement("div", {
          className: "flex-1"
        }, /*#__PURE__*/React.createElement("div", {
          className: "w-full bg-gray-200 rounded-full h-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "h-3 rounded-full transition-all ".concat(semDados ? 'bg-gray-300' : dentroMeta ? 'bg-green-500' : 'bg-red-500'),
          style: {
            width: meta > 0 ? "".concat(Math.min(gasto / meta * 100, 100), "%") : '0%'
          }
        }))), /*#__PURE__*/React.createElement("div", {
          className: "w-24 text-right"
        }, /*#__PURE__*/React.createElement("span", {
          className: "font-bold ".concat(semDados ? 'text-gray-400' : dentroMeta ? 'text-green-600' : 'text-red-600')
        }, semDados ? '-' : "".concat(percentual.toFixed(0), "%"))), /*#__PURE__*/React.createElement("div", {
          className: "w-12 text-center text-2xl"
        }, semDados ? '⏳' : dentroMeta ? '✅' : '❌'));
      })), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 pt-4 border-t grid grid-cols-2 gap-4 text-sm"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Total Gasto (Ano):"), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-gray-800 ml-2"
      }, "R$ ", totalGastoAnoAteAgora.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Meta Anual:"), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-gray-800 ml-2"
      }, "R$ ", totalMetaAno.toFixed(2))))));
    }(), comparacao.temAnterior && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCCA Compara\xE7\xE3o com M\xEAs Anterior"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "M\xEAs Anterior (", comparacao.mesAnterior.toUpperCase(), ")"), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold text-gray-800"
    }, "R$ ", comparacao.totaisAnterior.total.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-300"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-blue-600 font-semibold"
    }, "M\xEAs Atual (", mesAtual.toUpperCase(), ")"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-800"
    }, "R$ ", comparacao.totaisAtual.total.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "p-6 rounded-xl text-center ".concat(comparacao.aumentou ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600', " text-white")
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90"
    }, "Varia\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold mt-2"
    }, comparacao.aumentou ? '↗️' : '↘️', " ", Math.abs(comparacao.variacao), "%"), /*#__PURE__*/React.createElement("div", {
      className: "text-lg mt-2"
    }, comparacao.aumentou ? '+' : '-', " R$ ", Math.abs(comparacao.diferenca).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm mt-3 opacity-90"
    }, comparacao.aumentou ? '⚠️ Você gastou MAIS este mês' : '✅ Você gastou MENOS este mês'))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-semibold text-gray-700"
    }, "Comparativo Detalhado:"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDCB3 Cart\xF5es"), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "R$ ", comparacao.totaisAtual.cartoes.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs ".concat(comparacao.totaisAtual.cartoes > comparacao.totaisAnterior.cartoes ? 'text-red-600' : 'text-green-600')
    }, comparacao.totaisAtual.cartoes > comparacao.totaisAnterior.cartoes ? '↗️' : '↘️', ' ', "R$ ", Math.abs(comparacao.totaisAtual.cartoes - comparacao.totaisAnterior.cartoes).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83C\uDFE0 Fixos"), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "R$ ", comparacao.totaisAtual.fixos.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs ".concat(comparacao.totaisAtual.fixos > comparacao.totaisAnterior.fixos ? 'text-red-600' : 'text-green-600')
    }, comparacao.totaisAtual.fixos > comparacao.totaisAnterior.fixos ? '↗️' : '↘️', ' ', "R$ ", Math.abs(comparacao.totaisAtual.fixos - comparacao.totaisAnterior.fixos).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "\uD83D\uDCCA Vari\xE1veis"), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "R$ ", comparacao.totaisAtual.variaveis.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-xs ".concat(comparacao.totaisAtual.variaveis > comparacao.totaisAnterior.variaveis ? 'text-red-600' : 'text-green-600')
    }, comparacao.totaisAtual.variaveis > comparacao.totaisAnterior.variaveis ? '↗️' : '↘️', ' ', "R$ ", Math.abs(comparacao.totaisAtual.variaveis - comparacao.totaisAnterior.variaveis).toFixed(2))))), comparacao.melhorMes && comparacao.piorMes && /*#__PURE__*/React.createElement("div", {
      className: "mt-4 pt-4 border-t space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-green-600 font-semibold"
    }, "\uD83C\uDFC6 MELHOR M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-green-700"
    }, comparacao.melhorMes.mes.toUpperCase())), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold text-green-600"
    }, "R$ ", comparacao.melhorMes.total.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-red-600 font-semibold"
    }, "\uD83D\uDCC9 PIOR M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-red-700"
    }, comparacao.piorMes.mes.toUpperCase())), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold text-red-600"
    }, "R$ ", comparacao.piorMes.total.toFixed(2))))))), insights.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCA1 Insights e Alertas Inteligentes"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, insights.map(function (insight, idx) {
      var cores = {
        red: 'bg-red-50 border-red-200 text-red-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800'
      };
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "p-4 rounded-lg border-l-4 ".concat(cores[insight.cor])
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-start gap-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-2xl"
      }, insight.icone), /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "font-bold mb-1"
      }, insight.titulo), /*#__PURE__*/React.createElement("div", {
        className: "text-sm"
      }, insight.mensagem))));
    })), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 pt-4 border-t text-sm text-gray-600"
    }, "\uD83D\uDCA1 ", /*#__PURE__*/React.createElement("strong", null, "Dica:"), " Estes insights s\xE3o gerados automaticamente com base nos seus gastos e metas.")), metas.mensal > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83C\uDFAF Meta Mensal"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('metas');
      },
      className: "text-blue-600 hover:text-blue-700 text-sm font-semibold"
    }, "Editar")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm"
    }, /*#__PURE__*/React.createElement("span", null, "Gasto Atual"), /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, "R$ ", totais.total.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm"
    }, /*#__PURE__*/React.createElement("span", null, "Meta"), /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, "R$ ", metas.mensal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 rounded-full ".concat(progressoMeta > 100 ? 'bg-red-500' : progressoMeta > 80 ? 'bg-yellow-500' : 'bg-green-500'),
      style: {
        width: "".concat(Math.min(progressoMeta, 100), "%")
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-2xl font-bold",
      style: {
        color: progressoMeta > 100 ? '#ef4444' : progressoMeta > 80 ? '#f59e0b' : '#10b981'
      }
    }, progressoMeta.toFixed(1), "%"), economia > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "text-green-600 font-semibold"
    }, "\u2705 Economizou R$ ", economia.toFixed(2)) : /*#__PURE__*/React.createElement("span", {
      className: "text-red-600 font-semibold"
    }, "\u274C Ultrapassou R$ ", Math.abs(economia).toFixed(2))))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-4"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoCartao');
      },
      className: "px-4 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2795 Novo Cart\xE3o"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoGastoFixo');
      },
      className: "px-4 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
    }, "\u2795 Gasto Fixo"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoGastoVariavel');
      },
      className: "px-4 py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
    }, "\u2795 Gasto Vari\xE1vel"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('metas');
      },
      className: "px-4 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\uD83C\uDFAF Definir Metas")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCE4 Exportar Dados"), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: exportarPDF,
      className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
    }, "\uD83D\uDCC4 Baixar PDF"), /*#__PURE__*/React.createElement("button", {
      onClick: exportarExcel,
      className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\uD83D\uDCCA Baixar Excel"))));
  };

  // 👑 PAINEL DE ADMINISTRAÇÃO
  var TelaAdmin = function TelaAdmin(_ref29) {
    var isUserAdminProp = _ref29.isUserAdmin;
    var _useState161 = useState([]),
      _useState162 = _slicedToArray(_useState161, 2),
      usuarios = _useState162[0],
      setUsuarios = _useState162[1];
    var _useState163 = useState(true),
      _useState164 = _slicedToArray(_useState163, 2),
      loading = _useState164[0],
      setLoading = _useState164[1];
    var _useState165 = useState({
        total: 0,
        ativos: 0,
        novos: 0
      }),
      _useState166 = _slicedToArray(_useState165, 2),
      stats = _useState166[0],
      setStats = _useState166[1];
    useEffect(function () {
      carregarUsuarios();
    }, []);
    var carregarUsuarios = /*#__PURE__*/function () {
      var _ref30 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16() {
        var usersSnapshot, usersList, agora, umDiaAtras, seteDiasAtras, ativos, novos, pendentes, _t17;
        return _regenerator().w(function (_context16) {
          while (1) switch (_context16.p = _context16.n) {
            case 0:
              if (!(!db || !user)) {
                _context16.n = 1;
                break;
              }
              console.log('❌ DB ou User não disponível');
              return _context16.a(2);
            case 1:
              _context16.p = 1;
              setLoading(true);
              console.log('📥 Carregando usuários do Firestore...');
              _context16.n = 2;
              return db.collection('usuarios').get();
            case 2:
              usersSnapshot = _context16.v;
              console.log('📊 Documentos retornados:', usersSnapshot.size);
              usersList = [];
              usersSnapshot.forEach(function (doc) {
                var data = doc.data();
                console.log('👤 Usuário:', doc.id, data);
                usersList.push(_objectSpread({
                  uid: doc.id
                }, data));
              });
              console.log('📋 Total de usuários carregados:', usersList.length);

              // Calcular estatísticas
              agora = new Date();
              umDiaAtras = new Date(agora - 24 * 60 * 60 * 1000);
              seteDiasAtras = new Date(agora - 7 * 24 * 60 * 60 * 1000);
              ativos = usersList.filter(function (u) {
                try {
                  return u.ultimoAcesso && u.ultimoAcesso.toDate && u.ultimoAcesso.toDate() > umDiaAtras;
                } catch (_unused) {
                  return false;
                }
              }).length;
              novos = usersList.filter(function (u) {
                try {
                  return u.criadoEm && u.criadoEm.toDate && u.criadoEm.toDate() > seteDiasAtras;
                } catch (_unused2) {
                  return false;
                }
              }).length;
              pendentes = usersList.filter(function (u) {
                return u.status === 'PENDENTE';
              }).length;
              console.log('📊 Estatísticas:', {
                total: usersList.length,
                pendentes: pendentes,
                ativos: ativos,
                novos: novos
              });
              setStats({
                total: usersList.length,
                pendentes: pendentes,
                ativos: ativos,
                novos: novos
              });
              setUsuarios(usersList);
              console.log('✅ Usuários carregados com sucesso!');
              _context16.n = 4;
              break;
            case 3:
              _context16.p = 3;
              _t17 = _context16.v;
              console.error('❌ Erro ao carregar usuários:', _t17);
              alert('❌ Erro ao carregar usuários: ' + _t17.message);
            case 4:
              _context16.p = 4;
              setLoading(false);
              return _context16.f(4);
            case 5:
              return _context16.a(2);
          }
        }, _callee16, null, [[1, 3, 4, 5]]);
      }));
      return function carregarUsuarios() {
        return _ref30.apply(this, arguments);
      };
    }();
    var toggleAdmin = /*#__PURE__*/function () {
      var _ref31 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(userId, isCurrentlyAdmin) {
        var _t18;
        return _regenerator().w(function (_context17) {
          while (1) switch (_context17.p = _context17.n) {
            case 0:
              if (confirm("Deseja ".concat(isCurrentlyAdmin ? 'REMOVER' : 'CONCEDER', " permiss\xF5es de admin para este usu\xE1rio?"))) {
                _context17.n = 1;
                break;
              }
              return _context17.a(2);
            case 1:
              _context17.p = 1;
              _context17.n = 2;
              return db.collection('usuarios').doc(userId).update({
                isAdmin: !isCurrentlyAdmin,
                modificadoEm: firebase.firestore.FieldValue.serverTimestamp()
              });
            case 2:
              alert("\u2705 Permiss\xF5es ".concat(isCurrentlyAdmin ? 'removidas' : 'concedidas', " com sucesso!"));
              carregarUsuarios();
              _context17.n = 4;
              break;
            case 3:
              _context17.p = 3;
              _t18 = _context17.v;
              alert('❌ Erro ao alterar permissões: ' + _t18.message);
            case 4:
              return _context17.a(2);
          }
        }, _callee17, null, [[1, 3]]);
      }));
      return function toggleAdmin(_x16, _x17) {
        return _ref31.apply(this, arguments);
      };
    }();

    // Usar o isUserAdmin que já foi verificado no componente pai
    console.log('🔐 TelaAdmin - isUserAdminProp:', isUserAdminProp);
    console.log('🔐 TelaAdmin - user:', user === null || user === void 0 ? void 0 : user.uid, user === null || user === void 0 ? void 0 : user.email);
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
      }, (user === null || user === void 0 ? void 0 : user.uid) || 'null')), /*#__PURE__*/React.createElement("div", null, "\u2022 User Email: ", /*#__PURE__*/React.createElement("code", {
        className: "bg-gray-200 px-2 py-1 rounded"
      }, (user === null || user === void 0 ? void 0 : user.email) || 'null')), /*#__PURE__*/React.createElement("div", null, "\u2022 Firestore: ", /*#__PURE__*/React.createElement("code", {
        className: "bg-gray-200 px-2 py-1 rounded"
      }, db ? 'Conectado' : 'Desconectado'))), /*#__PURE__*/React.createElement("button", {
        onClick: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18() {
          var doc, data, _t19;
          return _regenerator().w(function (_context18) {
            while (1) switch (_context18.p = _context18.n) {
              case 0:
                if (!(!db || !user)) {
                  _context18.n = 1;
                  break;
                }
                alert('❌ DB ou User não disponível');
                return _context18.a(2);
              case 1:
                _context18.p = 1;
                _context18.n = 2;
                return db.collection('usuarios').doc(user.uid).get();
              case 2:
                doc = _context18.v;
                if (doc.exists) {
                  data = doc.data();
                  alert("\uD83D\uDCCA DADOS DO FIRESTORE:\n\n" + "Nome: ".concat(data.nome, "\n") + "Email: ".concat(data.email, "\n") + "isAdmin: ".concat(data.isAdmin, "\n") + "Status: ".concat(data.status, "\n\n") + "Para ser admin, isAdmin deve ser true!");
                } else {
                  alert('❌ Seu usuário não existe no Firestore!');
                }
                _context18.n = 4;
                break;
              case 3:
                _context18.p = 3;
                _t19 = _context18.v;
                alert('❌ Erro ao verificar: ' + _t19.message);
              case 4:
                return _context18.a(2);
            }
          }, _callee18, null, [[1, 3]]);
        })),
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
      onClick: function onClick() {
        console.log('🔍 DIAGNÓSTICO COMPLETO:');
        console.log('• isUserAdmin:', isUserAdminProp);
        console.log('• user:', user);
        console.log('• db:', db);
        console.log('• usuarios.length:', usuarios.length);
        console.log('• stats:', stats);
        alert("\uD83D\uDD0D DIAGN\xD3STICO:\n\n" + "Admin: ".concat(isUserAdminProp, "\n") + "User: ".concat(user === null || user === void 0 ? void 0 : user.email, "\n") + "DB: ".concat(db ? 'OK' : 'ERRO', "\n") + "Usu\xE1rios: ".concat(usuarios.length, "\n\n") + "Veja console (F12) para mais detalhes");
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
    }, stats.novos))), function () {
      var pendentes = usuarios.filter(function (u) {
        return u.status === 'PENDENTE';
      });
      if (pendentes.length === 0) return null;
      return /*#__PURE__*/React.createElement("div", {
        className: "bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg overflow-hidden"
      }, /*#__PURE__*/React.createElement("div", {
        className: "p-4 bg-yellow-100 border-b border-yellow-300"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "text-xl font-bold text-yellow-900"
      }, "\u23F3 Solicita\xE7\xF5es Pendentes (", pendentes.length, ")")), /*#__PURE__*/React.createElement("div", {
        className: "p-4 space-y-3"
      }, pendentes.map(function (usuario) {
        return /*#__PURE__*/React.createElement("div", {
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
        }, "\uD83D\uDCC5 Solicitou em: ", function () {
          try {
            return usuario.criadoEm && usuario.criadoEm.toDate ? new Date(usuario.criadoEm.toDate()).toLocaleString('pt-BR') : 'Data desconhecida';
          } catch (_unused3) {
            return 'Data desconhecida';
          }
        }())), /*#__PURE__*/React.createElement("div", {
          className: "flex gap-2"
        }, /*#__PURE__*/React.createElement("button", {
          onClick: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19() {
            var _t20;
            return _regenerator().w(function (_context19) {
              while (1) switch (_context19.p = _context19.n) {
                case 0:
                  if (!confirm("\u2705 Aprovar acesso de ".concat(usuario.nome, "?"))) {
                    _context19.n = 4;
                    break;
                  }
                  _context19.p = 1;
                  _context19.n = 2;
                  return db.collection('usuarios').doc(usuario.uid).update({
                    status: 'APROVADO'
                  });
                case 2:
                  alert('✅ Usuário aprovado com sucesso!');
                  carregarUsuarios();
                  _context19.n = 4;
                  break;
                case 3:
                  _context19.p = 3;
                  _t20 = _context19.v;
                  alert('❌ Erro ao aprovar: ' + _t20.message);
                case 4:
                  return _context19.a(2);
              }
            }, _callee19, null, [[1, 3]]);
          })),
          className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        }, "\u2705 Aprovar"), /*#__PURE__*/React.createElement("button", {
          onClick: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20() {
            var _t21;
            return _regenerator().w(function (_context20) {
              while (1) switch (_context20.p = _context20.n) {
                case 0:
                  if (!confirm("\u274C Rejeitar acesso de ".concat(usuario.nome, "?\n\nEsta pessoa n\xE3o poder\xE1 acessar o sistema."))) {
                    _context20.n = 4;
                    break;
                  }
                  _context20.p = 1;
                  _context20.n = 2;
                  return db.collection('usuarios').doc(usuario.uid).update({
                    status: 'REJEITADO'
                  });
                case 2:
                  alert('❌ Usuário rejeitado.');
                  carregarUsuarios();
                  _context20.n = 4;
                  break;
                case 3:
                  _context20.p = 3;
                  _t21 = _context20.v;
                  alert('❌ Erro ao rejeitar: ' + _t21.message);
                case 4:
                  return _context20.a(2);
              }
            }, _callee20, null, [[1, 3]]);
          })),
          className: "px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        }, "\u274C Rejeitar"))));
      })));
    }(), /*#__PURE__*/React.createElement("div", {
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
    }, "Os usu\xE1rios aparecer\xE3o aqui ap\xF3s o cadastro"))) : usuarios.map(function (usuario, index) {
      return /*#__PURE__*/React.createElement("tr", {
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
      }, function () {
        try {
          return usuario.criadoEm && usuario.criadoEm.toDate ? new Date(usuario.criadoEm.toDate()).toLocaleDateString('pt-BR') : 'N/A';
        } catch (_unused4) {
          return 'N/A';
        }
      }()), /*#__PURE__*/React.createElement("td", {
        className: "px-4 py-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "px-3 py-1 rounded-full text-xs font-semibold ".concat(usuario.status === 'APROVADO' ? 'bg-green-100 text-green-800' : usuario.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' : usuario.status === 'REJEITADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')
      }, usuario.status === 'APROVADO' ? '✅ APROVADO' : usuario.status === 'PENDENTE' ? '⏳ PENDENTE' : usuario.status === 'REJEITADO' ? '❌ REJEITADO' : '✅ ATIVO')), /*#__PURE__*/React.createElement("td", {
        className: "px-4 py-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "px-3 py-1 rounded-full text-xs font-semibold ".concat(usuario.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800')
      }, usuario.isAdmin ? 'ADMIN' : 'USUÁRIO')), /*#__PURE__*/React.createElement("td", {
        className: "px-4 py-2"
      }, usuario.uid !== user.uid && /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return toggleAdmin(usuario.uid, usuario.isAdmin);
        },
        className: "px-3 py-1 rounded-lg text-xs font-semibold ".concat(usuario.isAdmin ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200')
      }, usuario.isAdmin ? '⬇️ Rebaixar' : '⬆️ Promover'), usuario.uid === user.uid && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-gray-500 italic"
      }, "Voc\xEA")));
    }))))), /*#__PURE__*/React.createElement("div", {
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
  var TelaCartoes = function TelaCartoes() {
    // Calcular status da fatura para cada cartão
    var calcularStatusFatura = function calcularStatusFatura(cartao, mes) {
      var hoje = new Date().getDate();
      var diaFechamento = cartao.diaFechamento || cartao.vencimento - 7;
      if (hoje <= diaFechamento) {
        return 'ABERTA';
      } else if (hoje > diaFechamento && hoje <= cartao.vencimento) {
        return 'FECHADA';
      } else {
        return 'VENCIDA';
      }
    };

    // Calcular projeção de 6 meses
    var calcularProjecao = function calcularProjecao(cartao) {
      var mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      var mesAtualIndex = mesesOrdem.indexOf(mesAtual);
      var projecao = [];
      for (var i = 0; i < 6; i++) {
        var _cartao$valores2;
        var mesIndex = (mesAtualIndex + i) % 12;
        var mes = mesesOrdem[mesIndex];
        var parcelasDoMes = calcularParcelasCartao(cartao.nome, mes);
        var valoresAno = ((_cartao$valores2 = cartao.valores) === null || _cartao$valores2 === void 0 ? void 0 : _cartao$valores2[anoAtual]) || {};
        var valorBase = valoresAno[mes] || 0;
        var valorParcelas = parcelasDoMes.reduce(function (sum, c) {
          return sum + c.valorParcela;
        }, 0);
        var total = valorBase + valorParcelas;
        projecao.push({
          mes: mes.toUpperCase(),
          valor: total
        });
      }
      return projecao;
    };

    // Calcular totais por cartão para os cards
    var totaisPorCartao = {};
    var totalGeralMes = 0;
    var totalDivida = 0;
    var totalLimites = 0;
    cartoes.forEach(function (cartao) {
      var _cartao$valores3;
      var parcelasCartao = calcularParcelasCartao(cartao.nome, mesAtual);
      var valoresAno = ((_cartao$valores3 = cartao.valores) === null || _cartao$valores3 === void 0 ? void 0 : _cartao$valores3[anoAtual]) || {};
      var valorBase = valoresAno[mesAtual] || 0;
      var valorParcelas = parcelasCartao.reduce(function (sum, c) {
        return sum + c.valorParcela;
      }, 0);
      var valorTotal = valorBase + valorParcelas;
      totaisPorCartao[cartao.nome] = valorTotal;
      totalGeralMes += valorTotal;

      // Calcular dívida de TODOS os cartões (com ou sem limite)
      var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      var gastoTotal = 0;
      var pagoTotal = 0;
      meses.forEach(function (mes) {
        var val = parseFloat(valoresAno[mes]) || 0;
        var parc = calcularParcelasCartao(cartao.nome, mes).reduce(function (s, c) {
          return s + parseFloat(c.valorParcela || 0);
        }, 0);
        var total = val + parc;
        gastoTotal += total;
        var st = getStatusFarol(cartao.nome, mes);
        if (st === 'PAGO') {
          pagoTotal += total;
        } else if (typeof st === 'number') {
          pagoTotal += parseFloat(st) || 0;
        }
      });
      var div = Math.max(gastoTotal - pagoTotal, 0);
      if (div > 0) {
        console.log("\uD83D\uDCB3 ".concat(cartao.nome, ": Gasto=").concat(gastoTotal.toFixed(2), " Pago=").concat(pagoTotal.toFixed(2), " D\xEDvida=").concat(div.toFixed(2)));
      }
      totalDivida += div;

      // Somar limites apenas dos cartões que têm limite definido
      if (cartao.limite > 0) {
        totalLimites += cartao.limite;
      }
    });
    console.log("\uD83D\uDD34 D\xCDVIDA TOTAL: R$ ".concat(totalDivida.toFixed(2), " (").concat(totalLimites > 0 ? (totalDivida / totalLimites * 100).toFixed(0) : 0, "% dos limites)"));
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCB3 Cart\xF5es de Cr\xE9dito - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('compraParcelada');
      },
      className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm"
    }, "\uD83D\uDED2 Nova Compra Parcelada"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoCartao');
      },
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
    }, mesAtual.toUpperCase(), "/", anoAtual)), Object.entries(totaisPorCartao).sort(function (a, b) {
      return b[1] - a[1];
    }) // Ordena por valor (maior primeiro)
    .map(function (_ref35) {
      var _ref36 = _slicedToArray(_ref35, 2),
        nomeCartao = _ref36[0],
        valor = _ref36[1];
      var percentual = totalGeralMes > 0 ? valor / totalGeralMes * 100 : 0;
      var cartao = cartoes.find(function (c) {
        return c.nome === nomeCartao;
      });
      var limite = (cartao === null || cartao === void 0 ? void 0 : cartao.limite) || 0;
      return /*#__PURE__*/React.createElement("div", {
        key: nomeCartao,
        className: "bg-white rounded-lg shadow-md p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border border-gray-200",
        onClick: function onClick() {
          var elemento = document.getElementById("cartao-".concat(nomeCartao));
          if (elemento) {
            elemento.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            elemento.style.transform = 'scale(1.02)';
            setTimeout(function () {
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
        className: "h-1 rounded-full ".concat(valor / limite * 100 > 80 ? 'bg-red-500' : valor / limite * 100 > 60 ? 'bg-yellow-500' : 'bg-green-500'),
        style: {
          width: "".concat(Math.min(valor / limite * 100, 100), "%")
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
    }, totalLimites > 0 ? "".concat((totalDivida / totalLimites * 100).toFixed(0), "% limites") : 'Ano completo'))), cartoes.map(function (cartao) {
      var _cartao$valores4;
      var parcelasCartao = calcularParcelasCartao(cartao.nome, mesAtual);
      var valoresAno = ((_cartao$valores4 = cartao.valores) === null || _cartao$valores4 === void 0 ? void 0 : _cartao$valores4[anoAtual]) || {};
      var valorBase = valoresAno[mesAtual] || 0;
      var valorParcelas = parcelasCartao.reduce(function (sum, c) {
        return sum + c.valorParcela;
      }, 0);
      var valorTotal = valorBase + valorParcelas;
      var statusFatura = calcularStatusFatura(cartao, mesAtual);
      var limite = cartao.limite || 0;

      // Calcular limite disponível real (TODOS OS MESES)
      var calcularLimiteDisponivel = function calcularLimiteDisponivel() {
        var mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        console.log("\n\uD83D\uDCB3 ========== C\xC1LCULO LIMITE: ".concat(cartao.nome, " =========="));

        // 1. VALORES BASE: Somar valores cadastrados em cada mês
        var totalValoresBase = 0;
        mesesOrdem.forEach(function (mes) {
          var valorMes = valoresAno[mes] || 0;
          if (valorMes > 0) {
            console.log("  \uD83D\uDCC5 ".concat(mes.toUpperCase(), ": Valor base = R$ ").concat(valorMes.toFixed(2)));
            totalValoresBase += valorMes;
          }
        });
        console.log("  \u2705 Total valores base: R$ ".concat(totalValoresBase.toFixed(2)));

        // 2. PARCELAS: Somar todas as parcelas de TODOS os meses
        var totalParcelas = 0;
        mesesOrdem.forEach(function (mes) {
          var parcelasDoMes = calcularParcelasCartao(cartao.nome, mes);
          var valorParcelasMes = parcelasDoMes.reduce(function (sum, c) {
            return sum + c.valorParcela;
          }, 0);
          if (valorParcelasMes > 0) {
            console.log("  \uD83D\uDCE6 ".concat(mes.toUpperCase(), ": Parcelas = R$ ").concat(valorParcelasMes.toFixed(2), " (").concat(parcelasDoMes.length, " parcelas)"));
            totalParcelas += valorParcelasMes;
          }
        });
        console.log("  \u2705 Total parcelas: R$ ".concat(totalParcelas.toFixed(2)));

        // 3. TOTAL GASTO (Base + Parcelas)
        var totalGasto = totalValoresBase + totalParcelas;
        console.log("  \uD83D\uDCB0 TOTAL GASTO NO ANO: R$ ".concat(totalGasto.toFixed(2)));

        // 4. PAGAMENTOS: Subtrair valores já pagos (libera o limite)
        var totalPago = 0;
        mesesOrdem.forEach(function (mes) {
          var status = getStatusFarol(cartao.nome, mes);
          var valorMes = valoresAno[mes] || 0;
          var parcelasDoMes = calcularParcelasCartao(cartao.nome, mes);
          var valorParcelasMes = parcelasDoMes.reduce(function (sum, c) {
            return sum + c.valorParcela;
          }, 0);
          var totalMes = valorMes + valorParcelasMes;
          if (status === 'PAGO') {
            // Pagamento integral (libera valor base + parcelas)
            console.log("  \u2705 ".concat(mes.toUpperCase(), ": PAGO INTEGRAL = R$ ").concat(totalMes.toFixed(2)));
            totalPago += totalMes;
          } else if (typeof status === 'number') {
            // Pagamento parcial
            console.log("  \uD83D\uDCB5 ".concat(mes.toUpperCase(), ": PAGO PARCIAL = R$ ").concat(status.toFixed(2)));
            totalPago += status;
          }
        });
        console.log("  \u2705 Total pago (libera limite): R$ ".concat(totalPago.toFixed(2)));

        // 5. USADO = Total Gasto - Total Pago
        var usado = totalGasto - totalPago;
        console.log("  \uD83D\uDD34 USADO (Gasto - Pago): R$ ".concat(usado.toFixed(2)));

        // 6. DISPONÍVEL = Limite - Usado
        var disponivel = limite > 0 ? Math.max(limite - usado, 0) : 0;
        var percentualUsado = limite > 0 ? usado / limite * 100 : 0;
        console.log("  \uD83D\uDCCA LIMITE: R$ ".concat(limite.toFixed(2)));
        console.log("  \uD83D\uDFE2 DISPON\xCDVEL: R$ ".concat(disponivel.toFixed(2)));
        console.log("  \uD83D\uDCC8 PERCENTUAL USADO: ".concat(percentualUsado.toFixed(1), "%"));
        console.log("  ========================================\n");
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
      var limiteInfo = calcularLimiteDisponivel();
      var projecao = calcularProjecao(cartao);
      return /*#__PURE__*/React.createElement("div", {
        key: cartao.id,
        id: "cartao-".concat(cartao.nome),
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
        className: "px-2 py-1 rounded text-xs font-bold ".concat(statusFatura === 'ABERTA' ? 'bg-blue-100 text-blue-700' : statusFatura === 'FECHADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
      }, statusFatura === 'ABERTA' ? '⏳ FATURA ABERTA' : statusFatura === 'FECHADA' ? '✅ FATURA FECHADA' : '⚠️ VENCIDA')), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500 space-y-1"
      }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC5 Fecha dia ", cartao.diaFechamento || cartao.vencimento - 7, " \u2022 Vence dia ", cartao.vencimento), valorParcelas > 0 && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCE6 ", parcelasCartao.length, " parcela(s) ativas: R$ ", valorParcelas.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          setItemEditando(cartao);
          setTipoEditando('cartao');
          setModalAberto('editar');
        },
        className: "px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
      }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return duplicarCartao(cartao);
        },
        className: "px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm"
      }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarCartao(cartao.id);
        },
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
        onChange: function onChange(e) {
          return editarValorCartao(cartao.id, mesAtual, e.target.value);
        },
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
        className: "h-3 rounded-full transition-all ".concat(limiteInfo.percentual > 80 ? 'bg-red-500' : limiteInfo.percentual > 50 ? 'bg-yellow-500' : 'bg-green-500'),
        style: {
          width: "".concat(Math.min(limiteInfo.percentual, 100), "%")
        }
      }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500 mb-1"
      }, "N\xE3o definido"), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-blue-600 font-semibold"
      }, "Gasto atual: R$ ", valorTotal.toFixed(2)), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          setInputDialog({
            titulo: 'Definir Limite do Cartão',
            label: 'Limite do cartão (R$):',
            valorPadrao: '10000',
            callback: function callback(novoLimite) {
              if (novoLimite && !isNaN(novoLimite)) {
                var cartoesAtualizados = cartoes.map(function (c) {
                  return c.id === cartao.id ? _objectSpread(_objectSpread({}, c), {}, {
                    limite: parseFloat(novoLimite)
                  }) : c;
                });
                setCartoes(cartoesAtualizados);
                localStorage.setItem('cartoes', JSON.stringify(cartoesAtualizados));
              }
            }
          });
        },
        className: "mt-2 text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      }, "\u2795 Definir Limite"))), parcelasCartao.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "bg-green-50 rounded-lg p-3 border border-green-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-2"
      }, "\uD83D\uDCE6 PARCELAS ATIVAS"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-1 max-h-20 overflow-y-auto"
      }, parcelasCartao.map(function (p, idx) {
        return /*#__PURE__*/React.createElement("div", {
          key: idx,
          className: "text-xs text-gray-700"
        }, p.descricao, ": ", p.parcelaAtual, "/", p.totalParcelas, " \u2022 R$ ", p.valorParcela.toFixed(2));
      })))), /*#__PURE__*/React.createElement("div", {
        className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-2"
      }, "\uD83D\uDCC8 PROJE\xC7\xC3O PR\xD3XIMOS 6 MESES"), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-6 gap-2"
      }, projecao.map(function (p, idx) {
        return /*#__PURE__*/React.createElement("div", {
          key: idx,
          className: "text-center"
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-semibold text-gray-700"
        }, p.mes), /*#__PURE__*/React.createElement("div", {
          className: "text-sm font-bold text-purple-600"
        }, "R$ ", p.valor.toFixed(0)));
      }))));
    }));
  };
  var TelaGastosFixos = function TelaGastosFixos() {
    var _useState167 = useState('TODAS'),
      _useState168 = _slicedToArray(_useState167, 2),
      categoriaFiltro = _useState168[0],
      setCategoriaFiltro = _useState168[1];

    // FILTRAR POR MÊS E ANO ATUAL
    var gastosDoMesAno = gastosFixos.filter(function (g) {
      // Se tem mes e ano definidos, filtrar por eles
      if (g.mes && g.ano) {
        return g.mes === mesAtual && g.ano === anoAtual;
      }
      // Se não tem mes/ano, é gasto fixo permanente (aparece sempre)
      return true;
    });

    // Categorias únicas dos gastos fixos do mês
    var categorias = ['TODAS'].concat(_toConsumableArray(new Set(gastosDoMesAno.map(function (g) {
      return g.categoria;
    }))));

    // Calcular total por cada categoria
    var totaisPorCategoria = {};
    gastosDoMesAno.forEach(function (g) {
      if (!totaisPorCategoria[g.categoria]) {
        totaisPorCategoria[g.categoria] = 0;
      }
      totaisPorCategoria[g.categoria] += g.valor;
    });

    // Total geral
    var totalGeral = gastosDoMesAno.reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);

    // Filtrar por categoria
    var gastosFiltrados = categoriaFiltro === 'TODAS' ? gastosDoMesAno : gastosDoMesAno.filter(function (g) {
      return g.categoria === categoriaFiltro;
    });

    // Calcular total por categoria
    var totalCategoria = gastosFiltrados.reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83C\uDFE0 Gastos Fixos - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('gerenciarCategorias');
      },
      className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
    }, "\uD83C\uDFF7\uFE0F Categorias"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoGastoFixo');
      },
      className: "px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
    }, "\u2795 Novo Gasto"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ".concat(categoriaFiltro === 'TODAS' ? 'ring-4 ring-purple-300' : ''),
      onClick: function onClick() {
        return setCategoriaFiltro('TODAS');
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\uD83D\uDCB0 TOTAL GERAL"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-white"
    }, "R$ ", totalGeral.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-1"
    }, gastosFixos.length, " gastos")), Object.entries(totaisPorCategoria).sort(function (a, b) {
      return b[1] - a[1];
    }) // Ordena por valor (maior primeiro)
    .map(function (_ref37) {
      var _ref38 = _slicedToArray(_ref37, 2),
        categoria = _ref38[0],
        total = _ref38[1];
      var quantidade = gastosFixos.filter(function (g) {
        return g.categoria === categoria;
      }).length;
      var percentual = totalGeral > 0 ? total / totalGeral * 100 : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: categoria,
        className: "bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ".concat(categoriaFiltro === categoria ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200'),
        onClick: function onClick() {
          return setCategoriaFiltro(categoria);
        }
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
    }, categoriaFiltro === 'TODAS' ? 'Adicione seu primeiro gasto fixo!' : "Nenhum gasto na categoria \"".concat(categoriaFiltro, "\""))) : function () {
      // Agrupar gastos por data de vencimento
      var gastosPorData = {};
      gastosFiltrados.forEach(function (gasto) {
        var dia = gasto.vencimento;
        if (!gastosPorData[dia]) {
          gastosPorData[dia] = [];
        }
        gastosPorData[dia].push(gasto);
      });

      // Ordenar dias
      var diasOrdenados = Object.keys(gastosPorData).sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      });
      return diasOrdenados.map(function (dia) {
        var gastosDoDia = gastosPorData[dia];
        var totalDia = gastosDoDia.reduce(function (sum, g) {
          return sum + g.valor;
        }, 0);
        var hoje = new Date().getDate();
        var isHoje = parseInt(dia) === hoje;

        // Calcular dia da semana
        var dataAtual = new Date();
        var anoNum = dataAtual.getFullYear();
        var mesNum = dataAtual.getMonth();
        var dataVencimento = new Date(anoNum, mesNum, parseInt(dia));
        var diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataVencimento.getDay()];
        return /*#__PURE__*/React.createElement("div", {
          key: dia,
          className: "flex items-start gap-3 p-3 rounded-lg transition-all ".concat(isHoje ? 'bg-purple-50 border-2 border-purple-500' : 'bg-purple-50 border border-purple-200')
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex-shrink-0 w-16 text-center ".concat(isHoje ? 'text-purple-600' : 'text-gray-600')
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-semibold"
        }, diaSemana), /*#__PURE__*/React.createElement("div", {
          className: "text-2xl font-bold ".concat(isHoje ? 'text-purple-700' : 'text-gray-700')
        }, dia), isHoje && /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-bold text-purple-600"
        }, "HOJE")), /*#__PURE__*/React.createElement("div", {
          className: "flex-1"
        }, /*#__PURE__*/React.createElement("div", {
          className: "space-y-2"
        }, gastosDoDia.map(function (gasto) {
          return /*#__PURE__*/React.createElement("div", {
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
            onChange: function onChange(e) {
              return editarValorGastoFixo(gasto.id, e.target.value);
            },
            className: "w-28 px-2 py-1 border border-gray-300 rounded text-right text-sm font-bold"
          }), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              setItemEditando(gasto);
              setTipoEditando('fixo');
              setModalAberto('editar');
            },
            className: "px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
          }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              return duplicarGastoFixo(gasto);
            },
            className: "px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-sm"
          }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              return deletarGastoFixo(gasto.id);
            },
            className: "px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
          }, "\uD83D\uDDD1\uFE0F")));
        }), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-right font-bold text-gray-600 pt-1 border-t"
        }, "Total do dia: R$ ", totalDia.toFixed(2)))));
      });
    }()));
  };
  var TelaGastosVariaveis = function TelaGastosVariaveis() {
    var _useState169 = useState('TODAS'),
      _useState170 = _slicedToArray(_useState169, 2),
      categoriaFiltro = _useState170[0],
      setCategoriaFiltro = _useState170[1];
    var gastosDoMes = gastosVariaveis.filter(function (g) {
      return g.mes === mesAtual && g.ano === anoAtual;
    });

    // Calcular total por cada categoria
    var totaisPorCategoria = {};
    gastosDoMes.forEach(function (g) {
      if (!totaisPorCategoria[g.categoria]) {
        totaisPorCategoria[g.categoria] = 0;
      }
      totaisPorCategoria[g.categoria] += g.valor;
    });
    var totalMes = gastosDoMes.reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);

    // Filtrar por categoria
    var gastosFiltrados = categoriaFiltro === 'TODAS' ? gastosDoMes : gastosDoMes.filter(function (g) {
      return g.categoria === categoriaFiltro;
    });
    var totalCategoria = gastosFiltrados.reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCCA Gastos Vari\xE1veis - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        console.log('🔧 FORÇANDO MIGRAÇÃO MANUAL...');
        var migrados = gastosVariaveis.map(function (gasto) {
          if (!gasto.dataCompleta) {
            var dataGasto;

            // 1. Tentar converter data BR
            if (gasto.data && gasto.data.includes('/')) {
              var _gasto$data$split5 = gasto.data.split('/'),
                _gasto$data$split6 = _slicedToArray(_gasto$data$split5, 3),
                dia = _gasto$data$split6[0],
                mes = _gasto$data$split6[1],
                ano = _gasto$data$split6[2];
              dataGasto = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
              console.log('📅 Convertendo:', gasto.data, '→', dataGasto.toISOString().split('T')[0]);
            }
            // 2. Fallback: usar mês/ano
            else {
              var anoGasto = gasto.ano || 2026;
              var mesGasto = gasto.mes || 'jan';
              var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
              var mesNum = meses.indexOf(mesGasto.toLowerCase());
              dataGasto = new Date(anoGasto, mesNum >= 0 ? mesNum : 0, 1);
              console.log('📅 Fallback:', mesGasto, anoGasto, '→', dataGasto.toISOString().split('T')[0]);
            }
            return _objectSpread(_objectSpread({}, gasto), {}, {
              dataCompleta: dataGasto.toISOString().split('T')[0],
              data: dataGasto.toLocaleDateString('pt-BR')
            });
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
      onClick: function onClick() {
        console.log('🔍 DEBUG GASTOS VARIÁVEIS:');
        console.log('Total de gastos:', gastosVariaveis.length);
        gastosVariaveis.forEach(function (g, i) {
          console.log("Gasto ".concat(i + 1, ":"), {
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
      onClick: function onClick() {
        return setModalAberto('gerenciarCategorias');
      },
      className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
    }, "\uD83C\uDFF7\uFE0F Categorias"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoGastoVariavel');
      },
      className: "px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
    }, "\u2795 Novo Gasto"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ".concat(categoriaFiltro === 'TODAS' ? 'ring-4 ring-orange-300' : ''),
      onClick: function onClick() {
        return setCategoriaFiltro('TODAS');
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\uD83D\uDCB0 TOTAL DO M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-white"
    }, "R$ ", totalMes.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-1"
    }, gastosDoMes.length, " gastos")), Object.entries(totaisPorCategoria).sort(function (a, b) {
      return b[1] - a[1];
    }) // Ordena por valor (maior primeiro)
    .map(function (_ref39) {
      var _ref40 = _slicedToArray(_ref39, 2),
        categoria = _ref40[0],
        total = _ref40[1];
      var quantidade = gastosDoMes.filter(function (g) {
        return g.categoria === categoria;
      }).length;
      var percentual = totalMes > 0 ? total / totalMes * 100 : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: categoria,
        className: "bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ".concat(categoriaFiltro === categoria ? 'border-orange-500 ring-2 ring-orange-300' : 'border-gray-200'),
        onClick: function onClick() {
          return setCategoriaFiltro(categoria);
        }
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
    }, gastosDoMes.length === 0 ? 'Adicione gastos variáveis para este mês!' : "Nenhum gasto na categoria \"".concat(categoriaFiltro, "\""))) : function () {
      // Agrupar por CATEGORIA primeiro
      var gastosPorCategoria = {};
      gastosFiltrados.forEach(function (gasto) {
        var cat = gasto.categoria;
        if (!gastosPorCategoria[cat]) {
          gastosPorCategoria[cat] = [];
        }
        gastosPorCategoria[cat].push(gasto);
      });

      // Ordenar categorias alfabeticamente
      var categoriasOrdenadas = Object.keys(gastosPorCategoria).sort();
      return categoriasOrdenadas.map(function (categoria) {
        var gastosCategoria = gastosPorCategoria[categoria];

        // Agrupar por DATA dentro da categoria
        var gastosPorData = {};
        gastosCategoria.forEach(function (gasto) {
          var dataKey = gasto.dataCompleta || gasto.data || 'Sem data';
          if (!gastosPorData[dataKey]) {
            gastosPorData[dataKey] = [];
          }
          gastosPorData[dataKey].push(gasto);
        });

        // Ordenar datas (mais recente primeiro)
        var datasOrdenadas = Object.keys(gastosPorData).sort(function (a, b) {
          if (a === 'Sem data') return 1;
          if (b === 'Sem data') return -1;
          return b.localeCompare(a);
        });
        var totalCategoria = gastosCategoria.reduce(function (sum, g) {
          return sum + g.valor;
        }, 0);
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
        }, datasOrdenadas.map(function (dataKey) {
          var gastosDaData = gastosPorData[dataKey];
          var totalData = gastosDaData.reduce(function (sum, g) {
            return sum + g.valor;
          }, 0);

          // Calcular informações da data
          var diaSemana = '';
          var diaNumero = '';
          var dataFormatada = dataKey;
          var isHoje = false;
          if (dataKey !== 'Sem data') {
            var dataObj = new Date(dataKey + 'T00:00:00');
            var hoje = new Date();
            isHoje = dataObj.toDateString() === hoje.toDateString();
            diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataObj.getDay()];
            diaNumero = dataObj.getDate();
            dataFormatada = dataObj.toLocaleDateString('pt-BR');
          }
          return /*#__PURE__*/React.createElement("div", {
            key: dataKey,
            className: "rounded-lg border-2 overflow-hidden ".concat(isHoje ? 'border-orange-500 bg-orange-50' : 'border-orange-200 bg-orange-50')
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex items-center gap-3 p-2 bg-white border-b border-orange-200"
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex-shrink-0 w-14 text-center ".concat(isHoje ? 'text-orange-600' : 'text-gray-600')
          }, dataKey !== 'Sem data' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            className: "text-xs font-semibold"
          }, diaSemana), /*#__PURE__*/React.createElement("div", {
            className: "text-xl font-bold ".concat(isHoje ? 'text-orange-700' : 'text-gray-700')
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
          }, gastosDaData.map(function (gasto) {
            return /*#__PURE__*/React.createElement("div", {
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
              onClick: function onClick() {
                setItemEditando(gasto);
                setTipoEditando('variavel');
                setModalAberto('editar');
              },
              className: "px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
            }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
              onClick: function onClick() {
                return duplicarGastoVariavel(gasto);
              },
              className: "px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-xs"
            }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
              onClick: function onClick() {
                return deletarGastoVariavel(gasto.id);
              },
              className: "px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
            }, "\uD83D\uDDD1\uFE0F")));
          })));
        })));
      });
    }()));
  };
  var TelaGastosExtras = function TelaGastosExtras() {
    var _useState171 = useState('TODAS'),
      _useState172 = _slicedToArray(_useState171, 2),
      categoriaFiltro = _useState172[0],
      setCategoriaFiltro = _useState172[1];
    var gastosDoMes = gastosExtras.filter(function (g) {
      return g.mes === mesAtual && g.ano === anoAtual;
    });

    // Calcular total por cada categoria
    var totaisPorCategoria = {};
    gastosDoMes.forEach(function (g) {
      if (!totaisPorCategoria[g.categoria]) {
        totaisPorCategoria[g.categoria] = 0;
      }
      totaisPorCategoria[g.categoria] += g.valor;
    });
    var totalMes = gastosDoMes.reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);

    // Filtrar por categoria
    var gastosFiltrados = categoriaFiltro === 'TODAS' ? gastosDoMes : gastosDoMes.filter(function (g) {
      return g.categoria === categoriaFiltro;
    });
    var totalCategoria = gastosFiltrados.reduce(function (sum, g) {
      return sum + g.valor;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\u26A1 Gastos Extras - ", mesAtual.toUpperCase(), " / ", anoAtual), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('gerenciarCategorias');
      },
      className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 border-2 border-gray-300"
    }, "\uD83C\uDFF7\uFE0F Categorias"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoGastoExtra');
      },
      className: "px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
    }, "\u2795 Novo Gasto Extra"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ".concat(categoriaFiltro === 'TODAS' ? 'ring-4 ring-amber-300' : ''),
      onClick: function onClick() {
        return setCategoriaFiltro('TODAS');
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-white/80 text-xs font-semibold mb-1"
    }, "\u26A1 TOTAL DO M\xCAS"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-white"
    }, "R$ ", totalMes.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-white/70 text-xs mt-1"
    }, gastosDoMes.length, " gastos extras")), Object.entries(totaisPorCategoria).sort(function (a, b) {
      return b[1] - a[1];
    }).map(function (_ref41) {
      var _ref42 = _slicedToArray(_ref41, 2),
        categoria = _ref42[0],
        total = _ref42[1];
      var quantidade = gastosDoMes.filter(function (g) {
        return g.categoria === categoria;
      }).length;
      var percentual = totalMes > 0 ? total / totalMes * 100 : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: categoria,
        className: "bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ".concat(categoriaFiltro === categoria ? 'border-amber-500 ring-2 ring-amber-300' : 'border-gray-200'),
        onClick: function onClick() {
          return setCategoriaFiltro(categoria);
        }
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
    }, gastosDoMes.length === 0 ? 'Adicione gastos extras para este mês!' : "Nenhum gasto na categoria \"".concat(categoriaFiltro, "\""))) : gastosFiltrados.map(function (gasto) {
      return /*#__PURE__*/React.createElement("div", {
        key: gasto.id,
        className: "flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-semibold text-gray-800"
      }, gasto.categoria), /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-1 rounded text-xs font-bold ".concat(gasto.ano === 2026 ? 'bg-blue-100 text-blue-700' : gasto.ano === 2025 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700')
      }, gasto.ano || anoAtual)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500"
      }, gasto.descricao, " \u2022 ", gasto.data)), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xl font-bold text-amber-600"
      }, "R$ ", gasto.valor.toFixed(2)), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          setItemEditando(gasto);
          setTipoEditando('extra');
          setModalAberto('editar');
        },
        className: "px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold",
        title: "Editar gasto extra"
      }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return duplicarGastoExtra(gasto);
        },
        className: "px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-semibold",
        title: "Duplicar gasto extra"
      }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarGastoExtra(gasto.id);
        },
        className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm",
        title: "Excluir gasto extra"
      }, "\uD83D\uDDD1\uFE0F")));
    }))));
  };
  var TelaReceitas = function TelaReceitas() {
    var receitasDoMes = receitas.filter(function (r) {
      return r.mes === mesAtual && r.ano === anoAtual;
    });
    var totalMes = receitasDoMes.reduce(function (sum, r) {
      return sum + r.valor;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCB0 Receitas e Ganhos"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novaReceita');
      },
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
      className: "rounded-xl shadow-lg p-6 text-white ".concat(saldo.positivo ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600')
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
      onClick: function onClick() {
        return setModalAberto('novaReceita');
      },
      className: "mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2795 Adicionar Primeira Receita")) : receitasDoMes.map(function (receita) {
      return /*#__PURE__*/React.createElement("div", {
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
        className: "px-2 py-1 rounded text-xs font-bold ".concat(receita.ano === 2026 ? 'bg-blue-100 text-blue-700' : receita.ano === 2025 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700')
      }, receita.ano)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500 mt-1"
      }, receita.data)), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold text-green-600"
      }, "R$ ", receita.valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          setItemEditando(receita);
          setTipoEditando('receita');
          setModalAberto('editar');
        },
        className: "px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold",
        title: "Editar receita"
      }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return duplicarReceita(receita);
        },
        className: "px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-semibold",
        title: "Duplicar receita"
      }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarReceita(receita.id);
        },
        className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm",
        title: "Excluir receita"
      }, "\uD83D\uDDD1\uFE0F")));
    }))), /*#__PURE__*/React.createElement("div", {
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
        width: saldo.receitas > 0 ? "".concat(saldo.despesas / saldo.receitas * 100, "%") : '0%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-white font-bold"
    }, saldo.receitas > 0 ? (saldo.despesas / saldo.receitas * 100).toFixed(0) : 0, "%")))))));
  };
  var TelaPlanejamento = function TelaPlanejamento() {
    // Controlar aba via telaAtiva do menu
    var abaAtiva = telaAtiva === 'planejamento-orcamento' ? 'orcamento' : telaAtiva === 'planejamento-premes' ? 'premes' : telaAtiva === 'planejamento-metas' ? 'metas' : telaAtiva === 'planejamento-dividas' ? 'dividas' : telaAtiva === 'planejamento-compra' ? 'compra' : telaAtiva === 'planejamento-simulador' ? 'simulador' : telaAtiva === 'planejamento-timeline' ? 'timeline' : 'diagnostico';

    // Estados do Simulador
    var _useState173 = useState({
        rendaAjuste: 0,
        // % de ajuste
        gastosAjuste: 0,
        // % de ajuste
        quitarDivida: null,
        // ID da dívida
        novaReceita: 0,
        // valor adicional
        novaDespesa: 0 // valor adicional
      }),
      _useState174 = _slicedToArray(_useState173, 2),
      simulacao = _useState174[0],
      setSimulacao = _useState174[1];
    var orcadoTotal = orcamento.cartoes + orcamento.fixos + orcamento.variaveis;
    var gastadoTotal = totais.total;
    var diferenca = orcadoTotal - gastadoTotal;
    var dentroOrcamento = diferenca >= 0;

    // Planejados do mês atual
    var planejadosDoMes = planejadosMes.filter(function (p) {
      return p.mes === mesAtual;
    });
    var totalPlanejado = planejadosDoMes.reduce(function (sum, p) {
      return sum + p.valor;
    }, 0);
    var totalExecutado = planejadosDoMes.filter(function (p) {
      return p.executado;
    }).reduce(function (sum, p) {
      return sum + p.valor;
    }, 0);
    var totalPendente = totalPlanejado - totalExecutado;

    // 📊 SCORE DE SAÚDE FINANCEIRA
    var calcularScore = function calcularScore() {
      var score = 0;
      var criterios = [];

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
      var reservaIdeal = gastadoTotal * 6; // 6 meses de despesas
      var reservaAtual = reservaEmergencia; // Valor real informado pelo usuário
      var percentualReserva = reservaIdeal > 0 ? reservaAtual / reservaIdeal * 100 : 0;
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
      var percentualPoupanca = saldo.positivo ? saldo.saldo / saldo.receitas * 100 : 0;
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
        score: score,
        criterios: criterios,
        reservaIdeal: reservaIdeal,
        reservaAtual: reservaAtual,
        percentualReserva: percentualReserva,
        percentualPoupanca: percentualPoupanca
      };
    };
    var scoreSaude = calcularScore();

    // Determinar cor e label do score
    var getScoreColor = function getScoreColor(score) {
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
    var scoreInfo = getScoreColor(scoreSaude.score);

    // 🎯 FUNÇÕES DE METAS FINANCEIRAS
    var adicionarMeta = function adicionarMeta(meta) {
      console.log('📝 Adicionando meta:', meta);
      var novaMeta = {
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
      setMetasFinanceiras([].concat(_toConsumableArray(metasFinanceiras), [novaMeta]));
      console.log('💾 Salvando meta no estado');
      setModalAberto(null);
      alert('✅ Meta criada com sucesso!');
    };
    var atualizarProgressoMeta = function atualizarProgressoMeta(id, novoValor) {
      setMetasFinanceiras(metasFinanceiras.map(function (m) {
        return m.id === id ? _objectSpread(_objectSpread({}, m), {}, {
          valorAtual: parseFloat(novoValor)
        }) : m;
      }));
    };
    var concluirMeta = function concluirMeta(id) {
      setMetasFinanceiras(metasFinanceiras.map(function (m) {
        return m.id === id ? _objectSpread(_objectSpread({}, m), {}, {
          concluida: true,
          valorAtual: m.valor
        }) : m;
      }));
    };
    var deletarMeta = function deletarMeta(id) {
      if (confirm('Tem certeza que deseja excluir esta meta?')) {
        setMetasFinanceiras(metasFinanceiras.filter(function (m) {
          return m.id !== id;
        }));
      }
    };

    // 💳 FUNÇÕES DE DÍVIDAS
    var adicionarDivida = function adicionarDivida(divida) {
      var novaDivida = {
        id: Date.now(),
        nome: divida.nome,
        valorTotal: parseFloat(divida.valorTotal),
        saldoDevedor: parseFloat(divida.saldoDevedor),
        taxaJuros: parseFloat(divida.taxaJuros),
        parcelaMinima: parseFloat(divida.parcelaMinima),
        vencimento: parseInt(divida.vencimento)
      };
      setDividas([].concat(_toConsumableArray(dividas), [novaDivida]));
    };
    var atualizarDivida = function atualizarDivida(id, campo, valor) {
      setDividas(dividas.map(function (d) {
        return d.id === id ? _objectSpread(_objectSpread({}, d), {}, _defineProperty({}, campo, parseFloat(valor))) : d;
      }));
    };
    var deletarDivida = function deletarDivida(id) {
      if (confirm('Tem certeza que deseja excluir esta dívida?')) {
        setDividas(dividas.filter(function (d) {
          return d.id !== id;
        }));
      }
    };

    // Calcular estratégias de pagamento
    var calcularEstrategias = function calcularEstrategias() {
      if (dividas.length === 0) return null;
      var disponivel = saldo.positivo ? saldo.saldo : 0;

      // BOLA DE NEVE: Ordena por menor saldo
      var bolaDeNeve = _toConsumableArray(dividas).sort(function (a, b) {
        return a.saldoDevedor - b.saldoDevedor;
      });

      // AVALANCHE: Ordena por maior juros
      var avalanche = _toConsumableArray(dividas).sort(function (a, b) {
        return b.taxaJuros - a.taxaJuros;
      });

      // Calcular tempo e juros para cada estratégia
      var simularEstrategia = function simularEstrategia(ordem) {
        var dividasSimuladas = ordem.map(function (d) {
          return _objectSpread({}, d);
        });
        var meses = 0;
        var jurosTotal = 0;
        var _loop = function _loop() {
          meses++;

          // Aplicar juros
          dividasSimuladas.forEach(function (d) {
            if (d.saldoDevedor > 0) {
              var juros = d.saldoDevedor * (d.taxaJuros / 100);
              d.saldoDevedor += juros;
              jurosTotal += juros;
            }
          });

          // Pagar parcelas mínimas
          var sobra = disponivel;
          dividasSimuladas.forEach(function (d) {
            if (d.saldoDevedor > 0 && sobra >= d.parcelaMinima) {
              d.saldoDevedor -= d.parcelaMinima;
              sobra -= d.parcelaMinima;
            }
          });

          // Aplicar sobra na primeira dívida não quitada
          var _iterator = _createForOfIteratorHelper(dividasSimuladas),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var d = _step.value;
              if (d.saldoDevedor > 0 && sobra > 0) {
                var pagamento = Math.min(sobra, d.saldoDevedor);
                d.saldoDevedor -= pagamento;
                sobra -= pagamento;
                break;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        };
        while (dividasSimuladas.some(function (d) {
          return d.saldoDevedor > 0;
        }) && meses < 360) {
          _loop();
        }
        return {
          meses: meses,
          jurosTotal: jurosTotal
        };
      };
      return {
        bolaDeNeve: simularEstrategia(bolaDeNeve),
        avalanche: simularEstrategia(avalanche),
        disponivel: disponivel
      };
    };
    var estrategias = calcularEstrategias();

    // Separar metas por prazo
    var metasCurtoPrazo = metasFinanceiras.filter(function (m) {
      return m.prazo === 'curto' && !m.concluida;
    });
    var metasMedioPrazo = metasFinanceiras.filter(function (m) {
      return m.prazo === 'medio' && !m.concluida;
    });
    var metasLongoPrazo = metasFinanceiras.filter(function (m) {
      return m.prazo === 'longo' && !m.concluida;
    });
    var metasConcluidas = metasFinanceiras.filter(function (m) {
      return m.concluida;
    });

    // Calcular totais
    var totalMetasValor = metasFinanceiras.filter(function (m) {
      return !m.concluida;
    }).reduce(function (sum, m) {
      return sum + m.valor;
    }, 0);
    var totalMetasAtual = metasFinanceiras.filter(function (m) {
      return !m.concluida;
    }).reduce(function (sum, m) {
      return sum + m.valorAtual;
    }, 0);
    var percentualMetasGeral = totalMetasValor > 0 ? totalMetasAtual / totalMetasValor * 100 : 0;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-base font-bold text-gray-800"
    }, "\uD83D\uDCCB Planejamento")), abaAtiva === 'diagnostico' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r ".concat(scoreInfo.bg, " rounded-xl shadow-lg p-4 text-white")
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs opacity-90 mb-1"
    }, "Score de Sa\xFAde Financeira"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, scoreSaude.score), /*#__PURE__*/React.createElement("div", {
      className: "text-lg mt-1"
    }, scoreInfo.emoji, " ", scoreInfo.text)), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl opacity-20"
    }, scoreInfo.emoji))), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 bg-white bg-opacity-20 rounded-lg p-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs mb-2"
    }, "Crit\xE9rios Avaliados:"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-2"
    }, scoreSaude.criterios.map(function (c, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "flex justify-between text-sm"
      }, /*#__PURE__*/React.createElement("span", null, c.nome), /*#__PURE__*/React.createElement("span", {
        className: "font-bold"
      }, c.pontos, " pts"));
    })))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\uD83D\uDCB0 Situa\xE7\xE3o Atual"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mb-2 ".concat(saldo.positivo ? 'text-green-600' : 'text-red-600')
    }, saldo.positivo ? 'Superávit' : 'Déficit'), /*#__PURE__*/React.createElement("div", {
      className: "text-base font-bold text-gray-800"
    }, "R$ ", Math.abs(saldo.saldo).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, saldo.positivo ? '✅ Sobrando no mês' : '⚠️ Faltando no mês')), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\uD83D\uDCCA Renda Comprometida"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mb-2 ".concat(totais.total / saldo.receitas * 100 <= 70 ? 'text-green-600' : totais.total / saldo.receitas * 100 <= 90 ? 'text-yellow-600' : 'text-red-600')
    }, saldo.receitas > 0 ? (totais.total / saldo.receitas * 100).toFixed(0) : 0, "%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-800"
    }, "R$ ", totais.total.toFixed(2), " de R$ ", saldo.receitas.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, totais.total / saldo.receitas * 100 <= 70 ? '✅ Saudável' : totais.total / saldo.receitas * 100 <= 90 ? '⚠️ Atenção' : '🚨 Crítico')), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600 mb-2"
    }, "\uD83D\uDCB5 Capacidade de Poupan\xE7a"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold mb-2 ".concat(scoreSaude.percentualPoupanca >= 20 ? 'text-green-600' : scoreSaude.percentualPoupanca >= 10 ? 'text-yellow-600' : 'text-red-600')
    }, scoreSaude.percentualPoupanca.toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-800"
    }, "R$ ", saldo.positivo ? saldo.saldo.toFixed(2) : '0.00', " por m\xEAs"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-500 mt-2"
    }, scoreSaude.percentualPoupanca >= 20 ? '✅ Excelente' : scoreSaude.percentualPoupanca >= 10 ? '⚠️ Regular' : '🚨 Insuficiente'))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-base font-bold text-gray-800"
    }, "\uD83C\uDD98 Reserva de Emerg\xEAncia"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setInputDialog({
          titulo: 'Reserva de Emergência',
          label: 'Quanto você tem de reserva de emergência? (R$):',
          valorPadrao: reservaEmergencia,
          callback: function callback(valor) {
            if (valor !== null) setReservaEmergencia(parseFloat(valor) || 0);
          }
        });
      },
      className: "px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
    }, "\u270F\uFE0F Informar Valor")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Meta Ideal (6 meses)"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-600"
    }, "R$ ", scoreSaude.reservaIdeal.toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Reserva Atual"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-purple-600"
    }, "R$ ", scoreSaude.reservaAtual.toFixed(2)), scoreSaude.reservaAtual === 0 && /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-red-600 mt-1"
    }, "\u26A0\uFE0F Clique em \"Informar Valor\" acima")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Falta Acumular"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-orange-600"
    }, "R$ ", Math.max(0, scoreSaude.reservaIdeal - scoreSaude.reservaAtual).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-gray-700"
    }, "Progresso da Reserva"), /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-gray-700"
    }, Math.min(scoreSaude.percentualReserva, 100).toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-6 rounded-full transition-all ".concat(scoreSaude.percentualReserva >= 100 ? 'bg-green-500' : scoreSaude.percentualReserva >= 50 ? 'bg-blue-500' : scoreSaude.percentualReserva >= 16 ? 'bg-yellow-500' : 'bg-red-500'),
      style: {
        width: "".concat(Math.min(scoreSaude.percentualReserva, 100), "%")
      }
    }))), scoreSaude.percentualReserva < 100 && saldo.positivo && /*#__PURE__*/React.createElement("div", {
      className: "bg-blue-50 border border-blue-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-blue-800 mb-2"
    }, "\uD83D\uDCA1 Plano de A\xE7\xE3o:"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-blue-700"
    }, "Economizando R$ ", saldo.saldo.toFixed(2), " por m\xEAs, voc\xEA completar\xE1 sua reserva em", ' ', /*#__PURE__*/React.createElement("span", {
      className: "font-bold"
    }, Math.ceil((scoreSaude.reservaIdeal - scoreSaude.reservaAtual) / saldo.saldo), " meses"), ' ', "(", new Date(Date.now() + Math.ceil((scoreSaude.reservaIdeal - scoreSaude.reservaAtual) / saldo.saldo) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    }), ")")), scoreSaude.percentualReserva >= 100 && /*#__PURE__*/React.createElement("div", {
      className: "bg-green-50 border border-green-200 rounded-lg p-4 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-green-800"
    }, "Parab\xE9ns! Sua reserva de emerg\xEAncia est\xE1 completa!"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-green-700 mt-1"
    }, "Voc\xEA tem seguran\xE7a financeira para 6+ meses")), !saldo.positivo && /*#__PURE__*/React.createElement("div", {
      className: "bg-red-50 border border-red-200 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-red-800 mb-2"
    }, "\u26A0\uFE0F Aten\xE7\xE3o:"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-red-700"
    }, "Voc\xEA est\xE1 com d\xE9ficit mensal. Priorize equilibrar suas contas antes de focar na reserva de emerg\xEAncia."))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "\uD83D\uDD14 Alertas Inteligentes"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, !dentroOrcamento && /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl"
    }, "\uD83D\uDEA8"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-red-800"
    }, "Or\xE7amento Estourado"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-red-700"
    }, "Voc\xEA gastou R$ ", Math.abs(diferenca).toFixed(2), " a mais que o or\xE7amento planejado este m\xEAs."))), dentroOrcamento && gastadoTotal / orcadoTotal * 100 >= 80 && /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl"
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-yellow-800"
    }, "Aten\xE7\xE3o ao Or\xE7amento"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-yellow-700"
    }, "Voc\xEA j\xE1 usou ", (gastadoTotal / orcadoTotal * 100).toFixed(0), "% do seu or\xE7amento. Fique atento aos gastos!"))), scoreSaude.percentualReserva < 16 && /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl"
    }, "\uD83C\uDD98"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-orange-800"
    }, "Reserva Insuficiente"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-orange-700"
    }, "Sua reserva cobre menos de 1 m\xEAs de despesas. Priorize construir uma reserva de emerg\xEAncia!"))), dentroOrcamento && saldo.positivo && scoreSaude.percentualPoupanca >= 20 && /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl"
    }, "\u2705"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-green-800"
    }, "Parab\xE9ns!"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-green-700"
    }, "Voc\xEA est\xE1 dentro do or\xE7amento e economizando ", scoreSaude.percentualPoupanca.toFixed(0), "% da sua renda. Continue assim!"))), dentroOrcamento && scoreSaude.percentualReserva >= 16 && gastadoTotal / orcadoTotal * 100 < 80 && /*#__PURE__*/React.createElement("div", {
      className: "text-center py-8 text-gray-500"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDE0A"), /*#__PURE__*/React.createElement("div", {
      className: "font-semibold"
    }, "Tudo sob controle!"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm"
    }, "N\xE3o h\xE1 alertas cr\xEDticos no momento."))))), abaAtiva === 'orcamento' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('orcamento');
      },
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
      className: "rounded-xl shadow-lg p-6 ".concat(dentroOrcamento ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600', " text-white")
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
      className: "text-2xl font-bold ".concat(totais.cartoes <= orcamento.cartoes ? 'text-green-600' : 'text-red-600')
    }, (totais.cartoes / orcamento.cartoes * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm ".concat(orcamento.cartoes - totais.cartoes >= 0 ? 'text-green-600' : 'text-red-600')
    }, orcamento.cartoes - totais.cartoes >= 0 ? '✅' : '⚠️', " R$ ", Math.abs(orcamento.cartoes - totais.cartoes).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 rounded-full ".concat(totais.cartoes <= orcamento.cartoes ? 'bg-green-500' : 'bg-red-500'),
      style: {
        width: "".concat(Math.min(totais.cartoes / orcamento.cartoes * 100, 100), "%")
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
      className: "text-2xl font-bold ".concat(totais.fixos <= orcamento.fixos ? 'text-green-600' : 'text-red-600')
    }, (totais.fixos / orcamento.fixos * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm ".concat(orcamento.fixos - totais.fixos >= 0 ? 'text-green-600' : 'text-red-600')
    }, orcamento.fixos - totais.fixos >= 0 ? '✅' : '⚠️', " R$ ", Math.abs(orcamento.fixos - totais.fixos).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 rounded-full ".concat(totais.fixos <= orcamento.fixos ? 'bg-green-500' : 'bg-red-500'),
      style: {
        width: "".concat(Math.min(totais.fixos / orcamento.fixos * 100, 100), "%")
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
      className: "text-2xl font-bold ".concat(totais.variaveis <= orcamento.variaveis ? 'text-green-600' : 'text-red-600')
    }, orcamento.variaveis > 0 ? (totais.variaveis / orcamento.variaveis * 100).toFixed(0) : 0, "%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm ".concat(orcamento.variaveis - totais.variaveis >= 0 ? 'text-green-600' : 'text-red-600')
    }, orcamento.variaveis - totais.variaveis >= 0 ? '✅' : '⚠️', " R$ ", Math.abs(orcamento.variaveis - totais.variaveis).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
      className: "w-full bg-gray-200 rounded-full h-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 rounded-full ".concat(totais.variaveis <= orcamento.variaveis ? 'bg-green-500' : 'bg-red-500'),
      style: {
        width: orcamento.variaveis > 0 ? "".concat(Math.min(totais.variaveis / orcamento.variaveis * 100, 100), "%") : '0%'
      }
    })))))), abaAtiva === 'premes' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoPlanejado');
      },
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
    }, planejadosDoMes.filter(function (p) {
      return !p.executado;
    }).length, " itens"))), totalPlanejado > 0 && /*#__PURE__*/React.createElement("div", {
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
        width: "".concat(totalExecutado / totalPlanejado * 100, "%")
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "Gastos Planejados - ", mesAtual.toUpperCase()), planejadosDoMes.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "text-center py-12 text-gray-500"
    }, "Nenhum gasto planejado para este m\xEAs.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novoPlanejado');
      },
      className: "mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
    }, "\u2795 Adicionar Primeiro Planejado")) : /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, planejadosDoMes.map(function (planejado) {
      return /*#__PURE__*/React.createElement("div", {
        key: planejado.id,
        className: "flex items-center justify-between p-4 rounded-lg border-2 transition-all ".concat(planejado.executado ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-gray-300')
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-4 flex-1"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return togglePlanejado(planejado.id);
        },
        className: "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ".concat(planejado.executado ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500')
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
        className: "font-semibold ".concat(planejado.executado ? 'text-green-700 line-through' : 'text-gray-800')
      }, planejado.descricao), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-500"
      }, planejado.categoria)), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold ".concat(planejado.executado ? 'text-green-600' : 'text-gray-800')
      }, "R$ ", planejado.valor.toFixed(2)), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarPlanejado(planejado.id);
        },
        className: "px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
      }, "\uD83D\uDDD1\uFE0F")));
    }))), planejadosDoMes.length > 0 && /*#__PURE__*/React.createElement("div", {
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
      className: "mt-4 p-4 rounded-lg ".concat(totais.total <= totalPlanejado ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center font-bold ".concat(totais.total <= totalPlanejado ? 'text-green-700' : 'text-red-700')
    }, totais.total <= totalPlanejado ? '✅ Dentro do Planejado!' : '⚠️ Acima do Planejado'), /*#__PURE__*/React.createElement("div", {
      className: "text-center text-sm mt-2"
    }, "Diferen\xE7a: R$ ", Math.abs(totalPlanejado - totais.total).toFixed(2))))), abaAtiva === 'metas' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83C\uDFAF Suas Metas Financeiras"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Defina e acompanhe seus objetivos")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
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
    }, metasFinanceiras.filter(function (m) {
      return !m.concluida;
    }).length, " ativas")), /*#__PURE__*/React.createElement("div", {
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
      onClick: function onClick() {
        setModalAberto('novaMeta');
      },
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\u2795 Criar Primeira Meta")) : /*#__PURE__*/React.createElement(React.Fragment, null, metasCurtoPrazo.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\u26A1 Curto Prazo (at\xE9 1 ano)"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, metasCurtoPrazo.map(function (meta) {
      var progresso = meta.valorAtual / meta.valor * 100;
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
        onClick: function onClick() {
          setInputDialog({
            titulo: 'Atualizar Meta',
            label: 'Valor acumulado até agora (R$):',
            valorPadrao: meta.valorAtual,
            callback: function callback(valor) {
              if (valor !== null) atualizarProgressoMeta(meta.id, valor);
            }
          });
        },
        className: "px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200",
        title: "Atualizar progresso"
      }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return concluirMeta(meta.id);
        },
        className: "px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200",
        title: "Marcar como conclu\xEDda"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarMeta(meta.id);
        },
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
          width: "".concat(Math.min(progresso, 100), "%")
        }
      }))), meta.valorAtual < meta.valor && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold text-blue-800 mb-2"
      }, "\uD83D\uDCB0 Plano de Investimento:"), function () {
        var falta = meta.valor - meta.valorAtual;

        // Calcular meses baseado na data meta ou prazo
        var mesesParaCalculo;
        var mensagemData = '';
        if (meta.dataMeta) {
          var hoje = new Date();
          var dataFim = new Date(meta.dataMeta);
          var diffTime = dataFim - hoje;
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          mesesParaCalculo = Math.max(1, Math.ceil(diffDays / 30));
          mensagemData = " (at\xE9 ".concat(dataFim.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          }), ")");
        } else {
          mesesParaCalculo = 12; // padrão curto prazo
          mensagemData = ' (sem data definida)';
        }
        var porMes = falta / mesesParaCalculo;
        var porSemana = porMes / 4;
        var porDia = porMes / 30;
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
      }()));
    }))), metasMedioPrazo.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCC5 M\xE9dio Prazo (1-5 anos)"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, metasMedioPrazo.map(function (meta) {
      var progresso = meta.valorAtual / meta.valor * 100;
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
        onClick: function onClick() {
          setInputDialog({
            titulo: 'Atualizar Meta',
            label: 'Valor acumulado até agora (R$):',
            valorPadrao: meta.valorAtual,
            callback: function callback(valor) {
              if (valor !== null) atualizarProgressoMeta(meta.id, valor);
            }
          });
        },
        className: "px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
      }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return concluirMeta(meta.id);
        },
        className: "px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarMeta(meta.id);
        },
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
          width: "".concat(Math.min(progresso, 100), "%")
        }
      }))), meta.valorAtual < meta.valor && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold text-green-800 mb-2"
      }, "\uD83D\uDCB0 Plano de Investimento:"), function () {
        var falta = meta.valor - meta.valorAtual;

        // Calcular meses baseado na data meta ou prazo
        var mesesParaCalculo;
        if (meta.dataMeta) {
          var hoje = new Date();
          var dataFim = new Date(meta.dataMeta);
          var diffTime = dataFim - hoje;
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          mesesParaCalculo = Math.max(1, Math.ceil(diffDays / 30));
        } else {
          mesesParaCalculo = 60; // padrão médio prazo
        }
        var porMes = falta / mesesParaCalculo;
        var porSemana = porMes / 4;
        var porDia = porMes / 30;
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
        }, "\u23F1\uFE0F Para alcan\xE7ar em ", mesesParaCalculo, " ", mesesParaCalculo === 1 ? 'mês' : 'meses', meta.dataMeta && " (at\xE9 ".concat(new Date(meta.dataMeta).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        }), ")")));
      }()));
    }))), metasLongoPrazo.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83C\uDFC6 Longo Prazo (5+ anos)"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, metasLongoPrazo.map(function (meta) {
      var progresso = meta.valorAtual / meta.valor * 100;
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
        onClick: function onClick() {
          setInputDialog({
            titulo: 'Atualizar Meta',
            label: 'Valor acumulado até agora (R$):',
            valorPadrao: meta.valorAtual,
            callback: function callback(valor) {
              if (valor !== null) atualizarProgressoMeta(meta.id, valor);
            }
          });
        },
        className: "px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
      }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return concluirMeta(meta.id);
        },
        className: "px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarMeta(meta.id);
        },
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
          width: "".concat(Math.min(progresso, 100), "%")
        }
      }))), meta.valorAtual < meta.valor && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold text-purple-800 mb-2"
      }, "\uD83D\uDCB0 Plano de Investimento:"), function () {
        var falta = meta.valor - meta.valorAtual;

        // Calcular meses baseado na data meta ou prazo
        var mesesParaCalculo;
        if (meta.dataMeta) {
          var hoje = new Date();
          var dataFim = new Date(meta.dataMeta);
          var diffTime = dataFim - hoje;
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          mesesParaCalculo = Math.max(1, Math.ceil(diffDays / 30));
        } else {
          mesesParaCalculo = 120; // padrão longo prazo
        }
        var porMes = falta / mesesParaCalculo;
        var porSemana = porMes / 4;
        var porDia = porMes / 30;
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
        }, "\u23F1\uFE0F Para alcan\xE7ar em ", mesesParaCalculo, " ", mesesParaCalculo === 1 ? 'mês' : 'meses', meta.dataMeta && " (at\xE9 ".concat(new Date(meta.dataMeta).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        }), ")")));
      }()));
    }))), metasConcluidas.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83C\uDF89 Metas Conclu\xEDdas"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, metasConcluidas.map(function (meta) {
      return /*#__PURE__*/React.createElement("div", {
        key: meta.id,
        className: "flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "font-semibold text-green-800 line-through"
      }, meta.titulo), /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-green-600"
      }, "R$ ", meta.valor.toFixed(2), " \u2713")), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return deletarMeta(meta.id);
        },
        className: "px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
      }, "\uD83D\uDDD1\uFE0F"));
    }))))), abaAtiva === 'dividas' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCB3 Gerenciamento de D\xEDvidas"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Estrat\xE9gias inteligentes para quitar suas d\xEDvidas")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('novaDivida');
      },
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
      onClick: function onClick() {
        return setModalAberto('novaDivida');
      },
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
    }, "R$ ", dividas.reduce(function (sum, d) {
      return sum + d.saldoDevedor;
    }, 0).toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Parcelas M\xEDnimas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-purple-600"
    }, "R$ ", dividas.reduce(function (sum, d) {
      return sum + d.parcelaMinima;
    }, 0).toFixed(2), "/m\xEAs")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Dispon\xEDvel para D\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold ".concat(saldo.positivo ? 'text-green-600' : 'text-red-600')
    }, "R$ ", saldo.positivo ? saldo.saldo.toFixed(2) : '0.00'))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCCB Suas D\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, dividas.map(function (divida) {
      return /*#__PURE__*/React.createElement("div", {
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
        onClick: function onClick() {
          return deletarDivida(divida.id);
        },
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
          width: "".concat(divida.saldoDevedor / divida.valorTotal * 100, "%")
        }
      }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 mb-1"
      }, "Parcela M\xEDnima"), /*#__PURE__*/React.createElement("div", {
        className: "text-xl font-bold text-purple-600"
      }, "R$ ", divida.parcelaMinima.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-500 mt-2"
      }, divida.parcelaMinima > 0 ? "~".concat(Math.ceil(divida.saldoDevedor / divida.parcelaMinima), " meses (s\xF3 m\xEDnimo)") : 'Definir parcela'))));
    }))), estrategias && estrategias.disponivel > 0 && /*#__PURE__*/React.createElement("div", {
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
    }, "Voc\xEA est\xE1 gastando tudo ou mais que sua renda. Para usar as estrat\xE9gias de pagamento, \xE9 preciso ter sobra mensal. Revise seus gastos no or\xE7amento!")))))), abaAtiva === 'compra' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
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
      onChange: function onChange(e) {
        var parcelasDiv = document.getElementById('simParcelasDiv');
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
      onClick: function onClick() {
        var nome = document.getElementById('simNomeProduto').value;
        var valor = parseFloat(document.getElementById('simValorTotal').value);
        var forma = document.getElementById('simFormaPagamento').value;
        var parcelas = forma === 'parcelado' ? parseInt(document.getElementById('simNumeroParcelas').value) : 1;
        var mesPagamento = document.getElementById('simMesPagamento').value;
        if (!nome || !valor || valor <= 0) {
          alert('⚠️ Preencha o nome e o valor da compra!');
          return;
        }
        if (forma === 'parcelado' && (!parcelas || parcelas < 2)) {
          alert('⚠️ Informe o número de parcelas (mínimo 2)!');
          return;
        }

        // Mostrar resultado
        var divResultado = document.getElementById('simResultado');
        var valorParcela = valor / parcelas;

        // Buscar dados atuais
        var saldoAtual = saldo.saldo;
        var receitasMensal = saldo.receitas;
        var despesasMensal = totais.total;
        var orcamentoTotal = orcadoTotal;
        var impactoMensal = forma === 'avista' ? valor : valorParcela;
        var novasDespesas = despesasMensal + impactoMensal;
        var novoSaldo = receitasMensal - novasDespesas;
        var percentualRenda = impactoMensal / receitasMensal * 100;
        var comprometimentoTotal = novasDespesas / receitasMensal * 100;
        var sufoca = comprometimentoTotal > 90 || novoSaldo < 0;
        var html = "\n                          <div class=\"bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white\">\n                            <h4 class=\"text-xl font-bold mb-4\">\uD83D\uDCCA Resultado da Simula\xE7\xE3o</h4>\n                            \n                            <div class=\"bg-white bg-opacity-20 rounded-lg p-4 mb-4\">\n                              <div class=\"text-sm opacity-90 mb-1\">Produto</div>\n                              <div class=\"text-2xl font-bold\">".concat(nome, "</div>\n                            </div>\n\n                            <div class=\"grid grid-cols-2 gap-4 mb-4\">\n                              <div class=\"bg-white bg-opacity-20 rounded-lg p-4\">\n                                <div class=\"text-sm opacity-90 mb-1\">Valor Total</div>\n                                <div class=\"text-xl font-bold\">R$ ").concat(valor.toFixed(2), "</div>\n                              </div>\n                              <div class=\"bg-white bg-opacity-20 rounded-lg p-4\">\n                                <div class=\"text-sm opacity-90 mb-1\">").concat(forma === 'avista' ? 'Pagamento' : 'Parcelas', "</div>\n                                <div class=\"text-xl font-bold\">").concat(forma === 'avista' ? 'À Vista' : parcelas + 'x', "</div>\n                              </div>\n                            </div>\n\n                            ").concat(forma === 'parcelado' ? "\n                              <div class=\"bg-white bg-opacity-20 rounded-lg p-4 mb-4\">\n                                <div class=\"text-sm opacity-90 mb-1\">Valor por Parcela</div>\n                                <div class=\"text-2xl font-bold\">R$ ".concat(valorParcela.toFixed(2), "</div>\n                              </div>\n                            ") : '', "\n                          </div>\n                        ");
        html += "\n                          <div class=\"bg-white rounded-xl shadow-lg p-6 mt-4\">\n                            <h4 class=\"text-lg font-bold text-gray-800 mb-4\">\uD83D\uDCB0 Impacto no Or\xE7amento</h4>\n                            \n                            <div class=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-4\">\n                              <div class=\"border-2 border-gray-200 rounded-lg p-4\">\n                                <div class=\"text-sm text-gray-600 mb-1\">Suas Receitas</div>\n                                <div class=\"text-xl font-bold text-green-600\">R$ ".concat(receitasMensal.toFixed(2), "</div>\n                              </div>\n                              <div class=\"border-2 border-gray-200 rounded-lg p-4\">\n                                <div class=\"text-sm text-gray-600 mb-1\">Despesas Atuais</div>\n                                <div class=\"text-xl font-bold text-orange-600\">R$ ").concat(despesasMensal.toFixed(2), "</div>\n                              </div>\n                              <div class=\"border-2 border-gray-200 rounded-lg p-4\">\n                                <div class=\"text-sm text-gray-600 mb-1\">Saldo Atual</div>\n                                <div class=\"text-xl font-bold ").concat(saldoAtual >= 0 ? 'text-green-600' : 'text-red-600', "\">\n                                  R$ ").concat(saldoAtual.toFixed(2), "\n                                </div>\n                              </div>\n                            </div>\n\n                            <div class=\"border-t-2 border-gray-200 pt-4 mt-4\">\n                              <div class=\"grid grid-cols-1 md:grid-cols-3 gap-4\">\n                                <div class=\"bg-blue-50 border-2 border-blue-200 rounded-lg p-4\">\n                                  <div class=\"text-sm text-blue-700 mb-1\">Impacto Mensal</div>\n                                  <div class=\"text-2xl font-bold text-blue-600\">R$ ").concat(impactoMensal.toFixed(2), "</div>\n                                  <div class=\"text-xs text-blue-600 mt-1\">").concat(percentualRenda.toFixed(1), "% da renda</div>\n                                </div>\n                                <div class=\"").concat(sufoca ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200', " border-2 rounded-lg p-4\">\n                                  <div class=\"text-sm ").concat(sufoca ? 'text-red-700' : 'text-green-700', " mb-1\">Novo Saldo</div>\n                                  <div class=\"text-2xl font-bold ").concat(sufoca ? 'text-red-600' : 'text-green-600', "\">\n                                    R$ ").concat(novoSaldo.toFixed(2), "\n                                  </div>\n                                  <div class=\"text-xs ").concat(sufoca ? 'text-red-600' : 'text-green-600', " mt-1\">\n                                    ").concat(novoSaldo >= 0 ? 'Sobrando' : 'Faltando', "\n                                  </div>\n                                </div>\n                                <div class=\"bg-purple-50 border-2 border-purple-200 rounded-lg p-4\">\n                                  <div class=\"text-sm text-purple-700 mb-1\">Renda Comprometida</div>\n                                  <div class=\"text-2xl font-bold ").concat(comprometimentoTotal > 90 ? 'text-red-600' : 'text-purple-600', "\">\n                                    ").concat(comprometimentoTotal.toFixed(0), "%\n                                  </div>\n                                  <div class=\"text-xs text-purple-600 mt-1\">\n                                    ").concat(comprometimentoTotal <= 70 ? '✅ Saudável' : comprometimentoTotal <= 90 ? '⚠️ Atenção' : '🚨 Crítico', "\n                                  </div>\n                                </div>\n                              </div>\n                            </div>\n\n                            <div class=\"mt-4 p-4 rounded-lg ").concat(sufoca ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200', "\">\n                              <div class=\"flex items-start gap-3\">\n                                <div class=\"text-2xl\">").concat(sufoca ? '🚨' : '✅', "</div>\n                                <div class=\"flex-1\">\n                                  <div class=\"font-bold ").concat(sufoca ? 'text-red-800' : 'text-green-800', " mb-2\">\n                                    ").concat(sufoca ? 'ATENÇÃO: Esta compra pode sufocar seu orçamento!' : 'Esta compra está dentro do seu orçamento!', "\n                                  </div>\n                                  <div class=\"text-sm ").concat(sufoca ? 'text-red-700' : 'text-green-700', "\">\n                                    ").concat(sufoca ? 'Com essa compra, você ficará com ' + comprometimentoTotal.toFixed(0) + '% da renda comprometida. ' + (novoSaldo < 0 ? 'Você terá déficit de R$ ' + Math.abs(novoSaldo).toFixed(2) + ' no mês. ' : '') + 'Considere reduzir gastos ou aumentar o prazo de pagamento.' : 'Você ainda terá R$ ' + novoSaldo.toFixed(2) + ' sobrando por mês. Está dentro do recomendado manter menos de 70% da renda comprometida.', "\n                                  </div>\n                                </div>\n                              </div>\n                            </div>\n\n                            ").concat(forma === 'parcelado' ? "\n                              <div class=\"mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4\">\n                                <div class=\"font-bold text-blue-800 mb-2\">\uD83D\uDCC5 Cronograma de Pagamento</div>\n                                <div class=\"text-sm text-blue-700\">\n                                  Primeira parcela: ".concat(new Date(mesPagamento + '-01').toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        }), "<br>\n                                  \xDAltima parcela: ").concat(function () {
          var data = new Date(mesPagamento + '-01');
          data.setMonth(data.getMonth() + parcelas - 1);
          return data.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          });
        }(), "<br>\n                                  Durante ").concat(parcelas, " meses voc\xEA ter\xE1 um compromisso de R$ ").concat(valorParcela.toFixed(2), " mensais.\n                                </div>\n                              </div>\n                            ") : '', "\n                          </div>\n                        ");
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
    }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Considere sua reserva de emerg\xEAncia:"), " N\xE3o comprometa seu fundo de emerg\xEAncia"))))), abaAtiva === 'simulador' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
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
      className: "text-2xl font-bold ".concat(saldo.positivo ? 'text-green-300' : 'text-red-300')
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
      onChange: function onChange(e) {
        return setSimulacao(_objectSpread(_objectSpread({}, simulacao), {}, {
          rendaAjuste: parseFloat(e.target.value)
        }));
      },
      className: "w-full"
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mt-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-red-600"
    }, "-50%"), /*#__PURE__*/React.createElement("span", {
      className: "font-bold ".concat(simulacao.rendaAjuste >= 0 ? 'text-green-600' : 'text-red-600')
    }, simulacao.rendaAjuste > 0 ? '+' : '', simulacao.rendaAjuste, "%"), /*#__PURE__*/React.createElement("span", {
      className: "text-green-600"
    }, "+100%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-semibold text-gray-700 mb-2"
    }, "\uD83D\uDCC9 Ajuste de Gastos (%)"), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "-50",
      max: "50",
      value: simulacao.gastosAjuste,
      onChange: function onChange(e) {
        return setSimulacao(_objectSpread(_objectSpread({}, simulacao), {}, {
          gastosAjuste: parseFloat(e.target.value)
        }));
      },
      className: "w-full"
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mt-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-green-600"
    }, "-50%"), /*#__PURE__*/React.createElement("span", {
      className: "font-bold ".concat(simulacao.gastosAjuste <= 0 ? 'text-green-600' : 'text-red-600')
    }, simulacao.gastosAjuste > 0 ? '+' : '', simulacao.gastosAjuste, "%"), /*#__PURE__*/React.createElement("span", {
      className: "text-red-600"
    }, "+50%")))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSimulacao({
          rendaAjuste: 0,
          gastosAjuste: 0,
          quitarDivida: null,
          novaReceita: 0,
          novaDespesa: 0
        });
      },
      className: "mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
    }, "\uD83D\uDD04 Resetar")), function () {
      var receitaSimulada = saldo.receitas * (1 + simulacao.rendaAjuste / 100);
      var despesaSimulada = totais.total * (1 + simulacao.gastosAjuste / 100);
      var saldoSimulado = receitaSimulada - despesaSimulada;
      var positivoSimulado = saldoSimulado >= 0;

      // Calcular novo score
      var scoreSimulado = 0;
      if (positivoSimulado) scoreSimulado += 30;
      if (despesaSimulada <= receitaSimulada * 0.9) scoreSimulado += 25;
      scoreSimulado += Math.min(30, Math.floor(reservaEmergencia / (despesaSimulada * 6) * 30));
      if (positivoSimulado) scoreSimulado += Math.min(15, Math.floor(saldoSimulado / receitaSimulada * 100 / 20 * 15));
      var diferenca = {
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
        className: "text-sm ".concat(diferenca.receita >= 0 ? 'text-green-300' : 'text-red-300')
      }, diferenca.receita >= 0 ? '▲' : '▼', " R$ ", Math.abs(diferenca.receita).toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Despesas"), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold"
      }, "R$ ", despesaSimulada.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm ".concat(diferenca.despesa <= 0 ? 'text-green-300' : 'text-red-300')
      }, diferenca.despesa >= 0 ? '▲' : '▼', " R$ ", Math.abs(diferenca.despesa).toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Saldo"), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold ".concat(positivoSimulado ? 'text-green-300' : 'text-red-300')
      }, "R$ ", saldoSimulado.toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm ".concat(diferenca.saldo >= 0 ? 'text-green-300' : 'text-red-300')
      }, diferenca.saldo >= 0 ? '▲' : '▼', " R$ ", Math.abs(diferenca.saldo).toFixed(2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-75"
      }, "Score"), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold"
      }, scoreSimulado), /*#__PURE__*/React.createElement("div", {
        className: "text-sm ".concat(diferenca.score >= 0 ? 'text-green-300' : 'text-red-300')
      }, diferenca.score >= 0 ? '▲' : '▼', " ", Math.abs(diferenca.score), " pts"))), /*#__PURE__*/React.createElement("div", {
        className: "bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "font-bold mb-2"
      }, "\uD83D\uDCCA An\xE1lise de Impacto:"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-1 text-sm"
      }, diferenca.saldo > 0 && /*#__PURE__*/React.createElement("div", null, "\u2705 Melhora no saldo mensal de R$ ", diferenca.saldo.toFixed(2)), diferenca.saldo < 0 && /*#__PURE__*/React.createElement("div", null, "\u26A0\uFE0F Piora no saldo mensal de R$ ", Math.abs(diferenca.saldo).toFixed(2)), diferenca.score > 0 && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC8 Score de sa\xFAde aumenta ", diferenca.score, " pontos"), diferenca.score < 0 && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC9 Score de sa\xFAde diminui ", Math.abs(diferenca.score), " pontos"), positivoSimulado && !saldo.positivo && /*#__PURE__*/React.createElement("div", null, "\uD83C\uDF89 Voc\xEA sairia do vermelho!"), !positivoSimulado && saldo.positivo && /*#__PURE__*/React.createElement("div", null, "\uD83D\uDEA8 Voc\xEA entraria no vermelho!"))));
    }(), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\u26A1 Cen\xE1rios R\xE1pidos"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSimulacao(_objectSpread(_objectSpread({}, simulacao), {}, {
          rendaAjuste: 20,
          gastosAjuste: 0
        }));
      },
      className: "p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDCC8"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "Promo\xE7\xE3o +20%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Aumento de renda")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSimulacao(_objectSpread(_objectSpread({}, simulacao), {}, {
          rendaAjuste: 0,
          gastosAjuste: -20
        }));
      },
      className: "p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDCB0"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "Economia -20%"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "Redu\xE7\xE3o de gastos")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSimulacao(_objectSpread(_objectSpread({}, simulacao), {}, {
          rendaAjuste: 20,
          gastosAjuste: -20
        }));
      },
      className: "p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-2xl mb-2"
    }, "\uD83D\uDE80"), /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-gray-800"
    }, "Combo Perfeito"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-gray-600"
    }, "+20% renda, -20% gastos"))))), abaAtiva === 'timeline' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, "\uD83D\uDCC8 Linha do Tempo Financeira"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Visualize sua jornada financeira e proje\xE7\xF5es futuras")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
        padding: '1.5rem',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl"
    }, "\uD83D\uDCCD"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
      className: "text-xl font-bold"
    }, "Voc\xEA est\xE1 aqui"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm opacity-90"
    }, new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Score"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, scoreSaude.score)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Saldo Mensal"), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold"
    }, "R$ ", saldo.saldo.toFixed(0))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "Metas Ativas"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, metasFinanceiras.filter(function (m) {
      return !m.concluida;
    }).length)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "D\xEDvidas"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, dividas.length)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-bold text-gray-800 mb-3"
    }, "\uD83D\uDDD3\uFE0F Pr\xF3ximos Marcos"), /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
    }), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, metasFinanceiras.filter(function (m) {
      return !m.concluida && m.dataMeta;
    }).sort(function (a, b) {
      return new Date(a.dataMeta) - new Date(b.dataMeta);
    }).slice(0, 5).map(function (meta) {
      var progresso = meta.valorAtual / meta.valor * 100;
      var dataMeta = new Date(meta.dataMeta);
      var hoje = new Date();
      var diasRestantes = Math.ceil((dataMeta - hoje) / (1000 * 60 * 60 * 24));
      return /*#__PURE__*/React.createElement("div", {
        key: meta.id,
        className: "relative flex items-start gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "relative z-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl"
      }, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("div", {
        className: "flex-1 bg-blue-50 rounded-lg p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start mb-2"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
        className: "font-bold text-gray-800"
      }, meta.titulo), /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-600"
      }, dataMeta.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }), diasRestantes > 0 && " \u2022 ".concat(diasRestantes, " dias restantes"))), /*#__PURE__*/React.createElement("span", {
        className: "px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold"
      }, progresso.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1 bg-white rounded-full h-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-blue-600 h-3 rounded-full transition-all",
        style: {
          width: "".concat(Math.min(progresso, 100), "%")
        }
      })), /*#__PURE__*/React.createElement("span", {
        className: "text-sm font-semibold text-gray-700"
      }, "R$ ", meta.valorAtual.toFixed(0), " / R$ ", meta.valor.toFixed(0)))));
    }), dividas.length > 0 && estrategias && estrategias.disponivel > 0 && /*#__PURE__*/React.createElement("div", {
      className: "relative flex items-start gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative z-10 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl"
    }, "\u2705"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 bg-green-50 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("h5", {
      className: "font-bold text-gray-800"
    }, "Todas as D\xEDvidas Quitadas"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mb-2"
    }, function () {
      var meses = Math.min(estrategias.bolaDeNeve.meses, estrategias.avalanche.meses);
      var dataQuita = new Date();
      dataQuita.setMonth(dataQuita.getMonth() + meses);
      return dataQuita.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    }()), /*#__PURE__*/React.createElement("div", {
      className: "text-sm"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, "Estrat\xE9gia recomendada:"), ' ', estrategias.avalanche.jurosTotal < estrategias.bolaDeNeve.jurosTotal ? '⚡ Avalanche (economia máxima)' : '🔴 Bola de Neve (motivação)'))), scoreSaude.percentualReserva < 100 && /*#__PURE__*/React.createElement("div", {
      className: "relative flex items-start gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative z-10 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl"
    }, "\uD83C\uDD98"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 bg-purple-50 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("h5", {
      className: "font-bold text-gray-800"
    }, "Reserva de Emerg\xEAncia Completa"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mb-2"
    }, saldo.positivo && saldo.saldo > 0 ? function () {
      var falta = scoreSaude.reservaIdeal - scoreSaude.reservaAtual;
      var mesesRestantes = Math.ceil(falta / saldo.saldo);
      var dataCompleta = new Date();
      dataCompleta.setMonth(dataCompleta.getMonth() + mesesRestantes);
      return dataCompleta.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    }() : 'Defina seu saldo para calcular'), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1 bg-white rounded-full h-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-purple-600 h-3 rounded-full",
      style: {
        width: "".concat(Math.min(scoreSaude.percentualReserva, 100), "%")
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, scoreSaude.percentualReserva.toFixed(0), "%")))), scoreSaude.score < 100 && /*#__PURE__*/React.createElement("div", {
      className: "relative flex items-start gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative z-10 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl"
    }, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 bg-yellow-50 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("h5", {
      className: "font-bold text-gray-800"
    }, "Score de Sa\xFAde 100"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mb-2"
    }, "Meta de excel\xEAncia financeira"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, "Faltam:"), " ", 100 - scoreSaude.score, " pontos"))))), metasFinanceiras.filter(function (m) {
      return !m.concluida && m.dataMeta;
    }).length === 0 && dividas.length === 0 && scoreSaude.percentualReserva >= 100 && scoreSaude.score >= 100 && /*#__PURE__*/React.createElement("div", {
      className: "text-center py-12"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl mb-4"
    }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("h4", {
      className: "text-xl font-bold text-gray-800 mb-2"
    }, "Parab\xE9ns!"), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Voc\xEA alcan\xE7ou todos os marcos financeiros!"))), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-xl font-bold mb-4"
    }, "\uD83D\uDCB0 Proje\xE7\xE3o de Patrim\xF4nio"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "1 Ano"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, "R$ ", (reservaEmergencia + (saldo.positivo ? saldo.saldo * 12 : 0)).toFixed(0)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90 mt-1"
    }, saldo.positivo ? "+R$ ".concat((saldo.saldo * 12).toFixed(0), " acumulado") : 'Sem acúmulo')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "3 Anos"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, "R$ ", (reservaEmergencia + (saldo.positivo ? saldo.saldo * 36 : 0)).toFixed(0)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90 mt-1"
    }, saldo.positivo ? "+R$ ".concat((saldo.saldo * 36).toFixed(0), " acumulado") : 'Sem acúmulo')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-75"
    }, "5 Anos"), /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-bold"
    }, "R$ ", (reservaEmergencia + (saldo.positivo ? saldo.saldo * 60 : 0)).toFixed(0)), /*#__PURE__*/React.createElement("div", {
      className: "text-sm opacity-90 mt-1"
    }, saldo.positivo ? "+R$ ".concat((saldo.saldo * 60).toFixed(0), " acumulado") : 'Sem acúmulo'))), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 p-3 bg-white bg-opacity-20 rounded backdrop-blur-sm text-sm"
    }, "\u26A0\uFE0F Proje\xE7\xE3o considerando economia mensal constante, sem investimentos ou infla\xE7\xE3o"))), abaAtiva === 'metasanuais' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalAberto('metas');
      },
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
    }, "R$ ", ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1).reduce(function (sum, mes) {
      return sum + calcularTotais(mes).total;
    }, 0).toFixed(2))), function () {
      var totalMetaAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1).reduce(function (sum, mes) {
        return sum + (metas[mes] || 0);
      }, 0);
      var totalGastoAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1).reduce(function (sum, mes) {
        return sum + calcularTotais(mes).total;
      }, 0);
      var diferenca = totalMetaAteAgora - totalGastoAteAgora;
      var dentroMeta = diferenca >= 0;
      return /*#__PURE__*/React.createElement("div", {
        className: "rounded-xl shadow-lg p-6 ".concat(dentroMeta ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600', " text-white")
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm opacity-90"
      }, dentroMeta ? 'Economia' : 'Excesso'), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold"
      }, "R$ ", Math.abs(diferenca).toFixed(2)), /*#__PURE__*/React.createElement("div", {
        className: "text-sm mt-2"
      }, dentroMeta ? '✅ Abaixo da meta' : '⚠️ Acima da meta'));
    }(), function () {
      var mesesAteAgora = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].slice(0, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(mesAtual) + 1);
      var mesesNoTarget = mesesAteAgora.filter(function (mes) {
        var meta = metas[mes] || 0;
        var gasto = calcularTotais(mes).total;
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
    }()), /*#__PURE__*/React.createElement("div", {
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
    }, "%"))), /*#__PURE__*/React.createElement("tbody", null, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(function (mes) {
      var meta = metas[mes] || 0;
      var real = calcularTotais(mes).total;
      var diferenca = meta - real;
      var percentual = meta > 0 ? real / meta * 100 : 0;
      var dentroMeta = real <= meta && real > 0;
      var pendente = real === 0;
      return /*#__PURE__*/React.createElement("tr", {
        key: mes,
        className: "border-b border-gray-100 hover:bg-gray-50 ".concat(mes === mesAtual ? 'bg-blue-50' : '')
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
        className: "text-right py-2 px-4 font-bold ".concat(diferenca >= 0 ? 'text-green-600' : 'text-red-600')
      }, diferenca >= 0 ? '+' : '', "R$ ", diferenca.toFixed(2)), /*#__PURE__*/React.createElement("td", {
        className: "text-center py-2 px-4 text-2xl"
      }, pendente ? '⏳' : dentroMeta ? '✅' : '❌'), /*#__PURE__*/React.createElement("td", {
        className: "text-right py-2 px-4 font-bold ".concat(dentroMeta ? 'text-green-600' : pendente ? 'text-gray-400' : 'text-red-600')
      }, percentual.toFixed(0), "%"));
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold text-gray-800 mb-4"
    }, "Evolu\xE7\xE3o Anual"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].map(function (mes) {
      var meta = metas[mes] || 0;
      var real = calcularTotais(mes).total;
      var maxValor = Math.max(meta, real, 1);
      var larguraMeta = meta / maxValor * 100;
      var larguraReal = real / maxValor * 100;
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
          width: "".concat(larguraMeta, "%")
        },
        title: "Meta: R$ ".concat(meta.toFixed(2))
      }), /*#__PURE__*/React.createElement("div", {
        className: "absolute top-5 left-0 h-4 rounded ".concat(real <= meta ? 'bg-green-500' : 'bg-red-500'),
        style: {
          width: "".concat(larguraReal, "%")
        },
        title: "Real: R$ ".concat(real.toFixed(2))
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
    }), /*#__PURE__*/React.createElement("span", null, "Gasto Real (Acima)"))))));
  };
  var TelaFarol = function TelaFarol() {
    var _useState175 = useState('todos'),
      _useState176 = _slicedToArray(_useState175, 2),
      filtroStatus = _useState176[0],
      setFiltroStatus = _useState176[1];
    var _useState177 = useState(null),
      _useState178 = _slicedToArray(_useState177, 2),
      modalPagamento = _useState178[0],
      setModalPagamento = _useState178[1];
    var _useState179 = useState(''),
      _useState180 = _slicedToArray(_useState179, 2),
      valorParcial = _useState180[0],
      setValorParcial = _useState180[1];
    var _useState181 = useState(false),
      _useState182 = _slicedToArray(_useState181, 2),
      mostrarTimeline = _useState182[0],
      setMostrarTimeline = _useState182[1]; // INICIA FECHADO

    var itensTodos = [].concat(_toConsumableArray(cartoes.map(function (c) {
      var _c$valores3;
      var valoresAno = ((_c$valores3 = c.valores) === null || _c$valores3 === void 0 ? void 0 : _c$valores3[anoAtual]) || {};
      return {
        tipo: 'CARTÃO',
        nome: c.nome,
        vencimento: c.vencimento,
        valor: valoresAno[mesAtual] || 0
      };
    })), _toConsumableArray(gastosFixos.filter(function (g) {
      return !g.mes || g.mes === mesAtual;
    }) // Se não tem mês OU é do mês atual
    .filter(function (g) {
      return !g.ano || g.ano === anoAtual;
    }) // Se não tem ano OU é do ano atual
    .map(function (g) {
      return {
        tipo: 'FIXO',
        nome: g.descricao,
        vencimento: g.vencimento,
        valor: g.valor,
        badge: g.temporario && g.totalParcelas ? "".concat(g.parcelaAtual, "/").concat(g.totalParcelas) : null
      };
    })), _toConsumableArray(gastosVariaveis.filter(function (g) {
      return g.mostrarNoFarol && g.mes === mesAtual && g.ano === anoAtual;
    }).map(function (g) {
      return {
        tipo: 'VARIÁVEL',
        nome: g.descricao || g.categoria,
        vencimento: g.vencimento || 1,
        valor: g.valor
      };
    })), _toConsumableArray(gastosExtras.filter(function (g) {
      return g.mostrarNoFarol && g.mes === mesAtual && g.ano === anoAtual;
    }).map(function (g) {
      return {
        tipo: 'EXTRA',
        nome: g.descricao || g.categoria,
        vencimento: g.vencimento || 1,
        valor: g.valor
      };
    }))).filter(function (item) {
      return item.valor > 0;
    }).sort(function (a, b) {
      return a.vencimento - b.vencimento;
    });
    var itensFiltrados = filtroStatus === 'todos' ? itensTodos : filtroStatus === 'pagos' ? itensTodos.filter(function (item) {
      return getStatusFarol(item.nome, mesAtual) === 'PAGO';
    }) : itensTodos.filter(function (item) {
      return getStatusFarol(item.nome, mesAtual) === 'PENDENTE';
    });

    // Calcular vencimentos da semana
    var hoje = new Date();
    var diaHoje = hoje.getDate();
    var proximaSemana = diaHoje + 7;
    var vencimentosHoje = itensTodos.filter(function (item) {
      var status = getStatusFarol(item.nome, mesAtual);
      return item.vencimento === diaHoje && status !== 'PAGO';
    });
    var vencimentosSemana = itensTodos.filter(function (item) {
      var status = getStatusFarol(item.nome, mesAtual);
      return item.vencimento > diaHoje && item.vencimento <= proximaSemana && status !== 'PAGO';
    });
    var totalHoje = vencimentosHoje.reduce(function (sum, item) {
      return sum + item.valor;
    }, 0);
    var totalSemana = vencimentosSemana.reduce(function (sum, item) {
      return sum + item.valor;
    }, 0);
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
    }, vencimentosHoje.slice(0, 2).map(function (item, idx) {
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "text-xs opacity-80 truncate"
      }, "\u2022 ", item.nome);
    }), vencimentosHoje.length > 2 && /*#__PURE__*/React.createElement("div", {
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
    }, vencimentosSemana.slice(0, 2).map(function (item, idx) {
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "text-xs opacity-80 truncate"
      }, "\u2022 ", item.nome, " (dia ", item.vencimento, ")");
    }), vencimentosSemana.length > 2 && /*#__PURE__*/React.createElement("div", {
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
      onClick: function onClick() {
        return setMostrarTimeline(!mostrarTimeline);
      },
      className: "text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors w-full"
    }, mostrarTimeline ? '📅 Ocultar' : '📅 Ver', " Timeline")))), mostrarTimeline && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-xl shadow-lg p-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800 mb-4"
    }, "\uD83D\uDCC6 Timeline da Semana"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, _toConsumableArray(Array(7)).map(function (_, i) {
      var dia = diaHoje + i;
      var vencimentosDia = itensTodos.filter(function (item) {
        var status = getStatusFarol(item.nome, mesAtual);
        return item.vencimento === dia && status !== 'PAGO';
      });
      var totalDia = vencimentosDia.reduce(function (sum, item) {
        return sum + item.valor;
      }, 0);
      var dataFutura = new Date(hoje);
      dataFutura.setDate(dia);
      var diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataFutura.getDay()];
      var isHoje = i === 0;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "flex items-start gap-3 p-3 rounded-lg transition-all ".concat(isHoje ? 'bg-purple-50 border-2 border-purple-500' : vencimentosDia.length > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200')
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-shrink-0 w-16 text-center ".concat(isHoje ? 'text-purple-600' : 'text-gray-600')
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-xs font-semibold"
      }, diaSemana), /*#__PURE__*/React.createElement("div", {
        className: "text-2xl font-bold ".concat(isHoje ? 'text-purple-700' : 'text-gray-700')
      }, dia), isHoje && /*#__PURE__*/React.createElement("div", {
        className: "text-xs font-bold text-purple-600"
      }, "HOJE")), /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, vencimentosDia.length === 0 ? /*#__PURE__*/React.createElement("div", {
        className: "text-sm text-gray-400 italic py-2"
      }, "Nenhum vencimento") : /*#__PURE__*/React.createElement("div", {
        className: "space-y-2"
      }, vencimentosDia.map(function (item, idx) {
        var status = getStatusFarol(item.nome, mesAtual);
        var isPago = status === 'PAGO';
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
      className: "h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-xs font-bold ".concat(pagamentos.percentual >= 100 ? 'bg-green-500' : pagamentos.percentual >= 50 ? 'bg-yellow-500' : 'bg-red-500'),
      style: {
        width: "".concat(Math.min(pagamentos.percentual, 100), "%")
      }
    }, pagamentos.percentual >= 10 && "".concat(pagamentos.percentual.toFixed(0), "%")))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mb-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setFiltroStatus('todos');
      },
      className: "px-4 py-2 rounded-lg font-semibold ".concat(filtroStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
    }, "Todos (", itensTodos.length, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setFiltroStatus('pagos');
      },
      className: "px-4 py-2 rounded-lg font-semibold ".concat(filtroStatus === 'pagos' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
    }, "\u2705 Pagos (", pagamentos.qtdPago, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setFiltroStatus('pendentes');
      },
      className: "px-4 py-2 rounded-lg font-semibold ".concat(filtroStatus === 'pendentes' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
    }, "\u23F3 Pendentes (", pagamentos.qtdTotal - pagamentos.qtdPago, ")")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, function () {
      // Agrupar itens por data de vencimento
      var itensPorData = {};
      itensFiltrados.forEach(function (item) {
        var dia = item.vencimento;
        if (!itensPorData[dia]) {
          itensPorData[dia] = [];
        }
        itensPorData[dia].push(item);
      });

      // Ordenar dias
      var diasOrdenados = Object.keys(itensPorData).sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      });
      return diasOrdenados.map(function (dia) {
        var itensDoDia = itensPorData[dia];
        var totalDia = itensDoDia.reduce(function (sum, item) {
          return sum + item.valor;
        }, 0);
        var hoje = new Date().getDate();
        var isHoje = parseInt(dia) === hoje;

        // Calcular dia da semana
        var dataAtual = new Date();
        var anoNum = dataAtual.getFullYear();
        var mesNum = dataAtual.getMonth();
        var dataVencimento = new Date(anoNum, mesNum, parseInt(dia));
        var diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dataVencimento.getDay()];
        return /*#__PURE__*/React.createElement("div", {
          key: dia,
          className: "flex items-start gap-3 p-3 rounded-lg transition-all ".concat(isHoje ? 'bg-purple-50 border-2 border-purple-500' : itensDoDia.length > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200')
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex-shrink-0 w-16 text-center ".concat(isHoje ? 'text-purple-600' : 'text-gray-600')
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-semibold"
        }, diaSemana), /*#__PURE__*/React.createElement("div", {
          className: "text-2xl font-bold ".concat(isHoje ? 'text-purple-700' : 'text-gray-700')
        }, dia), isHoje && /*#__PURE__*/React.createElement("div", {
          className: "text-xs font-bold text-purple-600"
        }, "HOJE")), /*#__PURE__*/React.createElement("div", {
          className: "flex-1"
        }, itensDoDia.length === 0 ? /*#__PURE__*/React.createElement("div", {
          className: "text-sm text-gray-400 italic py-2"
        }, "Nenhum vencimento") : /*#__PURE__*/React.createElement("div", {
          className: "space-y-2"
        }, itensDoDia.map(function (item, idx) {
          var status = getStatusFarol(item.nome, mesAtual);
          var isPago = status === 'PAGO';
          var isParcial = typeof status === 'number' && status > 0;
          var valorPago = isParcial ? status : 0;
          var isAtrasado = parseInt(dia) < hoje && !isPago;
          return /*#__PURE__*/React.createElement("div", {
            key: idx,
            className: "flex items-center justify-between bg-white rounded p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
            onClick: function onClick() {
              return setModalPagamento(item);
            }
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex items-center gap-2"
          }, /*#__PURE__*/React.createElement("span", {
            className: "text-lg"
          }, isPago ? '✅' : isAtrasado ? '⚠️' : isParcial ? '💵' : '⚪'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "font-semibold text-sm ".concat(isPago ? 'text-green-700 line-through' : 'text-gray-800')
          }, item.nome), /*#__PURE__*/React.createElement("div", {
            className: "text-xs text-gray-500"
          }, item.tipo))), /*#__PURE__*/React.createElement("div", {
            className: "text-right"
          }, /*#__PURE__*/React.createElement("div", {
            className: "font-bold ".concat(isPago ? 'text-green-600' : 'text-gray-800')
          }, "R$ ", item.valor.toFixed(2)), isParcial && /*#__PURE__*/React.createElement("div", {
            className: "text-xs text-blue-600"
          }, "Pago: R$ ", valorPago.toFixed(2))));
        }), /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-right font-bold text-gray-600 pt-1 border-t"
        }, "Total do dia: R$ ", totalDia.toFixed(2)))));
      });
    }())), modalPagamento && /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: function onClick() {
        return setModalPagamento(null);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-content",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-bold mb-4"
    }, "\uD83D\uDCB0 Registrar Pagamento"), /*#__PURE__*/React.createElement("div", {
      className: "mb-4 p-4 bg-blue-50 rounded-lg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold"
    }, modalPagamento.nome), /*#__PURE__*/React.createElement("div", {
      className: "text-2xl font-bold text-blue-600 mt-2"
    }, "Total: R$ ", modalPagamento.valor.toFixed(2)), function () {
      var statusAtual = getStatusFarol(modalPagamento.nome, mesAtual);
      if (typeof statusAtual === 'number' && statusAtual > 0) {
        var restante = modalPagamento.valor - statusAtual;
        return /*#__PURE__*/React.createElement("div", {
          className: "mt-3 pt-3 border-t border-blue-300"
        }, /*#__PURE__*/React.createElement("div", {
          className: "text-sm text-green-600 font-semibold"
        }, "\u2705 J\xE1 pago: R$ ", statusAtual.toFixed(2)), /*#__PURE__*/React.createElement("div", {
          className: "text-sm text-orange-600 font-semibold"
        }, "\u23F3 Falta pagar: R$ ", restante.toFixed(2)));
      }
      return null;
    }()), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
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
      onChange: function onChange(e) {
        return setValorParcial(e.target.value);
      },
      placeholder: "Digite o valor",
      className: "w-full px-4 py-2 border rounded-lg mb-2"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (valorParcial && parseFloat(valorParcial) > 0) {
          pagarParcial(modalPagamento.nome, mesAtual, valorParcial);
          setModalPagamento(null);
          setValorParcial('');
        }
      },
      className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    }, "\uD83D\uDCB0 Pagar Parcial")), function () {
      var statusAtual = getStatusFarol(modalPagamento.nome, mesAtual);
      // Mostrar botão de resetar para PAGO ou PARCIAL
      if (statusAtual === 'PAGO' || typeof statusAtual === 'number' && statusAtual > 0) {
        return /*#__PURE__*/React.createElement("div", {
          className: "border-t pt-3"
        }, /*#__PURE__*/React.createElement("button", {
          onClick: function onClick() {
            var tipoPagamento = statusAtual === 'PAGO' ? 'integral' : 'parcial';
            var valorPago = statusAtual === 'PAGO' ? modalPagamento.valor.toFixed(2) : statusAtual.toFixed(2);
            if (confirm("\uD83D\uDD04 DESFAZER PAGAMENTO?\n\n" + "Tipo: ".concat(tipoPagamento.toUpperCase(), "\n") + "Valor pago: R$ ".concat(valorPago, "\n\n") + "Este item voltar\xE1 para PENDENTE.\n\n" + "Confirma?")) {
              var chave = "".concat(modalPagamento.nome, "-").concat(mesAtual, "-").concat(anoAtual);
              setFarol(function (prev) {
                var novoFarol = _objectSpread({}, prev);
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
    }(), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setModalPagamento(null);
      },
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
    onLogout: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21() {
      return _regenerator().w(function (_context21) {
        while (1) switch (_context21.n) {
          case 0:
            ['cartoes', 'gastosFixos', 'gastosVariaveis', 'gastosExtras', 'receitas', 'orcamentos', 'metasMensais', 'metasFinanceiras', 'planejados', 'dividas', 'categorias', 'farol', '_currentUserId'].forEach(function (k) {
              return localStorage.removeItem(k);
            });
            _context21.n = 1;
            return firebase.auth().signOut();
          case 1:
            return _context21.a(2);
        }
      }, _callee21);
    }))
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
    onChange: function onChange(e) {
      return setAnoAtual(parseInt(e.target.value));
    },
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
  }, [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(function (ano) {
    return /*#__PURE__*/React.createElement("option", {
      key: ano,
      value: ano,
      style: {
        background: '#1a1a4e'
      }
    }, ano);
  })))), /*#__PURE__*/React.createElement("div", {
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
  }, MESES.map(function (mes) {
    return /*#__PURE__*/React.createElement("button", {
      key: mes,
      onClick: function onClick() {
        return setMesAtual(mes);
      },
      className: "mes-btn".concat(mesAtual === mes ? ' ativo' : '')
    }, mes.charAt(0).toUpperCase() + mes.slice(1));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 main-content animate-in"
  }, React.useMemo(function () {
    if (telaAtiva !== 'dashboard') return null;
    return /*#__PURE__*/React.createElement(Dashboard, {
      key: "".concat(mesAtual, "-").concat(anoAtual)
    });
  }, [telaAtiva === 'dashboard', mesAtual, anoAtual]), telaAtiva === 'admin' && /*#__PURE__*/React.createElement(TelaAdmin, {
    isUserAdmin: isUserAdmin
  }), telaAtiva.startsWith('planejamento') && /*#__PURE__*/React.createElement(TelaPlanejamento, null), telaAtiva === 'receitas' && /*#__PURE__*/React.createElement(TelaReceitas, null), telaAtiva === 'cartoes' && /*#__PURE__*/React.createElement(TelaCartoes, {
    key: JSON.stringify(farol)
  }), telaAtiva === 'fixos' && /*#__PURE__*/React.createElement(TelaGastosFixos, null), telaAtiva === 'variaveis' && /*#__PURE__*/React.createElement(TelaGastosVariaveis, null), telaAtiva === 'extras' && /*#__PURE__*/React.createElement(TelaGastosExtras, null), telaAtiva === 'farol' && /*#__PURE__*/React.createElement(TelaFarol, null)), modalAberto === 'editar' && itemEditando && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u270F\uFE0F Editar ".concat(tipoEditando === 'receita' ? 'Receita' : tipoEditando === 'cartao' ? 'Cartão' : tipoEditando === 'fixo' ? 'Gasto Fixo' : 'Gasto Variável'),
    onClose: function onClose() {
      setModalAberto(null);
      setItemEditando(null);
      setTipoEditando(null);
    }
  }, /*#__PURE__*/React.createElement(FormEdicao, {
    item: itemEditando,
    tipo: tipoEditando,
    onSalvar: function onSalvar(dadosAtualizados) {
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
    onClose: function onClose() {
      return setModalAberto(null);
    }
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
    onClick: function onClick() {
      try {
        var nome = document.getElementById('dividaNome').value;
        var valorTotal = document.getElementById('dividaValorTotal').value;
        var saldoDevedor = document.getElementById('dividaSaldoDevedor').value;
        var taxaJuros = document.getElementById('dividaTaxaJuros').value;
        var parcelaMinima = document.getElementById('dividaParcelaMinima').value;
        var vencimento = document.getElementById('dividaVencimento').value;
        if (!nome || !valorTotal || !saldoDevedor || !taxaJuros || !parcelaMinima || !vencimento) {
          alert('⚠️ Preencha todos os campos!');
          return;
        }
        adicionarDivida({
          nome: nome,
          valorTotal: valorTotal,
          saldoDevedor: saldoDevedor,
          taxaJuros: taxaJuros,
          parcelaMinima: parcelaMinima,
          vencimento: vencimento
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
    onClose: function onClose() {
      return setModalAberto(null);
    }
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
  }, ['MORADIA', 'ESTUDO', 'TRANSPORTE', 'SERVIÇOS', 'SAÚDE'].map(function (cat) {
    return /*#__PURE__*/React.createElement("span", {
      key: cat,
      className: "px-3 py-1 bg-white border-2 border-purple-300 rounded-lg text-sm font-semibold text-gray-700"
    }, cat);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-purple-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), categoriasPersonalizadas.gastosFixos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosFixos.map(function (cat) {
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      className: "flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-purple-700"
    }, cat), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (confirm("Excluir categoria \"".concat(cat, "\"?"))) {
          setCategoriasPersonalizadas(_objectSpread(_objectSpread({}, categoriasPersonalizadas), {}, {
            gastosFixos: categoriasPersonalizadas.gastosFixos.filter(function (c) {
              return c !== cat;
            })
          }));
        }
      },
      className: "text-red-600 hover:text-red-700 text-xs"
    }, "\u2715"));
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800 mb-3"
  }, "\uD83D\uDCCA Gastos Vari\xE1veis"), /*#__PURE__*/React.createElement("div", {
    className: "bg-orange-50 rounded-lg p-4 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Categorias Padr\xE3o:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['MERCADO', 'FARMÁCIA', 'ALIMENTAÇÃO', 'TRANSPORTE', 'GASOLINA', 'LAZER'].map(function (cat) {
    return /*#__PURE__*/React.createElement("span", {
      key: cat,
      className: "px-3 py-1 bg-white border-2 border-orange-300 rounded-lg text-sm font-semibold text-gray-700"
    }, cat);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-orange-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), categoriasPersonalizadas.gastosVariaveis.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosVariaveis.map(function (cat) {
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      className: "flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-orange-700"
    }, cat), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (confirm("Excluir categoria \"".concat(cat, "\"?"))) {
          setCategoriasPersonalizadas(_objectSpread(_objectSpread({}, categoriasPersonalizadas), {}, {
            gastosVariaveis: categoriasPersonalizadas.gastosVariaveis.filter(function (c) {
              return c !== cat;
            })
          }));
        }
      },
      className: "text-red-600 hover:text-red-700 text-xs"
    }, "\u2715"));
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800 mb-3"
  }, "\u26A1 Gastos Extras"), /*#__PURE__*/React.createElement("div", {
    className: "bg-amber-50 rounded-lg p-4 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Categorias Padr\xE3o:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['VIAGEM', 'PRESENTE', 'EMERGÊNCIA', 'MÉDICO', 'VETERINÁRIO', 'MANUTENÇÃO', 'REFORMA', 'FESTA'].map(function (cat) {
    return /*#__PURE__*/React.createElement("span", {
      key: cat,
      className: "px-3 py-1 bg-white border-2 border-amber-300 rounded-lg text-sm font-semibold text-gray-700"
    }, cat);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border-2 border-amber-200 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold text-gray-700 mb-2"
  }, "Suas Categorias Personalizadas:"), !categoriasPersonalizadas.gastosExtras || categoriasPersonalizadas.gastosExtras.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Nenhuma categoria personalizada ainda") : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, categoriasPersonalizadas.gastosExtras.map(function (cat) {
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      className: "flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-amber-700"
    }, cat), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (confirm("Excluir categoria \"".concat(cat, "\"?"))) {
          setCategoriasPersonalizadas(_objectSpread(_objectSpread({}, categoriasPersonalizadas), {}, {
            gastosExtras: categoriasPersonalizadas.gastosExtras.filter(function (c) {
              return c !== cat;
            })
          }));
        }
      },
      className: "text-red-600 hover:text-red-700 text-xs"
    }, "\u2715"));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-blue-800"
  }, "\uD83D\uDCA1 ", /*#__PURE__*/React.createElement("strong", null, "Dica:"), " Para criar novas categorias, clique em \"\u2795 Novo Gasto\" e escolha \"Criar nova categoria\"")))), modalAberto === 'novaMeta' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83C\uDFAF Nova Meta Financeira",
    onClose: function onClose() {
      return setModalAberto(null);
    }
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
    onChange: function onChange(e) {
      var prazo = e.target.value;
      var meses = prazo === 'curto' ? 12 : prazo === 'medio' ? 60 : 120;
      var hoje = new Date();
      var dataFutura = new Date(hoje.setMonth(hoje.getMonth() + meses));
      var inputData = document.getElementById('metaData');
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
    defaultValue: function () {
      var hoje = new Date();
      var prazoInput = document.getElementById('metaPrazo');
      var prazo = prazoInput ? prazoInput.value : 'curto';
      var meses = prazo === 'curto' ? 12 : prazo === 'medio' ? 60 : 120;
      var dataFutura = new Date(hoje.setMonth(hoje.getMonth() + meses));
      return dataFutura.toISOString().split('T')[0];
    }()
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500 mt-1"
  }, "\u26A0\uFE0F Campo obrigat\xF3rio - ajuste conforme necess\xE1rio"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      try {
        var titulo = document.getElementById('metaTitulo').value;
        var valor = document.getElementById('metaValor').value;
        var prazo = document.getElementById('metaPrazo').value;
        var categoria = document.getElementById('metaCategoria').value;
        var prioridade = document.getElementById('metaPrioridade').value;
        var dataMeta = document.getElementById('metaData').value;
        if (!titulo || !valor) {
          alert('⚠️ Preencha o título e valor!');
          return;
        }
        if (!dataMeta) {
          alert('⚠️ Preencha a Data Meta!\n\nClique no campo de data e escolha quando você quer alcançar essa meta.');
          return;
        }
        var novaMeta = {
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
        setMetasFinanceiras([].concat(_toConsumableArray(metasFinanceiras), [novaMeta]));
        setModalAberto(null);
        alert('✅ Meta criada com sucesso!');
      } catch (error) {
        alert('❌ Erro: ' + error.message);
      }
    },
    className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
  }, "\u2705 Criar Meta"))), modalAberto === 'novoCartao' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Cart\xE3o",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormNovoCartao, null)), modalAberto === 'novoGastoFixo' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Gasto Fixo",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormNovoGastoFixo, null)), modalAberto === 'novoGastoVariavel' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Gasto Vari\xE1vel",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormNovoGastoVariavel, null)), modalAberto === 'novoGastoExtra' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Novo Gasto Extra",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormNovoGastoExtra, null)), modalAberto === 'metas' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83C\uDFAF Definir Metas",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormMetas, null)), modalAberto === 'orcamento' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2699\uFE0F Definir Or\xE7amento",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormOrcamento, null)), modalAberto === 'novoPlanejado' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Adicionar Planejado",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormPlanejado, null)), modalAberto === 'novaReceita' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\u2795 Nova Receita",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormNovaReceita, null)), modalAberto === 'compraParcelada' && /*#__PURE__*/React.createElement(Modal, {
    titulo: "\uD83D\uDED2 Nova Compra Parcelada",
    onClose: function onClose() {
      return setModalAberto(null);
    }
  }, /*#__PURE__*/React.createElement(FormCompraParcelada, null))), inputDialog && /*#__PURE__*/React.createElement(InputDialog, {
    titulo: inputDialog.titulo,
    label: inputDialog.label,
    valorPadrao: String((_inputDialog$valorPad = inputDialog.valorPadrao) !== null && _inputDialog$valorPad !== void 0 ? _inputDialog$valorPad : ''),
    onConfirm: function onConfirm(v) {
      setInputDialog(null);
      inputDialog.callback(v);
    },
    onCancel: function onCancel() {
      return setInputDialog(null);
    }
  }));
}
var rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(/*#__PURE__*/React.createElement(AuthWrapper, null));
