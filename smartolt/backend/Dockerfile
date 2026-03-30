FROM node:20-alpine AS build
WORKDIR /app
# Copia manifestos; se houver lock, usamos npm ci; senão, npm install
COPY package*.json ./
# Instala dependências (inclui dev deps para build TypeScript)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node","dist/index.js"]
