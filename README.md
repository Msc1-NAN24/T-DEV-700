# Cash Manager

## Setup

```sh
corepack enable
corepack prepare pnpm@7.16.0 --activate
pnpm install
docker-compose up -d
pnpm --filter api db:setup
```