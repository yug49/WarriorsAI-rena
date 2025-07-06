#!/usr/bin/env ts-node

import { generateBattleMoves } from './demo-compute-flow';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test scenarios with extreme cases
const testScenarios = [
  {
    name: "🔥 EXTREME DAMAGE - Agent 1 Nearly Dead",
    battlePrompt: {
      current_round: 4,
      agent_1: {
        personality: {
          adjectives: ["Strategic", "Cautious", "Defensive", "Analytical", "Prudent"],
          knowledge_areas: ["Survival tactics", "Risk assessment", "Damage control", "Recovery methods", "Defensive strategies"]
        },
        traits: {
          Strength: 5000,
          Wit: 8000,
          Charisma: 9000,
          Defence: 8500,
          Luck: 4000
        },
        total_damage_received: 85 // Nearly dead!
      },
      agent_2: {
        personality: {
          adjectives: ["Aggressive", "Relentless", "Dominant", "Fierce", "Unstoppable"],
          knowledge_areas: ["Combat tactics", "Finishing moves", "Aggressive strategies", "Power strikes", "Dominance"]
        },
        traits: {
          Strength: 9500,
          Wit: 6000,
          Charisma: 7000,
          Defence: 5500,
          Luck: 8000
        },
        total_damage_received: 15 // Healthy and aggressive
      },
      moveset: ["strike", "taunt", "dodge", "recover", "special_move"]
    },
    expectedBehavior: "Agent 1 should likely RECOVER (high damage) or DODGE (survival). Agent 2 should be aggressive with STRIKE or SPECIAL_MOVE."
  },

  {
    name: "⚡ EXTREME STRENGTH vs EXTREME DEFENSE",
    battlePrompt: {
      current_round: 2,
      agent_1: {
        personality: {
          adjectives: ["Brutal", "Overwhelming", "Destructive", "Savage", "Ruthless"],
          knowledge_areas: ["Raw power", "Crushing attacks", "Brute force", "Overwhelming strength", "Destruction"]
        },
        traits: {
          Strength: 9900, // Maximum strength
          Wit: 3000,
          Charisma: 2000,
          Defence: 2500,
          Luck: 3000
        },
        total_damage_received: 20
      },
      agent_2: {
        personality: {
          adjectives: ["Defensive", "Resilient", "Protective", "Enduring", "Stalwart"],
          knowledge_areas: ["Defense tactics", "Damage mitigation", "Protective strategies", "Endurance", "Survival"]
        },
        traits: {
          Strength: 3000,
          Wit: 7000,
          Charisma: 6000,
          Defence: 9800, // Maximum defense
          Luck: 5000
        },
        total_damage_received: 30
      },
      moveset: ["strike", "taunt", "dodge", "recover", "special_move"]
    },
    expectedBehavior: "Agent 1 should use STRIKE or SPECIAL_MOVE (high strength). Agent 2 should use DODGE (high defense) or RECOVER."
  },

  {
    name: "🧠 EXTREME WIT vs EXTREME CHARISMA",
    battlePrompt: {
      current_round: 3,
      agent_1: {
        personality: {
          adjectives: ["Cunning", "Calculating", "Manipulative", "Scheming", "Tactical"],
          knowledge_areas: ["Psychology", "Mind games", "Strategic planning", "Manipulation", "Tactical analysis"]
        },
        traits: {
          Strength: 4000,
          Wit: 9950, // Maximum wit
          Charisma: 3000,
          Defence: 5000,
          Luck: 4000
        },
        total_damage_received: 25
      },
      agent_2: {
        personality: {
          adjectives: ["Charismatic", "Inspiring", "Influential", "Persuasive", "Commanding"],
          knowledge_areas: ["Leadership", "Influence", "Persuasion", "Inspiration", "Social dynamics"]
        },
        traits: {
          Strength: 4500,
          Wit: 3500,
          Charisma: 9900, // Maximum charisma
          Defence: 6000,
          Luck: 5000
        },
        total_damage_received: 35
      },
      moveset: ["strike", "taunt", "dodge", "recover", "special_move"]
    },
    expectedBehavior: "Both should likely use TAUNT (wit/charisma based) to gain influence/defluence effects."
  },

  {
    name: "🎰 EXTREME LUCK vs BALANCED WARRIOR",
    battlePrompt: {
      current_round: 1,
      agent_1: {
        personality: {
          adjectives: ["Lucky", "Fortunate", "Blessed", "Serendipitous", "Favored"],
          knowledge_areas: ["Probability", "Chance", "Fortune", "Luck manipulation", "Serendipity"]
        },
        traits: {
          Strength: 5000,
          Wit: 5000,
          Charisma: 5000,
          Defence: 5000,
          Luck: 9999 // Maximum luck
        },
        total_damage_received: 10
      },
      agent_2: {
        personality: {
          adjectives: ["Balanced", "Versatile", "Adaptable", "Well-rounded", "Flexible"],
          knowledge_areas: ["All-around combat", "Adaptability", "Versatility", "Balance", "Multi-skilled"]
        },
        traits: {
          Strength: 7000,
          Wit: 7000,
          Charisma: 7000,
          Defence: 7000,
          Luck: 7000
        },
        total_damage_received: 12
      },
      moveset: ["strike", "taunt", "dodge", "recover", "special_move"]
    },
    expectedBehavior: "Agent 1 might risk SPECIAL_MOVE (luck-based). Agent 2 should use balanced approach."
  },

  {
    name: "🔥 FINAL ROUND - BOTH HEAVILY DAMAGED",
    battlePrompt: {
      current_round: 5,
      agent_1: {
        personality: {
          adjectives: ["Desperate", "Determined", "Resilient", "Stubborn", "Persistent"],
          knowledge_areas: ["Last stands", "Desperation tactics", "Final pushes", "Endurance", "Determination"]
        },
        traits: {
          Strength: 8000,
          Wit: 6000,
          Charisma: 8500,
          Defence: 7000,
          Luck: 5000
        },
        total_damage_received: 78 // Very damaged
      },
      agent_2: {
        personality: {
          adjectives: ["Wounded", "Fierce", "Cornered", "Dangerous", "Desperate"],
          knowledge_areas: ["Survival instincts", "Desperation moves", "Last resort tactics", "Wounded animal", "Final gambit"]
        },
        traits: {
          Strength: 7500,
          Wit: 7000,
          Charisma: 6000,
          Defence: 8000,
          Luck: 6500
        },
        total_damage_received: 82 // Also very damaged
      },
      moveset: ["strike", "taunt", "dodge", "recover", "special_move"]
    },
    expectedBehavior: "Both should either RECOVER (heal) or go all-in with SPECIAL_MOVE for a final gambit."
  },

  {
    name: "🏃 EARLY ROUND - FRESH WARRIORS",
    battlePrompt: {
      current_round: 1,
      agent_1: {
        personality: {
          adjectives: ["Fresh", "Eager", "Ambitious", "Confident", "Ready"],
          knowledge_areas: ["Opening strategies", "First impressions", "Early game tactics", "Momentum building", "Initiative"]
        },
        traits: {
          Strength: 7500,
          Wit: 8000,
          Charisma: 7000,
          Defence: 6500,
          Luck: 7000
        },
        total_damage_received: 0 // No damage
      },
      agent_2: {
        personality: {
          adjectives: ["Cautious", "Observant", "Patient", "Calculating", "Methodical"],
          knowledge_areas: ["Observation", "Patience", "Methodical planning", "Cautious approach", "Analysis"]
        },
        traits: {
          Strength: 6000,
          Wit: 9000,
          Charisma: 6500,
          Defence: 8500,
          Luck: 6000
        },
        total_damage_received: 0 // No damage
      },
      moveset: ["strike", "taunt", "dodge", "recover", "special_move"]
    },
    expectedBehavior: "Agent 1 might be aggressive with STRIKE. Agent 2 might be cautious with TAUNT or DODGE."
  }
];

async function runBattleAITests() {
  console.log("🧪 TESTING 0G AI BATTLE MOVE GENERATION");
  console.log("=" .repeat(80));
  console.log("Testing with extreme scenarios to verify AI intelligence vs randomness\n");

  const results: any[] = [];

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${scenario.name}`);
    console.log("-" .repeat(60));
    console.log(`Expected: ${scenario.expectedBehavior}`);
    console.log(`\nAgent 1 - Damage: ${scenario.battlePrompt.agent_1.total_damage_received}, Traits: Str:${scenario.battlePrompt.agent_1.traits.Strength} Wit:${scenario.battlePrompt.agent_1.traits.Wit} Cha:${scenario.battlePrompt.agent_1.traits.Charisma} Def:${scenario.battlePrompt.agent_1.traits.Defence} Luck:${scenario.battlePrompt.agent_1.traits.Luck}`);
    console.log(`Agent 2 - Damage: ${scenario.battlePrompt.agent_2.total_damage_received}, Traits: Str:${scenario.battlePrompt.agent_2.traits.Strength} Wit:${scenario.battlePrompt.agent_2.traits.Wit} Cha:${scenario.battlePrompt.agent_2.traits.Charisma} Def:${scenario.battlePrompt.agent_2.traits.Defence} Luck:${scenario.battlePrompt.agent_2.traits.Luck}`);

    try {
      console.log("\n⏳ Calling 0G AI...");
      const startTime = Date.now();
      
      // Run the test 3 times to check for consistency vs randomness
      const runs = [];
      for (let run = 1; run <= 3; run++) {
        console.log(`\n🔄 Run ${run}/3:`);
        const response = await generateBattleMoves(scenario.battlePrompt);
        const moves = JSON.parse(response);
        
        console.log(`   Agent 1: ${moves.agent_1.toUpperCase()}`);
        console.log(`   Agent 2: ${moves.agent_2.toUpperCase()}`);
        
        runs.push(moves);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Analyze consistency and intelligence
      const agent1Moves = runs.map(r => r.agent_1);
      const agent2Moves = runs.map(r => r.agent_2);
      
      const agent1Consistency = new Set(agent1Moves).size === 1;
      const agent2Consistency = new Set(agent2Moves).size === 1;
      
      console.log(`\n📊 Analysis:`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Agent 1 Consistency: ${agent1Consistency ? '✅ CONSISTENT' : '⚠️  VARIES'} (${agent1Moves.join(', ')})`);
      console.log(`   Agent 2 Consistency: ${agent2Consistency ? '✅ CONSISTENT' : '⚠️  VARIES'} (${agent2Moves.join(', ')})`);
      
      // Intelligence analysis
      const intelligenceScore = analyzeIntelligence(runs[0], scenario.battlePrompt);
      console.log(`   Intelligence Score: ${intelligenceScore.score}/10`);
      console.log(`   Reasoning: ${intelligenceScore.reasoning}`);
      
      results.push({
        scenario: scenario.name,
        runs: runs,
        consistency: { agent1: agent1Consistency, agent2: agent2Consistency },
        intelligence: intelligenceScore,
        duration: duration
      });
      
    } catch (error) {
      console.error(`❌ Error in ${scenario.name}:`, error);
      results.push({
        scenario: scenario.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Wait between tests to avoid rate limiting
    if (i < testScenarios.length - 1) {
      console.log("\n⏸️  Waiting 2 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final analysis
  console.log("\n\n📈 FINAL ANALYSIS");
  console.log("=" .repeat(80));
  
  const successfulTests = results.filter(r => !r.error);
  const avgIntelligence = successfulTests.reduce((sum, r) => sum + r.intelligence.score, 0) / successfulTests.length;
  const consistencyRate = successfulTests.reduce((sum, r) => sum + (r.consistency.agent1 && r.consistency.agent2 ? 1 : 0), 0) / successfulTests.length;
  
  console.log(`✅ Successful Tests: ${successfulTests.length}/${results.length}`);
  console.log(`🧠 Average Intelligence Score: ${avgIntelligence.toFixed(1)}/10`);
  console.log(`🎯 Consistency Rate: ${(consistencyRate * 100).toFixed(1)}%`);
  
  if (avgIntelligence > 7) {
    console.log("🎉 EXCELLENT: AI shows high intelligence in move selection!");
  } else if (avgIntelligence > 5) {
    console.log("⚠️  MODERATE: AI shows some intelligence but could improve");
  } else {
    console.log("❌ POOR: AI appears to be making random/hardcoded decisions");
  }
  
  if (consistencyRate > 0.8) {
    console.log("🔒 GOOD: AI is consistent in similar scenarios");
  } else if (consistencyRate > 0.5) {
    console.log("⚠️  MODERATE: AI shows some variation in decisions");
  } else {
    console.log("🎲 CONCERN: AI may be too random or inconsistent");
  }

  console.log("\n" + "=" .repeat(80));
  console.log("🏁 BATTLE AI TESTING COMPLETE");
}

function analyzeIntelligence(moves: any, battlePrompt: any): { score: number, reasoning: string } {
  let score = 0;
  const reasons = [];
  
  const { agent_1: a1, agent_2: a2 } = battlePrompt;
  const { agent_1: move1, agent_2: move2 } = moves;
  
  // Agent 1 analysis
  if (a1.total_damage_received > 70) {
    if (move1 === 'recover') {
      score += 2;
      reasons.push("Agent 1 wisely chose RECOVER with high damage");
    } else if (move1 === 'dodge') {
      score += 1;
      reasons.push("Agent 1 chose DODGE defensively with high damage");
    }
  }
  
  if (a1.traits.Strength > 8000 && (move1 === 'strike' || move1 === 'special_move')) {
    score += 2;
    reasons.push("Agent 1 used high strength effectively");
  }
  
  if (a1.traits.Defence > 8000 && move1 === 'dodge') {
    score += 1;
    reasons.push("Agent 1 leveraged high defense");
  }
  
  if ((a1.traits.Wit > 8000 || a1.traits.Charisma > 8000) && move1 === 'taunt') {
    score += 1;
    reasons.push("Agent 1 used wit/charisma for taunt");
  }
  
  // Agent 2 analysis  
  if (a2.total_damage_received > 70) {
    if (move2 === 'recover') {
      score += 2;
      reasons.push("Agent 2 wisely chose RECOVER with high damage");
    } else if (move2 === 'dodge') {
      score += 1;
      reasons.push("Agent 2 chose DODGE defensively with high damage");
    }
  }
  
  if (a2.traits.Strength > 8000 && (move2 === 'strike' || move2 === 'special_move')) {
    score += 2;
    reasons.push("Agent 2 used high strength effectively");
  }
  
  if (a2.traits.Defence > 8000 && move2 === 'dodge') {
    score += 1;
    reasons.push("Agent 2 leveraged high defense");
  }
  
  if ((a2.traits.Wit > 8000 || a2.traits.Charisma > 8000) && move2 === 'taunt') {
    score += 1;
    reasons.push("Agent 2 used wit/charisma for taunt");
  }
  
  // Situational intelligence
  if (battlePrompt.current_round >= 4) {
    if (move1 === 'special_move' || move2 === 'special_move') {
      score += 1;
      reasons.push("Using special moves in late rounds");
    }
  }
  
  const reasoning = reasons.length > 0 ? reasons.join("; ") : "No clear strategic reasoning detected";
  
  return { score: Math.min(score, 10), reasoning };
}

// Run the tests
if (require.main === module) {
  runBattleAITests()
    .then(() => {
      console.log("\n✨ All tests completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test execution failed:", error);
      process.exit(1);
    });
}

export { runBattleAITests }; 