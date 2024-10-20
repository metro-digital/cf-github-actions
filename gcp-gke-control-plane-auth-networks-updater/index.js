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

const { waitForOperation, waitForRunningOperations, logMasterAuthorizedNetworks, calculateBackoff } = require("./utils.js");

async function updateCluster(client, projectId, location, clusterName, mode, description, ip) {
  let triesCounter = 0;
  const maxAttempts = 10
  while (triesCounter < maxAttempts) {
    try {
      await waitForRunningOperations(client, `projects/${ projectId }/locations/${ location }`, 5)
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
      await waitForOperation(client, `projects/${ projectId }/locations/${ location }/operations/${ updateOp.name }`, 20)
      break
    } catch (err) {
      console.log(err)

      if (triesCounter == maxAttempts - 1) {
        throw new Error("Failed to update the cluster after " + maxAttempts + " attempts.")
      }

      const backoff = calculateBackoff(triesCounter, 30000)
      console.log("Updating the cluster failed, will retry in " + backoff + " ms...")
      await new Promise(resolve => setTimeout(resolve, backoff))
    }
    triesCounter++
  }
}

module.exports = {
  updateCluster: updateCluster
}
