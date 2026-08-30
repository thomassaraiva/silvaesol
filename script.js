// --- SCRIPT GLOBAL DA LOJA SILVA E SOL ---

const STORAGE_PRODUTOS = 'produtos_silva_sol';
const STORAGE_CARRINHO = 'carrinho_silva_sol';

function getProdutosDaLoja() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_PRODUTOS)) || [];
    } catch (e) {
        return [];
    }
}

// Renderiza as categorias na Página Inicial (index.html)
function renderizarProdutosHome() {
    const containerHome = document.getElementById('produtos-destaque');
    if (!containerHome) return;

    const produtos = getProdutosDaLoja();
    
    if (produtos.length === 0) {
        containerHome.innerHTML = '<div style="padding: 3rem; text-align: center; color: #fff;"><h2>Nenhum produto cadastrado ainda.</h2><p>Acesse o Painel Admin para adicionar peças!</p></div>';
        return;
    }

    const categoriasDesejadas = ['Promoções', 'Sungas', 'Regatas', 'Bolsas', 'Kimono', 'Kits'];
    let htmlConteudo = '';

    categoriasDesejadas.forEach(cat => {
        const produtosDaCat = produtos.filter(p => {
            const catProd = (p.categoria || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const catAlvo = cat.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return catProd === catAlvo;
        });

        if (produtosDaCat.length > 0) {
            htmlConteudo += `
                <div class="category-section-block" style="margin-bottom: 2.5rem;">
                    <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 class="section-title" style="font-size: 1.4rem; font-weight: 800; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                            <i class="fa-solid fa-fire" style="color: var(--sol-orange); margin-right: 6px;"></i> ${cat}
                        </h2>
                        <a href="produtos.html?cat=${cat}" style="color: #fff; font-size: 0.85rem; font-weight: 700; text-decoration: none; background: rgba(0,0,0,0.2); padding: 4px 12px; border-radius: 20px;">Ver Todos &rarr;</a>
                    </div>
                    <div class="products-grid">
                        ${produtosDaCat.map(p => {
                            const fotos = p.fotos || [p.img];
                            return `
                                <div class="product-card">
                                    <a href="produtos.html?id=${p.id}" class="product-img-link">
                                        <span class="product-badge">${p.categoria}</span>
                                        <img src="${fotos[0] || 'logo.jpg.jpg'}" alt="${p.nome}">
                                    </a>
                                    <div class="product-details">
                                        <a href="produtos.html?id=${p.id}" class="product-title-link">${p.nome}</a>
                                        <div class="product-price">R$ ${parseFloat(p.preco || 0).toFixed(2)}</div>
                                        <button class="btn-add-cart" onclick="adicionarDiretoCarrinho('${p.id}')">
                                            <i class="fa-solid fa-bag-shopping"></i> Ver Detalhes
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    });

    containerHome.innerHTML = htmlConteudo || '<p style="color:#fff; text-align:center; padding:2rem;">Nenhum produto cadastrado nas categorias principais.</p>';
}

function renderizarProdutosPaginaProdutos() {
    const gridProdutos = document.getElementById('todos-os-produtos-grid');
    if (!gridProdutos) return;

    const produtos = getProdutosDaLoja();
    const params = new URLSearchParams(window.location.search);
    const catFiltro = params.get('cat');

    let produtosFiltrados = produtos;
    if (catFiltro) {
        produtosFiltrados = produtos.filter(p => (p.categoria || '').toLowerCase().replace(/\s+/g, '') === catFiltro.toLowerCase().replace(/\s+/g, ''));
    }

    if (produtosFiltrados.length === 0) {
        gridProdutos.innerHTML = '<p style="color: #fff; grid-column: span 4; text-align: center; padding: 3rem;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    gridProdutos.innerHTML = produtosFiltrados.map(p => {
        const fotos = p.fotos || [p.img];
        return `
            <div class="product-card">
                <a href="produtos.html?id=${p.id}" class="product-img-link">
                    <span class="product-badge">${p.categoria || 'Peça'}</span>
                    <img src="${fotos[0] || 'logo.jpg.jpg'}" alt="${p.nome}">
                </a>
                <div class="product-details">
                    <a href="produtos.html?id=${p.id}" class="product-title-link">${p.nome}</a>
                    <div class="product-price">R$ ${parseFloat(p.preco || 0).toFixed(2)}</div>
                    <a href="produtos.html?id=${p.id}" class="btn-add-cart" style="text-decoration: none; text-align: center;">
                        <i class="fa-solid fa-eye"></i> Ver Opções
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// --- CARRINHO ---
let carrinho = JSON.parse(localStorage.getItem(STORAGE_CARRINHO)) || [];

function salvarCarrinho() {
    localStorage.setItem(STORAGE_CARRINHO, JSON.stringify(carrinho));
    atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItens = carrinho.reduce((sum, item) => sum + item.qtd, 0);
        badge.innerText = totalItens;
    }
}

function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.toggle('active');
        renderizarCarrinhoModal();
    }
}

function adicionarAoCarrinhoComOpcoes(id, nome, preco, img, modelo, tamanho, cor) {
    const itemExistente = carrinho.find(item => item.id == id && item.modelo === modelo && item.tamanho === tamanho && item.cor === cor);
    if (itemExistente) {
        itemExistente.qtd += 1;
    } else {
        carrinho.push({ id, nome, preco, img, modelo, tamanho, cor, qtd: 1 });
    }
    salvarCarrinho();
    toggleCartModal();
}

function adicionarDiretoCarrinho(id) {
    window.location.href = `produtos.html?id=${id}`;
}

function renderizarCarrinhoModal() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-value');
    if (!container || !totalEl) return;

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#555; margin-top:2rem;">Sua sacola está vazia.</p>';
        totalEl.innerText = 'R$ 0,00';
        return;
    }

    let totalGeral = 0;
    container.innerHTML = carrinho.map((item, index) => {
        const subtotal = item.preco * item.qtd;
        totalGeral += subtotal;
        return `
            <div class="cart-item">
                <img src="${item.img}" class="cart-item-img" alt="${item.nome}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-variations">Mod: ${item.modelo} | Tam: ${item.tamanho} | Cor: ${item.cor}</div>
                    <div class="cart-item-price">R$ ${subtotal.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="alterarQtd(${index}, -1)">-</button>
                        <span>${item.qtd}</span>
                        <button class="qty-btn" onclick="alterarQtd(${index}, 1)">+</button>
                        <button class="btn-remove-item" onclick="removerItem(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    totalEl.innerText = `R$ ${totalGeral.toFixed(2)}`;
}

function alterarQtd(index, delta) {
    carrinho[index].qtd += delta;
    if (carrinho[index].qtd <= 0) carrinho.splice(index, 1);
    salvarCarrinho();
    renderizarCarrinhoModal();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    renderizarCarrinhoModal();
}

function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        alert('Sua sacola está vazia!');
        return;
    }

    let mensagem = "Olá! Gostaria de fazer o seguinte pedido na *Silva e Sol*:\n\n";
    let total = 0;

    carrinho.forEach(item => {
        const sub = item.preco * item.qtd;
        total += sub;
        mensagem += `▪️ *${item.nome}*\n   Qtd: ${item.qtd} | Tam: ${item.tamanho} | Mod: ${item.modelo} | Cor: ${item.cor}\n   Subtotal: R$ ${sub.toFixed(2)}\n\n`;
    });

    mensagem += `*Total do Pedido: R$ ${total.toFixed(2)}*\n\nComo procedemos com o pagamento e envio?`;

    const telefone = "5581999999999"; 
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

window.addEventListener('DOMContentLoaded', () => {
    atualizarContadorCarrinho();
    renderizarProdutosHome();
    renderizarProdutosPaginaProdutos();
});