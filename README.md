# Cine-Sorte

Aplicação web para ajudar a escolher um filme para assistir. O Cine-Sorte combina um sorteio de filmes com preferências de perfil, como humor e duração, para tornar a escolha mais simples.

> **Status:** README elaborado a partir da estrutura e dos arquivos públicos do repositório. Alguns detalhes do catálogo e da origem dos dados não estão documentados no código/README consultado; por isso, não são apresentados como fatos.

## Funcionalidades identificadas

- **Sorteio de filmes** para ajudar a decidir o que assistir.
- **Preferências de perfil** organizadas por duração (`curto`, `médio` e `longo`).
- **Perfil e histórico** mantidos no armazenamento local do navegador.
- **Exibição de pôsteres**, com componente próprio para apresentar a imagem do filme.
- **Interface interativa**, com notificações para feedback ao usuário.

> Os valores de humor e duração acima correspondem às opções definidas no código. O README original do projeto era o texto padrão de um template Lovable, sem documentação funcional detalhada.

## Stack

- **React** — interface baseada em componentes.
- **TypeScript** — tipagem estática.
- **TanStack Start / TanStack Router** — estrutura da aplicação e roteamento baseado em arquivos.
- **Vite** — servidor de desenvolvimento e build.
- **Tailwind CSS** — estilização.
- **TanStack Query** — gerenciamento de dados/cache no cliente.
- **Zod** — validação e modelagem de dados.
- **Sonner** — notificações (toasts).
- **Lucide React** — ícones.
- **Local Storage** — persistência local de perfil e histórico.

## Como executar localmente

### Pré-requisitos

- Node.js e npm instalados.

### Instalação

```bash
git clone https://github.com/Alvarenga97/Cine-Sorte.git
cd Cine-Sorte
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir a aplicação.

### Build de produção

```bash
npm run build
npm run preview
```

O projeto também declara o comando `npm run build:dev` para gerar um build no modo de desenvolvimento.

## Estrutura observada

```text
src/
├── components/       # Componentes reutilizáveis, incluindo exibição de pôster
├── lib/              # Modelos/validação e armazenamento local
└── routes/           # Rotas da aplicação (TanStack Router)
```
