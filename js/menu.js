// MenuNavegacao - dropdown com position:fixed para não ser bloqueado por nada
window.MenuNavegacao = function MenuNavegacao({ telaAtiva, setTelaAtiva, isUserAdmin }) {
    const [sub, setSub] = React.useState(null);
    const [pos, setPos] = React.useState({top:0, left:0});
    const planRef = React.useRef(null);
    const despRef = React.useRef(null);

    const navegar = (tela) => { setTelaAtiva(tela); setSub(null); };

    const abrir = (nome, ref) => {
        if (sub === nome) { setSub(null); return; }
        if (ref && ref.current) {
            const r = ref.current.getBoundingClientRect();
            setPos({ top: r.bottom + 4, left: r.left });
        }
        setSub(nome);
    };

    React.useEffect(() => {
        if (!sub) return;
        const fechar = () => setSub(null);
        const timer = setTimeout(() => document.addEventListener('click', fechar, {once:true}), 10);
        return () => { clearTimeout(timer); document.removeEventListener('click', fechar); };
    }, [sub]);

    const planAtivo = telaAtiva && telaAtiva.startsWith('planejamento');
    const despAtivo = ['cartoes','fixos','variaveis','extras'].includes(telaAtiva);

    const corBtn   = (ativo) => ativo ? '#fff' : 'rgba(255,255,255,0.7)';
    const bordaBtn = (ativo) => ativo ? '2px solid #10b981' : '2px solid transparent';
    const btnStyle = (ativo) => ({
        padding:'7px 14px', border:'none', cursor:'pointer', borderRadius:'8px',
        fontSize:'0.82rem', fontWeight:'600', whiteSpace:'nowrap',
        background:'transparent', color:corBtn(ativo), borderBottom:bordaBtn(ativo),
        transition:'all 0.15s'
    });
    const btnDropStyle = (ativo, aberto) => ({
        ...btnStyle(ativo),
        background: aberto ? 'rgba(255,255,255,0.12)' : 'transparent',
    });
    const dropStyle = {
        position:'fixed', zIndex:99999,
        top: pos.top + 'px', left: pos.left + 'px',
        background:'#1e1b4b', borderRadius:'10px', minWidth:'200px',
        boxShadow:'0 16px 48px rgba(0,0,0,0.8)',
        border:'1px solid rgba(99,102,241,0.5)', overflow:'hidden',
    };
    const itemStyle = (ativo) => ({
        padding:'11px 16px', cursor:'pointer', fontSize:'0.83rem',
        color: ativo ? '#10b981' : 'rgba(255,255,255,0.9)',
        fontWeight: ativo ? '700' : '400',
        borderLeft: ativo ? '3px solid #10b981' : '3px solid transparent',
        background: ativo ? 'rgba(16,185,129,0.1)' : 'transparent',
        transition:'background 0.1s',
    });
    // Separador visual entre grupos
    const separador = { borderTop:'1px solid rgba(255,255,255,0.1)', margin:'4px 0' };

    const h = React.createElement;

    // Quais rotas pertencem a cada grupo
    const isSimulacoes = ['planejamento-compra','planejamento-simulador','planejamento-aposentadoria','planejamento-quitacao'].includes(telaAtiva);
    const isOrcamento  = ['planejamento-orcamento','planejamento-premes'].includes(telaAtiva);
    const isMetas      = ['planejamento-metas','planejamento-dividas'].includes(telaAtiva);

    return h('div', {style:{display:'flex', alignItems:'center', gap:'2px', overflowX:'auto', scrollbarWidth:'none'}},

        h('button', {onClick:()=>navegar('dashboard'), style:btnStyle(telaAtiva==='dashboard')}, '📊 Dashboard'),

        isUserAdmin && h('button', {onClick:()=>navegar('admin'), style:btnStyle(telaAtiva==='admin')}, '👑 Admin'),

        // ── Planejar ▾
        h('div', {style:{position:'relative', flexShrink:0}},
            h('button', {
                ref: planRef,
                onClick: (e) => { e.stopPropagation(); abrir('plan', planRef); },
                style: btnDropStyle(planAtivo, sub==='plan')
            }, '📋 Planejar ▾')
        ),

        h('button', {onClick:()=>navegar('receitas'), style:btnStyle(telaAtiva==='receitas')}, '💰 Receitas'),

        // ── Despesas ▾
        h('div', {style:{position:'relative', flexShrink:0}},
            h('button', {
                ref: despRef,
                onClick: (e) => { e.stopPropagation(); abrir('desp', despRef); },
                style: btnDropStyle(despAtivo, sub==='desp')
            }, '💸 Despesas ▾')
        ),

        h('button', {onClick:()=>navegar('farol'), style:btnStyle(telaAtiva==='farol')}, '🚦 Farol'),

        // ── Dropdown Planejar (4 itens)
        sub === 'plan' && h('div', {onClick: e=>e.stopPropagation(), style:dropStyle},
            h('div', {onClick:()=>navegar('planejamento'),         style:itemStyle(telaAtiva==='planejamento' || telaAtiva==='planejamento-timeline')},         '🏥 Diagnóstico'),
            h('div', {style:separador}),
            h('div', {onClick:()=>navegar('planejamento-orcamento'), style:itemStyle(isOrcamento)},                      '📊 Orçamento'),
            h('div', {style:separador}),
            h('div', {onClick:()=>navegar('planejamento-metas'),    style:itemStyle(isMetas)},                           '🎯 Metas'),
            h('div', {style:separador}),
            h('div', {onClick:()=>navegar('planejamento-compra'),   style:itemStyle(isSimulacoes)},                      '🎲 Simulações')
        ),

        // ── Dropdown Despesas (4 itens)
        sub === 'desp' && h('div', {onClick: e=>e.stopPropagation(), style:dropStyle},
            h('div', {onClick:()=>navegar('cartoes'),   style:itemStyle(telaAtiva==='cartoes')},   '💳 Cartões'),
            h('div', {onClick:()=>navegar('fixos'),     style:itemStyle(telaAtiva==='fixos')},     '🏠 Gastos Fixos'),
            h('div', {onClick:()=>navegar('variaveis'), style:itemStyle(telaAtiva==='variaveis')}, '📊 Gastos Variáveis'),
            h('div', {onClick:()=>navegar('extras'),    style:itemStyle(telaAtiva==='extras')},    '⚡ Gastos Extras')
        )
    );
};
