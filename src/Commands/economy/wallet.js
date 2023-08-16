const axios = require('axios');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'wallet',
    aliases: ['wallet'],
    category: 'economy',
    exp: 0,
    description: 'Allows users to gamble with gold',
    async execute(client, flag, arg, M) {
        if (flag === 'wallet') {
            const mentionedJid = M.mentionedJid;
            const sender = M.sender;
            const db = new QuickDB();

            let targetJid;
            if (mentionedJid.length > 0) {
                targetJid = mentionedJid[0];
            } else {
                targetJid = sender;
            }

            const gold = await db.get(`${targetJid}.gold`) || 0;
            const diamonds = await db.get(`${targetJid}.diamonds`) || 0;
            const pushname = M.pushName || 'Binxer🐹' 

            await M.reply(
                `@${pushname}'s Wallet\n\n🪙 GOLD : ${gold}\n💎 DIAMONDS : ${diamonds}`
            );
    }
};

