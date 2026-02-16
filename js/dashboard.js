// Dashboard - Estratégia Finanças
// Arquivo separado, sem JSX, sem Babel necessário
window.DashboardComponent = function Dashboard() {
  const h = React.createElement;
  const { useState } = React;

  // Variáveis do closure do App (injetadas via window pelo app-compiled.js)
  // Acessadas via window.__dashCtx que é setado pelo App antes de renderizar
  const ctx = window.__dashCtx || {};
  const totais     = ctx.totais     || { cartoes:0, fixos:0, variaveis:0, extras:0, total:0 };
  const saldo      = ctx.saldo      || { receitas:0, despesas:0, saldo:0, positivo:true };
  const cartoes    = ctx.cartoes    || [];
  const gastosFixos= ctx.gastosFixos|| [];
  const receitas   = ctx.receitas   || [];
  const mesAtual   = ctx.mesAtual   || 'jan';
  const anoAtual   = ctx.anoAtual   || new Date().getFullYear();
  const metaMensal = ctx.metaMensal || 0;
  const pagamentos = ctx.pagamentos || { percentual:0, qtdPago:0, qtdTotal:0 };
  const getStatusFarol = ctx.getStatusFarol || (() => 'PENDENTE');

  const MESES_NOMES = {
    jan:'Janeiro', fev:'Fevereiro', mar:'Março', abr:'Abril',
    mai:'Maio', jun:'Junho', jul:'Julho', ago:'Agosto',
    set:'Setembro', out:'Outubro', nov:'Novembro', dez:'Dezembro'
  };
  const mesNome = MESES_NOMES[mesAtual] || mesAtual;

  // Calcular pendentes
  const hoje = new Date().getDate();
  const pendentes = [
    ...cartoes.map(c => ({ nome: c.nome, venc: c.vencimento, status: getStatusFarol(c.nome, mesAtual) })),
    ...gastosFixos.map(g => ({ nome: g.descricao, venc: g.vencimento, status: getStatusFarol(g.descricao, mesAtual) }))
  ].filter(v => v.venc >= hoje && v.status === 'PENDENTE');

  const saldoColor  = saldo.positivo ? '#10b981' : '#ef4444';
  const progressoPct = metaMensal > 0 ? Math.min(100, totais.total / metaMensal * 100) : 0;
  const progressoColor = progressoPct < 70 ? '#10b981' : progressoPct < 90 ? '#f59e0b' : '#ef4444';

  const fmt = (v) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:0, maximumFractionDigits:0 });
  const fmtFull = (v) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

  // === ESTILOS ===
  const cardEscuro = (cor1, cor2, borda) => ({
    background: `linear-gradient(135deg, ${cor1} 0%, ${cor2} 100%)`,
    borderRadius: '16px',
    padding: '18px',
    border: `1px solid ${borda}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  });

  const cardClaro = {
    background: '#fff',
    borderRadius: '16px',
    padding: '18px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  };

  const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: '800',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '6px',
  };

  const valorGrandeStyle = {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#fff',
    lineHeight: 1.1,
    letterSpacing: '-0.5px',
  };

  const subStyle = {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '4px',
  };

  // === SEÇÃO 1: Cards KPI no topo ===
  const kpiCards = h('div', {
    style: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px', marginBottom:'16px' }
  },
    // Saldo do mês — card principal grande
    h('div', {
      style: {
        ...cardEscuro(saldo.positivo ? '#065f46' : '#7f1d1d', saldo.positivo ? '#047857' : '#991b1b', saldo.positivo ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'),
        gridColumn: 'span 2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
      }
    },
      h('div', null,
        h('div', { style: { ...labelStyle, marginBottom: '4px' } }, `💰 Saldo de ${mesNome}`),
        h('div', { style: { ...valorGrandeStyle, fontSize: '2.2rem' } },
          (saldo.positivo ? '+' : '-') + fmtFull(Math.abs(saldo.saldo))
        ),
        h('div', { style: subStyle },
          `Receitas ${fmtFull(saldo.receitas)} · Despesas ${fmtFull(saldo.despesas)}`
        )
      ),
      h('div', {
        style: {
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
        }
      }, saldo.positivo ? '📈' : '📉')
    ),

    // Total de Despesas
    h('div', { style: cardEscuro('#1e1b4b', '#312e81', 'rgba(99,102,241,0.3)') },
      h('div', { style: labelStyle }, '💸 Despesas'),
      h('div', { style: valorGrandeStyle }, fmt(totais.total)),
      h('div', { style: subStyle }, `${mesNome} · ${anoAtual}`)
    ),

    // Meta do mês
    h('div', { style: cardEscuro('#1c1917', '#292524', 'rgba(245,158,11,0.3)') },
      h('div', { style: labelStyle }, '🎯 Meta Mensal'),
      metaMensal > 0
        ? h('div', null,
            h('div', { style: { ...valorGrandeStyle, color: progressoColor } },
              progressoPct.toFixed(0) + '%'
            ),
            h('div', {
              style: {
                marginTop: '8px',
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }
            },
              h('div', {
                style: {
                  height: '100%',
                  width: progressoPct + '%',
                  background: progressoColor,
                  borderRadius: '2px',
                  transition: 'width 0.6s ease',
                }
              })
            ),
            h('div', { style: subStyle }, `${fmt(totais.total)} de ${fmt(metaMensal)}`)
          )
        : h('div', null,
            h('div', { style: { ...valorGrandeStyle, color: 'rgba(255,255,255,0.3)' } }, '—'),
            h('div', { style: subStyle }, 'Não definida')
          )
    )
  );

  // === SEÇÃO 2: Breakdown de despesas ===
  const categorias = [
    { label: '💳 Cartões', valor: totais.cartoes, cor: '#6366f1' },
    { label: '🏠 Fixos',   valor: totais.fixos,   cor: '#8b5cf6' },
    { label: '📊 Variáveis', valor: totais.variaveis, cor: '#a78bfa' },
    { label: '⚡ Extras',  valor: totais.extras || 0, cor: '#c4b5fd' },
  ].filter(c => c.valor > 0);

  const totalDespesas = categorias.reduce((s, c) => s + c.valor, 0) || 1;

  const breakdownCard = h('div', { style: cardClaro },
    h('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
      }
    },
      h('h3', { style: { fontSize: '0.85rem', fontWeight: '700', color: '#111827' } }, '📊 Composição das Despesas'),
      h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, mesNome + ' ' + anoAtual)
    ),

    // Barra de progresso empilhada
    h('div', {
      style: {
        height: '10px',
        borderRadius: '5px',
        overflow: 'hidden',
        display: 'flex',
        marginBottom: '14px',
        background: '#f3f4f6',
      }
    },
      ...categorias.map(c =>
        h('div', {
          key: c.label,
          style: {
            width: (c.valor / totalDespesas * 100) + '%',
            background: c.cor,
            transition: 'width 0.6s ease',
          }
        })
      )
    ),

    // Legenda
    h('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }
    },
      ...categorias.map(c =>
        h('div', {
          key: c.label,
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          h('div', {
            style: {
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: c.cor,
              flexShrink: 0,
            }
          }),
          h('div', null,
            h('div', { style: { fontSize: '0.72rem', color: '#374151', fontWeight: '600' } }, c.label),
            h('div', { style: { fontSize: '0.78rem', color: '#111827', fontWeight: '800' } }, fmt(c.valor)),
            h('div', { style: { fontSize: '0.65rem', color: '#9ca3af' } },
              (c.valor / totalDespesas * 100).toFixed(0) + '% do total'
            )
          )
        )
      )
    )
  );

  // === SEÇÃO 3: Status de pagamentos ===
  const pagamentosCard = h('div', {
    style: { ...cardClaro, display: 'flex', gap: '0', padding: '0', overflow: 'hidden' }
  },
    // Pago
    h('div', {
      style: {
        flex: 1,
        padding: '18px',
        borderRight: '1px solid #e5e7eb',
        textAlign: 'center',
      }
    },
      h('div', { style: { fontSize: '0.65rem', fontWeight: '800', color: '#6b7280', letterSpacing: '1px', marginBottom: '6px' } }, 'PAGOS'),
      h('div', { style: { fontSize: '1.8rem', fontWeight: '900', color: '#10b981', lineHeight: 1 } },
        pagamentos.qtdPago
      ),
      h('div', { style: { fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' } },
        `de ${pagamentos.qtdTotal} contas`
      ),
      h('div', {
        style: {
          marginTop: '8px',
          height: '3px',
          background: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden',
        }
      },
        h('div', {
          style: {
            height: '100%',
            width: pagamentos.percentual + '%',
            background: '#10b981',
            borderRadius: '2px',
          }
        })
      )
    ),

    // Pendentes
    h('div', {
      style: {
        flex: 1,
        padding: '18px',
        borderRight: '1px solid #e5e7eb',
        textAlign: 'center',
      }
    },
      h('div', { style: { fontSize: '0.65rem', fontWeight: '800', color: '#6b7280', letterSpacing: '1px', marginBottom: '6px' } }, 'PENDENTES'),
      h('div', { style: { fontSize: '1.8rem', fontWeight: '900', color: pendentes.length > 0 ? '#f59e0b' : '#d1d5db', lineHeight: 1 } },
        pendentes.length
      ),
      h('div', { style: { fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' } },
        pendentes.length > 0 ? 'a vencer' : 'em dia 👍'
      ),
      h('div', {
        style: {
          marginTop: '8px',
          height: '3px',
          background: '#e5e7eb',
          borderRadius: '2px',
        }
      })
    ),

    // % pago
    h('div', {
      style: { flex: 1, padding: '18px', textAlign: 'center' }
    },
      h('div', { style: { fontSize: '0.65rem', fontWeight: '800', color: '#6b7280', letterSpacing: '1px', marginBottom: '6px' } }, 'COMPLETADO'),
      h('div', { style: { fontSize: '1.8rem', fontWeight: '900', color: '#6366f1', lineHeight: 1 } },
        pagamentos.percentual.toFixed(0) + '%'
      ),
      h('div', { style: { fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' } }, 'do mês'),
      h('div', {
        style: {
          marginTop: '8px',
          height: '3px',
          background: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden',
        }
      },
        h('div', {
          style: {
            height: '100%',
            width: pagamentos.percentual + '%',
            background: '#6366f1',
            borderRadius: '2px',
          }
        })
      )
    )
  );

  // === SEÇÃO 4: Próximas contas a vencer ===
  const proximasContas = [
    ...cartoes.map(c => ({
      nome: c.nome,
      venc: c.vencimento,
      tipo: 'Cartão',
      status: getStatusFarol(c.nome, mesAtual),
      icone: '💳',
    })),
    ...gastosFixos.map(g => ({
      nome: g.descricao,
      venc: g.vencimento,
      tipo: 'Fixo',
      status: getStatusFarol(g.descricao, mesAtual),
      icone: '🏠',
    }))
  ]
    .filter(c => c.status === 'PENDENTE')
    .sort((a, b) => (a.venc || 31) - (b.venc || 31))
    .slice(0, 5);

  const contasCard = proximasContas.length > 0
    ? h('div', { style: cardClaro },
        h('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }
        },
          h('h3', { style: { fontSize: '0.85rem', fontWeight: '700', color: '#111827' } }, '⏰ Próximas a Vencer'),
          h('span', { style: { fontSize: '0.7rem', color: '#f59e0b', fontWeight: '600' } },
            proximasContas.length + ' pendente' + (proximasContas.length > 1 ? 's' : '')
          )
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          ...proximasContas.map((c, i) =>
            h('div', {
              key: i,
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#fafafa',
                borderRadius: '10px',
                border: '1px solid #f3f4f6',
              }
            },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                h('span', { style: { fontSize: '1.1rem' } }, c.icone),
                h('div', null,
                  h('div', { style: { fontSize: '0.82rem', fontWeight: '600', color: '#111827' } }, c.nome),
                  h('div', { style: { fontSize: '0.7rem', color: '#9ca3af' } }, c.tipo)
                )
              ),
              h('div', {
                style: {
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: c.venc && c.venc <= hoje + 3 ? '#ef4444' : '#f59e0b',
                  background: c.venc && c.venc <= hoje + 3 ? '#fef2f2' : '#fffbeb',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }
              }, `Dia ${c.venc || '?'}`)
            )
          )
        )
      )
    : null;

  // === LAYOUT FINAL ===
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    kpiCards,
    h('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: contasCard ? '1fr 1fr' : '1fr',
        gap: '16px',
      }
    },
      breakdownCard,
      contasCard
    ),
    pagamentosCard
  );
};
