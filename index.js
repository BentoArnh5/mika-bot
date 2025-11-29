const { SapphireClient } = require('@sapphire/framework');
const { GatewayIntentBits, Events } = require('discord.js');
const path = require('path');
require('dotenv').config();

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  baseUserDirectory: path.join(__dirname, 'src'),
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Mika Bot ligado como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
