module.exports = {
    name: 'ready',
    run: async (_CLIENT) => {
        const { client } = _CLIENT 
        console.log(`${client.user.tag}, is running.`)
        const channel = client.channels.cache.get('1068467073329659914');
        channel.send('Online, sir.');

    }
};