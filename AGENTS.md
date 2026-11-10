# AGENTS.md

Regras fixas do projeto do site da Igreja Kemuel.

## Passagem de contexto

- Ler o HANDOFF.md no início de toda sessão.
- Atualizar o HANDOFF.md antes de todo commit.
- Usar sempre o design system do projeto (assets/design_system.html). Nunca criar visual do zero. Exceção: tarefas de estudo dentro de referencias/.
- O projeto usa apenas a branch main. Commit e push da main ao final de toda tarefa, para o HANDOFF sempre ir para o GitHub.
- A Vercel está conectada à main. Todo push na main vai para o ar em igrejakemuel.com.br.
- O index.html é a página principal em construção, com marcadores entre colchetes visíveis e meta robots noindex até o lançamento.
- Os tokens e estilos compartilhados ficam em arquivos próprios (por exemplo assets/css/), nunca só dentro do design_system.html, porque ele não vai para o ar.
- Tipografia oficial (opção A, tarefa 11): Outfit 600/800 para títulos e números; Public Sans 400/600 para texto curto e interface; Newsreader 300/400, itálico 400 e 600 somente nos títulos de post. Lettering vazado: derivado Outfit Kemuel Static 800. Anton removida. Esta decisão substitui as regras anteriores de quatro famílias.
- Combinação tipográfica: a base de toda dobra é Outfit (títulos e números) com Public Sans (texto e interface).
- A Newsreader entra de duas formas: como voz de leitura (posts, Bíblia, citações, versículos) ou como destaque em itálico, no máximo um por título.
- Nenhuma dobra usa a Newsreader nas duas formas ao mesmo tempo, exceto as páginas de post e a Bíblia.
- Nenhum peso, tamanho ou espaçamento fora dos tokens. Nenhuma família nova sem autorização do Alisson.
- Escala única: --text-caption, --text-small, --text-body, --text-body-lg, --text-h5, --text-h4, --text-h3, --text-h2, --text-h1 e --text-display (hero/versículo). Rótulos: Public Sans 600, caption, tracking .14em, caixa alta; seções Outfit 800/h2, cards Outfit 600/h5 e números Outfit 800/tabular-nums.

## Segurança (repositório público)

- Nunca registrar dados pessoais, dados de membros, pedidos de oração, dados financeiros, credenciais, links privados ou falhas de segurança em nenhum arquivo. Itens sensíveis são acompanhados fora do repositório.
- Antes de todo push, conferir que nada sensível entrou nos commits.
- Antes de todo push, abrir o index.html publicado e conferir no console que nenhum CSS ou JS deu erro. Repetir a conferência no endereço publicado ao final do deploy.
- Nunca usar git add . sem antes conferir o git status.
- Commit errado ainda não enviado: corrigir com amend, não com commit novo por cima.
- A pasta referencias/ guarda sites de terceiros só para estudo. Nunca entra no Git nem no deploy. Nada de lá (imagens, textos, código) é copiado para o site.
- Extrações usam SOMENTE os arquivos que o Alisson salvou. É proibido baixar qualquer arquivo dos sites de referência ou de seus servidores, mesmo que esteja faltando.
- É proibido contornar recusas de servidor (403, 401 ou similares), alterar cabeçalhos para se passar por navegador ou usar links temporários e assinados.
- Autorização do Alisson (10/11/2026): downloads de imagens licenciadas da Wikimedia Commons e do Met podem usar identificação honesta `User-Agent: IgrejaKemuelSite/1.0 (https://www.igrejakemuel.com.br)`. Isso não é identidade de navegador. Baixar uma imagem por vez, com pausa de alguns segundos; não fingir navegador, trocar de identificação para insistir, usar links assinados nem acervos fora dos permitidos. Se o teste autorizado continuar recusado, parar os downloads e preparar a lista para obtenção manual. No Met, localizar obras pelas páginas de metmuseum.org/art/collection e usar a imagem em domínio público indicada na própria página; não insistir na API de busca que respondeu 410.
- Se faltar algum arquivo, documentar como ausente e seguir sem ele.
- Toda extração em referencias/ entrega, no primeiro nível da pasta do site, somente: design-system__RESUMO.html, notas.md e a pasta arquivos/ com todo o resto. RESUMO tem de 2 a 5 palavras sobre o estilo visual, em minúsculas, sem acentos, com hífens, diferente dos já existentes.
- Exceção autorizada pelo Alisson: o logo completo (símbolo, "IGREJA" e "Kemuel") foi redesenhado em vetor, em assets/brand/, e o símbolo nos ícones de assets/icons/, sempre como aproximação PROVISÓRIA até o arquivo original aparecer. Usar só os arquivos e regras de uso do design system; não redesenhar de novo sem pedido.
- Imagens no site: só da igreja ou com licença. Imagens geradas por IA só como provisórias, nunca representando pessoas ou eventos reais da igreja. Letras de louvor não são publicadas.

## Forma de trabalho

- Mobile primeiro.
- Primeira dobra da página principal: logo e menu, título, subtítulo, horários dos cultos (k-schedule) e os dois botões ("Como chegar" e "Cursos e materiais gratuitos") ficam SEMPRE visíveis sem rolar, em qualquer tela.
- MODO FILA: prompt que começa com "FILA: execute somente depois de terminar a tarefa atual." espera a tarefa atual terminar.
- Backlog: "Coloque isso no Backlog" pausa um item. "Retome o item [nome] do Backlog" retoma.
- Prompts longos podem vir em Parte 1 e Parte 2. Ao receber a Parte 1 com "AGUARDE A PARTE 2", só confirmar que entendeu.
- Toda mudança no cabeçalho, no rodapé ou nos ícones do head é feita em partials/ e aplicada com node scripts/montar-paginas.mjs antes do commit. Proibido editá-los direto nas páginas.
- Endereço, horários e dados da igreja só mudam em dados/igreja.json, aplicados com node scripts/montar-paginas.mjs antes do commit. O grupo musical gospel Kemuel (Itu, SP) não tem relação com a igreja e não deve ser citado.
- Conferência por file:// mantida apenas para checar que os estilos carregam. Os demais testes seguem pelo site publicado ou por servidor local.
- Testes leves: só o que foi alterado, em 1440 px e 390 px. Bateria completa só antes de publicar, quando pedido.
- Diagnóstico antes de correção: em qualquer problema, explicar a causa antes de corrigir.
- Ações irreversíveis (reescrever histórico, apagar arquivos, apagar deploys): primeiro só diagnóstico e plano. Executar apenas depois de aprovação, com backup.
- Relatório final de toda tarefa: arquivos alterados, testes feitos, status do push, inconsistências encontradas.
