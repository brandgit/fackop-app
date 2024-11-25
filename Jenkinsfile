pipeline {
    agent any
    environment {
        // Charger les variables d'environnement depuis le fichier .env
        ENV_FILE = '.env'
    }
    stages {
        stage('Load Environment Variables') {
            steps {
                // Charger les variables depuis le fichier .env
                sh 'export $(cat ${ENV_FILE} | xargs)'
            }
        }
        stage('Checkout Code') {
            steps {
                script {
                    if (fileExists('.git')) {
                        // Vérifiez la branche active
                        sh 'git checkout master || git checkout main'

                        // Réinitialiser l'état du dépôt
                        sh 'git reset --hard HEAD'
                        sh 'git clean -fd'

                        // Mettre à jour le code
                        sh 'git pull origin $(git rev-parse --abbrev-ref HEAD)'
                    } else {
                        // Cloner le dépôt si .git n'existe pas
                        sh 'git clone $GITHUB_REPO .'
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                // Construire l'image Docker en utilisant les variables d'environnement
                // sh 'docker build -t $DOCKER_IMAGE_NAME --build-arg GITHUB_REPO=$GITHUB_REPO .'
                sh 'docker build -t $DOCKER_IMAGE_NAME --build-arg GITHUB_REPO=$GITHUB_REPO .'
            }
        }
        stage('Run Tests') {
            steps {
                // Exécuter les tests et générer la couverture
                sh '''
                    docker run --rm \
                    -e NODE_ENV=developpement \
                    ${DOCKER_IMAGE_NAME} npm run test
                '''
                // Copier les rapports de couverture
                sh '''
                    docker cp $(docker create ${DOCKER_IMAGE_NAME}):/app/coverage ./coverage
                '''
            }
        }
        stage('Deploy Application') {
            steps {
                // Démarrer le conteneur avec les variables d'environnement
                 // Déployer sur l'hôte spécifié
                sh '''
                    docker -H tcp://${DEPLOY_HOST}:2375 stop ${DOCKER_CONTAINER_NAME} || true
                    docker -H tcp://${DEPLOY_HOST}:2375 rm ${DOCKER_CONTAINER_NAME} || true
                    docker -H tcp://${DEPLOY_HOST}:2375 run -d --name ${DOCKER_CONTAINER_NAME} -p ${DEPLOY_PORT}:3000 -e NODE_ENV=${NODE_ENV} ${DOCKER_IMAGE_NAME}
                '''
            }
        }
        stage('Verify Deployment') {
            steps {
                script {
                    echo "Application déployée sur http://${DEPLOY_HOST}:${DEPLOY_PORT}"
                }
            }
        }

    }
    post {
        always {
            // Nettoyer les conteneurs arrêtés et les images inutilisées
            sh '''
                docker system prune -f || true
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
