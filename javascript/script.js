const form = document.getElementById("formCadastro");
const tabela = document.getElementById("tabelaPecas");
const selectVenda = document.getElementById("pecaVenda");
const formVenda = document.getElementById("formVenda");
const historicoVendas = document.getElementById("historicoVendas");
const totalVendidoSpan = document.getElementById("totalVendido");
const estoqueBaixoUl = document.getElementById("estoqueBaixo");

let pecas = JSON.parse(localStorage.getItem("pecas")) || [];
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];

function atualizarTabela() {
  tabela.innerHTML = "";
  pecas.forEach((peca, index) => {
    const linha = tabela.insertRow();
    linha.innerHTML = `
      <td>${peca.nome}</td>
      <td>R$ ${peca.valor.toFixed(2)}</td>
      <td>${peca.tamanho}</td>
      <td>${peca.quantidade}</td>
      <td>
        <button onclick="editarPeca(${index})">✏️ Editar</button>
        <button onclick="excluirPeca(${index})">🗑️ Excluir</button>
      </td>
    `;
  });
}

function atualizarSelectVenda() {
  selectVenda.innerHTML = `<option value="">Selecione uma peça</option>`;
  pecas.forEach((peca, index) => {
    selectVenda.innerHTML += `<option value="${index}">${peca.nome} (${peca.tamanho}) - ${peca.quantidade} disponíveis</option>`;
  });
}

function atualizarHistoricoVendas() {
  historicoVendas.innerHTML = "";
  vendas.forEach(venda => {
    const item = document.createElement("li");
    item.textContent = `🛒 ${venda.nome} - ${venda.quantidade} un - R$ ${(venda.valor * venda.quantidade).toFixed(2)} (${venda.data})`;
    historicoVendas.appendChild(item);
  });
}

function atualizarTotalVendido() {
  const total = vendas.reduce((soma, venda) => soma + venda.valor * venda.quantidade, 0);
  totalVendidoSpan.textContent = `R$ ${total.toFixed(2)}`;
}

function atualizarEstoqueBaixo() {
  estoqueBaixoUl.innerHTML = "";
  pecas.forEach((peca) => {
    if (peca.quantidade < 5) {
      const item = document.createElement("li");
      item.textContent = `⚠️ ${peca.nome} (${peca.tamanho}) - ${peca.quantidade} unidade(s)`;
      estoqueBaixoUl.appendChild(item);
    }
  });
}

function editarPeca(index) {
  const peca = pecas[index];
  const novoNome = prompt("Editar nome:", peca.nome);
  const novoValor = parseFloat(prompt("Editar valor:", peca.valor));
  const novoTamanho = prompt("Editar tamanho:", peca.tamanho);
  const novaQuantidade = parseInt(prompt("Editar quantidade:", peca.quantidade));

  if (novoNome && !isNaN(novoValor) && novoTamanho && !isNaN(novaQuantidade)) {
    pecas[index] = { nome: novoNome, valor: novoValor, tamanho: novoTamanho, quantidade: novaQuantidade };
    localStorage.setItem("pecas", JSON.stringify(pecas));
    atualizarTabela();
    atualizarSelectVenda();
    atualizarEstoqueBaixo();
  }
}

function excluirPeca(index) {
  if (confirm("Tem certeza que deseja excluir esta peça?")) {
    pecas.splice(index, 1);
    localStorage.setItem("pecas", JSON.stringify(pecas));
    atualizarTabela();
    atualizarSelectVenda();
    atualizarEstoqueBaixo();
  }
}

function exportarCSV() {
  let csv = "Nome,Valor,Tamanho,Quantidade\n";
  pecas.forEach(p => {
    csv += `${p.nome},${p.valor},${p.tamanho},${p.quantidade}\n`;
  });
  baixarArquivo(csv, "pecas.csv");
}

function exportarVendasCSV() {
  let csv = "Nome,Valor,Quantidade,Data\n";
  vendas.forEach(v => {
    csv += `${v.nome},${v.valor},${v.quantidade},${v.data}\n`;
  });
  baixarArquivo(csv, "vendas.csv");
}

function baixarArquivo(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Relatório de Peças Cadastradas", 10, 10);
  let y = 20;
  pecas.forEach((peca, index) => {
    doc.text(`${index + 1}. ${peca.nome} - R$${peca.valor} - Tam: ${peca.tamanho} - Qtd: ${peca.quantidade}`, 10, y);
    y += 10;
  });

  doc.addPage();
  doc.text("Histórico de Vendas", 10, 10);
  y = 20;
  vendas.forEach((v, i) => {
    doc.text(`${i + 1}. ${v.nome} - ${v.quantidade} un - R$${v.valor} - ${v.data}`, 10, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("relatorio_loja.pdf");
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tamanho = document.getElementById("tamanho").value;
  const quantidade = parseInt(document.getElementById("quantidade").value);
  const novaPeca = { nome, valor, tamanho, quantidade };
  pecas.push(novaPeca);
  localStorage.setItem("pecas", JSON.stringify(pecas));
  atualizarTabela();
  atualizarSelectVenda();
  atualizarEstoqueBaixo();
  form.reset();
});

formVenda.addEventListener("submit", function (e) {
  e.preventDefault();
  const index = parseInt(selectVenda.value);
  const quantidadeVendida = parseInt(document.getElementById("quantidadeVenda").value);
  if (isNaN(index) || quantidadeVendida <= 0) return;

  const peca = pecas[index];
  if (peca.quantidade < quantidadeVendida) {
    alert("Estoque insuficiente!");
    return;
  }

  peca.quantidade -= quantidadeVendida;
  const venda = {
    nome: peca.nome,
    valor: peca.valor,
    quantidade: quantidadeVendida,
    data: new Date().toLocaleString()
  };

  vendas.push(venda);
  localStorage.setItem("pecas", JSON.stringify(pecas));
  localStorage.setItem("vendas", JSON.stringify(vendas));
  atualizarTabela();
  atualizarSelectVenda();
  atualizarHistoricoVendas();
  atualizarTotalVendido();
  atualizarEstoqueBaixo();
  formVenda.reset();
});

// Inicialização
atualizarTabela();
atualizarSelectVenda();
atualizarHistoricoVendas();
atualizarTotalVendido();
atualizarEstoqueBaixo();
