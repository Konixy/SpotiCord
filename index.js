const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_BANS, Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_WEBHOOKS, Discord.Intents.FLAGS.GUILD_INVITES, Discord.Intents.FLAGS.GUILD_VOICE_STATES, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING, Discord.Intents.FLAGS.GUILD_PRESENCES],
    partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
    restTimeOffset: 0,
    failIfNotExists: false
});
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const config = require('./config.js');
const logger = require('./logger.js');

const Spotify = require('spotifydl-core').default;
const spDl = new Spotify({
	clientId: config.spotifyClientId,
	clientSecret: config.spotifyClientSecret
})
const SpotifyFinder = require('spotify-get');
const spSr = new SpotifyFinder({
	consumer: {
		key: config.spotifyClientId,
		secret: config.spotifyClientSecret
	}
})
const stream = require('stream');
const colors = require('colors');
const fs = require('fs');
const moment = require('moment');
const https = require('https');
const axios = require('axios')
const Express = require('express');
const app = Express();
const mongoose = require('mongoose');
const ms = require('ms')

const database = mongoose.model("guilds", require('./databaseSchema.js'));

const rest = new REST({ version: "10" }).setToken(config.token);
const categorys = [
	{
		id: "util",
		name: "**👤・Utilitaires :**"
	},
	{
		id: "music",
		name: "**:notes:・Musiques :**"
	}
]
const commands = [
	{
		name: "ping",
		category: "util",
		description: "Renvoie le temp de reponse en *ms* du bot.",
	},
	{
		name: "djonly",
		category: "util",
		description: "Permet de configurer le mode dj.",
		options: [
			{
				name: "activer",
				description: "Active ou pas le mode dj",
				type: 3, required: false,
				choices: [
					{ name: "Oui", value: "true" },
					{ name: "Non", value: "false" }
				]
			}
		],
		permissions: ['MANAGE_GUILD']
	},
	{
		name: "help",
		description: "interaction d'aide"
	},
	{
		name: "play",
		category: "music",
		description: "Recherche une musique sur Spotify puis la joue",
		options: [
			{
				name: "musique",
				description: "Nom de la musique",
				type: 3, required: true
			}
		]
	},
	{
		name: "playlist",
		category: "music",
		description: "Recherche un album sur Spotify puis le joue",
		options: [
			{
				name: "album",
				description: "Nom ou id de l'album",
				type: 3, required: true
			}
		]
	},
	{
		name: "pause",
		category: "music",
		description: "Met la musique en pause ou la résume si elle l'est déjà"
	},
	{
		name: "queue",
		category: "music",
		description: "Affiche la file d'attente des musiques"
	},
	{
		name: "clear-queue",
		category: "music",
		description: "Supprime toute les musiques dans la file d'attente"
	},
	{
		name: "back",
		category: "music",
		description: "Joue la musique précédente"
	},
	{
		name: "join",
		category: "music",
		description: "Rejoins le salon vocale dans lequel vous êtes connecté"
	},
	{
		name: "leave",
		category: "music",
		description: "Quitte le salon vocale et arrête la musique en cours"
	},
	{
		name: "eval",
		description: "Admin only command",
		options: [
			{
				name: "reply",
				description: "Renvoie directement le résultat de l'action demandé",
				type: 1,
				options: [
					{
						name: "code",
						description: "le code a éxecuter",
						type: 3, required: true
					}
				]
			},
			{
				name: "console",
				description: "Envoie dans la console le résultat de l'action demandé",
				type: 1,
				options: [
					{
						name: "code",
						description: "le code a éxecuter",
						type: 3, required: true
					}
				]
			}
		]
	},
	{
		name: "restart",
		description: "Admin only command"
	},
	{
		name: "uptime",
		category: "util",
		description: "Donne l'uptime du bot"
	},
	{
		name: "invite",
		category: "util",
		description: `Lien d'invitation du bot`
	},
	{
		name: "support",
		category: "util",
		description: "Le serveur discord de support"
	}
];

let prefix;
const embedColor = '#2f3136'

const {
	joinVoiceChannel,
	getVoiceConnection,
	VoiceConnection,
	AudioPlayerStatus,
	createAudioPlayer,
	AudioPlayer,
	AudioResource,
	StreamType,
	createAudioResource,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus
} = require('@discordjs/voice');

const ytdl = require('ytdl-core');
const ytsr = require('youtube-search');
const ytpl = require('ytpl');
const ffmpegPath = require('ffmpeg-static')
const fluentFfmpeg = require('fluent-ffmpeg')
fluentFfmpeg.setFfmpegPath(ffmpegPath)
const {
	botNotInVoiceChannel,
	userNotInVoiceChannel,
	emptyQueue
} = require('./strings.json')
const hashmap = require('hashmap');
const { inspect } = require('util');
// const disbut = require('discord-buttons');
// disbut(client);
const ownerId = config.ownerId;

let servers = new hashmap();

let afk = false;

const Topgg = require("@top-gg/sdk");
const { randomUUID } = require('crypto');
const { OpusEncoder } = require('@discordjs/opus');
const { restart } = require('nodemon');
const webhook = new Topgg.Webhook("Kr&6dGbqHmBqTK5C")

app.get('/', (req, res) => {
	res.status(200).send(`${client.user.username} is on !`)
})

app.listen(config.port)

// change the url in https://top.gg/bot/832356026740637706/webhooks after changing domain name

function decodeEntities(encodedString) {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {
		"nbsp":" ",
		"amp" : "&",
		"quot": "\"",
		"lt"  : "<",
		"gt"  : ">"
	};
	return encodedString.replace(translate_re, function(match, entity) {
		return translate[entity];
	}).replace(/&#(\d+);/gi, function(match, numStr) {
		var num = parseInt(numStr, 10);
		return String.fromCharCode(num);
	});
}

function convertDate(date, addon) {
	date = new Date(date)
	let epoch;

	try {
		epoch = date.getTime()/1000.0;
	} catch {
		logger.log("Une erreur s'est produite en essayant de convertir la date");
		epoch = null
		return epoch
	}

	let time = `<t:${epoch}${addon ? addon : ""}>`

	return time;
}

/**
 * Gen an `Discord.MessageEmbed`
 * @param {String} embedTitle
 * @param {String} embedDescription
 * @param {String} embedColorParam
 */
function genEmbed(embedTitle, embedDescription, embedColorParam) {
	if(!embedTitle && !embedDescription) return logger.log('[genEmbed function ERROR] invalid arguments')
	const embed = new Discord.MessageEmbed()
	if(embedTitle) embed.setTitle(embedTitle);
	if(embedColorParam) embed.setColor(embedColorParam); else embed.setColor(embedColor);
	if(embedDescription) embed.setDescription(embedDescription);
	return embed;
}

/**
 * Send an `Discord.MessageEmbed` in the interaction channel
 * @param {Discord.CommandInteraction} interaction
 * @param {String} embedTitle
 * @param {String} embedDescription
 * @param {String} embedColorParam
 */
function reply(interaction, embedTitle, embedDescription, embedColorParam) {
	if(!interaction.channel || !embedTitle && !embedDescription) return logger.log('[reply function ERROR] invalid arguments')
	const embed = new Discord.MessageEmbed()
	if(embedTitle) embed.setTitle(embedTitle);
	if(embedColorParam) embed.setColor(embedColorParam); else embed.setColor(embedColor);
	if(embedDescription) embed.setDescription(embedDescription);
	return interaction.channel.send({ embeds: [embed] })
}

/**
 * Reply the interaction whith a `Discord.MessageEmbed`
 * @param {Discord.CommandInteraction} interaction
 * @param {String} embedTitle
 * @param {String} embedDescription
 */
 async function reply(interaction, embedTitle, embedDescription, embedColorParam) {
	if(!embedTitle && !embedDescription) return logger.error('[reply function ERROR] invalid arguments')
	const embed = new Discord.MessageEmbed()
	if(embedTitle) embed.setTitle(embedTitle);
	embedColorParam ? embed.setColor(embedColorParam) : embed.setColor(embedColor);
	if(embedDescription) embed.setDescription(embedDescription);
	try {
		if(!interaction.replied && !interaction.deferred) return await interaction.reply({embeds: [embed], fetchReply: true});
		else return await interaction.channel.send({embeds: [embed]});
	} catch (err) {
		interaction.channel.send({embeds: [embed]})
	}
}


/**
 * Reply the interaction whith an ephemeral `Discord.MessageEmbed`
 * @param {Discord.CommandInteraction} interaction
 * @param {String} embedTitle
 * @param {String} embedDescription
 */
 function replyEphemeral(interaction, embedTitle, embedDescription) {
	if(interaction.replied || !embedTitle && !embedDescription) return logger.error('[reply function ERROR] invalid arguments')
	const embed = new Discord.MessageEmbed()
	if(embedTitle) embed.setTitle(embedTitle);
	embed.setColor(embedColor);
	if(embedDescription) embed.setDescription(embedDescription);
	return interaction.reply({embeds: [embed], ephemeral: true});
}

/**
 * Load the queue from the server
 * @param {String} interaction 
 * @returns 
 */
function loadQueue(guildId) {
	if(!guildId) return baseQueue;
	let queue;
	let baseQueue = {
		previous: null,
		current: {
			title: "Rien pour le moment",
			url: ""
		},
		next: []
	};
	
	try {
		queue = require(`./queues/${guildId}.json`);
	} catch {
		queue = baseQueue
	}
	if(!queue) return baseQueue
	else return queue;
}

/**
 * Write the queue file
 * @param {String} guildId 
 * @returns 
 */
function writeQueue(guildId) {
	if(!guildId) return;
	let server = servers.get(guildId);
	if(!server) return;

	let queue = {
		previous: server.lastVideo,
		current: server.currentTrack,
		next: server.queue
	};

	fs.writeFile(`./queues/${guildId}.json`, JSON.stringify(queue), null, (err) => {
		if(err) {
			logger.log(err)
			return;
		}
	})

}

/**
 * Play a Spotify track in the current voice channel
 * @param {Discord.CommandInteraction} interaction 
 * @param {String} msg - Return the String "none" to don't send any interaction
 * @param {Boolean} noShift 
 * @param {Number} playAt 
 * @returns 
 */
async function playTrack(interaction, msg, noShift, playAt) {
	const server = servers.get(interaction.guild.id);
	if(!server.currentTrack.id) return;
	const trackData = await spSr.getTrack(server.currentTrack.id);

	let audioPlayer = createAudioPlayer();

	const player = spDl.downloadTrack(server.currentTrack.id, undefined);

	const voiceChannel = interaction.member.voice.channel;
	const connection = getVoiceConnection(interaction.guild.id);
	const resource = createAudioResource(player, { inlineVolume: true });
	resource.volume.setVolumeLogarithmic(server.currentVol / 100)
	audioPlayer.play(resource);
	server.startedDate = Date.now()

	audioPlayer.on('error', async error => {
		if(error.interaction.includes('Status code: 410')) {
			reply(interaction, ':warning: Cette vidéo ne peut être lu car elle est soumise a une limite d\'age.')
			if(server.queue[0]) {
				server.lastTrack = server.currentTrack
				server.currentTrack = server.queue[0]
				server.queue.shift()
				return playTrack(interaction, "none", true)
			} else {
				server.lastTrack = server.currentTrack
				server.currentTrack = {
					title: 'Rien pour le moment.',
					url: ''
				}
			}

		} else {
			logger.log(error)
			if(server.tries >= 3) {
				await reply(interaction, ':x: Trop d\'érreur, déconexion du bot...').then(async () => {
					server.tries = 0
					try {
						let inviteLink;
						await interaction.channel.createInvite().then(invite => inviteLink = invite.url)
						client.users.cache.get(ownerId).send(`An fatal error occured in ${interaction.channel} (${inviteLink})`)
					} catch {}
					return connection.destroy()
				})
			} else {
				server.tries++;
				playTack(interaction, `:warning: Une érreur est survenue (essaie ${server.tries}/3)...`)
				return setTimeout(() => {
					server.tries = 0
				}, 30000)
			}
		}
	});

	connection.subscribe(audioPlayer);

	server.dispatcher = audioPlayer;
	server.connection = connection;
	server.resource = resource
	afk = false

	if(!noShift) server.queue.shift();

	audioPlayer.once(AudioPlayerStatus.Idle, () => {
		if (server.queue[0]) {
			server.lastTrack = server.currentTrack
			server.currentTrack = server.queue[0];
			return playTrack(interaction);
		} else {
			server.lastTrack = server.currentTrack
			server.currentTrack = {
				name: 'Rien pour le moment.',
				id: ''
			}
			afk = true;
			setTimeout(() => {
				if(afk === false) return
				afk = false
				if(connection.state.status !== 'ready') return;
				connection.disconnect()
			}, 120000)
		}
	})

	connection.on(VoiceConnectionStatus.Disconnected, () => {
		if(connection.state.status !== 'destroyed') connection.destroy();
		else return;
	});

	connection.on(VoiceConnectionStatus.Destroyed, () => {
		// writeQueue(interaction.guild.id)
	});

	// client.on('voiceStateUpdate', (oldState, newState) => {
	// 	if (oldState.member.user.bot) return;
	// 	if (oldState.channelId === null || typeof oldState.channelId == 'undefined') return;
	// 	if(oldState.channelId !== voiceChannel.id) return
	// 	if(interaction.guild.channels.cache.get(oldState.channelId).members.size === 1) {
	// 		afk = true;
	// 		setTimeout(() => {
	// 			if(afk === false) return
	// 			afk = false
	// 			if(connection.state.status !== 'ready') return;
	// 			connection.destroy()
	// 		}, 30000)
	// 	}
	// })

	if(!msg) {
		const trackData = await spSr.getTrack(server.currentTrack.id);
		// let artists = []
		// trackData.artists.forEach(e => artists.push(e.name))
		reply(interaction, `:notes: En train de jouer :`)
		return interaction.channel.send(server.currentTrack.url)
	} else if(msg === 'none') {
		return
	} else {
		try {
		   return reply(interaction, msg)
		} catch {}
	}
};

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand() || interaction.user.bot) return;

	const serverId = interaction.guild.id;

    const data = await database.findById(serverId)
    if(!data) {
        prefix = config.defaultPrefix
        await new database({
            _id: serverId,
            prefix: config.defaultPrefix,
            volume: 100,
            djOnly: {
                enabled: false
            }
        }).save()
    }

	const args = interaction.options.data
	const command = interaction.commandName

	let djOnlyRole = null;
	if(data.djOnly.enabled) {
		await interaction.guild.roles.fetch();
		djOnlyRole = interaction.guild.roles.cache.get(data.djOnly.roleId)
	}

	if (!servers.has(serverId)) {
		// const loadedQueue = await loadQueue(serverId)
		servers.set(serverId, {
			queue: [], //loadedQueue.next,
			currentTrack: {
				name: "Rien pour le moment.",
				url: ""
			}, //loadedQueue.current,
			lastTrack: {name:"",id:""}, //loadedQueue.previous,
			dispatcher: null,
			connection: null,
			resource: null,
			cooldown: false,
      		timeout: null,
			currentVol: data.volume,
			tries: 0,
			djOnly: {
				enabled: data.djOnly.enabled,
				role: djOnlyRole || null
			},
			startedDate: null,
		});
	}

	const server = servers.get(serverId);

	logger.command(`${interaction.user.tag} issued command /${command}${args.map(e=>e=` ${e.name}="${e.value}"`).join('')}`)

	// ping
	if (command === "ping") {
		await interaction.reply({ content: 'Pinging...', fetchReply: true }).then(msg => {
			interaction.editReply(`Pong 🏓, l'envoie du interaction a pris : **${msg.createdTimestamp - interaction.createdTimestamp} ms**. ${client.ws.ping ? `\nLe ping du serveur websocket est de :** ${Math.round(client.ws.ping)} ms**.` : ''}`)
		})
	}

	// help
	else if (command === "help" || command === "?") {
		const utils = commands.filter(e => e.category === "util")
		const musics = commands.filter(e => e.category === "music")
		let utilString = utils.map(e => e = `> \`/${e.name}\` : ${e.description}\n`).join('');
		let musicString = musics.map(e => e = `> \`/${e.name}\` : ${e.description}\n`).join('');

		const helpEmbed = new Discord.MessageEmbed()
			.setAuthor({ name: `Commandes ${client.user.username} :`, iconURL: client.user.displayAvatarURL()})
			.setColor('#2f3136')
			.addFields({
				name: "**👤・Utilitaires :**",
				value: utilString
				// value: `> \`/ping\` : renvoie le temp de reponse en *ms* du bot.\n` +
				// 	`> \`/prefix [prefix]\` : change le prefix tu bot, exemple : \`/prefix ` + (prefix === "-" ? "!" : "-" ) + "`.\n" +
				// 	`> \`/djonly <on|off> [@role]\` : permet de configurer le mode dj, seul les membres possédant le role mentionné pouvrons utiliser les commandes de musiques.\n` +
				// 	`> \`/bot\` : renvois un lien pour ajouter le bot.\n` +
				// 	`> \`/support\` : renvois un lien pour rejoindre le serveur de support.\n` +
				// 	`> \`/link\` : renvois les liens utiles.\n`
			}, {
				name: "**:notes:・Musiques :**",
				value: musicString
				// value: `> \`/play <musique>\` : recherche de la musique sur YouTube puis la joue.\n` +
				// 	`> \`/playlist <playlist>\` : recherche une playlist depuis YouTube et la joue.\n` +
				// 	`> \`/queue [page]\` : affiche les musiques dans la file d'attente.\n` +
				// 	`> \`/clear-queue\` : supprime la file d'attente.\n` +
				// 	`> \`/del-track <numéro de la musique>\` : supprime un morceau de la file d'attente.\n` +
				// 	`> \`/skip\` : passe a la musique suivante.\n` +
				// 	`> \`/skipto <nombre>\` : passe a la musique demandé.\n` +
				// 	`> \`/clear-queue\` : efface toute la file d'attente.\n` +
				// 	`> \`/leave\` : quitte le channel vocale.\n` +
				// 	`> \`/join\` : rejoins le channel vocale dans lequel vous vous trouvez.\n`+
				// 	`> \`/pause\` : alterne pause/play.\n` +
				// 	`> \`/replay\` : rejoue la musique en cours, si aucune musique n'est spécifié, rejoue la dernière musique écouté.\n` +
				// 	`> \`/previous\` : joue la musique précédente.\n` +
				// 	`> \`/volume [nombre]\` : change le volume du bot.\n`
			}, {
				name: "*<> = obligatoire, [] = facultatif*",
				value: "** **",
			})
			.setTimestamp()
			.setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({dynamic: true})});

		interaction.reply({
			embeds: [helpEmbed]
		});
	}

	// play
	else if (command === "play" || command === "p") {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return replyEphemeral(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		// cooldown
		if(server.cooldown === false) {
			server.cooldown = true
			server.timeout = setTimeout(() => {
				server.cooldown = false
			}, 1000)
		} else if (server.cooldown === true) {
      server.timeout.refresh()
			return replyEphemeral(interaction, ':hourglass: Veuillez attendre 1 seconde avant de réutiliser cette commande.')
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel

		if (!voiceChannel) {
			return replyEphemeral(interaction, userNotInVoiceChannel);
		}


		if (!args[0].value) {
			return replyEphemeral(interaction, ':x: Arguments invalides !');
		}

		if (!voiceConnection) {
			joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			})
			reply(interaction, `:white_check_mark: Connecté a \`${voiceChannel.name}\``)
		} else if(voiceChannel.id !== voiceConnection.joinConfig.channelId) {
			joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			})
			reply(interaction, `:white_check_mark: Connecté a \`${voiceChannel.name}\``)
		}

		spSr.search({
			q: args[0].value,
			type: "track",
			limit: 1
		}).then(async (results) => {
			if (results.tracks.items[0]) {
				const foundTrack = {
					url: results.tracks.items[0].external_urls.spotify,
					id: results.tracks.items[0].id,
					name: results.tracks.items[0].name,
					duration: results.tracks.items[0].duration_ms
				};

				if (server.currentTrack.url !== "") {
					server.queue.push(foundTrack);
					// const embed = new Discord.MessageEmbed()
					// .setTitle(`:white_ckeck_mark: Ajout a la file d'attente de :`)
					// .setColor(embedColor)
					// const interactionData = {content: foundTrack.url, embeds: [embed]};
					// return interaction.replied ? interaction.channel.send(interactionData) : interaction.reply(interactionData);
					return reply(interaction, ":white_check_mark: Ajout à la file d'attente de :").then(() => {
						interaction.channel.send(foundTrack.url)
					})
				}
				
				server.currentTrack = foundTrack;
				playTrack(interaction);
			} else {
				reply(interaction, ':x: Aucune vidéo trouvé !');
			}
		}).catch(error => {
			if(error == 'Error: Request failed with status code 403') {
				return reply(interaction, ':x: Le bot est temporairement infonctionnel du a une limite de recherche quotidienne.', 'Nous sommes vraiment désolé et faisont tout notre possible pour regler ce genre de problèmes.')
			} else console.log(error.requestData.json.data)
		})

	}

	// playlist
	else if(command === 'playlist' || command === 'pl') {
		// return reply(interaction, ':warning: Une maintenance est en cours due a un bug majeur empechant de faire fonctionner le bot.')

		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		// cooldown
		if(server.cooldown === false) {
			server.cooldown = true
			server.timeout = setTimeout(() => {
				server.cooldown = false
			}, 1000)
		} else if (server.cooldown === true) {
      		server.timeout.refresh()
			return reply(interaction, ':hourglass: Veuillez attendre 1 seconde avant de réutiliser cette commande.')
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}


		if (args.length <= 0) {
			return reply(interaction, ':x: Arguments invalides !');
		}

		if (!voiceConnection) {
			joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			})
			reply(interaction, `:white_check_mark: Connecté a \`${voiceChannel.name}\``)
		} else if(voiceChannel.id !== voiceConnection.joinConfig.channelId) {
			joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			})
			reply(interaction, `:white_check_mark: Connecté a \`${voiceChannel.name}\``)
		}

		// try {

		// } catch (err) {

		// }

		// if (spSr.getAlbum(args[0].value)) {
		// 	const result = await spSr.getAlbum(args[0].value);

		// 	console.log(result)

		// 	// result.items.forEach(async video => {
		// 	// 	await server.queue.push({
		// 	// 		title: decodeEntities(video.title),
		// 	// 		url: video.shortUrl
		// 	// 	});

		// 	// })

		// 	// if (server.currentTrack.id != "") {
		// 	// 	return reply(interaction, ':information_source: Ajout de `' + result.items.length + '` musiques de `' + result.title + '`')
		// 	// }
		// 	// server.currentTrack = server.queue[0];
		// 	// playTack(interaction).then(() => {
		// 	// 	reply(interaction, ':information_source: Ajout de `' + result.items.length + '` musiques de `' + result.title + '`')
		// 	// })
		// } else {
			spSr.search({
				limit: 1,
				q: args[0].value,
				type: 'album'
			}).then(async result => {
				if(result.albums.items[0]) {
					const tracks = await spSr.getAlbum(result.albums.items[0].id)
					tracks.tracks.items.forEach(async track => {
						await server.queue.push({
							name: track.name,
							id: track.id,
							url: track.external_urls.spotify
						})
					})

					if (server.currentTrack.url !== "") {
						await reply(interaction, ':information_source: Ajout de `' + tracks.tracks.items.length + '` musiques de :')
						return interaction.channel.send(result.albums.items[0].external_urls.spotify)
					}
					server.currentTrack = server.queue[0];
					reply(interaction, ':information_source: Ajout de `' + tracks.tracks.items.length + '` musiques de :').then(() => {
						interaction.channel.send(result.albums.items[0].external_urls.spotify)
						return playTrack(interaction)
					})
				} else {
					reply(interaction, ':x: Aucune playlist trouvé !');
				}
			}).catch(error => {
				if(error == 'Error: Request failed with status code 403' || error == "Error: Request failed with status code 400") {
					return reply(interaction, ':x: Le bot est temporairement infonctionnel du a une limite de recherche quotidienne.', 'Nous sommes vraiment désolé et faisont tout notre possible pour regler ce genre de problèmes.')
				} else console.error(error)
			})
		// }
	}

	// search | a fix
	else if (command === "search") {
		return;
		if (args.length <= 0) {
			return reply(interaction, ':x: Arguments invalides !');
		}

		const resultNum = args[0] || 1

		function searchVideo() {
			ytsr(args.join(' '), {
				key: ytKey,
				maxResults: 10,
				type: 'video'
			}).then(async results => {
				if (results.results[0]) {
					let totalRes = results.results.length
					async function getResult(resultNumber) {
						const result = results.results[resultNumber]
						let channelIconUrl;
						await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${result.channelId}&fields=items%2Fsnippet%2Fthumbnails&key=${ytKey}`).then(response => {
							channelIconUrl = response.data.items[0].snippet.thumbnails.default.url
						}).catch(function (error) {
							logger.log(error);
						});

						const embed = new Discord.MessageEmbed()
							.setColor('#ff0000')
							.setAuthor({ name: result.channelTitle, iconURL: `${channelIconUrl}`, url: `https://www.youtube.com/channel/${result.channelId}`})
							.setImage(`https://img.youtube.com/vi/${result.id}/maxresdefault.jpg`)
							.setTitle(`${await decodeEntities(result.title)}`)
							.setURL(result.link)
							.setDescription(`Publiée le ${convertDate(result.publishedAt, '')}`)
							.setFooter(`Résultat ${resultNumber}/${totalRes}`)

						return embed;
					}
					interaction.channel.send({ content: "Voici ce que j'ai trouvé pour `" + args.join(" ") + "` :", embeds: [ getResult(resultNum - 1) ] })
				} else {
					reply(interaction, ':x: Aucune vidéo trouvé !');
				}
			})
		}
		try {
			searchVideo()
		} catch {
			logger.error('Statue code 403 when trying to search a youtube video, retrying...')
			searchVideo()
		}
	}

	// queue
	else if (command === 'queue') {
		const voiceConnection = getVoiceConnection(interaction.guild.id);

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel);
		}

		var page = args[0] || 1;
		var numberItems = 10;
		var startingItem = (page - 1) * numberItems;
		var queueLength = server.queue.length;

		var itemPerPage = startingItem + numberItems;
		var totalPages = 1;

		let embed = new Discord.MessageEmbed()
			.setTitle(`File d'attente pour ${interaction.user.username}`)
			.setColor(embedColor);

		function createQueueEmbed(page) {
			startingItem = (page - 1) * numberItems;
			queueLength = server.queue.length;

			itemPerPage = startingItem + numberItems;
			totalPages = 1;

			embed = new Discord.MessageEmbed().setTitle(`File d'attente de ${interaction.guild.name}`).setColor('#2f3136');

			if(server.lastTrack.url) {
				embed.addField('**:track_previous:・ Précédente musique : **', "> [" + server.lastTrack.title + "](" + server.lastTrack.url + ")")
			}

			embed.addField('**:notes:・ En train de jouer : **', "> [" + server.currentTrack.name + "](" + server.currentTrack.url + ")");

			
			if (queueLength > 0) {
				var value = "";

				if (queueLength > numberItems) {
					totalPages = Math.ceil(queueLength / numberItems)
				}

				if (page < 0 || (page) > totalPages) {
					return ":x: Cette page n'existe pas.";
				}

				if ((queueLength - startingItem) < numberItems) {
					itemPerPage = (queueLength - startingItem) + startingItem;
				}

				for (let i = startingItem; i < itemPerPage; i++) {
					const video = server.queue[i];
					if(video.name.length > 40) {
						video.name = video.name.substring(0, 40) + "... ";
					}
					value += "> `" + (i + 1) + ".` " + "[" + video.name + "](" + video.url + ")" + "\n";
					
				}

				embed.addField("**:track_next:・ A venir :**", value);
				embed.addField('** **', "*Clickez sur ⬅️ et ➡️ pour naviguer entre les pages, 🔄 pour rafraichir*")
			}

			embed.setTimestamp();
			embed.setFooter({ text: `Demandé par ${interaction.user.username}  •  Page ${page}/${totalPages}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`});
		}

		try {
			if(typeof createQueueEmbed(page) === "string") {
				return reply(interaction, createQueueEmbed(page));
			} else {
				createQueueEmbed(page);
			}
		} catch (err) {
			console.log(err)
			return reply(interaction, ':x: Le nombre indiqué est invalide ou la musique ne se trouve pas dans la file d\'attente')
		}

		const btn1 = new MessageButton()
		.setStyle('SECONDARY')
		.setEmoji('⬅️')
		.setCustomId('pageLeft');

		const btn2 = new MessageButton()
		.setStyle('SECONDARY')
		.setEmoji('➡️')
		.setCustomId('pageRight')

		const btn3 = new MessageButton()
		.setStyle('SECONDARY')
		.setEmoji('🔄')
		.setCustomId('refresh')

		const btn = new MessageActionRow()
		.addComponents([ btn1.setDisabled(page <= 1 ? true : false ), btn2.setDisabled(page >= totalPages ? true : false), btn3 ])

		await interaction.reply({ embeds: [embed], components: [ btn ], fetchReply: true }).then(async repliedInteraction => {
			client.on('interactionCreate', async interaction2 => {
				if(!interaction2.isButton()) return;
				if(repliedInteraction.id !== interaction2.message.id) return;
				if(interaction2.user.id !== interaction.member.id) {
					return interaction2.reply({ ephemeral: true, embeds: [genEmbed(":x: Vous n'avez pas la permission d'utiliser ce menu.")] })
				}

				if(interaction2.customId === "pageLeft") {
					try {
						interaction2.deferUpdate();
						if(page <= 1) page = 1; else page--;
						createQueueEmbed(page)
						const row = new MessageActionRow().addComponents([ btn1.setDisabled(page <= 1 ? true : false ), btn2.setDisabled(page >= totalPages ? true : false ), btn3 ])
						return repliedInteraction.edit({ embeds: [embed], components: [row] })
					} catch (err) { logger.log() }
				} else if(interaction2.customId === "pageRight") {
					try {
						interaction2.deferUpdate();
						if(page >= totalPages) page = totalPages; else page++;
						createQueueEmbed(page)
						// embed.setFooter({ text: `Demandé par ${interaction.author.username}  •  Page ${page}/${totalPages}`, iconURL: `${interaction.author.displayAvatarURL({ dynamic: true })}` })
						const row = new MessageActionRow().addComponents([ btn1.setDisabled(page <= 1 ? true : false ), btn2.setDisabled(page >= totalPages ? true : false ), btn3 ])
						return repliedInteraction.edit({ embeds: [embed], components: [row] })
					} catch (err) { logger.log() }
				} else if(interaction2.customId === "refresh") {
					interaction2.deferUpdate();
					createQueueEmbed(page)
					const row = new MessageActionRow().addComponents([ btn1.setDisabled(page <= 1 ? true : false ), btn2.setDisabled(page >= totalPages ? true : false ), btn3 ])
					return repliedInteraction.edit({ embeds: [embed], components: [row] })
				}
			})
		})
	}

	// del-track
	else if (command === 'del-track' || command === "dt") {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);

		if (!voiceConnection) return reply(interaction, botNotInVoiceChannel);

		if(!args[0]) return reply(interaction, ':x: Arguments invalides, utilisation de la commande : `' + prefix + 'del-track <chiffre de la musique a suprimmer dans la file d\'attente>`')

		let trackNumber = Number(args[0]) - 1;

		if(server.queue[trackNumber]) {
			await reply(interaction, ':white_check_mark: `' + server.queue[trackNumber].title + '` suprimmé de la file d\'attente')
			return server.queue.splice(trackNumber, 1);
		} else {
			return reply(interaction, ':x: Le nombre indiqué est invalide ou la musique ne se trouve pas dans la file d\'attente')
		}
	}

	// skip
	else if (command === "skip" || command === 's') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel)
		}

		if (!server.queue[0]) {
			server.currentTrack = {
				url: "",
				title: "Rien pour le moment."
			}
			return reply(interaction, emptyQueue);
		}

		server.lastVideo = server.currentTrack
		server.currentTrack = server.queue[0]
		server.queue.shift();
		playTack(interaction, ":track_next: Musique en cours : `" + server.currentTrack.name + "`", true)

	}

	// skipto
	else if (command === 'skipto' || command === 'st') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel;

		var index = Number(args[0])

		if (index === undefined || index === ' ' || typeof index !== "number") {
			index = 1
		}

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel)
		}

		index--;

		if (!server.queue[index]) {
			return reply(interaction, emptyQueue);
		}

		server.lastVideo = server.currentTrack
		server.currentTrack = server.queue[index];
		playTack(interaction, ":track_next: Musique en cours : `" + server.currentTrack.name + "`")
		server.queue.splice(0, index);
	}

	// clear queue
	else if (command === 'clear-queue') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		server.queue = [];
		// writeQueue(serverId)
		reply(interaction, ":white_check_mark: File d'attente éffacé avec succès !");
	}

	// leave
	else if (command === 'leave') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel);
		}

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		voiceConnection.destroy();
		// writeQueue(serverId)
		server.connection = getVoiceConnection(serverId);
		server.currentTrack = {
			title: "Rien pour le moment",
			url: ""
		}

		return reply(interaction, ":white_check_mark: Déconnecté");
	}

	// join
	else if (command === 'join') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		await joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		})

		server.connection = getVoiceConnection(serverId);

		reply(interaction, `:white_check_mark: Connecté a \`${voiceChannel.name}\``)
	}

	// pause
	else if (command === 'pause') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const dispatcher = server.dispatcher;

		if (!interaction.member.voice.channel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel);
		}

		if (server.currentTrack.id === '') {
			return reply(interaction, ':x: Aucune musique en cours de lecture.')
		}

		if (dispatcher) {
			if(dispatcher.state.status === 'playing') {
				dispatcher.pause();
				return reply(interaction, ":pause_button: Pause")
			} else if(dispatcher.state.status === 'paused') {
				dispatcher.unpause();
				return reply(interaction, ":arrow_forward: Reprise")
			}
		}

		reply(interaction, ':x: Une erreur est survenue.')
	}

	//replay
	else if (command === "replay" || command === "re") {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel)
		}

		if (!server.currentTrack.id) {
			if(!server.lastVideo.url) {
				return reply(interaction, ':x: Aucune musique a rejouer')
			} else {
				server.currentTrack = server.lastVideo
				return playTrack(interaction, ":repeat: En train de jouer : `" + server.currentTrack.name + "`", true)
			}
		}

		playTrack(interaction, ":repeat: En train de jouer : `" + server.currentTrack.name + "`", true)
	}

	//back
	else if (command === 'back') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return reply(interaction, userNotInVoiceChannel);
		}

		if (!voiceConnection) {
			return reply(interaction, botNotInVoiceChannel)
		}

		if (!server.currentTrack.id) {
			if(!server.lastVideo.url) {
				return reply(interaction, ':x: Aucune musique a rejouer')
			} else {
				server.currentTrack = server.lastVideo
				return playTrack(interaction, ":track_previous: En train de jouer : `" + server.currentTrack.name + "`", true)
			}
		}

		server.lastVideo = [server.currentTrack, server.currentTrack = server.lastVideo][0];

		playTrack(interaction, ":track_previous: En train de jouer : `" + server.currentTrack.name + "`", true)
	}

	// dj role
	else if (command === 'djonly') {
		// if(!interaction.member.permissions.has('MANAGE_GUILD')) return reply(interaction, ":x: Vous n'avez pas les permissions de faire ceci !");
		let data = await database.findById(serverId);
		server.djOnly.enabled = data.djOnly.enabled
		if(data.djOnly.enabled) {
			server.djOnly.role = interaction.guild.roles.cache.get(data.djOnly.roleId)
		}

		const interactionId = randomUUID()

		function genDjOnlyRow(disabled) {
			const btn1 = new Discord.MessageButton()
			const row = new Discord.MessageActionRow()

			if(server.djOnly.enabled) {
				btn1.setStyle('DANGER')
				.setLabel('Désactiver')
				.setCustomId(`${interactionId}-disableDjOnly`)
				.setDisabled(disabled ? true : false)
			} else if(!server.djOnly.enabled) {
				btn1.setStyle('SUCCESS')
				.setLabel('Activer')
				.setCustomId(`${interactionId}-enableDjOnly`)
				.setDisabled(disabled ? true : false)
			}
			row.addComponents([btn1])

			if(server.djOnly.role) {
				row.addComponents([
					new Discord.MessageButton()
					.setStyle('SECONDARY')
					.setLabel('Modifier le rôle')
					.setCustomId(`${interactionId}-editDjOnlyRole`)
					.setDisabled(disabled ? true : false)
				])
			}

			return row;
		}

		await interaction.reply({embeds: [genEmbed(`🎧 Le mode DJ est actuellement ${server.djOnly.enabled ? "activé pour le role `" + server.djOnly.role.name + "`" : 'désactivé'}`)], components: [genDjOnlyRow()]})
		.then(() => {
			client.on('interactionCreate', async interaction2 => {
				if(!interaction2.isButton()) return;
				if(interaction2.user.id !== interaction.user.id) {
					return interaction2.reply({ ephemeral: true, embeds: [genEmbed(":x: Vous n'avez pas la permission d'utiliser ce bouton.")] })
				}

				if(!interaction2.customId.startsWith(interactionId)) return

				if(interaction2.customId.endsWith('disableDjOnly')) {
					if(!interaction2.deferred) interaction2.deferUpdate()
					data = await database.findById(serverId)

					data.djOnly = false

					await data.save().then(() => {
						server.djOnly.enabled = false
						interaction2.interaction.edit({embeds: [genEmbed(`🎧 Le mode DJ est actuellement ${server.djOnly.enabled ? "activé pour le role `" + server.djOnly.role.name + "`" : 'désactivé'}`)], components: [genDjOnlyRow()]})
						return reply(interaction, `:white_check_mark: Mode DJ désactivé avec succès !`).then(msgg => {
							setTimeout(() => {
								try { msgg.delete() }
								catch (err) {}
							}, 5000)
						})
					})
				} else if(interaction2.customId.endsWith('enableDjOnly') || interaction2.customId.endsWith('editDjOnlyRole')) {
					if(!interaction2.deferred) interaction2.deferUpdate()
					data = await database.findById(serverId)

					if(!server.djOnly.role || interaction2.customId.endsWith('editDjOnlyRole')) {

						interaction2.interaction.edit({embeds: [genEmbed(`🎧 Le mode DJ est actuellement ${server.djOnly.enabled ? "activé pour le role `" + server.djOnly.role.name + "`" : 'désactivé'}`)], components: [genDjOnlyRow(true)]})
						reply(interaction, 'Merci de mentionner ci-dessous le rôle que vous voulez utiliser pour le mode DJ').then((roleMsg) => {
							interaction.channel.awaitinteractions({
								filter: (m) => m.author.id === interaction.user.id,
								max: 1,
								time: 30000,
								errors: ['time']
							}).then(async interactions => {
								const msg = interactions.first()
								await interaction.guild.roles.fetch()
								if(interaction.guild.roles.cache.get(msg.content) || msg.mentions.roles.first()) {
									try {
										if(roleMsg.deletable) roleMsg.delete()
										if(msg.deletable) msg.delete()
									} catch {}
									const role = msg.mentions.roles.first() || interaction.guild.roles.cache.get(msg.content)
									data = await database.findById(serverId);

									data.djOnly.enabled = true;
									data.djOnly.roleId = role.id;

									await data.save().then(() => {
										server.djOnly.enabled = true
										server.djOnly.role = role
										interaction2.interaction.edit({embeds: [genEmbed(`🎧 Le mode DJ est actuellement ${server.djOnly.enabled ? "activé pour le role `" + server.djOnly.role.name + "`" : 'désactivé'}`)], components: [genDjOnlyRow(false)]})
										return reply(interaction, `:white_check_mark: Mode DJ défini avec succès !`).then(msgg => {
											setTimeout(() => {
												try { msgg.delete() }
												catch (err) {}
											}, 5000)
										})
									})
								}
							})
						})

					} else {

						data.djOnly = true

						await data.save().then(() => {
							server.djOnly.enabled = true
							interaction2.interaction.edit({embeds: [genEmbed(`🎧 Le mode DJ est actuellement ${server.djOnly.enabled ? "activé pour le role `" + server.djOnly.role.name + "`" : 'désactivé'}`)], components: [genDjOnlyRow()]})
							return reply(interaction, `:white_check_mark: Mode DJ activé avec succès !`).then(msgg => {
								setTimeout(() => {
									try { msgg.delete() }
									catch (err) {}
								}, 5000)
							})
						})
					}
				}
			})
		})
	}

	// add-bot
	else if (command === 'invite') {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setStyle('LINK')
				.setURL(config.inviteLink)
				.setLabel('Click ICI')
			)

		interaction.reply({
			embeds: [genEmbed("Tu peut m'ajouter sur ton serveur en cliquant sur ce bouton !")],
			components: [row]
		})
	}

	// support
	else if (command === 'discord' || command === 'support') {

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setStyle('LINK')
				.setURL(config.discordInvite)
				.setLabel('Click ICI')
			)

		interaction.reply({
			embeds: [genEmbed(`En cas de problème ou de demande particulière, vous pouvez peut rejoindre le serveur de support en cliquant sur ce bouton ou contacter \`${client.users.cache.get(ownerId).tag}\`.`)],
			components: [row]
		})
	}

	// link
	else if (command === 'link' || command === 'liens') {
		let row;

		function genRow(isDefault) {
			const options = [
				{
					emoji: '879789835462803497',
					label: 'Notre bot de musique',
					description: 'Un bot discord de musique développé par la NightCorp',
					value: 'musicBot',
					default: isDefault === "musicBot" ? true : false
				},
				{
					emoji: '879789835462803497',
					label: 'Notre bot multifonctions',
					description: 'Un bot discord multifonctions développé par la NightCorp',
					value: 'nightBot',
					default: isDefault === "nightBot" ? true : false
				},
				{
					emoji: '861300762693206056',
					label: 'Notre serveur support',
					description: "Le serveur discord officiel de la NightCorp",
					value: 'discord',
					default: isDefault === "discord" ? true : false
				}
			]

			row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.addOptions(options)
				.setPlaceholder('Clickez ici pour dérouler la liste')
				.setCustomId('menu')
			)

		}

		genRow()
		interaction.channel.send({
			content: 'Clickez sur un lien parmis cette liste.',
			components: [row]
		}).then(msg => {
			client.on('interactionCreate', async (interaction, menu) => {
				if(!interaction.isSelectMenu()) return;
				if(!interaction.customId === 'menu') return;
				if(interaction.interaction.id !== msg.id) return;
				if(interaction.user.id !== interaction.member.id) {
					return interaction.reply({ ephemeral: true, embeds: [genEmbed(":x: Vous n'avez pas la permission d'utiliser ce menu.")] })
				}

				if (interaction.values == 'discord') {
					genRow('discord')
					interaction.update({ content: `Notre serveur discord : ${serverLink}`, components: [row]})
				} else if (interaction.values == 'musicBot') {
					const botLinkBtn = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setStyle('LINK')
							.setURL(inviteLink)
							.setLabel('Click ICI')
					)
					genRow('musicBot')

					interaction.update({ content: 'Ajoute NightMusic sur ton server : ', components: [botLinkBtn, row]})
				} else if(interaction.values == 'nightBot') {
					const botLinkBtn = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setStyle('LINK')
							.setURL(nightBotInviteLink)
							.setLabel('Click ICI')
					)
					genRow('nightBot')

					interaction.update({ content: 'Ajoute NightBot sur ton server : ', components: [botLinkBtn, row]})
				}
			})
		})
	}

	// eval
	else if (command === "eval") {
		if (interaction.user.id !== ownerId) return;
		let arg;
		if(args[0].name === "console") {
			arg = args.find(e=>e.name="console").options.find(e=>e.name="code").value

			try {
				logger.log(eval(arg));
				interaction.reply({content: 'Code executé avec succès', ephemeral: true})
			} catch (err) {
				logger.error(err)
				if(inspect(err).length < 1900) err = inspect(err);
				return interaction.reply(":x: [ERROR] : ```console\n" + err + "\n```")
			}

		} else if(args[0].name === "reply") {
			arg = args.find(e=>e.name="reply").options.find(e=>e.name="code").value

			try {
				const response = eval(arg);
				let result = response;
				if(typeof response !== "string") {
					if(inspect(result).length < 1900) result = inspect(result);
					return interaction.reply("```js\n" + result + "\n```")
				} else {
					return interaction.reply(result)
				}
			} catch (err) {
				logger.error(err)
				if(inspect(err).length < 1900) err = inspect(err);
				return interaction.reply(":x: [ERROR] : ```console\n" + err + "\n```")
			}
		}
	}

	// volume
	else if (command === 'volume' || command === 'vol' || command === 'v') {
		if(server.djOnly.enabled) {
			if(server.djOnly.role) {
				await interaction.guild.members.fetch()
				if(!interaction.member.roles.cache.has(server.djOnly.role.id)) {
					return reply(interaction, ':x: Vous devez avoir le role `' + server.djOnly.role.name + "` pour pouvoir utiliser cette commande")
				}
			}
		}

		const voiceConnection = getVoiceConnection(interaction.guild.id);

		const arg = Number(args.join(' '));

		if(arg > 100 || arg < 0) return reply(interaction, ':x: Vous devez donner un nombre entre 1 et 100.');

		if (!arg && arg !== 0) {
			prefixDb.findById(serverId, async (err, data) => {
				if (err) {
					logger.error(err)
					reply(interaction, ":x: Une erreur s'est produite :/")
				} else {
					volume = data.volDb;
					var emoji;

					if (volume === 0) {
						emoji = ':mute:';
					} else if (volume <= 25 && volume !== 0) {
						emoji = ':speaker:';
					} else if (volume <= 75 && volume > 25 && volume !== 0) {
						emoji = ':sound:'
					} else if (volume <= 100 && volume > 75 && volume !== 0) {
						emoji = ':loud_sound:'
					}


					return reply(interaction, emoji + ' Volume : `' + volume + "%`")
				}
			})
		} else {
			prefixDb.findById(serverId, async (err, data) => {
				if (err) {
					logger.error(err)
					reply(interaction, ":x: Une erreur s'est produite :/")
				} else {
					prefixDb.findOneAndDelete({
						_id: serverId
					}) .then(() => {
						const voldb = new prefixDb({
						_id: serverId,
						prefixDb: prefix,
						volDb: arg,
						djOnly: false,
						djRoleId: null
					});
						voldb.save()
					});
					volume = arg;
					server.currentVol = volume

					if(voiceConnection) {
						await server.resource.volume.setVolumeLogarithmic(volume / 100);
					}

					var emoji;
					if (arg === 0) {
						emoji = ':mute:';
					} else if (arg <= 25 && arg !== 0) {
						emoji = ':speaker:';
					} else if (arg <= 75 && arg > 25 && arg !== 0) {
						emoji = ':sound:'
					} else if (arg <= 100 && arg > 75 && arg !== 0) {
						emoji = ':loud_sound:'
					}
					return reply(interaction, emoji + ' Volume défini a `' + volume + "%`")
				}
			})
		}
	}

	// restart
	else if (command === 'restart') {
		if(interaction.user.id !== ownerId) return replyEphemeral(interaction, ":x: Seul le propriétaire du bot peut éxécuter cet commande");
		// await interaction.deferReply()

		async function restartServer() {
			const msg = await reply(interaction, '<a:loading:914152886856982609> Restarting...', undefined, '#ff7f00')

			const data = {
				interactionId: msg.id,
				channelId: msg.channelId,
				type: msg.type
			}
			fs.writeFile("./latestRestart.json", JSON.stringify(data, null, 4), (err) => {});
			client.user.setActivity('restarting the bot', { type: 'PLAYING' })
			client.user.setStatus('dnd')

			setTimeout(() => {
				process.exit(418)
			}, 500);
		}
		
		if(servers.size >= 1) {
			let isPlaying = false

			if(!isPlaying[0]) return await restartServer();

			const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setStyle('DANGER')
				.setLabel('Restart anyway')
				.setCustomId('restartBtn')
			)

			interaction.replied ? interaction.interaction.channel.send({ content: "A server is currently listenning to music, are you sure you want to restart the server ?", components: [row] }).then(msg => {
				client.on('interactionCreate', async interaction => {
					if(!interaction.isButton()) return
					if(interaction.interaction.id !== msg.id) return;
					if(interaction.customId === 'restartBtn') {
						if(interaction.user.id !== ownerId) return
						interaction.deferUpdate()
						return await restartServer()
					}
				})
			}) : interaction.reply({ content: "A server is currently listenning to music, are you sure you want to restart the server ?", components: [row] }).then(msg => {
				client.on('interactionCreate', async interaction => {
					if(!interaction.isButton()) return
					if(interaction.interaction.id !== msg.id) return;
					if(interaction.customId === 'restartBtn') {
						if(interaction.user.id !== ownerId) return
						interaction.deferUpdate()
						return await restartServer()
					}
				})
			})
		}
	}

	// fetch all server invites
	else if (command === 'invites') {
		if(interaction.author.id !== ownerId) return reply(interaction, ':x: Vous n\'avez pas les permissions de faire ceci');

		await client.guilds.fetch()
		logger.log()
		logger.log(`Total servers of `.green+`${client.user.tag}`.white+` (size : `.green + `${client.guilds.cache.size}`.yellow + `) :`.green)
		client.guilds.cache.forEach(async (guild) => {
			const channel = guild.channels.cache
				.filter(channel => channel.type === 'GUILD_TEXT')
				.first();
			if (!channel) return;
			await channel
			.createInvite({ maxAge: 0, maxUses: 0 })
			.then(async (invite) => {
				logger.log(`  - ${guild.name} (`.green+`${guild.id}`.yellow+`) => `.green+`${invite.url}`.blue);
			}).catch((error) => logger.log(error));
		});
	}

	// create an invite link from a server id
	else if(command === "get-invite") {
		if(interaction.author.id !== ownerId) return reply(interaction, ':x: Vous n\'avez pas les permissions de faire ceci');

		await client.guilds.fetch()
		const guild = client.guilds.cache.get(args[0]);
		if(guild) {
			const channel = guild.channels.cache
				.filter(channel => channel.type === 'GUILD_TEXT')
				.first();
			if (!channel) return;
			await channel
			.createInvite({ maxAge: 0, maxUses: 0 })
			.then(async (invite) => {
				interaction.channel.send(`:white_check_mark: Sucess : **${guild.name}** (${guild.id}) => ${invite.url}`);
			}).catch((error) => {
				reply(interaction, `:x: An error uccured : \`\`\`js\n${inspect(error)}\`\`\``)
				logger.log(error);
			});
		} else return reply(interaction, ":x: Invalid id")
	}

	// admin
	else if(command === "admin") {
		if(interaction.author.id !== ownerId) return reply(interaction, ':x: Vous n\'avez pas les permissions de faire ceci');

		let currentlyListening = new Array;
		servers.forEach(e => {
			if(e.currentVideo.url !== "") {
				currentlyListening.push(e)
			} else return
		})
		logger.log(currentlyListening)

		const embed = new Discord.MessageEmbed()
		.setTitle('Informations Administrateur')
		.addFields({ name: "Total servers", value: String(servers.size), inline: true },
			{ name: 'Total servers listenning to music', value: currentlyListening.size ?  String(currentlyListening.size) : "0", inline: true }
		)

		const row = new Discord.MessageActionRow()
		.addComponents(new Discord.MessageButton()
		.setCustomId('adminErrors')
		.setLabel('errors')
		.setStyle('SECONDARY'))

		interaction.channel.send({ embeds: [embed], components: [row] }).then(msg => {
			client.on('interactionCreate', interaction => {
				if(!interaction.isButton()) return
				if(interaction.interaction.id !== msg.id) return
				if(interaction.member.id !== ownerId) return

				if(interaction.customId === "adminErrors") {
					let latestError = require('./latestError.json')

					if(latestError) {
						const embed = new Discord.MessageEmbed()
						.setTitle('Last error')
						.addField('command : :(', inspect(latestError))
					} else {
						interaction.update({ content: "no last error", components: []})
					}

				}
			})
		})

		// faire un embed qui affiche des informations utile avec des bouttons pour changer de catégorie
		// catégories : 3 derniere command utilisé excluant les commandes admin bien sure
		// derniere erreur et cause de l'érreur
		// nombre de serveur écoutant de la musique avec un boutton pour rafraichir
	}

	// uptime
	else if(command === "uptime") {
		interaction.reply(ms(Math.floor(process.uptime()*1000)))
	}

	// account
	else if(command === "account") {
		const embed = new Discord.MessageEmbed()
		.setTitle("Merci d'utiliser notre site internet pour vous connecter a spotify")
		.setColor(embedColor);

		const row = new Discord.MessageActionRow()
		.setComponents(new Discord.MessageButton()
		.setStyle('URL')
		.setURL(`http${config.ssl ? "s" : ""}://${config.domain}`)
		.setLabel(config.domain))
		
		interaction.channel.send({embeds: [embed], components: [row]})

	}

	else {
		if(command === '' || command === ' ') return;
		return reply(interaction, `:x: Commande inconnue, pour aficher toute les commandes, tapez \`${prefix}help\``)
	}
});

client.on('messageCreate', async message => {
	if (message.author.bot || message.channel.type === 'DM') return;
	const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`)

	if (message.content.match(prefixMention)) {
		sendEmbed(message, 'Je fonctionne uniquement avec les commandes (/) !')
	}
})

client.on("ready", async function () {
	try {
		logger.loader('[Discord API] Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: commands },
		);
		logger.loader('[Discord API] Successfully reloaded application (/) commands.');
	} catch (error) {
		logger.error('[Discord API] Failed to refresh application (/) commands.')
		logger.error(error);
	}

	await mongoose.connect('mongodb+srv://gcknroot:totoduf"@nightbot.oo2z0.mongodb.net/SpotiCord?retryWrites=true&w=majority', {
		useUnifiedTopology: true,
		useNewUrlParser: true
	}).then(async () => {
		logger.database('✅ MongoDB connected'.green);
	});

	const date = Date.now()
	logger.loader('Fetching all guildMembers...'.yellow)
	await client.guilds.fetch();
	for (const [id, guild] of client.guilds.cache) {
	  await guild.members.fetch().catch(err => {
		logger.error(err)
	  })
	}
	logger.loader(`Fetched sucessfully in ${Date.now() - date}ms`.yellow)

	// var stateStatus = 0;
	// let statuses = [
	//     `sur ${client.guilds.cache.size} serveurs`,
	//     `${defaultPrefix}help pour voir toutes les commandes`,
	//     `dev par ${client.users.cache.get(ownerId).tag}`,
	//     `discord.io/nightcorp`,
	//     `préfix : ${defaultPrefix}`,
	//     `${client.users.cache.size} utilisateurs`
	// ];
	// setInterval(function () {
	//     let status = statuses[stateStatus++];
	//     if (stateStatus > 5) stateStatus = 0;
	//     client.user.setActivity(status, { type: "LISTENING" });
	// }, 5000)

	client.user.setActivity(`/help・sur ${client.guilds.cache.size} serveurs`, { type: "STREAMING", url: "https://twitch.tv/konixy_" });

	client.user.setStatus('idle');

	logger.start(`Logged in as `.green + `${client.user.tag}`.white);

	let restartDb;

	try {
		restartDb = require('./latestRestart')
	} catch {
		return;
	}

	try {
		if(restartDb.interactionId) {
			const msg = await client.channels.cache.get(restartDb.channelId).interactions.fetch(restartDb.interactionId)
			const embed = new Discord.MessageEmbed()
				.setColor('#378805') // orange #ff7f00
				.setDescription(`<:oui:712306416295084143> Succesfully restarted in ${Date.now() - msg?.createdTimestamp}ms`)

			if(msg?.editedTimestamp) return;

			msg.edit({ embeds: [embed] }).then(() => {
				return logger.start('Restart state detected, successfully editing interaction')
			})

		} else {
			return
		}
	} catch (err) {
		console.error(err)
	}
});

client.on('error', (error) => {
	logger.error(error);
	if(inspect(error).length < 1900) error = inspect(error);
	client.users.cache.get(ownerId).send("[ERROR] ```js\n" + error + "\n```");
});

process.on("unhandledRejection", (error) => {
	try {
		if(error.interaction.includes('Status code: 410')) return
	} catch {}
	logger.error(inspect(error));
	if(inspect(error).length < 1900) error = inspect(error);
	try {
		if(error.code === 'ABORT_ERR') return;
	} catch (err) {}
	// client.users.cache.get(ownerId).send("[ERROR] ```js\n" + error + "\n```")
})

process.on('exit', async () => {
	servers.entries().forEach(server => {
		writeQueue(server[0])
	})
})

client.login(config.token);