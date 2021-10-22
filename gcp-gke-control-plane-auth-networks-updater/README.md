# GKE Control plane authorised networks updater
Adds or removes the runners public IP to the control plane authorised networks
for a given GKE cluster.

## Usage

Connecting to GKE control plane via kubectl
```yaml
      - name: Allow control plane access for runners IP
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

You should ensure the runner's ip gets removed in any case, even if the pipeline fails.
In the example above this is ensured by replacing the default implicit `if: ${{ success() }}`
with `if: ${{ success() || failure() }}`

## Inputs

#### `project_id`
**Required** GKE clusters project ID

#### `location`
**Required** GKE cluster location (like europe-west1)

#### `clustername`
**Required** The name of the GKE cluster

### `mode`
**Required** Operation mode, can be 'add' or 'remove'

#### `description`
**Optional** Description added to the created /32 entry
> If left empty the default 'GitHub Action runner' will be used.

## Outputs

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)
