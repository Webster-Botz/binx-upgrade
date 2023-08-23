const fs = require("fs");
require("../../Database/dataschema.js");
const config = require("../../config");
const eco = require("discord-mongoose-economy");
const ty = eco.connect(config.mongodb);

module.exports = {
  name: "daily",
  desc: "daily gold.",
  alias: ["daily"],
  category: "Economy",
  async execute (Miku, m, { text, prefix }) => {
    let user = m.sender;
    const cara = "cara";
    const daily = await eco.daily(user, cara, 3000);
    if (daily.cd) {
      await client.sendMessage(
        M.from,
        {
          image: fs.readFileSync("./media/card.png"),
          caption: `\n🧧 You already claimed your daily revenue today, Come back in ${daily.cdL} to claim again 🫡`,
        },
        { quoted: M }
      );
    } else {
      return client.sendMessage(
        M.from,
        {
          text: `You have successfully claimed your daily revenue ${daily.amount} 💴 today 🎉.`,
        },
        { quoted: M }
      );
    }
  },
};
