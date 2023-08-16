module.exports = {
    name: 'list-users',
    aliases: ['l-users'],
    category: 'dev',
    exp: 0,
    description: 'Get users phone number',
    async execute(client, flag, arg, M) {
        const users = await client.getAllUsers(); // Move this line here

        return void (await M.reply(
            `🌃 *USERS:* ${users.map(user => `${user.id} (${user.phoneNumber})`).join('\n')}`
        ));
    }
};
