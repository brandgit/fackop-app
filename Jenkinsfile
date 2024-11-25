pipeline {
    agent any
    environment {
        ENV_FILE = '.env'
    }
    stages {
        stage('Load Environment Variables') {
            steps {
                script {
                    def envVars = readFile("${ENV_FILE}").split('\n').findAll { it.trim() && !it.startsWith('#') }
                    envVars.each { envVar ->
                        def (key, value) = envVar.split('=').collect { it.trim() }
                        env[key] = value
                    }
                }
            }
        }
        stage('Debug Variables') {
            steps {
                sh '''
                    echo "DOCKER_IMAGE_NAME: $DOCKER_IMAGE_NAME"
                    echo "GITHUB_REPO: $GITHUB_REPO"
                '''
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
                        sh 'git clone $env.GITHUB_REPO .'
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t $DOCKER_IMAGE_NAME --build-arg GITHUB_REPO=$GITHUB_REPO .
                '''
            }
        }
        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm \
                    -e NODE_ENV=developpement \
                    $DOCKER_IMAGE_NAME npm run test
                '''
            }
        }
        stage('Deploy Application') {
            steps {
                sh '''
                    docker -H tcp://$DEPLOY_HOST:2375 stop $DOCKER_CONTAINER_NAME || true
                    docker -H tcp://$DEPLOY_HOST:2375 rm $DOCKER_CONTAINER_NAME || true
                    docker -H tcp://$DEPLOY_HOST:2375 run -d --name $DOCKER_CONTAINER_NAME -p $DEPLOY_PORT:3000 -e NODE_ENV=$NODE_ENV $DOCKER_IMAGE_NAME
                '''
            }
        }
        stage('Verify Deployment') {
            steps {
                echo "Application déployée sur http://$DEPLOY_HOST:$DEPLOY_PORT"
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
