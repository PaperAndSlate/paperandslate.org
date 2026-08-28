import { createServer } from "node:net";
import { once } from "node:events";
import { describe, expect, it } from "vitest";
import { assertTcpPortFree, parseTcpPort } from "../scripts/port-check";

describe("TCP port checks", () => {
  it("rejects invalid port values", () => {
    expect(() => parseTcpPort("0")).toThrow("Invalid TCP port");
    expect(() => parseTcpPort("not-a-port")).toThrow("Invalid TCP port");
  });

  it("rejects occupied ports and accepts an explicitly refused port", async () => {
    const server = createServer();
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server has no TCP address");

    await expect(assertTcpPortFree("127.0.0.1", address.port)).rejects.toThrow("occupied");
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await expect(assertTcpPortFree("127.0.0.1", address.port)).resolves.toBeUndefined();
  });
});
