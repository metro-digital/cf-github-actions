const { updateCluster } = require("./index.js");
const mockCluster = require("./fixtures/cluster.json");
const mockOperation = require("./fixtures/operation.json");

describe("update cluster", () => {
  const { protos } = require('@google-cloud/container');
  const op = new protos.google.container.v1.Operation(mockOperation)

  const mockClient = {
    getCluster: jest.fn(), // set on every test
    listOperations: jest.fn().mockResolvedValue([{
        operations: [{
                ...op,
                status: 'RUNNING'
        }]
    }]),
    getOperation: jest.fn().mockResolvedValue([{
      ...op,
      status: 'DONE'
    }]),
    updateCluster: jest.fn().mockResolvedValue([op]),
  }

  jest.mock('@google-cloud/container', () => {
    const originalModule = jest.requireActual('@google-cloud/container');

    return {
      ClusterManagerClient: jest.fn(() => mockClient),
      ...originalModule
    };
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  const table = [
    [
      "add operation, no IP authorised yet",
      "add",
      "GitHub Action runner",
      [],
      [
        {
          displayName: "GitHub Action runner",
          cidrBlock: "127.0.0.1/32"
        }
      ]
    ],
    [
      "add operation, description filled when not provided",
      "add",
      "",
      [],
      [
        {
          displayName: "GitHub Action runner",
          cidrBlock: "127.0.0.1/32"
        }
      ]
    ],
    [
      "add operation, one IP authorised already",
      "add",
      "GitHub Action runner",
      [
        {
            displayName: "My local developer machine",
            cidrBlock: "192.168.2.2/32"
          }
      ],
      [
        {
          displayName: "My local developer machine",
          cidrBlock: "192.168.2.2/32"
        },
        {
          displayName: "GitHub Action runner",
          cidrBlock: "127.0.0.1/32"
        }
      ]
    ],
    [
      "remove operation, no IP authorised",
      "remove",
      "GitHub Action runner",
      [],
      []
    ],
    [
      "remove operation, only current IP authorised",
      "remove",
      "GitHub Action runner",
      [
        {
          displayName: "GitHub Action runner",
          cidrBlock: "127.0.0.1/32"
        }
      ],
      []
    ],
    [
      "remove operation, current IP and different one authorised",
      "remove",
      "GitHub Action runner",
      [
        {
          displayName: "My local developer machine",
          cidrBlock: "192.168.2.2/32"
        },
        {
          displayName: "GitHub Action runner",
          cidrBlock: "127.0.0.1/32"
        }
      ],
      [
        {
          displayName: "My local developer machine",
          cidrBlock: "192.168.2.2/32"
        }
      ]
    ]
  ]

  test.each(table)(
    "%p", async (_, operation, description, haveCidrBlocks, wantCidrBlocks) => {
      mockClient.getCluster.mockResolvedValue([{
        ...mockCluster,
        masterAuthorizedNetworksConfig: {
          cidrBlocks: haveCidrBlocks,
          enabled: true,
          gcpPublicCidrsAccessEnabled: false,
          _gcpPublicCidrsAccessEnabled: 'gcpPublicCidrsAccessEnabled'
        },
      }])

      await updateCluster(mockClient, "my-project", "europe-west1", "my-cluster", operation, description, "127.0.0.1")

      expect(mockClient.updateCluster).toHaveBeenCalledTimes(1)
      expect(mockClient.updateCluster).toHaveBeenCalledWith({
        name: "my-cluster",
        update: {
          desiredMasterAuthorizedNetworksConfig: {
            cidrBlocks: wantCidrBlocks,
            enabled: true,
            gcpPublicCidrsAccessEnabled: false,
            _gcpPublicCidrsAccessEnabled: 'gcpPublicCidrsAccessEnabled'
          }
        }
      });
    }
  )
})
