import net from "node:net";

export function parseTcpPort(value: string) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535)
    throw new Error(`Invalid TCP port: ${value}`);
  return port;
}

/** Fail closed unless an explicit connection refusal proves the port is free. */
export function assertTcpPortFree(host: string, port: number, timeoutMs = 1_000) {
  return new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const timer = setTimeout(() => {
      finish(new Error(`Could not determine whether ${host}:${port} is free before timeout`));
    }, timeoutMs);

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.once("connect", () => {
      finish(new Error(`Refusing run: ${host}:${port} is already occupied`));
    });
    socket.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ECONNREFUSED") finish();
      else
        finish(new Error(`Could not determine whether ${host}:${port} is free: ${error.message}`));
    });
  });
}
