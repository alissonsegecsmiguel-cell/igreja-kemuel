# AGENTS.md

Regras fixas do projeto do site da Igreja Kemuel.

## Passagem de contexto

- Ler o HANDOFF.md no início de toda sessão.
- Atualizar o HANDOFF.md antes de todo commit.
- Usar sempre o design system do projeto (assets/design_system.html). Nunca criar visual do zero. Exceção: tarefas de estudo dentro de referencias/.
- O projeto usa apenas a branch main. Commit e push da main ao final de toda tarefa, para o HANDOFF sempre ir para o GitHub.
- A Vercel está conectada à main. Todo push na main vai para o ar em igrejakemuel.com.br.
- Até a Fase 1 ser aprovada, o index.html é a página "Em breve" e não pode ser substituído. Páginas novas podem ser criadas, mas não podem ser linkadas a partir do index.html.
- Os tokens e estilos compartilhados ficam em arquivos próprios (por exemplo assets/css/), nunca só dentro do design_system.html, porque ele não vai para o ar.
- Antes de começar as páginas da Fase 1, revisar com o Alisson se o projeto volta a usar uma branch dev.

## Segurança (repositório público)

- Nunca registrar dados pessoais, dados de membros, pedidos de oração, dados financeiros, credenciais, links privados ou falhas de segurança em nenhum arquivo. Itens sensíveis são acompanhados fora do repositório.
- Antes de todo push, conferir que nada sensível entrou nos commits.
- Nunca usar git add . sem antes conferir o git status.
- Commit errado ainda não enviado: corrigir com amend, não com commit novo por cima.
- A pasta referencias/ guarda sites de terceiros só para estudo. Nunca entra no Git nem no deploy. Nada de lá (imagens, textos, código) é copiado para o site.
- Imagens no site: só da igreja ou com licença. Imagens geradas por IA só como provisórias, nunca representando pessoas ou eventos reais da igreja. Letras de louvor não são publicadas.

## Forma de trabalho

- Mobile primeiro.
- MODO FILA: prompt que começa com "FILA: execute somente depois de terminar a tarefa atual." espera a tarefa atual terminar.
- Backlog: "Coloque isso no Backlog" pausa um item. "Retome o item [nome] do Backlog" retoma.
- Prompts longos podem vir em Parte 1 e Parte 2. Ao receber a Parte 1 com "AGUARDE A PARTE 2", só confirmar que entendeu.
- Testes leves: só o que foi alterado, em 1440 px e 390 px. Bateria completa só antes de publicar, quando pedido.
- Diagnóstico antes de correção: em qualquer problema, explicar a causa antes de corrigir.
- Ações irreversíveis (reescrever histórico, apagar arquivos, apagar deploys): primeiro só diagnóstico e plano. Executar apenas depois de aprovação, com backup.
- Relatório final de toda tarefa: arquivos alterados, testes feitos, status do push, inconsistências encontradas.
