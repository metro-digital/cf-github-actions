# Create Google Cloud Service Account key action

Create a new Google Cloud Platform Service Account key for the given Service Account. Assumes a pre configured gcloud CLI.
So you should execute [google-github-actions/setup-gcloud][1] before running this action.

Returns the newly created keyfile as base64 encoded string.

## Usage

Create a key for a given service account
```yaml
steps:
  - name: Generate new SA key
    uses: metro-digital/cloud-foundation-actions/gcp-create-sa-key@v1
    with:
      service_account_email: some-sa@some-example-project.iam.gserviceaccount.com
```

## Inputs

#### `service_account_email`
**Required** Service account (email) to create the new keyfile for

#### `max_num_keyfiles`
**Optional** Max number of service account key files allowed to exists.
> This is checked before creating a new key to ensure there is enough headroom for rotation.
> 
> Default: 9
> 
> If you run multiple rotations within a narrow time window you should decrease this value.

## Outputs

#### `project_id`
GCP project ID the service account belongs to

#### `private_key_id`
Service Account keyfile id for the newly generated key

#### `client_email`
The Service Account email

#### `client_id`
The unique Service Account ID

#### `key_file`
The newly created Service Account keyfile (base64 encoded)

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)

[1]: https://github.com/google-github-actions/setup-gcloud