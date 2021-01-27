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

check_program curl
check_program python3
check_program pip3

set -e

# install python packages
echo "Installing requirements"
pip3 install pynacl

URL_PUBLIC_KEY="https://api.github.com/repos/${GITHUB_REPO}/actions/secrets/public-key"
URL_SECRET="https://api.github.com/repos/${GITHUB_REPO}/actions/secrets/${SECRET_NAME}"

# Get private key for secret encryption
echo "Get PUBLIC_KEY from GitHub API"
eval "$(curl --silent --show-error --fail \
        -H "Authorization: token $PERSONAL_ACCESS_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$URL_PUBLIC_KEY" | jq -r '@sh "PUBLIC_KEY=\(.key) PUBLIC_KEY_ID=\(.key_id)"')"

if [ -z "$PUBLIC_KEY" ]
then
    echo "::error::Unable to get PUBLIC_KEY from GitHub"
    exit 1
elif [ -z "$PUBLIC_KEY_ID" ]
then
    echo "::error::Unable to get PUBLIC_KEY_ID from GitHub"
    exit 1
else
    echo "Got public key details from GitHub API:"
    echo "PUBLIC_KEY: $PUBLIC_KEY"
    echo "PUBLIC_KEY_ID: $PUBLIC_KEY_ID"
fi

echo "Trying to encrypt value with public key"
ENCRYPTED_VALUE="$(python3 $GITHUB_ACTION_PATH/encrypt.py --key $PUBLIC_KEY --value $SECRET_VALUE)"
if [ -z "$ENCRYPTED_VALUE" ]
then
    echo "::error::Unable to encrypt the value"
    exit 1
else
    echo "Successfully encrypted value"
fi

echo "Updating secret..."
# create json
cat <<EOJ > secret.json
{
    "key_id": "$PUBLIC_KEY_ID",
    "encrypted_value": "$ENCRYPTED_VALUE"
}
EOJ
# call GitHub API
curl \
    -X PUT -H "Authorization: token $PERSONAL_ACCESS_TOKEN" \
    --silent --show-error --fail \
    -H "Content-Type: application/json" \
    "$URL_SECRET" -d @secret.json
echo "Successfully updated secret"