// Diagnóstico + Timeline — mesmo padrão visual do Dashboard
window.DiagnosticoComponent = function Diagnostico() {
  const h = React.createElement;
  const [reservaModalAberto, setReservaModalAberto] = React.useState(false);
  const [reservaInput, setReservaInput] = React.useState('');
  const ctx              = window.__diagCtx || {};
  const scoreSaude       = ctx.scoreSaude    || { score:0, criterios:[], reservaIdeal:0, reservaAtual:0, percentualReserva:0, percentualPoupanca:0 };
  const scoreInfo        = ctx.scoreInfo     || { text:'—', emoji:'❓' };
  const saldo            = ctx.saldo         || { receitas:0, despesas:0, saldo:0, positivo:true };
  const totais           = ctx.totais        || { total:0 };
  const orcamento        = ctx.orcamento     || { cartoes:0, fixos:0, variaveis:0 };
  const dentroOrc        = ctx.dentroOrcamento !== false;
  const reservaAtual     = ctx.reservaEmergencia || 0;
  const setReserva       = ctx.setReservaEmergencia || (() => {});
  const mesAtual         = ctx.mesAtual      || 'jan';
  const anoAtual         = ctx.anoAtual      || new Date().getFullYear();
  const subAba           = ctx.subAba        || null;
  const setTelaAtiva     = ctx.setTelaAtiva  || (() => {});
  const metas            = ctx.metasFinanceiras || [];
  const dividas          = ctx.dividas       || [];

  const MESES = { jan:'Janeiro',fev:'Fevereiro',mar:'Março',abr:'Abril',mai:'Maio',jun:'Junho',jul:'Julho',ago:'Agosto',set:'Setembro',out:'Outubro',nov:'Novembro',dez:'Dezembro' };
  const mesNome = MESES[mesAtual] || mesAtual;
  const fmt  = v => 'R$ '+(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmt0 = v => 'R$ '+(v||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});

  // ─── Estilos base ───────────────────────────────────────
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
  const pilula = (label, rota, ativa) => h('button', {
    onClick: () => setTelaAtiva(rota),
    style:{ padding:'6px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:'700',
      background: ativa ? '#6366f1' : '#f3f4f6', color: ativa ? '#fff' : '#6b7280', transition:'all 0.15s' }
  }, label);

  // Barra de sub-abas
  const barraSubAbas = h('div', { style:{ display:'flex', gap:'8px', marginBottom:'16px' } },
    pilula('🏥 Diagnóstico', 'planejamento', !subAba || subAba !== 'timeline'),
    pilula('📈 Timeline', 'planejamento-timeline', subAba === 'timeline')
  );

  // ════════════════════════════════════════════════════════
  // ABA: TIMELINE
  // ════════════════════════════════════════════════════════
  if (subAba === 'timeline') {
    const saldoMes       = saldo.saldo || 0;
    const metasAtivas    = metas.filter(m => !m.concluida);
    const reservaIdeal   = scoreSaude.reservaIdeal || 0;
    const poupancaMensal = saldo.positivo ? saldoMes : 0;

    // Projeções
    const projetar = (meses) => {
      const poupado  = poupancaMensal * meses;
      const reserva  = Math.min(reservaAtual + poupado, reservaIdeal);
      const scoreProj= Math.min(100, scoreSaude.score + Math.floor(meses/6));
      return { poupado, reserva, scoreProj };
    };
    const p1 = projetar(12);
    const p3 = projetar(36);
    const p5 = projetar(60);

    // Card: Você está aqui
    const cardAgora = h('div', { style: darkCard('linear-gradient(135deg,#6366f1,#10b981)', 'rgba(99,102,241,0.3)') },
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' } },
        h('div', null,
          h('div', { style:{ ...lblW, marginBottom:'4px' } }, '📍 Você está aqui'),
          h('div', { style:{ fontSize:'0.9rem', color:'rgba(255,255,255,0.7)' } },
            new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
          )
        ),
        h('div', { style:{ fontSize:'2rem' } }, scoreInfo.emoji)
      ),
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px' } },
        ...[
          { label:'Score Saúde',   valor: scoreSaude.score+' pts', cor:'#6ee7b7' },
          { label:'Saldo Mensal',  valor: fmt0(saldoMes),         cor: saldo.positivo?'#6ee7b7':'#fca5a5' },
          { label:'Metas Ativas',  valor: metasAtivas.length,     cor:'#c7d2fe' },
          { label:'Dívidas',       valor: dividas.length,         cor: dividas.length>0?'#fca5a5':'#6ee7b7' },
        ].map((item,i) => h('div', { key:i, style:{ background:'rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px' } },
          h('div', { style:{ fontSize:'0.68rem', color:'rgba(255,255,255,0.55)', fontWeight:'600', marginBottom:'2px' } }, item.label),
          h('div', { style:{ fontSize:'1rem', fontWeight:'900', color:item.cor } }, item.valor)
        ))
      )
    );

    // Card: Projeções
    const projecoes = [
      { label:'1 Ano',  meses:12,  proj:p1, cor:'#6366f1' },
      { label:'3 Anos', meses:36, proj:p3, cor:'#8b5cf6' },
      { label:'5 Anos', meses:60, proj:p5, cor:'#10b981' },
    ];
    const cardProjecoes = h('div', { style: card() },
      secH('🔭 Projeções Financeiras'),
      poupancaMensal > 0
        ? h('div', { style:{ display:'flex', flexDirection:'column', gap:'12px' } },
            ...projecoes.map((p,i) => h('div', { key:i, style:{ padding:'12px', background:'#fafafa', borderRadius:'12px', border:'1px solid #e5e7eb' } },
              h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' } },
                h('div', { style:{ display:'flex', alignItems:'center', gap:'8px' } },
                  h('div', { style:{ width:'10px', height:'10px', borderRadius:'50%', background:p.cor } }),
                  h('span', { style:{ fontSize:'0.8rem', fontWeight:'800', color:'#111827' } }, p.label)
                ),
                h('span', { style:{ fontSize:'0.78rem', fontWeight:'700', color:p.cor } }, 'Score '+p.proj.scoreProj)
              ),
              h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' } },
                h('div', null,
                  h('div', { style:{ fontSize:'0.65rem', color:'#9ca3af', fontWeight:'600' } }, 'Poupança acumulada'),
                  h('div', { style:{ fontSize:'0.88rem', fontWeight:'800', color:p.cor } }, fmt0(p.proj.poupado))
                ),
                h('div', null,
                  h('div', { style:{ fontSize:'0.65rem', color:'#9ca3af', fontWeight:'600' } }, 'Reserva emergência'),
                  h('div', { style:{ fontSize:'0.88rem', fontWeight:'800', color: p.proj.reserva >= reservaIdeal ? '#10b981' : '#f59e0b' } },
                    fmt0(p.proj.reserva)
                  )
                )
              )
            ))
          )
        : h('div', { style:{ textAlign:'center', padding:'20px 0', color:'#d1d5db' } },
            h('div', { style:{ fontSize:'2rem', marginBottom:'8px' } }, '📊'),
            h('div', { style:{ fontSize:'0.85rem' } }, 'Sem sobra mensal para projetar')
          )
    );

    // Card: Marcos das metas
    const cardMetas = h('div', { style: card() },
      secH('🎯 Próximos Marcos', metasAtivas.length > 0 ? metasAtivas.length+' ativas' : null),
      metasAtivas.length > 0
        ? h('div', { style:{ display:'flex', flexDirection:'column', gap:'10px' } },
            ...metasAtivas.slice(0,4).map((m,i) => {
              const pct = m.valor > 0 ? Math.min(100, (m.valorAtual||0)/m.valor*100) : 0;
              const falta = Math.max(0, m.valor - (m.valorAtual||0));
              const mesesFalta = poupancaMensal > 0 ? Math.ceil(falta/poupancaMensal) : null;
              return h('div', { key:i },
                h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'4px' } },
                  h('span', { style:{ fontSize:'0.78rem', fontWeight:'700', color:'#111827' } }, m.titulo),
                  h('span', { style:{ fontSize:'0.72rem', fontWeight:'800', color:'#6366f1' } }, pct.toFixed(0)+'%')
                ),
                bar(pct, '#6366f1', 6),
                h('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:'3px' } },
                  h('span', { style:sub }, fmt0(m.valorAtual||0)+' de '+fmt0(m.valor)),
                  mesesFalta && h('span', { style:{ ...sub, color:'#6366f1', fontWeight:'600' } },
                    mesesFalta <= 12 ? `~${mesesFalta} meses` : `~${Math.ceil(mesesFalta/12)} anos`
                  )
                )
              );
            })
          )
        : h('div', { style:{ textAlign:'center', padding:'20px 0', color:'#d1d5db' } },
            h('div', { style:{ fontSize:'2rem', marginBottom:'8px' } }, '🎯'),
            h('div', { style:{ fontSize:'0.85rem' } }, 'Nenhuma meta cadastrada')
          )
    );

    // Card: Resumo dívidas
    const totalDividas = dividas.reduce((s,d) => s+(d.saldoDevedor||0), 0);
    const cardDividas = h('div', { style: darkCard('linear-gradient(135deg,#1e1b4b,#312e81)', 'rgba(99,102,241,0.3)') },
      h('div', { style:{ ...lblW, marginBottom:'12px' } }, '💳 Dívidas em Aberto'),
      dividas.length > 0
        ? h('div', null,
            ...dividas.slice(0,3).map((d,i) => h('div', { key:i, style:{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' } },
              h('span', { style:{ fontSize:'0.75rem', color:'rgba(255,255,255,0.65)' } }, d.nome||d.credor||'Dívida'),
              h('span', { style:{ fontSize:'0.75rem', fontWeight:'800', color:'#fca5a5' } }, fmt0(d.saldoDevedor||0))
            )),
            h('div', { style:{ borderTop:'1px solid rgba(255,255,255,0.15)', marginTop:'8px', paddingTop:'8px', display:'flex', justifyContent:'space-between' } },
              h('span', { style:{ fontSize:'0.78rem', fontWeight:'700', color:'rgba(255,255,255,0.6)' } }, 'TOTAL'),
              h('span', { style:{ fontSize:'1rem', fontWeight:'900', color:'#fca5a5' } }, fmt0(totalDividas))
            )
          )
        : h('div', { style:{ textAlign:'center', padding:'12px 0', color:'rgba(255,255,255,0.3)', fontSize:'0.85rem' } },
            h('div', { style:{ fontSize:'1.8rem', marginBottom:'6px' } }, '✅'),
            'Sem dívidas cadastradas'
          )
    );

    return h('div', null,
      barraSubAbas,
      h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr', gap:'16px', alignItems:'start' } },
        // Esq
        h('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' } }, cardAgora, cardDividas),
        // Centro
        cardProjecoes,
        // Dir
        cardMetas
      )
    );
  }

  // ════════════════════════════════════════════════════════
  // ABA: DIAGNÓSTICO (default)
  // ════════════════════════════════════════════════════════
  const scoreCor   = scoreSaude.score>=80?'#10b981':scoreSaude.score>=60?'#6366f1':scoreSaude.score>=40?'#f59e0b':'#ef4444';
  const scoreBg    = scoreSaude.score>=80?'linear-gradient(135deg,#064e3b,#065f46)':scoreSaude.score>=60?'linear-gradient(135deg,#1e1b4b,#312e81)':scoreSaude.score>=40?'linear-gradient(135deg,#78350f,#92400e)':'linear-gradient(135deg,#7f1d1d,#991b1b)';
  const scoreBorder= scoreSaude.score>=80?'rgba(16,185,129,0.3)':scoreSaude.score>=60?'rgba(99,102,241,0.3)':scoreSaude.score>=40?'rgba(245,158,11,0.3)':'rgba(239,68,68,0.3)';
  const rendaCompPct  = saldo.receitas>0?Math.min(100,totais.total/saldo.receitas*100):0;
  const rendaCorFundo = rendaCompPct<=70?'#10b981':rendaCompPct<=90?'#f59e0b':'#ef4444';
  const poupancaPct   = scoreSaude.percentualPoupanca||0;
  const poupancaCor   = poupancaPct>=20?'#10b981':poupancaPct>=10?'#f59e0b':'#ef4444';
  const reservaPct    = Math.min(100,scoreSaude.percentualReserva||0);
  const reservaCor    = reservaPct>=100?'#10b981':reservaPct>=50?'#6366f1':reservaPct>=16?'#f59e0b':'#ef4444';
  const orcadoTotal   = (orcamento.cartoes||0)+(orcamento.fixos||0)+(orcamento.variaveis||0);
  const diferenca     = orcadoTotal-totais.total;

  // Gauge semicircular para o score
  const gauge = () => {
    const score=scoreSaude.score, r=52, cx=70, cy=70;
    const angle=Math.PI+(score/100)*Math.PI;
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
    const large=score>50?1:0;
    return h('svg',{width:140,height:80,viewBox:'0 0 140 80',style:{flexShrink:0}},
      h('path',{d:`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`,fill:'none',stroke:'#f3f4f6',strokeWidth:12,strokeLinecap:'round'}),
      score>0&&h('path',{d:`M ${cx-r} ${cy} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,fill:'none',stroke:scoreCor,strokeWidth:12,strokeLinecap:'round'}),
      h('text',{x:cx,y:cy-8,textAnchor:'middle',fontSize:'20',fontWeight:'900',fill:scoreCor},score),
      h('text',{x:cx,y:cy+4,textAnchor:'middle',fontSize:'9',fontWeight:'700',fill:'#6b7280'},'de 100')
    );
  };

  // Coluna Esquerda
  const cardScore = h('div',{style:darkCard(scoreBg,scoreBorder)},
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}},
      h('div',null,
        h('div',{style:lblW},`Saúde · ${mesNome} ${anoAtual}`),
        h('div',{style:{fontSize:'1.1rem',fontWeight:'900',color:'#fff',marginTop:'4px'}},scoreInfo.emoji+' '+scoreInfo.text)
      ),
      gauge()
    ),
    h('div',{style:{borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'12px'}},
      h('div',{style:{fontSize:'0.7rem',color:'rgba(255,255,255,0.45)',fontWeight:'600',marginBottom:'8px'}},'Critérios:'),
      h('div',{style:{display:'flex',flexDirection:'column',gap:'5px'}},
        ...scoreSaude.criterios.map((c,i)=>h('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
          h('span',{style:{fontSize:'0.73rem',color:'rgba(255,255,255,0.75)'}},c.nome),
          h('span',{style:{fontSize:'0.7rem',fontWeight:'800',color:c.pontos>0?'#6ee7b7':'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.08)',padding:'1px 7px',borderRadius:'8px'}},c.pontos+' pts')
        ))
      )
    )
  );

  const cardSituacao = h('div',{style:card()},
    secH('💰 Situação do Mês'),
    h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:'#f0fdf4',borderRadius:'10px',border:'1px solid #bbf7d0'}},
        h('span',{style:{fontSize:'0.76rem',color:'#374151',fontWeight:'600'}},'💰 Receitas'),
        h('span',{style:{fontSize:'0.88rem',fontWeight:'900',color:'#10b981'}},fmt(saldo.receitas))
      ),
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:'#fef2f2',borderRadius:'10px',border:'1px solid #fecaca'}},
        h('span',{style:{fontSize:'0.76rem',color:'#374151',fontWeight:'600'}},'💸 Despesas'),
        h('span',{style:{fontSize:'0.88rem',fontWeight:'900',color:'#ef4444'}},fmt(totais.total))
      ),
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:saldo.positivo?'#f0fdf4':'#fef2f2',borderRadius:'10px',border:`1px solid ${saldo.positivo?'#bbf7d0':'#fecaca'}`}},
        h('div',null,
          h('div',{style:{fontSize:'0.63rem',fontWeight:'800',color:'#6b7280',letterSpacing:'0.8px'}},'SALDO'),
          h('div',{style:{fontSize:'0.75rem',color:'#6b7280'}},saldo.positivo?'Superávit ✅':'Déficit ⚠️')
        ),
        h('span',{style:{fontSize:'1.05rem',fontWeight:'900',color:saldo.positivo?'#10b981':'#ef4444'}},(saldo.positivo?'+':'')+fmt(saldo.saldo))
      )
    )
  );

  // Coluna Central
  const cardRendaComp = h('div',{style:card({marginBottom:'14px'})},
    secH('📊 Renda Comprometida',rendaCompPct.toFixed(0)+'%'),
    h('div',{style:{display:'flex',alignItems:'center',gap:'16px',marginBottom:'14px'}},
      h('div',{style:{position:'relative',width:'80px',height:'80px',flexShrink:0}},
        h('svg',{width:80,height:80,viewBox:'0 0 80 80'},
          h('circle',{cx:40,cy:40,r:32,fill:'none',stroke:'#f3f4f6',strokeWidth:10}),
          h('circle',{cx:40,cy:40,r:32,fill:'none',stroke:rendaCorFundo,strokeWidth:10,
            strokeDasharray:`${rendaCompPct/100*201} 201`,strokeDashoffset:50.25,strokeLinecap:'round'}),
          h('text',{x:40,y:43,textAnchor:'middle',fontSize:'14',fontWeight:'900',fill:rendaCorFundo},rendaCompPct.toFixed(0)+'%')
        )
      ),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:'0.76rem',color:'#374151',marginBottom:'4px'}},fmt(totais.total)+' de '+fmt(saldo.receitas)),
        h('div',{style:{fontSize:'0.7rem',color:rendaCorFundo,fontWeight:'700',marginBottom:'6px'}},
          rendaCompPct<=70?'✅ Saudável':rendaCompPct<=90?'⚠️ Atenção':'🚨 Crítico'
        ),
        h('div',{style:{fontSize:'0.66rem',color:'#9ca3af'}},'Ideal: abaixo de 70%')
      )
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',fontSize:'0.7rem'}},
      ...[{label:'≤70%',txt:'Saudável',cor:'#10b981',at:rendaCompPct<=70},{label:'70-90%',txt:'Atenção',cor:'#f59e0b',at:rendaCompPct>70&&rendaCompPct<=90},{label:'>90%',txt:'Crítico',cor:'#ef4444',at:rendaCompPct>90}]
        .map((z,i)=>h('div',{key:i,style:{textAlign:'center',padding:'5px 4px',borderRadius:'8px',background:z.at?z.cor+'15':'#f9fafb',border:`1px solid ${z.at?z.cor+'40':'#e5e7eb'}`}},
          h('div',{style:{fontWeight:'800',color:z.at?z.cor:'#9ca3af'}},z.label),
          h('div',{style:{color:z.at?z.cor:'#9ca3af'}},z.txt)
        ))
    )
  );

  const cardPoupanca = h('div',{style:card({marginBottom:'14px'})},
    secH('💵 Capacidade de Poupança'),
    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}},
      h('div',{style:{fontSize:'2rem',fontWeight:'900',color:poupancaCor,lineHeight:1}},poupancaPct.toFixed(0)+'%'),
      h('div',null,
        h('div',{style:{fontSize:'0.8rem',fontWeight:'700',color:'#111827'}},saldo.positivo?fmt(saldo.saldo)+' / mês':'Sem sobra'),
        h('div',{style:{fontSize:'0.7rem',color:poupancaCor,fontWeight:'600',marginTop:'2px'}},
          poupancaPct>=20?'✅ Excelente':poupancaPct>=10?'⚠️ Regular':'🚨 Insuficiente'
        )
      )
    ),
    bar(poupancaPct,poupancaCor,8)
  );

  const cardOrcamento = h('div',{style:card()},
    secH('📋 vs Orçamento',dentroOrc?'No limite ✅':'Estourado ⚠️'),
    orcadoTotal>0
      ?h('div',null,
          h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:'6px'}},
            h('span',{style:{fontSize:'0.74rem',color:'#6b7280'}},'Orçado: '+fmt0(orcadoTotal)),
            h('span',{style:{fontSize:'0.74rem',fontWeight:'800',color:dentroOrc?'#10b981':'#ef4444'}},'Gasto: '+fmt0(totais.total))
          ),
          bar(Math.min(100,totais.total/orcadoTotal*100),dentroOrc?'#10b981':'#ef4444',8),
          h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:'6px'}},
            h('span',{style:sub},(totais.total/orcadoTotal*100).toFixed(0)+'% utilizado'),
            h('span',{style:{...sub,fontWeight:'700',color:dentroOrc?'#10b981':'#ef4444'}},
              (dentroOrc?'Sobram ':'Excedem ')+fmt0(Math.abs(diferenca))
            )
          )
        )
      :h('div',{style:{textAlign:'center',padding:'14px 0',color:'#d1d5db',fontSize:'0.82rem'}},
          h('div',{style:{fontSize:'1.8rem',marginBottom:'6px'}},'📋'),'Orçamento não definido'
        )
  );

  // Coluna Direita
  const reservaIdeal2 = scoreSaude.reservaIdeal||0;
  const cardReserva = h('div',{style:card({marginBottom:'14px'})},
    secH('🆘 Reserva de Emergência'),
    h('div',{style:{textAlign:'center',marginBottom:'14px'}},
      h('svg',{width:160,height:90,viewBox:'0 0 160 90'},
        h('path',{d:'M 24 80 A 56 56 0 0 1 136 80',fill:'none',stroke:'#f3f4f6',strokeWidth:14,strokeLinecap:'round'}),
        reservaPct>0&&h('path',{
          d:(()=>{const angle=Math.PI*(1-reservaPct/100);const x=80+56*Math.cos(angle+Math.PI);const y=80+56*Math.sin(angle+Math.PI);const lg=reservaPct>50?1:0;return `M 24 80 A 56 56 0 ${lg} 1 ${x} ${y}`})(),
          fill:'none',stroke:reservaCor,strokeWidth:14,strokeLinecap:'round'
        }),
        h('text',{x:80,y:68,textAnchor:'middle',fontSize:'20',fontWeight:'900',fill:reservaCor},reservaPct.toFixed(0)+'%'),
        h('text',{x:80,y:82,textAnchor:'middle',fontSize:'9',fill:'#9ca3af'},'da meta ideal')
      )
    ),
    h('div',{style:{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'12px'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#f9fafb',borderRadius:'8px'}},
        h('span',{style:{fontSize:'0.73rem',color:'#6b7280'}},'🎯 Meta (6 meses)'),
        h('span',{style:{fontSize:'0.76rem',fontWeight:'800',color:'#6366f1'}},fmt0(reservaIdeal2))
      ),
      h('div',{style:{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#f9fafb',borderRadius:'8px'}},
        h('span',{style:{fontSize:'0.73rem',color:'#6b7280'}},'💰 Reserva atual'),
        h('span',{style:{fontSize:'0.76rem',fontWeight:'800',color:reservaCor}},fmt(reservaAtual))
      ),
      reservaIdeal2>reservaAtual&&h('div',{style:{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#fef3c7',borderRadius:'8px',border:'1px solid #fde68a'}},
        h('span',{style:{fontSize:'0.73rem',color:'#92400e'}},'⚠️ Falta acumular'),
        h('span',{style:{fontSize:'0.76rem',fontWeight:'800',color:'#b45309'}},fmt0(Math.max(0,reservaIdeal2-reservaAtual)))
      )
    ),
    h('button',{
      onClick:()=>{ setReservaInput(String(reservaAtual)); setReservaModalAberto(true); },
      style:{width:'100%',padding:'9px',border:'none',borderRadius:'10px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer'}
    },'✏️ Atualizar Reserva')
  );

  const itensScore=[
    {label:'Saldo Positivo',max:30,pts:scoreSaude.criterios.find(c=>c.nome.includes('Saldo'))?.pontos||0},
    {label:'Dentro Orçamento',max:25,pts:scoreSaude.criterios.find(c=>c.nome.includes('Orçamento'))?.pontos||0},
    {label:'Reserva Emergência',max:30,pts:scoreSaude.criterios.find(c=>c.nome.includes('Reserva'))?.pontos||0},
    {label:'Capacidade Poupar',max:15,pts:scoreSaude.criterios.find(c=>c.nome.includes('Economiza'))?.pontos||0},
  ];
  const cardPontuacao = h('div',{style:darkCard('linear-gradient(135deg,#1e1b4b,#312e81)','rgba(99,102,241,0.3)')},
    h('div',{style:{...lblW,marginBottom:'12px'}},'Pontuação Detalhada'),
    h('div',{style:{display:'flex',flexDirection:'column',gap:'9px'}},
      ...itensScore.map((item,i)=>h('div',{key:i},
        h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:'3px'}},
          h('span',{style:{fontSize:'0.72rem',color:'rgba(255,255,255,0.65)'}},item.label),
          h('span',{style:{fontSize:'0.72rem',fontWeight:'800',color:item.pts>=item.max?'#6ee7b7':item.pts>0?'#fde68a':'rgba(255,255,255,0.3)'}},item.pts+'/'+item.max)
        ),
        h('div',{style:{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden'}},
          h('div',{style:{height:'100%',width:(item.pts/item.max*100)+'%',background:item.pts>=item.max?'#10b981':item.pts>0?'#f59e0b':'#374151',borderRadius:'2px',transition:'width 0.6s ease'}})
        )
      ))
    ),
    h('div',{style:{borderTop:'1px solid rgba(255,255,255,0.15)',marginTop:'12px',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}},
      h('span',{style:{fontSize:'0.78rem',fontWeight:'700',color:'rgba(255,255,255,0.6)'}},'TOTAL'),
      h('span',{style:{fontSize:'1.3rem',fontWeight:'900',color:scoreCor}},scoreSaude.score+' pts')
    )
  );

  const modalReserva = reservaModalAberto && h('div',{style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}},
    h('div',{style:{background:'#fff',borderRadius:'16px',padding:'1.5rem',width:'100%',maxWidth:'360px',boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}},
      h('h3',{style:{margin:'0 0 0.75rem',fontSize:'1.05rem',fontWeight:'700',color:'#1e1b4b'}},'🆘 Atualizar Reserva de Emergência'),
      h('p',{style:{margin:'0 0 0.75rem',fontSize:'0.9rem',color:'#4b5563'}},'Valor atual da sua reserva (R$):'),
      h('input',{
        type:'number', value:reservaInput,
        onChange:(e)=>setReservaInput(e.target.value),
        onKeyDown:(e)=>{ if(e.key==='Enter'){setReserva(parseFloat(reservaInput)||0);setReservaModalAberto(false);} if(e.key==='Escape')setReservaModalAberto(false); },
        autoFocus:true,
        style:{width:'100%',padding:'0.6rem 0.75rem',border:'1.5px solid #d1d5db',borderRadius:'8px',fontSize:'1rem',outline:'none',boxSizing:'border-box'}
      }),
      h('div',{style:{display:'flex',gap:'0.75rem',marginTop:'1rem',justifyContent:'flex-end'}},
        h('button',{onClick:()=>setReservaModalAberto(false),style:{padding:'0.5rem 1.1rem',border:'1.5px solid #d1d5db',borderRadius:'8px',background:'#fff',cursor:'pointer',fontSize:'0.9rem',color:'#6b7280'}},'Cancelar'),
        h('button',{onClick:()=>{setReserva(parseFloat(reservaInput)||0);setReservaModalAberto(false);},style:{padding:'0.5rem 1.25rem',border:'none',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',cursor:'pointer',fontSize:'0.9rem',fontWeight:'700'}},'Confirmar')
      )
    )
  );

  return h('div', null,
    barraSubAbas,
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1.4fr 1fr',gap:'16px',alignItems:'start'}},
      h('div',{style:{display:'flex',flexDirection:'column',gap:'14px'}}, cardScore, cardSituacao),
      h('div',{style:{display:'flex',flexDirection:'column',gap:'0'}}, cardRendaComp, cardPoupanca, cardOrcamento),
      h('div',{style:{display:'flex',flexDirection:'column',gap:'14px'}}, cardReserva, cardPontuacao)
    ),
    modalReserva
  );
};
