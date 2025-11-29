const { Command } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');

const ID_CANAL = "1435321592170414280";
const ID_CARGO = "1435321990906118284";
const ID_GUILD = "1435317280698404886";

const codigos = new Map();

module.exports = class VerificarCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'verificar',
      description: 'Sistema de verificação com código anti-bot'
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      builder =>
        builder
          .setName('verificar')
          .setDescription('Iniciar sistema de verificação'),
      {
        guildIds: [ID_GUILD]
      }
    );
  }

  async chatInputRun(interaction) {

    // ❌ Bloqueia fora do canal correto
    if (interaction.channel.id !== ID_CANAL) {
      return interaction.reply({
        content: '❌ Você só pode se verificar no canal correto.',
        ephemeral: true
      });
    }

    // 🔐 Gera código anti-bot
    const codigo = Math.random().toString(36).substring(2, 7).toUpperCase();
    codigos.set(interaction.user.id, codigo);

    // 📦 Embed estiloso
    const embed = new EmbedBuilder()
      .setTitle("✅ Verificado")
      .setDescription(
        `✨ **Bem-vindo(a) ao servidor!** ✨\n\n` +
        `Para garantir a segurança contra robôs, digite no chat **exatamente a palavra-chave abaixo:**\n\n` +
        `🔐 \`\`\`${codigo}\`\`\`\n\n` +
        `⏳ Você tem **60 segundos**.\n` +
        `🧹 Sua mensagem será apagada automaticamente.\n\n` +
        `⚠️ **Não compartilhe este código com ninguém.**`
      )
      .setColor(0x008f8f)
      .setImage("https://i.pinimg.com/originals/f2/ff/82/f2ff82037fcc5a2305be0ee82d79e893.gif")
      .setFooter({ text: "Mika Bot • Sistema Anti-Robôs" });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

    const filtro = msg =>
      msg.author.id === interaction.user.id &&
      msg.content.toUpperCase() === codigo;

    const coletor = interaction.channel.createMessageCollector({
      filter: filtro,
      time: 60000,
      max: 1
    });

    coletor.on('collect', async msg => {
      await msg.delete();

      const cargo = msg.guild.roles.cache.get(ID_CARGO);
      if (!cargo) {
        return interaction.followUp({
          content: '❌ Cargo de verificação não encontrado.',
          ephemeral: true
        });
      }

      const membro = await interaction.guild.members.fetch(interaction.user.id);
      await membro.roles.add(cargo);

      codigos.delete(interaction.user.id);

      interaction.followUp({
        content: '✅ **Verificação concluída com sucesso! Seja bem-vindo(a)!**',
        ephemeral: true
      });
    });

    coletor.on('end', collected => {
      if (collected.size === 0) {
        codigos.delete(interaction.user.id);
        interaction.followUp({
          content: '⏰ Tempo esgotado! Use `/verificar` novamente.',
          ephemeral: true
        });
      }
    });
  }
};
