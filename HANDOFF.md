# HANDOFF

## 1. Última sessão

- 05/11/2026: design system da Kemuel criado em assets/design_system.html, com tokens e componentes próprios para as três fases. Testes em 1440 px e 390 px: fontes locais, contraste AA, teclado e interações conferidos; sem rolagem horizontal, erros de console ou chamadas externas. Movimento reduzido desliga animações e transições. index.html preservado.

## 2. Estado atual

- Repositório conectado ao GitHub, só branch main.
- No ar continua só a página "Em breve". O design system permanece excluído do deploy por .vercelignore.
- Design system oficial criado; logo oficial pendente e vermelho provisório. Tokens, componentes, JavaScript e fontes ficam em arquivos compartilhados em assets/.

## 3. Em andamento

- Nada.

## 4. Próximas tarefas

1. Extrações locais concluídas: quatro pastas com design-system__RESUMO.html em referencias/ (0 pendentes).
2. Validar o design system e substituir os provisórios quando chegarem o logo e o código oficial do vermelho.
3. Antes de começar as páginas da Fase 1, revisar se o projeto volta a usar uma branch dev. Preservar o index.html "Em breve" até a aprovação da Fase 1.

## 5. Backlog

- Vazio.

## 6. Pendências que dependem de pessoas

- Arquivo oficial do logo em SVG ou PNG transparente, com versão para fundo claro, para substituir os espaços reservados "LOGO". Não recriar nem vetorizar a partir do print.
- Código oficial do vermelho para substituir --color-red PROVISÓRIO (#DE2E38). Média medida no print: RGB 234,8323 / 48,6398 / 59,6149, arredondada para #EB313C; ajuste uniforme de canais por fator 0,947 para AA com branco (4,61:1).
- Confirmar o registro do domínio igrejakemuel.com.br e em nome de quem está.
- Conteúdo institucional: endereço, horários dos cultos, quem somos, contatos.
- Fotos da igreja.
- Definir quem escreve o blog e a frequência.
- Definir a plataforma dos cursos e se serão gratuitos ou pagos.
- Perfil da Empresa no Google da igreja.

## 7. Concluído

- Base do projeto.
- Página provisória "Em breve" e regras para a conexão com a Vercel.
- Design system da Kemuel: tokens, componentes das três fases, fontes locais com licenças OFL e ícones SVG próprios com licença MIT. Evidências de testes locais em relatorios/kemuel-design-system/, fora do Git/deploy.
- Extração local da referência do blog: design-system.html, notas e evidências de teste, todos em referencias/ e fora do Git/deploy.
- Extração local de Clube de Literatura Clássica_files: design-system.html, notas, recursos e evidências de teste, todos em referencias/ e fora do Git/deploy.
- Extração local da referência de cursos: design-system.html, notas, recursos e evidências de teste, todos em referencias/ e fora do Git/deploy.
- Organização dos quatro estudos locais: primeiro nível com design system renomeado, notas.md e arquivos/; cópias de segurança e diagnóstico preservados localmente.

## 8. Decisões registradas

- Repositório público.
- Projeto fora do OneDrive.
- Só branch main por enquanto. Antes de começar as páginas da Fase 1, revisar se o projeto volta a usar dev.
- Referências de outros sites ficam fora do Git e do deploy, só para estudo.
- Padrão das referências: primeiro nível de cada pasta do site contém somente design-system__RESUMO.html, notas.md e arquivos/ com todo o resto. RESUMO usa de 2 a 5 palavras sobre o estilo visual, em minúsculas, sem acentos, separadas por hífens e diferente dos já existentes. HTML original e pasta _files permanecem juntos em arquivos/.
- Design system antes das páginas da Fase 1; a página provisória "Em breve" é a única exceção.
- Vercel conectada antes do site pronto, com página "Em breve". Todo push na main vai para o ar.
- Até a aprovação da Fase 1, preservar o index.html provisório e não incluir links para páginas novas nele.
- assets/design_system.html fora do deploy; tokens e estilos compartilhados em arquivos próprios, por exemplo assets/css/.
- Opção A: base branca, blocos pretos e vermelho somente em ações principais, marcadores, detalhes e estados; sem grandes superfícies vermelhas. Verde e âmbar ficam restritos ao feedback semântico.
- Fontes: Outfit para títulos, pelas formas geométricas e pelo peso próximo ao lettering observado; Public Sans para texto e interface, pelo desenho neutro e pela leitura confortável. Ambas SIL OFL 1.1, hospedadas localmente, sem fontes copiadas das referências. Nenhuma terceira família.
- Tokens em assets/css/tokens.css; componentes em assets/css/components.css; interações em assets/js/ui.js. Um easing e durações de 140ms, 260ms e 480ms. Sem frameworks, rastreamento ou animações contínuas.
- --color-red #DE2E38 é PROVISÓRIO até o código oficial chegar. Print apenas observado e medido; não incorporado ao site. O caminho informado para a marca não existia; a imagem correspondente foi encontrada em referencias/logo-referencia.jfif.jfif.
- Domínio: igrejakemuel.com.br.
- Site contemporâneo, com objetivo de informar membros e atrair visitantes.
- Site em 3 fases.
- Fase 1 (lançamento): Início, Quem somos, Contribua (PIX institucional com botão copiar e QR Code).
- Fase 2 (conteúdo): Materiais (PDFs públicos por categoria), Blog, Agenda opcional.
- Fase 3 (cursos): cursos em plataforma externa; o site só mostra cards com links.
- O design system nasce com os componentes das 3 fases: hero, menu mobile, bloco de horários, bloco de endereço com mapa, bloco de PIX, botão flutuante de WhatsApp, rodapé, card de post, página de texto longo, card de material, filtro por categoria, card de evento, card de curso.
