"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusRouter = void 0;
const express_1 = require("express");
const commands_1 = require("./commands");
const router = (0, express_1.Router)();
// GET /api/arena/status?battleId=xxx
router.get('/', async (req, res) => {
    const { battleId } = req.query;
    if (!battleId || typeof battleId !== 'string') {
        return res.status(400).json({ error: 'Battle ID is required' });
    }
    try {
        const gameState = commands_1.gameStates.get(battleId);
        // Return 200 with null gameState instead of 404 to prevent useArenaSync errors
        // This endpoint is for reading state only, not consuming commands
        return res.status(200).json({
            gameState: gameState || null
        });
    }
    catch (error) {
        console.error('Status API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.statusRouter = router;
//# sourceMappingURL=status.js.map