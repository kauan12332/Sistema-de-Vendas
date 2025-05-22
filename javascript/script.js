// script.js

// LOGIN
window.addEventListener('DOMContentLoaded', () => {
  const senhaSalva = localStorage.getItem('senhaSistema');
  const loginTitulo = document.getElementById('loginTitulo');
  const senhaInput = document.getElementById('senhaInput');
  const mensagemErro = document.getElementById('mensagemErro');

  if (!senhaSalva) loginTitulo.textContent = '🔐 Crie sua Senha';

  window.verificarSenha = () => {
    const senha = senhaInput.value;
    if (!senhaSalva) {
      localStorage.setItem('senhaSistema', senha);
      acessarSistema();
    } else if (senha === senhaSalva) {
      acessarSistema();
    } else {
      mensagemErro.textContent = 'Senha incorreta';
    }
  };

  function acessarSistema() {
    document.getElementById('loginTela').style.display = 'none';
    document.getElementById('sistema').style.display = 'block';
    atualizarTabela();
    atualizarOpcoesVenda();
    atualizarHistoricoVendas();
    atualizarTotalVendido();
    atualizarEstoqueBaixo();
    atualizarGrafico();
  }

  window.logout = () => {
    document.getElementById('sistema').style.display = 'none';
    document.getElementById('loginTela').style.display = 'flex';
    senhaInput.value = '';
  };
});

// SISTEMA
let pecas = JSON.parse(localStorage.getItem('pecas')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

const formCadastro = document.getElementById('formCadastro');
const tabelaPecas = document.getElementById('tabelaPecas');
const selectVenda = document.getElementById('pecaVenda');
const historicoVendas = document.getElementById('historicoVendas');
const totalVendido = document.getElementById('totalVendido');
const estoqueBaixo = document.getElementById('estoqueBaixo');
const filtroNome = document.getElementById('filtroNome');
const filtroTamanho = document.getElementById('filtroTamanho');

formCadastro.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const tamanho = document.getElementById('tamanho').value;
  const quantidade = parseInt(document.getElementById('quantidade').value);

  pecas.push({ id: Date.now(), nome, valor, tamanho, quantidade });
  localStorage.setItem('pecas', JSON.stringify(pecas));
  formCadastro.reset();
  atualizarTabela();
  atualizarOpcoesVenda();
  atualizarEstoqueBaixo();
});

function atualizarTabela() {
  tabelaPecas.innerHTML = '';
  pecas.filter(filtrarPeca).forEach(peca => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${peca.nome}</td>
      <td>R$ ${peca.valor.toFixed(2)}</td>
      <td>${peca.tamanho}</td>
      <td>${peca.quantidade}</td>
      <td>
        <button onclick="editarPeca(${peca.id})">✏️</button>
        <button onclick="excluirPeca(${peca.id})">🗑️</button>
      </td>
    `;
    tabelaPecas.appendChild(tr);
  });
}

function atualizarOpcoesVenda() {
  selectVenda.innerHTML = '<option value="">Selecione uma peça</option>';
  pecas.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.nome} (${p.quantidade})`;
    selectVenda.appendChild(option);
  });
}

document.getElementById('formVenda').addEventListener('submit', e => {
  e.preventDefault();
  const id = parseInt(selectVenda.value);
  const qtd = parseInt(document.getElementById('quantidadeVenda').value);
  const peca = pecas.find(p => p.id === id);
  if (!peca || peca.quantidade < qtd) return alert('Estoque insuficiente');

  peca.quantidade -= qtd;
  vendas.push({ nome: peca.nome, valor: peca.valor, qtd, data: new Date().toLocaleString() });
  localStorage.setItem('pecas', JSON.stringify(pecas));
  localStorage.setItem('vendas', JSON.stringify(vendas));
  atualizarTabela();
  atualizarOpcoesVenda();
  atualizarHistoricoVendas();
  atualizarTotalVendido();
  atualizarEstoqueBaixo();
  atualizarGrafico();
  e.target.reset();
});

function editarPeca(id) {
  const peca = pecas.find(p => p.id === id);
  const novoNome = prompt('Novo nome:', peca.nome);
  const novoValor = prompt('Novo valor:', peca.valor);
  const novoTam = prompt('Novo tamanho:', peca.tamanho);
  const novaQtd = prompt('Nova quantidade:', peca.quantidade);
  if (!novoNome || !novoValor || !novoTam || !novaQtd) return;
  Object.assign(peca, { nome: novoNome, valor: parseFloat(novoValor), tamanho: novoTam, quantidade: parseInt(novaQtd) });
  localStorage.setItem('pecas', JSON.stringify(pecas));
  atualizarTabela();
  atualizarOpcoesVenda();
}

function excluirPeca(id) {
  if (confirm('Deseja excluir?')) {
    pecas = pecas.filter(p => p.id !== id);
    localStorage.setItem('pecas', JSON.stringify(pecas));
    atualizarTabela();
    atualizarOpcoesVenda();
  }
}

function atualizarHistoricoVendas() {
  historicoVendas.innerHTML = '';
  vendas.forEach(v => {
    const li = document.createElement('li');
    li.textContent = `${v.qtd}x ${v.nome} - R$ ${(v.valor * v.qtd).toFixed(2)} - ${v.data}`;
    historicoVendas.appendChild(li);
  });
}

function atualizarTotalVendido() {
  const total = vendas.reduce((acc, v) => acc + (v.valor * v.qtd), 0);
  totalVendido.textContent = `R$ ${total.toFixed(2)}`;
}

function atualizarEstoqueBaixo() {
  estoqueBaixo.innerHTML = '';
  pecas.filter(p => p.quantidade <= 2).forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.nome} - ${p.quantidade} unidades`;
    estoqueBaixo.appendChild(li);
  });
}

function filtrarPeca(peca) {
  const nomeFiltro = filtroNome.value.toLowerCase();
  const tamFiltro = filtroTamanho.value.toLowerCase();
  return (
    peca.nome.toLowerCase().includes(nomeFiltro) &&
    peca.tamanho.toLowerCase().includes(tamFiltro)
  );
}

function filtrarPecas() {
  atualizarTabela();
}

function exportarCSV() {
  let csv = 'Nome,Valor,Tamanho,Quantidade\n';
  pecas.forEach(p => {
    csv += `${p.nome},${p.valor},${p.tamanho},${p.quantidade}\n`;
  });
  baixarArquivo(csv, 'pecas.csv');
}

function exportarVendasCSV() {
  let csv = 'Nome,Quantidade,Valor Unitário,Data\n';
  vendas.forEach(v => {
    csv += `${v.nome},${v.qtd},${v.valor},${v.data}\n`;
  });
  baixarArquivo(csv, 'vendas.csv');
}

function exportarPDF() {
  let texto = 'Relatório de Vendas:\n\n';
  vendas.forEach(v => {
    texto += `${v.qtd}x ${v.nome} - R$ ${(v.valor * v.qtd).toFixed(2)} - ${v.data}\n`;
  });
  const blob = new Blob([texto], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'relatorio.pdf';
  link.click();
}

function baixarArquivo(conteudo, nome) {
  const blob = new Blob([conteudo], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nome;
  link.click();
}

function atualizarGrafico() {
  const ctx = document.getElementById('graficoVendas').getContext('2d');
  const datas = {};
  vendas.forEach(v => {
    const data = v.data.split(',')[0];
    datas[data] = (datas[data] || 0) + v.valor * v.qtd;
  });

  if (window.meuGrafico) window.meuGrafico.destroy();
  window.meuGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(datas),
      datasets: [{
        label: 'Vendas por Dia',
        data: Object.values(datas),
        backgroundColor: '#FFD700'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('✅ Service Worker registrado com sucesso!'))
    .catch(err => console.error('❌ Erro ao registrar o Service Worker:', err));
}
