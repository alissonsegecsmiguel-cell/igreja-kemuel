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
- Famílias autorizadas: Outfit (títulos e números), Public Sans (texto e interface), Anton (terceira família, somente títulos grandes condensados em caixa alta) e Newsreader (quarta família, restrita à visita editorial, às páginas da Bíblia e a citações). A vaga serifada está ocupada; nenhuma quinta família pode entrar. Preservar a Bíblia já publicada.

## Segurança (repositório público)

- Nunca registrar dados pessoais, dados de membros, pedidos de oração, dados financeiros, credenciais, links privados ou falhas de segurança em nenhum arquivo. Itens sensíveis são acompanhados fora do repositório.
- Antes de todo push, conferir que nada sensível entrou nos commits.
- Antes de todo push, abrir o index.html publicado e conferir no console que nenhum CSS ou JS deu erro. Repetir a conferência no endereço publicado ao final do deploy.
- Nunca usar git add . sem antes conferir o git status.
- Commit errado ainda não enviado: corrigir com amend, não com commit novo por cima.
- A pasta referencias/ guarda sites de terceiros só para estudo. Nunca entra no Git nem no deploy. Nada de lá (imagens, textos, código) é copiado para o site.
- Extrações usam SOMENTE os arquivos que o Alisson salvou. É proibido baixar qualquer arquivo dos sites de referência ou de seus servidores, mesmo que esteja faltando.
- É proibido contornar recusas de servidor (403, 401 ou similares), alterar cabeçalhos para se passar por navegador ou usar links temporários e assinados.
- Se faltar algum arquivo, documentar como ausente e seguir sem ele.
- Toda extração em referencias/ entrega, no primeiro nível da pasta do site, somente: design-system__RESUMO.html, notas.md e a pasta arquivos/ com todo o resto. RESUMO tem de 2 a 5 palavras sobre o estilo visual, em minúsculas, sem acentos, com hífens, diferente dos já existentes.
- Exceção autorizada pelo Alisson: redesenhar SOMENTE o símbolo (cruz e círculo) para os ícones do site em assets/icons/, como aproximação PROVISÓRIA até o arquivo oficial do logo chegar. A regra de não recriar o logo continua valendo para todo o resto do site.
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
