# Create Google Cloud Service Account key action

Updates a repository secret using a [personal access token][1].
Assumes the secret already exists.

## Usage

Update an existing GitHub secret

```yaml
      - name: Update GitHub Secret
        uses: metro-digital/cloud-foundation-actions/gh-update-secret@v1
        with:
          name: SOME_SECRET
          value: SOME_VALUE
          pa_token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```

## Inputs

#### `name`

**Required** Name of the secret to update

#### `value`

**Required** Value to be stored within the secret

> The output of this value is written to the workflow logs under certain cirumstances.
> If you do not want this value to show up inside the logs, ensure it's marked!
> See docs how to [add a masking][2]

#### `pa_token`

**Required** Personal access token with access to update repository secret

> For details about PATs see the GitHub docs: [creating a personal access token][1].
> To modify a secret voa  GitHub API the token requires the `repo` scope.

## Outputs

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)

[1]: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
[2]: https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions#masking-a-value-in-log
