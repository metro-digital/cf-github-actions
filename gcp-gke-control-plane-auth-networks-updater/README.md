# GKE Control Plane Authorised Networks Updater

Adds or removes the runner's public IP to or from the control plane authorised
networks for a given GKE cluster.

## Usage

Connecting to GKE control plane via kubectl

```yaml
      - name: Allow control plane access from runner IP
        uses: metro-digital/cf-github-actions/gcp-gke-control-plane-auth-networks-updater@v2
        with:
          project_id: example-project-id
          location: europe-west1
          cluster_name: example-cluster
          mode: add

      - name: run kubectl
        run: kubectl get nodes
```

The action automatically removes the public IP from the cluster's control plane
authorised networks list again as part of a post-action. Thus, there is no need
to call the action a second time with the `remove` mode as long as you don't
disable its post-action.

## Inputs

#### `project_id`

**Required** The ID of the project in which the GKE cluster is located

#### `location`

**Required** GKE cluster location (like europe-west1)

#### `cluster_name`

**Required** The name of the GKE cluster

### `mode`

**Optional** Operation mode, can be 'add' or 'remove'

> If left empty the default 'add' will be used.

#### `description`

**Optional** Description added to the created /32 entry

> If left empty the default 'GitHub Action runner' will be used.

## Outputs

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)
