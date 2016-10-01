#!/usr/bin/env node

const api = require('./api')

const addIssuesToProject = (column, issues) => {
  console.log(`Adding issues in the ${column.name} pipeline to your Github project...`)
  api.createIssueCard(column, issues[0])
  // issues.forEach(issue => {
  //   api.createCard(column, issue)
  // })
}

const fs = require('fs')
const writeFile = (fileName, fileContents, successMessage) => {
  fs.writeFile(fileName, fileContents, (error) => {
    if (error) { console.error('Error: ', error) }
  })
  console.log(successMessage)
}

Promise.all([ api.getZenhubPipelines(), api.getGithubIssues(), api.getGithubProjectColumns() ])
  .then(responses => {
    const pipelines = responses[0]
    const githubIssues = responses[1]
    const columns = responses[2]

    pipelines.forEach(pipeline => {
      // const issues = []
      // pipeline.issues.forEach(pipelineIssue => {
      //   const matchingGithubIssue = githubIssues.find(issue => issue.number === pipelineIssue.issue_number)
      //   if (matchingGithubIssue) {
      //     pipelineIssue.id = matchingGithubIssue.id
      //     issues.push(pipelineIssue)
      //   }
      // })
      const pipelineIssues = pipeline.issues.filter(({ issue_number }) => githubIssues.some(issue => issue.number === issue_number))
      // const pipelineIssues = issues.filter(issue => pipeline.issues.some(({ issue_number }) => issue_number === issue.number))
      pipelineIssues.sort((a, b) => a.position - b.position)
      writeFile(`${pipeline.name}.txt`, JSON.stringify(pipelineIssues, null, 2), `${pipeline.name} output saved!`)

      const column = columns.find(column => column.name === pipeline.name)
      addIssuesToProject(column, issues)
    })

    console.log('Done!')
  })
