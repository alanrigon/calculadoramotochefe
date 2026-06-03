/**
 * CATÁLOGO DE PRODUTOS — Pedido de Venda
 * ======================================
 * Para cadastrar um produto novo, copie um bloco { ... } e preencha:
 *
 *   id          — código interno (sem espaços, ex: "triciclo-wx-t03")
 *   nome        — nome que aparece na lista e no PDF
 *   fichaTecnica — array de linhas (cada item vira uma linha no PDF)
 *
 * Exemplo:
 *
 *   {
 *     id: "meu-produto",
 *     nome: "Bicicleta Elétrica Modelo X",
 *     fichaTecnica: [
 *       "Motor 500W",
 *       "Bateria 48V 15Ah",
 *       "Autonomia até 40 km",
 *     ],
 *   },
 *
 * Salve o arquivo e recarregue a página Pedido de Venda no navegador.
 */

window.PRODUTOS_CATALOGO = [
  {
    id: "JET-MAX",
    nome: "JET MAX 1000w",
    fichaTecnica: [
      "Motor 1000W - Com pico de 3000W",
      "Bateria 60V 30Ah",
      "2 Lugares",
      "Autonomia de até 60KM",
    ],
  },
  {
    id: "exemplo-bike",
    nome: "Bicicleta Elétrica — modelo exemplo",
    fichaTecnica: [
      "Motor 500W",
      "Bateria 48V 12Ah",
      "Quadro em alumínio",
    ],
  },
    {
    id: "exemplo-triciclo",
    nome: "Triciclo Elétrico WX-T03 — 800W (exemplo)",
    fichaTecnica: [
      "Motor 800W",
      "Bateria 48V 20Ah",
      "3 lugares",
      "Cores disponíveis: consultar loja",
    ],
  },
    {
    id: "exemplo-triciclo",
    nome: "Triciclo Elétrico WX-T03 — 800W (exemplo)",
    fichaTecnica: [
      "Motor 800W",
      "Bateria 48V 20Ah",
      "3 lugares",
      "Cores disponíveis: consultar loja",
    ],
  },
];
