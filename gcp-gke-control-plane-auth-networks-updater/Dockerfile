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

ARG  BUILDER_IMAGE=golang:alpine
ARG  DISTROLESS_IMAGE=gcr.io/distroless/static

# Container image that runs your code
FROM ${BUILDER_IMAGE} as builder

# Copies your code file from your action repository to the builder
WORKDIR $GOPATH/src/metrocf/gke-updater/
COPY src/go.mod .

ENV GO111MODULE=on
RUN go mod download
RUN go mod verify

COPY src/ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
      -ldflags='-w -s -extldflags "-static"' -a \
      -o /go/bin/gke-updater .

FROM ${DISTROLESS_IMAGE}

COPY --from=builder /go/bin/gke-updater /gke-updater

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/gke-updater"]