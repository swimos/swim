pipeline {
    agent {
        kubernetes {
            cloud 'kubernetes'
            inheritFrom 'default'
            yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: java
            image: eclipse-temurin:17
            command:
            - cat
            tty: true   
          - name: node
            image: node:20
            command:
            - cat
            tty: true     
        '''
        }
    }

    environment {
        NO_COLOR = "false"
    }

    stages {
        stage('build') {
            parallel {
                stage('java') {
                    steps {
                        container('java') {
                            dir('swim-java') {
                                sh "./gradlew build"
                            }
                        }
                    }
                    post {
                        always {
                            testNG()
                        }
                    }
                }
//                stage('js') {
//                    steps {
//                        container('node') {
//                            dir('swim-js') {
//                                sh 'npm config set color false'
//                                sh 'npm install'
//                                sh 'npm run bootstrap'
//                                sh 'npx swim-build'
//                            }
//                        }
//                    }
//                }
            }
        }
    }
}