"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApplication = void 0;
const brokerService_1 = require("./services/brokerService");
/**
 * Initialize the application and ensure prerequisite resources exist
 */
const initializeApplication = async () => {
    try {
        console.log('🔄 Initializing application...');
        // Check if ledger exists, create with default values if not
        try {
            const balanceInfo = await brokerService_1.brokerService.getBalance();
            console.log('✅ Ledger account exists:', balanceInfo);
        }
        catch (error) {
            console.log('⚠️ Ledger account does not exist, creating...');
            // Default initial amount, can be adjusted as needed
            const initialAmount = 0.01;
            await brokerService_1.brokerService.addFundsToLedger(initialAmount);
            console.log(`✅ Ledger account created with ${initialAmount} initial funds`);
        }
        console.log('✅ Application initialization complete');
    }
    catch (error) {
        console.error('❌ Application initialization failed:', error.message);
        throw new Error(`Application initialization failed: ${error.message}`);
    }
};
exports.initializeApplication = initializeApplication;
