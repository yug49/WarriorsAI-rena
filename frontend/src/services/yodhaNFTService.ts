import { readContract } from '@wagmi/core';
import { chainsToContracts, warriorsNFTAbi } from '../constants';
import rainbowKitConfig from '../rainbowKitConfig';

export interface WarriorsTraits {
  strength: number;
  wit: number;
  charisma: number;
  defence: number;
  luck: number;
}

// Metadata structure from IPFS
export interface WarriorsMetadata {
  name: string;
  description: string;
  image: string;
  bio?: string;
  life_history?: string;
  adjectives?: string;
  knowledge_areas?: string;
  attributes: Array<{
    trait_type: string;
    value: number;
  }>;
}

export interface WarriorsDetails {
  id: number;
  tokenId: number;
  name: string;
  bio: string;
  life_history: string;
  adjectives: string;
  knowledge_areas: string;
  traits: WarriorsTraits;
  image: string;
  rank: 'unranked' | 'bronze' | 'silver' | 'gold' | 'platinum';
  totalWinnings: number;
  owner: string;
  tokenURI: string;
}

// Cache for metadata to avoid repeated IPFS calls
const metadataCache = new Map<string, WarriorsMetadata>();

// IPFS gateways to try in order
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://w3s.link/ipfs/',
  'https://gateway.ipfs.io/ipfs/'
];

/**
 * Fetch metadata from IPFS with multiple gateway fallback
 */
const fetchMetadataFromIPFS = async (tokenURI: string, tokenId: number): Promise<WarriorsMetadata> => {
  // Check cache first
  if (metadataCache.has(tokenURI)) {
    return metadataCache.get(tokenURI)!;
  }

  console.log(`🔍 Warriors ${tokenId}: Fetching metadata from IPFS`);
  console.log(`📎 TokenURI: ${tokenURI}`);

  // Extract IPFS hash from various URI formats
  let ipfsHash = '';
  
  if (tokenURI.startsWith('ipfs://')) {
    ipfsHash = tokenURI.replace('ipfs://', '');
  } else if (tokenURI.includes('/ipfs/')) {
    ipfsHash = tokenURI.split('/ipfs/')[1];
  } else {
    // Assume it's already an IPFS hash
    ipfsHash = tokenURI;
  }

  console.log(`🔗 IPFS Hash: ${ipfsHash}`);

  // Try each gateway
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    const gateway = IPFS_GATEWAYS[i];
    const url = `${gateway}${ipfsHash}`;
    
    try {
      console.log(`🌐 Warriors ${tokenId}: Trying gateway ${i + 1}/${IPFS_GATEWAYS.length}: ${gateway}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`❌ Warriors ${tokenId}: Gateway ${gateway} returned ${response.status}`);
        continue;
      }
      
      const metadata = await response.json() as WarriorsMetadata;
      console.log(`✅ Warriors ${tokenId}: Successfully fetched metadata from ${gateway}`);
      
      // Cache the result
      metadataCache.set(tokenURI, metadata);
      return metadata;
      
    } catch (error) {
      console.log(`⚠️ Warriors ${tokenId}: Gateway ${gateway} failed:`, error instanceof Error ? error.message : 'Unknown error');
      continue;
    }
  }
  
  // Fallback metadata if all gateways fail
  console.log(`🔄 Warriors ${tokenId}: All IPFS gateways failed, using fallback`);
  const fallbackMetadata: WarriorsMetadata = {
    name: `Warriors Warrior #${tokenId}`,
    description: "A legendary warrior from the Warriors AI-rena battlefield",
    image: "/lazered.png", // Fallback image
    bio: "Ancient warrior whose full history is being retrieved...",
    life_history: "Born in the age of digital warfare...",
    adjectives: "Brave, Mysterious, Resilient",
    knowledge_areas: "Combat, Strategy, Digital Warfare",
    attributes: [
      { trait_type: "Strength", value: Math.floor(Math.random() * 50) + 50 },
      { trait_type: "Wit", value: Math.floor(Math.random() * 50) + 50 },
      { trait_type: "Charisma", value: Math.floor(Math.random() * 50) + 50 },
      { trait_type: "Defence", value: Math.floor(Math.random() * 50) + 50 },
      { trait_type: "Luck", value: Math.floor(Math.random() * 50) + 50 },
    ]
  };
  
  metadataCache.set(tokenURI, fallbackMetadata);
  return fallbackMetadata;
};

// Rank mapping (from enum value to string)
const rankingToString = (rankValue: number): 'unranked' | 'bronze' | 'silver' | 'gold' | 'platinum' => {
  switch (rankValue) {
    case 0: return 'unranked';
    case 1: return 'bronze';
    case 2: return 'silver';
    case 3: return 'gold';
    case 4: return 'platinum';
    default: return 'unranked';
  }
};

export const warriorsNFTService = {
  /**
   * Fetch complete Warriors details including metadata from IPFS
   */
  async getWarriorsDetails(tokenId: number): Promise<WarriorsDetails> {
    try {
      // Fetch basic contract data including traits from contract
      const [tokenURI, ranking, winnings, owner, contractTraits] = await Promise.all([
        readContract(rainbowKitConfig, {
          address: chainsToContracts[545].warriorsNFT as `0x${string}`,
          abi: warriorsNFTAbi,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
          chainId: 545,
        }),
        readContract(rainbowKitConfig, {
          address: chainsToContracts[545].warriorsNFT as `0x${string}`,
          abi: warriorsNFTAbi,
          functionName: 'getRanking',
          args: [BigInt(tokenId)],
          chainId: 545,
        }),
        readContract(rainbowKitConfig, {
          address: chainsToContracts[545].warriorsNFT as `0x${string}`,
          abi: warriorsNFTAbi,
          functionName: 'getWinnings',
          args: [BigInt(tokenId)],
          chainId: 545,
        }),
        readContract(rainbowKitConfig, {
          address: chainsToContracts[545].warriorsNFT as `0x${string}`,
          abi: warriorsNFTAbi,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
          chainId: 545,
        }),
        readContract(rainbowKitConfig, {
          address: chainsToContracts[545].warriorsNFT as `0x${string}`,
          abi: warriorsNFTAbi,
          functionName: 'getTraits',
          args: [BigInt(tokenId)],
          chainId: 545,
        })
      ]);

      // Fetch metadata from IPFS
      const metadata = await fetchMetadataFromIPFS(tokenURI as string, tokenId);
      
      // Use traits from contract instead of metadata, divide by 100 for display
      const traits: WarriorsTraits = {
        strength: Number((contractTraits as { strength: bigint }).strength ?? BigInt(5000)) / 100,
        wit: Number((contractTraits as { wit: bigint }).wit ?? BigInt(5000)) / 100,
        charisma: Number((contractTraits as { charisma: bigint }).charisma ?? BigInt(5000)) / 100,
        defence: Number((contractTraits as { defence: bigint }).defence ?? BigInt(5000)) / 100,
        luck: Number((contractTraits as { luck: bigint }).luck ?? BigInt(5000)) / 100
      };

      // Construct complete Warriors details
      const warriorsDetails: WarriorsDetails = {
        id: tokenId,
        tokenId: tokenId,
        name: metadata.name,
        bio: metadata.bio || '',
        life_history: metadata.life_history || '',
        adjectives: metadata.adjectives || '',
        knowledge_areas: metadata.knowledge_areas || '',
        traits: traits,
        image: metadata.image,
        rank: rankingToString(Number(ranking)),
        totalWinnings: Number(winnings),
        owner: owner as string,
        tokenURI: tokenURI as string
      };

      return warriorsDetails;
    } catch (error) {
      console.error(`Error fetching Warriors ${tokenId} details:`, error);
      throw error;
    }
  },

  /**
   * Fetch multiple Warriors details in batch
   */
  async getBatchWarriorsDetails(tokenIds: number[]): Promise<WarriorsDetails[]> {
    const results: WarriorsDetails[] = [];
    
    // Process in smaller batches to avoid overwhelming IPFS gateways
    const batchSize = 3;
    for (let i = 0; i < tokenIds.length; i += batchSize) {
      const batch = tokenIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (tokenId) => {
        try {
          return await this.getWarriorsDetails(tokenId);
        } catch (error) {
          console.error(`Failed to fetch Warriors ${tokenId}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as WarriorsDetails[]);
      
      // Add delay between batches
      if (i + batchSize < tokenIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  },

  /**
   * Clear the metadata cache
   */
  clearCache(): void {
    metadataCache.clear();
    console.log('🗑️ Warriors metadata cache cleared');
  }
};
