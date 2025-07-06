# WarriorsAI-rena: AI-Powered Blockchain Battle Arena 🏛️⚔️🤖

> **The Future of Blockchain Gaming**: Where AI agents orchestrate epic battles, players influence outcomes, and every warrior NFT tells a unique story.

## 🌟 Project Overview

**WarriorsAI-rena** is a revolutionary blockchain-based battle arena game that combines:
- **AI-Powered Combat**: Real AI agents make strategic decisions during battles
- **Player Agency**: Bet, influence, and directly impact battle outcomes
- **True Ownership**: Warriors as dynamic NFTs with evolving traits and abilities
- **Sustainable Economics**: Crown Token (CRwN) with 1:1 FLOW backing
- **Cross-Chain Integration**: Flow Testnet + 0G Network + Ethereum compatibility

## 🏗️ System Architecture

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App] --> B[Wallet Integration]
        A --> C[Real-time Battle UI]
        A --> D[Warrior Management]
        A --> E[Token Economics]
    end
    
    subgraph "Blockchain Layer"
        F[Flow Testnet] --> G[Arena Contracts]
        F --> H[Warriors NFT]
        F --> I[Crown Token]
        F --> J[Arena Factory]
    end
    
    subgraph "AI & Storage Layer"
        K[0G AI Agents] --> L[Battle Decision Engine]
        K --> M[Move Selection AI]
        N[0G Storage] --> O[Warrior Metadata]
        N --> P[Battle History]
        N --> Q[Encrypted Assets]
    end
    
    subgraph "Backend Services"
        R[Arena Backend] --> S[Battle Orchestration]
        R --> T[AI Integration]
        R --> U[Event Processing]
        V[0G Storage API] --> W[File Upload/Download]
        V --> X[Metadata Management]
    end
    
    A --> F
    A --> K
    A --> V
    R --> F
    R --> K
    L --> G
    O --> H
```

### Technical Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Blockchain** | Flow Testnet | Smart contracts and token economics |
| **Frontend** | Next.js 15 + TypeScript | Modern web interface |
| **AI Layer** | 0G AI Agents | Battle decision making |
| **Storage** | 0G Storage Network | Decentralized metadata storage |
| **Smart Contracts** | Solidity + Foundry | Battle logic and tokenomics |
| **Wallet Integration** | RainbowKit + Wagmi | Multi-wallet support |
| **Backend** | Node.js + Express | API services and orchestration |

## 🎮 Game Flow Architecture

### Battle Lifecycle Diagram

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as Frontend
    participant BC as Blockchain
    participant AI as 0G AI Agent
    participant ST as 0G Storage
    
    Note over P,ST: Game Initialization
    P->>UI: Connect Wallet
    UI->>BC: Initialize Arena
    BC->>ST: Store Arena Metadata
    
    Note over P,ST: Betting Phase (60s minimum)
    P->>UI: Place Bet on Warrior
    UI->>BC: Execute Bet Transaction
    BC->>BC: Record Bet
    
    Note over P,ST: Battle Rounds (5 rounds)
    loop Each Round
        AI->>AI: Analyze Warrior Traits
        AI->>AI: Select Optimal Moves
        AI->>BC: Submit Signed Moves
        BC->>BC: Execute Battle Logic
        BC->>ST: Store Battle Results
        UI->>UI: Update Battle Visualization
    end
    
    Note over P,ST: Reward Distribution
    BC->>BC: Calculate Winners
    BC->>P: Distribute Rewards
    BC->>ST: Update Warrior Stats
```

### Smart Contract Architecture

```mermaid
graph TD
    A[ArenaFactory.sol] --> B[Arena.sol]
    A --> C[Arena.sol]
    A --> D[Arena.sol]
    A --> E[Arena.sol]
    A --> F[Arena.sol]
    
    B --> G[WarriorsNFT.sol]
    C --> G
    D --> G
    E --> G
    F --> G
    
    B --> H[CrownToken.sol]
    C --> H
    D --> H
    E --> H
    F --> H
    
    G --> I[Oracle Integration]
    H --> J[1:1 FLOW Backing]
    
    subgraph "Rank Categories"
        B[Unranked Arena]
        C[Bronze Arena]
        D[Silver Arena]
        E[Gold Arena]
        F[Platinum Arena]
    end
    
    subgraph "Core Contracts"
        G[Warriors NFT<br/>- Traits System<br/>- Ranking System<br/>- Encrypted Metadata]
        H[Crown Token<br/>- ERC20 + Burnable<br/>- Mint with FLOW<br/>- Burn for FLOW]
    end
```

## 🔧 Smart Contract Details

### Core Contracts

#### 1. Arena.sol - Battle Engine
```solidity
// Key Features:
- 5-round battle system with AI-controlled moves
- Betting mechanics with fixed amounts per rank
- Influence/Defluence system for strategic gameplay
- Cryptographic verification of AI decisions
- Automatic reward distribution

// Battle Moves:
enum PlayerMoves {
    STRIKE,   // Strength-based attack
    TAUNT,    // Charisma + Wit combination
    DODGE,    // Defense-focused evasion
    SPECIAL,  // Personality + Strength ultimate
    RECOVER   // Defense + Charisma healing
}
```

#### 2. WarriorsNFT.sol - Character System
```solidity
// Warrior Traits (0-100 with 2 decimal precision):
struct Traits {
    uint16 strength;   // Physical power
    uint16 wit;        // Intelligence and strategy
    uint16 charisma;   // Social influence
    uint16 defence;    // Damage resistance
    uint16 luck;       // Random factor influence
}

// Ranking System:
enum Ranking {
    UNRANKED, BRONZE, SILVER, GOLD, PLATINUM
}
```

#### 3. CrownToken.sol - Economic Engine
```solidity
// Unique Features:
- 1:1 FLOW backing (mint 1 CRwN with 1 FLOW)
- Burn CRwN to receive FLOW back
- Utility in betting, influence, and governance
- Deflationary mechanics through gameplay
```

### Contract Addresses (Flow Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| MockOracle | `0x56d7060B080A6d5bF77aB610600e5ab70365696A` | Random number generation |
| CrownToken | `0x9Fd6CCEE1243EaC173490323Ed6B8b8E0c15e8e6` | Game currency and governance |
| WarriorsNFT | `0x3838510eCa30EdeF7b264499F2B590ab4ED4afB1` | Warrior character NFTs |
| ArenaFactory | `0xf77840febD42325F83cB93F9deaE0F8b14Eececf` | Arena creation and management |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Foundry (for smart contract development)
- Wallet with Flow Testnet tokens

### Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/WarriorsAI-rena.git
cd WarriorsAI-rena
```

2. **Install Smart Contract Dependencies**
```bash
forge install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **0G Storage Setup**
```bash
cd frontend/0g-storage
npm install
npm run build
```

5. **Backend Setup** (if arena-backend exists)
```bash
cd arena-backend
npm install
```

### Environment Configuration

Create `.env.local` in the frontend directory:
```bash
# Flow Testnet Configuration
FLOW_TESTNET_RPC=https://testnet.evm.nodes.onflow.org
NEXT_PUBLIC_GAME_MASTER_PRIVATE_KEY=your_private_key_here

# 0G Network Configuration
PRIVATE_KEY=your_0g_private_key_here
NEXT_PUBLIC_0G_RPC=https://evmrpc-testnet.0g.ai/
NEXT_PUBLIC_0G_INDEXER=https://indexer-storage-testnet-standard.0g.ai

# Pinata IPFS Configuration
PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_GATEWAY_URL=your_gateway_url_here
```

### Running the Project

#### Option 1: Full Development Setup
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: 0G Storage Service
cd frontend/0g-storage
npm start

# Terminal 3: Arena Backend (if available)
cd arena-backend
npm start
```

#### Option 2: Frontend Only
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Key Features

### 1. AI-Powered Battle System
- **Real AI Agents**: 0G Network hosts AI agents that make strategic decisions
- **Dynamic Combat**: No two battles are ever the same
- **Cryptographic Verification**: All AI decisions are signed and verified on-chain
- **Strategic Depth**: 5 different move types with complex interaction mechanics

### 2. Player Agency Mechanics
- **Strategic Betting**: Bet on warriors with analysis of traits and history
- **Influence System**: Boost warrior performance using Crown tokens
- **Defluence Mechanics**: Strategically weaken opponents (limited use)
- **Real-time Participation**: Watch battles unfold with live updates

### 3. Advanced NFT System
- **Dynamic Traits**: Warriors have 5 core attributes affecting battle performance
- **Ranking Progression**: Warriors advance through rank tiers via victories
- **Custom Moves**: Each warrior has personalized attack names

### 4. Sustainable Economics
- **Crown Token (CRwN)**: 1:1 ETH backing prevents death spirals
- **Utility-Driven**: Tokens consumed in gameplay, not just traded
- **Deflationary Mechanics**: Influence/defluence burns tokens
- **Revenue Mechanism**: 5% of betting pools fund can be charged for the ecosystem development in the future.

## 🔐 Security Features

### Smart Contract Security
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Signature Verification**: ECDSA signatures for AI decisions
- **Time Locks**: Betting periods and battle intervals prevent manipulation

### Economic Security
- **Defluence Limits**: One defluence per player per game
- **Oracle Integration**: Verifiable random number generation
- **Transparent History**: All battles permanently recorded on-chain

## 🌐 Cross-Chain Integration

### Flow Testnet Integration
- **Primary Blockchain**: Smart contracts deployed on Flow EVM
- **Native Token Support**: Flow tokens for gas fees
- **EVM Compatibility**: Full Ethereum tooling support

### 0G Network Integration
- **AI Agents**: Decentralized AI hosting for battle decisions
- **Storage Layer**: Encrypted metadata and battle history
- **Serving Infrastructure**: High-performance AI inference

### Multi-Chain Architecture
```mermaid
graph LR
    A[Flow Testnet] --> D[Battle Contracts]
    B[0G Network] --> E[AI Agents]
    B --> F[Storage Layer]
    C[Ethereum] --> G[Future Expansion]
    
    D --> H[Unified Experience]
    E --> H
    F --> H
    G --> H
```

## 📊 Game Economics

### Token Utility Flow
```mermaid
graph TD
    A[ETH] --> B[Mint CRwN 1:1]
    B --> C[Betting Pool]
    B --> D[Influence Warriors]
    B --> E[Defluence Opponents]
    
    C --> F[Battle Rewards]
    D --> G[Token Burn]
    E --> G
    
    F --> H[Player Rewards]
    G --> I[Deflationary Pressure]
    
    H --> J[Reinvestment]
    I --> K[Token Value Appreciation]
```

### Reward Distribution
- **Winners**: 95% of betting pool (minus gas)
- **Protocol**: 5% for development and maintenance (in future)
- **Warrior Owners**: Rank-based rewards

## 🛠️ Development

### Smart Contract Development
```bash
# Compile contracts
forge build

# Run tests
forge test


```

### Frontend Development
```bash
# Development server (in frontend folder)
npm run dev

# 0G storage backend server (in frontend/0g-storage folder)
npm start

# Arena automation backend server (in arena-backend folder)
npm start

# Build for production
npm run build


```




```



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flow Blockchain**: For providing the EVM-compatible infrastructure
- **0G Network**: For decentralized AI and storage solutions
- **Foundry**: For the excellent smart contract development framework
- **Next.js Team**: For the amazing React framework
- **OpenZeppelin**: For secure smart contract libraries

---

**Built with ❤️ by the Seeers Team in ETH Global Cannesa**

*Where AI meets blockchain, and every battle tells a story.*