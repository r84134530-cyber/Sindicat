const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Înregistrăm comenzile Slash pe Discord la pornire
const commands = [
    new SlashCommandBuilder().setName('factionwarn').setDescription('Deschide formularul pentru Faction Warn'),
    new SlashCommandBuilder().setName('amenda').setDescription('Deschide formularul pentru Amenzi Organizații'),
    new SlashCommandBuilder().setName('bklider').setDescription('Deschide formularul pentru Blacklist Lider'),
    new SlashCommandBuilder().setName('bkorganizatie').setDescription('Deschide formularul pentru Blacklist Organizații Ilegale')
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`Botul este online ca ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Se înregistrează comenzile Slash (/) pe server...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Comenzile Slash au fost înregistrate cu succes!');
    } catch (error) {
        console.error('Eroare la înregistrarea comenzilor:', error);
    }
});

// Când utilizatorul tastează o comandă cu /
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // Verificăm permisiunile
        const hasPermission = interaction.member.permissions.has('Administrator') || interaction.member.permissions.has('ManageRoles');
        if (!hasPermission) {
            return interaction.reply({ content: '❌ Nu ai permisiunea de a folosi această comandă!', ephemeral: true });
        }

        if (commandName === 'factionwarn') {
            const modal = new ModalBuilder().setCustomId('factionWarnModal').setTitle('Model Faction Warn');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reclamant').setLabel('Nume reclamant / aplicant').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('factiune').setLabel('Faction vizată').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('data').setLabel('Data incidentului').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motiv').setLabel('Motivul sancțiunii').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('descriere').setLabel('Descriere detaliată a situației').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
            return await interaction.showModal(modal);
        }

        if (commandName === 'amenda') {
            const modal = new ModalBuilder().setCustomId('amendaModal').setTitle('Model Amenzi Organizatii');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('aplicant').setLabel('Nume aplicant').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('organizatie').setLabel('Organizatie vizată').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('data').setLabel('Data incidentului').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motiv').setLabel('Motivul amenzii').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('suma').setLabel('Suma amenzii').setStyle(TextInputStyle.Short).setRequired(true))
            );
            return await interaction.showModal(modal);
        }

        if (commandName === 'bklider') {
            const modal = new ModalBuilder().setCustomId('bkliderModal').setTitle('Model Blacklist Lider');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reclamant').setLabel('Nume reclamant').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('lider').setLabel('Lider vizat').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('factiune').setLabel('Faction / Organizație').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('data').setLabel('Data incidentului').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motiv').setLabel('Motivul blacklist-ului').setStyle(TextInputStyle.Short).setRequired(true))
            );
            return await interaction.showModal(modal);
        }

        if (commandName === 'bkorganizatie') {
            const modal = new ModalBuilder().setCustomId('bkorganizatieModal').setTitle('Blacklist Organizații Ilegale');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('aplicant').setLabel('Nume aplicant').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('organizatie').setLabel('Organizație vizată').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('data').setLabel('Data incidentului').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motiv').setLabel('Motivul blacklist-ului').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('descriere').setLabel('Descriere detaliată').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
            return await interaction.showModal(modal);
        }
    }

    // Când utilizatorul trimite formularul completat
    if (interaction.isModalSubmit()) {
        const aprobatDe = interaction.user.tag;
        let embed = new EmbedBuilder().setTimestamp();

        if (interaction.customId === 'factionWarnModal') {
            embed.setTitle('⚠️ MODEL FACTION WARN')
                .setColor('#e74c3c')
                .addFields(
                    { name: '- Nume reclamant / aplicant:', value: interaction.fields.getTextInputValue('reclamant') },
                    { name: '- Faction vizată:', value: interaction.fields.getTextInputValue('factiune') },
                    { name: '- Data incidentului:', value: interaction.fields.getTextInputValue('data') },
                    { name: '- Motivul sancțiunii:', value: interaction.fields.getTextInputValue('motiv') },
                    { name: '- Descriere detaliată a situației:', value: interaction.fields.getTextInputValue('descriere') },
                    { name: '- Warn aprobat de:', value: aprobatDe }
                );
        } 
        else if (interaction.customId === 'amendaModal') {
            embed.setTitle('💰 MODEL AMENDĂ ORGANIZAȚIE')
                .setColor('#f1c40f')
                .addFields(
                    { name: '- Nume aplicant:', value: interaction.fields.getTextInputValue('aplicant') },
                    { name: '- Organizatie vizată:', value: interaction.fields.getTextInputValue('organizatie') },
                    { name: '- Data incidentului:', value: interaction.fields.getTextInputValue('data') },
                    { name: '- Motivul amenzii:', value: interaction.fields.getTextInputValue('motiv') },
                    { name: '- Suma amenzii:', value: interaction.fields.getTextInputValue('suma') },
                    { name: '- Amendă aprobată de:', value: aprobatDe }
                );
        } 
        else if (interaction.customId === 'bkliderModal') {
            embed.setTitle('🚫 BLACKLIST LIDER')
                .setColor('#9b59b6')
                .addFields(
                    { name: '- Nume reclamant:', value: interaction.fields.getTextInputValue('reclamant') },
                    { name: '- Lider vizat:', value: interaction.fields.getTextInputValue('lider') },
                    { name: '- Faction / Organizație:', value: interaction.fields.getTextInputValue('factiune') },
                    { name: '- Data incidentului:', value: interaction.fields.getTextInputValue('data') },
                    { name: '- Motivul blacklist-ului:', value: interaction.fields.getTextInputValue('motiv') },
                    { name: '- Blacklist aprobat de:', value: aprobatDe }
                );
        } 
        else if (interaction.customId === 'bkorganizatieModal') {
            embed.setTitle('🏴‍☠️ BLACKLIST ORGANIZAȚII ILEGALE')
                .setColor('#34495e')
                .addFields(
                    { name: '- Nume aplicant:', value: interaction.fields.getTextInputValue('aplicant') },
                    { name: '- Organizație vizată:', value: interaction.fields.getTextInputValue('organizatie') },
                    { name: '- Data incidentului:', value: interaction.fields.getTextInputValue('data') },
                    { name: '- Motivul blacklist-ului:', value: interaction.fields.getTextInputValue('motiv') },
                    { name: '- Descriere detaliată a situației:', value: interaction.fields.getTextInputValue('descriere') },
                    { name: '- Blacklist aprobat de:', value: aprobatDe }
                );
        }

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Formularul a fost trimis și înregistrat cu succes!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
