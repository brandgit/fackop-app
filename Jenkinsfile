pipeline {
    agent any
    environment {
        // Charger les variables d'environnement depuis le fichier .env
        ENV_FILE = '.env'
        sh '''
            echo "ERREUR: Fichier .env introuvable !"
        '''
    }
    stages {
        stage('Load Environment Variables') {
            steps {
                // Ajouter un debug pour imprimer le nom du fichier .env
                echo "DEBUG: Nom du fichier contenant les variables d'environnement: ${ENV_FILE}"
                // Afficher le contenu du fichier .env
                sh '''
                    echo "DEBUG: Contenu du fichier ${ENV_FILE}:"
                    cat ${ENV_FILE} || echo "ERREUR: Le fichier ${ENV_FILE} est introuvable ou vide."
                '''
                // Charger les variables depuis le fichier .env
                sh '''
                    if [ -f ${ENV_FILE} ]; then
                        echo "DEBUG: Chargement des variables depuis ${ENV_FILE}"
                        export $(cat ${ENV_FILE} | xargs)
                    else
                        echo "ERREUR: Fichier ${ENV_FILE} introuvable !"
                        exit 1
                    fi
                '''
            }
        }
        stage('Checkout Code') {
            steps {
                script {
                    echo 'DEBUG: Début de la vérification et du checkout du code'
                    if (fileExists('.git')) {
                        // Vérifiez la branche active
                        echo 'DEBUG: Répertoire .git trouvé, vérification de la branche active'
                        sh '''
                            git checkout master || git checkout main
                            echo "DEBUG: Branchement terminé"
                        '''

                        // Réinitialiser l'état du dépôt
                        echo 'DEBUG: Réinitialisation de l’état du dépôt'
                        sh '''
                            git reset --hard HEAD
                            git clean -fd
                            echo "DEBUG: Dépôt réinitialisé avec succès"
                        '''

                        // Mettre à jour le code
                        echo 'DEBUG: Mise à jour du dépôt via git pull'
                        sh '''
                            git pull origin $(git rev-parse --abbrev-ref HEAD)
                            echo "DEBUG: Code mis à jour"
                        '''
                    } else {
                        // Cloner le dépôt si .git n'existe pas
                        echo 'DEBUG: Répertoire .git introuvable, clonage du dépôt'
                        sh '''
                            git clone $GITHUB_REPO .
                            echo "DEBUG: Clonage du dépôt terminé"
                        '''
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                // Ajouter un message de debug avant la construction
                echo 'DEBUG: Début de la construction de l’image Docker'
                // Construire l'image Docker en utilisant les variables d'environnement
                sh '''
                    docker build -t $DOCKER_IMAGE_NAME --build-arg GITHUB_REPO=$GITHUB_REPO .
                    echo "DEBUG: Construction de l’image Docker terminée"
                '''
            }
        }
        stage('Run Tests') {
            steps {
                // Ajouter un message de debug avant l'exécution des tests
                echo 'DEBUG: Début de l’exécution des tests'
                // Exécuter les tests et générer la couverture
                sh '''
                    docker run --rm \
                    -e NODE_ENV=developpement \
                    ${DOCKER_IMAGE_NAME} npm run test
                    echo "DEBUG: Tests exécutés avec succès"
                '''
                // Copier les rapports de couverture
                echo 'DEBUG: Début de la copie des rapports de couverture'
                sh '''
                    docker cp $(docker create ${DOCKER_IMAGE_NAME}):/app/coverage ./coverage
                    echo "DEBUG: Rapports de couverture copiés"
                '''
            }
        }
        stage('Deploy Application') {
            steps {
                // Ajouter un message de debug avant le déploiement
                echo 'DEBUG: Début du déploiement de l’application'
                // Démarrer le conteneur avec les variables d'environnement
                sh '''
                    docker -H tcp://${DEPLOY_HOST}:2375 stop ${DOCKER_CONTAINER_NAME} || true
                    docker -H tcp://${DEPLOY_HOST}:2375 rm ${DOCKER_CONTAINER_NAME} || true
                    docker -H tcp://${DEPLOY_HOST}:2375 run -d --name ${DOCKER_CONTAINER_NAME} -p ${DEPLOY_PORT}:3000 -e NODE_ENV=${NODE_ENV} ${DOCKER_IMAGE_NAME}
                    echo "DEBUG: Déploiement terminé"
                '''
            }
        }
        stage('Verify Deployment') {
            steps {
                script {
                    echo "DEBUG: Vérification du déploiement à http://${DEPLOY_HOST}:${DEPLOY_PORT}"
                }
            }
        }
    }
    post {
        always {
            // Ajouter un message de debug pour le nettoyage
            echo 'DEBUG: Nettoyage des conteneurs et des images inutilisées'
            sh '''
                docker system prune -f || true
                echo "DEBUG: Nettoyage terminé"
            '''
        }
        success {
            echo "Pipeline exécuté avec succès pour le dépôt $GITHUB_REPO."
        }
        failure {
            echo "Échec du pipeline. Vérifiez les logs pour le dépôt $GITHUB_REPO."
        }
    }
}
