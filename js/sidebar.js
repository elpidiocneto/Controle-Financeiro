// Sidebar - Menu lateral retrátil
window.Sidebar = function Sidebar({ telaAtiva, setTelaAtiva, mesAtual, setMesAtual, anoAtual, setAnoAtual, isUserAdmin }) {
  const [expandido, setExpandido] = React.useState(true);
  const [subMenu, setSubMenu] = React.useState(null);

  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const mesesNome = {jan:'Janeiro',fev:'Fevereiro',mar:'Março',abr:'Abril',mai:'Maio',jun:'Junho',jul:'Julho',ago:'Agosto',set:'Setembro',out:'Outubro',nov:'Novembro',dez:'Dezembro'};

  const navegar = (tela) => {
    setTelaAtiva(tela);
    setSubMenu(null);
  };

  const toggleSubMenu = (menu) => {
    setSubMenu(subMenu === menu ? null : menu);
  };

  const mudarMes = (direcao) => {
    const idx = meses.indexOf(mesAtual);
    if (direcao === 'prev') {
      if (idx === 0) {
        setMesAtual('dez');
        setAnoAtual(anoAtual - 1);
      } else {
        setMesAtual(meses[idx - 1]);
      }
    } else {
      if (idx === 11) {
        setMesAtual('jan');
        setAnoAtual(anoAtual + 1);
      } else {
        setMesAtual(meses[idx + 1]);
      }
    }
  };

  const itemStyle = (ativo) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: expandido ? '12px 16px' : '12px',
    margin: '4px 8px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: ativo ? 'rgba(16,185,129,0.1)' : 'transparent',
    borderLeft: ativo ? '3px solid #10b981' : '3px solid transparent',
    color: ativo ? '#10b981' : '#d1d5db',
    fontWeight: ativo ? '700' : '500',
    fontSize: '0.9rem',
    justifyContent: expandido ? 'flex-start' : 'center'
  });

  const subItemStyle = (ativo) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px 10px 40px',
    margin: '2px 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: ativo ? 'rgba(16,185,129,0.08)' : 'transparent',
    color: ativo ? '#10b981' : '#9ca3af',
    fontSize: '0.85rem',
    fontWeight: ativo ? '600' : '400'
  });

  const planAtivo = telaAtiva.startsWith('planejamento');
  const despAtivo = ['cartoes','fixos','variaveis','extras'].includes(telaAtiva);

  return React.createElement('div', {
    style: {
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: expandido ? '260px' : '72px',
      background: 'linear-gradient(180deg, #1e1b4b 0%, #1e3a8a 100%)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  },
    // Header
    React.createElement('div', {
      style: {
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    },
      expandido && React.createElement('div', {
        style: {
          color: '#fff',
          fontSize: '1.1rem',
          fontWeight: '800',
          letterSpacing: '0.5px'
        }
      }, '💰 Estratégia'),
      React.createElement('button', {
        onClick: () => setExpandido(!expandido),
        style: {
          width: '36px',
          height: '36px',
          border: 'none',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          transition: 'all 0.2s'
        },
        title: expandido ? 'Colapsar menu' : 'Expandir menu'
      }, expandido ? '◀' : '▶')
    ),

    // Seletor de mês
    React.createElement('div', {
      style: {
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }
    },
      React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: expandido ? 'space-between' : 'center'
        }
      },
        React.createElement('button', {
          onClick: () => mudarMes('prev'),
          style: {
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, '◀'),
        expandido && React.createElement('div', {
          style: {
            flex: 1,
            textAlign: 'center',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: '600'
          }
        }, mesesNome[mesAtual] + ' ' + anoAtual),
        !expandido && React.createElement('div', {
          style: {
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: '700',
            textAlign: 'center',
            width: '40px'
          }
        }, mesAtual.toUpperCase()),
        React.createElement('button', {
          onClick: () => mudarMes('next'),
          style: {
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, '▶')
      )
    ),

    // Menu items
    React.createElement('div', {
      style: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 0',
        scrollbarWidth: 'thin'
      }
    },
      // Dashboard
      React.createElement('div', {
        onClick: () => navegar('dashboard'),
        style: itemStyle(telaAtiva === 'dashboard'),
        onMouseEnter: e => { if (telaAtiva !== 'dashboard') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
        onMouseLeave: e => { if (telaAtiva !== 'dashboard') e.currentTarget.style.background = 'transparent'; }
      },
        React.createElement('span', { style: { fontSize: '1.3rem' } }, '📊'),
        expandido && React.createElement('span', null, 'Dashboard')
      ),

      // Admin
      isUserAdmin && React.createElement('div', {
        onClick: () => navegar('admin'),
        style: itemStyle(telaAtiva === 'admin'),
        onMouseEnter: e => { if (telaAtiva !== 'admin') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
        onMouseLeave: e => { if (telaAtiva !== 'admin') e.currentTarget.style.background = 'transparent'; }
      },
        React.createElement('span', { style: { fontSize: '1.3rem' } }, '👑'),
        expandido && React.createElement('span', null, 'Admin')
      ),

      // Planejar
      React.createElement('div', null,
        React.createElement('div', {
          onClick: () => expandido ? toggleSubMenu('plan') : navegar('planejamento'),
          style: itemStyle(planAtivo),
          onMouseEnter: e => { if (!planAtivo) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
          onMouseLeave: e => { if (!planAtivo) e.currentTarget.style.background = 'transparent'; }
        },
          React.createElement('span', { style: { fontSize: '1.3rem' } }, '📋'),
          expandido && React.createElement('span', { style: { flex: 1 } }, 'Planejar'),
          expandido && React.createElement('span', { style: { fontSize: '0.8rem', transition: 'transform 0.2s', transform: subMenu === 'plan' ? 'rotate(90deg)' : 'rotate(0)' } }, '▶')
        ),
        expandido && subMenu === 'plan' && React.createElement('div', { style: { marginTop: '4px' } },
          React.createElement('div', {
            onClick: () => navegar('planejamento'),
            style: subItemStyle(telaAtiva === 'planejamento' || telaAtiva === 'planejamento-timeline'),
            onMouseEnter: e => { if (!['planejamento','planejamento-timeline'].includes(telaAtiva)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (!['planejamento','planejamento-timeline'].includes(telaAtiva)) e.currentTarget.style.background = 'transparent'; }
          }, '🏥 Diagnóstico'),
          React.createElement('div', {
            onClick: () => navegar('planejamento-orcamento'),
            style: subItemStyle(telaAtiva === 'planejamento-orcamento' || telaAtiva === 'planejamento-premes'),
            onMouseEnter: e => { if (!['planejamento-orcamento','planejamento-premes'].includes(telaAtiva)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (!['planejamento-orcamento','planejamento-premes'].includes(telaAtiva)) e.currentTarget.style.background = 'transparent'; }
          }, '📊 Orçamento'),
          React.createElement('div', {
            onClick: () => navegar('planejamento-metas'),
            style: subItemStyle(telaAtiva === 'planejamento-metas' || telaAtiva === 'planejamento-dividas'),
            onMouseEnter: e => { if (!['planejamento-metas','planejamento-dividas'].includes(telaAtiva)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (!['planejamento-metas','planejamento-dividas'].includes(telaAtiva)) e.currentTarget.style.background = 'transparent'; }
          }, '🎯 Metas'),
          React.createElement('div', {
            onClick: () => navegar('planejamento-compra'),
            style: subItemStyle(telaAtiva === 'planejamento-compra' || telaAtiva === 'planejamento-simulador'),
            onMouseEnter: e => { if (!['planejamento-compra','planejamento-simulador'].includes(telaAtiva)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (!['planejamento-compra','planejamento-simulador'].includes(telaAtiva)) e.currentTarget.style.background = 'transparent'; }
          }, '🎲 Simulações')
        )
      ),

      // Receitas
      React.createElement('div', {
        onClick: () => navegar('receitas'),
        style: itemStyle(telaAtiva === 'receitas'),
        onMouseEnter: e => { if (telaAtiva !== 'receitas') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
        onMouseLeave: e => { if (telaAtiva !== 'receitas') e.currentTarget.style.background = 'transparent'; }
      },
        React.createElement('span', { style: { fontSize: '1.3rem' } }, '💰'),
        expandido && React.createElement('span', null, 'Receitas')
      ),

      // Despesas
      React.createElement('div', null,
        React.createElement('div', {
          onClick: () => expandido ? toggleSubMenu('desp') : navegar('cartoes'),
          style: itemStyle(despAtivo),
          onMouseEnter: e => { if (!despAtivo) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
          onMouseLeave: e => { if (!despAtivo) e.currentTarget.style.background = 'transparent'; }
        },
          React.createElement('span', { style: { fontSize: '1.3rem' } }, '💸'),
          expandido && React.createElement('span', { style: { flex: 1 } }, 'Despesas'),
          expandido && React.createElement('span', { style: { fontSize: '0.8rem', transition: 'transform 0.2s', transform: subMenu === 'desp' ? 'rotate(90deg)' : 'rotate(0)' } }, '▶')
        ),
        expandido && subMenu === 'desp' && React.createElement('div', { style: { marginTop: '4px' } },
          React.createElement('div', {
            onClick: () => navegar('cartoes'),
            style: subItemStyle(telaAtiva === 'cartoes'),
            onMouseEnter: e => { if (telaAtiva !== 'cartoes') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (telaAtiva !== 'cartoes') e.currentTarget.style.background = 'transparent'; }
          }, '💳 Cartões'),
          React.createElement('div', {
            onClick: () => navegar('fixos'),
            style: subItemStyle(telaAtiva === 'fixos'),
            onMouseEnter: e => { if (telaAtiva !== 'fixos') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (telaAtiva !== 'fixos') e.currentTarget.style.background = 'transparent'; }
          }, '🏠 Gastos Fixos'),
          React.createElement('div', {
            onClick: () => navegar('variaveis'),
            style: subItemStyle(telaAtiva === 'variaveis'),
            onMouseEnter: e => { if (telaAtiva !== 'variaveis') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (telaAtiva !== 'variaveis') e.currentTarget.style.background = 'transparent'; }
          }, '📊 Gastos Variáveis'),
          React.createElement('div', {
            onClick: () => navegar('extras'),
            style: subItemStyle(telaAtiva === 'extras'),
            onMouseEnter: e => { if (telaAtiva !== 'extras') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: e => { if (telaAtiva !== 'extras') e.currentTarget.style.background = 'transparent'; }
          }, '⚡ Gastos Extras')
        )
      ),

      // Farol
      React.createElement('div', {
        onClick: () => navegar('farol'),
        style: itemStyle(telaAtiva === 'farol'),
        onMouseEnter: e => { if (telaAtiva !== 'farol') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
        onMouseLeave: e => { if (telaAtiva !== 'farol') e.currentTarget.style.background = 'transparent'; }
      },
        React.createElement('span', { style: { fontSize: '1.3rem' } }, '🚦'),
        expandido && React.createElement('span', null, 'Farol')
      )
    ),

    // Footer
    React.createElement('div', {
      style: {
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.7rem',
        textAlign: 'center'
      }
    }, expandido ? 'Estratégia Finanças v2.0' : 'v2.0')
  );
};
