const $http = require('http-as-promised')
const fs = require('fs')

// const ZENHUB_OUTPUT_FILENAME = 'zenhub_pipelines.json'
// const GITHUB_OUTPUT_FILENAME = 'github_issues.json'

const GITHUB_TOKEN = process.argv[2] || console.error('You must pass a Github access token as the second argument!')
const ZENHUB_TOKEN = process.argv[3] || console.error('You must pass a Zenhub access token as the third argument!')

const LABEL_NAME = 'Squad: Records'
const PROJECT_NUMBER = 5
const USER_NAME = 'sahiltalwar88'

const githubAuthHeaders = {
  'Authorization': 'Basic ' + new Buffer(`${USER_NAME}:${GITHUB_TOKEN}`).toString('base64'),
  'User-Agent': 'zen-to-git'
}

const writeFile = (fileName, fileContents, successMessage) => {
  fs.writeFile(fileName, fileContents, (error) => {
    if (error) { console.error('Error: ', error) }
  })
  console.log(successMessage)
}

const getZenhubPipelines = () => {
  console.log('Requesting pipeline information from Zenhub...')

  return $http('https://api.zenhub.io/p1/repositories/15827400/board', {
    headers: { 'X-Authentication-Token': ZENHUB_TOKEN }
  }).spread((response, body) => {
    console.log('Response received, writing to file...')

    // writeFile(ZENHUB_OUTPUT_FILENAME, body, 'Zenhub output saved!')

    return JSON.parse(body).pipelines
  }).catch(error => {
    console.error('Error getting Zenhub pipelines: ', error)
  })
}

const getGithubIssues = () => {
  console.log('Requesting all issues in repo from Github...')

  return $http('https://api.github.com/repos/lanetix/issues/issues', { headers: githubAuthHeaders })
  .spread((response, body) => {
    console.log('Response received, writing to file...')

    // writeFile(GITHUB_OUTPUT_FILENAME, body, 'Issues saved!')

    const issues = JSON.parse(body)
    return issues.filter(issue => issue.labels.some(label => label.name === LABEL_NAME))
  }).catch(error => {
    console.error('Error getting Github issues: ', error)
  })
}

const getGithubProjectColumns = () => {
  console.log('Requesting Github Project columns...')

  const headers = { headers: Object.assign(githubAuthHeaders, { 'Accept': 'application/vnd.github.inertia-preview+json' }) }
  return $http(`https://api.github.com/repos/lanetix/issues/projects/${PROJECT_NUMBER}/columns`, headers)
    .tap(() => console.log('Project columns received!'))
    .catch(error => {
      console.error('Error getting Github Project columns: ', error)
    })
}

const createIssueCard = (column, issue) =>
  $http.post(`https://api.github.com/repos/lanetix/issues/projects/columns/${column.id}/cards`, {
    headers: githubAuthHeaders,
    body: {
      note: '',
      content_id: issue.issue_number,
      content_type: 'Issue'
    }
  })

module.exports = {
  getZenhubPipelines,
  getGithubIssues,
  getGithubProjectColumns,
  createIssueCard
}
