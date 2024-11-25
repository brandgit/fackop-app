FROM jenkins/jenkins:lts

USER root

# Installer sudo
RUN apt-get update && apt-get install -y sudo

# Donner à l'utilisateur Jenkins les droits sudo
RUN echo "jenkins ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER jenkins
