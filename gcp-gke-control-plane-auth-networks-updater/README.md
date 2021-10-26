# GKE Control Plane Authorised Networks Updater
Adds or removes the runner's public IP to or from the control plane authorised
networks for a given GKE cluster.

## Usage

Connecting to GKE control plane via kubectl
```yaml
      - name: Allow control plane access from runner IP
        uses: metro-digital/cf-github-actions/gcp-gke-control-plane-auth-networks-updater@v1
        with:
          project_id: example-project-id
          location: europe-west1
          clustername: example-cluster
          mode: add

      - name: run kubectl
        run: kubectl get nodes

      - name: Remove runners IP from control plane authorised networks
        if: ${{ success() || failure() }}
        uses: metro-digital/cf-github-actions/gcp-gke-control-plane-auth-networks-updater@v1
        with:
          project_id: example-project-id
          location: europe-west1
          clustername: example-cluster
          mode: remove
```

You should ensure the runner's IP gets removed in any case, even if the pipeline fails.
In the example above, this is ensured by replacing the default implicit 
`if: ${{ success() }}` with `if: ${{ success() || failure() }}`.

## Inputs

#### `project_id`
**Required** The ID of the project in which the GKE cluster is located

#### `location`
**Required** GKE cluster location (like europe-west1)

#### `cluster_name`
**Required** The name of the GKE cluster

### `mode`
**Required** Operation mode, can be 'add' or 'remove'

#### `description`
**Optional** Description added to the created /32 entry
> If left empty the default 'GitHub Action runner' will be used.

## Outputs

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)
