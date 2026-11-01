# Sorteador de Filmes com Perfil

Implementação do plano enviado, com o visual escuro e cinematográfico da imagem de referência (estilo streaming: hero grande com backdrop, fileiras de pôsteres, acento dourado #d4af37 + vermelho cinema #b91c1c sobre #0f0f0f).

## Telas
- **/onboarding** — questionário: gêneros (chips), humor (animado / melancólico / reflexivo), duração (curto / médio / longo).
- **/** — hero com o filme sorteado (backdrop, título grande, gêneros, nota, sinopse, botões "Ver trailer" e "Sortear outro"), resumo do perfil e fileira "Sorteados recentemente". Sem perfil → vai para /onboarding.
- **/profile** — editar perfil (mesmo formulário, pré-preenchido).
- **/history** — histórico em grade de pôsteres (requer login).
- **/auth** — login / cadastro.

## Lógica do sorteio (como no plano)
- Filtros na TMDB: gêneros favoritos + gêneros do humor, faixa de duração, mínimo 200 votos, sem adulto, pt-BR / BR.
- Página aleatória (até 500), pontuação por humor, sorteio com gerador injetável, exclui último filme e histórico.
- Sem resultados → remove um gênero e avisa; continua vazio → alerta com "Editar perfil".
- Trailer oficial do YouTube; sem trailer → botão oculto com dica.

## Ajustes em relação ao documento
- **Chave da TMDB protegida no servidor** (em vez de exposta no navegador) — vou pedir sua chave num formulário seguro.
- **Login real com Lovable Cloud** (em vez de login simulado); histórico salvo por usuário no banco. Sorteios feitos sem login ficam no aparelho e são mesclados ao entrar.
- Perfil salvo no aparelho e sincronizado com a conta quando logado.

## Detalhes técnicos
- TanStack Start (rotas em `src/routes`, não React Router); `/history` sob `_authenticated`.
- Server functions `tmdb.functions.ts` (discover, genres, details+videos) lendo `TMDB_API_KEY`.
- Tabelas: `profiles` (preferências + updated_at), `draw_history` (snapshot: movie_id, title, poster_path, vote_average, genres, mood, duration, drawn_at) com RLS por usuário.
- TanStack Query com staleTimes do plano; RHF + Zod; shadcn; fontes Bebas Neue + DM Sans.
- Testes Vitest: faixas de duração, mapa humor→gêneros, pontuação, sorteio determinístico, schema Zod. E2E com MSW fica fora deste primeiro passo.
