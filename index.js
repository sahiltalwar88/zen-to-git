#!/usr/bin/env node

const api = require('./api')

const addIssuesToProject = (column, issues) => {
  console.log(`Adding issues in the ${column.name} pipeline to your Github project...`)
  issues.forEach(issue => api.createIssueCard(column, issue))
}

Promise.all([ api.getZenhubPipelines(), api.getGithubIssues(), api.getGithubProjectColumns() ])
  .then(responses => {
    const pipelines = responses[0]
    const githubIssues = responses[1]
    const columns = responses[2]

    pipelines.forEach(pipeline => {
      const issues = []
      pipeline.issues.forEach(pipelineIssue => {
        const matchingGithubIssue = githubIssues.find(issue => issue.number === pipelineIssue.issue_number)
        if (matchingGithubIssue) {
          pipelineIssue.id = matchingGithubIssue.id
          issues.push(pipelineIssue)
        }
      })

      issues.sort((a, b) => a.position - b.position)

      const column = columns.find(column => column.name === pipeline.name)
      addIssuesToProject(column, issues)
    })

    console.log('Done!')
  })
