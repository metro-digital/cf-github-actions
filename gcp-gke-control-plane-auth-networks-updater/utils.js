// Copyright 2022 METRO Digital GmbH
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

const container = require('@google-cloud/container');
const core = require('@actions/core');
const fetch = require('node-fetch');

const OPERATION_STATUS = container.protos.google.container.v1.Operation.Status

function parseInputs() {
  const projectId = core.getInput('project_id', { required: true })
  const location = core.getInput('location', { required: true })
  const clusterId = core.getInput('cluster_name', { required: true })
  const mode = core.getInput('mode', { required: true })
  const description = core.getInput('description', { required: false })

  if (mode != "add" && mode != "remove") {
    throw new Error(`Received unexpected mode ${ mode }.`)
  }

  return [projectId, location, clusterId, mode, description]
}

async function getCurrentIP() {
  const ip = await fetch("https://ifconfig.me/ip")
  if (!ip.ok) {
    throw new Error(`ifconfig.me returned non-expected status code: ${ip.status}.`)
  }

  return await ip.text()
}

async function waitForRunningOperations(client, location, retries) {
  for (let i = 0; i < retries; i++) {
    const [operations] = await client.listOperations({ parent: location })
    const runningOps = operations.filter(op => op.status === OPERATION_STATUS[OPERATION_STATUS.RUNNING])
    if (runningOps.length === 0) {
      core.info("No running operations found.")
      return
    }

    core.info("Waiting for running operations to complete...")
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error(`Running operations did not complete within ${retries} retries.`)
}

async function waitForOperation(client, opId, retries) {
  for (let i = 0; i < retries; i++) {
    const [op] = await client.getOperation({ name: opId})
    if (op.status === OPERATION_STATUS[OPERATION_STATUS.DONE]) {
      core.info("Cluster successfully updated.")
      return
    }

    core.info("Cluster not updated yet. Checking again in 1 second...")
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error(`Operation did not complete within ${retries} retries.`)
}

function logMasterAuthorizedNetworks(networks) {
  core.startGroup("After the update, the cluster will accept connection from the following networks:")
  for (const network of networks) {
    core.info(`- ${ network.displayName == "" ? "(not description)" : network.displayName }: ${ network.cidrBlock }`)
  }
  core.endGroup()
}

module.exports = {
  parseInputs: parseInputs,
  waitForOperation: waitForOperation,
  waitForRunningOperations: waitForRunningOperations,
  getCurrentIP: getCurrentIP,
  logMasterAuthorizedNetworks: logMasterAuthorizedNetworks
}
