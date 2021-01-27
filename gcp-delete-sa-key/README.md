# Delete Google Cloud Service Account key action

Delete a Google Cloud Platform Service Account key for the given Service Account. Assumes a pre configured gcloud CLI.
So you should execute [google-github-actions/setup-gcloud][1] before running this action.

## Usage

Delete a given key for a service account by its ID
```yaml
steps:
  - name: Delete SA key
    uses: metro-digital/cloud-foundation-actions/gcp-delete-sa-key@v1
    with:
      service_account_email: some-sa@some-example-project.iam.gserviceaccount.com
      key_id: 66b053f4cc73f9e47b9680e24a10bdbc0c3b1a75
```

## Inputs

#### `service_account_email`
**Required** Service account (email) to delete the new keyfile for

#### `key_id`
**Required** ID of the service account key to be deleted

## Outputs

This action does not provide any output

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)

[1]: https://github.com/google-github-actions/setup-gcloud