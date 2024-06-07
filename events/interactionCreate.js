const { Collection, ButtonStyle, EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json"); 
const Discord = require("discord.js");
const edb = require("croxydb")
const { readdirSync } = require("fs");
const Rank = require("../func/Rank.js");
const AddRank = require("../func/AddRank.js")
const { createButton, deleteMessageButton } = require("../function/functions");
const RemoveRank = require("../func/RemoveRank.js")
const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField } = require('discord.js');
const moment = require("moment");
  require("moment-duration-format");
  const os = require("os");

module.exports =  {
name: Discord.Events.InteractionCreate,

  run: async(client, interaction) => {
  if(interaction.isChatInputCommand()) {

    if (!interaction.guildId) return;

    readdirSync('./commands').forEach(f => {

      const cmd = require(`../commands/${f}`);

      if(interaction.commandName.toLowerCase() === cmd.name.toLowerCase()) {

		console.log(`Komut kullandı: ${interaction.user.tag} (${interaction.user.id}) (${interaction.guild.name}) `)

       return cmd.run(client, interaction, db, Rank, AddRank, RemoveRank);

      }


    });



  }

  if(interaction.isButton()) {
    const customId = interaction.customId;
    const name = customId.split("_")[0];
    const id = customId.split("_")[1];

    const idFind = (id_name) => {
      return `${id_name}_${id}`;
    } 
  }

  if(interaction.isModalSubmit()) {
    if(interaction.customId === 'ticketforms'){
      const ticketSystem = db.fetch(`ticketSystem_${interaction.guild.id}`)
    
    
      const lvl = db.fetch(`ticketLvl_${interaction.guild.id}`) || 0;
    
      db.add(`ticketLvl_${interaction.guild.id}`, 1)
    
    
      const ticketYetkili = await interaction.guild.roles.cache.find( ch => ch.id === ticketSystem.yetkili );
    
      const ticketCategory = db.fetch(`ticketCategory_${interaction.guild.id}`);
    
      const ticketsebep = interaction.fields.getTextInputValue('ticketInput');
     const channel = await interaction.guild.channels.create({
       name: `talep-${interaction.user.username}-`+lvl,
       type: Discord.ChannelType.GuildText,
       parent: ticketCategory.category,
       permissionOverwrites: [
         {
           id: interaction.guild.id,
           deny: [Discord.PermissionsBitField.Flags.ViewChannel],
         },
          {
           id: interaction.user.id,
           allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
         },
         {
          id: ticketYetkili.id,
          allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
         },
       ],
     });
     const sebepTicket = new Discord.EmbedBuilder()
     .setDescription(`Neden talep açtığını öğrenebilir miyiz?\n> \`${ticketsebep}\``)
     const ticketUserEmbed = new Discord.EmbedBuilder()
     .setAuthor({ name: `${interaction.user.username} | Destek açıldı`, iconURL: `${interaction.user.displayAvatarURL({ dynmaic: true })} ` })
     .setThumbnail(interaction.guild.iconURL({ dynmaic: true }))
     .addFields([ 
      { name: "Destek açan:", value: `${interaction.user}`, inline: true },
      { name: "Açılış zamanı:", value: `<t:${parseInt(channel.createdTimestamp / 1000)}:R>`, inline: true }
     ])
     .setColor('Green')
     .setFooter({ text: `Oluşturan: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynmaic: true })}` })
     .setTimestamp()
     
     const row = new Discord.ActionRowBuilder()
     .addComponents(
       new Discord.ButtonBuilder()
         .setCustomId(`ticketClose_everyone`)
         .setLabel('Destek kapatılsın.')
         .setEmoji("🔒")
         .setStyle(Discord.ButtonStyle.Secondary),
     );
     
      interaction.reply({ content: `:white_check_mark: **|** Senin için bir tane destek kanalı ${channel} oluşturldu.`, ephemeral: true })
    
      db.set(`ticketChannelUser_${interaction.guild.id}${channel.id}`, { user: interaction.user.id })
      db.set(`ticketUser_${interaction.user.id}${interaction.guild.id}`, { whOpen: interaction.user.id, date: Date.now() })
    
      channel.send({ content: `<@${interaction.user.id}> | ${ticketYetkili}`, embeds: [ticketUserEmbed] })
      return channel.send({ embeds: [sebepTicket], components: [row]  })
    
    }

if(interaction.customId === 'giriscikis'){
  const joinMsg = interaction.fields.getTextInputValue('girismesaj')
  .replaceAll("{guild.memberCount}", `${interaction.guild.memberCount}`)
  .replaceAll("{guild.name}", `${interaction.guild.name}`)
  .replaceAll("{owner.name}", `<@${interaction.guild.ownerId}>`)
  .replaceAll("{member}", `<@${client.user.id}>`)
  const leaveMsg = interaction.fields.getTextInputValue('cikismesaj')
  .replaceAll("{guild.memberCount}", `${interaction.guild.memberCount}`)
  .replaceAll("{guild.name}", `${interaction.guild.name}`)
  .replaceAll("{owner.name}", `<@${interaction.guild.ownerId}>`)
  .replaceAll("{member}", `<@${client.user.id}>`)

  const reLeaveMsg = interaction.fields.getTextInputValue('cikismesaj')
  const reJoinMsg = interaction.fields.getTextInputValue('girismesaj')

  const sayacmessage = db.fetch(`sayacmessage_${interaction.guild.id}`)
  const sayacmessageDate = db.fetch(`sayacmessageDate_${interaction.guild.id}`)
  
  if (sayacmessage && sayacmessageDate) {
      const date = new EmbedBuilder()
      .setDescription(`:x: | Bu sistem <t:${parseInt(sayacmessageDate.date / 1000)}:R> önce açılmış!`)
  
  return interaction.reply({ embeds: [date], ephemeral: true })
  }

  const row1 = new Discord.ActionRowBuilder()

  .addComponents(
      new Discord.ButtonBuilder()
          .setLabel("Giriş Çıkış Mesajını Ayarla!")
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId("giriscikismesaj_"+interaction.user.id)
          .setDisabled(true)
  )

  .addComponents(
      new Discord.ButtonBuilder()
          .setLabel("Giriş Çıkış Mesajını Sıfırla!")
          .setStyle(Discord.ButtonStyle.Danger)
          .setCustomId("giriscikismesajsifirla_"+interaction.user.id)
  )
  const embed = new EmbedBuilder()
  .setColor(0x2F3136)
  .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()} ` })
  .setDescription(":white_check_mark: **|** Giriş çıkış mesajı aktif edildi!")
  .addFields([
    {
      name: "Karşılama mesajı:",
      value: "`"+joinMsg+"`",
      inline: false
    },
    {
      name: "Ayrılış mesajı:",
      value: "`"+leaveMsg+"`",
      inline: false
    },
  ]);
  db.set(`sayacmessageDate_${interaction.guild.id}`, { date: Date.now() })
  db.set(`sayacmessage_${interaction.guild.id}`, { joinMsg: reJoinMsg,  leaveMsg: reLeaveMsg })

  return interaction.update({ embeds: [embed], components: [row1] })


  }
	
  }

    const butonrol = db.fetch(`buton_rol${interaction.guild.id}`)
    if(butonrol)
    if (!interaction.isButton()) return;
    if(interaction.customId === "rol_everyone") {
        if(!interaction.member.roles.cache.has(butonrol)) { 
        interaction.member.roles.add(butonrol)
      interaction.reply({content: ":white_check_mark: | Rol Başarıyla Verildi!", ephemeral: true})
       } else {
         
        interaction.member.roles.remove(butonrol)
      interaction.reply({content: ":x: | Rol Başarıyla Alındı!", ephemeral: true})
    }
      }



        if (!interaction.isButton()) return;
        if (interaction.customId === "moderasyon_"+interaction.user.id) {
          const kayıt = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('◻')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger  )
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Moderasyon Menüsü!")
          .addFields(
        { name: "**> </ban-list:1039964202003079243>**", value: `>  **Banlı kullanıcıları gösterir!**`, inline: true },
        { name: "**> </ban:1039964202003079244>**", value: `>  **Bir üyeyi yasaklarsın!**`, inline: true  },
        { name: "**> </forceban:1039964202045030420>**", value: `>  **ID ile kullanıcı banlarsın!**`, inline: true  },
        { name: "**> </giriş-çıkış:1039964202045030424> | </giriş-çıkış-kapat:1039964202045030423>**", value: `>  **Giriş çıkış kanalını ayarlarsın!**`, inline: true  },
		    { name: "**>  </giriş-çıkış-mesaj:1067118408816132207>**", value: `>  **Giriş çıkış mesajını ayarlarsınız!**`, inline: true  },
        { name: "**> </kanal-açıklama:1039964202045030426>**", value: `>  **Kanal açıklamasını değiştirirsin!**`, inline: true  },
        { name: "**> </kick:1039964202095349880>**", value: `>  **Bir üyeyi atarsın!**`, inline: true  },
        { name: "**> </küfür-engel:1039964202095349883>**", value: `>  **Küfür engel sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> </medya-kanalı:1039964202095349883>**", value: `>  **Medya kanalı sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> </oto-rol:1039964202095349887> | </oto-rol-kapat:1039964202095349886>**", value: `>  **OtoRol'ü ayarlarsın!!**`, inline: true  },
        { name: "**> </oto-tag:1039964202095349889> | </oto-tag-kapat:1039964202095349888>**", value: `>  **OtoTag'ı ayarlarsın!**`, inline: true  },
        { name: "**> </oylama:1039964202149879908>**", value: `>  **Oylama başlatırsın!**`, inline: true  },
        { name: "**> </reklam-engel:1039964202149879911>**", value: `>  **Reklam engellemeyi açarsın!**`, inline: true  },
        { name: "**> </rol-al:1039964202149879912>**", value: `>  **Rol alırsın!**`, inline: true  },
      { name: "**> </timeout-sistemi:1048961342540877907>**", value: `>  **Timeout sistemini ayarlarsın!**`, inline: true  },
      { name: "**> </timeout-sistemi-sıfırla:1048961342540877906>**", value: `>  **Timeout sistemini sıfırlarsın!**`, inline: true  },
      { name: "**> </timeout:1048961342540877908>**", value: `>  **Belirlenen kullanıcıya timeout atar.**`, inline: true  },
      { name: "**> </untimeout:1048961342540877909>**", value: `>  **Belirlenen kullanıcının timeoutunu kaldırır.**`, inline: true  },
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "ileri_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('◻')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      const embed = new Discord.EmbedBuilder()
      .setTitle("> Moderasyon 2 Menüsü!")
      .addFields(
        { name: "**>  </rol-oluştur:1039964202149879913>**", value: `>  **Rol oluşturursun!**`, inline: true  },
        { name: "**>  </rol-ver:1039964202149879914>**", value: `>  **Rol verirsin!**`, inline: true  },
        { name: "**>  </sil:1039964202149879917>**", value: `>  **Mesaj silersin!**`, inline: true  },
        { name: "**>  </unban:1039964202359603301>**", value: `>  **Bir üyenin yasağını kaldırırsın!**`, inline: true  },
        { name: "**>  </buton-rol:1039964202003079246>**", value: `>  **Buton rol sistemini ayarlarsın!**`, inline: true  },
        { name: "**>  </capslock-koruma:1039964202003079247>**", value: `>  **CapsLock koruma sistemini ayarlarsın!**`, inline: true  },
        { name: "**>  </yavaş-mod:1039964202359603303>**", value: `>  **Yavaş modu ayarlarsın!**`, inline: true  },
      { name: "**>  </sunucu-kur:1042791957463846972>**", value: `>  **Otomatik sunucu kurar!**`, inline: true  },
      { name: "**>  </mod-log:1043079840695324722>**", value: `>  **Moderasyon Logunu ayarlarsın!**`, inline: true  },
      { name: "**>  </yasaklı-kelime:1046365423945400420> | </yasaklı-kelime-kapat:1046366035315531796>**", value: `>  **Yasaklı Kelimeyi ayarlarsın!**`, inline: true  },
      { name: "**>  </kilitle:1046452705482248273>**", value: `>  **Kanalı mesaj gönderimine  açıp kapatırsın!**`, inline: true  },
      )
      .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "geri_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('◻')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      const embed = new Discord.EmbedBuilder()
      .setTitle("> Moderasyon Menüsü!")
      .addFields(
        { name: "**> </ban-list:1039964202003079243>**", value: `>  **Banlı kullanıcıları gösterir!**`, inline: true },
        { name: "**> </ban:1039964202003079244>**", value: `>  **Bir üyeyi yasaklarsın!**`, inline: true  },
        { name: "**> </forceban:1039964202045030420>**", value: `>  **ID ile kullanıcı banlarsın!**`, inline: true  },
        { name: "**> </giriş-çıkış:1039964202045030424> | </giriş-çıkış-kapat:1039964202045030423>**", value: `>  **Giriş çıkış kanalını ayarlarsın!**`, inline: true  },
		    { name: "**>  </giriş-çıkış-mesaj:1067118408816132207>**", value: `>  **Giriş çıkış mesajını ayarlarsınız!**`, inline: true  },
        { name: "**> </kanal-açıklama:1039964202045030426>**", value: `>  **Kanal açıklamasını değiştirirsin!**`, inline: true  },
        { name: "**> </kick:1039964202095349880>**", value: `>  **Bir üyeyi atarsın!**`, inline: true  },
        { name: "**> </küfür-engel:1039964202095349883>**", value: `>  **Küfür engel sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> </medya-kanalı:1039964202095349883>**", value: `>  **Medya kanalı sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> </oto-rol:1039964202095349887> | </oto-rol-kapat:1039964202095349886>**", value: `>  **OtoRol'ü ayarlarsın!!**`, inline: true  },
        { name: "**> </oto-tag:1039964202095349889> | </oto-tag-kapat:1039964202095349888>**", value: `>  **OtoTag'ı ayarlarsın!**`, inline: true  },
        { name: "**> </oylama:1039964202149879908>**", value: `>  **Oylama başlatırsın!**`, inline: true  },
        { name: "**> </reklam-engel:1039964202149879911>**", value: `>  **Reklam engellemeyi açarsın!**`, inline: true  },
        { name: "**> </rol-al:1039964202149879912>**", value: `>  **Rol alırsın!**`, inline: true  },
      { name: "**> </timeout-sistemi:1048961342540877907>**", value: `>  **Timeout sistemini ayarlarsın!**`, inline: true  },
      { name: "**> </timeout-sistemi-sıfırla:1048961342540877906>**", value: `>  **Timeout sistemini sıfırlarsın!**`, inline: true  },
      { name: "**> </timeout:1048961342540877908>**", value: `>  **Belirlenen kullanıcıya timeout atar.**`, inline: true  },
      { name: "**> </untimeout:1048961342540877909>**", value: `>  **Belirlenen kullanıcının timeoutunu kaldırır.**`, inline: true  },
              )
      .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "kayıt_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('◻')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
            .setEmoji("1039607063443161158")
            .setLabel(" ")
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId("clearMessageButton_"+interaction.user.id)
          )
          const embed = new EmbedBuilder()
          .setTitle("> Kayıt Menüsü!")
          .addFields(
            { name: "**>  </kayıt-sistemi:1063887700786159709>**", value: `>  **Kayıt sistemini ayarlarsın!**`, inline: true },
          { name: "**>  </kayıt-sistemi-kapat:1063887700786159708>**", value: `>  **Kayıt sistemini kapatırsın**`, inline: true },
			  { name: "**>  </kayıt-isim-sıfırla:1063887700786159708>**", value: `>  **Kayıt sistemindeki ismini sıfırlarsın!**`, inline: true }
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
        if (!interaction.isButton()) return;
        if (interaction.customId == "kullanıcı_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('◻')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
            .setEmoji("1039607063443161158")
            .setLabel(" ")
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId("clearMessageButton_"+interaction.user.id)
          )
          const embed = new EmbedBuilder()
          .setTitle("> Kullanıcı Menüsü!")
          .addFields(
            { name: "**>  </avatar:1039964202003079242>**", value: `>  **Avatarına bakarsın!**`, inline: true },
            { name: "**>  </afk:1039964202003079241>**", value: `>  **Afk olursun!**`, inline: true  },
            { name: "**>  </istatistik:1039964202045030425>**", value: `>  **Bot istatistikleri!**`, inline: true  },
            { name: "**>  </kurucu-kim:1039964202095349882>**", value: `>  **Sunucunun kurucusunu gösterir!**`, inline: true  },
            { name: "**>  </ping:1039964202149879909>**", value: `>  **Botun pingini gösterir!**`, inline: true  },
            { name: "**>  </yardım:1039964202359603302>**", value: `>  **Yardım menüsü!**`, inline: true  },
            { name: "**>  </davet:1039964202003079248>**", value: `>  **Botun davet linki!**`, inline: true  },
            { name: "**>  </kullanıcı-bilgi:1039964202095349881>**", value: `>  **Kullanıcı bilgisi!**`, inline: true  },
            { name: "**>  </random-anime:1039964202149879910>**", value: `>  **Random Anime atar.**`, inline: true  },
            { name: "**>  </say:1039964202149879916>**", value: `>  **Sunucuda kaç üye olduğunu gösterir.**`, inline: true  },
            { name: "**>  </sunucupp:1069330554278912091>**", value: `>  **Sunucunun avatarına bakarsın!**`, inline: true  },
            { name: "**>  </sunucu-bilgi:1051458065578348546>**", value: `>  **Sunucu bilgilerini gösterir.**`, inline: true  },
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "sistemler_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
      new Discord.ButtonBuilder()
      .setLabel("Özel Oda")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('💒')
      .setCustomId("ozeloda_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('💒')
      .setLabel("Ticket")
      .setCustomId("yardimticket_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Level Sistemi")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('📈')
      .setCustomId("levelsistemi_"+interaction.user.id))
      const row2 = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Sistemler")
        .setEmoji('🧰')
		.setDisabled(true)
        .setCustomId("sistemler_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setAuthor({ name: " Sistemler Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
          .setTitle("・Hangi komutlarım hakkında bilgi almak istiyorsan o butona bas!")
          .setDescription("\n\n**Linkler**\n>・**Botun davet linki: [Tıkla](" + config["bot-davet"] + ")**\n>・**Botun destek sunucusu: [Tıkla](" + config["desteksunucusu"] + ")**")
          .setColor('Blue')
          interaction.update({embeds: [embed], components: [row, row2]})
      
        }
      
              if (!interaction.isButton()) return;
        if (interaction.customId == "korumasystem_"+interaction.user.id) {
          const embed = new Discord.EmbedBuilder()
          .setTitle("> Koruma Menüsü!")
          .addFields(
            { name: "**>  </hesap-koruma:1069205098888171560>**", value: `>  **Hesap koruma sistemini açarsın!**`, inline: true },
          )
          .setColor("Random")
                
          const row = new Discord.ActionRowBuilder()
          .addComponents(
      new Discord.ButtonBuilder()
      .setLabel("Moderasyon")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🛡')
      .setCustomId("moderasyon_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kayıt")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🧾')
      .setCustomId("kayıt_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kullanıcı")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🤦‍♀️')
      .setCustomId("kullanıcı_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Sistemler")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('⚙')
      .setCustomId("sistemler_"+interaction.user.id))
      const row2 = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
        .setLabel("Koruma")
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji("🔐")
        .setCustomId("korumasystem_"+interaction.user.id)
        .setDisabled(true),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('1044325564636471397')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      interaction.update({embeds: [embed], components: [row, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "botlist_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Botlist Menüsü!")
          .addFields(
            { name: "**>  </botlist-ayarla:1039964202003079245>**", value: `>  **Botlist sistemini ayarlarsın!**`, inline: true }
          )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
        if (!interaction.isButton()) return;
        if (interaction.customId == "ozeloda_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      const embed = new Discord.EmbedBuilder()
      .setTitle("> Özel Oda Menüsü!")
      .addFields(
        { name: "**>  </özel-oda-sistemi:1041738859572105318>**", value: `>  **Özel Oda Sistemini ayarlarsın!**`, inline: true },
        { name: "**>  </özel-oda-sil:1041738859572105317>**", value: `>  **Özel Odanı silersin!**`, inline: true },
        { name: "**>  </özel-oda-kullanıcı-menü:1041738859572105316>**", value: `>  **Özel Odana kullanıcı eklersin!**`, inline: true }
      )
      .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
      
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "anasayfa_"+interaction.user.id) {
          const embed = new EmbedBuilder()
          .setAuthor({ name: "Genel Bot Yardım Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
          .setTitle("・Hangi komutlarım hakkında bilgi almak istiyorsan o butona bas!")
          .setDescription("\n\n**Linkler**\n> ・**Botun davet linki: [Tıkla](" + config["bot-davet"] + ")**\n> ・**Botun destek sunucusu: [Tıkla](" + config["desteksunucusu"] + ")**")
          .setColor('Blue')
          const row = new Discord.ActionRowBuilder()
          .addComponents(
      new Discord.ButtonBuilder()
      .setLabel("Moderasyon")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🛡')
      .setCustomId("moderasyon_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kayıt")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🧾')
      .setCustomId("kayıt_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kullanıcı")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🤦‍♀️')
      .setCustomId("kullanıcı_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Sistemler")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('⚙')
      .setCustomId("sistemler_"+interaction.user.id))
      const row2 = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
        .setLabel("Koruma")
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji("🔐")
        .setCustomId("korumasystem_"+interaction.user.id)
        .setDisabled(true),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('1044325564636471397')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158") 
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
            interaction.update({embeds: [embed], components: [row, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "yardimticket_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Ticket Menüsü!")
          .addFields(
            { name: "**>  </destek-sistemi:1065718561311567995>**", value: `>  **Destek sistemini ayarlarsın!**`, inline: true },
            { name: "**>  </destek-sistemi-sıfırla:1065718561311567994>**", value: `>  **Destek sistemini sıfırlarsın!.**`, inline: true  }
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "levelsistemi_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Level Menüsü!")
          .addFields(
            { name: "**>  </level-sistemi:1053000987285127254>**", value: `>  **Level sistemini açarsın!**`, inline: true },
            { name: "**>  </level:1053000987285127255>**", value: `>  **Levelini görüntülersin!**`, inline: true },
            { name: "**>  </level-ekle:1053000987285127251>**", value: `>  **Level eklersin!**`, inline: true },
            { name: "**>  </level-kaldır:1053000987285127253>**", value: `>  **Level kaldırırsın!**`, inline: true },
            { name: "**>  </level-sıralaması:1053000987285127250>**", value: `>  **Level sıralamasını görüntülersin!**`, inline: true }
          )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
		
		if (!interaction.isButton()) return;
        if (interaction.customId == "captchasistemi_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Captcha Menüsü!")
          .addFields(
            { name: "**>  </captcha-sistemi:1064125585166708918>**", value: `>  **Captcha sistemini açarsın!**`, inline: true },
            { name: "**>  </captcha-görüntüle:1064125585166708917>**", value: `>  **Captcha istatistiklerini görüntülersin!**`, inline: true },
			{ name: "**>  </captcha-sistemi-sıfırla:1068963862600220732>**", value: `>  **Captcha sistemini sıfırlarsın!**`, inline: true }
          )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }


        if (!interaction.isButton()) return;
        
        let user = edb.get(`oylamaUSER_${interaction.message.id}_${interaction.user.id}`) 
        
        if(interaction.customId == "evetoylama_everyone") {
        if(!user) {
        edb.add(`oylamaEVET_${interaction.message.id}`, 1)
        
        let dataEvet = edb.get(`oylamaEVET_${interaction.message.id}`) || "0"
        let dataHayır = edb.get(`oylamaHAYIR_${interaction.message.id}`) || "0"
        
      
        const row = new Discord.ActionRowBuilder()
        .addComponents(
        new Discord.ButtonBuilder()
        .setStyle("Success")
        .setLabel(`(${dataEvet}) Evet`)
        .setCustomId("evetoylama_everyone"),
        new Discord.ButtonBuilder()
        .setStyle("Danger")
        .setLabel(`(${dataHayır}) Hayır`)
        .setCustomId("hayıroylama_everyone"))
        
        interaction.message.edit({ components: [row] })
        
        edb.set(`oylamaUSER_${interaction.message.id}_${interaction.user.id}`, interaction.user.id) 
        }
        
        interaction.deferUpdate();
        }
        
        if(interaction.customId == "hayıroylama_everyone") {
        if(!user) {
        edb.add(`oylamaHAYIR_${interaction.message.id}`, 1)
        
        let dataEvet = edb.get(`oylamaEVET_${interaction.message.id}`) || "0"
        let dataHayır = edb.get(`oylamaHAYIR_${interaction.message.id}`) || "0"
        
      
        const row = new Discord.ActionRowBuilder()
        .addComponents(
        new Discord.ButtonBuilder()
        .setStyle("Success")
        .setLabel(`(${dataEvet}) Evet`)
        .setCustomId("evetoylama_everyone"),
        new Discord.ButtonBuilder()
        .setStyle("Danger")
        .setLabel(`(${dataHayır}) Hayır`)
        .setCustomId("hayıroylama_everyone"))
      
        interaction.message.edit({ components: [row] })
        
        edb.set(`oylamaUSER_${interaction.message.id}_${interaction.user.id}`, interaction.user.id) 
        }
        
        interaction.deferUpdate();
        }

          const kullanıcı = db.fetch(`muteKullanici_${interaction.user.id}`)
          if (!interaction.isButton()) return;
          if (interaction.customId === "muteonay_"+interaction.user.id) {
        
            const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('muteonay_'+interaction.user.id)
                    .setLabel('Onayla')
                    .setDisabled(true)
                    .setStyle('Success'),
                new Discord.ButtonBuilder()
                    .setCustomId('mutered_'+interaction.user.id)
                    .setLabel('İptal')
                    .setDisabled(true)
                    .setStyle('Danger'),
        
            );
            const dmb = deleteMessageButton(interaction, {
              label: "Mesajı sil.",
              style: Discord.ButtonStyle.Danger,
        });
            let muterol = db.fetch(`rol_${interaction.guild.id}`)
            let ucanEssek = interaction.guild.members.cache.get(kullanıcı)
            if (!ucanEssek) return interaction.reply(":x: | Üyeyi bulamadım.")
            ucanEssek.roles.add(muterol)
            const embed = new EmbedBuilder()
            .setDescription(`:white_check_mark: | Başarılı bir şekilde <@!${kullanıcı}> isimli kişiye mute atıldı.
        `)
            interaction.update({embeds: [embed], components: [row, dmb]})
          }
        
          if (interaction.customId === "mutered_"+interaction.user.id) {
            const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('muteonay_'+interaction.user.id)
                    .setLabel('Onayla')
                    .setDisabled(true)
                    .setStyle('Success'),
                new Discord.ButtonBuilder()
                    .setCustomId('mutered_'+interaction.user.id)
                    .setLabel('İptal')
                    .setDisabled(true)
                    .setStyle('Danger'),
        
            );
            const dmb = deleteMessageButton(interaction, {
              label: "Mesajı sil.",
              style: Discord.ButtonStyle.Danger,
        });
            const embed = new EmbedBuilder()
            .setDescription(`:white_check_mark: | Başarılı bir şekilde mute iptal edildi.
        `)
            interaction.update({embeds: [embed], components: [row, dmb]})
          }

            if (!interaction.isButton()) return;
            if (interaction.customId === "sunucukuronay_"+interaction.user.id) {
        
              interaction.guild.channels.cache.filter(mesajsil => {
                mesajsil.delete()
            })

              interaction.guild.channels.create({name: "admin-chat", type: ChannelType.GuildText}).then(channel => {
                channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
                        })

                        interaction.guild.channels.create({name: "▬▬ ÖNEMLİ ▬▬", type: ChannelType.GuildCategory}).then(katagori1 => {
                          katagori1.permissionOverwrites.create(katagori1.guild.roles.everyone, { SendMessages: false });
                            interaction.guild.channels.create({name: "📜・Kurallar", type: ChannelType.GuildText}).then(kurallar => {
                                const embed = new EmbedBuilder()
            .setTitle(':blue_book:  Sunucu Kuralları  :blue_book:')
            .setDescription(`
            **__${interaction.guild.name} Sunucu Kuralları__**                                    
            \`1)\` :blue_book: **・ Yetkililere Etiket Atmak Yasak! ・\`Mute\`・**
            \`2)\` :blue_book: **・ Küfür, Argo Kullanımı Yasak! ・\`Mute\`・**
            \`3)\` :blue_book: **・ Siyaset, Irkçılık ve Dini Konuları Konuşmak Yasak!  ・\`Ban\`・**
            \`4)\` :blue_book: **・ Reklam Yapmak Yasak! ・\`Ban\`・**
            \`5)\` :blue_book: **・ Flood Yapmak Yasak! ・\`Mute\`・**
            \`6)\` :blue_book: **・ Caps Lock ile Yazmak Yasak! ・\`Mute\`・**
            \`7)\` :blue_book: **・ Yetkilileri Dinlememek Yasak! ・\`Mute\`・**
            \`8)\` :blue_book: **・**\`Kurallara Herkes Uymak Zorundadır. Kuralları Okumayanlar, Bilmeyenler Yetkililerimizin Gözünde Okumuş Olarak Kabul Edilecektir.\`
            `)
            kurallar.send({embeds: [embed]})
            kurallar.setParent(katagori1.id)
            })
            interaction.guild.channels.create({name: "📢・Duyurular", type: ChannelType.GuildText}).then(duyuru => {
            duyuru.setParent(katagori1.id)
            })
            interaction.guild.channels.create({name: "🔰・Hoşgeldin", type: ChannelType.GuildText}).then(hg => {
                db.set(`hgbb_${interaction.guild.id}`, hg.id)
                hg.send("Buraya bakmana gerek yok! Senin için giriş çıkış sistemini ayarladım bile!")
                hg.setParent(katagori1.id)
                })
                interaction.guild.channels.create({name: "🔢・Oto Rol", type: ChannelType.GuildText}).then(rol => {
                    rol.send("**/oto-rol** Yazarak otomatik rolü ayarlayabilirsin.")
                    rol.setParent(katagori1.id)
                    })
            interaction.guild.channels.create({name: "📊・Oylama", type: ChannelType.GuildText}).then(oylama => {
                oylama.setParent(katagori1.id)
                })
                interaction.guild.channels.create({name: "🎉・Çekilişler", type: ChannelType.GuildText}).then(giveaway => {
                    giveaway.setParent(katagori1.id)
                    })
            })
            interaction.guild.channels.create({name: "▬▬ SOHBET KANALLARI ▬▬", type: ChannelType.GuildCategory}).then(katagori2 => {
            interaction.guild.channels.create({name: "💬・sohbet", type: ChannelType.GuildText}).then(sohbet => {
                const embed2 = new EmbedBuilder()
                .setTitle(`${config["bot-adi"]} Bot - İyi günler diler.`)
                .setDescription(`Unutma ${interaction.user}, senin için her şeyini ben ayarladım artık başka bir şey yapmana gerek yok.\n\nArtık sunucunu güvenli bir şekilde açabilirsin.`)
                .setColor("Blue")
                sohbet.send({embeds: [embed2]})
                sohbet.send("Hadi ilk mesajınız da benden olsun!")
            sohbet.setParent(katagori2)
            })
            interaction.guild.channels.create({name: "🎀・galeri", type: ChannelType.GuildText}).then(galeri => {
                db.set(`görselengel.${interaction.guild.id}`, galeri.id)
                galeri.send("Buraya bakmana gerek yok! Senin için medya kanalı sistemini ayarladım bile!")
            galeri.setParent(katagori2)
            })
            interaction.guild.channels.create({name: "🚧・bot-komut", type: ChannelType.GuildText}).then(botkomut => {
            botkomut.setParent(katagori2)
            })
            interaction.guild.channels.create({name: "⭐・sunucu-destek", type: ChannelType.GuildText}).then(destek => {
            destek.setParent(katagori2)
            })
            })

            interaction.guild.channels.create({name: "▬▬ SESLİ SOHBET KANALLARI ▬▬", type: ChannelType.GuildCategory}).then(katagori3 => {
                interaction.guild.channels.create({name: "🔊・Sohbet", type: ChannelType.GuildVoice}).then(sohbet1 => {
                sohbet1.setParent(katagori3)
                })
                interaction.guild.channels.create({name: "🔊・Anime", type: ChannelType.GuildVoice}).then(sohbet2 => {
                    sohbet2.setParent(katagori3)
                    })
                    interaction.guild.channels.create({name: "🔊・Yayın", type: ChannelType.GuildVoice}).then(sohbet3 => {
                        sohbet3.setParent(katagori3)
                        })
                        interaction.guild.channels.create({name: "🔊・Oyun", type: ChannelType.GuildVoice}).then(sohbet3 => {
                          sohbet3.setParent(katagori3)
                          })
                          interaction.guild.channels.create({name: "🔊・Cafe", type: ChannelType.GuildVoice}).then(sohbet3 => {
                            sohbet3.setParent(katagori3)
                            })
                            interaction.guild.channels.create({name: "🔊・7/24", type: ChannelType.GuildVoice}).then(sohbet3 => {
                              sohbet3.setParent(katagori3)
                              })
                              interaction.guild.channels.create({name: "🔓・Toplantı 1", type: ChannelType.GuildVoice}).then(toplantı => {
                                  toplantı.setParent(katagori3)
                                  })
                                  interaction.guild.channels.create({name: "🔓・Toplantı 2", type: ChannelType.GuildVoice}).then(toplantı1 => {
                                      toplantı1.setParent(katagori3)
                                      })
            })
          
            const existingRoles = interaction.guild.roles.cache.filter(role => role.name !== '@everyone');

              existingRoles.forEach(role => {
                  role.delete()
                      .then(deletedRole => console.log(`Silinen rol: ${deletedRole.name}`))
                      .catch(error => console.log(`Rol silinirken bir hata oluştu: ${error}`));
              });
            
            interaction.guild.roles.create({ name: 'Kurucu', color: "#0d0101", permissions: [PermissionsBitField.Flags.Administrator]}).then(rol => {
                client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.guild.ownerId).roles.add(rol)
                })
            interaction.guild.roles.create({ name: 'Admin', color: "#d41313", permissions: [PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Mod', color: "#1367d4", permissions: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Destek Ekibi', color: "#d4c713", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Kayıt Yetkilisi', color: "#c28274", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Özel Üye', color: "#d413c4", permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Üye', color: "#ffffff", permissions: [PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Kız', color: "#ffc0cb", permissions: [PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Erkek', color: "#00008b", permissions: [PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Mute', color: "#878383", permissions: [PermissionsBitField.Flags.MuteMembers]});
            }
        
            if (interaction.customId === "sunucukurred_"+interaction.user.id) {
              interaction.update({content: `:white_check_mark: | Başarılı bir şekilde sunucu kurma iptal edildi!`, embeds: [], components: []})
            } 
            
            if (interaction.customId === "yenile_"+interaction.user.id) {
              const Uptime = moment
              .duration(client.uptime)
              .format(" D [gün], H [saat], m [dakika], s [saniye]");
                const row = new Discord.ActionRowBuilder()
              .addComponents(
          new Discord.ButtonBuilder()
          .setLabel("Yenile")
          .setStyle(Discord.ButtonStyle.Primary)
          .setEmoji('1039607071093567658')
          .setCustomId(interaction.user.id))
          .addComponents(
            new Discord.ButtonBuilder()
                .setEmoji("1039607063443161158")
                .setLabel(" ")
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId("clearMessageButton_"+interaction.user.id)
          )
          let zaman = db.get(`botAcilis_`)
          let date = `<t:${Math.floor(zaman / 1000)}:R>`
          let servers = client.guilds.cache.size

         
          
            let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()
            const botsahip = `<@${config["sahip"]}>`;
            const website = `${config["website"]}`;


              const embed = new EmbedBuilder()
    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '</> Bot Sahibi', value: `${botsahip}`, inline: true },
      { name: '🌐 Websitesi', value: `${website}`, inline: true },
      { name: "👥 Kullanıcılar", value: `${members}`, inline: true },
      { name: "🧩 Sunucular", value: `${servers}`, inline: true },
      { name: "📼 Bellek Kullanımı", value: `${(process.memoryUsage().heapUsed / 1024 / 512).toFixed(2)}MB`, inline: true },
      { name: "⏳ Açılma Süresi", value: `${date}`, inline: true },
      { name: "⏺️ Ping", value: `${client.ws.ping}`, inline: true },
    )
    interaction.reply({embeds: [embed], components: [row]})
              }

              if (interaction.customId === "clearMessageButton_" + interaction.user.id) {
                await interaction.deferUpdate();
                await interaction.message.delete().catch(console.error);
              }
            if (interaction.customId === "botekle_everyone") {

              const zatenEklenmis = new EmbedBuilder()
              .setTitle(":x: | Başarısız!")
              .setDescription("Zaten eklenmiş olan bir botun var!")
              .setColor("Red")
          let varmi = db.get(`ekledi_${interaction.user.id}${interaction.guild.id}`)
          if (varmi) return interaction.reply({ embeds: [zatenEklenmis], ephemeral: true })

              const lourityModal = new ModalBuilder()
              .setCustomId('form')
              .setTitle('Botlist Başvuru Formu')
            const a1 = new TextInputBuilder()
              .setCustomId('id')
              .setLabel('Bot ID Yazınız')
              .setStyle(TextInputStyle.Paragraph)
              .setMinLength(15)
              .setMaxLength(25)
              .setPlaceholder('Botunun ID (Kimliği) nedir?')
              .setRequired(true)
            const a2 = new TextInputBuilder()
              .setCustomId('prefix')
              .setLabel('Bot Prefixini Yazınız')
              .setStyle(TextInputStyle.Paragraph)
              .setMinLength(1)
              .setMaxLength(4)
              .setPlaceholder('Botunun Prefixi (Ön Ek) nedir?')
              .setRequired(true)
            
            const row = new ActionRowBuilder().addComponents(a1);
            const row3 = new ActionRowBuilder().addComponents(a2);
            lourityModal.addComponents(row, row3);
                  
              await interaction.showModal(lourityModal);
            }
        
          if (interaction.customId === "ayarlar_"+interaction.user.id) {
            let log = db.get(`log_${interaction.guild.id}`)
            let onayKanal = db.get(`onay_${interaction.guild.id}`)
            let botEkle = db.get(`botekle_${interaction.guild.id}`)
            let ayrildiLog = db.get(`ayrildiLog_${interaction.guild.id}`)
            let botRol = db.get(`botRol_${interaction.guild.id}`)
            let devRol = db.get(`devRol_${interaction.guild.id}`)
            let adminRol = db.get(`adminRol_${interaction.guild.id}`)
      
            const mesaj = new Discord.EmbedBuilder()
                .setTitle("Botlist Sistem Ayarları")
                .addFields(
                    { name: "**💾 Log Kanalı**", value: `<#${log || "Ayarlanmamış!"}>`, inline: true },
                    { name: "**👍 Onay Kanalı**", value: `<#${onayKanal || "Ayarlanmamış!"}>`, inline: true },
                    { name: "**🎈 Bot Ekle Kanalı**", value: `<#${botEkle || "Ayarlanmamış!"}>`, inline: true },
                    { name: "**📤 Ayrıldı Log Kanalı**", value: `<#${ayrildiLog || "Ayarlanmamış!"}>`, inline: true },
                    { name: "**🤖 Bot Rolü**", value: `<@&${botRol || "Ayarlanmamış!"}>`, inline: true },
                    { name: "**👨‍💻 Developer Rolü**", value: `<@&${devRol || "Ayarlanmamış!"}>`, inline: true },
                    { name: "**🔨 Yetkili Rolü**", value: `<@&${adminRol || "Ayarlanmamış!"}>` }
                )
                .setColor("Yellow")
      
            const yetki = new Discord.EmbedBuilder()
                .setTitle(":x: | Yetersiz Yetki!")
                .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
                .setFooter({ text: "" })
                .setColor("Red")
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetki], ephemeral: true });
      
            interaction.reply({ embeds: [mesaj], ephemeral: true })
        }


        if (interaction.customId === "kapat_"+interaction.user.id) {
          const yetkii = new Discord.EmbedBuilder()
              .setTitle(":x: | Yetersiz Yetki!")
              .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
              .setFooter({ text: "" })
              .setColor("Red")
    
          const embed1 = new Discord.EmbedBuilder()
              .setTitle(":white_check_mark: | Başarıyla Sıfırlandı!")
              .setDescription("> Botlist sistemi başarıyla **sıfırlandı**!")
              .setColor("Green")
    
          if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetkii], ephemeral: true })
    
          db.delete(`log_${interaction.guild.id}`)
          db.delete(`botRol_${interaction.guild.id}`)
          db.delete(`devRol_${interaction.guild.id}`)
          db.delete(`adminRol_${interaction.guild.id}`)
          db.delete(`onay_${interaction.guild.id}`)
          db.delete(`botekle_${interaction.guild.id}`)
          db.delete(`ayrildiLog_${interaction.guild.id}`)
		  db.delete(`botSira_${interaction.guild.id}`)
          return interaction.reply({ embeds: [embed1], ephemeral: true })
      }
      
      const mod = new ModalBuilder()
      .setCustomId('eklemenu')
      .setTitle(' - Özel Oda Kullanıcı Ekleme!')
        const e = new TextInputBuilder()
        .setCustomId('uyeid')
        .setLabel('Kullanıcı ID')
        .setStyle(TextInputStyle.Paragraph) 
        .setMinLength(10)
        .setPlaceholder('Eklemek istediğiniz kullanıcı IDsini girin.')
        .setRequired(true)
        const row2 = new ActionRowBuilder().addComponents(e);
        
        mod.addComponents(row2);

        if(interaction.customId === "ekle_"+interaction.user.id){
          let odasiz = db.fetch(`oda_${interaction.user.id}`)
          if (!odasiz) return interaction.reply({content: ":x: | Sana Ait Bir Oda Bulamadım!", ephemeral: true})
          await interaction.showModal(mod);
        }

        const mod2 = new ModalBuilder()
        .setCustomId('eklemenu2')
        .setTitle(' - Özel Oda Kullanıcı Çıkarma!')
          const a = new TextInputBuilder()
          .setCustomId('cikarid')
          .setLabel('Kullanıcı ID')
          .setStyle(TextInputStyle.Paragraph) 
          .setMinLength(10)
          .setPlaceholder('Çıkarmak istediğiniz kullanıcı IDsini girin.')
          .setRequired(true)
          const row6 = new ActionRowBuilder().addComponents(a);
          
          mod2.addComponents(row6);

          if(interaction.customId === "çıkar_"+interaction.user.id){
            let odasiz = db.fetch(`oda_${interaction.user.id}`)
            if (!odasiz) return interaction.reply({content: ":x: | Sana Ait Bir Oda Bulamadım!", ephemeral: true})
            await interaction.showModal(mod2);
          }

          if (interaction.customId === "unban_everyone") {
            const botlistadmin = db.fetch(`adminRol_${interaction.guild.id}`)
            if(!interaction.member.permissions.has(botlistadmin)) return interaction.reply({content: `:x: | Bu butonu sadece <@&${botlistadmin}> yetkisi olanlar kullanabilir!`, ephemeral: true})
            let message = await interaction.channel.messages.fetch(interaction.message.id)
            const user = db.fetch(`user_${interaction.message.id}`)
            var data = db.fetch(`ekledi_${user}`)
      
            let lourityData = data
      
            const yetkiii = new Discord.EmbedBuilder()
                .setTitle(":x: | Yetersiz Yetki!")
                .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
                .setFooter({ text: "" })
                .setColor("Red")
      
            const embed1 = new Discord.EmbedBuilder()
                .setTitle(":white_check_mark: | Başarılı!")
                .setDescription("> Botun banı başarıyla **kaldırıldı**!")
                .setColor("Green")
      
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetkiii], ephemeral: true });
      
            if (!lourityData) return interaction.reply({ content: "Bu botun banı zaten kaldırılmış!", ephemeral: true })
      
            interaction.guild.members.unban(lourityData).catch(() => { })
            message.delete()
            return interaction.reply({ embeds: [embed1], ephemeral: true })
        }

        if (interaction.customId === "reddet_everyone") {

          const botlistadmin = db.fetch(`adminRol_${interaction.guild.id}`)
          if(!interaction.member.permissions.has(botlistadmin)) return interaction.reply({content: `:x: | Bu butonu sadece <@&${botlistadmin}> yetkisi olanlar kullanabilir!`, ephemeral: true})
      
            let message = await interaction.channel.messages.fetch(interaction.message.id)
            let log = db.get(`log_${interaction.guild.id}`)
            var data = db.fetch(`bot_${interaction.message.id}`)
            var uye = data.user
            var bot = data.bot

            if (!interaction.member.roles.cache.has(botlistadmin)) return interaction.reply({ content: ":x: | Bu işlemi gerçekleştirmek için <@&" + botlistadmin + "> rolüne sahip olmalısın!", ephemeral: true })
      
            let a = await client.users.fetch(bot);
            let avatar = a.avatar
            let link = "https://cdn.discordapp.com/avatars/" + bot + "/" + avatar + ".png?size=1024"
      
            const embed = new EmbedBuilder()
                .setTitle(":x: | Bot Reddedildi!")
                .setDescription("<@" + data.bot + "> adlı botun başvurusu maalesef reddedildi!")
                .setThumbnail(link)
                .setColor("Red")
      
            client.channels.cache.get(log).send({ content: "<@" + uye + ">", embeds: [embed] })
            message.delete()
        }
		
        if(interaction.customId === `ticketnasilacilir_everyone`) {
          const embed = new Discord.EmbedBuilder()
          .setAuthor({ name: "Rimuru Destek Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
          .setTitle("・Destek talebi nasıl oluşturabilirsin.")
          .setDescription("**Destek Talebi Oluştur** butonuna tıkladıktan sonra karşına bir form gelecektir. O formu doldurduktan sonra destek talebin başarılı bir şekilde oluşturulacaktır.")
          .setImage(`https://cdn.discordapp.com/attachments/1235347548873425027/1235523499582296084/image.png?ex=6634ae6d&is=66335ced&hm=c9b678963889765b82be76868f9f40e5dc6a85425e7badb843d91caa85ac07d3&`)
          .setColor('Blue')
            interaction.reply({ embeds: [embed], ephemeral: true })
          }
  
                  if(interaction.customId === `ticketolustur_everyone`) {
            
            const find = db.fetch(`ticketUser_${interaction.user.id}${interaction.guild.id}`)
            if(find) {
              const ticketVar = new Discord.EmbedBuilder()
              .setDescription(`:x: Zaten bir talebin bulunmakta.`)
              return interaction.reply({ embeds: [ticketVar], ephemeral: true })
            }
  
            const ticketmodal = new Discord.ModalBuilder()
            .setCustomId('ticketforms')
            .setTitle('Destek Oluşturma Formu');
      
            const ticketInput = new Discord.TextInputBuilder()
            .setCustomId('ticketInput')
            .setLabel("Destek Oluşturma Sebebiniz Nedir?")
            .setRequired(true)  
            .setStyle(Discord.TextInputStyle.Short);
      
        
            const afirstActionRow = new Discord.ActionRowBuilder().addComponents(ticketInput);
      
            ticketmodal.addComponents(afirstActionRow);
      
            await interaction.showModal(ticketmodal);
            
          }
          
          if(interaction.customId === `ticketClose_everyone`) {
            interaction.channel.permissionOverwrites.set([
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
              },        
            ]);
            const row = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setCustomId(`ticketDelete_everyone`)
                .setLabel('Destek silinsin.')
                .setEmoji("🗑️")
                .setStyle(Discord.ButtonStyle.Secondary),
            );
            const ticketClose = new Discord.EmbedBuilder()
            .setDescription(`:white_check_mark: | Bu destek talebi kapatılmıştır.`)
            .setColor('Green')
            interaction.reply({ embeds: [ticketClose], components: [row] })
          }
  
          if(interaction.customId === `ticketDelete_everyone`) {
  
           const chnl = db.fetch(`ticketChannelUser_${interaction.guild.id}${interaction.channel.id}`);
           const x = chnl.user;
  
           const adam = await interaction.guild.members.cache.find(user => user.id === x);
           const usr = db.fetch(`ticketUser_${x}${interaction.guild.id}`);
  
            const ticketLog = db.fetch(`ticketKanal_${interaction.guild.id}`)
            const ticketcloseembed = new EmbedBuilder()
            .setTitle(`${adam.user.tag} adlı kişinin destek verileri.`)
            .addFields(
              { name: "Destek Açan: <:block:1065690244634124500>", value: `<@${usr.whOpen}>`, inline: true },
              { name: "Desteğin Kapatılış Tarihi:", value: `<t:${parseInt(Date.now() / 1000)}:R>`, inline: true  },
               { name: '\u200B', value: '\u200B' },
              { name: "Desteği Kapatan:", value: `<@${interaction.user.id}>`, inline: true },
              { name: "Desteğin Açılış Tarihi:", value: `<t:${parseInt(usr.date / 1000)}:R>`, inline: true  },
                    )
            .setColor('Green')
            .setThumbnail(`${adam.user.displayAvatarURL()}`)
            client.channels.cache.get(ticketLog).send({embeds: [ticketcloseembed]})
  
            db.delete(`ticketChannelUser_${interaction.guild.id}${interaction.channel.id}`);
            db.delete(`ticketUser_${x}${interaction.guild.id}`);
  
            return interaction.channel.delete();
          }
      
if(interaction.customId === `benıdogrula_everyone_${interaction.guild.id}${interaction.user.id}`)
        {
          const rmodal = new Discord.ModalBuilder()
      .setCustomId('rcaptcha')
      .setTitle('Doğrulama Sekmesi');

      const rcaptchaInput = new Discord.TextInputBuilder()
      .setCustomId('rcaptchaInput')
      .setLabel("Doğrulama Kodunuz nedir?")
      .setMaxLength(6)
      .setMinLength(6)
      .setRequired(true)  
      .setStyle(Discord.TextInputStyle.Short);

  
      const firstActionRow = new Discord.ActionRowBuilder().addComponents(rcaptchaInput);

      rmodal.addComponents(firstActionRow);

      await interaction.showModal(rmodal);
        }
      
      if(interaction.customId === `randomGöster_everyone_${interaction.guild.id}${interaction.user.id}`)
        {
          return interaction.reply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor("#36393F")
            .setDescription('💮 **|** Kodun: `'+db.fetch(`beklenıyor_${interaction.guild.id}${interaction.user.id}`)+'`')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
          ], ephemeral: true })
        }
		
		        if(interaction.customId === `giriscikismesaj_`+interaction.user.id) {
          const giriscikismodal = new Discord.ModalBuilder()
      .setCustomId('giriscikis')
      .setTitle('Mesaj Ayarlama Formu');

      const girismesaj = new Discord.TextInputBuilder()
      .setCustomId('girismesaj')
      .setLabel("Giriş mesajınızı yazınız!")
      .setMaxLength(100)
      .setMinLength(1)
      .setRequired(true)  
      .setStyle(Discord.TextInputStyle.Short);

      const cikismesaj = new Discord.TextInputBuilder()
      .setCustomId('cikismesaj')
      .setLabel("Çıkış mesajınızı yazınız!")
      .setMaxLength(100)
      .setMinLength(1)
      .setRequired(true)  
      .setStyle(Discord.TextInputStyle.Short);

  
      const firstActionRow = new Discord.ActionRowBuilder().addComponents(girismesaj);
      const twoActionRow = new Discord.ActionRowBuilder().addComponents(cikismesaj);

      giriscikismodal.addComponents(firstActionRow, twoActionRow);

      await interaction.showModal(giriscikismodal);
        }

        if(interaction.customId === `giriscikismesajsifirla_`+interaction.user.id) {
          const sayacmessage = db.fetch(`sayacmessage_${interaction.guild.id}`)
          
          if (!sayacmessage) {
              const date = new EmbedBuilder()
              .setDescription(`:x: | Bu sistem zaten kapalı!`)
          
          return interaction.reply({ embeds: [date], ephemeral: true })
          }
          const row1 = new Discord.ActionRowBuilder()

          .addComponents(
              new Discord.ButtonBuilder()
                  .setLabel("Giriş Çıkış Mesajını Ayarla!")
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setCustomId("giriscikismesaj_"+interaction.user.id)
          )
        
          .addComponents(
              new Discord.ButtonBuilder()
                  .setLabel("Giriş Çıkış Mesajını Sıfırla!")
                  .setDisabled(true)
                  .setStyle(Discord.ButtonStyle.Danger)
                  .setCustomId("giriscikismesajsifirla_"+interaction.user.id)
          )
          const embed = new EmbedBuilder()
          .setColor(0x2F3136)
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()} ` })
          .setDescription(":white_check_mark: **|** Giriş çıkış mesajı sıfırlandı!")
          db.delete(`sayacmessageDate_${interaction.guild.id}`)
          db.delete(`sayacmessage_${interaction.guild.id}`)

          return interaction.update({ embeds: [embed], components: [row1] })
      
        }

          }

  };

//
