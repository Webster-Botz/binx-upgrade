const config = require('../../config');
const eco = require('discord-mongoose-economy')
const ty = eco.connect(config.mongodb);

module.exports = { 
    name: "slot",  
    desc: "play slot game",
    cool:5,
    alias: ["slot"],
    category: "Economy",  
    react: "🎰", 
    start: async ( 
        Miku, 
        m, 
        { text, prefix, ECONOMYstatus, } 
    ) => {
      
      if (ECONOMYstatus == "false")  return m.reply(`Economy is not enabled in this group!\n\nTo use ECONOMY, type:\n\n*${prefix}support* to join Casino group`);
          
          var texts = text.split(" ");
    var opp = texts[1]; // your value
    var value = texts[0].toLowerCase();  
    var gg = parseInt(value);
          const twice = gg * 3;
          const thrice = gg * 6;
          const boom = gg * 9;
      
      if (!text)
      return m.reply(
        `Usage:  *${prefix}slot amount*\n\nExample:  *${prefix}slot 100*`
      );

    if (!value)
      return m.reply("*Please, specify the amount you are gambling with!*");
          
          if (text == 'help') return m.reply(`*1:* Use ${prefix}slot to play\n\n*2:* You must have 💵500 in your wallet\n\n*3:* If you don't have money in wallet then withdraw from your bank\n\n*4:* If you don't have money in your bank too then use economy features to gain money`)
          if (text == 'money') return m.reply(`*1:* Small Win --> +${twice}\n\n*2:* Small Lose --> -${texts[0]}💵\n\n*3:* Big Win --> +${thrice}💵\n\n*4:* Big Lose --> -${texts[0]}💵\n\n*5:* 🎉 JackPot --> +💵${boom}💵`)
          const fruit1= ["🥥", "🍎", "🍇"]
          const fruit2 = ["🍎", "🍇", "🥥"]  
          const fruit3 = ["🍇", "🥥", "🍎"]         
          const fruit4 = ["🍇", "🥥", "🍎"]
          const lose = ['*You suck at playing this game*\n\n_--> 🍍-🥥-🍎_', '*Totally out of line*\n\n_--> 🥥-🍎-🍍_', '*Are you a newbie?*\n\n_--> 🍎-🍍-🥥_']
          const smallLose = ['*You cannot harvest coconut 🥥 in a pineapple 🍍 farm*\n\n_--> 🍍>🥥<🍍_', '*Apples and Coconut are not best Combo*\n\n_--> 🍎>🥥<🍎_', '*Coconuts and Apple are not great deal*\n\n_--> 🥥>🍎<🥥_']
          const won = ['*You harvested a basket of*\n\n_--> 🍎+🍎+🍎_', '*Impressive, You must be a specialist in plucking coconuts*\n\n_--> 🥥+🥥+🥥_', '*Amazing, you are going to be making pineapple juice for the family*\n\n_--> 🍍+🍍+🍍_']             
          const near = ['*Wow, you were so close to winning pineapples*\n\n_--> 🍎-🍍+🍍_', '*Hmmm, you were so close to winning Apples*\n\n_--> 🍎+🍎-🍍_']          
          const jack = ['*🥳 JackPot 🤑*\n\n_--> 🍇×🍇×🍇×🍇_', '*🎉 JaaackPooot!*\n\n_--> 🥥×🥥×🥥×🥥_', '*🎊 You Just hit a jackpot worth ${boom}💵']
          const user = m.sender
          const cara = "cara"
          const k = 500
          const balance1  = await eco.balance(user, cara)
          
          if (k > balance1.wallet) return m.reply(`You are going to be spinning on your wallet, you need at least 💵500`);
          const f1 = fruit1[Math.floor(Math.random() * fruit1.length)];
          const f2 = fruit2[Math.floor(Math.random() * fruit2.length)];
          const f3 = fruit3[Math.floor(Math.random() * fruit3.length)];
          const f4 = fruit4[Math.floor(Math.random() * fruit4.length)];
          const mess1 = lose[Math.floor(Math.random() * lose.length)];
          const mess2 = won[Math.floor(Math.random() * won.length)];
          const mess3 = near[Math.floor(Math.random() * near.length)];
          const mess4 = jack[Math.floor(Math.random() * jack.length)];
          const mess5 = smallLose[Math.floor(Math.random() * smallLose.length)];
          
          if ((f1 !== f2) && f2 !== f3){
             const deduct1 = await eco.deduct(user, cara, texts[0]);
                    m.reply(`${mess1}\n\n*Big Lose -->* _${texts[0]}💵_`)
          }
          else if ((f1 == f2) && f2 == f3){
             const give1 = await eco.give(user, cara, thrice); 
                   m.reply(`${mess2}\n*_Big Win -->* _${thrice}💵_`)
          }
          else if ((f1 == f2) && f2 !== f3){
             const give2 = await eco.give(user, cara, twice);
                   m.reply(`${mess3}\n*Small Win -->* _${twice}💵_`)
          }
          else if ((f1 !== f2) && f1 == f3){
             const deduct2 = await eco.deduct(user, cara, texts[0]);
                   m.reply(`${mess5}\n\n*Small Lose -->* _${texts[0]}💵_`)
          }
          else if ((f1 !== f2) && f2 == f3){
             const give4 = eco.give(user, cara, twice); 
                   m.reply(`${mess3}\n\n*Small Win -->* _${twice}💵_`)
          }
          else if (((f1 == f2) && f2 == f3) && f3 == f4){
             const give5 = eco.give(user, cara, boom);
                  m.reply(`${mess4}\n\n_🎊 JackPot --> _${boom}💵_`)
          }
          else { 
                  m.reply(`Do you understand what you are doing?`)
          }
         }
    }
