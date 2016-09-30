#!/usr/bin/env node

const api = require('./api')

const addIssuesToProject = (column, issues) => {
  console.log(`Adding issues in the ${column.name} pipeline to your Github project...`)
  api.createIssueCard(column, issues[0])
  // issues.forEach(issue => {
  //   api.createCard(column, issue)
  // })
}

Promise.all([ api.getZenhubPipelines(), api.getGithubIssues(), api.getGithubProjectColumns() ])
  .then(responses => {
    const pipelines = responses[0]
    const issues = responses[1]
    const columns = responses[2]

    console.log('asdf')
    pipelines.forEach(pipeline => {
      const pipelineIssues = pipeline.issues.filter(({ issue_number }) => issues.some(issue => issue.number === issue_number))
      pipelineIssues.sort((a, b) => a.position - b.position)

      const column = columns.filter(column => column.name === pipeline.name)
      addIssuesToProject(column, pipelineIssues)
      console.log('Done!')
    })
  })
