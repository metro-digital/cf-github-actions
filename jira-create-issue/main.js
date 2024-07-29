// Copyright 2024 METRO Digital GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const core = require('@actions/core');

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
    signal: AbortSignal.timeout(timeout),
    body: JSON.stringify(bodyData)
  }).then(response => {
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
