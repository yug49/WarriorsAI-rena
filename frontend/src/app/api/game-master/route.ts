import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { flowPreviewnet } from 'viem/chains';

// Import the contract ABI
import { KurukshetraAbi } from '../../../constants';

// Game Master's private key from environment
const GAME_MASTER_PRIVATE_KEY = process.env.NEXT_PUBLIC_GAME_MASTER_PRIVATE_KEY as `0x${string}`;

if (!GAME_MASTER_PRIVATE_KEY) {
  console.error('NEXT_PUBLIC_GAME_MASTER_PRIVATE_KEY not found in environment variables');
}

// Create game master account
const gameMasterAccount = privateKeyToAccount(GAME_MASTER_PRIVATE_KEY);

// Create wallet client for transactions
const walletClient = createWalletClient({
  account: gameMasterAccount,
  chain: flowPreviewnet,
  transport: http()
});

// Create public client for reading contract state
const publicClient = createPublicClient({
  chain: flowPreviewnet,
  transport: http()
});

interface ArenaState {
  address: string;
  isInitialized: boolean;
  currentRound: number;
  isBettingPeriod: boolean;
  gameInitializedAt: number;
  lastRoundEndedAt: number;
  minBettingPeriod: number;
  minBattleRoundsInterval: number;
  playerOneBetAddresses: string[];
  playerTwoBetAddresses: string[];
}

async function getArenaState(arenaAddress: string): Promise<ArenaState | null> {
  try {
    const [
      isInitialized,
      currentRound,
      isBettingPeriod,
      gameInitializedAt,
      lastRoundEndedAt,
      minBettingPeriod,
      minBattleRoundsInterval,
      playerOneBetAddresses,
      playerTwoBetAddresses
    ] = await Promise.all([
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getInitializationStatus',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getCurrentRound',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getIsBettingPeriodGoingOn',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getGameInitializedAt',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getLastRoundEndedAt',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getMinYodhaBettingPeriod',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getMinBattleRoundsInterval',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getPlayerOneBetAddresses',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getPlayerTwoBetAddresses',
      })
    ]);

    return {
      address: arenaAddress,
      isInitialized: Boolean(isInitialized),
      currentRound: Number(currentRound),
      isBettingPeriod: Boolean(isBettingPeriod),
      gameInitializedAt: Number(gameInitializedAt),
      lastRoundEndedAt: Number(lastRoundEndedAt),
      minBettingPeriod: Number(minBettingPeriod),
      minBattleRoundsInterval: Number(minBattleRoundsInterval),
      playerOneBetAddresses: playerOneBetAddresses as string[],
      playerTwoBetAddresses: playerTwoBetAddresses as string[]
    };
  } catch (error) {
    console.error(`Failed to get arena state for ${arenaAddress}:`, error);
    return null;
  }
}

async function startGame(arenaAddress: string): Promise<boolean> {
  try {
    console.log(`Game Master: Starting game for arena ${arenaAddress}`);
    
    const hash = await walletClient.writeContract({
      address: arenaAddress as `0x${string}`,
      abi: KurukshetraAbi,
      functionName: 'startGame',
    });

    console.log(`Game Master: Start game transaction sent: ${hash}`);
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60000 // 60 second timeout
    });
    
    console.log(`Game Master: Game started successfully for arena ${arenaAddress}`);
    return receipt.status === 'success';
  } catch (error) {
    console.error(`Game Master: Failed to start game for arena ${arenaAddress}:`, error);
    return false;
  }
}

async function generateAIMoves(arenaAddress: string): Promise<{ agent_1: { move: string }, agent_2: { move: string } } | null> {
  try {
    // Get current battle data from contract
    const [currentRound, damageOnYodhaOne, damageOnYodhaTwo, yodhaOneNFTId, yodhaTwoNFTId] = await Promise.all([
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getCurrentRound',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getDamageOnYodhaOne',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getDamageOnYodhaTwo',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getYodhaOneNFTId',
      }),
      publicClient.readContract({
        address: arenaAddress as `0x${string}`,
        abi: KurukshetraAbi,
        functionName: 'getYodhaTwoNFTId',
      })
    ]);

    // For now, use default personality and traits since we don't have NFT metadata in the game master
    const battlePrompt = {
      current_round: Number(currentRound),
      agent_1: {
        personality: {
          adjectives: ['brave', 'fierce', 'strategic'],
          knowledge_areas: ['combat', 'strategy', 'warfare']
        },
        traits: {
          Strength: 7500, // Default values - could be improved by fetching NFT metadata
          Wit: 7000,
          Charisma: 6500,
          Defence: 7200,
          Luck: 6800
        },
        total_damage_received: Number(damageOnYodhaOne)
      },
      agent_2: {
        personality: {
          adjectives: ['cunning', 'agile', 'tactical'], 
          knowledge_areas: ['combat', 'stealth', 'tactics']
        },
        traits: {
          Strength: 7200,
          Wit: 7300,
          Charisma: 6800,
          Defence: 7000,
          Luck: 7100
        },
        total_damage_received: Number(damageOnYodhaTwo)
      },
      moveset: [
        "strike",
        "taunt", 
        "dodge",
        "recover",
        "special_move"
      ]
    };

    // Use the pre-made auth token from environment variable
    const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;
    if (!authKey) {
      console.error('Game Master: NEXT_PUBLIC_AUTH_KEY not found in environment variables');
      return null;
    }

    const authData = JSON.parse(authKey);
    const authForApi = {
      signature: authData.signature,
      account_id: authData.account_id,
      public_key: authData.public_key,
      message: authData.message,
      nonce: authData.nonce,
      recipient: authData.recipient,
      callback_url: authData.callback_url
    };

    // Get the move selector assistant ID from constants
    const near_agent_move_selecter = "01JH5G6YCEEHDC53F8HQVF6S97";

    // Call NEAR AI for move selection
    console.log('Game Master: Calling NEAR AI for move selection...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/near-ai-moves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth: authForApi,
        prompt: JSON.stringify(battlePrompt),
        assistantId: near_agent_move_selecter
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Game Master: AI API Error:', errorText);
      return null;
    }

    const data = await response.json();
    if (!data.success) {
      console.error('Game Master: AI API Error:', data.error);
      return null;
    }

    console.log('Game Master: NEAR AI Response:', data.response);

    // Parse the AI response to extract moves
    try {
      const aiResponse = JSON.parse(data.response);
      
      // Handle multiple possible AI response formats
      let agent1Move: string | undefined;
      let agent2Move: string | undefined;
      
      if (aiResponse.agent_1?.move && aiResponse.agent_2?.move) {
        agent1Move = aiResponse.agent_1.move;
        agent2Move = aiResponse.agent_2.move;
      } else if (aiResponse.agent_1_move && aiResponse.agent_2_move) {
        agent1Move = aiResponse.agent_1_move;
        agent2Move = aiResponse.agent_2_move;
      } else if (aiResponse.moves?.agent_1 && aiResponse.moves?.agent_2) {
        agent1Move = aiResponse.moves.agent_1;
        agent2Move = aiResponse.moves.agent_2;
      } else if (typeof aiResponse.agent_1 === 'string' && typeof aiResponse.agent_2 === 'string') {
        agent1Move = aiResponse.agent_1;
        agent2Move = aiResponse.agent_2;
      } else if (aiResponse['agent_1.Move'] && aiResponse['agent_2.Move']) {
        agent1Move = aiResponse['agent_1.Move'];
        agent2Move = aiResponse['agent_2.Move'];
      } else if (aiResponse.agent_moves && aiResponse.agent_moves.agent_1 && aiResponse.agent_moves.agent_2) {
        agent1Move = aiResponse.agent_moves.agent_1;
        agent2Move = aiResponse.agent_moves.agent_2;
      }
      
      if (agent1Move && agent2Move) {
        return {
          agent_1: { move: agent1Move },
          agent_2: { move: agent2Move }
        };
      } else {
        console.error('Game Master: Invalid AI response format');
        return null;
      }
    } catch (parseError) {
      console.error('Game Master: Failed to parse AI response:', parseError);
      return null;
    }
  } catch (error) {  
    console.error('Game Master: Failed to generate AI moves:', error);
    return null;
  }
}

async function executeNextRound(arenaAddress: string): Promise<boolean> {
  try {
    console.log(`Game Master: Executing next round for arena ${arenaAddress}`);
    
    // Generate AI moves
    const moves = await generateAIMoves(arenaAddress);
    if (!moves) {
      console.error('Game Master: Failed to generate AI moves');
      return false;
    }

    console.log(`Game Master: AI selected moves - Agent 1: ${moves.agent_1.move}, Agent 2: ${moves.agent_2.move}`);

    // Map move names to contract enum values
    const moveMapping: { [key: string]: number } = {
      'strike': 0,
      'taunt': 1, 
      'dodge': 2,
      'special_move': 3,
      'special': 3, // Handle both special_move and special
      'recover': 4
    };

    const yodhaOneMove = moveMapping[moves.agent_1.move.toLowerCase()] ?? 0;
    const yodhaTwoMove = moveMapping[moves.agent_2.move.toLowerCase()] ?? 0;

    // Create signature for the battle moves (this would normally be done by NEAR AI agent)
    // For automation, we'll use the game master's signature
    // The contract expects: keccak256(abi.encodePacked(_yodhaOneMove, _yodhaTwoMove))
    // followed by MessageHashUtils.toEthSignedMessageHash()
    
    const { encodePacked, keccak256, toHex } = await import('viem');
    
    // Encode the moves as the contract expects: abi.encodePacked(uint8, uint8)
    const encodedMoves = encodePacked(['uint8', 'uint8'], [yodhaOneMove, yodhaTwoMove]);
    
    // Create the keccak256 hash
    const dataHash = keccak256(encodedMoves);
    
    // The contract uses MessageHashUtils.toEthSignedMessageHash() which prefixes with "\x19Ethereum Signed Message:\n32"
    const ethSignedMessageHash = keccak256(
      encodePacked(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', dataHash])
    );
    
    // Sign the Ethereum signed message hash
    const signature = await gameMasterAccount.signMessage({
      message: { raw: ethSignedMessageHash }
    });

    console.log(`Game Master: Executing battle with moves ${yodhaOneMove} vs ${yodhaTwoMove}`);
    
    const hash = await walletClient.writeContract({
      address: arenaAddress as `0x${string}`,
      abi: KurukshetraAbi,
      functionName: 'battle',
      args: [yodhaOneMove, yodhaTwoMove, signature as `0x${string}`]
    });

    console.log(`Game Master: Battle transaction sent: ${hash}`);
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60000 // 60 second timeout
    });
    
    console.log(`Game Master: Next round executed successfully for arena ${arenaAddress}`);
    return receipt.status === 'success';
  } catch (error) {
    console.error(`Game Master: Failed to execute next round for arena ${arenaAddress}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, arenaAddresses } = body;

    if (!action || !arenaAddresses || !Array.isArray(arenaAddresses)) {
      return NextResponse.json(
        { error: 'Missing action or arenaAddresses array' },
        { status: 400 }
      );
    }

    const results: { [key: string]: any } = {};

    for (const arenaAddress of arenaAddresses) {
      console.log(`Game Master: Processing ${action} for arena ${arenaAddress}`);
      
      const arenaState = await getArenaState(arenaAddress);
      if (!arenaState) {
        results[arenaAddress] = { success: false, error: 'Failed to get arena state' };
        continue;
      }

      const currentTime = Math.floor(Date.now() / 1000);

      if (action === 'checkAndStartGames') {
        // Check if betting period is over and there are bets on both sides
        const bettingEndTime = arenaState.gameInitializedAt + arenaState.minBettingPeriod;
        const shouldStartGame = arenaState.isInitialized && 
                               arenaState.isBettingPeriod && 
                               currentTime >= bettingEndTime &&
                               arenaState.playerOneBetAddresses.length > 0 &&
                               arenaState.playerTwoBetAddresses.length > 0;

        if (shouldStartGame) {
          console.log(`Game Master: Starting game for arena ${arenaAddress} - betting period ended`);
          const success = await startGame(arenaAddress);
          results[arenaAddress] = { success, action: 'started', bettingEndTime, currentTime };
        } else {
          results[arenaAddress] = { 
            success: true, 
            action: 'no_action_needed',
            reason: !arenaState.isInitialized ? 'not_initialized' :
                   !arenaState.isBettingPeriod ? 'not_in_betting_period' :
                   currentTime < bettingEndTime ? 'betting_period_ongoing' :
                   arenaState.playerOneBetAddresses.length === 0 ? 'no_bets_yodha_one' :
                   arenaState.playerTwoBetAddresses.length === 0 ? 'no_bets_yodha_two' : 'unknown',
            bettingEndTime,
            currentTime
          };
        }
      } else if (action === 'checkAndExecuteRounds') {
        // Check if it's time for next round
        const roundEndTime = arenaState.lastRoundEndedAt + arenaState.minBattleRoundsInterval;
        const shouldExecuteRound = arenaState.isInitialized && 
                                  !arenaState.isBettingPeriod &&
                                  arenaState.currentRound > 0 && 
                                  arenaState.currentRound < 6 && // Game has max 5 rounds
                                  currentTime >= roundEndTime;

        if (shouldExecuteRound) {
          console.log(`Game Master: Executing next round for arena ${arenaAddress} - round interval passed`);
          const success = await executeNextRound(arenaAddress);
          results[arenaAddress] = { success, action: 'executed_round', roundEndTime, currentTime, round: arenaState.currentRound };
        } else {
          results[arenaAddress] = { 
            success: true, 
            action: 'no_action_needed',
            reason: !arenaState.isInitialized ? 'not_initialized' :
                   arenaState.isBettingPeriod ? 'in_betting_period' :
                   arenaState.currentRound === 0 ? 'game_not_started' :
                   arenaState.currentRound >= 6 ? 'game_finished' :
                   currentTime < roundEndTime ? 'round_interval_ongoing' : 'unknown',
            roundEndTime,
            currentTime,
            round: arenaState.currentRound
          };
        }
      } else {
        results[arenaAddress] = { success: false, error: 'Invalid action' };
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error('Game Master API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
