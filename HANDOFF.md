# HANDOFF

## 1. Última sessão

- 05/11/2026: defeito do CSS corrigido, cabeçalho e rodapé centralizados com script, fases atualizadas. Medidas soltas de components.css viraram tokens, com comparação de estilos calculados em 3.874 elementos. Páginas montadas idênticas às anteriores, tirando os marcadores.

## 2. Estado atual

- Repositório conectado ao GitHub, só branch main. Todo push vai para o ar.
- Blog, Materiais e cursos e Discipulado existem como páginas provisórias, no menu.
- No ar: a página principal em construção, com marcadores entre colchetes e noindex. O design system permanece excluído do deploy por .vercelignore.
- Design system oficial criado; logo oficial pendente e vermelho provisório. Tokens, componentes, JavaScript e fontes ficam em arquivos compartilhados em assets/.

## 3. Em andamento

- Nada.

## 4. Próximas tarefas

1. Preencher os marcadores conforme chegarem os dados da igreja e seguir o checklist de lançamento.
2. Validar o design system e substituir os provisórios quando chegarem o logo e o código oficial do vermelho.

## 5. Backlog

- Vazio.

## 6. Pendências que dependem de pessoas

- Arquivo oficial do logo em SVG ou PNG transparente, com versão para fundo claro, para substituir os espaços reservados "LOGO". Não recriar nem vetorizar a partir do print.
- Código oficial do vermelho para substituir --color-red PROVISÓRIO (#DE2E38). Média medida no print: RGB 234,8323 / 48,6398 / 59,6149, arredondada para #EB313C; ajuste uniforme de canais por fator 0,947 para AA com branco (4,61:1).
- Confirmar o registro do domínio igrejakemuel.com.br e em nome de quem está.
- Conteúdo institucional: endereço, quem somos, contatos.
- Fotos da igreja.
- Definir quem escreve o blog e a frequência.
- Primeiros materiais em PDF.
- Definir a plataforma dos cursos e se serão gratuitos ou pagos.
- Conteúdo de Discipulado, Materiais e cursos e Blog.
- Perfil da Empresa no Google da igreja.
- Validar a frase da hero com o pastor.
- Respostas do FAQ: duração e estrutura do culto, costume de vestimenta, ministério infantil e faixa etária, como a igreja recebe visitantes, estacionamento.
- Número oficial do WhatsApp.
- Logo oficial em versão clara e escura.
- Confirmar que todos os cursos e materiais serão gratuitos, por causa do texto do botão da hero.

## 7. Concluído

- Base do projeto.
- Parte "No celular" da tarefa do cabeçalho: horários compactos, botão principal com largura total e o secundário abaixo, subtítulo menor sem ser cortado, conferidos em 390x844 e 360x740.
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
- Loop contínuo permitido SOMENTE no fundo da hero, em linear, animando apenas transform e opacity. Pausar fora da tela ou com aba oculta e desligar com prefers-reduced-motion. Todos os demais movimentos são finitos.
- --color-red #DE2E38 é PROVISÓRIO até o código oficial chegar. Print apenas observado e medido; não incorporado ao site. A referência está em referencias/marca-kemuel/logo-referencia.jfif; essa pasta guarda somente a referência de identidade e não é uma extração de site.
- Domínio: igrejakemuel.com.br.
- Site contemporâneo, com objetivo de informar membros e atrair visitantes.
- 05/11/2026: URLs limpas (/discipulado, /materiais, /blog, /contribua), sem barra final; erros comuns redirecionam pelo vercel.json.
- 05/11/2026: ordem e fundos das dobras da página principal: Cabeçalho branco; Hero preto; Venha nos visitar branco; Primeira visita branco suave; Quem somos preto; Para sua caminhada branco; Contribua branco suave; Acompanhe branco; Rodapé preto.
- 05/11/2026: cultos às quintas-feiras, 19h, e aos domingos, 18h, confirmados pelo Alisson. Sem nomes próprios: usar apenas "Culto".
- 05/11/2026: copy da hero: "Bem-vindo à" (sólida), "casa de Deus." (vazada) e subtítulo "Uma comunidade de fé de portas abertas para você e sua família viverem mais perto de Deus."
- 05/11/2026: FAQ da Primeira visita com 5 perguntas, sem pergunta de horários, que já aparecem na hero e em Venha nos visitar.
- 05/11/2026: cabeçalho transparente na página principal, sólido ao rolar além da hero; sólido direto nas demais páginas. Altura de 56 px no celular e 64 px no computador. Sem o nome ao lado do logo: o logo oficial já o contém.
- 05/11/2026: regra da primeira dobra no AGENTS: logo e menu, título, subtítulo, horários e os dois botões sempre visíveis sem rolar, em qualquer tela. A k-hero-led ocupa 100svh, com KEMUEL no fundo e o conteúdo centralizado à frente.
- 05/11/2026: causa da página sem estilos: o commit 516b5c4 trocou os caminhos do index.html para /assets/..., que em file:// aponta para a raiz do disco. A CSP não bloqueou nada e continua nas páginas. O servidor local de testes usava a raiz do projeto, por isso não pegou o erro.
- 05/11/2026: correção: páginas públicas com caminhos relativos a assets/; 404.html mantém /assets/ porque é servida em qualquer profundidade. Removido o preload de fontes, que gerava erros de CORS em file://. Os links entre páginas seguem como URLs limpas e só navegam no endereço publicado.
- 05/11/2026: nova regra de conferência: antes de todo push, abrir o index.html publicado e conferir no console; abrir também por file://, e repetir no publicado após o deploy.
- 05/11/2026: aurora em ciclo de 8 a 12 segundos (diagonal branca de 10s e horizontal vermelha de 12s, defasadas), com pontos que acendem por onde a luz passa e respiração da palavra em 6s; uma mancha só no celular. O pico da mancha branca fica abaixo do cinza da palavra, para as letras seguirem legíveis.
- 05/11/2026: menu: Discipulado, Materiais e cursos, Blog, Contribua e botão Planeje sua visita. Sem Início e sem Quem somos: o logo leva à página inicial.
- 05/11/2026: Quem somos só na página principal: quem-somos.html removida, e /quem-somos, /quemsomos, /sobre e /historia redirecionam para /#quem-somos.
- 05/11/2026: materiais e cursos na mesma página, em /materiais, com as âncoras #materiais e #cursos.
- 05/11/2026: botões da hero: "Como chegar" (primário) e "Cursos e materiais gratuitos" (secundário); "Planeje sua visita" só no cabeçalho; hero sem eyebrow.
- 05/11/2026: efeito de água em filtro SVG (feTurbulence e feDisplacementMap), não na lente CSS: a medição em 1366x768 por 10 s deu cerca de 60 quadros por segundo, acima do limite de 50, no Chrome com aceleração de hardware desta máquina. Efeito só em telas com mouse, desligado com movimento reduzido e com a hero fora da tela.
- 05/11/2026: token âmbar (--hero-led-amber) restrito à atmosfera da hero: não é cor de interface, botão ou texto; o vermelho continua sendo o único acento. Os feixes de vitral, em ciclos de 12s e 14s, substituem a mancha branca da aurora; a mancha de leve tom vermelho permanece. No celular, um feixe só.
- 05/11/2026: cruz de luz genérica, com hastes alinhadas, diferente da cruz do logo, atrás da palavra KEMUEL, respirando em 8s.
- 05/11/2026: partials e script de montagem: cabeçalho e rodapé têm código único em partials/, aplicado por node scripts/montar-paginas.mjs, sem dependências. O resultado continua HTML estático; a Vercel não roda o script e partials/ e scripts/ ficam fora do deploy.
- 05/11/2026: regra de edição: toda mudança no cabeçalho ou no rodapé é feita em partials/ e aplicada pelo script antes do commit; proibido editar direto nas páginas. Conferência por file:// só para checar que os estilos carregam.
- 05/11/2026: medidas fixas de componentes são tokens em tokens.css; breakpoints ficam nos @media, onde CSS não aceita var().
- Site em 3 fases.
- Fase 1 (lançamento): Início, com Quem somos como dobra, e Contribua (PIX institucional com botão copiar e QR Code).
- Fase 2 (conteúdo): Blog e Materiais e cursos (PDFs públicos por categoria) já estão no menu, com páginas provisórias, antecipados da Fase 2 por decisão do Alisson. Agenda opcional segue na Fase 2.
- Fase 3 (cursos): os cursos continuam em plataforma externa; o site só mostra cards com links, em /materiais#cursos.
- O design system nasce com os componentes das 3 fases: hero, menu mobile, bloco de horários, bloco de endereço com mapa, bloco de PIX, botão flutuante de WhatsApp, rodapé, card de post, página de texto longo, card de material, filtro por categoria, card de evento, card de curso.

## 9. Checklist de lançamento

- [ ] Nenhum marcador [ ] restante nas páginas.
- [ ] Logo oficial e vermelho oficial aplicados.
- [ ] Meta robots noindex removido.
- [ ] Links reais de WhatsApp, redes e mapa conferidos.
- [ ] Dobra "Para sua caminhada" só visível com pelo menos 3 posts e 3 materiais reais.
- [ ] Só ficam no menu as páginas com conteúdo real. Páginas ainda provisórias saem do menu no lançamento e voltam quando tiverem conteúdo.
- [ ] Teste completo em 1440 px e 390 px.
