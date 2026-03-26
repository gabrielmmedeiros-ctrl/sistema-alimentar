let estoque = JSON.parse(localStorage.getItem("estoque")) || [];
let consumo = JSON.parse(localStorage.getItem("consumo")) || {};
let grafico = null;

// ================= SALVAR =================
function salvar() {
    localStorage.setItem("estoque", JSON.stringify(estoque));
    localStorage.setItem("consumo", JSON.stringify(consumo));
}

// ================= ADICIONAR =================
function addItem() {
    const nome = document.getElementById("nome").value.trim();
    const qtd = parseInt(document.getElementById("estoqueInput").value);

    if (!nome || isNaN(qtd) || qtd < 0) {
        alert("Preencha corretamente!");
        return;
    }

    if (estoque.find(i => i.nome === nome)) {
        alert("Item já existe!");
        return;
    }

    estoque.push({ nome, qtd });
    salvar();
    atualizar();
}

// ================= MOVIMENTAÇÃO =================
function entrada() { movimentar(1); }
function saida() { movimentar(-1); }

function movimentar(tipo) {
    const nome = document.getElementById("itemNome").value.trim();
    const qtd = parseInt(document.getElementById("quantidade").value);

    if (!nome || isNaN(qtd) || qtd <= 0) {
        alert("Dados inválidos!");
        return;
    }

    let item = estoque.find(i => i.nome === nome);

    if (!item) {
        alert("Item não encontrado!");
        return;
    }

    if (tipo === -1 && item.qtd < qtd) {
        alert("Estoque insuficiente!");
        return;
    }

    item.qtd += qtd * tipo;

    if (tipo === -1) {
        consumo[nome] = (consumo[nome] || 0) + qtd;
    }

    salvar();
    atualizar();
}

// ================= STATUS =================
function getStatus(qtd) {
    if (qtd < 10) return '<span class="vermelho">🔴 Baixo</span>';
    if (qtd < 30) return '<span class="amarelo">🟡 Médio</span>';
    return '<span class="verde">🟢 OK</span>';
}

// ================= ATUALIZAR TELA =================
function atualizar() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    estoque.forEach(item => {
        lista.innerHTML += `
        <tr>
            <td>${item.nome}</td>
            <td>${item.qtd}</td>
            <td>${getStatus(item.qtd)}</td>
        </tr>
        `;
    });

    atualizarGrafico();
}

// ================= GRÁFICO =================
function atualizarGrafico() {
    const ctx = document.getElementById("grafico");

    if (grafico) {
        grafico.destroy();
    }

    if (Object.keys(consumo).length === 0) return;

    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(consumo),
            datasets: [{
                label: "Consumo",
                data: Object.values(consumo)
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
}

// ================= EXPORTAR =================
function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(estoque);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estoque");
    XLSX.writeFile(wb, "estoque.xlsx");
}

// ================= RESET =================
function resetar() {
    if (confirm("Tem certeza que deseja apagar tudo?")) {
        localStorage.clear();
        location.reload();
    }
}

// ================= CARDÁPIO =================
let cardapio = JSON.parse(localStorage.getItem("cardapio")) || [];

function salvarCardapio() {
    localStorage.setItem("cardapio", JSON.stringify(cardapio));
}

// adicionar item no cardápio
function addCardapio() {
    const refeicao = document.getElementById("refeicao").value;
    const ingrediente = document.getElementById("ingrediente").value.trim();
    const qtd = parseInt(document.getElementById("qtdPessoa").value);

    if (!ingrediente || isNaN(qtd) || qtd <= 0) {
        alert("Preencha corretamente!");
        return;
    }

    cardapio.push({ refeicao, ingrediente, qtd });
    salvarCardapio();

    alert("Adicionado ao cardápio!");
}

// calcular consumo
function calcularCardapio() {
    const pessoas = parseInt(document.getElementById("numPessoas").value);

    if (isNaN(pessoas) || pessoas <= 0) {
        alert("Informe o número de pessoas!");
        return;
    }

    let resultado = "";

    const refeicoes = ["Lanche", "Almoço", "Janta"];

    refeicoes.forEach(ref => {
        const itens = cardapio.filter(i => i.refeicao === ref);

        if (itens.length > 0) {
            resultado += `<h4>${ref}</h4>`;

            itens.forEach(item => {
                const total = item.qtd * pessoas;

                resultado += `
                    ${item.ingrediente}: ${total}g<br>
                `;
            });

            resultado += "<br>";
        }
    });

    document.getElementById("resultadoCardapio").innerHTML = resultado;
}
// ================= INIT =================
atualizar();