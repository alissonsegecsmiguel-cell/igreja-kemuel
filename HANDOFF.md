# HANDOFF

## 1. Última sessão

- 05/11/2026: página "Em breve" criada e regras ajustadas para a conexão com a Vercel. Design system excluído do deploy; página provisória preservada até a aprovação da Fase 1. Teste leve em 1440 px e 390 px, sem rolagem, erros no console ou chamadas externas.

## 2. Estado atual

- Repositório conectado ao GitHub, só branch main.
- Vercel sendo conectada; no ar, somente a página "Em breve" após a conexão.

## 3. Em andamento

- Nada.

## 4. Próximas tarefas

1. Extrações locais concluídas: nenhuma pasta de referencias/ sem design-system.html (0 pendentes).
2. Prioridade após as extrações: criar o design system da Kemuel em assets/design_system.html, antes das páginas da Fase 1. A página provisória "Em breve" é a única exceção. Usar apenas inspiração conceitual, sem copiar arquivos de terceiros; tokens e estilos compartilhados em arquivos próprios.
3. Antes de começar as páginas da Fase 1, revisar se o projeto volta a usar uma branch dev.

## 5. Backlog

- Vazio.

## 6. Pendências que dependem de pessoas

- Arquivos do logo em SVG ou PNG transparente, com versão para fundo claro.
- Confirmar o registro do domínio igrejakemuel.com.br e em nome de quem está.
- Conteúdo institucional: endereço, horários dos cultos, quem somos, contatos.
- Fotos da igreja.
- Definir quem escreve o blog e a frequência.
- Definir a plataforma dos cursos e se serão gratuitos ou pagos.
- Perfil da Empresa no Google da igreja.

## 7. Concluído

- Base do projeto.
- Página provisória "Em breve" e regras para a conexão com a Vercel.
- Extração local da referência do blog: design-system.html, notas e evidências de teste, todos em referencias/ e fora do Git/deploy.
- Extração local de Clube de Literatura Clássica_files: design-system.html, notas, recursos e evidências de teste, todos em referencias/ e fora do Git/deploy.
- Extração local da referência de cursos: design-system.html, notas, recursos e evidências de teste, todos em referencias/ e fora do Git/deploy.

## 8. Decisões registradas

- Repositório público.
- Projeto fora do OneDrive.
- Só branch main por enquanto. Antes de começar as páginas da Fase 1, revisar se o projeto volta a usar dev.
- Referências de outros sites ficam fora do Git e do deploy, só para estudo.
- Design system antes das páginas da Fase 1; a página provisória "Em breve" é a única exceção.
- Vercel conectada antes do site pronto, com página "Em breve". Todo push na main vai para o ar.
- Até a aprovação da Fase 1, preservar o index.html provisório e não incluir links para páginas novas nele.
- assets/design_system.html fora do deploy; tokens e estilos compartilhados em arquivos próprios, por exemplo assets/css/.
- Domínio: igrejakemuel.com.br.
- Site contemporâneo, com objetivo de informar membros e atrair visitantes.
- Site em 3 fases.
- Fase 1 (lançamento): Início, Quem somos, Contribua (PIX institucional com botão copiar e QR Code).
- Fase 2 (conteúdo): Materiais (PDFs públicos por categoria), Blog, Agenda opcional.
- Fase 3 (cursos): cursos em plataforma externa; o site só mostra cards com links.
- O design system nasce com os componentes das 3 fases: hero, menu mobile, bloco de horários, bloco de endereço com mapa, bloco de PIX, botão flutuante de WhatsApp, rodapé, card de post, página de texto longo, card de material, filtro por categoria, card de evento, card de curso.
