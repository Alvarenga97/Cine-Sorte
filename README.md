# Flixy 🎬

> Aquela pergunta de sempre — "o que a gente vai assistir?" — resolvida em um clique.

O **Flixy** sorteia um filme sob medida para você. Você conta quais gêneros gosta e quanto tempo tem para assistir; o app busca no catálogo da TMDB e escolhe um título que combine com o seu gosto — sem repetir o que você já sorteou.

Interface em português (pt-BR), tema escuro de cinema, funciona no navegador, no celular e no computador.

---

## Como funciona

```text
1. Perfil        → você escolhe gêneros favoritos e a duração preferida
2. Sortear       → o app busca na TMDB e escolhe um filme para você
3. Resultado     → pôster, sinopse, nota, duração, gêneros e link do trailer
4. Histórico     → tudo que já foi sorteado fica guardado
```

Na primeira visita, o Flixy abre o **onboarding** para montar seu perfil. Depois disso, a página inicial mostra o botão **"Escolha um filme para mim"** e uma faixa com os últimos sorteados.

**Criar conta é opcional.** Sem conta, o perfil e o histórico ficam salvos no próprio navegador. Ao criar conta, tudo é enviado para o seu histórico na nuvem e continua disponível em qualquer aparelho.

---

## Como o filme é escolhido

A escolha é feita em etapas, da mais rígida para a mais flexível:

| Critério | Regra |
| --- | --- |
| **Gêneros** | Primeiro procura filmes que tenham **todos** os gêneros escolhidos. Se não achar, busca quem tenha **algum** deles e escolhe o que tem mais coincidências. |
| **Duração** | `Curto` até 89 min · `Médio` 90–120 min · `Longo` 121 min ou mais. |
| **Anos** | Somente lançamentos dos **últimos 10 anos** (em 2026, a partir de 2016). |
| **Qualidade** | Só filmes com pelo menos 200 votos, ordenados por popularidade. |
| **Sem repetir** | Filmes que já caíram no seu sorteio ficam de fora. |
| **Aleatoriedade** | Entre os melhores candidatos, o escolhido é sorteado — e a página de resultados também é sorteada, então o mesmo perfil nunca entrega sempre o mesmo filme. |

Quando não existe um título com todos os gêneros, o app avisa: *"Não achamos um filme com todos os gêneros; escolhemos o mais próximo."*

---

## Funcionalidades

- 🎲 **Sorteio de filmes** com um clique, com pôster, sinopse, nota, duração e trailer no YouTube
- 👤 **Perfil** com gêneros favoritos e duração preferida
- 🔁 **Sem repetição**: o histórico é usado para não sortear o mesmo filme duas vezes
- 🗂️ **Histórico** de todos os sorteios, com pôster, nota e data
- 🔐 **Conta opcional** com e-mail e senha ou Google
- ☁️ **Sincronização automática**: o histórico feito sem conta é transferido ao entrar
- 🎨 **Identidade visual própria**: logo, ícone e paleta coral/dourado sobre fundo escuro
- 📱 **Responsivo**, do celular ao desktop
- ⚠️ **Não trava sem internet do backend**: se o serviço nuvem estiver indisponível, o app continua funcionando em modo local

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | **TanStack Start** (React 19 + TanStack Router) |
| Build | **Vite** |
| Estilo | **Tailwind CSS v4** com tokens de tema em CSS |
| Dados no cliente | **TanStack Query** |
| Validação | **Zod** |
| Componentes | **shadcn/ui** sobre Radix UI |
| Notificações | **Sonner** |
| Ícones | **Lucide React** |
| Autenticação e banco | **Lovable Cloud** (auth + Postgres + Row Level Security) |
| Catálogo de filmes | **TMDB API**, acessada só pelo servidor |

---

## Estrutura do projeto

```text
src/
├── assets/               # logo e ícone do Flixy
├── components/
│   ├── PosterImg.tsx     # exibição de pôster com fallback
│   ├── ProfileForm.tsx   # formulário de perfil (gêneros + duração)
│   └── SiteHeader.tsx    # menu superior
├── hooks/
│   └── use-app.tsx       # usuário, perfil e histórico (contexto da aplicação)
├── lib/
│   ├── sorteio.ts        # regras de escolha, perfis e testes
│   ├── tmdb.functions.ts # acesso à TMDB (só no servidor)
│   └── storage.ts        # perfil e histórico no navegador
├── routes/
│   ├── index.tsx         # / — sortear
│   ├── onboarding.tsx    # /onboarding — primeiro perfil
│   ├── profile.tsx       # /profile — editar perfil
│   ├── auth.tsx          # /auth — entrar ou criar conta
│   └── _authenticated/
│       ├── route.tsx     # proteção das páginas privadas
│       └── history.tsx   # /history — filmes sorteados
└── styles.css            # paleta, fontes e tema escuro

drizzle/migrations/       # SQL do banco (tabelas e permissões)
```

---

## Como rodar localmente

### Pré-requisitos

- **Node.js** e **npm** instalados

### Instalação

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
npm install
```

### Variáveis de ambiente

O arquivo `.env` **não vai para o repositório** (está no `.gitignore`). Para configurar o ambiente local:

```bash
cp .env.example .env
```

| Variável | Para que serve |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | Endereço e chave pública do serviço de auth e banco |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` | As mesmas informações, para o código que roda no servidor |
| `TMDB_API_KEY` | Chave da TMDB. Fica **somente no servidor**, nunca chega ao navegador |

### Desenvolvimento

```bash
npm run dev
```

O Vite mostra no terminal o endereço local para abrir o app.

### Build de produção

```bash
npm run build
npm run preview
```

Há também `npm run build:dev`, que gera um build em modo de desenvolvimento.

### Testes e qualidade

```bash
npm test          # roda a suíte (vitest)
npm run test:watch
npm run lint
npm run format
```

A suíte tem **8 testes** em 2 arquivos: as regras de escolha de filme (`src/lib/sorteio.test.ts`) e o roteamento das páginas (`src/test/app-routing.test.tsx`).

---

## Banco de dados

Duas tabelas, cada uma visível **apenas para o dono dos dados** (Row Level Security):

**`profiles`** — o perfil de cada pessoa

| Coluna | Conteúdo |
| --- | --- |
| `id` | Identificador do usuário |
| `genres` | Gêneros favoritos (lista de IDs da TMDB) |
| `mood` | Campo de humor, mantido por compatibilidade; não influencia a escolha |
| `duration` | Duração preferida: `curto`, `medio` ou `longo` |
| `updated_at` | Última alteração |

**`draw_history`** — cada sorteio realizado

| Coluna | Conteúdo |
| --- | --- |
| `user_id` | Quem sorteou |
| `movie_id`, `title`, `poster_path`, `vote_average`, `genres` | Cópia do filme sorteado |
| `mood`, `duration` | Perfil usado naquele momento |
| `drawn_at` | Data e hora do sorteio |

Sem conta, o histórico fica no navegador (até 200 itens) e é enviado ao banco na hora de entrar.

---

## Observações

- Os dados de filmes vêm exclusivamente da **TMDB**; pôsteres e fotos de cena são servidos por `image.tmdb.org`.
- Alguns títulos ainda não têm sinopse em português — nesses casos aparece "Sinopse não disponível."
- Contas criadas por e-mail precisam confirmar o endereço antes de entrar.
- O trailer só aparece quando a TMDB tem um vídeo oficial do tipo trailer no YouTube.

---

*Feito para quem cansa de rolar o catálogo e não decide.* 🍿
