// =========================================
// CONFIGURAÇÃO DO FIREBASE
// =========================================

// IMPORTANTE: Em produção (Vercel/Netlify), configure as variáveis de ambiente
// no painel de controle da plataforma

const firebaseConfig = {
    apiKey: "AIzaSyDf9jwohYm8jMBHYxh44ZhX1jQdc_nk2YQ",
    authDomain: "elpidiofinancas.firebaseapp.com",
    projectId: "elpidiofinancas",
    storageBucket: "elpidiofinancas.firebasestorage.app",
    messagingSenderId: "447370107548",
    appId: "1:447370107548:web:a17e42519fe07f0c23eb59"
};

// Inicializar Firebase
let db = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("✅ Firebase inicializado - Backup na nuvem ATIVO!");
} catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
    alert("⚠️ Erro ao conectar com Firebase. Verifique sua conexão com a internet.");
}

// Exportar para uso global (window.db será acessível em app.js)
window.db = db;
