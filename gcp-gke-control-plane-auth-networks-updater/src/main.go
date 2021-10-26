/* Copyright 2021 METRO Digital GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ 

package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"golang.org/x/net/context"
	"google.golang.org/api/container/v1"
)

func main() {
	fmt.Printf("::debug::Arguments: %q\n", os.Args)

	if (len(os.Args) >= 5) && (os.Args[4] == "add" && len(os.Args) != 6) && (os.Args[4] == "remove" && len(os.Args) >= 5) {
		log.Fatal("::error::Unexpected call.\nUsage: gke-updater -- project_id location cluster_name [add | remove] [description]")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	containerService, err := container.NewService(ctx)
	if err != nil {
		log.Fatalf("::error::Could not create container client: %v", err)
	}

	// The name (project, location, cluster) of the cluster to retrieve.
	// Specified in the format 'projects/*/locations/*/clusters/*'.
	name := fmt.Sprintf("projects/%s/locations/%s/clusters/%s", os.Args[1], os.Args[2], os.Args[3])

	cluster, err := containerService.Projects.Locations.Clusters.Get(name).Context(ctx).Do()
	if err != nil {
		log.Fatalf("::error::Could not get details about GKE cluster: %v", err)
	}

	if !cluster.MasterAuthorizedNetworksConfig.Enabled {
		log.Fatal("::error::The given cluster has the master authorized networks feature disabled. Enable it to use this action.")
	}

	mode := os.Args[4]

	var rb *container.UpdateClusterRequest

	if mode == "add" {
		rb = addRequest(cluster, os.Args[5])
	} else if mode == "remove" {
		rb = removeRequest(cluster)
	} else {
		log.Fatalf("::error::Unexpected mode, expected 'add' or 'remove', got '%s'", mode)
	}

	reqJson, err := rb.Update.MarshalJSON()
	if err != nil {
		log.Fatalf("::error::Could not encode request as JSON", err)
	}
	fmt.Printf("::group::Request sent to google\n%s\n::endgroup::\n", reqJson)

	ops, err := containerService.Projects.Locations.Clusters.Update(name, rb).Context(ctx).Do()
	if err != nil {
		log.Fatalf("::error::Failed to update cluster: %v", err)
	}

	select {
	case <-ctx.Done():
		log.Fatal(ctx.Err())
	case <-time.Tick(5 * time.Second):
		status, err := containerService.Projects.Locations.Operations.Get(
			strings.TrimPrefix(ops.SelfLink, "https://container.googleapis.com/v1/"),
		).Do()
		if err != nil {
			log.Fatalf("::error::Could not check update operation: %v", err)
		}

		if status.Status == "DONE" {
			break
		}
		
		fmt.Println("::notice::Cluster update in progress...")
	}
	fmt.Println("::notice::Cluster updated.")
}

func addRequest(cluster *container.Cluster, displayname string) *container.UpdateClusterRequest {
	cidr := getCurrentCidr()

	cidrblocks := make([]*container.CidrBlock, len(cluster.MasterAuthorizedNetworksConfig.CidrBlocks)+1)

	for _, c := range cluster.MasterAuthorizedNetworksConfig.CidrBlocks {
		if c.CidrBlock != cidr {
			cidrblocks = append(cidrblocks, c)
		}
	}

	cidrblocks = append(cidrblocks, &container.CidrBlock{CidrBlock: cidr, DisplayName: displayname})

	rb := &container.UpdateClusterRequest{
		Name: cluster.Name,
		Update: &container.ClusterUpdate{
			DesiredMasterAuthorizedNetworksConfig: &container.MasterAuthorizedNetworksConfig{
				CidrBlocks: cidrblocks,
				Enabled:    true,
			},
		},
	}
	return rb
}

func removeRequest(cluster *container.Cluster) *container.UpdateClusterRequest {
	cidr := getCurrentCidr()

	cidrblocks := make([]*container.CidrBlock, len(cluster.MasterAuthorizedNetworksConfig.CidrBlocks))

	for _, c := range cluster.MasterAuthorizedNetworksConfig.CidrBlocks {
		if c.CidrBlock != cidr {
			cidrblocks = append(cidrblocks, c)
		}
	}

	rb := &container.UpdateClusterRequest{
		Name: cluster.Name,
		Update: &container.ClusterUpdate{
			DesiredMasterAuthorizedNetworksConfig: &container.MasterAuthorizedNetworksConfig{
				CidrBlocks: cidrblocks,
				Enabled:    true,
			},
		},
	}
	return rb
}

func getCurrentCidr() string {
	resp, err := http.Get("https://api.ipify.org/")
	if err != nil {
		fmt.Printf("::group::Error message\n%+v\n::endgroup::\n", err)
		log.Fatal("::error::Could not detect current IP!")
	}
	if resp.StatusCode != 200 {
		fmt.Printf("::warning::Failed to fetch public IP from api.ipify.org!\n::group::Error message\n%+v\n::endgroup::\n", resp)
		resp, err = http.Get("https://ifconfig.me/ip")
		if err != nil {
			fmt.Printf("::group::Error message\n%+v\n::endgroup::\n", err)
			log.Fatal("::error::Could not detect current IP!")
		}
	}
	if resp.StatusCode != 200 {
		fmt.Printf("::error::Also Failed to fetch public IP from ifconfig.me!\n::group::Error message\n%+v\n::endgroup::\n", resp)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("::error::Could not read response body: %v", err)
	}

	currentCidr := string(body) + "/32"
	fmt.Printf("::notice::Detected public IP: %s\n", currentCidr)
	return currentCidr
}
