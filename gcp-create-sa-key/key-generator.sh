# Copyright 2021 METRO Digital GmbH
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

function check_program()
{
    PRG=$(which $1 2>/dev/null)
    if [ -z "$PRG" ] ; then
        echo "::error::Program \"$1\" not found"
        exit 1
    fi
}

check_program jq
check_program gcloud

set -e

echo "Checking number of keys for the given service account"
NUM_EXISTING_KEYS=$(gcloud iam service-accounts keys list -q --iam-account $SERVICE_ACCOUNT_EMAIL --format json --filter 'keyType:USER_MANAGED' | jq -r '. | length')

if [ $NUM_EXISTING_KEYS -gt $MAX_NUM_KEYFILES ]
then
    echo "::error::There are $NUM_EXISTING_KEYS service account keys for $SERVICE_ACCOUNT_EMAIL - allowed number of keys is $MAX_NUM_KEYFILES"
    exit 1
fi

echo "Creating new key"
gcloud iam service-accounts keys create -q --iam-account $SERVICE_ACCOUNT_EMAIL key.json

eval "$(jq -r '@sh "PROJECT_ID=\(.project_id) PRIVATE_KEY_ID=\(.private_key_id) CLIENT_EMAIL=\(.client_email) CLIENT_ID=\(.client_id)"' key.json)"


# Ensure the key isn't printed within the logs
NEW_KEY=$(jq -c key.json)
echo "::add-mask::$NEW_KEY"

### Set output project_id
echo "project_id is: $PROJECT_ID"
echo "::set-output name=project_id::$PROJECT_ID"
### Set output private_key_id
echo "private_key_id is: $PRIVATE_KEY_ID"
echo "::set-output name=private_key_id::$PRIVATE_KEY_ID"
### Set output client_email
echo "client_email is: $CLIENT_EMAIL"
echo "::set-output name=client_email::$CLIENT_EMAIL"
### Set output client_id
echo "client_id is: $CLIENT_ID"
echo "::set-output name=client_id::$CLIENT_ID"
### Set output key_file
echo "::set-output name=key_file::$NEW_KEY"
