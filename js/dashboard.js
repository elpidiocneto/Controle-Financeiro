// Dashboard - Estratégia Finanças - Layout 3 colunas
window.DashboardComponent = function Dashboard() {
  const h = React.createElement;

  const ctx = window.__dashCtx || {};
  const totais      = ctx.totais      || { cartoes:0, fixos:0, variaveis:0, extras:0, total:0 };
  const saldo       = ctx.saldo       || { receitas:0, despesas:0, saldo:0, positivo:true };
  const cartoes     = ctx.cartoes     || [];
  const gastosFixos = ctx.gastosFixos || [];
  const mesAtual    = ctx.mesAtual    || 'jan';
  const anoAtual    = ctx.anoAtual    || new Date().getFullYear();
  const metaMensal  = ctx.metaMensal  || 0;
  const pagamentos  = ctx.pagamentos  || { percentual:0, qtdPago:0, qtdTotal:0, pago:0, pendente:0, total:0 };
  const getStatusFarol = ctx.getStatusFarol || (() => 'PENDENTE');
  const calcularParcelasCartao = ctx.calcularParcelasCartao || (() => []);

  const MESES = { jan:'Janeiro', fev:'Fevereiro', mar:'Março', abr:'Abril', mai:'Maio', jun:'Junho', jul:'Julho', ago:'Agosto', set:'Setembro', out:'Outubro', nov:'Novembro', dez:'Dezembro' };
  const mesNome = MESES[mesAtual] || mesAtual;

  const fmt  = v => 'R$ ' + (v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmt0 = v => 'R$ ' + (v||0).toLocaleString('pt-BR', { minimumFractionDigits:0, maximumFractionDigits:0 });

  const saldoPositivo  = saldo.positivo;
  const saldoBg        = saldoPositivo ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)';
  const saldoBorder    = saldoPositivo ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)';
  const progressoPct   = metaMensal > 0 ? Math.min(100, totais.total / metaMensal * 100) : 0;
  const progressoCor   = progressoPct < 70 ? '#10b981' : progressoPct < 90 ? '#f59e0b' : '#ef4444';

  // Hoje (apenas se estivermos no mês atual do sistema)
  const hoje = new Date();
  const mesAtualSistema = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][hoje.getMonth()];
  const anoAtualSistema = hoje.getFullYear();
  const estamosNoMesAtual = mesAtual === mesAtualSistema && String(anoAtual) === String(anoAtualSistema);
  const diaHoje = estamosNoMesAtual ? hoje.getDate() : -1;

  // Próximas a vencer — só pendentes, ordenado por dia de vencimento
  const proximasVencer = [
    ...cartoes.map(c => ({ nome:c.nome, venc:c.vencimento, tipo:'Cartão', icone:'💳', status:getStatusFarol(c.nome, mesAtual) })),
    ...gastosFixos.map(g => ({ nome:g.descricao, venc:g.vencimento, tipo:'Fixo', icone:'🏠', status:getStatusFarol(g.descricao, mesAtual) }))
  ].filter(c => c.status === 'PENDENTE').sort((a,b) => (a.venc||31)-(b.venc||31)).slice(0,6);

  // Categorias para donut
  const cats = [
    { label:'Cartões',   valor:totais.cartoes,   cor:'#6366f1', icone:'💳' },
    { label:'Fixos',     valor:totais.fixos,     cor:'#8b5cf6', icone:'🏠' },
    { label:'Variáveis', valor:totais.variaveis, cor:'#10b981', icone:'📊' },
    { label:'Extras',    valor:totais.extras||0, cor:'#f59e0b', icone:'⚡' },
  ].filter(c => c.valor > 0);
  const totalCats = cats.reduce((s,c) => s+c.valor, 0) || 1;

  // SVG Donut
  const r = 44, cx = 60, cy = 60, circum = 2*Math.PI*r;
  let offset = 0;
  const slices = cats.map(c => {
    const dash = c.valor/totalCats*circum;
    const s = { ...c, dash, gap:circum-dash, offset };
    offset += dash;
    return s;
  });
  const donut = h('svg', { width:120, height:120, viewBox:'0 0 120 120', style:{flexShrink:0} },
    h('circle', { cx, cy, r, fill:'none', stroke:'#f3f4f6', strokeWidth:14 }),
    ...slices.map((s,i) => h('circle', { key:i, cx, cy, r, fill:'none', stroke:s.cor, strokeWidth:14,
      strokeDasharray:`${s.dash} ${s.gap}`, strokeDashoffset:-s.offset+circum*0.25 })),
    h('text', { x:cx, y:cy-6, textAnchor:'middle', fontSize:'10', fill:'#6b7280', fontWeight:'600' }, 'Total'),
    h('text', { x:cx, y:cy+10, textAnchor:'middle', fontSize:'11', fill:'#111827', fontWeight:'800' },
      fmt0(totalCats).replace('R$ ','R$'))
  );

  // ─── Estilos base ───────────────────────────────────────
  const card  = (ex={}) => ({ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', ...ex });
  const darkCard = (bg,bd) => ({ background:bg, borderRadius:'16px', padding:'20px', border:`1px solid ${bd}`, boxShadow:'0 4px 20px rgba(0,0,0,0.25)' });
  const lbl  = { fontSize:'0.65rem', fontWeight:'800', letterSpacing:'1.1px', textTransform:'uppercase', color:'#6b7280', marginBottom:'4px' };
  const lblW = { ...lbl, color:'rgba(255,255,255,0.5)' };
  const sub  = { fontSize:'0.7rem', color:'#9ca3af', marginTop:'4px' };
  const secH = (t, badge) => h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' } },
    h('h3', { style:{ fontSize:'0.82rem', fontWeight:'800', color:'#111827' } }, t),
    badge && h('span', { style:{ fontSize:'0.68rem', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', background:'#fef3c7', color:'#92400e' } }, badge)
  );
  const bar = (pct, cor, ht=6) => h('div', { style:{ height:`${ht}px`, background:'#f3f4f6', borderRadius:`${ht/2}px`, overflow:'hidden' } },
    h('div', { style:{ height:'100%', width:pct+'%', background:cor, borderRadius:`${ht/2}px`, transition:'width 0.6s ease' } })
  );

  // ─── COLUNA ESQUERDA ────────────────────────────────────
  const cardResultado = h('div', { style: darkCard(saldoBg, saldoBorder) },
    h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' } },
      h('div', null,
        h('div', { style:lblW }, `Resultado · ${mesNome} ${anoAtual}`),
        h('div', { style:{ fontSize:'1.8rem' } }, saldoPositivo ? '📈' : '📉')
      )
    ),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' } },
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
        h('span', { style:{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', fontWeight:'600' } }, '💰 Receitas'),
        h('span', { style:{ fontSize:'1rem', fontWeight:'800', color:'#6ee7b7' } }, fmt(saldo.receitas))
      ),
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
        h('span', { style:{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', fontWeight:'600' } }, '💸 Despesas'),
        h('span', { style:{ fontSize:'1rem', fontWeight:'800', color:'#fca5a5' } }, fmt(saldo.despesas))
      )
    ),
    h('div', { style:{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'14px', textAlign:'center' } },
      h('div', { style:{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', fontWeight:'700', letterSpacing:'0.8px', marginBottom:'4px' } }, 'SALDO DO MÊS'),
      h('div', { style:{ fontSize:'2rem', fontWeight:'900', letterSpacing:'-1px', color: saldoPositivo ? '#6ee7b7' : '#fca5a5' } },
        (saldoPositivo ? '+' : '') + fmt(saldo.saldo)
      )
    )
  );

  const cardMeta = h('div', { style: card() },
    secH('🎯 Meta de Gastos'),
    metaMensal > 0
      ? h('div', null,
          h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'6px' } },
            h('span', { style:{ fontSize:'0.76rem', color:'#6b7280' } }, fmt0(totais.total) + ' gastos'),
            h('span', { style:{ fontSize:'0.76rem', fontWeight:'800', color:progressoCor } }, progressoPct.toFixed(0)+'%')
          ),
          bar(progressoPct, progressoCor, 8),
          h('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:'8px' } },
            h('span', { style:sub }, 'Meta: '+fmt0(metaMensal)),
            h('span', { style:{ fontSize:'0.7rem', fontWeight:'700', color:progressoCor } },
              progressoPct < 100 ? 'Faltam '+fmt0(metaMensal-totais.total) : '⚠️ Meta atingida'
            )
          )
        )
      : h('div', { style:{ textAlign:'center', padding:'16px 0', color:'#d1d5db' } },
          h('div', { style:{ fontSize:'1.8rem', marginBottom:'6px' } }, '🎯'),
          h('div', { style:{ fontSize:'0.82rem' } }, 'Nenhuma meta definida')
        )
  );

  const qtdPendente = pagamentos.qtdTotal - pagamentos.qtdPago;
  const cardPagamentos = h('div', { style: card() },
    secH('⚡ Pagamentos', pagamentos.qtdTotal > 0 ? `${pagamentos.qtdPago}/${pagamentos.qtdTotal}` : null),
    h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' } },
      h('div', { style:{ textAlign:'center', padding:'12px', background:'#f0fdf4', borderRadius:'12px', border:'1px solid #bbf7d0' } },
        h('div', { style:{ fontSize:'1.6rem', fontWeight:'900', color:'#10b981' } }, pagamentos.qtdPago),
        h('div', { style:{ fontSize:'0.62rem', fontWeight:'800', color:'#065f46', letterSpacing:'0.8px', marginTop:'2px' } }, 'PAGOS')
      ),
      h('div', { style:{ textAlign:'center', padding:'12px', background: qtdPendente > 0 ? '#fffbeb' : '#f9fafb', borderRadius:'12px', border: qtdPendente > 0 ? '1px solid #fde68a' : '1px solid #e5e7eb' } },
        h('div', { style:{ fontSize:'1.6rem', fontWeight:'900', color: qtdPendente > 0 ? '#f59e0b' : '#d1d5db' } }, qtdPendente),
        h('div', { style:{ fontSize:'0.62rem', fontWeight:'800', color: qtdPendente > 0 ? '#92400e' : '#9ca3af', letterSpacing:'0.8px', marginTop:'2px' } }, 'PENDENTES')
      )
    ),
    bar(pagamentos.percentual, '#10b981', 5),
    h('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:'6px' } },
      h('span', { style:sub }, fmt(pagamentos.pago||0) + ' pagos'),
      h('span', { style:{ ...sub, fontWeight:'700', color:'#10b981' } }, pagamentos.percentual.toFixed(0)+'% concluído')
    )
  );

  const colEsq = h('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' } },
    cardResultado, cardMeta, cardPagamentos
  );

  // ─── COLUNA CENTRAL ─────────────────────────────────────
  const cardComposicao = h('div', { style: card({ marginBottom:'14px' }) },
    secH('📊 Composição das Despesas'),
    cats.length > 0
      ? h('div', { style:{ display:'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', gap:'16px', alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center' } },
          donut,
          h('div', { style:{ flex:1, display:'flex', flexDirection:'column', gap:'10px' } },
            ...cats.map((c,i) => h('div', { key:i },
              h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'3px' } },
                h('div', { style:{ display:'flex', alignItems:'center', gap:'6px' } },
                  h('div', { style:{ width:'8px', height:'8px', borderRadius:'50%', background:c.cor } }),
                  h('span', { style:{ fontSize:'0.74rem', color:'#374151', fontWeight:'600' } }, c.icone+' '+c.label)
                ),
                h('span', { style:{ fontSize:'0.74rem', color:'#111827', fontWeight:'800' } }, fmt0(c.valor))
              ),
              bar(c.valor/totalCats*100, c.cor, 4),
              h('div', { style:{ fontSize:'0.64rem', color:'#9ca3af', marginTop:'2px' } }, (c.valor/totalCats*100).toFixed(0)+'%')
            ))
          )
        )
      : h('div', { style:{ textAlign:'center', padding:'24px 0', color:'#d1d5db' } },
          h('div', { style:{ fontSize:'2.5rem', marginBottom:'8px' } }, '📊'),
          h('div', { style:{ fontSize:'0.85rem' } }, 'Nenhuma despesa em '+mesNome)
        )
  );

  const cardProximas = h('div', { style: card() },
    secH('⏰ Próximas a Vencer', proximasVencer.length > 0 ? proximasVencer.length+' pendente'+(proximasVencer.length>1?'s':'') : null),
    proximasVencer.length > 0
      ? h('div', { style:{ display:'flex', flexDirection:'column', gap:'8px' } },
          ...proximasVencer.map((c,i) => {
            const diasRestantes = c.venc ? c.venc - diaHoje : null;
            const urgente = diaHoje > 0 && diasRestantes !== null && diasRestantes <= 3;
            const vencido = diaHoje > 0 && diasRestantes !== null && diasRestantes < 0;
            const corUrg = vencido ? '#ef4444' : urgente ? '#f59e0b' : '#6b7280';
            const bgUrg  = vencido ? '#fef2f2' : urgente ? '#fff7ed' : '#fafafa';
            const bdUrg  = vencido ? '#fecaca' : urgente ? '#fed7aa' : '#f3f4f6';
            const labelDia = !c.venc ? 'Sem data'
              : vencido ? `Venceu dia ${c.venc}`
              : diasRestantes === 0 ? 'Hoje!'
              : diasRestantes === 1 ? 'Amanhã'
              : `Dia ${c.venc}`;
            return h('div', { key:i, style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', background:bgUrg, borderRadius:'10px', border:`1px solid ${bdUrg}` } },
              h('div', { style:{ display:'flex', alignItems:'center', gap:'10px' } },
                h('span', { style:{ fontSize:'1rem' } }, vencido ? '🔴' : urgente ? '🟠' : c.icone),
                h('div', null,
                  h('div', { style:{ fontSize:'0.78rem', fontWeight:'700', color:'#111827' } }, c.nome),
                  h('div', { style:{ fontSize:'0.67rem', color:'#9ca3af' } }, c.tipo)
                )
              ),
              h('div', { style:{ fontSize:'0.72rem', fontWeight:'800', color:corUrg, background: vencido?'#fef2f2':urgente?'#fffbeb':'#f3f4f6', padding:'3px 9px', borderRadius:'8px' } },
                labelDia
              )
            );
          })
        )
      : h('div', { style:{ textAlign:'center', padding:'24px 0', color:'#6b7280' } },
          h('div', { style:{ fontSize:'2.5rem', marginBottom:'8px' } }, '✅'),
          h('div', { style:{ fontSize:'0.85rem' } }, 'Tudo em dia!')
        )
  );

  const colCentro = h('div', { style:{ display:'flex', flexDirection:'column', gap:'0' } },
    cardComposicao, cardProximas
  );

  // ─── COLUNA DIREITA ──────────────────────────────────────
  // Valor correto = base (outras cobranças) + parcelas do mês
  const cardCartoes = h('div', { style: card({ marginBottom:'14px' }) },
    secH('💳 Cartões de Crédito'),
    cartoes.length > 0
      ? h('div', { style:{ display:'flex', flexDirection:'column', gap:'10px' } },
          ...cartoes.slice(0,4).map((c,i) => {
            const valoresAno = c.valores?.[anoAtual] || {};
            const base = valoresAno[mesAtual] || 0;
            const parcelas = calcularParcelasCartao(c.nome, mesAtual);
            const totalParc = parcelas.reduce((s,p) => s+p.valorParcela, 0);
            const val  = base + totalParc;
            const lim   = c.limite || 0;
            const usoPct= lim > 0 ? Math.min(100, val/lim*100) : 0;
            const pago  = getStatusFarol(c.nome, mesAtual) === 'PAGO';
            const diaVenc = c.vencimento;
            const diasP = diaVenc && diaHoje > 0 ? diaVenc - diaHoje : null;
            const venceEm = diasP === null ? null : diasP < 0 ? 'Vencido' : diasP === 0 ? 'Vence hoje' : diasP === 1 ? 'Vence amanhã' : `Vence em ${diasP}d`;
            const corVenc = diasP !== null && diasP < 0 ? '#ef4444' : diasP !== null && diasP <= 3 ? '#f59e0b' : '#9ca3af';
            return h('div', { key:i, style:{ padding:'11px 13px', background:pago?'#f0fdf4':'#fafafa', borderRadius:'12px', border:`1px solid ${pago?'#bbf7d0':'#e5e7eb'}` } },
              h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: lim>0?'8px':'0' } },
                h('div', { style:{ display:'flex', alignItems:'center', gap:'8px' } },
                  h('div', { style:{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', color:'#fff', fontWeight:'800', flexShrink:0 } },
                    c.nome.charAt(0).toUpperCase()
                  ),
                  h('div', null,
                    h('div', { style:{ fontSize:'0.8rem', fontWeight:'700', color:'#111827' } }, c.nome),
                    h('div', { style:{ fontSize:'0.64rem', color: pago ? '#10b981' : corVenc, fontWeight:'600', marginTop:'1px' } },
                      pago ? '✓ Pago' : (venceEm || (diaVenc ? `Vence dia ${diaVenc}` : ''))
                    )
                  )
                ),
                h('div', { style:{ textAlign:'right' } },
                  h('div', { style:{ fontSize:'0.9rem', fontWeight:'900', color:pago?'#10b981':'#111827' } }, fmt0(val)),
                  totalParc > 0 && h('div', { style:{ fontSize:'0.62rem', color:'#9ca3af', marginTop:'1px' } },
                    parcelas.length+' compra'+(parcelas.length!==1?'s':'')
                  )
                )
              ),
              lim > 0 && h('div', null,
                bar(usoPct, usoPct>80?'#ef4444':'#6366f1', 3),
                h('div', { style:{ fontSize:'0.62rem', color:'#9ca3af', marginTop:'3px' } }, `${usoPct.toFixed(0)}% de ${fmt0(lim)}`)
              )
            );
          }),
          cartoes.length > 4 && h('div', { style:{ textAlign:'center', fontSize:'0.72rem', color:'#9ca3af', marginTop:'4px' } }, `+${cartoes.length-4} cartões`)
        )
      : h('div', { style:{ textAlign:'center', padding:'20px 0', color:'#d1d5db' } },
          h('div', { style:{ fontSize:'2rem', marginBottom:'8px' } }, '💳'),
          h('div', { style:{ fontSize:'0.82rem' } }, 'Nenhum cartão cadastrado')
        )
  );

  const itensResumo = [
    { label:'💳 Cartões',    valor:totais.cartoes },
    { label:'🏠 Fixos',      valor:totais.fixos },
    { label:'📊 Variáveis',  valor:totais.variaveis },
    { label:'⚡ Extras',     valor:totais.extras||0 },
  ].filter(i => i.valor > 0);

  const cardResumo = h('div', { style: darkCard('linear-gradient(135deg,#1e1b4b,#312e81)', 'rgba(99,102,241,0.3)') },
    h('div', { style:{ ...lblW, marginBottom:'12px' } }, `Resumo · ${mesNome} ${anoAtual}`),
    ...itensResumo.map((item,i) =>
      h('div', { key:i, style:{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom: i<itensResumo.length-1 ? '1px solid rgba(255,255,255,0.07)' : 'none' } },
        h('span', { style:{ fontSize:'0.78rem', color:'rgba(255,255,255,0.55)' } }, item.label),
        h('span', { style:{ fontSize:'0.78rem', fontWeight:'800', color:'rgba(255,255,255,0.9)' } }, fmt0(item.valor))
      )
    ),
    h('div', { style:{ borderTop:'1px solid rgba(255,255,255,0.15)', marginTop:'8px', paddingTop:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' } },
      h('span', { style:{ fontSize:'0.8rem', fontWeight:'700', color:'rgba(255,255,255,0.6)' } }, 'TOTAL GASTO'),
      h('span', { style:{ fontSize:'1.1rem', fontWeight:'900', color:'#fff' } }, fmt0(totais.total))
    )
  );

  const colDir = h('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' } },
    cardCartoes, cardResumo
  );

  // ─── LAYOUT RESPONSIVO ──────────────────────────────────
  const _mob = window.innerWidth <= 768;
  return h('div', {
    style:{
      display:'grid',
      gridTemplateColumns: _mob ? '1fr' : '1fr 1.4fr 1fr',
      gap:'16px',
      alignItems:'start',
    }
  }, colEsq, colCentro, colDir);
};
