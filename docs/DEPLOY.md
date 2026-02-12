# 🚀 Guia de Deploy

## Opção 1: Vercel (Recomendado)

### Por que Vercel?
- ✅ 100% GRATUITO
- ✅ Deploy em segundos
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Deploy automático a cada push no GitHub

### Passo a passo:

1. **Crie uma conta na Vercel**
   - Acesse: https://vercel.com
   - Faça login com sua conta GitHub

2. **Importe seu projeto**
   - Clique em "Add New Project"
   - Selecione seu repositório do GitHub
   - Clique em "Import"

3. **Configure (deixe tudo padrão)**
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (deixe em branco)
   - Output Directory: (deixe em branco)

4. **Configure variáveis de ambiente**
   - Vá em Settings > Environment Variables
   - Adicione suas chaves do Firebase:
     ```
     FIREBASE_API_KEY = sua_chave
     FIREBASE_AUTH_DOMAIN = seu_dominio
     FIREBASE_PROJECT_ID = seu_projeto
     FIREBASE_STORAGE_BUCKET = seu_bucket
     FIREBASE_MESSAGING_SENDER_ID = seu_sender
     FIREBASE_APP_ID = seu_app_id
     ```

5. **Deploy!**
   - Clique em "Deploy"
   - Aguarde ~30 segundos
   - Pronto! Seu site está no ar!

6. **URL personalizada (opcional)**
   - Vá em Settings > Domains
   - Adicione seu domínio próprio

---

## Opção 2: Netlify

### Passo a passo:

1. **Crie uma conta na Netlify**
   - Acesse: https://netlify.com
   - Faça login com sua conta GitHub

2. **Importe seu projeto**
   - Clique em "Add new site"
   - Selecione "Import from Git"
   - Escolha seu repositório

3. **Configure**
   - Build command: (deixe em branco)
   - Publish directory: ./

4. **Variáveis de ambiente**
   - Vá em Site settings > Environment variables
   - Adicione suas chaves do Firebase

5. **Deploy!**
   - O site vai pro ar automaticamente

---

## Opção 3: GitHub Pages (Simples)

### Passo a passo:

1. **No seu repositório GitHub**
   - Vá em Settings > Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

2. **Aguarde alguns minutos**
   - Acesse: https://seu-usuario.github.io/nome-do-repo

⚠️ **ATENÇÃO**: No GitHub Pages você não pode usar variáveis de ambiente server-side. Suas chaves do Firebase ficarão expostas no código. Use apenas para testes.

---

## 🔒 Segurança - IMPORTANTE!

### NO VERCEL/NETLIFY:
✅ Use variáveis de ambiente (ficam ocultas)

### NO GITHUB PAGES:
⚠️ Chaves ficam expostas no código
✅ Configure regras de segurança no Firebase para limitar acesso

---

## 📊 Monitoramento

Após o deploy, você pode:
- Ver estatísticas de acesso
- Configurar domínio personalizado
- Adicionar analytics
- Configurar SSL/HTTPS

---

## 🆘 Problemas Comuns

### "Page not found" no deploy
- Verifique se index.html está na raiz do projeto

### "Firebase not initialized"
- Verifique se configurou as variáveis de ambiente
- Confira se os nomes estão corretos

### CSS/JS não carrega
- Verifique os caminhos relativos no index.html
- Use `./css/main.css` (não `/css/main.css`)

---

## 💡 Dicas

1. **Sempre teste localmente antes de fazer deploy**
2. **Faça commits descritivos**
3. **Use branches para novas features**
4. **Ative deploy preview no Vercel/Netlify**

---

## 📞 Suporte

Problemas? Entre em contato!
