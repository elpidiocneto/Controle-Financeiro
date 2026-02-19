// Sidebar v2 - Menu lateral retrátil com calendário
window.Sidebar = function Sidebar({ telaAtiva, setTelaAtiva, mesAtual, setMesAtual, anoAtual, setAnoAtual, isUserAdmin, onExpandChange }) {
  const [expandido, setExpandido] = React.useState(true);
  const [subMenu, setSubMenu] = React.useState(null);
  const [mostrarCalendario, setMostrarCalendario] = React.useState(false);

  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const mesesNome = {jan:'Janeiro',fev:'Fevereiro',mar:'Março',abr:'Abril',mai:'Maio',jun:'Junho',jul:'Julho',ago:'Agosto',set:'Setembro',out:'Outubro',nov:'Novembro',dez:'Dezembro'};

  const toggleExpandido = () => {
    const novoEstado = !expandido;
    setExpandido(novoEstado);
    if (onExpandChange) onExpandChange(novoEstado);
  };

  const navegar = (tela) => {
    setTelaAtiva(tela);
    setSubMenu(null);
  };

  const toggleSubMenu = (menu) => {
    setSubMenu(subMenu === menu ? null : menu);
  };

  const selecionarMes = (mes) => {
    setMesAtual(mes);
    setMostrarCalendario(false);
  };

  const mudarAno = (direcao) => {
    setAnoAtual(anoAtual + (direcao === 'next' ? 1 : -1));
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
      }, React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      },
        React.createElement('img', {
          src: window.LOGO_B64,
          alt: 'Estratégia',
          style: {
            height: '28px',
            width: 'auto',
            objectFit: 'contain'
          }
        })
      )),
      React.createElement('button', {
        onClick: toggleExpandido,
        style: {
          width: '36px',
          height: '36px',
          border: 'none',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          transition: 'all 0.2s',
          overflow: 'hidden'
        },
        title: expandido ? 'Colapsar menu' : 'Expandir menu'
      }, expandido ? 
        React.createElement('span', {style: {color: '#fff'}}, '◀') :
        React.createElement('img', {
          src: window.AGUIA_B64 || window.LOGO_B64,
          alt: 'Menu',
          style: {
            height: '24px',
            width: '24px',
            objectFit: 'contain'
          }
        })
      )
    ),

    // Calendário de meses
    React.createElement('div', {
      style: {
        padding: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }
    },
      // Botão principal
      React.createElement('button', {
        onClick: () => expandido && setMostrarCalendario(!mostrarCalendario),
        style: {
          width: '100%',
          padding: expandido ? '12px' : '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          cursor: expandido ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }
      },
        React.createElement('div', {
          style: {
            fontSize: expandido ? '0.7rem' : '0.6rem',
            opacity: 0.7,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        }, expandido ? (mostrarCalendario ? '🗓️ Fechar' : '🗓️ Selecionar mês') : '🗓️'),
        React.createElement('div', {
          style: {
            fontSize: expandido ? '0.95rem' : '0.65rem',
            fontWeight: '700'
          }
        }, expandido ? mesesNome[mesAtual] : mesAtual.toUpperCase().slice(0,3)),
        React.createElement('div', {
          style: {
            fontSize: expandido ? '0.75rem' : '0.6rem',
            opacity: 0.8
          }
        }, anoAtual)
      ),

      // Dropdown calendário
      expandido && mostrarCalendario && React.createElement('div', {
        style: {
          position: 'absolute',
          top: '100%',
          left: '12px',
          right: '12px',
          marginTop: '8px',
          background: '#1e1b4b',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100
        }
      },
        // Seletor de ano
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }
        },
          React.createElement('button', {
            onClick: () => mudarAno('prev'),
            style: {
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem'
            }
          }, '◀'),
          React.createElement('div', {
            style: {
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '700'
            }
          }, anoAtual),
          React.createElement('button', {
            onClick: () => mudarAno('next'),
            style: {
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem'
            }
          }, '▶')
        ),
        // Grid de meses
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px'
          }
        },
          ...meses.map(mes =>
            React.createElement('button', {
              key: mes,
              onClick: () => selecionarMes(mes),
              style: {
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mes === mesAtual ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                color: mes === mesAtual ? '#10b981' : '#d1d5db',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: mes === mesAtual ? '700' : '500',
                transition: 'all 0.2s',
                border: mes === mesAtual ? '1px solid #10b981' : '1px solid transparent'
              },
              onMouseEnter: e => {
                if (mes !== mesAtual) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              },
              onMouseLeave: e => {
                if (mes !== mesAtual) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }
            }, mesesNome[mes].slice(0, 3))
          )
        )
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
