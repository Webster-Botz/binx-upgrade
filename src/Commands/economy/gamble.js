const axios = require('axios');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'gamble',
    aliases: ['gamble'],
    category: 'economy',
    exp: 0,
    description: 'Allows users to gamble with gold',
    async execute(client, flag, arg, M) {
        const sender = M.sender;
         const db = new QuickDB();
        const tb = db
        
        let rn = Math.floor(Math.random() * 2) + 1;
        const userGold = await tb.get(`${sender}.gold`);
        
        if (userGold < 50) {
            return M.reply('You must have 50 gold or more to gamble');
        }
        
        const az = arg.split(' ');
        let no = (Number(az[1])) ? Number(az[1]) : 0;
        
        if (!az[1] || !az[2]) {
            return M.reply('You must specify how much gold you want to gamble');
        }
        
        if (!no) {
            return M.reply('Wrong Format [Gold Amount not Specified]');
        }
        
        if (az[2].toLowerCase().trim() !== 'left' && az[2].toLowerCase().trim() !== 'right') {
            return M.reply('Wrong Format [L/R]');
        }
        
        if (no < 50) {
            return M.reply('You can\'t gamble less than 50 gold');
        }
        
        if (userGold - no < 0) {
            return M.reply('You don\'t have the specified amount of gold');
        }
        
        if ((rn === 1 && az[2].toLowerCase().trim() === 'right') || (rn === 2 && az[2].toLowerCase().trim() === 'left')) { 
            const al = userGold + no;
            await tb.set(`${sender}.gold`, al);
            return M.reply(`🎊️ You won \n\n🎋Amount:*${az[1]}* gold`);
        }
        
        const SW = (az[2] === 'right') ? 'left' : 'right'; 
        const lg = userGold - no;
        await tb.set(`${sender}.gold`, lg);
        return M.reply(`🥀️ You lost \n\n🎋Amount:*${az[1]}* gold`);
    }
};
