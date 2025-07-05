#!/usr/bin/env ts-node

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Official 0G providers
const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

// Test configuration
const FIXED_PROMPT = `Return ONLY the JSON object. No additional text, explanations, or sentences. Only pure JSON in this exact format: {"name": "Full Name", "bio": "Brief biography in one sentence", "life_history": "0: First major life event in one sentence. 1: Second major life event in one sentence. 2: Third major life event in one sentence. 3: Fourth major life event in one sentence. 4: Fifth major life event in one sentence", "personality": ["Trait1", "Trait2", "Trait3", "Trait4", "Trait5"], "knowledge_areas": ["Area1", "Area2", "Area3", "Area4", "Area5"]}`;

// Function to create query with user input
function createQuery(userInput: string): string {
  return `<${userInput}> ${FIXED_PROMPT}`;
}

// New exported function for Warriors Minter integration
export async function generateWarriorAttributes(userInput: string): Promise<string> {
  console.log("🚀 Generating warrior attributes with 0G AI");
  console.log(`💬 User Input: "${userInput}"`);
  
  try {
    // Step 1: Initialize wallet and provider
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is required in .env file');
    }
    
    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Step 2: Create broker instance
    const broker = await createZGComputeNetworkBroker(wallet);
    
    // Step 3: Check/Setup ledger account
    try {
      await broker.ledger.getLedger();
    } catch (error) {
      console.log("⚠️  Ledger account does not exist, creating...");
      await broker.ledger.addLedger(0.1);
    }
    
    // Step 4: Select provider and acknowledge
    const selectedProvider = OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"];
    
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider);
    } catch (error: any) {
      if (!error.message.includes('already acknowledged')) {
        throw error;
      }
    }
    
    // Step 5: Get service metadata
    const { endpoint, model } = await broker.inference.getServiceMetadata(selectedProvider);
    
    // Step 6: Generate authentication headers
    const query = createQuery(userInput);
    const headers = await broker.inference.getRequestHeaders(selectedProvider, query);
    
    // Step 7: Send query to AI service
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "", // Empty string as per 0G docs
    });
    
    // Prepare headers for OpenAI client
    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
    });
    
    // Send the query
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "user", content: query }],
        model: model,
      },
      {
        headers: requestHeaders,
      }
    );
    
    const aiResponse = completion.choices[0].message.content;
    const chatId = completion.id;
    
    console.log("✅ AI query completed successfully");
    console.log(`🆔 Chat ID: ${chatId}`);
    
    // Step 8: Process response and handle payment
    try {
      await broker.inference.processResponse(
        selectedProvider,
        aiResponse || "",
        chatId
      );
    } catch (paymentError: any) {
      console.log("⚠️  Payment processing failed, but continuing...");
    }
    
    // Validate and return the response
    const trimmedResponse = (aiResponse || "").trim();
    const isPureJSON = trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}');
    
    if (!isPureJSON) {
      console.log("⚠️  Response is not pure JSON format, attempting to extract JSON...");
      // Try to extract JSON from the response
      const jsonMatch = trimmedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0];
        console.log("✅ Extracted JSON from response");
        return extractedJson;
      }
    }
    
    // Validate JSON structure
    try {
      const parsedResponse = JSON.parse(trimmedResponse);
      const requiredFields = ['name', 'bio', 'life_history', 'personality', 'knowledge_areas'];
      const missingFields = requiredFields.filter(field => !parsedResponse.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log("✅ Response contains all required JSON fields");
        return trimmedResponse;
      } else {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
    } catch (jsonError) {
      console.log("❌ Response is not valid JSON format");
      throw new Error(`Invalid JSON response: ${jsonError}`);
    }
    
  } catch (error: any) {
    console.error("❌ Failed to generate warrior attributes:", error.message);
    throw error;
  }
}

// Function to create traits and moves query with personality attributes
function createTraitsAndMovesQuery(personalityAttributes: any): string {
  const basePrompt = `Generate combat traits and moves for a warrior based on their personality attributes. 

PERSONALITY ATTRIBUTES:
Name: ${personalityAttributes.name}
Bio: ${personalityAttributes.bio}
Life History: ${personalityAttributes.life_history}
Personality Traits: ${Array.isArray(personalityAttributes.personality) ? personalityAttributes.personality.join(', ') : personalityAttributes.personality}
Knowledge Areas: ${Array.isArray(personalityAttributes.knowledge_areas) ? personalityAttributes.knowledge_areas.join(', ') : personalityAttributes.knowledge_areas}

REQUIREMENTS:
1. Generate trait values between 0-10000 based on the personality
2. Create move names that are catchy, fitting the personality, and  dark humor
3. Return ONLY the JSON object. No additional text, explanations, or sentences. Only pure JSON.
4. DO NOT include any markdown code blocks, backticks, or extra formatting.
5. DO NOT include any explanatory text before or after the JSON.

EXACT OUTPUT FORMAT REQUIRED:
{"Strength": 8241, "Wit": 5921, "Charisma": 7392, "Defence": 3519, "Luck": 4678, "strike_attack": "Galactic Smash", "taunt_attack": "Rocket Science", "dodge": "Tesla Tango", "recover": "Mars Recharge", "special_move": "PayPal Payload"}

CRITICAL: Return ONLY the JSON object. NO other text, explanations, or formatting.`;

  return basePrompt;
}

// New exported function for generating warrior traits and moves
export async function generateWarriorTraitsAndMoves(personalityAttributes: any): Promise<string> {
  console.log("🚀 Generating warrior traits and moves with 0G AI");
  console.log(`💬 Personality Attributes:`, personalityAttributes);
  
  try {
    // Step 1: Initialize wallet and provider
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is required in .env file');
    }
    
    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Step 2: Create broker instance
    const broker = await createZGComputeNetworkBroker(wallet);
    
    // Step 3: Check/Setup ledger account
    try {
      await broker.ledger.getLedger();
    } catch (error) {
      console.log("⚠️  Ledger account does not exist, creating...");
      await broker.ledger.addLedger(0.1);
    }
    
    // Step 4: Select provider and acknowledge
    const selectedProvider = OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"];
    
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider);
    } catch (error: any) {
      if (!error.message.includes('already acknowledged')) {
        throw error;
      }
    }
    
    // Step 5: Get service metadata
    const { endpoint, model } = await broker.inference.getServiceMetadata(selectedProvider);
    
    // Step 6: Generate authentication headers
    const query = createTraitsAndMovesQuery(personalityAttributes);
    const headers = await broker.inference.getRequestHeaders(selectedProvider, query);
    
    // Step 7: Send query to AI service
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "", // Empty string as per 0G docs
    });
    
    // Prepare headers for OpenAI client
    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
    });
    
    // Send the query
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "user", content: query }],
        model: model,
      },
      {
        headers: requestHeaders,
      }
    );
    
    const aiResponse = completion.choices[0].message.content;
    const chatId = completion.id;
    
    console.log("✅ AI query completed successfully");
    console.log(`🆔 Chat ID: ${chatId}`);
    
    // Step 8: Process response and handle payment
    try {
      await broker.inference.processResponse(
        selectedProvider,
        aiResponse || "",
        chatId
      );
    } catch (paymentError: any) {
      console.log("⚠️  Payment processing failed, but continuing...");
    }
    
    // Validate and return the response
    const trimmedResponse = (aiResponse || "").trim();
    const isPureJSON = trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}');
    
    if (!isPureJSON) {
      console.log("⚠️  Response is not pure JSON format, attempting to extract JSON...");
      // Try to extract JSON from the response
      const jsonMatch = trimmedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0];
        console.log("✅ Extracted JSON from response");
        return extractedJson;
      }
    }
    
    // Validate JSON structure for traits and moves
    try {
      const parsedResponse = JSON.parse(trimmedResponse);
      const requiredFields = ['Strength', 'Wit', 'Charisma', 'Defence', 'Luck', 'strike_attack', 'taunt_attack', 'dodge', 'recover', 'special_move'];
      const missingFields = requiredFields.filter(field => !parsedResponse.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log("✅ Response contains all required JSON fields for traits and moves");
        
        // Validate trait values are within range
        const traits = ['Strength', 'Wit', 'Charisma', 'Defence', 'Luck'];
        const invalidTraits = traits.filter(trait => {
          const value = parsedResponse[trait];
          return typeof value !== 'number' || value < 0 || value > 10000;
        });
        
        if (invalidTraits.length === 0) {
          console.log("✅ All trait values are within valid range (0-10000)");
          return trimmedResponse;
        } else {
          throw new Error(`Invalid trait values for: ${invalidTraits.join(', ')} (must be 0-10000)`);
        }
      } else {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
    } catch (jsonError) {
      console.log("❌ Response is not valid JSON format");
      throw new Error(`Invalid JSON response: ${jsonError}`);
    }
    
  } catch (error: any) {
    console.error("❌ Failed to generate warrior traits and moves:", error.message);
    throw error;
  }
}

// Default user input - change this to test different subjects
const USER_INPUT = "Albert Einstein";
const TEST_QUERY = createQuery(USER_INPUT);
const FALLBACK_FEE = 0.01;
const INITIAL_FUND_AMOUNT = 0.1; // 0.1 OG tokens

async function testComputeFlow() {
  console.log("🚀 Starting 0G Compute Network Flow Demo");
  console.log("=" .repeat(50));

  // Declare variables for JSON validation at function scope
  let aiResponse: string | null = null;
  let trimmedResponse: string = "";
  let isPureJSON: boolean = false;
  let jsonValid: boolean = false;
  let personName: string = "Unknown";
  let traitCount: number = 0;
  let knowledgeCount: number = 0;
  let cost: number = 0;

  try {
    // Step 1: Initialize wallet and provider
    console.log("\n📋 Step 1: Initialize Wallet and Provider");
    console.log("-".repeat(30));
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is required in .env file');
    }
    
    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`✅ Wallet Address: ${wallet.address}`);
    console.log(`✅ RPC URL: https://evmrpc-testnet.0g.ai`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet ETH Balance: ${ethers.formatEther(balance)} ETH`);

    // Step 2: Create broker instance
    console.log("\n📋 Step 2: Create 0G Compute Broker");
    console.log("-".repeat(30));
    
    console.log("⏳ Creating ZG Compute Network Broker...");
    const broker = await createZGComputeNetworkBroker(wallet);
    console.log("✅ Broker created successfully");

    // Step 3: Check/Setup ledger account
    console.log("\n📋 Step 3: Check/Setup Ledger Account");
    console.log("-".repeat(30));
    
    let ledgerInfo;
    try {
      ledgerInfo = await broker.ledger.getLedger();
      console.log("✅ Ledger account exists");
      console.log(ledgerInfo);
    } catch (error) {
      console.log("⚠️  Ledger account does not exist, creating...");
      await broker.ledger.addLedger(0.1);
      console.log(`✅ Ledger created with ${INITIAL_FUND_AMOUNT} OG tokens`);
      
      // Get updated balance
      ledgerInfo = await broker.ledger.getLedger();
      console.log(ledgerInfo);
    }

    // Step 4: List available services
    console.log("\n📋 Step 4: List Available Services");
    console.log("-".repeat(30));
    
    console.log("⏳ Fetching available services...");
    const services = await broker.inference.listService();
    console.log(`✅ Found ${services.length} available services`);
    
    services.forEach((service: any, index: number) => {
      const modelName = Object.entries(OFFICIAL_PROVIDERS).find(([_, addr]) => addr === service.provider)?.[0] || 'Unknown';
      console.log(`\n🤖 Service ${index + 1}:`);
      console.log(`   Model: ${modelName}`);
      console.log(`   Provider: ${service.provider}`);
      console.log(`   Service Type: ${service.serviceType}`);
      console.log(`   URL: ${service.url}`);
      console.log(`   Input Price: ${ethers.formatEther(service.inputPrice || 0)} OG`);
      console.log(`   Output Price: ${ethers.formatEther(service.outputPrice || 0)} OG`);
      console.log(`   Verifiability: ${service.verifiability || 'None'}`);
    });

    // Step 5: Select provider and acknowledge
    // Note: This step is only required for the first time you use a provider. No need to run it again.
    console.log("\n📋 Step 5: Select Provider and Acknowledge");
    console.log("-".repeat(30));
    
    // Use the first official provider (llama-3.3-70b-instruct)
    const selectedProvider = OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"];
    console.log(`🎯 Selected Provider: ${selectedProvider} (llama-3.3-70b-instruct)`);
    
    console.log("⏳ Acknowledging provider...");
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider);
      console.log("✅ Provider acknowledged successfully");
    } catch (error: any) {
      if (error.message.includes('already acknowledged')) {
        console.log("✅ Provider already acknowledged");
      } else {
        throw error;
      }
    }

    // Step 6: Get service metadata
    console.log("\n📋 Step 6: Get Service Metadata");
    console.log("-".repeat(30));
    
    console.log("⏳ Fetching service metadata...");
    const { endpoint, model } = await broker.inference.getServiceMetadata(selectedProvider);
    console.log(`✅ Service Endpoint: ${endpoint}`);
    console.log(`✅ Model Name: ${model}`);

    // Step 7: Generate authentication headers
    console.log("\n📋 Step 7: Generate Authentication Headers");
    console.log("-".repeat(30));
    
    console.log("⏳ Generating authentication headers...");
    const headers = await broker.inference.getRequestHeaders(selectedProvider, TEST_QUERY);
    console.log("✅ Authentication headers generated (single-use)");
    console.log(`📝 Headers keys: ${Object.keys(headers).join(', ')}`);

    // Step 8: Send query to AI service
    console.log("\n📋 Step 8: Send Query to AI Service");
    console.log("-".repeat(30));
    
    console.log(`💬 Query: "${TEST_QUERY}"`);
    console.log("⏳ Creating OpenAI client and sending request...");
    
    // Create OpenAI client with service endpoint
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "", // Empty string as per 0G docs
    });
    
    // Prepare headers for OpenAI client
    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
    });
    
    // Send the query
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "user", content: TEST_QUERY }],
        model: model,
      },
      {
        headers: requestHeaders,
      }
    );
    
    aiResponse = completion.choices[0].message.content;
    const chatId = completion.id;
    
    console.log("✅ AI query completed successfully");
    console.log(`🆔 Chat ID: ${chatId}`);
    
    // Display raw response with proper formatting
    console.log("\n📄 Raw AI Response:");
    console.log("-".repeat(50));
    try {
      const parsedForFormatting = JSON.parse(aiResponse || "{}");
      console.log(JSON.stringify(parsedForFormatting, null, 2));
    } catch (e) {
      console.log(aiResponse);
    }

    // Validate JSON response format
    console.log("\n🔍 Validating JSON Response Format");
    console.log("-".repeat(30));
    
    // Check if response is pure JSON (starts with { and ends with })
    trimmedResponse = (aiResponse || "").trim();
    isPureJSON = trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}');
    
    if (!isPureJSON) {
      console.log("❌ Response is not pure JSON format");
      console.log("⚠️  Response contains additional text outside JSON");
      console.log(`Response starts with: "${trimmedResponse.substring(0, 50)}..."`);
      console.log(`Response ends with: "...${trimmedResponse.substring(trimmedResponse.length - 50)}"`);
    } else {
      console.log("✅ Response appears to be pure JSON format");
    }
    
    try {
      const parsedResponse = JSON.parse(trimmedResponse);
      const requiredFields = ['name', 'bio', 'life_history', 'personality', 'knowledge_areas'];
      const missingFields = requiredFields.filter(field => !parsedResponse.hasOwnProperty(field));
      
      jsonValid = missingFields.length === 0;
      if (jsonValid) {
        personName = parsedResponse.name || "Unknown";
        traitCount = parsedResponse.personality?.length || 0;
        knowledgeCount = parsedResponse.knowledge_areas?.length || 0;
        
        console.log("✅ Response contains all required JSON fields");
        console.log("✅ JSON format validation passed");
        
        // Display formatted response with proper structure
        console.log("\n📋 Structured Response Details:");
        console.log("=".repeat(50));
        console.log(`📝 Name:`);
        console.log(`   ${parsedResponse.name}`);
        console.log(`\n📖 Biography:`);
        console.log(`   ${parsedResponse.bio}`);
        console.log(`\n📚 Life History:`);
        console.log(`   ${parsedResponse.life_history}`);
        console.log(`\n🎭 Personality Traits:`);
        parsedResponse.personality?.forEach((trait: string, index: number) => {
          console.log(`   ${index + 1}. ${trait}`);
        });
        console.log(`\n🧠 Knowledge Areas:`);
        parsedResponse.knowledge_areas?.forEach((area: string, index: number) => {
          console.log(`   ${index + 1}. ${area}`);
        });
        console.log("=".repeat(50));
      } else {
        console.log(`⚠️  Missing required fields: ${missingFields.join(', ')}`);
        console.log("❌ JSON format validation failed");
      }
    } catch (jsonError) {
      console.log("❌ Response is not valid JSON format");
      console.log(`JSON Parse Error: ${jsonError}`);
      console.log("⚠️  AI did not return response in requested JSON format");
    }

    // Step 9: Process response and handle payment
    console.log("\n📋 Step 9: Process Response and Handle Payment");
    console.log("-".repeat(30));
    
    console.log("⏳ Processing response and verifying payment...");
    try {
      const isValid = await broker.inference.processResponse(
        selectedProvider,
        aiResponse || "",
        chatId
      );
      
      console.log("✅ Response processed successfully");
      console.log(`🔍 Verification Status: ${isValid ? 'Valid' : 'Invalid'}`);
      
      if (isValid) {
        console.log("✅ Payment processed automatically");
      }
      
    } catch (paymentError: any) {
      console.log("⚠️  Payment processing failed, attempting fallback...");
      console.log(`❌ Payment Error: ${paymentError.message}`);
    }

    // Step 10: Check final ledger balance
    console.log("\n📋 Step 10: Check Final Balance");
    console.log("-".repeat(30));
    
    const finalBalance = await broker.ledger.getLedger();
    console.log(finalBalance);
    
    // Calculate approximate cost
    // ledgerInfo structure: { ledgerInfo: [balance, ...], infers: [...], fines: [...] }
    const initialBalanceNum = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
    const finalBalanceNum = parseFloat(ethers.formatEther(finalBalance.ledgerInfo[0]));
    cost = initialBalanceNum - finalBalanceNum;
    
    if (cost > 0) {
      console.log(`💸 Approximate Query Cost: ${cost.toFixed(6)} OG`);
    }

    // Step 11: Summary
    console.log("\n📋 Step 11: Demo Summary");
    console.log("=".repeat(60));
    
    console.log("✅ 0G Compute Network flow completed successfully!");
    console.log("\n📊 Execution Summary:");
    console.log("-".repeat(40));
    console.log(`   🔗 Provider: llama-3.3-70b-instruct`);
    console.log(`   📝 Query Type: JSON-formatted person profile request`);
    console.log(`   👤 Subject: ${USER_INPUT}`);
    console.log(`   🔍 Verification: TEE-based (TeeML)`);
    console.log(`   💰 Payment: Automatic micropayment`);
    
    console.log(`\n📋 Response Analysis:`);
    console.log("-".repeat(40));
    console.log(`   🔍 Pure JSON Format: ${isPureJSON ? 'Valid ✓' : 'Invalid ✗'}`);
    console.log(`   ✅ JSON Structure: ${jsonValid ? 'Valid ✓' : 'Invalid ✗'}`);
    console.log(`   👤 Person: ${personName}`);
    console.log(`   🎭 Personality Traits: ${traitCount} traits`);
    console.log(`   🧠 Knowledge Areas: ${knowledgeCount} areas`);
    console.log(`   💸 Query Cost: ${cost > 0 ? cost.toFixed(6) + ' OG' : 'Calculating...'}`);
    
    if (!isPureJSON) {
      console.log(`\n⚠️  Note: AI response contained additional text outside JSON`);
      console.log(`   This violates the "pure JSON only" requirement`);
    }

    console.log("\n🎉 Demo completed successfully!");
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Demo failed with error:");
    console.error(`Error: ${error.message}`);
    console.error("\nFull error details:");
    console.error(error);
    
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Ensure PRIVATE_KEY is set in .env file");
    console.log("2. Ensure wallet has sufficient testnet ETH");
    console.log("3. Check network connectivity");
    console.log("4. Verify 0G testnet is accessible");
    
    process.exit(1);
  }
}

// Helper function to format console output
function formatSection(title: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🔷 ${title}`);
  console.log(`${"=".repeat(50)}`);
}

// Run the test
if (require.main === module) {
  testComputeFlow()
    .then(() => {
      console.log("\n✨ Script execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}

export { testComputeFlow };