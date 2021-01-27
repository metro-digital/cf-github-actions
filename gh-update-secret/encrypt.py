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

from base64 import b64encode
from nacl import encoding, public
import argparse

def encrypt(public_key: str, secret_value: str) -> str:
    """Encrypt a string using a given public key"""
    public_key = public.PublicKey(public_key.encode("utf-8"), encoding.Base64Encoder())
    sealed_box = public.SealedBox(public_key)
    encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
    return b64encode(encrypted).decode("utf-8")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--key', dest="public_key", help="The public key recieved from GitHub API", type=str)
    parser.add_argument('--value', dest="secret_value", help="The value to encrypt", type=str)
    args = parser.parse_args()
    
    # emcrypt secret value
    print(encrypt(args.public_key, args.secret_value))

if __name__ == "__main__":
   main()