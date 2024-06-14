jest.mock('node-fetch');

const { parseInputs, getCurrentIP, waitForOperation, calculateBackoff } = require("./utils.js");
const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');
const mockOperation = require("./fixtures/operation.json");

describe("parse inputs", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  });

  afterAll(() => {
    process.env = originalEnv
  });

  test("required inputs are enforced", () => {
    expect(() => {
      parseInputs()
    }).toThrow("Input required and not supplied: project_id")
  })

  test("only supported modes are accepted", () => {
    process.env.INPUT_PROJECT_ID = "foo"
    process.env.INPUT_LOCATION = "bar"
    process.env.INPUT_CLUSTER_NAME = "baz"
    process.env.INPUT_MODE = "delete" // only 'remove' is accepted.

    expect(() => {
      parseInputs()
    }).toThrow("Received unexpected mode delete.")
  })

  test("inputs are all parsed", () => {
    process.env.INPUT_PROJECT_ID = "foo"
    process.env.INPUT_LOCATION = "bar"
    process.env.INPUT_CLUSTER_NAME = "baz"
    process.env.INPUT_MODE = "remove"
    process.env.INPUT_DESCRIPTION = "quz"

    expect(parseInputs()).toEqual(["foo", "bar", "baz", "remove", "quz"])
  })
})

describe("get current public IP", () => {
  afterEach(() => {
    jest.clearAllMocks();
  })

  test('current IP can be resolved', async () => {
    fetch.mockReturnValue(Promise.resolve(new Response('127.0.0.1')))

    const ip = await getCurrentIP()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('https://ifconfig.me/ip')
    expect(ip).toBe('127.0.0.1')
  })

  test('IP lookup fails', async () => {
    fetch.mockReturnValue(Promise.resolve(new Response('', {
      status: 500
    })))

    await expect(getCurrentIP())
      .rejects
      .toThrow('ifconfig.me returned non-expected status code: 500.');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://ifconfig.me/ip');
  });
})

describe("wait for cluster update operation", () => {
  const { protos } = require('@google-cloud/container');

  const mockClient = {
    getOperation: jest.fn(), // set on each individual test
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

  const op = new protos.google.container.v1.Operation(mockOperation)

  test('operation completes within 3 retries', async () => {
    // Let the client wait for 3 retries to find the operation to have completed successfully.
    mockClient.getOperation.mockResolvedValueOnce([op])
    mockClient.getOperation.mockResolvedValueOnce([op])
    mockClient.getOperation.mockResolvedValueOnce([{
      ...op,
      status: 'DONE'
    }])

    await waitForOperation(mockClient, 'operation-1673016793095-37f920a9', 5)

    expect(mockClient.getOperation).toHaveBeenCalledTimes(3)
    expect(mockClient.getOperation).toHaveBeenCalledWith({
      name: "operation-1673016793095-37f920a9"
    });
  })

  test('operation does not complete within 2 retries', async () => {
    mockClient.getOperation.mockResolvedValueOnce([op])
    mockClient.getOperation.mockResolvedValueOnce([op])

    await expect(waitForOperation(mockClient, 'operation-1673016793095-37f920a9', 2))
      .rejects
      .toThrow('Operation did not complete within 2 retries.');

    expect(mockClient.getOperation).toHaveBeenCalledTimes(2)
    expect(mockClient.getOperation).toHaveBeenCalledWith({
      name: "operation-1673016793095-37f920a9"
    });
  })
})

describe("calculateBackoff", () => {
  test("should return a value within the expected range", () => {
    const maxBackoff = 32000; // Maximum backoff time in milliseconds
    const attempts = 2; // Number of attempts

    const result = calculateBackoff(attempts, maxBackoff);

    // The minimum possible value is 2^attempts, the maximum is either maxBackoff or 2^attempts + 1000, whichever is smaller
    const minExpected = Math.pow(2, attempts) * 1000;

    expect(result).toBeGreaterThanOrEqual(minExpected);
    expect(result).toBeLessThanOrEqual(maxBackoff);
  });
});
