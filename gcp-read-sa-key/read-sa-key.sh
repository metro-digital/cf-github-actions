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

function check_output()
{
	if [ -z "${!1}" ] ; then
		echo "::error::Output \"$1\" not detected"
		exit 1
	fi
}

check_program jq
check_program base64


echo "Base64 decoding key if necessary"
KEY=$(echo "$SERVICE_ACCOUNT_KEY" | base64 -d 2>/dev/null)
if [ $? -ne 0 ] ; then
	KEY="$SERVICE_ACCOUNT_KEY"
fi

set -e

echo "Extracting data from key"
eval "$(echo ${KEY} | jq -r '@sh "PROJECT_ID=\(.project_id) PRIVATE_KEY_ID=\(.private_key_id) CLIENT_EMAIL=\(.client_email) CLIENT_ID=\(.client_id)"')"

check_output PROJECT_ID
check_output PRIVATE_KEY_ID
check_output CLIENT_EMAIL
check_output CLIENT_ID

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
