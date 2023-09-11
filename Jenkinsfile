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
                sh "export"
                script {
                    def lastCommit = "0000000000000000000000000000000000000000"
                    if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                        lastCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                    }
                    lastCommit = 'main'
                    def template =
                            """
# Release Notes

{{#ifContainsIssueLabel issues label='enhancement'}}
## Enhancements

{{#issues}}
{{#ifIssueLabel . label='enhancement'}}
* [{{ issue }} - {{ title}}]({{ link }})
{{/ifIssueLabel}}
{{/issues}}
{{/ifContainsIssueLabel}}

{{#ifContainsIssueLabel issues label='bug'}}
## Bugs

{{#issues}}
{{#ifIssueLabel . label='bug'}}
* [{{ issue }} - {{ title}}]({{ link }})
{{/ifIssueLabel}}
{{/issues}}
{{/ifContainsIssueLabel}}
"""

                    def changelog = gitChangelog(
                            template: template,
                            github: [api:'https://api.github.com/repos/swimos/swim'],
                            from: [type: 'COMMIT', value: lastCommit],
                            to: [type: 'COMMIT', value: env.GIT_COMMIT]
                    )

                    echo changelog
                }


            }
        }

//        stage('build-java') {
//            steps {
//                container('java') {
//                    dir('swim-java') {
//                        sh "./gradlew build"
//                    }
//                }
//            }
//            post {
//                always {
//                    testNG()
//                }
//            }
//        }
//        stage('js') {
//            steps {
//                container('node') {
//                    dir('swim-js') {
//                        sh 'npm config set color false'
//                        sh 'npm install'
//                        sh 'npm run bootstrap'
//                        sh 'npx swim-build'
//                    }
//                }
//            }
//        }

    }
}