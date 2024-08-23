const iconsAdd = document.querySelectorAll(".bi-plus-circle");
const iconsClose = document.querySelectorAll(".bi-x-circle");
const produtos = document.querySelectorAll(".produto-item");
const selecaoProdutos = document.querySelectorAll(".select-produto");
const EmbutidoSpan = document.querySelectorAll(".grupo-frete-embutido span");
const qtdProdutos = document.querySelectorAll(".qtd-produtos");

// Atualizando valor embutido;
selecaoProdutos.forEach((opcao, index)=>{
    EmbutidoSpan.innerHTML = 100;
    opcao.addEventListener("change", function(){
        opcaoSelecionada = opcao.value;

        if(opcaoSelecionada === "pilheta" || opcaoSelecionada === "giro-2100" || opcaoSelecionada === "giro-1500") {
            EmbutidoSpan[index].innerHTML = 100;
        } else if (opcaoSelecionada === "banda-forte" || opcaoSelecionada === "cocho-u" || opcaoSelecionada === "deposito"){
            EmbutidoSpan[index].innerHTML = 50;
        } else {
            EmbutidoSpan[index].innerHTML = 400;
        }
    });
});

// Função para obtenção de dados e retornar em um objeto;
function obterDados() {
    return {
        origem: `${document.getElementById("endereco-origem").value}, ${document.getElementById("numero-origem").value}, ${document.getElementById("bairro-origem").value}, ${document.getElementById("cep-origem").value} ${document.getElementById("cidade-origem").value} ${document.getElementById("estado-origem").value}`,
        destino: `${document.getElementById("endereco-destino").value}, ${document.getElementById("numero-destino").value}, ${document.getElementById("bairro-destino").value}, ${document.getElementById("cep-destino").value} ${document.getElementById("cidade-destino").value} ${document.getElementById("estado-destino").value}`,
        kmAdicional: parseFloat(document.getElementById("km-adicional").value) || 0,
        kmTerra: parseFloat(document.getElementById("km-terra").value) || 0
    };
}

// Função para enviar request a API;
function enviarRequest() {
    // Desestruturação da função obterDados;
    var {origem, destino, kmAdicional, kmTerra} = obterDados();

    function validarQtdProdutos() {
        let todosPreenchidos = true;
        const produtosVisiveis = document.querySelectorAll(".produto-item-on");

        produtosVisiveis.forEach(produto => {
            const qtd = produto.querySelector(".qtd-produtos");

            if (qtd.value === "" || parseFloat(qtd.value) === 0) {
                todosPreenchidos = false;
            }
        });

        return todosPreenchidos;
    }

    if (origem && destino && validarQtdProdutos()) {
        var freteTotalEmbutido = 0;

        produtos.forEach((produto, index) => {
            var quantidade = parseFloat(qtdProdutos[index].value) || 0;
            var valorEmbutido = parseFloat(EmbutidoSpan[index].innerHTML) || 0;
            
            // Verificação se os valores são numéricos válidos
            if (!isNaN(quantidade) && !isNaN(valorEmbutido)) {
                var freteAtual = quantidade * valorEmbutido;
                freteTotalEmbutido += freteAtual;
            } else {
                console.error("Valor inválido encontrado no produto:", produto);
            }
        });

        // Instanciando um objeto da classe DistanceMatrixService;
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [origem],
            destinations: [destino],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        }, (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                var distanciaTotalKm = (response.rows[0].elements[0].distance.value / 1000) + kmAdicional;
                var adicionalDeFrete = parseInt((distanciaTotalKm * 3.0) + (kmTerra * 5.0));
                var freteTotal = parseInt(freteTotalEmbutido + adicionalDeFrete);

                while(freteTotal % 10 !== 0 && adicionalDeFrete % 10 !== 0) {
                    freteTotal++;
                    adicionalDeFrete++;
                }
                mostrarResultados(distanciaTotalKm, adicionalDeFrete, freteTotalEmbutido, freteTotal);
                window.location.href = "#resultado";
            } else {
                alert("Erro ao calcular distância: " + status);
            }
        });
    } else {
        alert("Por favor, preencha todos os campos com asterisco ( * )");
    }
}


// Função para mostrar resultados;
function mostrarResultados(distanciaTotalKm, adicionalDeFrete, freteTotalEmbutido, freteTotal) {
    const resultados = document.getElementById("resultado");
    const distanciaTotalKmH1 = document.getElementById("distancia-total-km");
    const valorCobrarH1 = document.getElementById("valor-cobrar-h1");
    const valorEmbutidoH1 = document.getElementById("valor-embutido-h1");
    const valorTotalH1 = document.getElementById("valor-total-h1");

    resultados.classList.add("open-resultado");
    distanciaTotalKmH1.innerText = `TOTAL DE ${distanciaTotalKm.toFixed(2)} KM`;
    valorCobrarH1.innerText = `R$ ${adicionalDeFrete.toFixed(2)}`;
    valorEmbutidoH1.innerText = `R$ ${freteTotalEmbutido.toFixed(2)}`;
    valorTotalH1.innerText = `R$ ${freteTotal.toFixed(2)}`;
}

// Adicionar produto
iconsAdd.forEach((icon,index) => {
    icon.addEventListener("click", function() {

        for (let i = index+1; i < produtos.length; i++) {
            if (produtos[i].classList.contains("produto-item-off")) {
                produtos[i].classList.remove("produto-item-off");
                produtos[i].classList.add("produto-item-on");
                break; 
            }
        }
    });
});

// Excluir produto
iconsClose.forEach((icon, index) => {
    icon.addEventListener("click", function () {
        // Verifica se o produto a ser excluído é o único visível
        if (produtos[index].classList.contains("produto-item-on") && document.querySelectorAll(".produto-item-on").length > 1) {
            produtos[index].classList.remove("produto-item-on");
            produtos[index].classList.add("produto-item-off");
            qtdProdutos[index].value = "";
        } else if (produtos[index].classList.contains("produto-item-on") && document.querySelectorAll(".produto-item-on").length === 1) {
            alert("Você deve ter pelo menos um produto selecionado.");
        }
    });
});