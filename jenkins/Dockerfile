# Utiliser l'image officielle Jenkins LTS
FROM jenkins/jenkins:lts

# Passer en mode root pour installer des outils
USER root

# Installer Docker
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - \
    && add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    && apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io

# Ajouter Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/2.5.1/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

    # Copier le fichier .env dans le conteneur
COPY ./app/.env /var/jenkins_home/.env
COPY ./app/.env /var/jenkins_home/workspace/.env

# Ajouter l'utilisateur Jenkins au groupe Docker
RUN usermod -aG docker jenkins

# Revenir à l'utilisateur Jenkins
USER jenkins
