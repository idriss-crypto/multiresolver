import { OnRpcRequestHandler } from '@metamask/snap-types';
// import { ethers } from "ethers";
// import { IdrissCrypto } from 'idriss-crypto';
// import { loadTippingContract } from '../utils/contacts.ts';
import { regM, regPh, regT } from '../utils/regular-expressions.ts';

/**
 * Resolve any string type to an ethereum address
 *
 * @param identifier_ - The input of a user (Twitter, email, phone number, ens, ud, lens, ...)
 * @returns an ethereum address or 'Not matched' if not matching with any resolver
 */
async function getResolved(identifier_) {
  if (
    identifier_.match(regM) ||
    identifier_.match(regPh) ||
    identifier_.match(regT)
  ) {
    //     const idriss = new IdrissCrypto();
    //     const resultIDriss = await idriss.resolve("hello@idriss.xyz");
    //     return resultIDriss["Public ETH"] ?? Object.values(resultIDriss)[0]
    const response = await fetch(
      `https://www.idriss.xyz/v2/Addresses?identifiers={%22${identifier_}%22:{%22coin%22:%20%22%22,%20%22network%22:%22evm%22}}`,
    );
    const responseJson = await response.json();
    if (Object.keys(responseJson[identifier_])[0] === 'error') {
      return 'Not matched';
    }
    return (
      responseJson[identifier_]['Public ETH'] ??
      Object.values(responseJson[identifier_])[0]
    );
  }
  // const web3 = new Web3(wallet);
  // const ens = web3.eth.ens;
  // const address = ens.getAddress('alice.eth');
  // return address ?? 'Not matched';
  const response = await fetch(
    `https://www.idriss.xyz/v1/Addresses-ENS?identifier=${identifier_}`,
  );
  const responseJson = await response.json();
  return responseJson[identifier_] ?? 'Not matched';

  return 'Not matched';
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap. Can be any for this snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'resolve_send':
      const identifier = request.identifier;
      return getResolved(identifier).then((res) => {
        const ethAddr = res;
        return wallet
          .request({
            method: 'snap_confirm',
            params: [
              {
                prompt: 'Send transaction to',
                description: 'IDriss Snap Demo',
                textAreaContent:
                  `Sending funds to\n` +
                  `Name: ${identifier}\n` +
                  `Address: ${ethAddr}\n`,
              },
            ],
          })
          .then((confirm) => {
            if (confirm && ethAddr !== 'Not matched') {
              return wallet
                .request({ method: 'eth_requestAccounts' })
                .then((arr) => {
                  const selectedAddress = arr[0];
                  // or any other call -> IDriss send?
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
            // alternatively, integrate IDriss tipping contract for IDriss Send (sending to any email/phone/twitter)
            // const provider = new ethers.providers.Web3Provider(wallet);
            // const contract = loadTippingContract(provider);
            return ethAddr;
          });
      });
    default:
      throw new Error('Method not found.');
  }
};

// add transaction insights not yet possible for normal transactions.
// Add insights by using reverse resolver for contract addresses and show verified status.
// exports.onTransaction = async ({ transaction }) => {
//   return {
//     insights: { score: 42, 'Is contract verified on Etherscan?': 'Yes' },
//   };
// };

// exports.keyring = {
//   handleRequest: async ({ request }) => {
//     switch (request.method) {
//       case "eth_sendTransaction":
//         const from_ = request.params["from"]
//         return getResolved(request.params[0]["to"]).then(res => {
//           const identifier = Object.keys(res)[0]
//           const ethAddr = res[identifier]["Public ETH"] ?? Object.values(res[identifier])[0]
//           return wallet.request({ method: "eth_requestAccounts" }).then(arr => {
//             return wallet.request({
//               method: 'eth_sendTransaction',
//               params: [
//                 {
//                   from: from_,
//                   to: ethAddr,
//                   value: '0x00',
//                 },
//               ],
//             });
//           });
//         });
//       default:
//         throw new Error('Method not found.');
//     }
//   },
// };
