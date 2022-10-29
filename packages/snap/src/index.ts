import { OnRpcRequestHandler } from '@metamask/snap-types';
import { IdrissCrypto } from "idriss-crypto";



async function getResolved(identifier_) {
  // const idriss = new IdrissCrypto();
  // const resultIDriss = "hi" //await idriss.resolve("hello@idriss.xyz");
  const response = await fetch(`http://localhost:5000/v2/Addresses?identifiers={%22${identifier_}%22:{%22coin%22:%20%22%22,%20%22network%22:%22evm%22}}`);
  return await response.json();
}

async function getAccounts() {
  return await wallet.selectedAddress;
}


/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return getResolved (request.identifier).then(res => {
        const identifier = Object.keys(res)[0]
        const ethAddr = res[identifier]["Public ETH"] ?? Object.values(res[identifier])[0]
        return wallet.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: getMessage(origin),
              description:
                'IDriss first Snap demo.',
              textAreaContent:
                 `Name: ${identifier}\n`+
                `Address: ${ethAddr}`
            },
          ],
        }).then(confirm => {
          if (confirm) {
            return wallet.request({ method: "eth_requestAccounts" }).then(arr => {
              const selectedAddress = arr[0];
              return wallet.request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: selectedAddress,
                    to: ethAddr,
                    value: '0x00',
                  },
                ],
              });
            });
          }
          return ethAddr;
        });
      });
    default:
      throw new Error('Method not found.');
  }
};


exports.keyring = {
  handleRequest: async ({ request }) => {
    switch (request.method) {
      case "eth_sendTransaction":
        const from_ = request.params["from"]
        return getResolved(request.params[0]["to"]).then(res => {
          const identifier = Object.keys(res)[0]
          const ethAddr = res[identifier]["Public ETH"] ?? Object.values(res[identifier])[0]
          return wallet.request({ method: "eth_requestAccounts" }).then(arr => {
            return wallet.request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: from_,
                  to: ethAddr,
                  value: '0x00',
                },
              ],
            });
          });
        });
      default:
        throw new Error('Method not found.');
    }
  },
};
