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

const { waitForOperation, logMasterAuthorizedNetworks } = require("./utils.js");

async function updateCluster(client, projectId, location, clusterName, mode, description, ip) {
  const [cluster] = await client.getCluster({
    name: clusterName,
  })

  switch (mode) {
    case "add":
      cluster.masterAuthorizedNetworksConfig.cidrBlocks.push({
        "displayName": description == "" ? "GitHub Action runner" : description,
        "cidrBlock": `${ip}/32`
      })
      break
    case "remove":
      cluster.masterAuthorizedNetworksConfig.cidrBlocks = cluster.masterAuthorizedNetworksConfig.cidrBlocks.filter(network => network.cidrBlock != `${ip}/32`)
      break
  }

  logMasterAuthorizedNetworks(cluster.masterAuthorizedNetworksConfig.cidrBlocks)

  const [updateOp] = await client.updateCluster({
    name: clusterName,
    update: {
      desiredMasterAuthorizedNetworksConfig: cluster.masterAuthorizedNetworksConfig
    }
  })

  waitForOperation(client, `projects/${ projectId }/locations/${ location }/operations/${ updateOp.name }`, 20)
}

module.exports = {
  updateCluster: updateCluster
}
