// lib/grpcClient.ts
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'

// Use path.resolve to get an absolute path to the proto file
const PROTO_PATH = path.resolve(process.cwd(), 'proto/rpc.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any
const SolanaRpc = protoDescriptor.solana.rpc.v1

export const grpcClient = new SolanaRpc.Solana(
  'solana-yellowstone-grpc.publicnode.com:443',
  grpc.credentials.createSsl()
)

export const getAccountInfo = (tokenAddress: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    grpcClient.getAccountInfo(
      {
        account: {
          address: tokenAddress,
          commitment: 'confirmed',
        },
      },
      (err: any, response: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(response)
        }
      }
    )
  })
}
