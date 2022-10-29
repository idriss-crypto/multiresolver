import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';
import { MultiChainProvider } from "@metamask/multichain-provider";


/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {



    await window.ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          [snapId]: {
            ...params,
          },
        },
      },
    ],
  });

//   const provider = new MultiChainProvider();
//   const { approval } = await provider.connect({
//     requiredNamespaces: {
//       eip155: {
//         chains: ["eip155:5"],
//         methods: [
//           "eth_accounts",
//           "eth_sendTransaction"
//         ],
//       },
//     },
//   });
//   const session = await approval();

};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const resolveInput = async (id_?: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'hello',
        identifier: id_,
      },
    ],
  });
};

export const sendTransaction = async (targetAddress?: string) => {

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const selectedAddress = accounts[0];
  return
//   return await window.ethereum.request({
//     method: 'eth_sendTransaction',
//     params: [
//       {
//         from: selectedAddress,
//         to: targetAddress,
//         value: '0x00',
//       },
//     ],
//   });
};

// exports.onTransaction = async ({ transaction }) => {
//   return {
//     insights: { score: 42, 'Is contract verified on Etherscan?': 'Yes' },
//   };
// };

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
