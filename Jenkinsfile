pipeline {
    agent any

    environment {
        DOCKERHUB_NAMESPACE = 'catfish3122'
        IMAGE_NAME = "${DOCKERHUB_NAMESPACE}/eval-pipeline-frontend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Unit tests and coverage') {
            steps {
                bat 'npm run test:coverage'
            }
            post {
                always {
                    junit 'reports/junit.xml'
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Code quality (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Docker build') {
            steps {
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest ."
            }
        }

        stage('Security scan and SBOM (Trivy)') {
            steps {
                bat 'trivy image --exit-code 0 --severity HIGH,CRITICAL --format table %IMAGE_NAME%:%IMAGE_TAG%'
                bat 'trivy image --format spdx-json --output sbom-spdx.json %IMAGE_NAME%:%IMAGE_TAG%'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'sbom-spdx.json', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker_hub', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                    bat 'echo "%DOCKERHUB_PASS%" | docker login -u "%DOCKERHUB_USER%" --password-stdin'
                    bat 'docker push %IMAGE_NAME%:%IMAGE_TAG%'
                    bat 'docker push %IMAGE_NAME%:latest'
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout || true'
        }
        cleanup {
            cleanWs()
        }
    }
}
