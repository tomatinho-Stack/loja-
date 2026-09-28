/* script.js — controla a loja: trocar de página, filtrar produtos,
   carrinho e finalizar compra. */

// ---------- dados ----------
const produtos = [
  { id: 1, name: "Camiseta Oversized GRAFFITI", category: "Camisetas", price: 129.9,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&h=850&fit=crop", sizes: ["P", "M", "G", "GG"] },
  { id: 2, name: "Hoodie Street NO SIGNAL", category: "Hoodies", price: 249.9,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&h=850&fit=crop", sizes: ["P", "M", "G", "GG"] },
  { id: 3, name: "Calça Cargo Urban Black", category: "Calças", price: 219.9,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&h=850&fit=crop", sizes: ["36", "38", "40", "42", "44"] },
  { id: 4, name: "Jaqueta Corta-Vento NIGHT", category: "Jaquetas", price: 279.9,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=700&h=850&fit=crop", sizes: ["P", "M", "G", "GG"] },
  { id: 5, name: "Camiseta Boxy DROP 02", category: "Camisetas", price: 139.9,
    image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?w=700&h=850&fit=crop", sizes: ["P", "M", "G", "GG"] },
  { id: 6, name: "Hoodie Oversized AFTER DARK", category: "Hoodies", price: 269.9,
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=700&h=850&fit=crop", sizes: ["P", "M", "G", "GG"] },
  { id: 7, name: "Calça Cargo Cinza GRAFF", category: "Calças", price: 229.9,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=700&h=850&fit=crop", sizes: ["36", "38", "40", "42", "44"] },
  { id: 8, name: "Boné 5-Panel STREET", category: "Acessórios", price: 89.9,
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=700&h=850&fit=crop", sizes: ["ÚNICO"] }
];

// ---------- estado ----------
let pagina = "loja";          // "loja" ou "carrinho"
let carrinho = [];            // { produto, tamanho, quantidade }
let tamanhoEscolhido = {};    // { idDoProduto: "M" }
let categoria = "Todos";
let pedidoFinalizado = false;

const precoFmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------- elementos da página ----------
const el = (id) => document.getElementById(id);
const paginaLoja = el("storePage");
const paginaCarrinho = el("cartPage");
const gradeProdutos = el("productGrid");
const botoesCategorias = el("categoryButtons");
const bolinhaCarrinho = el("cartBadge");
const telaConfirmacao = el("orderConfirmation");
const conteudoCarrinho = el("cartContent");
const carrinhoVazioMsg = el("emptyCartMsg");
const listaCarrinho = el("cartItemsList");
const listaResumo = el("summaryItems");
const resumoSubtotal = el("summarySubtotal");
const resumoFrete = el("summaryFrete");
const dicaFrete = el("freteHint");
const resumoTotal = el("summaryTotal");
const botaoFinalizar = el("finalizeBtn");
const formularioEntrega = el("checkoutForm");
const opcoesPagamento = el("paymentOptions");

// ---------- carrinho ----------
function adicionarAoCarrinho(produto) {
  const tamanho = tamanhoEscolhido[produto.id] || produto.sizes[0];
  const item = carrinho.find((i) => i.produto.id === produto.id && i.tamanho === tamanho);

  if (item) item.quantidade++;
  else carrinho.push({ produto, tamanho, quantidade: 1 });

  atualizar();
}

function alterarQuantidade(idProduto, tamanho, diferenca) {
  const item = carrinho.find((i) => i.produto.id === idProduto && i.tamanho === tamanho);
  if (!item) return;

  item.quantidade += diferenca;
  carrinho = carrinho.filter((i) => i.quantidade > 0);
  atualizar();
}

function calcularTotais() {
  const subtotal = carrinho.reduce((soma, i) => soma + i.produto.price * i.quantidade, 0);
  const frete = subtotal === 0 ? 0 : subtotal >= 399 ? 0 : 19.9;
  const totalItens = carrinho.reduce((soma, i) => soma + i.quantidade, 0);
  return { subtotal, frete, total: subtotal + frete, totalItens };
}

// ---------- navegação ----------
function irParaLoja() {
  pagina = "loja";
  pedidoFinalizado = false;
  atualizar();
}

function irParaCarrinho() {
  pagina = "carrinho";
  atualizar();
}

function escolherCategoria(cat) {
  categoria = cat;
  pagina = "loja";
  atualizar();
}

// ---------- desenhar página da loja ----------
function desenharLoja() {
  botoesCategorias.querySelectorAll(".chip").forEach((botao) => {
    botao.classList.toggle("is-active", botao.dataset.category === categoria);
  });

  const lista = categoria === "Todos" ? produtos : produtos.filter((p) => p.category === categoria);

  gradeProdutos.innerHTML = lista.map((p) => {
    const tamanho = tamanhoEscolhido[p.id] || p.sizes[0];
    const botoesTamanho = p.sizes
      .map((s) => `<button type="button" class="size-btn ${s === tamanho ? "is-active" : ""}" data-id="${p.id}" data-size="${s}">${s}</button>`)
      .join("");

    return `
      <div class="card" data-id="${p.id}">
        <div class="card__image-wrap">
          <img src="${p.image}" alt="${p.name}" />
          <div class="card__tag"><span>${p.category}</span></div>
        </div>
        <div class="card__body">
          <h3 class="card__name">${p.name}</h3>
          <p class="card__price">${precoFmt(p.price)}</p>
          <div class="card__sizes">${botoesTamanho}</div>
          <button type="button" class="card__add-btn" data-id="${p.id}">Adicionar ao Carrinho</button>
        </div>
      </div>`;
  }).join("");
}

// ---------- desenhar página do carrinho ----------
function desenharCarrinho() {
  if (pedidoFinalizado) {
    telaConfirmacao.hidden = false;
    conteudoCarrinho.hidden = true;
    return;
  }
  telaConfirmacao.hidden = true;
  conteudoCarrinho.hidden = false;

  carrinhoVazioMsg.hidden = carrinho.length > 0;

  listaCarrinho.innerHTML = carrinho.map((i) => `
    <div class="cart-item" data-id="${i.produto.id}" data-size="${i.tamanho}">
      <div class="cart-item__image"><img src="${i.produto.image}" alt="${i.produto.name}" /></div>
      <div class="cart-item__info">
        <div>
          <h4 class="cart-item__name">${i.produto.name}</h4>
          <p class="cart-item__size">Tamanho: <strong>${i.tamanho}</strong></p>
        </div>
        <div class="cart-item__bottom">
          <div class="qty-control">
            <button type="button" class="qty-btn" data-action="dec" data-id="${i.produto.id}" data-size="${i.tamanho}">−</button>
            <span class="qty-value">${i.quantidade}</span>
            <button type="button" class="qty-btn" data-action="inc" data-id="${i.produto.id}" data-size="${i.tamanho}">+</button>
          </div>
          <span class="cart-item__price">${precoFmt(i.produto.price * i.quantidade)}</span>
        </div>
      </div>
    </div>`).join("");

  listaResumo.innerHTML = carrinho.map((i) => `
    <div class="summary-item">
      <div class="summary-item__image"><img src="${i.produto.image}" alt="${i.produto.name}" /></div>
      <div class="summary-item__info">
        <p class="summary-item__name">${i.produto.name}</p>
        <p class="summary-item__meta">${i.tamanho} · Qtd. ${i.quantidade}</p>
      </div>
      <span class="summary-item__price">${precoFmt(i.produto.price * i.quantidade)}</span>
    </div>`).join("");

  const { subtotal, frete, total } = calcularTotais();
  resumoSubtotal.textContent = precoFmt(subtotal);
  resumoFrete.textContent = subtotal === 0 ? "—" : frete === 0 ? "Grátis" : precoFmt(frete);
  resumoFrete.classList.toggle("summary__row--free", subtotal > 0 && frete === 0);
  dicaFrete.hidden = !(subtotal > 0 && frete > 0);
  resumoTotal.textContent = precoFmt(total);
  botaoFinalizar.disabled = carrinho.length === 0;
}

// ---------- desenhar tudo ----------
function atualizar() {
  paginaLoja.hidden = pagina !== "loja";
  paginaCarrinho.hidden = pagina !== "carrinho";

  if (pagina === "loja") desenharLoja();
  else desenharCarrinho();

  const { totalItens } = calcularTotais();
  bolinhaCarrinho.hidden = totalItens === 0;
  bolinhaCarrinho.textContent = totalItens;

  window.scrollTo(0, 0);
}

// ---------- eventos ----------
el("logoBtn").addEventListener("click", irParaLoja);
el("cartBtn").addEventListener("click", irParaCarrinho);
el("heroCta").addEventListener("click", () => escolherCategoria("Todos"));
el("backBtn").addEventListener("click", irParaLoja);
el("backToStoreBtn").addEventListener("click", irParaLoja);

document.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => escolherCategoria(link.dataset.category));
});

botoesCategorias.addEventListener("click", (e) => {
  const botao = e.target.closest(".chip");
  if (botao) escolherCategoria(botao.dataset.category);
});

gradeProdutos.addEventListener("click", (e) => {
  const tamanhoBtn = e.target.closest(".size-btn");
  if (tamanhoBtn) {
    tamanhoEscolhido[tamanhoBtn.dataset.id] = tamanhoBtn.dataset.size;
    desenharLoja();
    return;
  }
  const addBtn = e.target.closest(".card__add-btn");
  if (addBtn) {
    const produto = produtos.find((p) => p.id === Number(addBtn.dataset.id));
    if (produto) adicionarAoCarrinho(produto);
  }
});

listaCarrinho.addEventListener("click", (e) => {
  const botao = e.target.closest(".qty-btn");
  if (!botao) return;
  const diferenca = botao.dataset.action === "inc" ? 1 : -1;
  alterarQuantidade(Number(botao.dataset.id), botao.dataset.size, diferenca);
});

opcoesPagamento.addEventListener("click", (e) => {
  const opcao = e.target.closest(".payment__option");
  if (!opcao) return;
  opcoesPagamento.querySelectorAll(".payment__option").forEach((o) =>
    o.classList.toggle("is-active", o === opcao)
  );
  opcao.querySelector("input").checked = true;
});

formularioEntrega.addEventListener("submit", (e) => {
  e.preventDefault();
  pedidoFinalizado = true;
  carrinho = [];
  atualizar();
});

// ---------- início ----------
atualizar();