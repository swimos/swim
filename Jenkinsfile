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
                    def fromCommit = "0000000000000000000000000000000000000000"
                    def fromCommitType = null
                    if (env.BRANCH == 'main' || env.BRANCH == 'master') {
                        fromCommitType = 'REF'
                        fromCommit = "refs/heads/${env.BRANCH}"
                    } else if (env.BRANCH && env.CHANGE_TARGET && env.BRANCH.startsWith("PR-")) {
                        lastCommitType = 'REF'
                        fromCommit = "refs/heads/${env.CHANGE_TARGET}"
                    } else if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                        fromCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                        lastCommitType = 'COMMIT'
                    } else {
                        fromCommit = "0000000000000000000000000000000000000000"
                        lastCommitType = 'COMMIT'
                    }

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
                            gitHub: [api:'https://api.github.com/repos/swimos/swim'],
                            from: [type: lastCommitType, value: fromCommit],
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