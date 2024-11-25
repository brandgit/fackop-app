# Étape 1 : Construire l'application
FROM node:18 AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y git

# Cloner directement le code source depuis GitHub
ARG GITHUB_REPO
RUN git clone $GITHUB_REPO .

# Installer les dépendances
RUN npm install

# Construire l'application pour la production
RUN npm run build

# Étape 2 : Image pour la production
FROM node:18-alpine
WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev

# Exposer le port pour l'application
EXPOSE 3000

# Démarrer l'application
CMD ["node", "./.output/server/index.mjs"]
