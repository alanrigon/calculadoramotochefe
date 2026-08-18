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
    nome: "Moto Elétrica JET MAX 1000W",
    fichaTecnica: [
      "Motor: 1000W (pico de 3000W)",
      "Bateria: 60V 30Ah",
      "Capacidade: 2 lugares",
      "Autonomia: até 60km"
    ]
  },

  {
    id: "SOMA-1000W",
    nome: "Moto Elétrica SOMA 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Velocidade máxima: 32km/h",
      "Bateria: Lítio 20Ah 60V",
      "Peso suportado: 180kg"
    ]
  },

  {
    id: "JET-1000W",
    nome: "Moto Elétrica JET 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Categoria: Autopropelido",
      "Não necessita CNH",
      "Suspensão dianteira e traseira"
    ]
  },

  {
    id: "GIGA-1000W",
    nome: "Scooter Elétrica GIGA 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Bateria: Lítio 24Ah 60V",
      "Categoria: Autopropelido",
      "Não necessita CNH"
    ]
  },

  {
    id: "MIA-1000W",
    nome: "Scooter Elétrica MIA 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Categoria: Autopropelido",
      "Não necessita CNH",
      "Suspensão dianteira e traseira"
    ]
  },

  {
    id: "BOB-1000W",
    nome: "Bicicleta Elétrica BOB 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Bateria: Lítio removível",
      "Velocidade máxima: 32km/h",
      "Autonomia: 40 a 50km"
    ]
  },

  {
    id: "JOY-SUPER-800W",
    nome: "Bicicleta Elétrica JOY SUPER 800W",
    fichaTecnica: [
      "Motor: 800W",
      "Bateria: Lítio removível 20Ah 60V",
      "Velocidade máxima: 32km/h",
      "Autonomia: 40 a 50km"
    ]
  },

  {
    id: "PITICA-500W",
    nome: "Bicicleta Elétrica PITICA 500W",
    fichaTecnica: [
      "Motor: 500W",
      "Categoria: Autopropelido",
      "Não necessita CNH",
      "Autonomia de até 35km"
    ]
  },

  {
    id: "X12-1000W",
    nome: "Scooter Elétrica X12 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Categoria: Autopropelido",
      "Não necessita CNH",
      "Autonomia de até 45km"
    ]
  },

  {
    id: "MC20-MINI-1000W",
    nome: "Scooter Elétrica MC20 MINI 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Categoria: Autopropelido",
      "Não necessita CNH",
      "Autonomia de até 45km"
    ]
  },

  {
    id: "RET",
    nome: "Autopropelido RET 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Configuração: Autopropelido",
      "Não necessita CNH",
      "Autonomia de até 45km"
    ]
  },

    {
    id: "MIA-TRI-800W",
    nome: "Triciclo Elétrico MIA TRI 800W",
    fichaTecnica: [
      "Motor: 800W",
      "Configuração: Triciclo",
      "Não necessita CNH",
      "Autonomia de até 45km"
    ]
  },
    {
    id: "X15",
    nome: "Triciclo Elétrico X15 3000W",
    fichaTecnica: [
      "Motor: 3000W",
      "Configuração: Triciclo",
      "Velocidade Máxima: 75km/h",
      "Autonomia de até 40-45km"
    ]
  },
  {
    id: "BIG-TRI-1000W",
    nome: "Triciclo Elétrico BIG TRI 1000W",
    fichaTecnica: [
      "Motor: 1000W",
      "Configuração: Triciclo",
      "Não necessita CNH",
      "Autonomia de até 55km"
    ]
  }
];
