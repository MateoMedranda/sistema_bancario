import { existsSync } from 'fs';
import { join } from 'path';

export const CUENTAS_PACKAGE = 'cuentas';
export const CUENTAS_PROTO_RELATIVE_PATH = 'libs/contracts/src/proto/cuentas.proto';

export function getCuentasProtoPath(): string {
  const candidates = [
    join(process.cwd(), CUENTAS_PROTO_RELATIVE_PATH),
    join(process.cwd(), 'dist', CUENTAS_PROTO_RELATIVE_PATH),
    join(__dirname, 'cuentas.proto'),
  ];

  const protoPath = candidates.find((candidate) => existsSync(candidate));
  return protoPath ?? candidates[0];
}
