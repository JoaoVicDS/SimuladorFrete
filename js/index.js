const iconsAdd = document.querySelectorAll(".bi-plus-circle-fill");
const iconsClose = document.querySelectorAll(".bi-x-circle-fill");
const produtos = document.querySelectorAll(".produto-item");
const selecaoProdutos = document.querySelectorAll(".select-produto");
const EmbutidoSpan = document.querySelectorAll(".grupo-frete-embutido span");
const qtdProdutos = document.querySelectorAll(".qtd-produtos");

// Atualizando valor embutido;
selecaoProdutos.forEach((opcao, index)=>{
    EmbutidoSpan.innerHTML = 100;
    opcao.addEventListener("change", function(){
        var opcaoSelecionada = opcao.value;

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

//Função para validar se pelo menos 1 uma quantidade foi inserida no produto.
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

// Função para enviar request a API;
function enviarRequest() {
    // Desestruturação da função obterDados;
    var {origem, destino, kmAdicional, kmTerra} = obterDados();
    // Fim desestruturação da função obterDados;
    if (document.getElementById("endereco-origem").value.trim() !== "" &&
        document.getElementById("cidade-origem").value.trim() !== "" &&
        document.getElementById("estado-origem").value.trim() !== "") {

        document.getElementById("endereco-origem").classList.remove("erro-input");
        document.getElementById("cidade-origem").classList.remove("erro-input");
        document.getElementById("estado-origem").classList.remove("erro-input");

        if (document.getElementById("endereco-destino").value.trim() !== "" &&
            document.getElementById("cidade-destino").value.trim() !== "" &&
            document.getElementById("estado-destino").value.trim() !== "") {

            document.getElementById("endereco-destino").classList.remove("erro-input");
            document.getElementById("cidade-destino").classList.remove("erro-input");
            document.getElementById("estado-destino").classList.remove("erro-input");

            if (origem && destino && validarQtdProdutos()) {
                var qtdTotalProdutos = 0;
                var freteTotalEmbutido = 0;
        
                produtos.forEach((produto, index) => {
                    var quantidade = parseFloat(qtdProdutos[index].value) || 0;
                    var valorEmbutido = parseFloat(EmbutidoSpan[index].innerHTML) || 0;
                    
                    // Verificação se os valores são numéricos válidos
                    if (!isNaN(quantidade) && !isNaN(valorEmbutido)) {
                        var freteAtual = quantidade * valorEmbutido;
                        qtdTotalProdutos += quantidade;
                        freteTotalEmbutido += freteAtual;
                    } else {
                        console.error("Valor inválido encontrado no produto:", produto);
                    }
                });
        
                let produtosSelecionados = []
                var valorKm = 0;
        
                produtos.forEach((produto, index)=>{
                    if (produto.classList.contains("produto-item-on")) {
                        produtosSelecionados.push(selecaoProdutos[index].value);
                    }
                });
        
                if (produtosSelecionados.includes("cocho-coberto")) {
                    if (qtdTotalProdutos <= 3) {
                        valorKm = 5.5;
                    } else if (qtdTotalProdutos > 3) {
                        valorKm = 9.0;
                    }
                } else {
                    if (qtdTotalProdutos <= 10) {
                        valorKm = 3.0;
                    } else if (qtdTotalProdutos > 10 && qtdTotalProdutos <= 40) {
                        valorKm = 3.2;
                    } else if (qtdTotalProdutos > 40) {
                        valorKm = 8.5;
                    }
                }
        
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
                        var freteKM = parseInt((distanciaTotalKm * valorKm) + (kmTerra * 5.0));
                        if (freteKM >= freteTotalEmbutido) {
                            var adicionalDeFrete = parseInt(freteKM - freteTotalEmbutido);
                            if (adicionalDeFrete <= 100) {
                                adicionalDeFrete += 350;
                            } else if (adicionalDeFrete > 100 && adicionalDeFrete <= 200) {
                                adicionalDeFrete += 250;
                            } else if (adicionalDeFrete > 200 && adicionalDeFrete <= 300) {
                                adicionalDeFrete += 150;
                            }
                        } else {
                            var adicionalDeFrete = parseInt(300);
                        }
                        var freteTotal = parseInt(freteTotalEmbutido + adicionalDeFrete);
        
                        while (freteTotal % 10 !== 0 || adicionalDeFrete % 10 !== 0 || freteTotalEmbutido % 10 !== 0) {
                            if (freteTotal % 10 !== 0) {
                                freteTotal++;
                            }
                            if (adicionalDeFrete % 10 !== 0) {
                                adicionalDeFrete++;
                            }
                            if (freteTotalEmbutido % 10 !== 0) {
                                freteTotalEmbutido++;
                            }
                        }
                        
                        mostrarResultados(distanciaTotalKm, adicionalDeFrete, freteTotalEmbutido, freteTotal);
                        window.location.href = "#resultado";
                    } else {
                        alert("Erro ao calcular distância: " + status);
                    }
                });
            } else {
                alert("Digite a quantidade dos Produtos");
            }
        } else {
            alert("Digite os campos obrigatórios do Destinatário (Endereço, Cidade e Estado)");
            document.getElementById("endereco-destino").classList.add("erro-input");
            document.getElementById("cidade-destino").classList.add("erro-input");
            document.getElementById("estado-destino").classList.add("erro-input");
        }
    } else {
        alert("Digite os campos obrigatórios do Remetente (Endereço, Cidade e Estado)");
        document.getElementById("endereco-origem").classList.add("erro-input");
        document.getElementById("cidade-origem").classList.add("erro-input");
        document.getElementById("estado-origem").classList.add("erro-input");
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