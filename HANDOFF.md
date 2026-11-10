# HANDOFF

## 1. Última sessão

- 09/11/2026 (fila 04): modelo de post no estilo de leitura do NYT (k-article), fluxo de conversão e 5 posts de exemplo. Rascunhos em textos-blog/ (privado) convertidos por scripts/converter-post.mjs (.md e .docx, ignorando o texto cinza do modelo) em conteudo/blog/*.md e imagens .webp; scripts/montar-paginas.mjs gera blog/[slug].html e dados/posts.json. Capa em colagem (k-collage-cover) criada para as listas. Testes por servidor local nos 5 posts em 1440x900 e 390x844: coluna de cerca de 65 caracteres, Newsreader 20/18 px, barra de progresso, legenda e crédito, aviso de exemplo, copiar link e WhatsApp, Leia também, contraste AA, só a barra em vermelho, sem erros.

- 09/11/2026 (fila 03): logo redesenhado em vetor (provisório), com versões horizontal, empilhada e símbolo, claras e escuras, em assets/brand/, e PNG 1200x630 para og:image. Aplicado no cabeçalho (SVG interno, tinta segue a cor do cabeçalho: branco sobre a hero, preto no sólido, troca de 140ms), no rodapé (empilhado claro) e nos ícones de 180, 192 e 512 px. Nenhum “LOGO” restante. Seção “Logo” no design system com versões, respiro, tamanho mínimo, fundos e usos proibidos. Folha de comparação em relatorios/kemuel-logo/. Testes por servidor local em 1440x900, 1366x768, 390x844 e 360x740 e primeira dobra em 14 telas: sem erros, logo nas duas variantes, rodapé empilhado.

- 09/11/2026 (fila 02): links oficiais do Instagram (@igrejakemueliguatu) e do YouTube (@Igreja.kemuelsede) aplicados a partir de dados/igreja.json: dobra “Acompanhe” com três cards (Instagram, YouTube, Blog), ícones no rodapé de todas as páginas e sameAs no JSON-LD. Ícones k-instagram e k-youtube desenhados no padrão de traço do sistema, sem logotipos coloridos. Testes por servidor local em 1366x768 e 390x844 nas seis páginas: links, nova aba com aviso acessível, alvo de 44px, foco visível, JSON-LD e console sem erros.

- 09/11/2026 (fila 01): dados reais da igreja aplicados em todas as páginas, a partir de dados/igreja.json. Hero, Bíblia, tabela de cultos, linha do tempo, rodapé (partial), FAQ de demonstração do manual, títulos, descriptions, Open Graph e JSON-LD Church gerados pelo script de montagem (scripts/dados-igreja.mjs), idempotente. Botões “Ver rota no mapa” agora abrem o Google Maps em nova aba. Testes por servidor local em 1366x768 e 390x844 nas seis páginas: dados corretos, rodapé idêntico, mapa com o endereço certo, JSON-LD válido, sem erros de console; primeira dobra em 14 telas, com 19h30 sem quebra em 360 px.

- 09/11/2026: início da fila sem o Alisson. Trabalho pendente da linha do tempo “Quem somos” (descrito abaixo) conferido e publicado: fumaça em /, /blog e 404 em 1440x900 e 390x844 sem rolagem horizontal, erros de console ou requisições com falha; quatro capítulos, um aberto por vez, cenas montadas e sem erros nas duas larguras.

- 09/11/2026: dobra “Quem somos” refeita como linha do tempo com quatro capítulos de exemplo e ilustrações animadas. k-timeline, k-timeline-card, k-story-stage e k-story-scene criados no design system, com documentação e galeria de movimento. Textos e SVGs reaproveitados por autorização explícita do protótipo aprovado; CSS/JS reescritos com tokens --timeline-*. Aviso “Prévia”, fontes remotas e orientações de preenchimento não foram publicados; as orientações ficaram em comentários HTML.
- Um único palco 4:3 fica na coluna fixa do computador e dentro do card ativo abaixo de 900px. Lista HTML aceita 3 a 6 capítulos, sem quantidade fixa no JS; botões com aria-expanded/aria-controls, painel associado, descrição das ilustrações e status aria-live. Sem troca automática. Cenas SVG têm fonte única em partials/story-scenes.html, aplicada pelo script de montagem em templates inertes; montagem só quando o palco entra na tela ou por seleção. Fotos reais futuras são opt-in, com alt e sem requisições para arquivos ausentes.
- Animações próprias de 1,6s, uma vez por ativação, reiniciadas ao retornar ao capítulo: lâmpada/cadeiras; prédio/cruz/caminho; portas/luz; sol/estrada em três passadas finitas. Só transform/opacity; brilho respira suavemente em 12s e pausa com palco fora da tela ou aba oculta. Movimento reduzido entrega estado final imediato. O card futuro usa cinza próprio com AA, sem opacidade no card inteiro; legenda tem proteção preta de pelo menos 80% sobre qualquer imagem. Hero, menu e demais dobras permanecem idênticos no HTML.

- 09/11/2026: dobra “Primeira visita” refeita como ficha editorial. Novos componentes k-spec-section, k-spec-faq, k-photo-collage e k-callout no design system; papel quente, título Anton em três linhas, cinco perguntas sem alterar respostas e colagem decorativa preparada para foto real. Composição, proporções e ritmo observados na referência; nenhum recurso de terceiros copiado. k-faq-split e seu token removidos por não haver outros usos; a lógica comum de k-faq foi reaproveitada com aria-expanded sincronizado. Hero, menu, Bíblia e demais dobras preservados.
- Anton latina estática 400 local (20.772 B), SIL OFL 1.1 ao lado. Conforme esclarecimento desta sessão, Anton entra como terceira família e Newsreader ocupa a quarta vaga restrita, preservando a Bíblia; não existe vaga adicional para outra serifada. O eyebrow pequeno usa o vermelho de texto existente #C1232C, pois o primário #DE2E38 fica abaixo de AA sobre o papel quente. Marcador e pincel conservam o primário.
- Testes da ficha no Chrome por servidor local em 1440x900, 1366x768, 390x844 e 360x740: sem rolagem horizontal, erros de console ou requisições com falha; Anton carregada e título em três linhas sem cortes; primeira pergunta aberta, cliques, toque nativo, Enter/Espaço, foco visível e aria-expanded conferidos. Colagem centralizada mesmo com respostas abertas; ordem móvel correta, etiquetas contidas e movimento reduzido sem animação. Design system em 1440/390 e sanfona sem JavaScript também passaram; file:// usado só para estilos. Prints integrais e relatório em relatorios/kemuel-ficha/, ignorado pelo Git/deploy. Contraste conservador sobre o grão máximo: texto 14,31:1; rótulos 5,95:1; eyebrow 4,73:1; etiquetas brancas 7,45:1; botão 4,61:1.

- 09/11/2026: dobra “Venha nos visitar” refeita com Bíblia 3D e composição editorial. Componentes k-bible, k-bible-pages, k-info-table e k-editorial criados e demonstrados no design system. Técnica de camadas, estados, inclinação, brilho, folha e gestos adaptada do projeto próprio Caderninho; nenhuma identidade visual ou arquivo comercial incorporado. Hero, menu e demais dobras preservados, inclusive no HTML. Newsreader latina normal/itálica local com OFL, pesos variáveis e desenho óptico fixado em 16 para reduzir os arquivos a 128 KB. Abertura única, navegação manual, montagem a 900px, pausa fora da tela/aba, sem flutuação e com movimento reduzido respeitado. Contraste AA calculado inclusive no cruzamento do quadriculado sob o cartão. Evidências e Lighthouse em relatorios/kemuel-biblia/, fora do Git/deploy.
- Testes locais no Chrome em 1440x900, 1366x768, 390x844 e 360x740: primeira dobra preservada, sem rolagem horizontal ou erros de console/rede; abertura única, pausa durante a abertura, retorno sem repetir, setas, teclado, arraste e movimento reduzido conferidos. Montagem não altera as dimensões do livro; vitrine em 1440/390 e estilos por file:// também conferidos. Arraste nativo por toque passou. Medição por pixels nas áreas das legendas, com limite conservador do brilho máximo: mínimo de 5,09:1. Prints dos estados e das dobras inteiras preservados localmente. Publicado anterior ao push conferido sem erros de CSS/JS.
- Lighthouse 13.6.0 mobile simulado: a primeira medição, antes de editar, deu medianas 98 / LCP 1.362ms / TBT 160ms. Houve oscilação ampla também no código anterior; por isso a comparação final usou cinco pares intercalados, com o HEAD anterior servido em memória e a versão final no mesmo servidor, perfis novos e nenhum outro teste de navegador em paralelo. Medianas comparáveis: Performance 90 → 94; LCP 1.364 → 1.368ms; TBT 389 → 272ms; CLS 0 → 0. TBT por rodada: antes 542/445/66/389/153ms, depois 159/68/406/272/324ms. Sem regressão de mediana, sem atribuir ganho garantido a diferenças sujeitas à oscilação. Newsreader fora do carregamento inicial. Relatórios completos e hashes em relatorios/kemuel-biblia/lighthouse-pareado.json.

## 2. Estado atual

- Repositório conectado ao GitHub, só branch main. Todo push vai para o ar.
- Blog, Materiais e cursos e Discipulado existem como páginas provisórias, no menu.
- No ar: a página principal em construção, com marcadores entre colchetes e noindex. O design system permanece excluído do deploy por .vercelignore.
- Design system oficial criado; logo oficial pendente e vermelho provisório. Tokens, componentes, JavaScript e fontes ficam em arquivos compartilhados em assets/.
- Dobra de visita editorial com Bíblia em CSS 3D, duas duplas de páginas e tabela de cultos/endereço sempre disponível. Dados não confirmados seguem como marcadores.
- Dobra Quem somos em capítulos interativos, com história e ilustrações de exemplo a substituir/validar antes do lançamento.

## 3. Em andamento

- Nada.

## 4. Próximas tarefas

1. Dobra “Venha nos visitar” com Bíblia 3D: já implementada; aguardando validação. Mantida sem alterações nesta tarefa.
2. Preencher os marcadores conforme chegarem os dados da igreja e seguir o checklist de lançamento.
3. Validar o design system e substituir os provisórios quando chegarem o logo e o código oficial do vermelho.

## 5. Backlog

- Vazio.

## 6. Pendências que dependem de pessoas

- Aprovação do pastor sobre os 5 textos de exemplo do blog.
- Número do endereço da sede (hoje [número] visível no site).
- Confirmar se há congregações em outras cidades.
- Corrigir a ficha do Google da igreja, se algum dado estiver diferente.
- História real da igreja em capítulos: ano, título e 2 a 4 frases por capítulo; fotos por capítulo, se houver; aprovação pastoral. Decidir entre manter as ilustrações ou usar fotos reais autorizadas em cada capítulo.
- Foto real da entrada ou da recepção e pontos reais das etiquetas [RECEPÇÃO] e [ESPAÇO INFANTIL]. As posições atuais são provisórias; ao inserir a foto, retirar aria-hidden da colagem e incluir alt descritivo.
- Visita editorial: confirmar endereço completo e observação de estacionamento/acesso.
- Texto curto sobre como é o culto e validação da frase “Sem roupa certa, sem cobrança na porta.”
- Versículo e tradução autorizada, somente se a igreja decidir incluir uma citação na Bíblia; nenhum texto bíblico foi publicado.

- Arquivo original do logo (SVG ou PNG transparente, versões clara e escura) para substituir o redesenho provisório de assets/brand/ e os ícones de assets/icons/.
- Código oficial do vermelho para substituir --color-red PROVISÓRIO (#DE2E38). Média medida no print: RGB 234,8323 / 48,6398 / 59,6149, arredondada para #EB313C; ajuste uniforme de canais por fator 0,947 para AA com branco (4,61:1).
- Confirmar o registro do domínio igrejakemuel.com.br e em nome de quem está.
- Conteúdo institucional: quem somos, contatos.
- Fotos da igreja.
- Definir quem escreve o blog e a frequência.
- Primeiros materiais em PDF.
- Definir a plataforma dos cursos e se serão gratuitos ou pagos.
- Conteúdo de Discipulado, Materiais e cursos e Blog.
- Perfil da Empresa no Google da igreja.
- Validar a frase da hero com o pastor.
- Respostas do FAQ: duração e estrutura do culto, costume de vestimenta, ministério infantil e faixa etária, como a igreja recebe visitantes, estacionamento.
- Número oficial do WhatsApp.
- Aprovação visual do Alisson do logo redesenhado: folha em relatorios/kemuel-logo/comparacao.png.
- Confirmar que todos os cursos e materiais serão gratuitos, por causa do texto do botão da hero.
- Substituir os ícones provisórios quando chegarem o arquivo oficial do logo e o código oficial do vermelho.

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

- 09/11/2026: fluxo do blog: textos-blog/ (privado, fora do Git e do deploy) → conteudo/blog/[slug].md (Git) → blog/[slug].html (Git e site); dados/posts.json gerado a partir dos front matters, nunca editado à mão. Convenções do modelo-post.docx: campos no topo, Título 1, subtítulo em itálico, Título 2, CITAÇÃO:, IMAGEM: arquivo | legenda | crédito, texto cinza ignorado, autor padrão Igreja Kemuel, data padrão hoje. Campo opcional “Foco da capa” para o recorte 3:2 (acrescentado sem o Alisson, revisar).
- 09/11/2026: Newsreader com uso ampliado para títulos e texto dos posts e palavras de destaque em itálico em títulos editoriais, além de visita editorial, Bíblia e citações. Nenhuma família nova.
- 09/11/2026: imagens do blog só de Wikimedia Commons (domínio público ou PD-Art) e acervos CC0 (Met Open Access), com licença conferida antes do download e registrada em dados/creditos-imagens.json e no crédito da capa. Post 04 usa a pintura de Duccio (obra em domínio público, reprodução CC0 da National Gallery of Art), porque a versão PD-Art tinha só 850 px; a API do Met estava fora (HTTP 410), então a lamparina do Met veio pelo Commons (decidido sem o Alisson, revisar).
- 09/11/2026: versículos nos posts só por referência, explicados com palavras próprias; nenhum texto de tradução copiado.
- 09/11/2026: dependências de desenvolvimento (mammoth, marked, sharp) em scripts/package.json, dentro de scripts/, que está fora do deploy, para a Vercel não instalar nada; node_modules/ ignorado (decidido sem o Alisson, revisar). Na página do post, o único vermelho da área de leitura é a barra de progresso; cabeçalho, logo e foco de teclado seguem o sistema (decidido sem o Alisson, revisar).
- 09/11/2026: exceção ampliada pelo Alisson: o logo completo (símbolo, “IGREJA” e “Kemuel”) foi redesenhado em contornos, como aproximação PROVISÓRIA até o original aparecer; aprovação visual pendente. Arquivos em assets/brand/; regras de uso na seção “Logo” do design system. Palavras a partir da Outfit (600 em Kemuel, 350 em IGREJA), encaixadas letra por letra nas caixas medidas da referência; Λ desenhado à parte.
- 09/11/2026: no site, o logo é SVG interno com classes k-logo__ink (currentColor) e k-logo__ring (--color-red), para a cor vir dos tokens e trocar com o cabeçalho; os arquivos de imagem têm as cores gravadas. logo-simbolo.svg (cruz branca) e logo-simbolo-escuro.svg (cruz preta) em dois arquivos (decidido sem o Alisson, revisar). Favicon de 16/32 px mantém a simplificação de legibilidade; ícones grandes usam o símbolo refinado. Estilos e tokens do antigo espaço “LOGO” removidos.
- 09/11/2026: redes oficiais em dados/igreja.json (bloco redes), aplicadas por data-dado-href. Dobra “Acompanhe” com Instagram, YouTube e Blog, cada card com uma ação secundária. Marcador do WhatsApp sai da dobra e do rodapé e fica só no botão flutuante, como exemplo (rodapé sem WhatsApp: decidido sem o Alisson, revisar).
- 09/11/2026: Igreja Kemuel em Iguatu - CE; sede na Av. Dr. José Holanda Montenegro, [número], Centro. Fonte única de dados em dados/igreja.json (fora do deploy), aplicada pelo script de montagem por meio de data-dado e data-dado-href; títulos no formato “[Página] · Igreja Kemuel · Iguatu, CE”.
- 09/11/2026: o grupo musical gospel Kemuel (Itu, SP) não tem relação com a igreja e não deve ser citado. Congregações em outras cidades (como Crato) não são citadas sem confirmação.
- 09/11/2026: JSON-LD Church com streetAddress “Av. Dr. José Holanda Montenegro, Centro” enquanto o número for marcador; bairro incluído no streetAddress porque PostalAddress não tem campo próprio (decidido sem o Alisson, revisar). Horários em openingHoursSpecification.
- 09/11/2026: k-timeline, k-timeline-card, k-story-stage e k-story-scene usam o protótipo aprovado de referencias/linha-do-tempo/ como base principal de composição, interação, textos e SVGs, estes dois últimos explicitamente autorizados. Nenhum arquivo dessa pasta entrou no Git/deploy; somente as ilustrações autorizadas foram adaptadas para o partial canônico. Sem faixa “Prévia”, fontes externas ou texto de orientação visível.
- 09/11/2026: capítulos manuais, primeiro ativo ao carregar, palco dentro do card no celular e na coluna fixa no computador. Cenas finitas de 1,6s por ativação; retorno a capítulo visto repete a cena. Único loop da história: brilho de fundo, opacity em 12s, com easing único, pausado fora do palco/aba e desligado com movimento reduzido. Esta autorização amplia a regra anterior de loop somente na hero; nada mudou no movimento da hero.
- 09/11/2026: k-spec-section, k-spec-faq, k-photo-collage e k-callout compõem a ficha de primeira visita. Papel --paper-warm (#F4F0E8), grão discreto em CSS, colagem à esquerda com cerca de 45% e conteúdo à direita; no celular, colagem depois da ação. Primeira pergunta aberta, demais fechadas; detalhes semânticos e lógica comum de animação, com movimento reduzido imediato. Etiquetas reveladas uma vez, sem loop. k-faq-split removido por não haver usos restantes, inclusive seu token; não havia comportamento específico dele no JavaScript.
- 09/11/2026: regra de fontes atualizada por esclarecimento explícito: Outfit, Public Sans, Anton (terceira, somente títulos grandes condensados em caixa alta) e Newsreader (quarta, restrita à visita editorial, Bíblia e citações). A vaga serifada já está ocupada e não há quinta família autorizada. Esta decisão substitui a regra anterior de Newsreader como terceira e última; os arquivos e a dobra da Bíblia foram preservados.
- 09/11/2026: novos tokens da ficha somente em --paper-* e --spec-*. Contraste do eyebrow: #C1232C reutilizado do vermelho existente para texto; o primário permanece nos detalhes. Colagem com tratamento CSS de foto, moldura, duas pontas rasgadas, retícula e pincel SVG próprio. Sem foto de terceiros, biblioteca, canvas ou WebGL.
- 09/11/2026: k-editorial, k-bible, k-bible-pages e k-info-table compõem somente a dobra #visite. Papel #E9E9E9 quadriculado a 10% (1px / 200px no computador; 25vw no celular), livro ao centro e tabela/coluna editorial abaixo. #endereco fica no cartão sempre visível, independente da dupla aberta. Nada alterado nas demais dobras.
- 09/11/2026: técnica do projeto próprio Caderninho adaptada com nomes e tokens Kemuel: camadas, estados, mouse, brilho, folha, gestos, montagem preguiçosa e pausa. Bíblia sem imagens: capa dura escura, cruz simples de hastes alinhadas diferente do logo, lombada sem espiral, folhas quentes e fita vermelha. Composição editorial comercial apenas observada; nenhum código ou recurso incorporado.
- 09/11/2026: Newsreader é a terceira e última família, restrita à visita editorial, às páginas da Bíblia e a citações na variante k-quote--editorial. Fonte oficial Google Fonts / Production Type, SIL OFL 1.1: newsreader-latin-variable.woff2 (60.420 B), newsreader-latin-italic-variable.woff2 (67.328 B), newsreader-OFL.txt. Subconjunto latino, eixo wght 200–800, opsz fixado em 16; pesos editoriais 200/300/400 itálico/700, números dos horários em Outfit. Sem fontes das referências. Fontes editoriais carregadas só com a seção efetivamente visível; fallback Georgia, e capa abre após a fonte ficar pronta.
- 09/11/2026: novos tokens --paper-*, --editorial-* e --bible-* em assets/css/tokens.css. Durações ligadas às existentes: entrada 260ms; abertura e folha 480ms, easing único. A Bíblia abre uma vez e permanece aberta; sem autoplay, sem ciclo e sem flutuação, inclusive no celular. Camadas montadas a 900px da tela após load/tempo ocioso, sem alterar as dimensões reservadas. Páginas inativas com content-visibility e altura intrínseca calculada pelos tokens. Observador no contêiner estável, independente da inclinação. Movimento reduzido: aberta e parada. Mouse fino: inclinação máxima de 6°; toque sem inclinação. Loop continua restrito à atmosfera da hero.
- 09/11/2026: contraste da visita: #171717 sobre papel 14,77:1; sobre cartão 13,71:1; no pior cruzamento da malha sob o cartão, 8,84:1. Nas folhas, principal 16,75:1 e apoio 6,96:1; sombra máxima conserva AA. Botão branco/vermelho 4,61:1. Legendas do cartão usam o texto principal para manter AA sobre as linhas.

- 09/11/2026: fundo da hero com uma única proteção elíptica, sem patamar opaco. Valores finais: --hero-led-text-shade: radial-gradient(ellipse farthest-corner, rgba(0, 0, 0, .74) 0%, rgba(0, 0, 0, .64) 65%, rgba(0, 0, 0, .2) 90%, rgba(0, 0, 0, 0) 100%); --hero-led-text-shade-width: clamp(44rem, 74vw, 70rem); novo --hero-led-title-shade: none, impedindo a sobreposição da segunda sombra. O token --hero-led-title-shade-bleed conserva seu valor original.
- 09/11/2026: cruz de luz: --hero-led-cross-top: calc(var(--hero-led-word-center) - var(--hero-led-word-size) * .4); --hero-led-cross-arm: clamp(12rem, 50vw, 44rem); --hero-led-cross-horizontal: linear-gradient(180deg, rgba(var(--hero-led-amber), 0), rgba(var(--hero-led-amber), .45) 22%, rgba(var(--hero-led-amber), .95) 42%, rgba(var(--hero-led-amber), .95) 58%, rgba(var(--hero-led-amber), .45) 78%, rgba(var(--hero-led-amber), 0)). Respiração de 8s, opacidades, haste vertical e recorte pela malha preservados.
- 09/11/2026: contraste medido sem os glifos, mantendo sombras e fundos dos horários, pelo pixel mais claro em todos os retângulos de texto. Limite conservador com fundo totalmente branco (mais claro que qualquer instante da atmosfera): em 1440x900, título 8,59:1 e subtítulo 5,56:1; em 1366x768, 8,72:1 e 5,38:1; em 390x844, 8,32:1 e 5,38:1. Horários e dias 18,88:1; rótulo Culto 10,94:1. Todos acima de AA. Esses limites substituem as medições antigas no texto do manual, que foi preservado pela restrição desta tarefa de não alterar textos.
- 09/11/2026: partials/svg-symbols.html, partials/whatsapp.html e partials/toast.html são a fonte dos blocos comuns, com marcadores symbols, whatsapp e toast. node scripts/montar-paginas.mjs atualiza as seis páginas públicas e esses três blocos no manual; o manual mantém cabeçalho e navegação próprios. Só entram no HTML os símbolos referenciados, incluindo k-close, trocado pelo menu em ui.js. O filtro SVG da água continua dentro da hero. Montagem idempotente e com validação de todos os marcadores antes de escrever as páginas.
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
- Atmosferas contínuas autorizadas: fundo da hero em linear e respiração do brilho da história em 12s com o easing único. Só transform/opacity; pausar fora da tela ou com aba oculta e desligar com prefers-reduced-motion. Cenas da história duram 1,6s por ativação; todos os demais movimentos seguem finitos.
- --color-red #DE2E38 é PROVISÓRIO até o código oficial chegar. Print apenas observado e medido; não incorporado ao site. A referência está em referencias/marca-kemuel/logo-referencia.jfif; essa pasta guarda somente a referência de identidade e não é uma extração de site.
- Domínio: igrejakemuel.com.br.
- Site contemporâneo, com objetivo de informar membros e atrair visitantes.
- 05/11/2026: URLs limpas (/discipulado, /materiais, /blog, /contribua), sem barra final; erros comuns redirecionam pelo vercel.json.
- 05/11/2026: ordem e fundos das dobras da página principal: Cabeçalho branco; Hero preto; Venha nos visitar branco; Primeira visita branco suave; Quem somos preto; Para sua caminhada branco; Contribua branco suave; Acompanhe branco; Rodapé preto.
- 09/11/2026: cultos na sede às quintas-feiras, às 19h30, e aos domingos, às 18h, confirmados pelo Alisson. Substitui a decisão de 05/11/2026 (quinta às 19h). Sem nomes próprios: usar apenas "Culto".
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
- 05/11/2026: o Alisson autorizou redesenhar SOMENTE o símbolo (cruz e círculo) para os ícones do site, como aproximação PROVISÓRIA até o arquivo oficial do logo. Exceção registrada no AGENTS.
- 05/11/2026: favicon sobre quadrado preto de cantos arredondados: a cruz branca sumiria em aba clara, e assim cruz e círculo aparecem em abas claras e escuras. Em 16 px, haste mais curta e anel maior, mantendo as peças deslocadas e os vãos. Ícones de 180, 192 e 512 px ficam mais fiéis à referência, com fundo no quadrado inteiro.
- Site em 3 fases.
- Fase 1 (lançamento): Início, com Quem somos como dobra, e Contribua (PIX institucional com botão copiar e QR Code).
- Fase 2 (conteúdo): Blog e Materiais e cursos (PDFs públicos por categoria) já estão no menu, com páginas provisórias, antecipados da Fase 2 por decisão do Alisson. Agenda opcional segue na Fase 2.
- Fase 3 (cursos): os cursos continuam em plataforma externa; o site só mostra cards com links, em /materiais#cursos.
- O design system nasce com os componentes das 3 fases: hero, menu mobile, bloco de horários, bloco de endereço com mapa, bloco de PIX, botão flutuante de WhatsApp, rodapé, card de post, página de texto longo, card de material, filtro por categoria, card de evento, card de curso.

## 9. Checklist de lançamento

- [ ] Trocar todos os textos de exemplo e os [ANO] da linha do tempo pela história real aprovada.
- [ ] Decidir entre ilustrações e fotos reais autorizadas por capítulo; se usar fotos, instalar os arquivos e preencher alt descritivo antes de ativar data-story-photo.
- [ ] Nenhum marcador [ ] restante nas páginas.
- [ ] Logo redesenhado aprovado pelo Alisson ou substituído pelo arquivo original.
- [ ] Logo oficial e vermelho oficial aplicados.
- [ ] Quando o vermelho oficial chegar, gerar de novo os ícones de assets/icons/: eles têm o vermelho gravado no arquivo e não acompanham a troca do token CSS.
- [ ] Meta robots noindex removido.
- [ ] Links reais de WhatsApp, redes e mapa conferidos.
- [ ] Dobra "Para sua caminhada" só visível com pelo menos 3 posts e 3 materiais reais.
- [ ] Só ficam no menu as páginas com conteúdo real. Páginas ainda provisórias saem do menu no lançamento e voltam quando tiverem conteúdo.
- [ ] Aprovar ou substituir os 5 posts de exemplo e remover os avisos e os selos EXEMPLO.
- [ ] Teste completo em 1440 px e 390 px.

## 10. Como publicar um post novo

1. Primeira vez no computador: npm install --prefix scripts (instala mammoth, marked e sharp, só para desenvolvimento).
2. Copie o modelo-post.docx (ou um .md com as mesmas convenções) para textos-blog/, preencha e coloque as imagens na mesma pasta ou em textos-blog/imagens/. Confira a licença de cada imagem e registre em dados/creditos-imagens.json.
3. Converta: node scripts/converter-post.mjs textos-blog/arquivo.docx. Confira conteudo/blog/[slug].md e as imagens em assets/img/blog/[slug]/.
4. Monte: node scripts/montar-paginas.mjs (gera blog/[slug].html e dados/posts.json; rodar de novo não muda nada).
5. Abra o post por servidor local, em 1440 px e 390 px, e confira texto, capa, legenda e crédito.
6. Atualize o HANDOFF e faça commit e push dos arquivos do post (conteudo/, blog/, assets/img/blog/, dados/posts.json e dados/creditos-imagens.json), nunca de textos-blog/.
