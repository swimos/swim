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
                        echo "Using BRANCH($env.BRANCH)"
                        fromCommitType = 'REF'
                        fromCommit = "refs/heads/${env.BRANCH}"
                    } else if (null != env.GIT_BRANCH && null != env.CHANGE_TARGET && env.GIT_BRANCH.startsWith("PR-")) {
                        echo "Using CHANGE_TARGET($env.CHANGE_TARGET)"
                        lastCommitType = 'REF'
                        fromCommit = "refs/heads/${env.CHANGE_TARGET}"
                    } else if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                        echo "Using GIT_PREVIOUS_SUCCESSFUL_COMMIT($env.GIT_PREVIOUS_SUCCESSFUL_COMMIT)"
                        fromCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                        lastCommitType = 'COMMIT'
                    } else {
                        fromCommit = "0000000000000000000000000000000000000000"
                        echo "Using Fallback(${fromCommit})"
                        lastCommitType = 'COMMIT'
                    }

                    def template =
                            """
# Release Notes

{{#ifContainsIssueLabel issues label='C-enhancement'}}
## Enhancements

{{#issues}}
{{#ifIssueLabel . label='C-enhancement'}}
* [{{ issue }} - {{ title}}]({{ link }})
{{/ifIssueLabel}}
{{/issues}}
{{/ifContainsIssueLabel}}

{{#ifContainsIssueLabel issues label='C-bug'}}
## Bugs

{{#issues}}
{{#ifIssueLabel . label='C-bug'}}
* [{{ issue }} - {{ title}}]({{ link }})
{{/ifIssueLabel}}
{{/issues}}
{{/ifContainsIssueLabel}}
"""

                    def args = [
                        template: template,
                        gitHub: [api: 'https://api.github.com/repos/swimos/swim', issuePattern: '#([0-9]+)'],
                        from: [type: lastCommitType, value: fromCommit],
                        to: [type: 'COMMIT', value: env.GIT_COMMIT],
                        ignoreCommitsWithoutIssue: true
                    ]

                    echo(
                            writeYaml(returnText: true, data: args)
                    )

                    def changelog = gitChangelog(
                            template: template,
                            gitHub: [api: 'https://api.github.com/repos/swimos/swim', issuePattern: '#([0-9]+)'],
                            from: [type: lastCommitType, value: fromCommit],
                            to: [type: 'COMMIT', value: env.GIT_COMMIT],
                            ignoreCommitsWithoutIssue: true
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