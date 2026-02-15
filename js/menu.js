// Componente MenuNavegacao - arquivo separado para garantir transpilação correta
window.MenuNavegacao = function MenuNavegacao({ telaAtiva, setTelaAtiva, isUserAdmin }) {
    const [sub, setSub] = React.useState(null);

    const navegar = (tela) => { setTelaAtiva(tela); setSub(null); };

    const planAtivo = telaAtiva && telaAtiva.startsWith('planejamento');
    const despAtivo = ['cartoes','fixos','variaveis','extras'].includes(telaAtiva);

    const btnBase = {
        padding:'6px 14px', border:'none', cursor:'pointer',
        borderRadius:'8px', fontSize:'0.8rem', fontWeight:'600',
        whiteSpace:'nowrap', background:'transparent',
    };
    const dropdown = {
        position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:9999,
        background:'#1e1b4b', borderRadius:'10px', minWidth:'190px',
        boxShadow:'0 12px 40px rgba(0,0,0,0.7)',
        border:'1px solid rgba(99,102,241,0.4)', overflow:'hidden',
    };
    const item = (ativo) => ({
        padding:'10px 16px', cursor:'pointer', fontSize:'0.82rem',
        color: ativo ? '#10b981' : 'rgba(255,255,255,0.85)',
        fontWeight: ativo ? '700' : '500',
        borderLeft: ativo ? '3px solid #10b981' : '3px solid transparent',
        background: ativo ? 'rgba(16,185,129,0.08)' : 'transparent',
    });
    const cor = (ativo) => ativo ? '#fff' : 'rgba(255,255,255,0.65)';
    const borda = (ativo) => ativo ? '2px solid #10b981' : '2px solid transparent';

    return React.createElement('div',
        { style:{display:'flex', alignItems:'center', gap:'2px', overflowX:'auto', scrollbarWidth:'none'} },

        // Dashboard
        React.createElement('button', {
            onClick: () => navegar('dashboard'),
            style: {...btnBase, color:cor(telaAtiva==='dashboard'), borderBottom:borda(telaAtiva==='dashboard')}
        }, '📊 Dashboard'),

        // Admin
        isUserAdmin && React.createElement('button', {
            onClick: () => navegar('admin'),
            style: {...btnBase, color:cor(telaAtiva==='admin'), borderBottom:borda(telaAtiva==='admin')}
        }, '👑 Admin'),

        // Planejar dropdown
        React.createElement('div', { style:{position:'relative', flexShrink:0} },
            React.createElement('button', {
                onClick: () => setSub(sub === 'plan' ? null : 'plan'),
                style: {...btnBase,
                    background: sub==='plan' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: cor(planAtivo), borderBottom: borda(planAtivo)
                }
            }, '📋 Planejar ▾'),
            sub === 'plan' && React.createElement('div', { style:dropdown },
                React.createElement('div', {onClick: ()=>navegar('planejamento'), style:item(telaAtiva==='planejamento')}, '🏥 Diagnóstico'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-orcamento'), style:item(telaAtiva==='planejamento-orcamento')}, '📊 Orçamento'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-premes'), style:item(telaAtiva==='planejamento-premes')}, '📝 Pré-Mês'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-metas'), style:item(telaAtiva==='planejamento-metas')}, '🎯 Metas'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-dividas'), style:item(telaAtiva==='planejamento-dividas')}, '💳 Dívidas'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-compra'), style:item(telaAtiva==='planejamento-compra')}, '🛒 Simul. Compra'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-simulador'), style:item(telaAtiva==='planejamento-simulador')}, '🎲 Simulador'),
                React.createElement('div', {onClick: ()=>navegar('planejamento-timeline'), style:item(telaAtiva==='planejamento-timeline')}, '📈 Timeline')
            )
        ),

        // Receitas
        React.createElement('button', {
            onClick: () => navegar('receitas'),
            style: {...btnBase, color:cor(telaAtiva==='receitas'), borderBottom:borda(telaAtiva==='receitas')}
        }, '💰 Receitas'),

        // Despesas dropdown
        React.createElement('div', { style:{position:'relative', flexShrink:0} },
            React.createElement('button', {
                onClick: () => setSub(sub === 'desp' ? null : 'desp'),
                style: {...btnBase,
                    background: sub==='desp' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: cor(despAtivo), borderBottom: borda(despAtivo)
                }
            }, '💸 Despesas ▾'),
            sub === 'desp' && React.createElement('div', { style:dropdown },
                React.createElement('div', {onClick: ()=>navegar('cartoes'), style:item(telaAtiva==='cartoes')}, '💳 Cartões'),
                React.createElement('div', {onClick: ()=>navegar('fixos'), style:item(telaAtiva==='fixos')}, '🏠 Gastos Fixos'),
                React.createElement('div', {onClick: ()=>navegar('variaveis'), style:item(telaAtiva==='variaveis')}, '📊 Gastos Variáveis'),
                React.createElement('div', {onClick: ()=>navegar('extras'), style:item(telaAtiva==='extras')}, '⚡ Gastos Extras')
            )
        ),

        // Farol
        React.createElement('button', {
            onClick: () => navegar('farol'),
            style: {...btnBase, color:cor(telaAtiva==='farol'), borderBottom:borda(telaAtiva==='farol')}
        }, '🚦 Farol')
    );
};
