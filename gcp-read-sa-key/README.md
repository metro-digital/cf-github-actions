# Create Google Cloud Service Account key action

Reads a base64 encoded Google Cloud Platform service account key file and returns several details like project_id, key_id and client_email

## Usage

Extract details for a given Service Account key
```yaml
steps:
  - name: Extract details Service Account key
    id: key
    uses: metro-digital/cloud-foundation-actions/gcp-read-sa-key@v1
    with:
      service_account_key: ${{ secrets.SOME_BASE64_ENCODED_KEYFILE }}
```

## Inputs

#### `service_account_key`
**Required** Content of the Service Account key file (base64 encoded)

## Outputs

#### `project_id`
GCP project ID the service account belongs to

#### `private_key_id`
Service Account keyfile id for the newly generated key

#### `client_email`
The Service Account email

#### `client_id`
The unique Service Account ID

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)

[1]: https://github.com/google-github-actions/setup-gcloud
