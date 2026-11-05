# HANDOFF

## 1. Última sessão

- 05/11/2026: estrutura de pastas e dobras da página principal. Criados quem-somos.html, contribua.html, 404.html (provisórias), vercel.json com URLs limpas e redirecionamentos, assets/img/ e favicon provisório. SEO básico e noindex em todas as páginas. Teste leve em Chrome e Edge, 4 páginas, 1440 px e 390 px: 16 de 16 aprovadas; 9 redirecionamentos conferidos em servidor local que imita o vercel.json.

## 2. Estado atual

- Repositório conectado ao GitHub, só branch main. Todo push vai para o ar.
- No ar: a página principal em construção, com marcadores entre colchetes e noindex. O design system permanece excluído do deploy por .vercelignore.
- Design system oficial criado; logo oficial pendente e vermelho provisório. Tokens, componentes, JavaScript e fontes ficam em arquivos compartilhados em assets/.

## 3. Em andamento

- Nada.

## 4. Próximas tarefas

1. Montar as dobras restantes: copy e horários, Primeira visita, Para sua caminhada.
2. Validar o design system e substituir os provisórios quando chegarem o logo e o código oficial do vermelho.

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
- 05/11/2026: a branch dev NÃO volta. O projeto segue só na main, e cada push vai para o ar.
- 05/11/2026: o Alisson autorizou trocar o "Em breve" pela página principal em construção, direto na main, com marcadores entre colchetes visíveis e meta robots noindex até o lançamento.
- 05/11/2026: o vislumbre de Blog e Materiais entra na página principal agora, como dobra "Para sua caminhada", que pode linkar /blog e /materiais como páginas provisórias. Regra de lançamento: a dobra só fica visível com pelo menos 3 posts e 3 materiais reais; sem isso, é escondida.
- 05/11/2026: referencias/hero-video/ foi salva pelo Alisson como referência de estudo do template que inspirou a k-hero-led. É material de terceiros, só para estudo. Não segue o padrão de extração: não criar design-system nem notas.md nela e não mover nada.
- 05/11/2026: removida do AGENTS a regra que proibia linkar páginas não aprovadas a partir do index.
- 05/11/2026: a k-hero-led substitui a atmosfera com arco na página principal. KEMUEL é tipografia decorativa em malha de pontos, o logo fica só no cabeçalho e o texto é protegido por sombra radial localizada, com contraste AA medido nos pixels.
- Referências de outros sites ficam fora do Git e do deploy, só para estudo.
- Padrão das referências: primeiro nível de cada pasta do site contém somente design-system__RESUMO.html, notas.md e arquivos/ com todo o resto. RESUMO usa de 2 a 5 palavras sobre o estilo visual, em minúsculas, sem acentos, separadas por hífens e diferente dos já existentes. HTML original e pasta _files permanecem juntos em arquivos/.
- Design system antes das páginas da Fase 1.
- Vercel conectada antes do site pronto. Todo push na main vai para o ar.
- assets/design_system.html fora do deploy; tokens e estilos compartilhados em arquivos próprios, por exemplo assets/css/.
- Opção A: base branca, blocos pretos e vermelho somente em ações principais, marcadores, detalhes e estados; sem grandes superfícies vermelhas. Verde e âmbar ficam restritos ao feedback semântico.
- Fontes: Outfit para títulos, pelas formas geométricas e pelo peso próximo ao lettering observado; Public Sans para texto e interface, pelo desenho neutro e pela leitura confortável. Ambas SIL OFL 1.1, hospedadas localmente, sem fontes copiadas das referências. Somente o lettering vazado usa o derivado Outfit Kemuel Static 800, com contornos unidos para eliminar as costuras expostas por text-stroke; métricas preservadas e licença OFL ao lado.
- Tokens em assets/css/tokens.css; componentes em assets/css/components.css; interações em assets/js/ui.js. Easing único de interface e durações de 140ms, 260ms e 480ms. Sem frameworks ou rastreamento.
- Loop contínuo permitido SOMENTE no fundo da hero: ciclo de 24s, linear, animando apenas transform e opacity. Pausar fora da tela ou com aba oculta e desligar com prefers-reduced-motion. Todos os demais movimentos são finitos.
- --color-red #DE2E38 é PROVISÓRIO até o código oficial chegar. Print apenas observado e medido; não incorporado ao site. A referência está em referencias/marca-kemuel/logo-referencia.jfif; essa pasta guarda somente a referência de identidade e não é uma extração de site.
- Domínio: igrejakemuel.com.br.
- Site contemporâneo, com objetivo de informar membros e atrair visitantes.
- 05/11/2026: URLs limpas (/quem-somos, /contribua), sem barra final; erros comuns redirecionam pelo vercel.json.
- 05/11/2026: ordem das dobras da página principal: Cabeçalho, Hero, Venha nos visitar, Primeira visita, Quem somos, Contribua, Acompanhe, Rodapé.
- Site em 3 fases.
- Fase 1 (lançamento): Início, Quem somos, Contribua (PIX institucional com botão copiar e QR Code).
- Fase 2 (conteúdo): Materiais (PDFs públicos por categoria), Blog, Agenda opcional.
- Fase 3 (cursos): cursos em plataforma externa; o site só mostra cards com links.
- O design system nasce com os componentes das 3 fases: hero, menu mobile, bloco de horários, bloco de endereço com mapa, bloco de PIX, botão flutuante de WhatsApp, rodapé, card de post, página de texto longo, card de material, filtro por categoria, card de evento, card de curso.

## 9. Checklist de lançamento

- [ ] Nenhum marcador [ ] restante nas páginas.
- [ ] Logo oficial e vermelho oficial aplicados.
- [ ] Meta robots noindex removido.
- [ ] Links reais de WhatsApp, redes e mapa conferidos.
- [ ] Dobra "Para sua caminhada" só visível com pelo menos 3 posts e 3 materiais reais.
- [ ] Teste completo em 1440 px e 390 px.
