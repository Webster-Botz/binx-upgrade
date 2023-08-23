const fs = require("fs");
const config = require("../../config");
const eco = require("discord-mongoose-economy");
const ty = eco.connect(config.mongodb);

module.exports = {
  name: "deposit",
  desc: "deposit gold.",
  alias: ["deposit"],
  category: "Economy",
  react: "💵",
  start: async (client, M, { text, arg }) => {
    if (!text) {
      return client.sendMessage(
        M.from,
        { text: `Provide the 💰amount you want to deposit!` },
        { quoted: M }
      );
    }
    const user = M.sender;
    const cara = "cara";
    const num = parseInt(args[0]);
    const deposit = await eco.deposit(user, cara, num);
    if (deposit.noten) return M.reply("You can't deposit what you don't have.");

    await client.sendMessage(
      M.from,
      {
        image: fs.readFileSync("./media/card.png"),
        caption: `\n⛩️ Sender: ${M.pushName}\n\n🍀Successfully Deposited 💴 ${deposit.amount} to your bank.\n`,
      },
      { quoted: M }
    );
  },
};
