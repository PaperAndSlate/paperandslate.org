/* global process, setTimeout */

const args = process.argv.slice(2);

if (args[0] === "--sleep") {
  setTimeout(() => process.exit(0), Number(args[1] || 1000));
} else if (args[0] === "--exit") {
  process.exit(Number(args[1] || 1));
} else {
  process.stdout.write(`${JSON.stringify({ argv: args })}\n`);
}
