import { ethers } from 'ethers';
import contractData from '../contracts/AcademicCredentials.json';
import { Credential } from '../types/credential';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = contractData.contractAddress;
const CONTRACT_ABI = contractData.abi;

export const connectWallet = async (): Promise<string | null> => {
  if (!window.ethereum) {
    alert('Please install MetaMask to use this application');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

export const getContract = async (signer?: ethers.Signer) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signerInstance = signer || await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerInstance);
};

export const issueCredential = async (
  studentAddress: string,
  ipfsHash: string,
  degree: string,
  institution: string
): Promise<{ tokenId: string; txHash: string }> => {
  try {
    const contract = await getContract();
    const tx = await contract.issueCredential(studentAddress, ipfsHash, degree, institution);
    const receipt = await tx.wait();

    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'CredentialIssued';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      const tokenId = parsedEvent?.args[0].toString();
      return { tokenId, txHash: receipt.hash };
    }

    throw new Error('CredentialIssued event not found');
  } catch (error) {
    console.error('Error issuing credential:', error);
    throw error;
  }
};

export const getStudentCredentials = async (studentAddress: string): Promise<Credential[]> => {
  try {
    const contract = await getContract();
    const tokenIds = await contract.getStudentCredentials(studentAddress);

    const credentials: Credential[] = [];

    for (const tokenId of tokenIds) {
      const metadata = await contract.getCredentialMetadata(tokenId);
      credentials.push({
        tokenId: tokenId.toString(),
        ipfsHash: metadata[0],
        degree: metadata[1],
        institution: metadata[2],
        student: metadata[3],
        issueDate: Number(metadata[4]),
        revoked: metadata[5],
      });
    }

    return credentials;
  } catch (error) {
    console.error('Error fetching student credentials:', error);
    return [];
  }
};

export const verifyCredential = async (tokenId: string): Promise<Credential | null> => {
  try {
    const contract = await getContract();
    const metadata = await contract.getCredentialMetadata(tokenId);

    return {
      tokenId,
      ipfsHash: metadata[0],
      degree: metadata[1],
      institution: metadata[2],
      student: metadata[3],
      issueDate: Number(metadata[4]),
      revoked: metadata[5],
    };
  } catch (error) {
    console.error('Error verifying credential:', error);
    return null;
  }
};

export const getCurrentNetwork = async (): Promise<{ name: string; chainId: number } | null> => {
  if (!window.ethereum) return null;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return {
      name: network.name,
      chainId: Number(network.chainId),
    };
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

export const switchToSepolia = async (): Promise<boolean> => {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    console.error('Error switching network:', switchError);
    return false;
  }
};
