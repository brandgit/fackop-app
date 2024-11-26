pipeline {
    agent any
    environment {
        ENV_FILE = '/var/jenkins_home/workspace/.env' // Emplacement du .env dans Jenkins
    }

    stages {
        stage('Debug Variables') {
            steps {
                sh '''
                    echo "Liste des fichiers dans le workspace :"
                    ls -la /var/jenkins_home/workspace/
                    echo "Contenu du fichier .env :"
                    cat /var/jenkins_home/workspace/.env || echo "Fichier introuvable"
                '''
            }
        }
        stage('Load Environment Variables') {
            steps {
                script {
                    // Vérifier si le fichier .env existe
                    if (fileExists(env.ENV_FILE)) {
                        sh '''
                            echo "Fichier .env trouvé. Chargement des variables..."
        
                            export $(cat ${ENV_FILE} | xargs)
                            export $(cat ${ENV_FILE.DOCKER_IMAGE_NAME} | xargs)
                            export $(cat ${ENV_FILE.DEPLOY_HOST} | xargs)
                        '''
                    } else {
                        error("Le fichier .env est introuvable à l'emplacement : ${ENV_FILE}")
                    }
                }
            }
        }
        stage('Checkout Code') {
            steps {
                script {
                    if (fileExists('.git')) {
                        sh 'git checkout master || git checkout main'
                        sh 'git reset --hard HEAD'
                        sh 'git clean -fd'
                        sh 'git pull origin $(git rev-parse --abbrev-ref HEAD)'
                    } else {
                        sh 'git clone $GITHUB_REPO .'
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE_NAME --build-arg GITHUB_REPO=$GITHUB_REPO .'
            }
        }
        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm \
                    -e NODE_ENV=developpement \
                    ${DOCKER_IMAGE_NAME} npm run test
                '''
                sh '''
                    docker cp $(docker create ${DOCKER_IMAGE_NAME}):/app/coverage ./coverage
                '''
            }
        }
        stage('Deploy Application') {
            steps {
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
            sh 'docker system prune -f || true'
        }
        success {
            echo "Pipeline exécuté avec succès pour le dépôt $GITHUB_REPO."
        }
        failure {
            echo "Échec du pipeline. Vérifiez les logs pour le dépôt $GITHUB_REPO."
        }
    }
}
