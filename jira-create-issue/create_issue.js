const core = require('@actions/core');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

try {
  const baseUrl = core.getInput('base_url', {required: true});
  const userEmail = core.getInput('user_email', {required: true});
  const apiToken = core.getInput('api_token', {required: true});
  const description = core.getInput('description', {required: true});
  const issueType = core.getInput('issue_type', {required: true});
  const priority = core.getInput('priority', {required: true});
  const project = core.getInput('project', {required: true});
  const reporter = core.getInput('reporter', {required: true});
  const summary = core.getInput('summary', {required: true});
  const labels = core.getMultilineInput('labels', {required: false});
  const timeout = core.getInput('timeout', {required: false});

  const bodyData = {
    fields: {
        description: description,
        issuetype: { id: issueType },
        priority: { id: priority },
        project: { id: project },
        reporter: { id: reporter },
        summary: summary,
        labels: labels
    }
  };

  fetch(`${baseUrl}/rest/api/2/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${userEmail}:${apiToken}`).toString('base64')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(Number(timeout)),
    body: JSON.stringify(bodyData)
  })
  .then(response => {
    console.log(
        `Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));
} catch (error) {
  core.setFailed(error.message);
}
