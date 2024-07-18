# Create Jira issue

Creates a Jira issue using an [API token][1].

## Usage

Create a Jira issue

```yaml
      - name: Create Jira issue
        uses: metro-digital/cloud-foundation-actions/jira-create-issue@v1
        with:
          base_url: "..."
          user_email: "..."
          api_token: ${{ secrets.JIRA_API_TOKEN }}
          description: "..."
          issue_type: "..."
          priority: "..."
          project: "..."
          reporter: "..."
          summary: "..."
          labels: "Label1\nLabel2\nLabel3"
          timeout: "15000"
```

## Inputs

#### `base_url`

**Required** Jira base URL

#### `user_email`

**Required** Jira user email

#### `api_token`

**Required** API token for a user

> For details about API token see Atlassian Support docs: [Manage API tokens for your Atlassian account][1].

#### `description`

**Required** Issue description

#### `issue_type`

**Required** Issue type code

#### `priority`

**Required** Priority code

#### `project`

**Required** Project code

#### `reporter`

**Required** Reporter code

#### `summary`

**Required** Issue summary

#### `labels`

**Optional** Labels

#### `timeout`

**Optional** Timeout

## Outputs

## License

This project is licensed under the terms of the [Apache License 2.0](../LICENSE)

[1]: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
