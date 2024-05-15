export const completion = {
  context: {
    types: [
      {
        name: 'fields',
        key_source: 'fields',
        property_template: {
          key: '{key}',
          help: '{key} para o contato',
          type: 'any'
        }
      },
      {
        name: 'results',
        key_source: 'results',
        property_template: {
          key: '{key}',
          help: 'o resultado para {key}',
          type: 'result'
        }
      },
      {
        name: 'globals',
        key_source: 'globals',
        property_template: {
          key: '{key}',
          help: 'o valor global {key}',
          type: 'text'
        }
      },
      {
        name: 'urns',
        properties: [
          {
            key: 'discord',
            help: 'Discord URN para o contato',
            type: 'text'
          },
          {
            key: 'ext',
            help: 'Ext URN para o contato',
            type: 'text'
          },
          {
            key: 'facebook',
            help: 'Facebook URN para o contato',
            type: 'text'
          },
          {
            key: 'fcm',
            help: 'Fcm URN para o contato',
            type: 'text'
          },
          {
            key: 'freshchat',
            help: 'Freshchat URN para o contato',
            type: 'text'
          },
          {
            key: 'instagram',
            help: 'Instagram URN para o contato',
            type: 'text'
          },
          {
            key: 'jiochat',
            help: 'Jiochat URN para o contato',
            type: 'text'
          },
          {
            key: 'line',
            help: 'Line URN para o contato',
            type: 'text'
          },
          {
            key: 'mailto',
            help: 'Mailto URN para o contato',
            type: 'text'
          },
          {
            key: 'rocketchat',
            help: 'Rocketchat URN para o contato',
            type: 'text'
          },
          {
            key: 'slack',
            help: 'Slack URN para o contato',
            type: 'text'
          },
          {
            key: 'teams',
            help: 'Teams URN para o contato',
            type: 'text'
          },
          {
            key: 'tel',
            help: 'Tel URN para o contato',
            type: 'text'
          },
          {
            key: 'telegram',
            help: 'Telegram URN para o contato',
            type: 'text'
          },
          {
            key: 'twitter',
            help: 'Twitter URN para o contato',
            type: 'text'
          },
          {
            key: 'twitterid',
            help: 'Twitterid URN para o contato',
            type: 'text'
          },
          {
            key: 'viber',
            help: 'Viber URN para o contato',
            type: 'text'
          },
          {
            key: 'vk',
            help: 'Vk URN para o contato',
            type: 'text'
          },
          {
            key: 'webchat',
            help: 'Webchat URN para o contato',
            type: 'text'
          },
          {
            key: 'wechat',
            help: 'Wechat URN para o contato',
            type: 'text'
          },
          {
            key: 'whatsapp',
            help: 'WhatsApp URN para o contato',
            type: 'text'
          }
        ]
      },
      {
        name: 'channel',
        properties: [
          {
            key: '__default__',
            help: 'o nome',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'o UUID do canal',
            type: 'text'
          },
          {
            key: 'name',
            help: 'o nome do canal',
            type: 'text'
          },
          {
            key: 'address',
            help: 'o endereço do canal',
            type: 'text'
          }
        ]
      },
      {
        name: 'contact',
        properties: [
          {
            key: '__default__',
            help: 'o nome da URN',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'o UUID do contato',
            type: 'text'
          },
          {
            key: 'id',
            help: 'o ID numérico do contato',
            type: 'text'
          },
          {
            key: 'first_name',
            help: 'o primeiro nome do contato',
            type: 'text'
          },
          {
            key: 'name',
            help: 'o nome do contato',
            type: 'text'
          },
          {
            key: 'language',
            help: 'a língua do contato como código ISO de 3 letras',
            type: 'text'
          },
          {
            key: 'status',
            help: 'the status of the contact',
            type: 'text'
          },
          {
            key: 'created_on',
            help: 'a data de criação do contato',
            type: 'datetime'
          },
          {
            key: 'last_seen_on',
            help: 'a última data vista do contato',
            type: 'any'
          },
          {
            key: 'urns',
            help: 'as URNs pertencentes ao contato',
            type: 'text',
            array: true
          },
          {
            key: 'urn',
            help: 'a URN preferida do contato',
            type: 'text'
          },
          {
            key: 'groups',
            help: 'os grupos ao qual o contato pertence',
            type: 'group',
            array: true
          },
          {
            key: 'fields',
            help: 'os valores customizados do contato',
            type: 'fields'
          },
          {
            key: 'channel',
            help: 'o canal preferido do contato',
            type: 'channel'
          },
          {
            key: 'tickets',
            help: 'the open tickets of the contact',
            type: 'ticket',
            array: true
          }
        ]
      },
      {
        name: 'flow',
        properties: [
          {
            key: '__default__',
            help: 'o nome',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'o UUID do fluxo',
            type: 'text'
          },
          {
            key: 'name',
            help: 'o nome do fluxo',
            type: 'text'
          },
          {
            key: 'revision',
            help: 'o número de revisão do fluxo',
            type: 'text'
          }
        ]
      },
      {
        name: 'group',
        properties: [
          {
            key: 'uuid',
            help: 'o UUID do grupo',
            type: 'text'
          },
          {
            key: 'name',
            help: 'o nome do grupo',
            type: 'text'
          }
        ]
      },
      {
        name: 'input',
        properties: [
          {
            key: '__default__',
            help: 'o texto e anexos',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'o UUID da entrada',
            type: 'text'
          },
          {
            key: 'created_on',
            help: 'a data de criação da entrada',
            type: 'datetime'
          },
          {
            key: 'channel',
            help: 'o canal onde a entrada foi recebida',
            type: 'channel'
          },
          {
            key: 'urn',
            help: 'a URN do contato que a entrada foi recebida',
            type: 'text'
          },
          {
            key: 'text',
            help: 'a parte de texto da entrada',
            type: 'text'
          },
          {
            key: 'attachments',
            help: 'quaisquer anexos na entrada',
            type: 'text',
            array: true
          },
          {
            key: 'external_id',
            help: 'o ID externo da entrada',
            type: 'text'
          }
        ]
      },
      {
        name: 'node',
        properties: [
          {
            key: 'uuid',
            help: 'o UUID do nó',
            type: 'text'
          },
          {
            key: 'visit_count',
            help: 'o contador de visitas para o nó nesta execução',
            type: 'number'
          }
        ]
      },
      {
        name: 'related_run',
        properties: [
          {
            key: '__default__',
            help: 'o nome do contato e UUID do fluxo',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'o UUID da execução',
            type: 'text'
          },
          {
            key: 'contact',
            help: 'o contato da exeução',
            type: 'contact'
          },
          {
            key: 'flow',
            help: 'o fluxo da execução',
            type: 'flow'
          },
          {
            key: 'fields',
            help: 'os valores customizados da execução',
            type: 'fields'
          },
          {
            key: 'urns',
            help: 'os valores de URN da execução',
            type: 'urns'
          },
          {
            key: 'results',
            help: 'os resultados salvos pela execução',
            type: 'any'
          },
          {
            key: 'status',
            help: 'o status da atual execução',
            type: 'text'
          }
        ]
      },
      {
        name: 'result',
        properties: [
          {
            key: '__default__',
            help: 'o valor',
            type: 'text'
          },
          {
            key: 'name',
            help: 'o nome do resultado',
            type: 'text'
          },
          {
            key: 'value',
            help: 'o valor do resultado',
            type: 'text'
          },
          {
            key: 'category',
            help: 'a categoria do resultado',
            type: 'text'
          },
          {
            key: 'category_localized',
            help: 'a categoria localizada do resultado',
            type: 'text'
          },
          {
            key: 'input',
            help: 'a entrada do resultado',
            type: 'text'
          },
          {
            key: 'extra',
            help: 'os dados extras do resultado como resposta de webhook',
            type: 'any'
          },
          {
            key: 'node_uuid',
            help: 'o UUID do nó no fluxo que gerou o resultado',
            type: 'text'
          },
          {
            key: 'created_on',
            help: 'a data de ciração do resultado',
            type: 'datetime'
          }
        ]
      },
      {
        name: 'resume',
        properties: [
          {
            key: 'type',
            help: 'o tipo de resumo que resumiu esta sessão',
            type: 'text'
          }
        ]
      },
      {
        name: 'run',
        properties: [
          {
            key: '__default__',
            help: 'o nome do contato e UUID do fluxo',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'o UUID da execução',
            type: 'text'
          },
          {
            key: 'contact',
            help: 'o contato da exeução',
            type: 'contact'
          },
          {
            key: 'flow',
            help: 'o fluxo da execução',
            type: 'flow'
          },
          {
            key: 'status',
            help: 'o status da atual execução',
            type: 'text'
          },
          {
            key: 'results',
            help: 'os resultados salvos pela execução',
            type: 'results'
          },
          {
            key: 'created_on',
            help: ' data de criação da execução',
            type: 'datetime'
          },
          {
            key: 'exited_on',
            help: 'a data de saída da execução',
            type: 'datetime'
          }
        ]
      },
      {
        name: 'ticket',
        properties: [
          {
            key: 'uuid',
            help: 'the UUID of the ticket',
            type: 'text'
          },
          {
            key: 'subject',
            help: 'the subject of the ticket',
            type: 'text'
          },
          {
            key: 'body',
            help: 'the body of the ticket',
            type: 'text'
          }
        ]
      },
      {
        name: 'topic',
        properties: [
          {
            key: '__default__',
            help: 'o nome',
            type: 'text'
          },
          {
            key: 'uuid',
            help: 'the UUID of the topic',
            type: 'text'
          },
          {
            key: 'name',
            help: 'the name of the topic',
            type: 'text'
          }
        ]
      },
      {
        name: 'trigger',
        properties: [
          {
            key: 'type',
            help: 'o tipo do gatilho que iniciou a sessão',
            type: 'text'
          },
          {
            key: 'params',
            help: 'os parâmetros passados para o gatilho',
            type: 'any'
          },
          {
            key: 'keyword',
            help: 'a palavra para combinar se uma uma palavra de gatilho',
            type: 'text'
          },
          {
            key: 'user',
            help: 'o usuário que iniciou a sessão se for um gatilho manual',
            type: 'user'
          },
          {
            key: 'origin',
            help: 'a origem desta sessão se for um gatilho manual',
            type: 'text'
          },
          {
            key: 'ticket',
            help: 'the ticket if this is a ticket trigger',
            type: 'ticket'
          }
        ]
      },
      {
        name: 'user',
        properties: [
          {
            key: '__default__',
            help: 'the name or email',
            type: 'text'
          },
          {
            key: 'email',
            help: 'the email address of the user',
            type: 'text'
          },
          {
            key: 'name',
            help: 'the name of the user',
            type: 'text'
          },
          {
            key: 'first_name',
            help: 'the first name of the user',
            type: 'text'
          }
        ]
      }
    ],
    root: [
      {
        key: 'contact',
        help: 'o contato',
        type: 'contact'
      },
      {
        key: 'fields',
        help: 'os valores customizados do contato',
        type: 'fields'
      },
      {
        key: 'urns',
        help: 'os valores de URN do contato',
        type: 'urns'
      },
      {
        key: 'results',
        help: 'os resultados da execução atual',
        type: 'results'
      },
      {
        key: 'input',
        help: 'a entrada atual do contato',
        type: 'input'
      },
      {
        key: 'run',
        help: 'a execução atual',
        type: 'run'
      },
      {
        key: 'child',
        help: 'a última execução do filho',
        type: 'related_run'
      },
      {
        key: 'parent',
        help: 'o pai da exeução',
        type: 'related_run'
      },
      {
        key: 'ticket',
        help: 'the last opened ticket for the contact',
        type: 'ticket'
      },
      {
        key: 'webhook',
        help: 'a resposta JSON avaliada da última chamada webhook',
        type: 'any'
      },
      {
        key: 'node',
        help: 'o nó atual',
        type: 'node'
      },
      {
        key: 'globals',
        help: 'os valores globais',
        type: 'globals'
      },
      {
        key: 'trigger',
        help: 'o gatilho que iniciou a sessão',
        type: 'trigger'
      },
      {
        key: 'resume',
        help: 'o resumo atual que continuou esta sessão',
        type: 'resume'
      }
    ],
    root_no_session: [
      {
        key: 'contact',
        help: 'o contato',
        type: 'contact'
      },
      {
        key: 'fields',
        help: 'os valores customizados do contato',
        type: 'fields'
      },
      {
        key: 'urns',
        help: 'os valores de URN do contato',
        type: 'urns'
      },
      {
        key: 'globals',
        help: 'os valores globais',
        type: 'globals'
      }
    ]
  },
  functions: [
    {
      signature: 'abs(number)',
      summary: 'Retorna o valor absoluto de `number`.',
      detail: '',
      examples: [
        {
          template: '@(abs(-10))',
          output: '10'
        },
        {
          template: '@(abs(10.5))',
          output: '10.5'
        },
        {
          template: '@(abs("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'and(values...)',
      summary: 'Retorna se todos os `values` dados são verdadeiros.',
      detail: '',
      examples: [
        {
          template: '@(and(true))',
          output: 'true'
        },
        {
          template: '@(and(true, false, true))',
          output: 'false'
        }
      ]
    },
    {
      signature: 'array(values...)',
      summary: ' Toma multiplos `values` e retorna todos em uma matriz.',
      detail: '',
      examples: [
        {
          template: '@(array("a", "b", 356)[1])',
          output: 'b'
        },
        {
          template: '@(join(array("a", "b", "c"), "|"))',
          output: 'a|b|c'
        },
        {
          template: '@(count(array()))',
          output: '0'
        },
        {
          template: '@(count(array("a", "b")))',
          output: '2'
        }
      ]
    },
    {
      signature: 'attachment_parts(attachment)',
      summary: 'Analisa um anexo em suas diferentes partes',
      detail: '',
      examples: [
        {
          template: '@(attachment_parts("image/jpeg:https://example.com/test.jpg"))',
          output: '{content_type: image/jpeg, url: https://example.com/test.jpg}'
        }
      ]
    },
    {
      signature: 'boolean(value)',
      summary: 'Tenta converter `value` em um boleano.',
      detail: 'Um erro é retornado se o valor não puder ser convertido',
      examples: [
        {
          template: '@(boolean(array(1, 2)))',
          output: 'true'
        },
        {
          template: '@(boolean("FALSE"))',
          output: 'false'
        },
        {
          template: '@(boolean(1 / 0))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'char(code)',
      summary: 'Retorna o caractere para o `code` UNICODE dado.',
      detail: 'Isso é o inverso de [function:code]',
      examples: [
        {
          template: '@(char(33))',
          output: '!'
        },
        {
          template: '@(char(128512))',
          output: '😀'
        },
        {
          template: '@(char("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'clean(text)',
      summary: 'Remove quaisquer caracteres não imprimíveis do `text`.',
      detail: '',
      examples: [
        {
          template: '@(clean("😃 Hello \\nwo\\tr\\rld"))',
          output: '😃 Hello world'
        },
        {
          template: '@(clean(123))',
          output: '123'
        }
      ]
    },
    {
      signature: 'code(text)',
      summary: 'Retorna o código UNICODE do primeiro caractere de `text`.',
      detail: 'Isso é o inverso de [function:char]',
      examples: [
        {
          template: '@(code("a"))',
          output: '97'
        },
        {
          template: '@(code("abc"))',
          output: '97'
        },
        {
          template: '@(code("😀"))',
          output: '128512'
        },
        {
          template: '@(code("15"))',
          output: '49'
        },
        {
          template: '@(code(15))',
          output: '49'
        },
        {
          template: '@(code(""))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'concat(array1, array2)',
      summary: 'Returns the result of concatenating two arrays.',
      detail: '',
      examples: [
        {
          template: '@(concat(array("a", "b"), array("c", "d")))',
          output: '[a, b, c, d]'
        },
        {
          template: '@(unique(concat(array(1, 2, 3), array(3, 4))))',
          output: '[1, 2, 3, 4]'
        }
      ]
    },
    {
      signature: 'count(value)',
      summary: 'Retorna o número de items em uma matriz ou propriedades em um objeto.',
      detail: 'Isso retornará um erro se for passado um item que não é contabilizável.',
      examples: [
        {
          template: '@(count(contact.fields))',
          output: '6'
        },
        {
          template: '@(count(array()))',
          output: '0'
        },
        {
          template: '@(count(array("a", "b", "c")))',
          output: '3'
        },
        {
          template: '@(count(1234))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'date(value)',
      summary: 'Tenta converter `value` em uma data.',
      detail:
        'Se for texto, então isso será analisado para uma data utilizando o formato padrão.\nUm erro é retornado se o valor não puder ser convertido.',
      examples: [
        {
          template: '@(date("1979-07-18"))',
          output: '1979-07-18'
        },
        {
          template: '@(date("1979-07-18T10:30:45.123456Z"))',
          output: '1979-07-18'
        },
        {
          template: '@(date("10/05/2010"))',
          output: '2010-05-10'
        },
        {
          template: '@(date("NOT DATE"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'date_from_parts(year, month, day)',
      summary: 'Cria uma data a partir de um `year`, `month` e `day`.',
      detail: '',
      examples: [
        {
          template: '@(date_from_parts(2017, 1, 15))',
          output: '2017-01-15'
        },
        {
          template: '@(date_from_parts(2017, 2, 31))',
          output: '2017-03-03'
        },
        {
          template: '@(date_from_parts(2017, 13, 15))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'datetime(value)',
      summary: 'Tenta converter `value` em uma datetime.',
      detail:
        'Se for texto, então isso será analisado para uma data/hora utilizando o formato padrão\ne formatos de tempo. Um erro é retornado se o valor não puder ser convertido.',
      examples: [
        {
          template: '@(datetime("1979-07-18"))',
          output: '1979-07-18T00:00:00.000000-05:00'
        },
        {
          template: '@(datetime("1979-07-18T10:30:45.123456Z"))',
          output: '1979-07-18T10:30:45.123456Z'
        },
        {
          template: '@(datetime("10/05/2010"))',
          output: '2010-05-10T00:00:00.000000-05:00'
        },
        {
          template: '@(datetime("NOT DATE"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'datetime_add(datetime, offset, unit)',
      summary:
        'Calcula o valor da data de entrada adicionada por `offset`, de numero de `unit` para `datetime`',
      detail:
        'Durações válidas são "Y" para anos, "M" para meses, "W" para semanas, "D" para dias, "h" para hora,\n"m" para minutos, "s" para segundos',
      examples: [
        {
          template: '@(datetime_add("2017-01-15", 5, "D"))',
          output: '2017-01-20T00:00:00.000000-05:00'
        },
        {
          template: '@(datetime_add("2017-01-15 10:45", 30, "m"))',
          output: '2017-01-15T11:15:00.000000-05:00'
        }
      ]
    },
    {
      signature: 'datetime_diff(date1, date2, unit)',
      summary: 'Retorna a duração entre `date1` e `date2` na `unit` especificada.',
      detail:
        'Durações válidas são "Y" para anos, "M" para meses, "W" para semanas, "D" para dias, "h" para hora,\n"m" para minutos, "s" para segundos.',
      examples: [
        {
          template: '@(datetime_diff("2017-01-15", "2017-01-17", "D"))',
          output: '2'
        },
        {
          template: '@(datetime_diff("2017-01-15", "2017-05-15", "W"))',
          output: '17'
        },
        {
          template: '@(datetime_diff("2017-01-15", "2017-05-15", "M"))',
          output: '4'
        },
        {
          template: '@(datetime_diff("2017-01-17 10:50", "2017-01-17 12:30", "h"))',
          output: '1'
        },
        {
          template: '@(datetime_diff("2017-01-17", "2015-12-17", "Y"))',
          output: '-2'
        }
      ]
    },
    {
      signature: 'datetime_from_epoch(seconds)',
      summary: 'Converte o tempo de UNIX epoch em `seconds` para uma nova data',
      detail: '',
      examples: [
        {
          template: '@(datetime_from_epoch(1497286619))',
          output: '2017-06-12T11:56:59.000000-05:00'
        },
        {
          template: '@(datetime_from_epoch(1497286619.123456))',
          output: '2017-06-12T11:56:59.123456-05:00'
        }
      ]
    },
    {
      signature: 'default(value, default)',
      summary: 'Retorna `value` se não for vazio ou erro, de outra forma retorna `default`.',
      detail: '',
      examples: [
        {
          template: '@(default(undeclared.var, "default_value"))',
          output: 'default_value'
        },
        {
          template: '@(default("10", "20"))',
          output: '10'
        },
        {
          template: '@(default("", "value"))',
          output: 'value'
        },
        {
          template: '@(default("  ", "value"))',
          output: '\\x20\\x20'
        },
        {
          template: '@(default(datetime("invalid-date"), "today"))',
          output: 'today'
        },
        {
          template: '@(default(format_urn("invalid-urn"), "ok"))',
          output: 'ok'
        }
      ]
    },
    {
      signature: 'epoch(date)',
      summary: 'Converte `date` para um UNIX epoch.',
      detail: 'O número retornado pode conter segundos fracionados.',
      examples: [
        {
          template: '@(epoch("2017-06-12T16:56:59.000000Z"))',
          output: '1497286619'
        },
        {
          template: '@(epoch("2017-06-12T18:56:59.000000+02:00"))',
          output: '1497286619'
        },
        {
          template: '@(epoch("2017-06-12T16:56:59.123456Z"))',
          output: '1497286619.123456'
        },
        {
          template: '@(round_down(epoch("2017-06-12T16:56:59.123456Z")))',
          output: '1497286619'
        }
      ]
    },
    {
      signature: 'extract(object, properties)',
      summary: 'Toma um objeto e extrai a propriedade nomeada.',
      detail: '',
      examples: [
        {
          template: '@(extract(contact, "name"))',
          output: 'Ryan Lewis'
        },
        {
          template: '@(extract(contact.groups[0], "name"))',
          output: 'Testers'
        }
      ]
    },
    {
      signature: 'extract_object(object, properties...)',
      summary:
        'Toma um objeto e retorna um novo objeto extraindo somente as propriedades nomeadas.',
      detail: '',
      examples: [
        {
          template: '@(extract_object(contact.groups[0], "name"))',
          output: '{name: Testers}'
        }
      ]
    },
    {
      signature: 'field(text, index, delimiter)',
      summary: 'Divide `text` utilizando o dado `delimiter` e retorna o campo no `index`.',
      detail:
        'O índice inicia em zero. Quando separando com um espaço, o delimitador é considerado para ser espaços em branco.',
      examples: [
        {
          template: '@(field("a,b,c", 1, ","))',
          output: 'b'
        },
        {
          template: '@(field("a,,b,c", 1, ","))',
          output: ''
        },
        {
          template: '@(field("a   b c", 1, " "))',
          output: 'b'
        },
        {
          template: '@(field("a\t\tb\tc\td", 1, "\t"))',
          output: ''
        },
        {
          template: '@(field("a\\t\\tb\\tc\\td", 1, " "))',
          output: ''
        },
        {
          template: '@(field("a,b,c", "foo", ","))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'foreach(values, func, [args...])',
      summary: 'Cria uma nova matriz aplicando uma `func` para cada valor em `values`.',
      detail:
        'Se a função dada leva mais de um argumento, você pode passar argumentos adicionais após a função.',
      examples: [
        {
          template: '@(foreach(array("a", "b", "c"), upper))',
          output: '[A, B, C]'
        },
        {
          template: '@(foreach(array("a", "b", "c"), (x) => x & "1"))',
          output: '[a1, b1, c1]'
        },
        {
          template: '@(foreach(array("a", "b", "c"), (x) => object("v", x)))',
          output: '[{v: a}, {v: b}, {v: c}]'
        },
        {
          template: '@(foreach(array("the man", "fox", "jumped up"), word, 0))',
          output: '[the, fox, jumped]'
        }
      ]
    },
    {
      signature: 'foreach_value(object, func, [args...])',
      summary:
        'Cria um novo objeto aplicando uma `func` para cada valor de propriedade de `object`.',
      detail:
        'Se a função dada leva mais de um argumento, você pode passar argumentos adicionais após a função.',
      examples: [
        {
          template: '@(foreach_value(object("a", "x", "b", "y"), upper))',
          output: '{a: X, b: Y}'
        },
        {
          template: '@(foreach_value(object("a", "hi there", "b", "good bye"), word, 1))',
          output: '{a: there, b: bye}'
        }
      ]
    },
    {
      signature: 'format(value)',
      summary: 'Formata `value` de acordo com o seu tipo.',
      detail: '',
      examples: [
        {
          template: '@(format(1234.5670))',
          output: '1,234.567'
        },
        {
          template: '@(format(now()))',
          output: '11-04-2018 13:24'
        },
        {
          template: '@(format(today()))',
          output: '11-04-2018'
        }
      ]
    },
    {
      signature: 'format_date(date, [,format])',
      summary: 'Formata `date` como texto de acordo com o `format` dado.',
      detail:
        "If `format` is not specified then the environment's default format is used. The format\nstring can consist of the following characters. The characters ' ', ':', ',', 'T', '-'\nand '_' are ignored. Any other character is an error.\n\n* `YY`        - last two digits of year 0-99\n* `YYYY`      - four digits of year 0000-9999\n* `M`         - month 1-12\n* `MM`        - month, zero padded 01-12\n* `MMM`       - month Jan-Dec (localized)\n* `MMMM`      - month January-December (localized)\n* `D`         - day of month, 1-31\n* `DD`        - day of month, zero padded 01-31\n* `EEE`       - day of week Mon-Sun (localized)\n* `EEEE`      - day of week Monday-Sunday (localized)",
      examples: [
        {
          template: '@(format_date("1979-07-18T15:00:00.000000Z"))',
          output: '18-07-1979'
        },
        {
          template: '@(format_date("1979-07-18T15:00:00.000000Z", "YYYY-MM-DD"))',
          output: '1979-07-18'
        },
        {
          template: '@(format_date("2010-05-10T19:50:00.000000Z", "YYYY M DD"))',
          output: '2010 5 10'
        },
        {
          template: '@(format_date("1979-07-18T15:00:00.000000Z", "YYYY"))',
          output: '1979'
        },
        {
          template: '@(format_date("1979-07-18T15:00:00.000000Z", "M"))',
          output: '7'
        },
        {
          template: '@(format_date("NOT DATE", "YYYY-MM-DD"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'format_datetime(datetime [,format [,timezone]])',
      summary: 'Formata `datetime` para texto de acordo com o `format` dado',
      detail:
        "If `format` is not specified then the environment's default format is used. The format\nstring can consist of the following characters. The characters ' ', ':', ',', 'T', '-'\nand '_' are ignored. Any other character is an error.\n\n* `YY`        - last two digits of year 0-99\n* `YYYY`      - four digits of year 0000-9999\n* `M`         - month 1-12\n* `MM`        - month, zero padded 01-12\n* `MMM`       - month Jan-Dec (localized)\n* `MMMM`      - month January-December (localized)\n* `D`         - day of month, 1-31\n* `DD`        - day of month, zero padded 01-31\n* `EEE`       - day of week Mon-Sun (localized)\n* `EEEE`      - day of week Monday-Sunday (localized)\n* `h`         - hour of the day 1-12\n* `hh`        - hour of the day, zero padded 01-12\n* `t`         - twenty four hour of the day 0-23\n* `tt`        - twenty four hour of the day, zero padded 00-23\n* `m`         - minute 0-59\n* `mm`        - minute, zero padded 00-59\n* `s`         - second 0-59\n* `ss`        - second, zero padded 00-59\n* `fff`       - milliseconds\n* `ffffff`    - microseconds\n* `fffffffff` - nanoseconds\n* `aa`        - am or pm (localized)\n* `AA`        - AM or PM (localized)\n* `Z`         - hour and minute offset from UTC, or Z for UTC\n* `ZZZ`       - hour and minute offset from UTC\n\nTimezone should be a location name as specified in the IANA Time Zone database, such\nas \"America/Guayaquil\" or \"America/Los_Angeles\". If not specified, the current timezone\nwill be used. An error will be returned if the timezone is not recognized.",
      examples: [
        {
          template: '@(format_datetime("1979-07-18T15:00:00.000000Z"))',
          output: '18-07-1979 10:00'
        },
        {
          template: '@(format_datetime("1979-07-18T15:00:00.000000Z", "YYYY-MM-DD"))',
          output: '1979-07-18'
        },
        {
          template: '@(format_datetime("2010-05-10T19:50:00.000000Z", "YYYY M DD tt:mm"))',
          output: '2010 5 10 14:50'
        },
        {
          template:
            '@(format_datetime("2010-05-10T19:50:00.000000Z", "YYYY-MM-DD hh:mm AA", "America/Los_Angeles"))',
          output: '2010-05-10 12:50 PM'
        },
        {
          template: '@(format_datetime("1979-07-18T15:00:00.000000Z", "YYYY"))',
          output: '1979'
        },
        {
          template: '@(format_datetime("1979-07-18T15:00:00.000000Z", "M"))',
          output: '7'
        },
        {
          template: '@(format_datetime("NOT DATE", "YYYY-MM-DD"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'format_location(location)',
      summary: 'Formata uma `location` dada como seu nome.',
      detail: '',
      examples: [
        {
          template: '@(format_location("Rwanda"))',
          output: 'Rwanda'
        },
        {
          template: '@(format_location("Rwanda > Kigali"))',
          output: 'Kigali'
        }
      ]
    },
    {
      signature: 'format_number(number, places [, humanize])',
      summary: 'Formata `number` para um dado numero de `places` decimais',
      detail:
        'Um terceiro argumento opcional `humanize` pode ser falso para desabilitar o uso de milhares de separadores.',
      examples: [
        {
          template: '@(format_number(1234))',
          output: '1,234'
        },
        {
          template: '@(format_number(1234.5670))',
          output: '1,234.567'
        },
        {
          template: '@(format_number(1234.5670, 2, true))',
          output: '1,234.57'
        },
        {
          template: '@(format_number(1234.5678, 0, false))',
          output: '1235'
        },
        {
          template: '@(format_number("foo", 2, false))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'format_time(time [,format])',
      summary: 'Formata `time` para texto de acordo com o `format` dado.',
      detail:
        "If `format` is not specified then the environment's default format is used. The format\nstring can consist of the following characters. The characters ' ', ':', ',', 'T', '-'\nand '_' are ignored. Any other character is an error.\n\n* `h`         - hour of the day 1-12\n* `hh`        - hour of the day, zero padded 01-12\n* `t`         - twenty four hour of the day 0-23\n* `tt`        - twenty four hour of the day, zero padded 00-23\n* `m`         - minute 0-59\n* `mm`        - minute, zero padded 00-59\n* `s`         - second 0-59\n* `ss`        - second, zero padded 00-59\n* `fff`       - milliseconds\n* `ffffff`    - microseconds\n* `fffffffff` - nanoseconds\n* `aa`        - am or pm (localized)\n* `AA`        - AM or PM (localized)",
      examples: [
        {
          template: '@(format_time("14:50:30.000000"))',
          output: '14:50'
        },
        {
          template: '@(format_time("14:50:30.000000", "h:mm aa"))',
          output: '2:50 pm'
        },
        {
          template: '@(format_time("15:00:27.000000", "s"))',
          output: '27'
        },
        {
          template: '@(format_time("NOT TIME", "hh:mm"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'format_urn(urn)',
      summary: 'Formata `urn` para um texto amigável.',
      detail: '',
      examples: [
        {
          template: '@(format_urn("tel:+250781234567"))',
          output: '0781 234 567'
        },
        {
          template: '@(format_urn("twitter:134252511151#billy_bob"))',
          output: 'billy_bob'
        },
        {
          template: '@(format_urn(contact.urn))',
          output: '(202) 456-1111'
        },
        {
          template: '@(format_urn(urns.tel))',
          output: '(202) 456-1111'
        },
        {
          template: '@(format_urn(urns.mailto))',
          output: 'foo@bar.com'
        },
        {
          template: '@(format_urn("NOT URN"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'html_decode(text)',
      summary: 'HTML decodifica `text`',
      detail: '',
      examples: [
        {
          template: '@(html_decode("Red &amp; Blue"))',
          output: 'Red & Blue'
        },
        {
          template: '@(html_decode("5 + 10"))',
          output: '5 + 10'
        }
      ]
    },
    {
      signature: 'if(test, value1, value2)',
      summary: 'Retorna `value1` se `test` é verdadeiro ou `value2` caso contrário.',
      detail: 'Se o primeiro argumento é um erro, esse é retornado.',
      examples: [
        {
          template: '@(if(1 = 1, "foo", "bar"))',
          output: 'foo'
        },
        {
          template: '@(if("foo" > "bar", "foo", "bar"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'is_error(value)',
      summary: 'Retorna se `value` é um erro.',
      detail: '',
      examples: [
        {
          template: '@(is_error(datetime("foo")))',
          output: 'true'
        },
        {
          template: '@(is_error(run.not.existing))',
          output: 'true'
        },
        {
          template: '@(is_error("hello"))',
          output: 'false'
        }
      ]
    },
    {
      signature: 'join(array, separator)',
      summary: 'Junta o `array` dado de strings com o `separator` para fazer o texto.',
      detail: '',
      examples: [
        {
          template: '@(join(array("a", "b", "c"), "|"))',
          output: 'a|b|c'
        },
        {
          template: '@(join(split("a.b.c", "."), " "))',
          output: 'a b c'
        }
      ]
    },
    {
      signature: 'json(value)',
      summary: 'Retorna a representação em JSON de `value`.',
      detail: '',
      examples: [
        {
          template: '@(json("string"))',
          output: '"string"'
        },
        {
          template: '@(json(10))',
          output: '10'
        },
        {
          template: '@(json(null))',
          output: 'null'
        },
        {
          template: '@(json(contact.uuid))',
          output: '"5d76d86b-3bb9-4d5a-b822-c9d86f5d8e4f"'
        }
      ]
    },
    {
      signature: 'keys(object)',
      summary: 'Returns an array containing the property keys of `object`.',
      detail: '',
      examples: [
        {
          template: '@(keys(object("a", 123, "b", "hello", "c", "world")))',
          output: '[a, b, c]'
        },
        {
          template: '@(keys(null))',
          output: '[]'
        },
        {
          template: '@(keys("string"))',
          output: 'ERROR'
        },
        {
          template: '@(keys(10))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'lower(text)',
      summary: 'Converte `text` para minúsculo.',
      detail: '',
      examples: [
        {
          template: '@(lower("HellO"))',
          output: 'hello'
        },
        {
          template: '@(lower("hello"))',
          output: 'hello'
        },
        {
          template: '@(lower("123"))',
          output: '123'
        },
        {
          template: '@(lower("😀"))',
          output: '😀'
        }
      ]
    },
    {
      signature: 'max(numbers...)',
      summary: 'Retorna o maior valor em `numbers`.',
      detail: '',
      examples: [
        {
          template: '@(max(1, 2))',
          output: '2'
        },
        {
          template: '@(max(1, -1, 10))',
          output: '10'
        },
        {
          template: '@(max(1, 10, "foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'mean(numbers...)',
      summary: 'Retorna a média aritimética dos `numbers`.',
      detail: '',
      examples: [
        {
          template: '@(mean(1, 2))',
          output: '1.5'
        },
        {
          template: '@(mean(1, 2, 6))',
          output: '3'
        },
        {
          template: '@(mean(1, "foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'min(numbers...)',
      summary: 'Retorna o menor valor em `numbers`.',
      detail: '',
      examples: [
        {
          template: '@(min(1, 2))',
          output: '1'
        },
        {
          template: '@(min(2, 2, -10))',
          output: '-10'
        },
        {
          template: '@(min(1, 2, "foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'mod(dividend, divisor)',
      summary: 'Retorna o resto da divisão de `dividend` pelo `divisor`.',
      detail: '',
      examples: [
        {
          template: '@(mod(5, 2))',
          output: '1'
        },
        {
          template: '@(mod(4, 2))',
          output: '0'
        },
        {
          template: '@(mod(5, "foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'now()',
      summary: 'Retorna a data atual e o tempo no fuso horário atual.',
      detail: '',
      examples: [
        {
          template: '@(now())',
          output: '2018-04-11T13:24:30.123456-05:00'
        }
      ]
    },
    {
      signature: 'number(value)',
      summary: 'Tenta converter `value` em um número.',
      detail: 'Um erro é retornado se o valor não puder ser convertido',
      examples: [
        {
          template: '@(number(10))',
          output: '10'
        },
        {
          template: '@(number("123.45000"))',
          output: '123.45'
        },
        {
          template: '@(number("what?"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'object(pairs...)',
      summary: 'Toma os pares de nome da propriedade e valor e retorna como um novo objeto.',
      detail: '',
      examples: [
        {
          template: '@(object())',
          output: '{}'
        },
        {
          template: '@(object("a", 123, "b", "hello"))',
          output: '{a: 123, b: hello}'
        },
        {
          template: '@(object("a"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'or(values...)',
      summary: 'Retorna se algum dos valores em `values` é verdadeiro.',
      detail: '',
      examples: [
        {
          template: '@(or(true))',
          output: 'true'
        },
        {
          template: '@(or(true, false, true))',
          output: 'true'
        }
      ]
    },
    {
      signature: 'parse_datetime(text, format [,timezone])',
      summary: 'Analisa o `text` em uma data usando um `format` dado.',
      detail:
        "The format string can consist of the following characters. The characters\n' ', ':', ',', 'T', '-' and '_' are ignored. Any other character is an error.\n\n* `YY`        - last two digits of year 0-99\n* `YYYY`      - four digits of year 0000-9999\n* `M`         - month 1-12\n* `MM`        - month, zero padded 01-12\n* `D`         - day of month, 1-31\n* `DD`        - day of month, zero padded 01-31\n* `h`         - hour of the day 1-12\n* `hh`        - hour of the day 01-12\n* `t`         - twenty four hour of the day 1-23\n* `tt`        - twenty four hour of the day, zero padded 01-23\n* `m`         - minute 0-59\n* `mm`        - minute, zero padded 00-59\n* `s`         - second 0-59\n* `ss`        - second, zero padded 00-59\n* `fff`       - milliseconds\n* `ffffff`    - microseconds\n* `fffffffff` - nanoseconds\n* `aa`        - am or pm\n* `AA`        - AM or PM\n* `Z`         - hour and minute offset from UTC, or Z for UTC\n* `ZZZ`       - hour and minute offset from UTC\n\nTimezone should be a location name as specified in the IANA Time Zone database, such\nas \"America/Guayaquil\" or \"America/Los_Angeles\". If not specified, the current timezone\nwill be used. An error will be returned if the timezone is not recognized.\n\nNote that fractional seconds will be parsed even without an explicit format identifier.\nYou should only specify fractional seconds when you want to assert the number of places\nin the input format.\n\nparse_datetime will return an error if it is unable to convert the text to a datetime.",
      examples: [
        {
          template: '@(parse_datetime("1979-07-18", "YYYY-MM-DD"))',
          output: '1979-07-18T00:00:00.000000-05:00'
        },
        {
          template: '@(parse_datetime("2010 5 10", "YYYY M DD"))',
          output: '2010-05-10T00:00:00.000000-05:00'
        },
        {
          template:
            '@(parse_datetime("2010 5 10 12:50", "YYYY M DD tt:mm", "America/Los_Angeles"))',
          output: '2010-05-10T12:50:00.000000-07:00'
        },
        {
          template: '@(parse_datetime("NOT DATE", "YYYY-MM-DD"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'parse_json(text)',
      summary: 'Tenta analisar `text` como um JSON.',
      detail: 'Se o texto dado não é um JSON válido, então um erro é retornado.',
      examples: [
        {
          template: '@(parse_json("{\\"foo\\": \\"bar\\"}").foo)',
          output: 'bar'
        },
        {
          template: '@(parse_json("[1,2,3,4]")[2])',
          output: '3'
        },
        {
          template: '@(parse_json("invalid json"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'parse_time(text, format)',
      summary: 'Analisa o `text` em um tempo usando o `format` dado.',
      detail:
        "The format string can consist of the following characters. The characters\n' ', ':', ',', 'T', '-' and '_' are ignored. Any other character is an error.\n\n* `h`         - hour of the day 1-12\n* `hh`        - hour of the day, zero padded 01-12\n* `t`         - twenty four hour of the day 1-23\n* `tt`        - twenty four hour of the day, zero padded 01-23\n* `m`         - minute 0-59\n* `mm`        - minute, zero padded 00-59\n* `s`         - second 0-59\n* `ss`        - second, zero padded 00-59\n* `fff`       - milliseconds\n* `ffffff`    - microseconds\n* `fffffffff` - nanoseconds\n* `aa`        - am or pm\n* `AA`        - AM or PM\n\nNote that fractional seconds will be parsed even without an explicit format identifier.\nYou should only specify fractional seconds when you want to assert the number of places\nin the input format.\n\nparse_time will return an error if it is unable to convert the text to a time.",
      examples: [
        {
          template: '@(parse_time("15:28", "tt:mm"))',
          output: '15:28:00.000000'
        },
        {
          template: '@(parse_time("2:40 pm", "h:mm aa"))',
          output: '14:40:00.000000'
        },
        {
          template: '@(parse_time("NOT TIME", "tt:mm"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'percent(number)',
      summary: 'Formata `number` como uma porcentagem.',
      detail: '',
      examples: [
        {
          template: '@(percent(0.54234))',
          output: '54%'
        },
        {
          template: '@(percent(1.2))',
          output: '120%'
        },
        {
          template: '@(percent("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'rand()',
      summary: 'Retorna um número único aleatório entre [0.0-1.0).',
      detail: '',
      examples: [
        {
          template: '@(rand())',
          output: '0.6075520156746239'
        },
        {
          template: '@(rand())',
          output: '0.48467757094734026'
        }
      ]
    },
    {
      signature: 'rand_between()',
      summary: 'Um número aleatório simples no intervalo fornecido.',
      detail: '',
      examples: [
        {
          template: '@(rand_between(1, 10))',
          output: '10'
        },
        {
          template: '@(rand_between(1, 10))',
          output: '2'
        }
      ]
    },
    {
      signature: 'read_chars(text)',
      summary: 'Converte `text` em algo que pode ser lido por sistemas IVR.',
      detail:
        'ReadChars irá dividir os números de forma que fiquem fáceis de entender. Isso inclui\ndividor em 3s ou 4s se apropriado.',
      examples: [
        {
          template: '@(read_chars("1234"))',
          output: '1 2 3 4'
        },
        {
          template: '@(read_chars("abc"))',
          output: 'a b c'
        },
        {
          template: '@(read_chars("abcdef"))',
          output: 'a b c , d e f'
        }
      ]
    },
    {
      signature: 'regex_match(text, pattern [,group])',
      summary: 'Retorna a primeira correspondência da expressão regular `pattern` no `text`.',
      detail:
        'Um terceiro argumento opcional `group` determina qual grupo correspondente será retornado.',
      examples: [
        {
          template: '@(regex_match("sda34dfddg67", "\\d+"))',
          output: '34'
        },
        {
          template: '@(regex_match("Bob Smith", "(\\w+) (\\w+)", 1))',
          output: 'Bob'
        },
        {
          template: '@(regex_match("Bob Smith", "(\\w+) (\\w+)", 2))',
          output: 'Smith'
        },
        {
          template: '@(regex_match("Bob Smith", "(\\w+) (\\w+)", 5))',
          output: 'ERROR'
        },
        {
          template: '@(regex_match("abc", "[\\."))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'remove_first_word(text)',
      summary: 'Remove a primeira palavra do `text`.',
      detail: '',
      examples: [
        {
          template: '@(remove_first_word("foo bar"))',
          output: 'bar'
        },
        {
          template: '@(remove_first_word("Hi there. I\'m a flow!"))',
          output: "there. I'm a flow!"
        }
      ]
    },
    {
      signature: 'repeat(text, count)',
      summary: 'Retorna `text` repetido `count` número de vezes.',
      detail: '',
      examples: [
        {
          template: '@(repeat("*", 8))',
          output: '********'
        },
        {
          template: '@(repeat("*", "foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'replace(text, needle, replacement [, count])',
      summary: 'Substitui até em até `count` ocorrências de `needle` por `replacement` em `text`.',
      detail:
        'If `count` é omitido ou menor do que 0, então todas as ocorrências serão substituídas.',
      examples: [
        {
          template: '@(replace("foo bar foo", "foo", "zap"))',
          output: 'zap bar zap'
        },
        {
          template: '@(replace("foo bar foo", "foo", "zap", 1))',
          output: 'zap bar foo'
        },
        {
          template: '@(replace("foo bar", "baz", "zap"))',
          output: 'foo bar'
        }
      ]
    },
    {
      signature: 'replace_time(datetime)',
      summary: 'Retorna um novo datetime com a parte do tempo substituída pelo `time`.',
      detail: '',
      examples: [
        {
          template: '@(replace_time(now(), "10:30"))',
          output: '2018-04-11T10:30:00.000000-05:00'
        },
        {
          template: '@(replace_time("2017-01-15", "10:30"))',
          output: '2017-01-15T10:30:00.000000-05:00'
        },
        {
          template: '@(replace_time("foo", "10:30"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'reverse(array)',
      summary: 'Returns a new array with the values of `array` reversed.',
      detail: '',
      examples: [
        {
          template: '@(reverse(array(3, 1, 2)))',
          output: '[2, 1, 3]'
        },
        {
          template: '@(reverse(array("C", "A", "B")))',
          output: '[B, A, C]'
        }
      ]
    },
    {
      signature: 'round(number [,places])',
      summary: 'Arredonda `number` para o valor mais próximo.',
      detail:
        'Você pode, opcionalmente, passar o numero de casas decimais para arredondar como `places`. Se `places` < 0,\nele irá arrendondar para a parte inteira do mais próxido 10^(-casas).',
      examples: [
        {
          template: '@(round(12))',
          output: '12'
        },
        {
          template: '@(round(12.141))',
          output: '12'
        },
        {
          template: '@(round(12.6))',
          output: '13'
        },
        {
          template: '@(round(12.141, 2))',
          output: '12.14'
        },
        {
          template: '@(round(12.146, 2))',
          output: '12.15'
        },
        {
          template: '@(round(12.146, -1))',
          output: '10'
        },
        {
          template: '@(round("notnum", 2))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'round_down(number [,places])',
      summary: 'Arredonda `number` para o número inteiro inferior mais próximo.',
      detail:
        'Você pode, opcionalmente, passar o número de casas decimais para arredondar como `places`.',
      examples: [
        {
          template: '@(round_down(12))',
          output: '12'
        },
        {
          template: '@(round_down(12.141))',
          output: '12'
        },
        {
          template: '@(round_down(12.6))',
          output: '12'
        },
        {
          template: '@(round_down(12.141, 2))',
          output: '12.14'
        },
        {
          template: '@(round_down(12.146, 2))',
          output: '12.14'
        },
        {
          template: '@(round_down("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'round_up(number [,places])',
      summary: 'Arredonda `number` para o inteiro superior mais próximo.',
      detail:
        'Você pode, opcionalmente, passar o número de casas decimais para arredondar como `places`.',
      examples: [
        {
          template: '@(round_up(12))',
          output: '12'
        },
        {
          template: '@(round_up(12.141))',
          output: '13'
        },
        {
          template: '@(round_up(12.6))',
          output: '13'
        },
        {
          template: '@(round_up(12.141, 2))',
          output: '12.15'
        },
        {
          template: '@(round_up(12.146, 2))',
          output: '12.15'
        },
        {
          template: '@(round_up("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'sort(array)',
      summary: 'Returns a new array with the values of `array` sorted.',
      detail: '',
      examples: [
        {
          template: '@(sort(array(3, 1, 2)))',
          output: '[1, 2, 3]'
        },
        {
          template: '@(sort(array("C", "A", "B")))',
          output: '[A, B, C]'
        }
      ]
    },
    {
      signature: 'split(text, [,delimiters])',
      summary: 'Divide `text` em uma matriz com palavras separadas.',
      detail:
        'Valores vazios são removidos por uma lista retornada. Há um parâmetro final opcional `delimiters`  que\né uma cadeia de caracteres utilizada para dividir o texto em palavras.',
      examples: [
        {
          template: '@(split("a b c"))',
          output: '[a, b, c]'
        },
        {
          template: '@(split("a", " "))',
          output: '[a]'
        },
        {
          template: '@(split("abc..d", "."))',
          output: '[abc, d]'
        },
        {
          template: '@(split("a.b.c.", "."))',
          output: '[a, b, c]'
        },
        {
          template: '@(split("a|b,c  d", " .|,"))',
          output: '[a, b, c, d]'
        }
      ]
    },
    {
      signature: 'sum(array)',
      summary: 'Sums the items in the given `array`.',
      detail: '',
      examples: [
        {
          template: '@(sum(array(1, 2, "3")))',
          output: '6'
        }
      ]
    },
    {
      signature: 'text(value)',
      summary: 'Tenta converter `value` em um texto.',
      detail: 'Um erro é retornado se o valor não puder ser convertido',
      examples: [
        {
          template: '@(text(3 = 3))',
          output: 'true'
        },
        {
          template: '@(json(text(123.45)))',
          output: '"123.45"'
        },
        {
          template: '@(text(1 / 0))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'text_compare(text1, text2)',
      summary: 'Retorna a ordem de dicionário de `text1` e `text2`.',
      detail:
        'O valor de retorno será -1 se `text1` vier antes de `text2`, 0 se forem iguais\ne 1 se `text1` vier depois de `text2`.',
      examples: [
        {
          template: '@(text_compare("abc", "abc"))',
          output: '0'
        },
        {
          template: '@(text_compare("abc", "def"))',
          output: '-1'
        },
        {
          template: '@(text_compare("zzz", "aaa"))',
          output: '1'
        }
      ]
    },
    {
      signature: 'text_length(value)',
      summary: 'Retorna o tamanho (número de caracteres) de `value` quando convertido em texto.',
      detail: '',
      examples: [
        {
          template: '@(text_length("abc"))',
          output: '3'
        },
        {
          template: '@(text_length(array(2, 3)))',
          output: '6'
        }
      ]
    },
    {
      signature: 'text_slice(text, start [, end])',
      summary: 'Retorna a porção de `text` entre `start` (inclusivo) e `end` (exclusivo).',
      detail:
        'Se o `end` não foi especificado, então todo o resto de `text` será incluido. Valores negativos\npara `start` ou `end`, começarão no final do `text`.',
      examples: [
        {
          template: '@(text_slice("hello", 2))',
          output: 'llo'
        },
        {
          template: '@(text_slice("hello", 1, 3))',
          output: 'el'
        },
        {
          template: '@(text_slice("hello😁", -3, -1))',
          output: 'lo'
        },
        {
          template: '@(text_slice("hello", 7))',
          output: ''
        }
      ]
    },
    {
      signature: 'time(value)',
      summary: 'Tenta converter `value` em um tempo.',
      detail:
        'Se for texto, então será analisado para um tempo utilizando o formato padrão.\nUm erro é retornado se o valor não puder ser convertido.',
      examples: [
        {
          template: '@(time("10:30"))',
          output: '10:30:00.000000'
        },
        {
          template: '@(time("10:30:45 PM"))',
          output: '22:30:45.000000'
        },
        {
          template: '@(time(datetime("1979-07-18T10:30:45.123456Z")))',
          output: '10:30:45.123456'
        },
        {
          template: '@(time("what?"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'time_from_parts(hour, minute, second)',
      summary: 'Cria um tempo a partir de `hour`, `minute` e `second`',
      detail: '',
      examples: [
        {
          template: '@(time_from_parts(14, 40, 15))',
          output: '14:40:15.000000'
        },
        {
          template: '@(time_from_parts(8, 10, 0))',
          output: '08:10:00.000000'
        },
        {
          template: '@(time_from_parts(25, 0, 0))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'title(text)',
      summary: 'Deixa com letra maiúscula cada palavra em `text`.',
      detail: '',
      examples: [
        {
          template: '@(title("foo"))',
          output: 'Foo'
        },
        {
          template: '@(title("ryan lewis"))',
          output: 'Ryan Lewis'
        },
        {
          template: '@(title("RYAN LEWIS"))',
          output: 'Ryan Lewis'
        },
        {
          template: '@(title(123))',
          output: '123'
        }
      ]
    },
    {
      signature: 'today()',
      summary: 'Retorna a data atual no fuso horário do ambiente.',
      detail: '',
      examples: [
        {
          template: '@(today())',
          output: '2018-04-11'
        }
      ]
    },
    {
      signature: 'trim(text, [,chars])',
      summary: 'Remove espaço em branco de qualquer uma das extremidades do `text`.',
      detail:
        'Existe um parâmetro final opcional `chars` que é uma string de caracters a serem removidos ao invés de espaços em branco.',
      examples: [
        {
          template: '@(trim(" hello world    "))',
          output: 'hello world'
        },
        {
          template: '@(trim("+123157568", "+"))',
          output: '123157568'
        }
      ]
    },
    {
      signature: 'trim_left(text, [,chars])',
      summary: 'Remove espaço em branco do começo do `text`.',
      detail:
        'Existe um parâmetro final opcional `chars` que é uma string de caracters a serem removidos ao invés de espaços em branco.',
      examples: [
        {
          template: '@("*" & trim_left(" hello world   ") & "*")',
          output: '*hello world   *'
        },
        {
          template: '@(trim_left("+12345+", "+"))',
          output: '12345+'
        }
      ]
    },
    {
      signature: 'trim_right(text, [,chars])',
      summary: 'Remove espaço em branco do final do `text`.',
      detail:
        'Existe um parâmetro final opcional `chars` que é uma string de caracters a serem removidos ao invés de espaços em branco.',
      examples: [
        {
          template: '@("*" & trim_right(" hello world   ") & "*")',
          output: '* hello world*'
        },
        {
          template: '@(trim_right("+12345+", "+"))',
          output: '+12345'
        }
      ]
    },
    {
      signature: 'tz(date)',
      summary: 'Retorna o nome do fuso horário de `date`.',
      detail:
        'Se não existe informação presente de fuso horário na data, então o fuso horário atual será retornado.',
      examples: [
        {
          template: '@(tz("2017-01-15T02:15:18.123456Z"))',
          output: 'UTC'
        },
        {
          template: '@(tz("2017-01-15 02:15:18PM"))',
          output: 'America/Guayaquil'
        },
        {
          template: '@(tz("2017-01-15"))',
          output: 'America/Guayaquil'
        },
        {
          template: '@(tz("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'tz_offset(date)',
      summary: 'Retorna o offset do fuso horário de `date`.',
      detail:
        'O offset é retornado no formato `[+/-]HH:MM`. Se nenhuma informação de fuso horário  está presente na data, \nentão o offset do fuso horário atual será retornado.',
      examples: [
        {
          template: '@(tz_offset("2017-01-15T02:15:18.123456Z"))',
          output: '+0000'
        },
        {
          template: '@(tz_offset("2017-01-15 02:15:18PM"))',
          output: '-0500'
        },
        {
          template: '@(tz_offset("2017-01-15"))',
          output: '-0500'
        },
        {
          template: '@(tz_offset("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'unique(array)',
      summary: 'Returns the unique values in `array`.',
      detail: '',
      examples: [
        {
          template: '@(unique(array(1, 3, 2, 3)))',
          output: '[1, 3, 2]'
        },
        {
          template: '@(unique(array("hi", "there", "hi")))',
          output: '[hi, there]'
        }
      ]
    },
    {
      signature: 'upper(text)',
      summary: 'Converte `text` para maiúsculo.',
      detail: '',
      examples: [
        {
          template: '@(upper("Asdf"))',
          output: 'ASDF'
        },
        {
          template: '@(upper(123))',
          output: '123'
        }
      ]
    },
    {
      signature: 'url_encode(text)',
      summary: 'Codifica o `text` para ser usado como uma URL de parâmetro.',
      detail: '',
      examples: [
        {
          template: '@(url_encode("two & words"))',
          output: 'two%20%26%20words'
        },
        {
          template: '@(url_encode(10))',
          output: '10'
        }
      ]
    },
    {
      signature: 'urn_parts(urn)',
      summary: 'Analise uma URN em suas diferentes partes',
      detail: '',
      examples: [
        {
          template: '@(urn_parts("tel:+593979012345"))',
          output: '{display: , path: +593979012345, scheme: tel}'
        },
        {
          template: '@(urn_parts("twitterid:3263621177#bobby"))',
          output: '{display: bobby, path: 3263621177, scheme: twitterid}'
        },
        {
          template: '@(urn_parts("not a urn"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'week_number(date)',
      summary: 'Retorna o número da semana (1-54) de `date`.',
      detail:
        'A semana é considerada para começar no Domingo e a semana contendo 1.º de Janeiro é a semana de número 1.',
      examples: [
        {
          template: '@(week_number("2019-01-01"))',
          output: '1'
        },
        {
          template: '@(week_number("2019-07-23T16:56:59.000000Z"))',
          output: '30'
        },
        {
          template: '@(week_number("xx"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'weekday(date)',
      summary: 'Retorna o dia da semana para `date`.',
      detail:
        'A semana é considerada para iniciar no Domingo, então Domingo retorna 0, Segunda retorna 1 etc.',
      examples: [
        {
          template: '@(weekday("2017-01-15"))',
          output: '0'
        },
        {
          template: '@(weekday("foo"))',
          output: 'ERROR'
        }
      ]
    },
    {
      signature: 'word(text, index [,delimiters])',
      summary: 'Retorna a palavra em um `index` no `text`.',
      detail:
        'Índices começam em zero. Há um parâmetro final opcional `delimiters` que\né uma cadeia de caracteres usada para separar o texto em palavras.',
      examples: [
        {
          template: '@(word("bee cat dog", 0))',
          output: 'bee'
        },
        {
          template: '@(word("bee.cat,dog", 0))',
          output: 'bee'
        },
        {
          template: '@(word("bee.cat,dog", 1))',
          output: 'cat'
        },
        {
          template: '@(word("bee.cat,dog", 2))',
          output: 'dog'
        },
        {
          template: '@(word("bee.cat,dog", -1))',
          output: 'dog'
        },
        {
          template: '@(word("bee.cat,dog", -2))',
          output: 'cat'
        },
        {
          template: '@(word("bee.*cat,dog", 1, ".*=|"))',
          output: 'cat,dog'
        },
        {
          template: '@(word("O\'Grady O\'Flaggerty", 1, " "))',
          output: "O'Flaggerty"
        }
      ]
    },
    {
      signature: 'word_count(text [,delimiters])',
      summary: 'Retorna o número de palavras em `text`.',
      detail:
        'Existe um parâmetro final opcional `delimiters` que é uma string de caracteres utilizada\npara dividir o texto em palavras. ',
      examples: [
        {
          template: '@(word_count("foo bar"))',
          output: '2'
        },
        {
          template: '@(word_count(10))',
          output: '1'
        },
        {
          template: '@(word_count(""))',
          output: '0'
        },
        {
          template: '@(word_count("😀😃😄😁"))',
          output: '4'
        },
        {
          template: '@(word_count("bee.*cat,dog", ".*=|"))',
          output: '2'
        },
        {
          template: '@(word_count("O\'Grady O\'Flaggerty", " "))',
          output: '2'
        }
      ]
    },
    {
      signature: 'word_slice(text, start, end [,delimiters])',
      summary: 'Extrai uma sub sequência de palavras de `text`.',
      detail:
        'As palavras retornadas são aquelas de `start` até, mas não incluindo, `end`. Índices começam no zero e um valor final\nnegativo significa que todas as palavras após o início devem ser retornadas. Existe um parâmetro final opcional `delimiter`\nque é uma string com caracteres utilizados para dividir o texto em palavras.',
      examples: [
        {
          template: '@(word_slice("bee cat dog", 0, 1))',
          output: 'bee'
        },
        {
          template: '@(word_slice("bee cat dog", 0, 2))',
          output: 'bee cat'
        },
        {
          template: '@(word_slice("bee cat dog", 1, -1))',
          output: 'cat dog'
        },
        {
          template: '@(word_slice("bee cat dog", 1))',
          output: 'cat dog'
        },
        {
          template: '@(word_slice("bee cat dog", 2, 3))',
          output: 'dog'
        },
        {
          template: '@(word_slice("bee cat dog", 3, 10))',
          output: ''
        },
        {
          template: '@(word_slice("bee.*cat,dog", 1, -1, ".*=|,"))',
          output: 'cat dog'
        },
        {
          template: '@(word_slice("O\'Grady O\'Flaggerty", 1, 2, " "))',
          output: "O'Flaggerty"
        }
      ]
    }
  ]
};
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(completion) }));
