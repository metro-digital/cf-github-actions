# Setup terragrunt

Installs terragrunt on a GitHub action runner

## Usage

Install latest terragrunt version
```yaml
      - name: Update GitHub Secret
        uses: metro-digital/cloud-foundation-actions/gh-update-secret@v1
```

Install specific terragrunt version
```yaml
      - name: Update GitHub Secret
        uses: metro-digital/cloud-foundation-actions/gh-update-secret@v1
        with:
          version: v0.28.24
```

## Inputs

#### `version`
**Optional** Install terragrunt in specific version (default: latest)

## Outputs

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)
