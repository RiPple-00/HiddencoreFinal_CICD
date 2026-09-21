pipeline {
    agent any

    tools {
        jdk 'JDK17'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh './gradlew clean build -x test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t hiddencore-backend:ci -f backend/Dockerfile .'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        docker tag hiddencore-backend:ci naavvv/hiddencore-backend:latest
                        echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
                        docker push naavvv/hiddencore-backend:latest
                        docker logout
                    '''
                }
            }
        }

    }
}
