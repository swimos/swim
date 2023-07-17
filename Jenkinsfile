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
                script {
                    def lastCommit = "0000000000000000000000000000000000000000"
                    if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                        lastCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                    }
                    def template =
                            """
# Changelog

{{#tags}}
## {{name}}
 {{#issues}}
  {{#hasIssue}}
   {{#hasLink}}
### {{name}} [{{issue}}]({{link}}) {{title}} {{#hasIssueType}} *{{issueType}}* {{/hasIssueType}} {{#hasLabels}} {{#labels}} *{{.}}* {{/labels}} {{/hasLabels}}
   {{/hasLink}}
   {{^hasLink}}
### {{name}} {{issue}} {{title}} {{#hasIssueType}} *{{issueType}}* {{/hasIssueType}} {{#hasLabels}} {{#labels}} *{{.}}* {{/labels}} {{/hasLabels}}
   {{/hasLink}}
  {{/hasIssue}}
  {{^hasIssue}}
### {{name}}
  {{/hasIssue}}

  {{#commits}}
**{{{messageTitle}}}**

{{#messageBodyItems}}
 * {{.}} 
{{/messageBodyItems}}

[{{hash}}](https://github.com/{{ownerName}}/{{repoName}}/commit/{{hash}}) {{authorName}} *{{commitTime}}*

  {{/commits}}

 {{/issues}}
{{/tags}}
"""
                    def changelog = gitChangelog(
                            template: template,
                            github: [api:'https://api.github.com/repos/swimos/swim']
                            from: [type: 'COMMIT', value: lastCommit],
                            to: [type: 'COMMIT', value: env.GIT_COMMIT]
                    )

                    echo changelog
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