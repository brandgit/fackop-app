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
                        // Charger toutes les variables nécessaires depuis le fichier .env
                        env.DOCKER_IMAGE_NAME = sh(script: "grep ^DOCKER_IMAGE_NAME= ${env.ENV_FILE} | cut -d '=' -f2", returnStdout: true).trim()
                        env.GITHUB_REPO = sh(script: "grep ^GITHUB_REPO= ${env.ENV_FILE} | cut -d '=' -f2", returnStdout: true).trim()
                        env.DOCKER_CONTAINER_NAME = sh(script: "grep ^DOCKER_CONTAINER_NAME= ${env.ENV_FILE} | cut -d '=' -f2", returnStdout: true).trim()
                        env.DEPLOY_HOST = sh(script: "grep ^DEPLOY_HOST= ${env.ENV_FILE} | cut -d '=' -f2", returnStdout: true).trim()
                        env.DEPLOY_PORT = sh(script: "grep ^DEPLOY_PORT= ${env.ENV_FILE} | cut -d '=' -f2", returnStdout: true).trim()
                        env.NODE_ENV = sh(script: "grep ^NODE_ENV= ${env.ENV_FILE} | cut -d '=' -f2", returnStdout: true).trim()

                        echo "Variables chargées :"
                        echo "DOCKER_IMAGE_NAME = ${env.DOCKER_IMAGE_NAME}"
                        echo "GITHUB_REPO = ${env.GITHUB_REPO}"
                        echo "DOCKER_CONTAINER_NAME = ${env.DOCKER_CONTAINER_NAME}"
                        echo "DEPLOY_HOST = ${env.DEPLOY_HOST}"
                        echo "DEPLOY_PORT = ${env.DEPLOY_PORT}"
                        echo "NODE_ENV = ${env.NODE_ENV}"
                    } else {
                        error("Le fichier .env est introuvable à l'emplacement : ${env.ENV_FILE}")
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
                        sh "git clone ${env.GITHUB_REPO} ."
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${env.DOCKER_IMAGE_NAME} -f jenkins/Dockerfile --build-arg GITHUB_REPO=${env.GITHUB_REPO} ."
            }
        }
        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm \
                    -v $PWD:/app \
                    -w /app \
                    -e NODE_ENV=${NODE_ENV} \
                    node:18.20.5-alpine \
                    sh -c "npm install && npm run test"
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
                    echo "Application déployée sur http://${env.DEPLOY_HOST}:${env.DEPLOY_PORT}"
                }
            }
        }
    }
    post {
        always {
            sh 'docker system prune -f || true'
        }
        success {
            echo "Pipeline exécuté avec succès pour le dépôt ${env.GITHUB_REPO}."
        }
        failure {
            echo "Échec du pipeline. Vérifiez les logs pour le dépôt ${env.GITHUB_REPO}."
        }
    }
}
