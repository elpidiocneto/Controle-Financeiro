# 📄 EXPORTAÇÃO DE RELATÓRIOS EM PDF

## 📋 VISÃO GERAL

Sistema completo para exportar relatórios financeiros em PDF diretamente do navegador, sem backend necessário.

---

## 🎯 FUNCIONALIDADES

### 1. **Relatório Mensal Completo**
- Resumo de receitas e despesas
- Gráfico de composição
- Lista detalhada de lançamentos
- Análise de gastos por categoria

### 2. **Extrato por Categoria**
- Detalhamento de uma categoria específica
- Todos os lançamentos do período
- Subtotais e percentuais

### 3. **Análise Comparativa**
- Comparação entre 2 ou mais meses
- Gráficos de evolução
- Identificação de tendências

---

## 🛠️ IMPLEMENTAÇÃO

### Biblioteca: jsPDF + html2canvas

```bash
# Adicionar no index.html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### Código do Gerador de PDF

```javascript
// Adicionar em js/exportacao-pdf.js

window.ExportadorPDF = {
  
  // Função principal - Exportar Relatório Mensal
  exportarRelatorioMensal: async function(dados, mesAtual, anoAtual, userName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;
    
    // ─── CABEÇALHO ───
    doc.setFillColor(15, 23, 42); // Azul escuro
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo (se tiver)
    if (window.LOGO_B64) {
      try {
        doc.addImage(window.LOGO_B64, 'PNG', margin, 8, 50, 20);
      } catch (e) {
        console.log('Logo não adicionado');
      }
    }
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Relatório Financeiro', pageWidth - margin, 20, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const mesesNome = {
      jan:'Janeiro', fev:'Fevereiro', mar:'Março', abr:'Abril',
      mai:'Maio', jun:'Junho', jul:'Julho', ago:'Agosto',
      set:'Setembro', out:'Outubro', nov:'Novembro', dez:'Dezembro'
    };
    doc.text(`${mesesNome[mesAtual]} ${anoAtual}`, pageWidth - margin, 30, { align: 'right' });
    
    yPos = 50;
    
    // ─── RESUMO GERAL ───
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('💰 Resumo do Mês', margin, yPos);
    yPos += 10;
    
    // Box de resumo
    const resumoHeight = 40;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, pageWidth - 2*margin, resumoHeight, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    // Receitas
    doc.setTextColor(16, 185, 129); // Verde
    doc.text('Receitas:', margin + 10, yPos + 12);
    doc.setFont(undefined, 'bold');
    doc.text(`R$ ${dados.receitas.toFixed(2)}`, margin + 50, yPos + 12);
    
    // Despesas
    doc.setFont(undefined, 'normal');
    doc.setTextColor(239, 68, 68); // Vermelho
    doc.text('Despesas:', margin + 10, yPos + 24);
    doc.setFont(undefined, 'bold');
    doc.text(`R$ ${dados.despesas.toFixed(2)}`, margin + 50, yPos + 24);
    
    // Saldo
    const saldo = dados.receitas - dados.despesas;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Saldo:', margin + 10, yPos + 36);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(saldo >= 0 ? 16 : 239, saldo >= 0 ? 185 : 68, saldo >= 0 ? 129 : 68);
    doc.text(`R$ ${Math.abs(saldo).toFixed(2)}`, margin + 50, yPos + 36);
    
    yPos += resumoHeight + 15;
    
    // ─── COMPOSIÇÃO DE DESPESAS ───
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('📊 Composição das Despesas', margin, yPos);
    yPos += 8;
    
    const categorias = [
      { nome: 'Cartões', valor: dados.cartoes, cor: [99, 102, 241] },
      { nome: 'Fixos', valor: dados.fixos, cor: [139, 92, 246] },
      { nome: 'Variáveis', valor: dados.variaveis, cor: [16, 185, 129] },
      { nome: 'Extras', valor: dados.extras, cor: [245, 158, 11] }
    ].filter(c => c.valor > 0);
    
    categorias.forEach(cat => {
      const percentual = dados.despesas > 0 ? (cat.valor / dados.despesas * 100).toFixed(1) : 0;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(cat.nome, margin + 10, yPos);
      
      // Barra de progresso
      const barWidth = 100;
      const barHeight = 6;
      const fillWidth = barWidth * (cat.valor / dados.despesas);
      
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(margin + 60, yPos - 4, barWidth, barHeight, 2, 2, 'F');
      
      doc.setFillColor(...cat.cor);
      doc.roundedRect(margin + 60, yPos - 4, fillWidth, barHeight, 2, 2, 'F');
      
      // Valor e percentual
      doc.setFont(undefined, 'bold');
      doc.text(`R$ ${cat.valor.toFixed(2)} (${percentual}%)`, margin + 165, yPos);
      
      yPos += 12;
    });
    
    yPos += 10;
    
    // ─── DETALHAMENTO (nova página se necessário) ───
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('📋 Detalhamento', margin, yPos);
    yPos += 8;
    
    // Tabela de cartões
    if (dados.listaCartoes && dados.listaCartoes.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('💳 Cartões de Crédito', margin + 5, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      dados.listaCartoes.forEach(cartao => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${cartao.nome}`, margin + 10, yPos);
        doc.setFont(undefined, 'bold');
        doc.text(`R$ ${cartao.valor.toFixed(2)}`, pageWidth - margin - 30, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 6;
      });
      
      yPos += 5;
    }
    
    // Tabela de gastos fixos
    if (dados.listaFixos && dados.listaFixos.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('🏠 Gastos Fixos', margin + 5, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      dados.listaFixos.forEach(gasto => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${gasto.descricao}`, margin + 10, yPos);
        doc.setFont(undefined, 'bold');
        doc.text(`R$ ${gasto.valor.toFixed(2)}`, pageWidth - margin - 30, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 6;
      });
      
      yPos += 5;
    }
    
    // ─── RODAPÉ ───
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | Estratégia Finanças`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    // ─── SALVAR ───
    const filename = `relatorio-${mesAtual}-${anoAtual}.pdf`;
    doc.save(filename);
    
    return filename;
  },
  
  // Preparar dados do sistema para exportação
  prepararDados: function(mesAtual, anoAtual) {
    // Buscar dados do localStorage
    const cartoes = JSON.parse(localStorage.getItem('cartoes') || '[]');
    const gastosFixos = JSON.parse(localStorage.getItem('gastosFixos') || '[]');
    const gastosVariaveis = JSON.parse(localStorage.getItem('gastosVariaveis') || '[]');
    const gastosExtras = JSON.parse(localStorage.getItem('gastosExtras') || '[]');
    const receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
    
    // Calcular totais
    const totalCartoes = cartoes.reduce((sum, c) => {
      const val = c.valores?.[anoAtual]?.[mesAtual] || 0;
      return sum + val;
    }, 0);
    
    const totalFixos = gastosFixos
      .filter(g => !g.mes || (g.mes === mesAtual && g.ano === anoAtual))
      .reduce((sum, g) => sum + g.valor, 0);
    
    const totalVariaveis = gastosVariaveis
      .filter(g => g.mes === mesAtual && g.ano === anoAtual)
      .reduce((sum, g) => sum + g.valor, 0);
    
    const totalExtras = gastosExtras
      .filter(g => g.mes === mesAtual && g.ano === anoAtual)
      .reduce((sum, g) => sum + g.valor, 0);
    
    const totalReceitas = receitas
      .filter(r => r.mes === mesAtual && r.ano === anoAtual)
      .reduce((sum, r) => sum + r.valor, 0);
    
    // Listas detalhadas
    const listaCartoes = cartoes
      .map(c => ({
        nome: c.nome,
        valor: c.valores?.[anoAtual]?.[mesAtual] || 0
      }))
      .filter(c => c.valor > 0)
      .sort((a, b) => b.valor - a.valor);
    
    const listaFixos = gastosFixos
      .filter(g => !g.mes || (g.mes === mesAtual && g.ano === anoAtual))
      .map(g => ({
        descricao: g.descricao,
        valor: g.valor,
        categoria: g.categoria
      }))
      .sort((a, b) => b.valor - a.valor);
    
    const listaVariaveis = gastosVariaveis
      .filter(g => g.mes === mesAtual && g.ano === anoAtual)
      .map(g => ({
        descricao: g.descricao,
        valor: g.valor,
        categoria: g.categoria,
        data: g.data
      }))
      .sort((a, b) => b.valor - a.valor);
    
    return {
      receitas: totalReceitas,
      despesas: totalCartoes + totalFixos + totalVariaveis + totalExtras,
      cartoes: totalCartoes,
      fixos: totalFixos,
      variaveis: totalVariaveis,
      extras: totalExtras,
      listaCartoes,
      listaFixos,
      listaVariaveis
    };
  }
};
```

---

## 🎨 BOTÃO DE EXPORTAÇÃO NO DASHBOARD

Adicionar botão no Dashboard (Visão Geral):

```javascript
// No dashboard.js, adicionar botão no topo

const btnExportar = h('button', {
  onClick: async () => {
    const dados = window.ExportadorPDF.prepararDados(mesAtual, anoAtual);
    const filename = await window.ExportadorPDF.exportarRelatorioMensal(
      dados, 
      mesAtual, 
      anoAtual,
      user?.displayName || 'Usuário'
    );
    alert(`✅ Relatório exportado: ${filename}`);
  },
  style: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
    transition: 'all 0.2s'
  },
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)';
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
  }
}, 
  h('span', {style: {fontSize: '1.2rem'}}, '📄'),
  'Exportar PDF'
);
```

---

## 📱 INTEGRAÇÃO NO SISTEMA

### 1. Adicionar scripts no `index.html`:

```html
<!-- Antes do fechamento do </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="js/exportacao-pdf.js"></script>
```

### 2. Adicionar botão em múltiplos lugares:

- ✅ Dashboard (Visão Geral)
- ✅ Todas as telas de Despesas
- ✅ Tela de Receitas
- ✅ Gestão de Pagamentos

---

## 🎯 RESULTADO

Quando o usuário clicar em "📄 Exportar PDF":

1. Sistema coleta todos os dados do mês
2. Gera PDF formatado com:
   - ✅ Cabeçalho com logo
   - ✅ Resumo financeiro
   - ✅ Gráficos de composição
   - ✅ Listas detalhadas
   - ✅ Rodapé com data/hora
3. Download automático do arquivo
4. Nome: `relatorio-fev-2026.pdf`

---

## 🚀 PRÓXIMAS MELHORIAS

- [ ] Exportar gráficos visuais (html2canvas)
- [ ] Escolher período personalizado
- [ ] Relatório comparativo (2+ meses)
- [ ] Exportar em Excel (.xlsx)
- [ ] Email automático do relatório

