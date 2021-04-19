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

if [[ "${TG_VERSION}" == "latest" ]]; then
    TG_TAG_NAME=$(curl https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest | jq -r '.tag_name')
else
    TG_TAG_NAME="${TG_VERSION}"
fi

DOWNLOAD_URL="https://github.com/gruntwork-io/terragrunt/releases/download/${TG_TAG_NAME}/terragrunt_linux_amd64"

TG_BIN_FILE="$RUNNER_TEMP/terragrunt"

curl --location --silent --fail ${DOWNLOAD_URL} --output $TG_BIN_FILE
if test $? != "0"; then
   echo "Downloading terragrunt from $DOWNLOAD_URL failed! Please check version parameter"
   exit 1
fi

chmod +x $TG_BIN_FILE
echo $RUNNER_TEMP >> $GITHUB_PATH