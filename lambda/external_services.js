/* eslint-disable @typescript-eslint/camelcase */
const external_services = [
  {
    uuid: '4b154b06-5ecd-43d9-afca-39738e6859d7',
    name: 'ChatGPT dummy service',
    external_service_type: 'chatgpt',
    created_on: '2019-10-15T20:07:58.529130Z',
    actions: [
      {
        name: 'ConsultarChatGPT',
        value: 'ConsultarChatGPT',
        verboseName: 'Consultar Chat GPT',
        disableEmptyParams: true,
        params: [
          {
            name: 'AditionalPrompts',
            type: 'AditionalPrompts',
            paramType: 'multiSelect',
            verboseName: 'Aditional Prompts',
            nameKey: 'text',
            valueKey: 'uuid',
            required: true,
            defaultValue: [],
            options: [
              {
                text: 'Aditional Prompt 1 content',
                uuid: 'ab154b06-5ecd-43d9-afca-39738e6859d7'
              },
              {
                text: 'Aditional Prompt 2 content',
                uuid: 'ac154b06-5ecd-43d9-afca-39738e6859d7'
              },
              {
                text: 'Aditional Prompt 3 content',
                uuid: 'ad154b06-5ecd-43d9-afca-39738e6859d7'
              }
            ]
          },
          {
            name: 'SendCompleteHistory',
            type: 'SendCompleteHistory',
            paramType: 'boolean',
            verboseName: 'Send complete messages history as context',
            defaultValue: true,
            required: true
          },
          {
            name: 'UserInput',
            type: 'UserInput',
            paramType: 'expressionInput',
            verboseName: 'User Input',
            defaultValue: '@input.value',
            required: true
          }
        ]
      }
    ]
  },
  {
    uuid: '5b154b06-5ecd-43d9-afca-39738e6859d7',
    name: 'Omie dummy project 2',
    external_service_type: 'omie',
    created_on: '2020-10-15T20:07:58.529130Z',
    actions: [
      {
        name: 'IncluirContato',
        value: 'IncluirContato',
        verboseName: 'Inserir Contato',
        params: [
          {
            name: 'identificacao',
            type: 'identificacao',
            verboseName: 'Identificação',
            filters: [
              {
                name: 'nCod',
                type: 'integer',
                verboseName: 'Código do Contato'
              },
              {
                name: 'cCodInt',
                type: 'text',
                verboseName: 'Código de Integração',
                required: true
              },
              {
                name: 'cNome',
                type: 'string',
                verboseName: 'Nome do contato',
                required: true
              },
              {
                name: 'cSobrenome',
                type: 'string',
                verboseName: 'Sobrenome do contato'
              },
              {
                name: 'cCargo',
                type: 'string',
                verboseName: 'Cargo'
              },
              {
                name: 'dDtNasc',
                type: 'string',
                verboseName: 'Data de Nascimento'
              },
              {
                name: 'nCodVend',
                type: 'integer',
                verboseName: 'Código do Vendedor'
              },
              {
                name: 'nCodConta',
                type: 'integer',
                verboseName: 'Código da Conta'
              }
            ]
          },
          {
            name: 'endereco',
            type: 'endereco',
            verboseName: 'Endereço',
            filters: [
              {
                name: 'cEndereco',
                type: 'string',
                maxLength: 60,
                verboseName: 'Endereço do contato'
              },
              {
                name: 'cCompl',
                type: 'string',
                maxLength: 200,
                verboseName: 'Complemento '
              },
              {
                name: 'cCEP',
                type: 'string',
                maxLength: 10,
                verboseName: 'CEP'
              },
              {
                name: 'cBairro',
                type: 'string',
                maxLength: 60,
                verboseName: 'Bairro '
              },
              {
                name: 'cCidade',
                type: 'string',
                maxLength: 50,
                verboseName: 'Cidade '
              },
              {
                name: 'cUF',
                type: 'string',
                maxLength: 50,
                verboseName: 'Estado '
              },
              {
                name: 'cPais',
                type: 'string',
                maxLength: 50,
                verboseName: 'País'
              }
            ]
          },
          {
            type: 'telefone_email',
            verboseName: 'Telefone e Email',
            filters: [
              {
                name: 'cDDDCel1',
                type: 'string',
                maxLength: 5,
                verboseName: 'DDD do celular 1'
              },
              {
                name: 'cNumCel1',
                type: 'string',
                maxLength: 15,
                verboseName: 'Número do Celular 1'
              },

              {
                name: 'cDDDCel2',
                type: 'string',
                maxLength: 5,
                verboseName: 'DDD do Celular 2'
              },
              {
                name: 'cNumCel2',
                type: 'string',
                maxLength: 15,
                verboseName: 'Número do Celular 2'
              },
              {
                name: 'cDDDTel',
                type: 'string',
                maxLength: 5,
                verboseName: 'DDD do Telefone'
              },
              {
                name: 'cNumTel',
                type: 'string',
                maxLength: 15,
                verboseName: 'Número do Telefone'
              },
              {
                name: 'cDDDFax',
                type: 'string',
                maxLength: 5,
                verboseName: 'DDD do Fax'
              },
              {
                name: 'cNumFax',
                type: 'string',
                maxLength: 15,
                verboseName: 'Número do Fax'
              },
              {
                name: 'cEmail',
                type: 'string',
                maxLength: 200,
                verboseName: 'E-mail do contato'
              },
              {
                name: 'cWebsite',
                type: 'string',
                maxLength: 100,
                verboseName: 'WebSite'
              }
            ]
          },
          {
            type: 'cObs',
            verboseName: 'Observações',
            filters: []
          }
        ]
      },
      {
        name: 'IncluirOportunidade',
        value: 'IncluirOportunidade',
        verboseName: 'Incluir Oportunidade',
        params: [
          {
            type: 'identificacao',
            verboseName: 'Cabeçalho da Oportunidade',
            filters: [
              {
                name: 'nCodOp',
                type: 'integer',
                verboseName: 'Código da Oportunidade'
              },
              {
                name: 'cCodIntOp',
                type: 'text',
                verboseName: 'Código de integração da oportunidade',
                required: true
              },
              {
                name: 'cDesOp',
                type: 'string',
                maxLength: 100,
                verboseName: 'Descrição da oportunidade',
                required: true
              },
              {
                name: 'nCodContato',
                type: 'integer',
                verboseName: 'Código do contato',
                required: true
              },
              {
                name: 'nCodSolucao',
                type: 'integer',
                verboseName: 'Código da solução',
                required: true
              },
              {
                name: 'nCodOrigem',
                type: 'integer',
                verboseName: 'Código da origem',
                required: true
              },
              {
                name: 'nCodConta',
                type: 'integer',
                verboseName: 'Código da conta'
              },
              {
                name: 'nCodVendedor',
                type: 'integer',
                verboseName: 'Código do vendedor',
                required: true
              }
            ]
          },
          {
            type: 'fasesStatus',
            verboseName: 'Fase e Status da Oportunidade',
            filters: [
              {
                name: 'nCodFase',
                type: 'integer',
                verboseName: 'Código da fase'
              },
              {
                name: 'nCodStatus',
                type: 'integer',
                verboseName: 'Código do status'
              },
              {
                name: 'nCodMotivo',
                type: 'integer',
                verboseName: 'Código do motivo'
              },
              {
                name: 'dNovoLead',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data do Novo Lead'
              },
              {
                name: 'dQualificacao',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data da Qualificação.'
              },
              {
                name: 'dTreinamento',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data de Treinamento'
              },
              {
                name: 'dShowRoom',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data de ShowRoom'
              },
              {
                name: 'dProjeto',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data de projeto'
              },
              {
                name: 'dConclusao',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data de conclusão'
              }
            ]
          },
          {
            type: 'ticket',
            verboseName: 'Ticket da Oportunidade',
            filters: [
              {
                name: 'nProdutos',
                type: 'float',
                verboseName: 'Valor de produtos'
              },
              {
                name: 'nServicos',
                type: 'float',
                verboseName: 'Valor de serviços'
              },
              {
                name: 'nRecorrencia',
                type: 'float',
                verboseName: 'Valor da recorrência'
              },
              {
                name: 'nMeses',
                type: 'integer',
                verboseName: 'Meses de contrato'
              },
              {
                name: 'nTicket',
                type: 'float',
                verboseName: 'Valor do ticket calculado'
              }
            ]
          },
          {
            type: 'previsaoTemp',
            verboseName: 'Previsão e Temperatura',
            filters: [
              {
                name: 'nTemperatura',
                type: 'integer',
                verboseName: 'Temperatura'
              },
              {
                name: 'nMesPrev',
                type: 'integer',
                verboseName: 'Mês de previsão de fechamento'
              },
              {
                name: 'nAnoPrev',
                type: 'integer',
                verboseName: 'Ano de previsão de fechamento'
              }
            ]
          },
          {
            type: 'observacoes',
            verboseName: 'Observações da oportunidade',
            filters: [
              {
                name: 'cObs',
                type: 'text',
                verboseName: 'Observações'
              }
            ]
          },
          {
            type: 'outrasInf',
            verboseName: 'Outras informações',
            filters: [
              {
                name: 'nCodTipo',
                type: 'integer',
                verboseName: 'Código do tipo'
              },
              {
                name: 'cEmailOp',
                type: 'string',
                maxLength: 100,
                verboseName: 'E-mail da oportunidade'
              },
              {
                name: 'dInclusao',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data de inclusão da oportunidade'
              },
              {
                name: 'hInclusao',
                type: 'string',
                maxLength: 8,
                verboseName: 'Hora de inclusão da oportunidade'
              },
              {
                name: 'dAlteracao',
                type: 'string',
                maxLength: 10,
                verboseName: 'Data de alteração da oportunidade'
              },
              {
                name: 'hAlteracao',
                type: 'string',
                maxLength: 8,
                verboseName: 'Hora de alteração da oportunidade'
              }
            ]
          },
          {
            type: 'envolvidos',
            verboseName: 'Envolvidos na oportunidade',
            filters: [
              {
                name: 'nCodFinder',
                type: 'integer',
                verboseName: 'Código do Finder'
              },
              {
                name: 'nCodParceiro',
                type: 'integer',
                verboseName: 'Código do parceiro'
              },
              {
                name: 'nCodPrevenda',
                type: 'integer',
                verboseName: 'Código da prevenda'
              }
            ]
          }
        ]
      },
      {
        name: 'ListarClientes',
        value: 'ListarClientes',
        verboseName: 'Listar Clientes',
        params: [
          {
            type: 'pagina',
            paramType: 'integer',
            verboseName: 'Número da página retornada'
          },
          {
            type: 'registros_por_pagina',
            paramType: 'integer',
            verboseName: 'Número de registros retornados na página'
          },
          {
            type: 'apenas_importado_api',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Exibir apenas os registros gerados pela API'
          },
          {
            type: 'ordenar_por',
            paramType: 'string',
            maxLength: 100,
            verboseName: 'Ordem de exibição dos dados'
          },
          {
            type: 'ordem_decrescente',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Se a lista será apresentada em ordem decrescente'
          },
          {
            type: 'filtrar_por_data_de',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Filtrar os registros a partir de uma data'
          },
          {
            type: 'filtrar_por_data_ate',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Filtrar os registros até uma data'
          },
          {
            type: 'filtrar_por_hora_de',
            paramType: 'string',
            maxLength: 8,
            verboseName: 'Filtro por hora a apartir de'
          },
          {
            type: 'filtrar_por_hora_ate',
            paramType: 'string',
            maxLength: 8,
            verboseName: 'Filtro por hora até'
          },
          {
            type: 'filtrar_apenas_inclusao',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Filtrar apenas os registros incluídos'
          },
          {
            type: 'filtrar_apenas_alteracao',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Filtrar apenas os registros alterados'
          },
          {
            type: 'clientesFiltro',
            verboseName: 'Filtrar cadastro de clientes',
            filters: [
              {
                name: 'codigo_cliente_omie',
                type: 'integer',
                verboseName: 'Código de Cliente / Fornecedor'
              },
              {
                name: 'codigo_cliente_integracao',
                type: 'string',
                maxLength: 60,
                verboseName: 'Código de Integração com sistemas legados.'
              },
              {
                name: 'cnpj_cpf',
                type: 'string',
                maxLength: 20,
                verboseName: 'CNPJ / CPF'
              },
              {
                name: 'razao_social',
                type: 'string',
                maxLength: 60,
                verboseName: 'Razão Social'
              },
              {
                name: 'nome_fantasia',
                type: 'string',
                maxLength: 100,
                verboseName: 'Nome Fantasia'
              },
              {
                name: 'endereco',
                type: 'string',
                maxLength: 60,
                verboseName: 'Endereço'
              },
              {
                name: 'bairro',
                type: 'string',
                maxLength: 60,
                verboseName: 'Bairro'
              },
              {
                name: 'cidade',
                type: 'string',
                maxLength: 40,
                verboseName: 'Código da Cidade'
              },
              {
                name: 'estado',
                type: 'string',
                maxLength: 2,
                verboseName: 'Sigla do Estado'
              },
              {
                name: 'cep',
                type: 'string',
                maxLength: 10,
                verboseName: 'CEP'
              },
              {
                name: 'contato',
                type: 'string',
                maxLength: 100,
                verboseName: 'Nome para contato'
              },
              {
                name: 'email',
                type: 'string',
                maxLength: 500,
                verboseName: 'E-Mail'
              },
              {
                name: 'homepage',
                type: 'string',
                maxLength: 100,
                verboseName: 'WebSite'
              },
              {
                name: 'inscricao_municipal',
                type: 'string',
                maxLength: 20,
                verboseName: 'Inscrição Municipal'
              },
              {
                name: 'inscricao_estadual',
                type: 'string',
                maxLength: 20,
                verboseName: 'Inscrição Estadual'
              },
              {
                name: 'inscricao_suframa',
                type: 'string',
                maxLength: 20,
                verboseName: 'Inscrição Suframa'
              },
              {
                name: 'pessoa_fisica',
                type: 'string',
                maxLength: 1,
                verboseName: 'Pessoa Física'
              },
              {
                name: 'optante_simples_nacional',
                type: 'string',
                maxLength: 1,
                verboseName: 'Indica se o Cliente / Fornecedor é Optante do Simples Nacional'
              },
              {
                name: 'inativo',
                type: 'string',
                maxLength: 1,
                verboseName: 'Indica se o cliente está inativo'
              }
            ]
          },
          {
            type: 'clientesPorCodigo',
            verboseName: 'Lista de Códigos para filtro de cliente'
          },
          {
            type: 'exibir_caracteristicas',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Exibe as caracteristicas do cliente'
          }
        ]
      },
      {
        name: 'PesquisarLancamentos',
        value: 'PesquisarLancamentos',
        verboseName: 'Pesquisar Títulos/Lançamentos',
        params: [
          {
            type: 'nPagina',
            paramType: 'integer',
            verboseName: 'Número da página retornada'
          },
          {
            type: 'nRegPorPagina',
            paramType: 'integer',
            verboseName: 'Número de registros retornados na página'
          },
          {
            type: 'cOrdenarPor',
            paramType: 'string',
            maxLength: 100,
            verboseName: 'Ordem de exibição do dados'
          },
          {
            type: 'cOrdemDecrescente',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Se a lista será apresentada em ordem decrescente.'
          },
          {
            type: 'nCodTitulo',
            paramType: 'integer',
            verboseName: 'Código do titulo'
          },
          {
            type: 'cCodIntTitulo',
            paramType: 'string',
            maxLength: 20,
            verboseName: 'Código de integração do título'
          },
          {
            type: 'cNumTitulo',
            paramType: 'string',
            maxLength: 20,
            verboseName: 'Número do título'
          },
          {
            type: 'dDtEmisDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Filtrar os títulos pela data de emissão - de'
          },
          {
            type: 'dDtEmisAte',
            paramType: 'string',
            maxLength: 8,
            verboseName: 'Filtrar os títulos pela data de emissão - até'
          },
          {
            type: 'dDtVencDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de vencimento do título - de'
          },
          {
            type: 'dDtVencAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de vencimento do título - até'
          },
          {
            type: 'dDtPagtoDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data do Lançamento - de'
          },
          {
            type: 'dDtPagtoAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de Lançamento - até'
          },
          {
            type: 'dDtPrevDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de previsão de Pagamento/Recebimento - de'
          },
          {
            type: 'dDtPrevAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de previsão de Pagamento/Recebimento - até'
          },
          {
            type: 'dDtRegDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de registro da NF - de'
          },
          {
            type: 'dDtRegAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de registro da NF - até'
          },
          {
            type: 'nCodCliente',
            paramType: 'integer',
            verboseName: 'Código de Cliente / Fornecedor'
          },
          {
            type: 'cCPFCNPJCliente',
            paramType: 'string',
            maxLength: 20,
            verboseName: 'Filtrar os títulos por CPF/CNPJ do cliente'
          },
          {
            type: 'nCodCtr',
            paramType: 'integer',
            verboseName: 'Código do contrato associado ao título'
          },
          {
            type: 'cNumCtr',
            paramType: 'string',
            maxLength: 20,
            verboseName: 'Número do contrato associado ao título'
          },
          {
            type: 'nCodOS',
            paramType: 'integer',
            verboseName: 'Código do Pedido de Venda / Ordem de Serviço'
          },
          {
            type: 'cNumOS',
            paramType: 'string',
            maxLength: 15,
            verboseName: 'Número do pedido de venda / Ordem de Serviço'
          },
          {
            type: 'nCodCC',
            paramType: 'integer',
            verboseName: 'Código da conta corrente'
          },
          {
            type: 'cStatus',
            paramType: 'string',
            maxLength: 100,
            verboseName: 'Status do título'
          },
          {
            type: 'cNatureza',
            paramType: 'string',
            maxLength: 1,
            verboseName: 'Natureza do título'
          },
          {
            type: 'cTipo',
            paramType: 'string',
            maxLength: 5,
            verboseName: 'Tipo de documento'
          },
          {
            type: 'cOperacao',
            paramType: 'string',
            maxLength: 2,
            verboseName: 'Operação do título'
          },
          {
            type: 'cNumDocFiscal',
            paramType: 'string',
            maxLength: 20,
            verboseName: 'Número do documento fiscal'
          },
          {
            type: 'cCodigoBarras',
            paramType: 'string',
            maxLength: 70,
            verboseName: 'Código de Barras do título'
          },
          {
            type: 'nCodProjeto',
            paramType: 'integer',
            verboseName: 'Código do projeto'
          },
          {
            type: 'nCodVendedor',
            paramType: 'integer',
            verboseName: 'Código do vendedor'
          },
          {
            type: 'nCodComprador',
            paramType: 'integer',
            verboseName: 'Código do comprador'
          },
          {
            type: 'cCodCateg',
            paramType: 'string',
            maxLength: 20,
            verboseName: 'Código da categoria'
          },
          {
            type: 'dDtIncDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de inclusão - de'
          },
          {
            type: 'dDtIncAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de inclusão - até'
          },
          {
            type: 'dDtAltDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de alteração - de'
          },
          {
            type: 'dDtAltAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de alteração - até'
          },
          {
            type: 'dDtCancDe',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de Cancelamento do título - de'
          },
          {
            type: 'dDtCancAte',
            paramType: 'string',
            maxLength: 10,
            verboseName: 'Data de Cancelamento do título - até'
          },
          {
            type: 'cChaveNFe',
            paramType: 'string',
            maxLength: 44,
            verboseName: 'Chave da NF-e, CT-e, NFC-e de origem'
          }
        ]
      },
      {
        name: 'VerificarContato',
        value: 'VerificarContato',
        verboseName: 'Verificar Contato',
        params: [
          {
            type: 'cNome',
            paramType: 'string',
            verboseName: 'Nome do contato'
          },
          {
            type: 'cEmail',
            paramType: 'string',
            verboseName: 'Email do contato'
          }
        ]
      },
      {
        name: 'ObterBoleto',
        value: 'ObterBoleto',
        verboseName: 'Obter Boleto',
        params: [
          {
            type: 'nCodTitulo',
            paramType: 'integer',
            verboseName: 'Código do Boleto',
            required: true
          },
          {
            type: 'cCodIntTitulo',
            paramType: 'string',
            verboseName: 'Código de Integração do Título',
            required: true
          }
        ]
      }
    ]
  }
];

const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: external_services }) }));
