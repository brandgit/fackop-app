# Étape 1 : Construire l'application
FROM node:18 AS builder
WORKDIR /app

# Installer Git pour cloner le dépôt
RUN apt-get update && apt-get install -y git

# Cloner directement le code source depuis GitHub
ARG GITHUB_REPO
RUN git clone $GITHUB_REPO .

# Installer les dépendances
RUN npm install

# Construire l'application pour la production
RUN npm run build

# Nettoyer pour réduire la taille de l'image
RUN npm cache clean --force && rm -rf /var/lib/apt/lists/*

# Étape 2 : Préparer l'image pour la production
FROM node:18-alpine
WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Ajouter un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser


# Exposer le port pour l'application
EXPOSE 3000

# Commande de démarrage
CMD ["node", "./.output/server/index.mjs"]
