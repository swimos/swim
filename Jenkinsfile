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
        stage('release-notes') {
            steps {
                sh "echo GIT_COMMIT '${GIT_COMMIT}'"
                sh "echo GIT_PREVIOUS_SUCCESSFUL_COMMIT '${GIT_PREVIOUS_SUCCESSFUL_COMMIT}'"

                script {
                    def template =
                            """

"""
//                def changelog = gitChangelog(
//                        template: template
//                        from: [type: 'COMMIT', value:  ]
//                        to: []
//                )
                }

            }
        }

        stage('build-java') {
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
        stage('js') {
            steps {
                container('node') {
                    dir('swim-js') {
                        sh 'npm config set color false'
                        sh 'npm install'
                        sh 'npm run bootstrap'
                        sh 'npx swim-build'
                    }
                }
            }
        }

    }
}