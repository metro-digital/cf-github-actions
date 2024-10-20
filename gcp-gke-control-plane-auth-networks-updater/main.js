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

const core = require('@actions/core');
const container = require('@google-cloud/container');
const { parseInputs, getCurrentIP } = require("./utils.js");
const { updateCluster } = require("./index.js")

async function run() {
  try {
    const [projectId, location, clusterId, mode, description] = parseInputs()

    const ip = await getCurrentIP()
    core.info(`Detected public IP: ${ip}.`)

    const client = new container.v1.ClusterManagerClient();

    const clusterName = `projects/${ projectId }/locations/${ location }/clusters/${ clusterId }`

    await updateCluster(client, projectId, location, clusterName, mode, description, ip)
  } catch (e) {
    core.error(e.message)
    core.setFailed(e)
  }
}

run()
