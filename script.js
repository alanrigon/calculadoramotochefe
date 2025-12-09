// Utilidades
const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// Página: Calculadora
function initCalculadora() {
  const tbody = document.getElementById("produtos-body");
  const btnAddProduto = document.getElementById("btn-adicionar-produto");
  const chipsPagamento = document.querySelectorAll(".chip[data-pagamento]");
  const campoParcelas = document.getElementById("campo-parcelas");
  const selectParcelas = document.getElementById("parcelas");
  const btnGerarOrcamento = document.getElementById("btn-gerar-orcamento");

  const resumoSubtotal = document.getElementById("resumo-subtotal");
  const resumoAjuste = document.getElementById("resumo-ajuste");
  const resumoTotal = document.getElementById("resumo-total");
  const resumoParcela = document.getElementById("resumo-parcela");
  const linhaParcela = document.getElementById("linha-parcela");

  // Preencher opções de parcelas 1-21
  for (let i = 1; i <= 21; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}x`;
    if (i === 12) opt.selected = true;
    selectParcelas.appendChild(opt);
  }

  // Adicionar linha de produto
  const adicionarLinhaProduto = () => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <input type="text" placeholder="Descrição do produto" class="inp-produto-nome" />
      </td>
      <td style="width: 80px;">
        <input type="number" min="1" value="1" class="inp-produto-qtd" />
      </td>
      <td style="width: 140px;">
        <input type="number" min="0" step="0.01" value="0" class="inp-produto-valor" />
      </td>
      <td style="width: 130px;">
        <span class="produto-subtotal">R$ 0,00</span>
      </td>
      <td style="width: 40px; text-align: right;">
        <button class="btn-remover" title="Remover linha">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  };

  // Sempre começa com uma linha
  if (tbody.children.length === 0) {
    adicionarLinhaProduto();
  }

  btnAddProduto.addEventListener("click", () => {
    adicionarLinhaProduto();
    atualizarCalculos();
  });

  tbody.addEventListener("input", (e) => {
    if (
      e.target.classList.contains("inp-produto-qtd") ||
      e.target.classList.contains("inp-produto-valor")
    ) {
      atualizarCalculos();
    }
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remover");
    if (btn) {
      const tr = btn.closest("tr");
      tr?.remove();
      if (tbody.children.length === 0) {
        adicionarLinhaProduto();
      }
      atualizarCalculos();
    }
  });

  let tipoPagamento = "avista"; // avista | parcelado

  chipsPagamento.forEach((chip) => {
    chip.addEventListener("click", () => {
      chipsPagamento.forEach((c) => c.classList.remove("chip-selected"));
      chip.classList.add("chip-selected");
      tipoPagamento = chip.dataset.pagamento;

      if (tipoPagamento === "parcelado") {
        campoParcelas.style.display = "";
        linhaParcela.style.display = "";
      } else {
        campoParcelas.style.display = "none";
        linhaParcela.style.display = "none";
      }

      atualizarCalculos();
    });
  });

  selectParcelas.addEventListener("change", atualizarCalculos);

  function coletarProdutos() {
    const linhas = Array.from(tbody.querySelectorAll("tr"));
    const produtos = [];
    let subtotalTotal = 0;

    linhas.forEach((linha) => {
      const nome = linha.querySelector(".inp-produto-nome")?.value || "";
      const qtd = parseNumber(
        linha.querySelector(".inp-produto-qtd")?.value || "0"
      );
      const valor = parseNumber(
        linha.querySelector(".inp-produto-valor")?.value || "0"
      );
      const subtotal = qtd * valor;

      linha.querySelector(".produto-subtotal").textContent =
        formatCurrency(subtotal);

      if (qtd > 0 && valor > 0) {
        produtos.push({ nome, qtd, valor, subtotal });
        subtotalTotal += subtotal;
      }
    });

    return { produtos, subtotalTotal };
  }

  function atualizarCalculos() {
    const { produtos, subtotalTotal } = coletarProdutos();

    let ajuste = 0;
    let total = subtotalTotal;
    let valorParcela = 0;
    const numeroParcelas = parseInt(selectParcelas.value || "1", 10);

    if (tipoPagamento === "avista") {
      // 5% de desconto apenas no primeiro produto
      if (produtos.length > 0 && produtos[0].subtotal > 0) {
        const descontoPrimeiroProduto = produtos[0].subtotal * 0.05;
        ajuste = -descontoPrimeiroProduto;
        total = subtotalTotal + ajuste;
      }
    } else {
      // Parcelado:
      // Até 12x: sem juros
      // 13x a 18x: 5% de juros sobre o total
      // 19x a 21x: 7,5% de juros sobre o total
      if (numeroParcelas <= 12) {
        ajuste = 0;
      } else if (numeroParcelas <= 18) {
        ajuste = subtotalTotal * 0.05;
      } else {
        ajuste = subtotalTotal * 0.075;
      }
      total = subtotalTotal + ajuste;
      valorParcela = numeroParcelas > 0 ? total / numeroParcelas : 0;
    }

    resumoSubtotal.textContent = formatCurrency(subtotalTotal);
    resumoAjuste.textContent = formatCurrency(ajuste);
    resumoTotal.textContent = formatCurrency(total);

    if (tipoPagamento === "parcelado") {
      resumoParcela.textContent = formatCurrency(valorParcela);
    }

    // Armazenar dados atuais em memória (para botão de gerar orçamento)
    calculoAtual = {
      produtos,
      subtotalTotal,
      ajuste,
      total,
      tipoPagamento,
      numeroParcelas: tipoPagamento === "parcelado" ? numeroParcelas : 1,
      valorParcela: tipoPagamento === "parcelado" ? valorParcela : total,
    };
  }

  let calculoAtual = {
    produtos: [],
    subtotalTotal: 0,
    ajuste: 0,
    total: 0,
    tipoPagamento: "avista",
    numeroParcelas: 1,
    valorParcela: 0,
  };

  btnGerarOrcamento.addEventListener("click", () => {
    atualizarCalculos();

    if (!calculoAtual.produtos.length) {
      alert("Adicione pelo menos um produto com quantidade e valor válidos.");
      return;
    }

    // Salvar no localStorage para a página de orçamento
    localStorage.setItem(
      "moto-chefe-orcamento",
      JSON.stringify({
        ...calculoAtual,
        criadoEm: new Date().toISOString(),
      })
    );

    window.location.href = "orcamento.html";
  });

  // Cálculo inicial
  atualizarCalculos();
}

// Cache global simples para as logos usadas no PDF
window.motoChefeLogoDataUrl = window.motoChefeLogoDataUrl || null;
window.motoChefeLogoBrancaDataUrl = window.motoChefeLogoBrancaDataUrl || null;

// Página: Orçamento / PDF
function initOrcamento() {
  const dadosRaw = localStorage.getItem("moto-chefe-orcamento");
  const btnVoltar = document.getElementById("btn-voltar");
  const btnGerarPdf = document.getElementById("btn-gerar-pdf");
  const corpoProdutos = document.getElementById("orc-produtos-body");
  const grupoEntrada = document.getElementById("grupo-entrada");
  const entradaValorInput = document.getElementById("entrada-valor");
  const entradaPercentualSpan = document.getElementById("entrada-percentual");
  const entradaDescontoCheckbox = document.getElementById(
    "entrada-desconto-checkbox"
  );
  const entradaDescontoPdfCheckbox = document.getElementById(
    "entrada-desconto-pdf-checkbox"
  );
  const entradaPdfCheckbox = document.getElementById("entrada-pdf-checkbox");
  const freteInput = document.getElementById("frete-valor");
  const freteBonificacaoCheckbox = document.getElementById(
    "frete-bonificacao-checkbox"
  );
  const freteBonificacaoInput = document.getElementById(
    "frete-bonificacao-valor"
  );
  const validadeInput = document.getElementById("validade-orcamento");
  const btnGerarPdfImpressao = document.getElementById("btn-gerar-pdf-impressao");
  
  // Elementos para desconto por produto
  const descontoProdutoSelect = document.getElementById("desconto-produto-select");
  const descontoProdutoValor = document.getElementById("desconto-produto-valor");
  const btnAdicionarDesconto = document.getElementById("btn-adicionar-desconto");
  const listaDescontosAplicados = document.getElementById("lista-descontos-aplicados");
  
  // Armazenar descontos por produto (índice do produto -> valor do desconto)
  const descontosPorProduto = {};
  const descontoGerenciaCheckbox = document.getElementById(
    "desconto-gerencia-checkbox"
  );
  const descontoGerenciaInput = document.getElementById(
    "desconto-gerencia-percent"
  );

  const campoForma = document.getElementById("orc-forma");
  const campoParcelas = document.getElementById("orc-parcelas");
  const campoSubtotal = document.getElementById("orc-subtotal");
  const campoAjuste = document.getElementById("orc-ajuste");
  const campoTotal = document.getElementById("orc-total");
  const campoParcela = document.getElementById("orc-parcela");
  const linhaParcela = document.getElementById("orc-linha-parcela");
  const linhaEntrada = document.getElementById("orc-linha-entrada");
  const linhaFinanciado = document.getElementById("orc-linha-financiado");
  const campoEntrada = document.getElementById("orc-entrada");
  const campoFinanciado = document.getElementById("orc-financiado");

  const ajusteLabel = document.getElementById("orc-ajuste-label");
  const entradaLabel = document.getElementById("orc-entrada-label");

  if (!dadosRaw) {
    alert("Nenhum cálculo encontrado. Voltando para a calculadora.");
    window.location.href = "index.html";
    return;
  }

  const dados = JSON.parse(dadosRaw);

  // Pré-carregar logos para uso no PDF (evita problemas de timing)
  // Logo colorida (para PDF normal)
  if (!window.motoChefeLogoDataUrl) {
    try {
      const logoSrc =
        document.querySelector(".logo-img")?.src ||
        "moto-chefe-maringa2-19.webp";
      if (logoSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            window.motoChefeLogoDataUrl = canvas.toDataURL("image/png");
          } catch (e) {
            console.error("Erro ao preparar logo colorida para o PDF:", e);
          }
        };
        img.onerror = () => {
          console.warn("Não foi possível carregar a imagem da logo colorida para o PDF.");
        };
        img.src = logoSrc;
      }
    } catch (e) {
      console.error("Erro ao iniciar pré-carregamento da logo colorida:", e);
    }
  }

  // Logo branca (para PDF de impressão)
  if (!window.motoChefeLogoBrancaDataUrl) {
    try {
      const logoBrancaSrc = "LOGO MC - BRANCA .png";
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          window.motoChefeLogoBrancaDataUrl = canvas.toDataURL("image/png");
        } catch (e) {
          console.error("Erro ao preparar logo branca para o PDF:", e);
        }
      };
      img.onerror = () => {
        console.warn("Não foi possível carregar a imagem da logo branca para o PDF.");
      };
      img.src = logoBrancaSrc;
    } catch (e) {
      console.error("Erro ao iniciar pré-carregamento da logo branca:", e);
    }
  }

  // Preencher produtos
  corpoProdutos.innerHTML = "";
  dados.produtos.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome || "-"}</td>
      <td>${p.qtd}</td>
      <td>${formatCurrency(p.valor)}</td>
      <td>${formatCurrency(p.subtotal)}</td>
    `;
    corpoProdutos.appendChild(tr);
  });
  
  // Popular select de produtos para desconto
  if (descontoProdutoSelect) {
    descontoProdutoSelect.innerHTML = '<option value="">Selecione um produto...</option>';
    dados.produtos.forEach((p, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${p.nome || "Produto " + (index + 1)} - ${formatCurrency(p.subtotal)}`;
      descontoProdutoSelect.appendChild(option);
    });
  }
  
  // Função para renderizar lista de descontos aplicados
  function renderizarDescontosAplicados() {
    if (!listaDescontosAplicados) return;
    
    listaDescontosAplicados.innerHTML = "";
    
    Object.keys(descontosPorProduto).forEach((indexStr) => {
      const index = parseInt(indexStr);
      const desconto = descontosPorProduto[index];
      const produto = dados.produtos[index];
      
      if (!produto || desconto <= 0) return;
      
      const novoValor = produto.subtotal - desconto;
      
      const div = document.createElement("div");
      div.className = "desconto-item";
      div.innerHTML = `
        <div class="desconto-item-info">
          <span class="desconto-item-produto">${produto.nome || "Produto " + (index + 1)}</span>
          <div class="desconto-item-valores">
            <span class="desconto-item-original">${formatCurrency(produto.subtotal)}</span>
            <span class="desconto-item-novo">${formatCurrency(novoValor)}</span>
            <span style="color: #9a9a9a;">(-${formatCurrency(desconto)})</span>
          </div>
        </div>
        <button class="btn-remover-desconto" data-index="${index}" title="Remover desconto">&times;</button>
      `;
      listaDescontosAplicados.appendChild(div);
    });
  }
  
  // Event listener para adicionar desconto
  if (btnAdicionarDesconto) {
    btnAdicionarDesconto.addEventListener("click", () => {
      const indexSelecionado = descontoProdutoSelect?.value;
      const valorDesconto = parseNumber(descontoProdutoValor?.value || "0");
      
      if (indexSelecionado === "" || indexSelecionado === null) {
        alert("Selecione um produto para aplicar o desconto.");
        return;
      }
      
      if (valorDesconto <= 0) {
        alert("Informe um valor de desconto válido.");
        return;
      }
      
      const index = parseInt(indexSelecionado);
      const produto = dados.produtos[index];
      
      if (valorDesconto > produto.subtotal) {
        alert(`O desconto não pode ser maior que o valor do produto (${formatCurrency(produto.subtotal)}).`);
        return;
      }
      
      // Adicionar ou atualizar desconto
      descontosPorProduto[index] = valorDesconto;
      
      // Limpar campos
      descontoProdutoSelect.value = "";
      descontoProdutoValor.value = "";
      
      // Atualizar lista e recalcular
      renderizarDescontosAplicados();
      recalcularResumo();
    });
  }
  
  // Event listener para remover desconto (delegação de eventos)
  if (listaDescontosAplicados) {
    listaDescontosAplicados.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-remover-desconto");
      if (btn) {
        const index = parseInt(btn.dataset.index);
        delete descontosPorProduto[index];
        renderizarDescontosAplicados();
        recalcularResumo();
      }
    });
  }

  // Resumo (forma de pagamento vindo da calculadora)
  const formaTexto =
    dados.tipoPagamento === "avista" ? "À vista (5% de desconto)" : "Parcelado";
  campoForma.textContent = formaTexto;
  campoParcelas.textContent =
    dados.tipoPagamento === "parcelado"
      ? `${dados.numeroParcelas}x`
      : "-";

  campoSubtotal.textContent = formatCurrency(dados.subtotalTotal);
  campoAjuste.textContent = formatCurrency(dados.ajuste);
  campoTotal.textContent = formatCurrency(dados.total);

  // Garantir que o grupo de frete esteja sempre visível
  const grupoFrete = document.getElementById("grupo-frete");
  if (grupoFrete) {
    grupoFrete.style.display = "block";
  }

  if (dados.tipoPagamento === "parcelado") {
    linhaParcela.style.display = "";
    campoParcela.textContent = formatCurrency(dados.valorParcela);
    grupoEntrada.style.display = "block";
  } else {
    linhaParcela.style.display = "none";
    grupoEntrada.style.display = "none";
  }

  function recalcularResumo() {
    // Total vindo da calculadora (já com juros/desconto padrão)
    let totalOriginal = dados.total;

    // Valor do primeiro produto (para calcular elegibilidade e descontos)
    const primeiroProduto = dados.produtos && dados.produtos.length > 0 ? dados.produtos[0] : null;
    const valorPrimeiroProduto = primeiroProduto ? (primeiroProduto.subtotal || 0) : 0;

    // Valor de entrada informado
    let entradaValor = parseNumber(entradaValorInput?.value || "0");
    if (entradaValor < 0) entradaValor = 0;
    if (entradaValor > totalOriginal) entradaValor = totalOriginal;

    // Atualizar porcentagem de entrada (baseada no total para exibição)
    let percEntrada = 0;
    if (totalOriginal > 0 && entradaValor > 0) {
      percEntrada = (entradaValor / totalOriginal) * 100;
    }
    if (entradaPercentualSpan) {
      entradaPercentualSpan.textContent =
        percEntrada > 0 ? `${percEntrada.toFixed(1).replace(".", ",")}%` : "0%";
    }

    // Verificar elegibilidade para desconto de 2,5% (30% do primeiro produto)
    const elegivelDesconto = valorPrimeiroProduto > 0 && entradaValor >= (valorPrimeiroProduto * 0.3);
    if (entradaDescontoCheckbox) {
      entradaDescontoCheckbox.disabled = !elegivelDesconto;
      if (!elegivelDesconto) {
        entradaDescontoCheckbox.checked = false;
      }
    }
    // Habilitar/desabilitar checkbox de exibir no PDF baseado na elegibilidade e se o desconto está aplicado
    if (entradaDescontoPdfCheckbox) {
      entradaDescontoPdfCheckbox.disabled = !elegivelDesconto || !entradaDescontoCheckbox?.checked;
      if (!elegivelDesconto || !entradaDescontoCheckbox?.checked) {
        entradaDescontoPdfCheckbox.checked = false;
      }
    }

    // Aplica ou não o desconto de 2,5% apenas no primeiro produto
    let totalBase = totalOriginal;
    let descontoEntradaValor = 0;
    if (elegivelDesconto && entradaDescontoCheckbox?.checked && valorPrimeiroProduto > 0) {
      descontoEntradaValor = valorPrimeiroProduto * 0.025;
      totalBase = totalOriginal - descontoEntradaValor;
    }

    // Desconto gerência (valor fixo em R$ adicional sobre o total já ajustado)
    let descontoGerenciaPercent = 0;
    if (descontoGerenciaCheckbox?.checked) {
      descontoGerenciaPercent = parseNumber(
        descontoGerenciaInput?.value || "0"
      );
      if (descontoGerenciaPercent < 0) descontoGerenciaPercent = 0;
      if (descontoGerenciaPercent > totalBase) descontoGerenciaPercent = totalBase;
      if (descontoGerenciaPercent > 0) {
        totalBase = totalBase - descontoGerenciaPercent;
      }
    }
    
    // Desconto do cliente (soma de todos os descontos por produto)
    let descontoCliente = 0;
    Object.keys(descontosPorProduto).forEach((indexStr) => {
      const desconto = descontosPorProduto[parseInt(indexStr)];
      if (desconto > 0) {
        descontoCliente += desconto;
      }
    });
    if (descontoCliente > totalBase) descontoCliente = totalBase;
    if (descontoCliente > 0) {
      totalBase = totalBase - descontoCliente;
    }
    
    // Frete (somar ao total)
    let freteValorResumo = parseNumber(freteInput?.value || "0");
    if (freteValorResumo < 0) freteValorResumo = 0;
    if (freteValorResumo > 0) {
      totalBase += freteValorResumo;
    }
    
    // Bonificação de frete (subtrair do total)
    let freteBonificadoResumo = 0;
    if (freteBonificacaoCheckbox?.checked && freteBonificacaoInput) {
      freteBonificadoResumo = parseNumber(freteBonificacaoInput.value || "0");
      if (freteBonificadoResumo < 0) freteBonificadoResumo = 0;
      if (freteBonificadoResumo > 0) {
        totalBase -= freteBonificadoResumo;
      }
    }

    // Cálculo de financiamento/parcela considerando entrada (apenas parcelado)
    let valorParcelaFinal =
      dados.tipoPagamento === "parcelado"
        ? totalBase / dados.numeroParcelas
        : totalBase;

    linhaEntrada.style.display = "none";
    linhaFinanciado.style.display = "none";

    if (
      dados.tipoPagamento === "parcelado" &&
      entradaValor > 0 &&
      dados.numeroParcelas > 0
    ) {
      const entradaAplicada = Math.min(entradaValor, totalBase);
      const financiado = totalBase - entradaAplicada;
      valorParcelaFinal = financiado / dados.numeroParcelas;

      entradaLabel.textContent = "Entrada";
      campoEntrada.textContent = formatCurrency(entradaAplicada);
      campoFinanciado.textContent = formatCurrency(financiado);
      linhaEntrada.style.display = "";
      linhaFinanciado.style.display = "";
    }

    // Atualizar rótulo "Juros / Desconto" automaticamente
    const temJurosBase = dados.ajuste > 0;
    const temDescontoBase = dados.ajuste < 0;
    const temDescontoEntrada =
      elegivelDesconto && entradaDescontoCheckbox?.checked;
    const temDescontoGerencia = descontoGerenciaPercent > 0;
    const temDescontoCliente = descontoCliente > 0;

    if (ajusteLabel) {
      if (temJurosBase && (temDescontoBase || temDescontoEntrada || temDescontoGerencia || temDescontoCliente)) {
        ajusteLabel.textContent = "Juros e descontos";
      } else if (temJurosBase) {
        ajusteLabel.textContent = "Juros";
      } else if (temDescontoBase || temDescontoEntrada || temDescontoGerencia || temDescontoCliente) {
        ajusteLabel.textContent = "Descontos";
      } else {
        ajusteLabel.textContent = "Juros / Desconto";
      }
    }

    // Atualizar total e parcela exibidos
    campoTotal.textContent = formatCurrency(totalBase);
    if (dados.tipoPagamento === "parcelado") {
      campoParcela.textContent = formatCurrency(valorParcelaFinal);
    }
  }

  if (entradaValorInput) {
    entradaValorInput.addEventListener("input", recalcularResumo);
  }
  if (entradaDescontoCheckbox) {
    entradaDescontoCheckbox.addEventListener("change", () => {
      // Quando o desconto é desmarcado, desmarca também o checkbox de PDF
      if (!entradaDescontoCheckbox.checked && entradaDescontoPdfCheckbox) {
        entradaDescontoPdfCheckbox.checked = false;
      }
      recalcularResumo();
    });
  }
  if (entradaDescontoPdfCheckbox) {
    entradaDescontoPdfCheckbox.addEventListener("change", recalcularResumo);
  }
  if (descontoGerenciaCheckbox) {
    descontoGerenciaCheckbox.addEventListener("change", () => {
      if (descontoGerenciaCheckbox.checked) {
        if (descontoGerenciaInput) {
          descontoGerenciaInput.style.display = "block";
          descontoGerenciaInput.focus();
        }
      } else if (descontoGerenciaInput) {
        descontoGerenciaInput.style.display = "none";
        descontoGerenciaInput.value = "";
      }
      recalcularResumo();
    });
  }
  if (descontoGerenciaInput) {
    descontoGerenciaInput.addEventListener("input", recalcularResumo);
  }

  // Event listener para bonificação de frete
  if (freteBonificacaoCheckbox) {
    freteBonificacaoCheckbox.addEventListener("change", () => {
      if (freteBonificacaoCheckbox.checked) {
        if (freteBonificacaoInput) {
          freteBonificacaoInput.style.display = "block";
          freteBonificacaoInput.focus();
        }
      } else if (freteBonificacaoInput) {
        freteBonificacaoInput.style.display = "none";
        freteBonificacaoInput.value = "";
      }
      recalcularResumo();
    });
  }
  
  // Event listener para valor do frete
  if (freteInput) {
    freteInput.addEventListener("input", recalcularResumo);
  }
  
  // Event listener para valor da bonificação de frete
  if (freteBonificacaoInput) {
    freteBonificacaoInput.addEventListener("input", recalcularResumo);
  }

  btnVoltar.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Função auxiliar para carregar logo branca
  function carregarLogoBranca() {
    return new Promise((resolve) => {
      // Se já estiver no cache, retorna imediatamente
      if (window.motoChefeLogoBrancaDataUrl) {
        resolve(window.motoChefeLogoBrancaDataUrl);
        return;
      }

      const logoBrancaSrc = "LOGO MC - BRANCA .png";
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          window.motoChefeLogoBrancaDataUrl = dataUrl;
          resolve(dataUrl);
        } catch (e) {
          console.error("Erro ao preparar logo branca:", e);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.warn("Não foi possível carregar a logo branca.");
        resolve(null);
      };
      
      img.src = logoBrancaSrc;
    });
  }

  // Função para gerar PDF (reutilizável para versão colorida e impressão)
  async function gerarPDF(versaoImpressao = false) {
    const nome = document.getElementById("cliente-nome").value.trim();
    const contato = document.getElementById("cliente-contato").value.trim();
    const obs = document.getElementById("observacoes").value.trim();

    if (!nome) {
      alert("Informe o nome do cliente para gerar o PDF.");
      return;
    }

    try {
      // Recalcular valores considerando entrada digitada e possíveis descontos
      let totalOriginal = dados.total;
      let entradaValor = parseNumber(entradaValorInput?.value || "0");
      if (entradaValor < 0) entradaValor = 0;
      if (entradaValor > totalOriginal) entradaValor = totalOriginal;

      // Valor do primeiro produto (para calcular elegibilidade e descontos)
      const primeiroProduto = dados.produtos && dados.produtos.length > 0 ? dados.produtos[0] : null;
      const valorPrimeiroProduto = primeiroProduto ? (primeiroProduto.subtotal || 0) : 0;

      // Verificar elegibilidade para desconto de 2,5% (30% do primeiro produto)
      const elegivelDesconto = valorPrimeiroProduto > 0 && entradaValor >= (valorPrimeiroProduto * 0.3);

      // Aplica ou não o desconto de 2,5% apenas no primeiro produto
      let totalBase = totalOriginal;
      let totalAntesDescontoCliente = totalOriginal; // Guardar para mostrar riscado
      let descontoEntradaValor = 0;
      
      if (elegivelDesconto && entradaDescontoCheckbox?.checked && valorPrimeiroProduto > 0) {
        descontoEntradaValor = valorPrimeiroProduto * 0.025;
        totalBase = totalOriginal - descontoEntradaValor;
        totalAntesDescontoCliente = totalBase;
      }

      // Desconto gerência (valor fixo em R$ adicional sobre o total já ajustado)
      let descontoGerenciaPercent = 0;
      if (descontoGerenciaCheckbox?.checked) {
        descontoGerenciaPercent = parseNumber(
          descontoGerenciaInput?.value || "0"
        );
        if (descontoGerenciaPercent < 0) descontoGerenciaPercent = 0;
        if (descontoGerenciaPercent > totalBase) descontoGerenciaPercent = totalBase;
        if (descontoGerenciaPercent > 0) {
          totalBase = totalBase - descontoGerenciaPercent;
          totalAntesDescontoCliente = totalBase;
        }
      }
      
      // Desconto do cliente (soma de todos os descontos por produto)
      let descontoCliente = 0;
      Object.keys(descontosPorProduto).forEach((indexStr) => {
        const desconto = descontosPorProduto[parseInt(indexStr)];
        if (desconto > 0) {
          descontoCliente += desconto;
        }
      });
      if (descontoCliente > totalBase) descontoCliente = totalBase;
      if (descontoCliente > 0) {
        totalAntesDescontoCliente = totalBase; // Valor antes do desconto do cliente
        totalBase = totalBase - descontoCliente;
      }

      let financiadoValor = 0;
      let valorParcelaFinal =
        dados.tipoPagamento === "parcelado" ? totalBase : totalBase;

      if (dados.tipoPagamento === "parcelado" && dados.numeroParcelas > 0) {
        // Considerar a entrada no financiamento
        const entradaAplicada = Math.min(entradaValor, totalBase);
        financiadoValor = totalBase - entradaAplicada;
        valorParcelaFinal = financiadoValor / dados.numeroParcelas;
      }

      // Frete
      let freteValor = 0;
      if (freteInput) {
        freteValor = parseNumber(freteInput.value || "0");
        if (freteValor < 0) freteValor = 0;
      }
      
      // Bonificação de frete (desconto no frete)
      let freteBonificadoValor = 0;
      if (freteBonificacaoCheckbox?.checked && freteBonificacaoInput) {
        freteBonificadoValor = parseNumber(freteBonificacaoInput.value || "0");
        if (freteBonificadoValor < 0) freteBonificadoValor = 0;
      }
      
      // Incluir frete e bonificação no total
      if (freteValor > 0) {
        totalBase += freteValor;
      }
      if (freteBonificadoValor > 0) {
        totalBase -= freteBonificadoValor;
      }

      // Tentar obter jsPDF tanto do bundle UMD (window.jspdf.jsPDF) quanto do global (window.jsPDF)
      let jsPDFLib = null;
      if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFLib = window.jspdf.jsPDF;
      } else if (window.jsPDF) {
        jsPDFLib = window.jsPDF;
      }

      if (!jsPDFLib) {
        alert(
          "Não foi possível carregar a biblioteca de PDF (jsPDF). Verifique sua conexão com a internet e tente novamente."
        );
        return;
      }

      const doc = new jsPDFLib();

      // Estilo geral
      doc.setFont("helvetica", "normal");

      // Medidas de página e reservas de layout
      const pageHeight = doc.internal.pageSize.getHeight();
      const bottomMargin = 12;
      const obsMaxLines = 16;
      const obsLineHeight = 4; // altura constante para controlar o espaço das observações
      const obsAreaHeight = obsMaxLines * obsLineHeight;

      // Cabeçalho - versão colorida ou impressão
      if (versaoImpressao) {
        // Versão para impressão: sem fundo preto, apenas borda
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, 200, 33);
      } else {
        // Versão colorida: com fundo cinza escuro
        doc.setFillColor(20, 20, 22);
        doc.rect(0, 0, 210, 38, "F");
      }

      // Logo – protegido com try/catch para não quebrar o PDF
      try {
        let logoDataUrl = null;

        if (versaoImpressao) {
          // PDF de impressão: usa logo branca - aguarda carregamento se necessário
          logoDataUrl = await carregarLogoBranca();
        } else {
          // PDF normal: usa logo colorida
          logoDataUrl = window.motoChefeLogoDataUrl || null;
          
          // Fallback: tenta a partir do elemento da página
          if (!logoDataUrl) {
            const logoEl = document.querySelector(".logo-img");
            if (logoEl && logoEl.complete) {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = logoEl.naturalWidth;
                canvas.height = logoEl.naturalHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(logoEl, 0, 0);
                logoDataUrl = canvas.toDataURL("image/png");
                window.motoChefeLogoDataUrl = logoDataUrl;
              } catch (e) {
                console.error("Erro ao preparar logo do elemento:", e);
              }
            }
          }
        }

        // Adiciona a logo se estiver disponível
        if (logoDataUrl) {
          doc.addImage(logoDataUrl, "PNG", 10, 8, 26, 20);
        } else {
          console.warn(`Logo não disponível para ${versaoImpressao ? 'impressão' : 'PDF normal'}`);
        }
      } catch (e) {
        // Se der erro na logo, apenas segue sem a imagem
        console.error("Erro ao adicionar logo no PDF:", e);
      }

      // Título e informações - cor depende da versão
      if (versaoImpressao) {
        doc.setTextColor(20, 20, 20);
      } else {
        doc.setTextColor(255);
      }
      
      doc.setFontSize(16);
      doc.text("Moto Chefe Maringá", 40, 14);

      doc.setFontSize(10);
      if (versaoImpressao) {
        doc.setTextColor(60, 60, 60);
      } else {
        doc.setTextColor(220);
      }
      doc.text("(44) 9 8838-1000", 40, 20);
      doc.text("(44) 3346-1866", 40, 24);
      
      doc.setFontSize(9);
      if (versaoImpressao) {
        doc.setTextColor(80, 80, 80);
      } else {
        doc.setTextColor(200);
      }
      doc.text("Av. São Paulo, 451 - Sala 01 - Centro, Maringá/PR", 40, 28);
      
      // Site da loja
      doc.setFontSize(8);
      if (versaoImpressao) {
        doc.setTextColor(0, 100, 180);
      } else {
        doc.setTextColor(100, 180, 255);
      }
      doc.text("www.motochefemaringa.com.br", 40, 33);

      // Aumentar o espaçamento entre o cabeçalho e o corpo do orçamento
      let y = 47;

      // Dados do cliente
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.setFont(undefined, "bold");
      doc.text("Dados do cliente", 10, y);
      doc.setFont(undefined, "normal");
      y += 6;

      doc.setFontSize(10);
      doc.text(`Nome: ${nome}`, 10, y);
      y += 5;
      if (contato) {
        doc.text(`Contato: ${contato}`, 10, y);
        y += 5;
      }
      const data = new Date();
      // Data alinhada à direita
      doc.text(
        `Data: ${data.toLocaleDateString("pt-BR")}`,
        150,
        50
      );

      y += 4;

      // Produtos
      y += 6;
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Produtos", 10, y);
      doc.setFont(undefined, "normal");
      y += 5;

      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text("Produto", 10, y);
      doc.text("Qtd.", 90, y);
      doc.text("V. unit.", 110, y);
      doc.text("Subtotal", 180, y);
      y += 4;
      doc.setDrawColor(200);
      doc.line(10, y, 200, y);
      y += 4;

      // Calcular descontos do primeiro produto antes do loop (reutilizando variáveis já declaradas)
      // Desconto de 5% à vista (apenas no primeiro produto)
      const descontoAvista = dados.tipoPagamento === "avista" && dados.ajuste < 0 ? Math.abs(dados.ajuste) : 0;
      
      // Desconto de 2,5% por entrada (apenas no primeiro produto)
      const descontoEntradaNoProduto = elegivelDesconto && entradaDescontoCheckbox?.checked && entradaDescontoPdfCheckbox?.checked ? descontoEntradaValor : 0;
      
      // Desconto manual por produto no primeiro produto
      const descontoManualPrimeiro = descontosPorProduto[0] || 0;
      
      // Total de descontos no primeiro produto
      const totalDescontosPrimeiroProduto = descontoAvista + descontoEntradaNoProduto + descontoManualPrimeiro;

      doc.setFontSize(9);
      doc.setTextColor(20);
      dados.produtos.forEach((p, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(p.nome || "-", 10, y);
        doc.text(String(p.qtd), 90, y);
        doc.text(formatCurrency(p.valor), 110, y);
        
        // Para o primeiro produto, aplicar todos os descontos (5%, 2,5% e manual)
        if (index === 0 && totalDescontosPrimeiroProduto > 0) {
          // Valor original riscado
          doc.setTextColor(150, 150, 150);
          const valorOriginalTexto = formatCurrency(p.subtotal);
          doc.text(valorOriginalTexto, 160, y);
          // Linha riscando
          try {
            const larguraOriginal = doc.getTextWidth(valorOriginalTexto);
            doc.setDrawColor(150, 150, 150);
            doc.setLineWidth(0.2);
            doc.line(160, y - 1, 160 + larguraOriginal, y - 1);
          } catch (e) {}
          
          // Valor com desconto (verde)
          const valorComDesconto = p.subtotal - totalDescontosPrimeiroProduto;
          if (versaoImpressao) {
            doc.setTextColor(0, 100, 0);
          } else {
            doc.setTextColor(0, 150, 0);
          }
          doc.text(formatCurrency(valorComDesconto), 180, y);
          doc.setTextColor(20);
        } else if (index > 0) {
          // Para outros produtos, verificar apenas desconto manual
          const descontoProduto = descontosPorProduto[index] || 0;
          
          if (descontoProduto > 0) {
            // Valor original riscado
            doc.setTextColor(150, 150, 150);
            const valorOriginalTexto = formatCurrency(p.subtotal);
            doc.text(valorOriginalTexto, 160, y);
            // Linha riscando
            try {
              const larguraOriginal = doc.getTextWidth(valorOriginalTexto);
              doc.setDrawColor(150, 150, 150);
              doc.setLineWidth(0.2);
              doc.line(160, y - 1, 160 + larguraOriginal, y - 1);
            } catch (e) {}
            
            // Valor com desconto (verde)
            const valorComDesconto = p.subtotal - descontoProduto;
            if (versaoImpressao) {
              doc.setTextColor(0, 100, 0);
            } else {
              doc.setTextColor(0, 150, 0);
            }
            doc.text(formatCurrency(valorComDesconto), 180, y);
            doc.setTextColor(20);
          } else {
            doc.text(formatCurrency(p.subtotal), 180, y);
          }
        } else {
          // Primeiro produto sem descontos
          doc.text(formatCurrency(p.subtotal), 180, y);
        }
        y += 5;
      });

      // Resumo do orçamento - Tabela estilizada
      y += 6;
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.setFont(undefined, "bold");
      doc.text("Resumo do orçamento", 10, y);
      doc.setFont(undefined, "normal");
      y += 6;

      // Descrição da forma de pagamento conforme calculadora
      let formaTextoPdf = "";
      if (dados.tipoPagamento === "avista") {
        formaTextoPdf = "À vista";
      } else {
        const n = dados.numeroParcelas || 1;
        if (n <= 12) {
          formaTextoPdf = `Parcelado em ${n}x (sem juros)`;
        } else {
          formaTextoPdf = `Parcelado em ${n}x`;
        }
      }

      // Forma de pagamento (antes da tabela)
      doc.setFontSize(10);
      doc.text(`Forma de pagamento: ${formaTextoPdf}`, 10, y);
      y += 6;

      // Definir larguras das colunas
      const colDescricao = 10;
      const colValor = 180;
      const larguraTabela = 190;
      const alturaLinha = 6;
      let linhaAtual = 0;

      // Cabeçalho da tabela
      const yHeader = y;
      if (versaoImpressao) {
        // Versão para impressão: fundo cinza claro
        doc.setFillColor(200, 200, 200);
        doc.rect(colDescricao, yHeader, larguraTabela - colDescricao, alturaLinha, "F");
        doc.setTextColor(20, 20, 20);
      } else {
        // Versão colorida: fundo preto
        doc.setFillColor(0, 0, 0);
        doc.rect(colDescricao, yHeader, larguraTabela - colDescricao, alturaLinha, "F");
        doc.setTextColor(255);
      }
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Descrição", colDescricao + 2, yHeader + 4);
      // Alinhar "Valor" à direita
      try {
        const valorHeaderWidth = doc.getTextWidth("Valor");
        doc.text("Valor", colValor - valorHeaderWidth, yHeader + 4);
      } catch (e) {
        doc.text("Valor", colValor - 10, yHeader + 4);
      }
      doc.setFont(undefined, "normal");
      y += alturaLinha;

      // Preparar linhas da tabela
      const linhasTabela = [];

      // Valor dos produtos
      linhasTabela.push({
        descricao: "Valor dos produtos",
        valor: dados.subtotalTotal,
        negrito: false
      });

      // Calcular descontos separadamente para exibição
      let descontosGerais = 0; // Descontos que vão em uma linha única
      let totalDescontos = 0; // Total de todos os descontos para o cálculo final
      
      // Desconto base da calculadora (se houver - ex: 5% à vista)
      if (dados.ajuste < 0) {
        descontosGerais += Math.abs(dados.ajuste);
        totalDescontos += Math.abs(dados.ajuste);
      }

      // Desconto de 2,5% por entrada (apenas no primeiro produto; só soma se checkbox de exibir no PDF estiver marcado)
      if (elegivelDesconto && entradaDescontoCheckbox?.checked && entradaDescontoPdfCheckbox?.checked && descontoEntradaValor > 0) {
        descontosGerais += descontoEntradaValor;
        totalDescontos += descontoEntradaValor;
      }
      
      // Desconto especial do cliente (somar aos descontos gerais)
      if (descontoCliente > 0) {
        descontosGerais += descontoCliente;
        totalDescontos += descontoCliente;
      }

      // Adicionar linha de Desconto (sem o desconto gerência)
      if (descontosGerais > 0) {
        linhasTabela.push({
          descricao: "Desconto",
          valor: -descontosGerais,
          negrito: false
        });
      }
      
      // Desconto gerência (linha separada)
      if (descontoGerenciaCheckbox?.checked && descontoGerenciaPercent > 0) {
        linhasTabela.push({
          descricao: "Desconto Gerência",
          valor: -descontoGerenciaPercent,
          negrito: false
        });
        totalDescontos += descontoGerenciaPercent;
      }

      // Se for parcelado, adicionar informações de parcela
      if (dados.tipoPagamento === "parcelado") {
        // Entrada sempre aparece quando houver valor (não precisa checkbox)
        if (entradaValor > 0 && totalBase > 0) {
          linhasTabela.push({
            descricao: "Entrada",
            valor: entradaValor,
            negrito: false
          });
        }

        // Valor financiado
        if (financiadoValor > 0) {
          linhasTabela.push({
            descricao: "Valor financiado",
            valor: financiadoValor,
            negrito: false
          });
        }

        // Valor da parcela
        linhasTabela.push({
          descricao: `Parcelado em ${dados.numeroParcelas}x`,
          valor: valorParcelaFinal,
          negrito: true
        });
      }

      // Frete e bonificação removidos da tabela - serão exibidos entre a tabela e o total com destaque

      // Desenhar linhas da tabela com fundo cinza alternado
      linhasTabela.forEach((linha, index) => {
        const yLinha = y + (index * alturaLinha);
        
        // Fundo cinza claro para linhas alternadas
        if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(colDescricao, yLinha, larguraTabela - colDescricao, alturaLinha, "F");
        }

        // Texto da descrição
        doc.setFontSize(10);
        doc.setTextColor(20);
        doc.setFont(undefined, linha.negrito ? "bold" : "normal");
        doc.text(linha.descricao, colDescricao + 2, yLinha + 4);

        // Valor (alinhado à direita)
        const valorTexto = formatCurrency(linha.valor);
        
        if (linha.negrito) {
          // Valor em negrito
          doc.setFont(undefined, "bold");
          // Calcular largura do texto para alinhar à direita
          try {
            const valorWidth = doc.getTextWidth(valorTexto);
            doc.text(valorTexto, colValor - valorWidth, yLinha + 4);
          } catch (e) {
            doc.text(valorTexto, colValor - 30, yLinha + 4);
          }
        } else {
          doc.setFont(undefined, "normal");
          // Calcular largura do texto para alinhar à direita
          try {
            const valorWidth = doc.getTextWidth(valorTexto);
            doc.text(valorTexto, colValor - valorWidth, yLinha + 4);
          } catch (e) {
            doc.text(valorTexto, colValor - 30, yLinha + 4);
          }
        }
      });

      y += linhasTabela.length * alturaLinha;
      y += 3;

      // Frete com destaque (entre a tabela e o total)
      if (freteValor > 0 || freteBonificadoValor > 0) {
        // Linha separadora antes do frete
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(colDescricao, y, larguraTabela, y);
        y += 5;
        
        // Calcular valor final do frete
        let valorFreteFinal = freteValor;
        if (freteBonificadoValor > 0) {
          valorFreteFinal = freteValor - freteBonificadoValor;
        }
        
        // Frete com destaque visual
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20);
        doc.text("Frete", colDescricao + 2, y);
        
        // Valor do frete (com bonificação se houver)
        if (freteBonificadoValor > 0) {
          // Calcular larguras primeiro
          const freteFinalTexto = formatCurrency(valorFreteFinal);
          const freteOriginalTexto = formatCurrency(freteValor);
          
          let freteFinalWidth = 30;
          let freteOriginalWidth = 30;
          try {
            freteFinalWidth = doc.getTextWidth(freteFinalTexto);
            freteOriginalWidth = doc.getTextWidth(freteOriginalTexto);
          } catch (e) {}
          
          // Valor com bonificação (destacado, à direita)
          doc.setFontSize(10);
          if (versaoImpressao) {
            doc.setTextColor(0, 120, 0);
          } else {
            doc.setTextColor(0, 150, 0);
          }
          doc.setFont(undefined, "bold");
          try {
            doc.text(freteFinalTexto, colValor - freteFinalWidth, y);
          } catch (e) {
            doc.text(freteFinalTexto, colValor - 30, y);
          }
          
          // Valor original riscado (à esquerda do valor final, com espaço)
          const espacoEntreValores = 8;
          const xOriginal = colValor - freteFinalWidth - espacoEntreValores - freteOriginalWidth;
          
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.setFont(undefined, "normal");
          try {
            doc.text(freteOriginalTexto, xOriginal, y);
            // Linha riscando o valor original
            doc.setDrawColor(120, 120, 120);
            doc.setLineWidth(0.3);
            doc.line(xOriginal - 1, y - 1.5, xOriginal + freteOriginalWidth + 1, y - 1.5);
          } catch (e) {
            doc.text(freteOriginalTexto, colValor - 60, y);
          }
          
          // Texto da bonificação abaixo
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont(undefined, "italic");
          doc.text(`(Bonificação: ${formatCurrency(freteBonificadoValor)})`, colDescricao + 2, y + 4);
        } else {
          // Sem bonificação, mostra só o valor do frete (sem riscar)
          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.setTextColor(20);
          const freteTexto = formatCurrency(freteValor);
          try {
            const freteWidth = doc.getTextWidth ? doc.getTextWidth(freteTexto) : 30;
            doc.text(freteTexto, colValor - freteWidth, y);
          } catch (e) {
            doc.text(freteTexto, colValor - 30, y);
          }
        }
        
        doc.setFont(undefined, "normal");
        y += freteBonificadoValor > 0 ? 8 : 5;
        
        // Linha separadora após o frete
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(colDescricao, y, larguraTabela, y);
        y += 3;
      }

      // Total em caixa destacada
      const yTotal = y;
      const temDesconto = totalDescontos > 0 || freteBonificadoValor > 0;
      const alturaTotal = temDesconto ? 14 : 8; // Maior se tiver valor riscado
      
      // Valor original (antes de todos os descontos) = subtotal dos produtos + frete
      const valorOriginalSemDesconto = dados.subtotalTotal + freteValor;
      
      if (versaoImpressao) {
        // Versão para impressão: fundo cinza claro com borda
        doc.setFillColor(230, 230, 230);
        doc.rect(colDescricao, yTotal, larguraTabela - colDescricao, alturaTotal, "F");
        doc.setDrawColor(100, 100, 100);
        doc.rect(colDescricao, yTotal, larguraTabela - colDescricao, alturaTotal, "S");
        doc.setTextColor(20, 20, 20);
      } else {
        // Versão colorida: caixa preta
        doc.setFillColor(0, 0, 0);
        doc.rect(colDescricao, yTotal, larguraTabela - colDescricao, alturaTotal, "F");
        doc.setTextColor(255);
      }
      
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Total", colDescricao + 2, yTotal + 5);
      
      // Se tiver qualquer desconto, mostrar valor original riscado
      if (temDesconto) {
        // Valor original riscado (menor e cinza)
        doc.setFontSize(9);
        if (versaoImpressao) {
          doc.setTextColor(100, 100, 100);
        } else {
          doc.setTextColor(180, 180, 180);
        }
        const valorOriginalTexto = formatCurrency(valorOriginalSemDesconto);
        try {
          const originalWidth = doc.getTextWidth(valorOriginalTexto);
          const xOriginal = colValor - originalWidth;
          doc.text(valorOriginalTexto, xOriginal, yTotal + 5);
          // Linha riscando o valor original
          doc.setDrawColor(versaoImpressao ? 100 : 180, versaoImpressao ? 100 : 180, versaoImpressao ? 100 : 180);
          doc.setLineWidth(0.3);
          doc.line(xOriginal - 1, yTotal + 3.5, xOriginal + originalWidth + 1, yTotal + 3.5);
        } catch (e) {
          doc.text(valorOriginalTexto, colValor - 30, yTotal + 5);
        }
        
        // Valor com desconto (maior e destacado)
        doc.setFontSize(12);
        if (versaoImpressao) {
          doc.setTextColor(0, 120, 0);
        } else {
          doc.setTextColor(100, 255, 100);
        }
        doc.setFont(undefined, "bold");
        const totalTexto = formatCurrency(totalBase);
        try {
          const totalWidth = doc.getTextWidth(totalTexto);
          doc.text(totalTexto, colValor - totalWidth, yTotal + 11);
        } catch (e) {
          doc.text(totalTexto, colValor - 30, yTotal + 11);
        }
      } else {
        // Sem desconto, mostra só o valor normal
        const totalTexto = formatCurrency(totalBase);
        try {
          const totalWidth = doc.getTextWidth(totalTexto);
          doc.text(totalTexto, colValor - totalWidth, yTotal + 5);
        } catch (e) {
          doc.text(totalTexto, colValor - 30, yTotal + 5);
        }
      }
      
      doc.setFont(undefined, "normal");
      y += alturaTotal + 3;

      // Validade do orçamento (se preenchida)
      if (validadeInput && validadeInput.value) {
        // Pular duas linhas para dar espaço
        y += 10;
        const validadeDate = new Date(validadeInput.value);
        const validadeFormatada = validadeDate.toLocaleDateString("pt-BR");
        doc.setFontSize(10);
        doc.setTextColor(20);
        // "Validade do orçamento" em itálico
        doc.setFont(undefined, "italic");
        doc.text("Validade do orçamento:", colDescricao + 2, y);
        // Data em negrito
        doc.setFont(undefined, "bold");
        try {
          const validadeWidth = doc.getTextWidth(validadeFormatada);
          doc.text(validadeFormatada, colValor - validadeWidth, y);
        } catch (e) {
          doc.text(validadeFormatada, colValor - 30, y);
        }
        doc.setFont(undefined, "normal");
        y += 5;
      }

      // Reservas fixas para observação (até 16 linhas) e desconto gerência
      const descontoGerenciaAtivo =
        descontoGerenciaCheckbox?.checked && descontoGerenciaPercent > 0;
      const descontoBlockHeight = descontoGerenciaAtivo ? 26 : 0;
      const yDescontoStart = pageHeight - bottomMargin - descontoBlockHeight;

      // Área de observação nunca invade o bloco de desconto e respeita 16 linhas
      const yObsStart = y + 6;
      const maxObsArea = Math.max(0, yDescontoStart - yObsStart);
      const maxObsLines = Math.min(
        obsMaxLines,
        Math.floor(maxObsArea / obsLineHeight)
      );

      if (obs && maxObsLines > 0) {
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20);
        doc.text("Observações", 10, yObsStart);
        doc.setFont(undefined, "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(20);

        const obsLines = doc.splitTextToSize(obs, 180).slice(0, maxObsLines);
        let obsY = yObsStart + 5;
        obsLines.forEach((linha) => {
          doc.text(linha, 10, obsY);
          obsY += obsLineHeight;
        });
        // Garantir que o restante volte para cor padrão
        doc.setTextColor(20);
      }

      // Avança o cursor até o fim da área reservada (mesmo que não tenha observações)
      const obsAreaConsumida = Math.min(obsAreaHeight, maxObsArea);
      y = yObsStart + obsAreaConsumida;

      // Bloco de desconto de gerência sempre ancorado ao final da página
      if (descontoGerenciaAtivo) {
        const descontoY = yDescontoStart + 4;
        doc.setFontSize(9);
        doc.setTextColor(20);
        doc.setFont(undefined, "bold");
        doc.text("Desconto gerência", 10, descontoY);

        doc.setFont(undefined, "normal");
        doc.setFontSize(8.5);
        doc.text(
          "Válido para pagamentos no débito, PIX ou dinheiro.",
          10,
          descontoY + 5
        );

        const assinaturaY = yDescontoStart + descontoBlockHeight - 8;
        doc.setFontSize(8.5);
        doc.text("Autorizado por:", 10, assinaturaY);

        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.line(10, assinaturaY + 8, 90, assinaturaY + 8); // linha para assinatura
        doc.setFontSize(7.5);
        doc.text("Assinatura", 10, assinaturaY + 13);

        doc.setFont(undefined, "normal");
      }

      const sufixo = versaoImpressao ? "-impressao" : "";
      doc.save(`orcamento-${nome.replace(/\s+/g, "-").toLowerCase()}${sufixo}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert(
        "Ocorreu um erro ao gerar o PDF. Se possível, abra o console do navegador (F12) e me envie a mensagem de erro exibida."
      );
    }
  }

  // Event listeners para os botões de PDF
  btnGerarPdf.addEventListener("click", () => gerarPDF(false));
  
  if (btnGerarPdfImpressao) {
    btnGerarPdfImpressao.addEventListener("click", () => gerarPDF(true));
  }

  // Inicializar estado de entrada
  recalcularResumo();
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.id === "pagina-calculadora") {
    initCalculadora();
  } else if (document.body.id === "pagina-orcamento") {
    initOrcamento();
  }
});


