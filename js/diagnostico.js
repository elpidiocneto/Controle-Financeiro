// Diagnóstico Financeiro - mesmo padrão visual do Dashboard
window.DiagnosticoComponent = function Diagnostico() {
  const h = React.createElement;

  const ctx           = window.__diagCtx || {};
  const scoreSaude    = ctx.scoreSaude    || { score:0, criterios:[], reservaIdeal:0, reservaAtual:0, percentualReserva:0, percentualPoupanca:0 };
  const scoreInfo     = ctx.scoreInfo     || { text:'—', emoji:'❓' };
  const saldo         = ctx.saldo         || { receitas:0, despesas:0, saldo:0, positivo:true };
  const totais        = ctx.totais        || { total:0 };
  const orcamento     = ctx.orcamento     || { cartoes:0, fixos:0, variaveis:0 };
  const dentroOrc     = ctx.dentroOrcamento !== false;
  const reservaAtual  = ctx.reservaEmergencia || 0;
  const setReserva    = ctx.setReservaEmergencia || (() => {});
  const mesAtual      = ctx.mesAtual || 'jan';
  const anoAtual      = ctx.anoAtual || new Date().getFullYear();

  const MESES = { jan:'Janeiro', fev:'Fevereiro', mar:'Março', abr:'Abril', mai:'Maio', jun:'Junho', jul:'Julho', ago:'Agosto', set:'Setembro', out:'Outubro', nov:'Novembro', dez:'Dezembro' };
  const mesNome = MESES[mesAtual] || mesAtual;

  const fmt  = v => 'R$ ' + (v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmt0 = v => 'R$ ' + (v||0).toLocaleString('pt-BR', { minimumFractionDigits:0, maximumFractionDigits:0 });

  // Cores do score
  const scoreCor = scoreSaude.score >= 80 ? '#10b981' : scoreSaude.score >= 60 ? '#6366f1' : scoreSaude.score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreBg  = scoreSaude.score >= 80
    ? 'linear-gradient(135deg,#064e3b,#065f46)'
    : scoreSaude.score >= 60
    ? 'linear-gradient(135deg,#1e1b4b,#312e81)'
    : scoreSaude.score >= 40
    ? 'linear-gradient(135deg,#78350f,#92400e)'
    : 'linear-gradient(135deg,#7f1d1d,#991b1b)';
  const scoreBorder = scoreSaude.score >= 80 ? 'rgba(16,185,129,0.3)' : scoreSaude.score >= 60 ? 'rgba(99,102,241,0.3)' : scoreSaude.score >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)';

  // Métricas
  const rendaCompPct   = saldo.receitas > 0 ? Math.min(100, totais.total / saldo.receitas * 100) : 0;
  const rendaCorFundo  = rendaCompPct <= 70 ? '#10b981' : rendaCompPct <= 90 ? '#f59e0b' : '#ef4444';
  const poupancaPct    = scoreSaude.percentualPoupanca || 0;
  const poupancaCor    = poupancaPct >= 20 ? '#10b981' : poupancaPct >= 10 ? '#f59e0b' : '#ef4444';
  const reservaPct     = Math.min(100, scoreSaude.percentualReserva || 0);
  const reservaCor     = reservaPct >= 100 ? '#10b981' : reservaPct >= 50 ? '#6366f1' : reservaPct >= 16 ? '#f59e0b' : '#ef4444';
  const orcadoTotal    = (orcamento.cartoes||0) + (orcamento.fixos||0) + (orcamento.variaveis||0);
  const diferenca      = orcadoTotal - totais.total;

  // ─── Estilos base (mesmo padrão do Dashboard) ───────────
  const card     = (ex={}) => ({ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', ...ex });
  const darkCard = (bg,bd)  => ({ background:bg, borderRadius:'16px', padding:'20px', border:`1px solid ${bd}`, boxShadow:'0 4px 20px rgba(0,0,0,0.25)' });
  const lbl      = { fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'#6b7280', marginBottom:'4px' };
  const lblW     = { ...lbl, color:'rgba(255,255,255,0.5)' };
  const sub      = { fontSize:'0.7rem', color:'#9ca3af', marginTop:'4px' };
  const secH     = (t, badge) => h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' } },
    h('h3', { style:{ fontSize:'0.82rem', fontWeight:'800', color:'#111827' } }, t),
    badge && h('span', { style:{ fontSize:'0.68rem', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', background:'#ede9fe', color:'#5b21b6' } }, badge)
  );
  const bar = (pct, cor, ht=6) => h('div', { style:{ height:`${ht}px`, background:'#f3f4f6', borderRadius:`${ht/2}px`, overflow:'hidden' } },
    h('div', { style:{ height:'100%', width:Math.min(100,pct)+'%', background:cor, borderRadius:`${ht/2}px`, transition:'width 0.6s ease' } })
  );

  // Gauge SVG (medidor semicircular para o score)
  const gauge = () => {
    const score = scoreSaude.score;
    const r = 52, cx = 70, cy = 70;
    const startAngle = Math.PI;
    const endAngle   = 0;
    const angle      = startAngle + (score/100) * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = score > 50 ? 1 : 0;
    return h('svg', { width:140, height:80, viewBox:'0 0 140 80', style:{flexShrink:0} },
      // Track
      h('path', { d:`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`, fill:'none', stroke:'#f3f4f6', strokeWidth:12, strokeLinecap:'round' }),
      // Fill
      score > 0 && h('path', { d:`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, fill:'none', stroke:scoreCor, strokeWidth:12, strokeLinecap:'round' }),
      // Score
      h('text', { x:cx, y:cy-8, textAnchor:'middle', fontSize:'20', fontWeight:'900', fill:scoreCor }, score),
      h('text', { x:cx, y:cy+4, textAnchor:'middle', fontSize:'9', fontWeight:'700', fill:'#6b7280' }, 'de 100'),
      // Labels
      h('text', { x:cx-r, y:cy+14, textAnchor:'middle', fontSize:'8', fill:'#9ca3af' }, '0'),
      h('text', { x:cx+r, y:cy+14, textAnchor:'middle', fontSize:'8', fill:'#9ca3af' }, '100'),
    );
  };

  // ─── COLUNA ESQUERDA ────────────────────────────────────
  // Card Score (dark)
  const cardScore = h('div', { style: darkCard(scoreBg, scoreBorder) },
    h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' } },
      h('div', null,
        h('div', { style:lblW }, `Saúde Financeira · ${mesNome} ${anoAtual}`),
        h('div', { style:{ fontSize:'1.2rem', fontWeight:'900', color:'#fff', marginTop:'4px' } },
          scoreInfo.emoji + ' ' + scoreInfo.text
        )
      ),
      gauge()
    ),
    h('div', { style:{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'14px' } },
      h('div', { style:{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginBottom:'10px', fontWeight:'600' } }, 'Critérios avaliados:'),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:'6px' } },
        ...scoreSaude.criterios.map((c,i) => h('div', { key:i, style:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
          h('span', { style:{ fontSize:'0.75rem', color:'rgba(255,255,255,0.75)' } }, c.nome),
          h('span', { style:{ fontSize:'0.72rem', fontWeight:'800', color: c.pontos > 0 ? '#6ee7b7' : 'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.08)', padding:'1px 7px', borderRadius:'8px' } },
            c.pontos + ' pts'
          )
        ))
      )
    )
  );

  // Card: Situação Atual
  const cardSituacao = h('div', { style: card() },
    secH('💰 Situação do Mês'),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:'10px' } },
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#f0fdf4', borderRadius:'10px', border:'1px solid #bbf7d0' } },
        h('span', { style:{ fontSize:'0.78rem', color:'#374151', fontWeight:'600' } }, '💰 Receitas'),
        h('span', { style:{ fontSize:'0.9rem', fontWeight:'900', color:'#10b981' } }, fmt(saldo.receitas))
      ),
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#fef2f2', borderRadius:'10px', border:'1px solid #fecaca' } },
        h('span', { style:{ fontSize:'0.78rem', color:'#374151', fontWeight:'600' } }, '💸 Despesas'),
        h('span', { style:{ fontSize:'0.9rem', fontWeight:'900', color:'#ef4444' } }, fmt(totais.total))
      ),
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background: saldo.positivo ? '#f0fdf4' : '#fef2f2', borderRadius:'10px', border:`1px solid ${saldo.positivo?'#bbf7d0':'#fecaca'}` } },
        h('div', null,
          h('div', { style:{ fontSize:'0.65rem', fontWeight:'800', color:'#6b7280', letterSpacing:'0.8px' } }, 'SALDO'),
          h('div', { style:{ fontSize:'0.78rem', color:'#6b7280' } }, saldo.positivo ? 'Superávit ✅' : 'Déficit ⚠️')
        ),
        h('span', { style:{ fontSize:'1.1rem', fontWeight:'900', color: saldo.positivo ? '#10b981' : '#ef4444' } },
          (saldo.positivo?'+':'') + fmt(saldo.saldo)
        )
      )
    )
  );

  const colEsq = h('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' } },
    cardScore, cardSituacao
  );

  // ─── COLUNA CENTRAL ─────────────────────────────────────
  // Card: Renda Comprometida
  const cardRendaComp = h('div', { style: card({ marginBottom:'14px' }) },
    secH('📊 Renda Comprometida', rendaCompPct.toFixed(0)+'%'),
    h('div', { style:{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'14px' } },
      // Círculo grande
      h('div', { style:{ position:'relative', width:'80px', height:'80px', flexShrink:0 } },
        h('svg', { width:80, height:80, viewBox:'0 0 80 80' },
          h('circle', { cx:40, cy:40, r:32, fill:'none', stroke:'#f3f4f6', strokeWidth:10 }),
          h('circle', { cx:40, cy:40, r:32, fill:'none', stroke:rendaCorFundo, strokeWidth:10,
            strokeDasharray:`${rendaCompPct/100*201} 201`,
            strokeDashoffset:50.25, strokeLinecap:'round' }),
          h('text', { x:40, y:43, textAnchor:'middle', fontSize:'14', fontWeight:'900', fill:rendaCorFundo },
            rendaCompPct.toFixed(0)+'%'
          )
        )
      ),
      h('div', { style:{ flex:1 } },
        h('div', { style:{ fontSize:'0.78rem', color:'#374151', marginBottom:'4px' } },
          fmt(totais.total), ' de ', fmt(saldo.receitas)
        ),
        h('div', { style:{ fontSize:'0.72rem', color: rendaCorFundo, fontWeight:'700', marginBottom:'8px' } },
          rendaCompPct <= 70 ? '✅ Situação saudável' : rendaCompPct <= 90 ? '⚠️ Atenção necessária' : '🚨 Situação crítica'
        ),
        h('div', { style:{ fontSize:'0.68rem', color:'#9ca3af' } },
          'Ideal: abaixo de 70%'
        )
      )
    ),
    h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', fontSize:'0.72rem' } },
      ...[
        { label:'≤ 70%', txt:'Saudável', cor:'#10b981', atual: rendaCompPct <= 70 },
        { label:'70-90%', txt:'Atenção',  cor:'#f59e0b', atual: rendaCompPct > 70 && rendaCompPct <= 90 },
        { label:'> 90%',  txt:'Crítico',  cor:'#ef4444', atual: rendaCompPct > 90 },
      ].map((z,i) => h('div', { key:i, style:{ textAlign:'center', padding:'6px 8px', borderRadius:'8px', background: z.atual ? z.cor+'15' : '#f9fafb', border:`1px solid ${z.atual ? z.cor+'40' : '#e5e7eb'}` } },
        h('div', { style:{ fontWeight:'800', color: z.atual ? z.cor : '#9ca3af' } }, z.label),
        h('div', { style:{ color: z.atual ? z.cor : '#9ca3af', marginTop:'1px' } }, z.txt)
      ))
    )
  );

  // Card: Capacidade de Poupança
  const cardPoupanca = h('div', { style: card({ marginBottom:'14px' }) },
    secH('💵 Capacidade de Poupança'),
    h('div', { style:{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' } },
      h('div', { style:{ fontSize:'2.2rem', fontWeight:'900', color:poupancaCor, lineHeight:1 } }, poupancaPct.toFixed(0)+'%'),
      h('div', null,
        h('div', { style:{ fontSize:'0.82rem', fontWeight:'700', color:'#111827' } },
          saldo.positivo ? fmt(saldo.saldo) + ' / mês' : 'Sem sobra'
        ),
        h('div', { style:{ fontSize:'0.72rem', color:poupancaCor, fontWeight:'600', marginTop:'2px' } },
          poupancaPct >= 20 ? '✅ Excelente — meta 20%+' : poupancaPct >= 10 ? '⚠️ Regular — meta 20%' : '🚨 Insuficiente — meta 10%'
        )
      )
    ),
    bar(poupancaPct, poupancaCor, 8)
  );

  // Card: vs Orçamento
  const cardOrcamento = h('div', { style: card() },
    secH('📋 vs Orçamento', dentroOrc ? 'No limite ✅' : 'Estourado ⚠️'),
    orcadoTotal > 0
      ? h('div', null,
          h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'8px' } },
            h('span', { style:{ fontSize:'0.76rem', color:'#6b7280' } }, 'Orçado: '+fmt0(orcadoTotal)),
            h('span', { style:{ fontSize:'0.76rem', fontWeight:'800', color: dentroOrc ? '#10b981' : '#ef4444' } },
              'Gasto: '+fmt0(totais.total)
            )
          ),
          bar(Math.min(100, totais.total/orcadoTotal*100), dentroOrc ? '#10b981' : '#ef4444', 8),
          h('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:'8px' } },
            h('span', { style:sub }, (totais.total/orcadoTotal*100).toFixed(0)+'% utilizado'),
            h('span', { style:{ ...sub, fontWeight:'700', color: dentroOrc ? '#10b981' : '#ef4444' } },
              (dentroOrc ? 'Sobram ' : 'Excedem ') + fmt0(Math.abs(diferenca))
            )
          )
        )
      : h('div', { style:{ textAlign:'center', padding:'16px 0', color:'#d1d5db' } },
          h('div', { style:{ fontSize:'1.8rem', marginBottom:'6px' } }, '📋'),
          h('div', { style:{ fontSize:'0.82rem' } }, 'Orçamento não definido')
        )
  );

  const colCentro = h('div', { style:{ display:'flex', flexDirection:'column', gap:'0' } },
    cardRendaComp, cardPoupanca, cardOrcamento
  );

  // ─── COLUNA DIREITA ──────────────────────────────────────
  // Card: Reserva de Emergência
  const reservaIdeal = scoreSaude.reservaIdeal || 0;
  const cardReserva = h('div', { style: card({ marginBottom:'14px' }) },
    secH('🆘 Reserva de Emergência'),

    // Gauge da reserva
    h('div', { style:{ textAlign:'center', marginBottom:'16px' } },
      h('svg', { width:160, height:90, viewBox:'0 0 160 90' },
        h('path', { d:'M 24 80 A 56 56 0 0 1 136 80', fill:'none', stroke:'#f3f4f6', strokeWidth:14, strokeLinecap:'round' }),
        reservaPct > 0 && h('path', {
          d:(() => {
            const angle = Math.PI * (1 - reservaPct/100);
            const x = 80 + 56*Math.cos(angle+Math.PI);
            const y = 80 + 56*Math.sin(angle+Math.PI);
            const large = reservaPct > 50 ? 1 : 0;
            return `M 24 80 A 56 56 0 ${large} 1 ${x} ${y}`;
          })(),
          fill:'none', stroke:reservaCor, strokeWidth:14, strokeLinecap:'round'
        }),
        h('text', { x:80, y:68, textAnchor:'middle', fontSize:'20', fontWeight:'900', fill:reservaCor }, reservaPct.toFixed(0)+'%'),
        h('text', { x:80, y:82, textAnchor:'middle', fontSize:'9', fill:'#9ca3af' }, 'da meta ideal')
      )
    ),

    h('div', { style:{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' } },
      h('div', { style:{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#f9fafb', borderRadius:'8px' } },
        h('span', { style:{ fontSize:'0.75rem', color:'#6b7280' } }, '🎯 Meta (6 meses)'),
        h('span', { style:{ fontSize:'0.78rem', fontWeight:'800', color:'#6366f1' } }, fmt0(reservaIdeal))
      ),
      h('div', { style:{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#f9fafb', borderRadius:'8px' } },
        h('span', { style:{ fontSize:'0.75rem', color:'#6b7280' } }, '💰 Reserva atual'),
        h('span', { style:{ fontSize:'0.78rem', fontWeight:'800', color:reservaCor } }, fmt(reservaAtual))
      ),
      reservaIdeal > reservaAtual && h('div', { style:{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#fef3c7', borderRadius:'8px', border:'1px solid #fde68a' } },
        h('span', { style:{ fontSize:'0.75rem', color:'#92400e' } }, '⚠️ Falta acumular'),
        h('span', { style:{ fontSize:'0.78rem', fontWeight:'800', color:'#b45309' } }, fmt0(Math.max(0, reservaIdeal - reservaAtual)))
      )
    ),

    h('button', {
      onClick: () => {
        const v = prompt('Quanto você tem de reserva de emergência (R$)?', reservaAtual);
        if (v !== null) setReserva(parseFloat(v) || 0);
      },
      style:{ width:'100%', padding:'10px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontSize:'0.8rem', fontWeight:'700', cursor:'pointer' }
    }, '✏️ Atualizar Reserva')
  );

  // Card: Resumo da Saúde (pontuação detalhada)
  const cardPontuacao = h('div', { style: darkCard('linear-gradient(135deg,#1e1b4b,#312e81)', 'rgba(99,102,241,0.3)') },
    h('div', { style:{ ...lblW, marginBottom:'14px' } }, 'Pontuação Detalhada'),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:'10px' } },
      ...[
        { label:'Saldo Positivo',   max:30, pts: scoreSaude.criterios.find(c=>c.nome.includes('Saldo'))?.pontos || 0 },
        { label:'Dentro Orçamento', max:25, pts: scoreSaude.criterios.find(c=>c.nome.includes('Orçamento'))?.pontos || 0 },
        { label:'Reserva Emergência',max:30, pts: scoreSaude.criterios.find(c=>c.nome.includes('Reserva'))?.pontos || 0 },
        { label:'Capacidade Poupar', max:15, pts: scoreSaude.criterios.find(c=>c.nome.includes('Economiza'))?.pontos || 0 },
      ].map((item,i) => h('div', { key:i },
        h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'4px' } },
          h('span', { style:{ fontSize:'0.74rem', color:'rgba(255,255,255,0.65)' } }, item.label),
          h('span', { style:{ fontSize:'0.74rem', fontWeight:'800', color: item.pts >= item.max ? '#6ee7b7' : item.pts > 0 ? '#fde68a' : 'rgba(255,255,255,0.3)' } },
            item.pts + '/' + item.max
          )
        ),
        h('div', { style:{ height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden' } },
          h('div', { style:{ height:'100%', width:(item.pts/item.max*100)+'%', background: item.pts >= item.max ? '#10b981' : item.pts > 0 ? '#f59e0b' : '#374151', borderRadius:'2px', transition:'width 0.6s ease' } })
        )
      ))
    ),
    h('div', { style:{ borderTop:'1px solid rgba(255,255,255,0.15)', marginTop:'12px', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' } },
      h('span', { style:{ fontSize:'0.8rem', fontWeight:'700', color:'rgba(255,255,255,0.6)' } }, 'TOTAL'),
      h('span', { style:{ fontSize:'1.4rem', fontWeight:'900', color: scoreCor } }, scoreSaude.score + ' pts')
    )
  );

  const colDir = h('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' } },
    cardReserva, cardPontuacao
  );

  // ─── LAYOUT 3 COLUNAS ────────────────────────────────────
  return h('div', {
    style:{ display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr', gap:'16px', alignItems:'start' }
  }, colEsq, colCentro, colDir);
};
