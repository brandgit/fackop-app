FROM jenkins/jenkins:lts

# Passer à root pour installer les outils nécessaires
USER root

# Installer Docker et ses dépendances
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - \
    && add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    && apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io

# Installer Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/2.5.1/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# Ajouter Jenkins au groupe Docker
RUN groupadd -f docker && usermod -aG docker jenkins

# Modifier les permissions pour le fichier Docker socket
RUN chmod 777 /var/run/docker.sock || true

# Installer sudo
RUN apt-get update && apt-get install -y sudo

# Donner à Jenkins l'accès sudo sans mot de passe
RUN echo "jenkins ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Installer Node.js v18.20.5
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Vérifier la version de Node.js et npm
RUN node -v && npm -v

# Revenir à l'utilisateur Jenkins
USER jenkins
