import { OnRpcRequestHandler } from '@metamask/snap-types';
// import { ethers } from "ethers";
import { loadTippingContract } from "../utils/contacts.ts";
import { regM, regPh, regT } from "../utils/regular-expressions.ts";
import {IdrissCrypto} from "idriss-crypto"


async function getResolved(identifier_) {

  if (identifier_.match(regM) || identifier_.match(regPh) || identifier_.match(regT) ) {
//     const idriss = new IdrissCrypto();
//     const resultIDriss = await idriss.resolve("hello@idriss.xyz");
//     return resultIDriss["Public ETH"] ?? Object.values(resultIDriss)[0]
    const response = await fetch(`https://www.idriss.xyz/v2/Addresses?identifiers={%22${identifier_}%22:{%22coin%22:%20%22%22,%20%22network%22:%22evm%22}}`);
    const responseJson = await response.json();
    if (Object.keys(responseJson[identifier_])[0] == "error") return "Not matched"
    return responseJson[identifier_]["Public ETH"] ?? Object.values(responseJson[identifier_])[0]
  }
  else {
    const response = await fetch(`https://localhost:5000/v1/Addresses-ENS?identifier=${identifier_}`);
    const responseJson = await response.json();
    return responseJson[identifier_] ?? "Not matched"
  }
  return "Not matched"
  //const web3 = new Web3(wallet);
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
    case 'resolve_send':
      const identifier = request.identifier
      return getResolved (request.identifier).then(res => {
        const ethAddr = res
        return wallet.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: "Send transaction to",
              description:
                'IDriss Snap Demo',
              textAreaContent:
                `Sending funds to\n`+
                `Name: ${identifier}\n`+
                `Address: ${ethAddr}\n`
            },
          ],
        }).then(confirm => {
          if (confirm && ethAddr != "Not matched") {
            return wallet.request({ method: "eth_requestAccounts" }).then(arr => {
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
          //const provider = new ethers.providers.Web3Provider(wallet);
          //const contract = loadTippingContract(provider);
          return ethAddr;
        });
      });
    default:
      throw new Error('Method not found.');
  }
};

exports.onTransaction = async ({ transaction }) => {
  return {
    insights: { score: 42, "Is contract verified on Etherscan?": "Yes" },
  };
};


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
