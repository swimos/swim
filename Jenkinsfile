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
        stage('release-notes') {
            steps {
                sh "export"

                script {
                    def fromCommit = "0000000000000000000000000000000000000000"
                    def fromCommitType = null
                    def toCommit = env.GIT_COMMIT
                    def toCommitType = "COMMIT"

                    if (env.BRANCH == 'main' || env.BRANCH == 'master') {
                        echo "Using BRANCH($env.BRANCH)"

                        fromCommitType = 'COMMIT'
                        if(null!=env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                            fromCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                        } else {
                            fromCommit = "0000000000000000000000000000000000000000"
                        }
                    } else if (null != env.GIT_BRANCH && null != env.CHANGE_TARGET && env.GIT_BRANCH.startsWith("PR-")) {
                        echo "Using CHANGE_TARGET($env.CHANGE_TARGET)"
                        fromCommitType = 'REF'
                        fromCommit = "refs/heads/${env.CHANGE_TARGET}"
                        toCommit = "refs/heads/${env.GIT_BRANCH}"
                        toCommitType = 'REF'
                    } else if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                        echo "Using GIT_PREVIOUS_SUCCESSFUL_COMMIT($env.GIT_PREVIOUS_SUCCESSFUL_COMMIT)"
                        fromCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                        fromCommitType = 'COMMIT'
                    } else {
                        fromCommit = "0000000000000000000000000000000000000000"
                        echo "Using Fallback(${fromCommit})"
                        fromCommitType = 'COMMIT'
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
                            from: [type: fromCommitType, value: fromCommit],
                            to: [type: toCommitType, value: toCommit],
                            ignoreCommitsWithoutIssue: true
                    ]

                    echo(
                            writeYaml(returnText: true, data: args)
                    )

                    def changelog = gitChangelog(
                            template: template,
                            gitHub: [api: 'https://api.github.com/repos/swimos/swim', issuePattern: '#([0-9]+)'],
                            from: [type: fromCommitType, value: fromCommit],
                            to: [type: toCommitType, value: toCommit],
                            ignoreCommitsWithoutIssue: true
                    )



                    echo changelog
                }


            }
        }
    }
}