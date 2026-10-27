# PhoneArt 🎨

Telefone sem fio com desenhos, em português, para **2 a 20 jogadores online**. Feito com Next.js, React e TypeScript para hospedar na Vercel. O nome do repositório continua `gartic-phone`; o jogo se chama **PhoneArt**.

## Como jogar

1. Crie uma sala e envie o link ou código aos amigos.
2. Todos inventam **uma única frase inicial** ao mesmo tempo.
3. Cada álbum passa para o próximo jogador: ele desenha a frase recebida.
4. O próximo jogador vê **só o desenho anterior** e tenta adivinhá-lo. A adivinhação vira a referência do próximo desenho.
5. As rodadas alternam até todos participarem de cada álbum. Há no mínimo três rodadas para que mesmo duas pessoas possam desenhar e adivinhar. O anfitrião escolhe uma volta completa, terminar em frase ou terminar em desenho. Um final escolhido pode acrescentar uma rodada, fazendo o álbum retornar ao autor.
6. O fim revela todas as transformações, com os nomes dos participantes. O anfitrião pode iniciar outra partida.

## Modos de jogo

O anfitrião escolhe o modo na sala de espera, e a escolha é sincronizada para todos:

- **Clássico:** cada pessoa inventa uma frase de até **50 caracteres**; depois as rodadas alternam desenho e adivinhação. O limite de 50 vale também para interpretações, com contador na tela e validação no servidor. Emoji conta por ponto Unicode.
- **Caos Criativo:** todos começam com um desenho livre. Nas rodadas seguintes, o desenho anterior é carregado no canvas para reinterpretar e acrescentar um elemento inesperado. Todas as etapas são desenhos, e a evolução completa é revelada no fim. Um desenho em branco por tempo esgotado permite começar novamente.
- **Relâmpago:** a alternância do Clássico, com **30 segundos fixos**, controlados pelo servidor, por rodada.

No Clássico e Caos Criativo, prazos de 60, 90, 120 ou 180 segundos. Quando todos enviam, a próxima etapa começa imediatamente. Jogadas que passam do prazo recebem um marcador de tempo esgotado. A verificação do prazo acontece nas consultas dos jogadores, sem cron externo. Se ninguém estiver conectado, o relógio é retomado na próxima consulta, sem pular várias rodadas de uma vez.

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

## Recursos

- Sala privada por código e link, com anfitrião e remoção de jogadores antes do início.
- Sessão aleatória por jogador, salva neste navegador para reconectar ao recarregar.
- Canvas com mouse, caneta e toque; **16 cores**, seletor personalizado, espessura, borracha, desfazer e limpar.
- **Balde de tinta** para áreas conectadas/fechadas, com desfazer.
- **Dez formas** com prévia ao arrastar: linha, círculo, elipse, quadrado, retângulo, triângulo, pentágono, hexágono, estrela e seta. Formas fechadas têm opções de contorno e preenchimento na cor selecionada. Desfazer preserva as 15 ações anteriores.
- **Salvar sequência completa em PDF**, disponível a todos após o fim: exporta todos os álbuns, desenhos, frases, autores e ordem das rodadas. O arquivo é gerado no navegador, carregando um álbum por vez, sem credenciais ou serviço adicional. Salve antes que o anfitrião inicie outra partida; se a partida mudar durante o download, o exportador interrompe com um aviso para não misturar sequências.
- Álbuns completos só ficam disponíveis após o encerramento. Segredos de sessão são armazenados com hash e nunca retornam na lista de jogadores.
- Interface responsiva para celular e desktop; temporizador e contagem de envios sincronizados pelo servidor.

## Limites operacionais

O jogo é para grupos de amigos. Não tem moderação, contas, recuperação de sessão em outro dispositivo, transferência de anfitrião nem proteção avançada contra criação abusiva de salas. Se o anfitrião fechar o navegador, pode voltar pelo mesmo navegador; a partida iniciada continua sem sua presença, mas só ele pode reiniciá-la. Códigos são convites, não autenticação pessoal. Para abrir publicamente a grandes audiências, configure limites de tráfego na Vercel e monitore a cota Redis; polling e desenhos consomem comandos e armazenamento. As fontes são hospedadas junto com o jogo, sem dependência de Google Fonts no navegador.

Os testes automatizados validam a lógica e privacidade das rodadas, permissões, limite de 50 caracteres, os três modos, expiração de jogadas, limite de 20 jogadores, preenchimento conectado e construção das formas. A validação real da Vercel/Redis requer as credenciais da sua própria implantação.
