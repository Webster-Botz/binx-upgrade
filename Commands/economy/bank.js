const fs = require("fs");
const config = require("../../config");
const eco = require("discord-mongoose-economy");
const ty = eco.connect(config.mongodb);

module.exports = {
  name: "bank",
  desc: "shows bank amount.",
  alias: ["bank"],
  category: "Economy",
  async execute (client, M, arg) => {
  
    const pushname = M.pushName || "Binx-user💜";
    const user = M.sender;
    const cara = "cara";
    const balance = await eco.balance(user, cara);
    var role = "brokie😭";
    if (`${balance.bank}` <= 1000) {
      role = "broke😭";
    } else if (`${balance.bank}` <= 10000) {
      role = "Poor😢";
    } else if (`${balance.bank}` <= 50000) {
      role = "Average💸";
    } else if (`${balance.bank}` <= 1000000) {
      role = "Rich💸💰";
    } else if (`${balance.bank}` <= 10000000) {
      role = "Millionaire🤑";
    } else if (`${balance.bank}` <= 90000000) {
      role = "Billionaire🤑🤑";
    } else if (`${balance.bank}` <= 10000000000000000000000000000000) {

      role = "Filthy rich 🤑🤑";

    }

    await client.sendMessage(
      M.from,
      {
        image: fs.readFileSync("./media/bank.png"),
        caption: `\n🏦 *${pushname}'s Bank*:\n\n🪙 Balance: ${balance.bank}\n\n\n*Wealth: ${role}*\n`,
      },
      { quoted: M }
    );
  },
};
