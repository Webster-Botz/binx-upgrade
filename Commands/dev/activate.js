module.exports = {
    name: 'activate-g',
    aliases: ['g'],
    category: 'dev',
    exp: 0,
    description: 'activates game mod in a particular group',

    async execute(client, flag, arg, M) {
   await client.groupUpdateSubject(M.from, "🎰Binx Casino Extravaganza 🎉💰")

      }
   }