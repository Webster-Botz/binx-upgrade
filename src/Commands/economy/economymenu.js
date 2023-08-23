module.exports = {
    name: "economymenu",
    aliases: ["gamesmenu"],
    category: "Economy",
    desc: "get the help list of binx games features", 
    async execute (client, M, arg) => {
  
   
      let ntext = `🎉 **Introducing Binx Economy Games!** 🎮🌟

Welcome to the exciting world of Binx Economy! We've got a bunch of awesome games for you to play and enjoy. Dive in and experience the thrill of building your virtual fortune! 💰💼

```*💎 Bank:* Manage your accounts and keep track of your transactions effortlessly.

*📊 Capacity:* Check the limits of your wallet and see how much more you can earn.

*💰 Daily:* Claim your daily reward and get a head start on your wealth-building journey.

*💵 Deposit:* Boost your funds by depositing coins into your wallet securely.

*💸 Gamble:* Feeling lucky? Take a risk and try your luck in our thrilling gambling games.

*🏆 Leaderboard (LB):* Compete with fellow users and climb to the top of the leaderboard. Will you secure the #1 spot?

*🤖 Rob:* Be daring and attempt to rob other users’ coins. But be cautious, as fortune favors the brave!

*🎰 Slot:* Spin the virtual slot machine and watch as luck unfolds with exciting rewards.

*💸 Transfer:* Share the wealth by transferring coins to your friends within the Binx Economy.

*💼 Wallet:* Stay up to date with your current wallet balance and keep your finances in check.

*📤 Withdraw:* Need some real-world currency? Withdraw your hard-earned coins from your wallet.

*🎲 Bet:* Engage in thrilling betting games and put your intuition to the test.```

Get ready to play, have fun, and watch your fortune grow! So what are you waiting for? Jump into Binx Economy Games and let the adventure begin! Enjoy the journey! 😄🚀💰`

await client.sendMessage(M.from, text: ntext}, { quoted: M })
    }
          }