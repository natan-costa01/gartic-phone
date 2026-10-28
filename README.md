# PhoneArt 🎨

Telefone sem fio com desenhos, em português, para **2 a 20 jogadores online**. Feito com Next.js, React e TypeScript para hospedar na Vercel. O nome do repositório continua `gartic-phone`; o jogo se chama **PhoneArt**.

## Como jogar

1. Crie uma sala e envie o link ou código aos amigos.
2. Todos inventam **uma única frase inicial** ao mesmo tempo.
3. Cada álbum passa para o próximo jogador: ele desenha a frase recebida.
4. O próximo jogador vê **só o desenho anterior** e tenta adivinhá-lo. A adivinhação vira a referência do próximo desenho.
5. As rodadas alternam até todos participarem de cada álbum. Há no mínimo três rodadas para que mesmo duas pessoas possam desenhar e adivinhar. O anfitrião escolhe uma volta completa, terminar em frase ou terminar em desenho. Um final escolhido pode acrescentar uma rodada, fazendo o álbum retornar ao autor.
6. O anfitrião conduz a revelação **uma etapa por vez**, com todos vendo o mesmo álbum. Apenas ele pode avançar, voltar ou iniciar outra partida. Depois de apresentar a sequência toda, todos podem baixar o PDF.

## Modos de jogo

O anfitrião escolhe o modo na sala de espera, e a escolha é sincronizada para todos:

- **Clássico:** cada pessoa inventa uma frase de até **50 caracteres**; depois as rodadas alternam desenho e adivinhação. O limite de 50 vale também para interpretações, com contador na tela e validação no servidor. Emoji conta por ponto Unicode.
- **Caos Criativo:** todos começam com um desenho livre. Nas rodadas seguintes, o desenho anterior é carregado no canvas para reinterpretar e acrescentar um elemento inesperado. Todas as etapas são desenhos, e a evolução completa é revelada no fim. Um desenho em branco por tempo esgotado permite começar novamente.
- **Relâmpago:** a alternância do Clássico, com **15, 20, 30, 45 ou 60 segundos**, controlados pelo servidor, por rodada. Ao escolher o modo, o tempo inicial é 30 segundos.

No Clássico e Caos Criativo, prazos de **15, 20, 30, 45, 60, 90, 120, 180, 240, 300 ou 600 segundos**. Quando todos enviam, a próxima etapa começa imediatamente. Jogadas que passam do prazo recebem um marcador de tempo esgotado. A verificação do prazo acontece nas consultas dos jogadores, sem cron externo. Se ninguém estiver conectado, o relógio é retomado na próxima consulta, sem pular várias rodadas de uma vez.

## Rodar localmente

Requer Node.js 20.9 ou mais recente (testado com Node 24).

```sh
npm ci
npm run dev
```

Abra a aplicação na porta 3000. **Sem variáveis Redis, somente o modo de desenvolvimento usa memória local**, adequado para testar com várias abas na mesma máquina. Reiniciar o servidor apaga essas salas. Não suporta vários processos. Em produção, a aplicação exige Redis e não usa esse fallback.

```sh
npm test
npm run typecheck
npm run build
```

## Publicar na Vercel — necessário para multiplayer online

1. Importe `natan-costa01/gartic-phone` na Vercel. O framework Next.js será detectado. Use os comandos padrão; não há diretório raiz alternativo.
2. No **Marketplace/Storage** da Vercel, crie ou conecte um **Upstash Redis**, vinculado ao projeto.
3. Configure as variáveis **server-side**, para os ambientes que usar (Production e Preview):
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
     As integrações antigas que fornecem `KV_REST_API_URL` e `KV_REST_API_TOKEN` também são aceitas.
4. Faça o deploy ou redeploy depois de adicionar as variáveis.
5. Na URL publicada, crie uma sala e abra o convite em outro navegador/dispositivo. Entre com outro apelido, inicie e complete uma partida para validar o Redis e o multiplayer na implantação real.

**Não use prefixo `NEXT_PUBLIC_` para essas credenciais.** Nunca coloque tokens no GitHub. Não precisa de Supabase, banco SQL, conta para jogadores, migração, WebSocket persistente ou servidor separado. O front-end consulta as salas a cada 2 segundos. Redis mantém as salas entre funções independentes da Vercel; uma operação atômica com versão evita perder jogadas simultâneas. Cada sala expira 24 horas após a criação.

## Personagens e participantes

Antes de criar ou entrar numa sala, use **Seu personagem**. Escolha entre 20 animais: dinossauro, cachorro, elefante, gato, coelho, raposa, urso, panda, tigre, leão, sapo, coruja, pinguim, macaco, porco, vaca, coala, guaxinim, lobo e lontra. Também há 10 retratos prontos: um avatar inspirado na foto de referência, Naruto, Goku, Sasuke, Sakura, Luffy, Nami, Nezuko, Gojo e Tanjiro. O editor separa **Personagens** e **Animais**, com escolha de cor de fundo. Não há opções de boné, gorro ou óculos; acessórios antigos são removidos automaticamente ao ler os perfis salvos. Elementos que fazem parte do desenho original de cada personagem permanecem fixos. A prévia é atualizada enquanto você escolhe. A preferência fica salva no navegador.

Na sala, **Editar personagem** permite mudar apenas o próprio avatar, mesmo durante a partida; a atualização aparece para todos. A barra lateral lista os participantes, seus personagens, o anfitrião e o estado da jogada (escrevendo, desenhando ou já enviou). No celular, o painel fica acima da área de jogo e mantém uma lista com rolagem.

## Revelação em grupo

A apresentação começa na primeira etapa do primeiro álbum. **Só o anfitrião** pode usar **Revelar próxima etapa**, **Próximo álbum** e **Voltar etapa**. A navegação é sincronizada pelo servidor, com atualização dos navegadores a cada dois segundos. Pedidos de convidados para avançar são rejeitados; alterar o parâmetro `album` também não revela etapas futuras. O PDF completo só é liberado quando o anfitrião chegar ao fim de todos os álbuns. Depois disso, todos podem exportá-lo, mesmo que ele volte a uma etapa anterior. Um reinício limpa essa autorização para a próxima partida.

A passagem automática das rodadas de criação continua funcionando como antes. O controle exclusivo do anfitrião se aplica à apresentação final.

## Envio automático no fim do tempo

O anfitrião pode ativar **Enviar desenho ao acabar o tempo** na sala de espera. A opção vale para todos e para os três modos. Ao zerar o cronômetro de uma rodada de desenho, o navegador congela o canvas e envia exatamente o que estiver nele, inclusive um desenho incompleto ou uma tela ainda em branco. O desenho é comprimido para caber no limite de envio; telas muito detalhadas podem ter a resolução reduzida sem apagar traços. A janela do servidor tem cinco segundos de tolerância para receber o envio final, sem alterar o tempo exibido de desenho. As frases continuam respeitando o prazo normal.

Mantenha a página aberta e conectada: o canvas fica no navegador. Se o navegador for fechado, suspenso pelo sistema ou ficar sem conexão, o envio pode não chegar; após a tolerância, a partida registra tempo esgotado e continua. Com a opção desativada, permanece o envio manual.

## Visual e tela cheia

O botão **Claro/Escuro**, no topo, troca o tema em todas as telas e salva a preferência neste navegador. O espaçamento é responsivo, com margens menores no celular e área de desenho mais ampla no desktop.

Interface com tipografia DM Sans e Outfit, cores suaves, espaçamento consistente e cartões simples, sem efeito pixelado ou decoração de terminal. Os retratos ilustrados ficam na imagem local `public/characters/portraits.png`, organizada em cinco colunas e duas linhas; os animais usam SVG com curvas suaves. Fontes e imagens são servidas junto com o jogo, sem dependência de URLs externas. Os temas claro e escuro continuam disponíveis.

No editor, clique em **Tela cheia** para ampliar sem perder o desenho. A referência, o cronômetro, as cores e o envio continuam disponíveis. Use o botão de saída ou **Escape** para voltar. Navegadores sem suporte nativo usam um painel ampliado com a mesma função. A tela branca de desenho mantém sua proporção, inclusive em celulares.

## Recursos

- Sala privada por código e link, com anfitrião e remoção de jogadores antes do início.
- Sessão aleatória por jogador, salva neste navegador para reconectar ao recarregar.
- Canvas com mouse, caneta e toque; **16 cores**, seletor personalizado, espessura, borracha, desfazer e limpar.
- **Balde de tinta** para áreas conectadas/fechadas, com desfazer.
- **Dez formas** com prévia ao arrastar: linha, círculo, elipse, quadrado, retângulo, triângulo, pentágono, hexágono, estrela e seta. Formas fechadas têm opções de contorno e preenchimento na cor selecionada. Desfazer preserva as 15 ações anteriores.
- **Salvar sequência completa em PDF**, disponível a todos após o fim: exporta todos os álbuns, desenhos, frases, autores e ordem das rodadas. O arquivo é gerado no navegador, carregando um álbum por vez, sem credenciais ou serviço adicional. O download é liberado depois que o anfitrião apresentar todos os álbuns. Salve antes que ele inicie outra partida; se a partida mudar durante o download, o exportador interrompe com um aviso para não misturar sequências.
- Álbuns completos só ficam disponíveis após o encerramento. Segredos de sessão são armazenados com hash e nunca retornam na lista de jogadores.
- Interface responsiva para celular e desktop; temporizador e contagem de envios sincronizados pelo servidor.

## Limites operacionais

O jogo é para grupos de amigos. Não tem moderação, contas, recuperação de sessão em outro dispositivo, transferência de anfitrião nem proteção avançada contra criação abusiva de salas. Se o anfitrião fechar o navegador, pode voltar pelo mesmo navegador; a partida iniciada continua sem sua presença, mas só ele pode reiniciá-la. Códigos são convites, não autenticação pessoal. Para abrir publicamente a grandes audiências, configure limites de tráfego na Vercel e monitore a cota Redis; polling e desenhos consomem comandos e armazenamento. As fontes são hospedadas junto com o jogo, sem dependência de Google Fonts no navegador.

Os testes automatizados validam a lógica e privacidade das rodadas, permissões, limite de 50 caracteres, os três modos, expiração de jogadas, limite de 20 jogadores, preenchimento conectado e construção das formas. A validação real da Vercel/Redis requer as credenciais da sua própria implantação.
