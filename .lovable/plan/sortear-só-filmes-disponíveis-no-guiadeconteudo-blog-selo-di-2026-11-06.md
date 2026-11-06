# Sortear só filmes disponíveis no guiadeconteudo.blog + selo "Disponível no app"

## O que muda para o usuário
- Todo filme sorteado estará na grade do guiadeconteudo.blog.
- O resultado mostra o selo **"Disponível no app"**, com link para a página do filme no site.
- As regras atuais continuam: gêneros (todos primeiro, depois o mais próximo), duração, últimos 10 anos, sem repetir.

## Como funciona
1. **Catálogo guardado no banco**: uma lista dos filmes do site (título, ano, link e o código do filme no TMDB).
2. **Importador**: lê os mapas de páginas do site (~40 mil filmes), abre cada página para pegar título/ano e encontra o filme correspondente no TMDB. Roda em lotes pequenos para não sobrecarregar o site.
3. **Atualização automática diária**: só reprocessa páginas novas ou alteradas (o site informa a data de alteração).
4. **Sorteio**: continua buscando no TMDB com os filtros, mas só aceita filmes presentes no catálogo. Se a página sorteada não tiver nenhum, tenta outras páginas; se ainda assim não achar, mostra a mensagem atual de "nenhum filme encontrado".

## Pontos de atenção
- A primeira importação completa leva horas (feita em lotes ao longo do tempo); até lá o sorteio fica limitado ao que já foi importado.
- A correspondência título+ano com o TMDB pode errar em casos raros (títulos genéricos); esses ficam de fora em vez de arriscar um filme errado.
- Dependemos do site: se ele mudar o formato ou bloquear acessos, a atualização para e o catálogo existente continua valendo.

## Detalhes técnicos
- Tabela `site_catalog` (tmdb_id único, title, year, site_url, lastmod, matched_at); leitura pública (anon SELECT), escrita só pelo servidor.
- Rota `/api/public/jobs/sync-catalog` protegida pelo `authenticateCronRequest`, processa N URLs por chamada a partir de um cursor; agendada a cada poucos minutos até completar, depois diária.
- Parsing do HTML via fetch + regex nos campos `<title>`/`tmdb-meta`; match via TMDB `/search/movie` (query + year), aceitando só resultado com título normalizado igual.
- `discoverMovies` recebe a lista de ids disponíveis (ou o servidor faz o filtro consultando a tabela) e tenta até ~5 páginas aleatórias.
- `Result` ganha `siteUrl`; selo como `Badge` no hero, linkando para o site.
- Testes: filtro de disponibilidade e normalização de títulos.
