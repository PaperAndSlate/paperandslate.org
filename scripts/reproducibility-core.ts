import { createHash } from "node:crypto";

export function sha256Bytes(value: Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

export function equalBytes(left: Uint8Array, right: Uint8Array) {
  return left.length === right.length && left.every((byte, index) => byte === right[index]);
}
