const listaPokemons = document.getElementById("lista-pokemons");
const mensagem = document.getElementById("mensagem");
const campoBusca = document.getElementById("campo-busca");
const btnAnterior = document.getElementById("anterior");
const btnProximo = document.getElementById("proximo");
const btnFavoritos = document.getElementById("favoritos");
const modal = document.getElementById("modal");
const fecharModal = document.getElementById("fechar-modal");
const btnFavoritarDetalhe = document.getElementById("favoritar-detalhe");

let paginaAtual = 0;
let mostrandoFavoritos = false;

function obterFavoritos() {
  return JSON.parse(localStorage.getItem("pokedex_favoritos_v1")) || [];
}

function salvarFavoritos(lista) {
  localStorage.setItem("pokedex_favoritos_v1", JSON.stringify(lista));
}

async function carregarPokemons() {
  mensagem.textContent = "Carregando Pokémon...";
  listaPokemons.innerHTML = "";
  mostrandoFavoritos = false;

  try {
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${paginaAtual * 20}`);
    const dados = await resposta.json();
    const pokemons = await Promise.all(dados.results.map(p => fetch(p.url).then(r => r.json())));
    exibirPokemons(pokemons);
  } catch (erro) {
    mensagem.textContent = "Erro ao carregar os Pokémon.";
  }
}

function exibirPokemons(pokemons) {
  mensagem.textContent = "";
  listaPokemons.innerHTML = "";
  if (pokemons.length === 0) {
    mensagem.textContent = "Nenhum resultado encontrado.";
    return;
  }
  pokemons.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="https://img.pokemondb.net/artwork/large/${p.name}.jpg" alt="${p.name}"/>

      <h3>${p.name}</h3>
      <p>ID: ${p.id}</p>
    `;
    card.onclick = () => mostrarDetalhes(p);
    listaPokemons.appendChild(card);
  });
}

async function buscarPokemon() {
  const nome = campoBusca.value.toLowerCase().trim();
  if (!nome) return carregarPokemons();

  mensagem.textContent = "Buscando...";
  listaPokemons.innerHTML = "";
  try {
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
    if (!resposta.ok) throw new Error("Não encontrado");
    const pokemon = await resposta.json();
    exibirPokemons([pokemon]);
  } catch {
    mensagem.textContent = "Pokémon não encontrado.";
  }
}

function mostrarDetalhes(p) {
  modal.style.display = "block";
  document.getElementById("imagem-detalhe").src = `https://img.pokemondb.net/artwork/large/${p.name}.jpg`;


  document.getElementById("nome-detalhe").textContent = p.name;
  document.getElementById("id-detalhe").textContent = p.id;
  document.getElementById("tipo-detalhe").textContent = p.types.map(t => t.type.name).join(", ");
  document.getElementById("altura-detalhe").textContent = p.height / 10 + " m";
  document.getElementById("peso-detalhe").textContent = p.weight / 10 + " kg";

  btnFavoritarDetalhe.onclick = () => alternarFavorito(p.id);
}

function alternarFavorito(id) {
  let favoritos = obterFavoritos();
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(f => f !== id);
  } else {
    favoritos.push(id);
  }
  salvarFavoritos(favoritos);
  alert("Favoritos atualizados!");
}

async function mostrarFavoritos() {
  mensagem.textContent = "Carregando favoritos...";
  listaPokemons.innerHTML = "";
  mostrandoFavoritos = true;

  const favoritos = obterFavoritos();
  if (favoritos.length === 0) {
    mensagem.textContent = "Nenhum Pokémon favoritado.";
    return;
  }

  const pokemons = await Promise.all(favoritos.map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json())));
  exibirPokemons(pokemons);
}

btnAnterior.onclick = () => {
  if (paginaAtual > 0) {
    paginaAtual--;
    carregarPokemons();
  }
};

btnProximo.onclick = () => {
  paginaAtual++;
  carregarPokemons();
};

btnFavoritos.onclick = mostrarFavoritos;
campoBusca.addEventListener("keyup", e => {
  if (e.key === "Enter") buscarPokemon();
});

fecharModal.onclick = () => (modal.style.display = "none");
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

carregarPokemons();