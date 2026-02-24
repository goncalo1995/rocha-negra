package com.rochanegra.api.infrastructure.telegram;
// package com.rochanegra.api.bot;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Component;
// import org.telegram.telegrambots.abilitybots.api.bot.AbilityBot;
// import org.telegram.telegrambots.abilitybots.api.objects.Ability;
// import org.telegram.telegrambots.abilitybots.api.objects.Locality;
// import org.telegram.telegrambots.abilitybots.api.objects.Privacy;
// import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
// import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
// import
// org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
// import org.telegram.telegrambots.meta.api.objects.Update;

// import jakarta.annotation.PostConstruct;

// import org.telegram.telegrambots.abilitybots.api.objects.Reply;
// import org.telegram.telegrambots.abilitybots.api.objects.Flag;
// import org.telegram.telegrambots.abilitybots.api.bot.BaseAbilityBot;
// import java.util.function.BiConsumer;

// @Component
// public class RochaNegraBot extends AbilityBot implements SpringLongPollingBot
// {

// private final String botToken;

// public RochaNegraBot(@Value("${telegram.bot.token}") String botToken,
// @Value("${telegram.bot.username}") String botUsername) {
// // In version 7/9+, AbilityBot requires a TelegramClient
// super(new OkHttpTelegramClient(botToken), botUsername);
// this.botToken = botToken;
// }

// @PostConstruct
// public void init() {
// super.onRegister();
// }

// @Override
// public long creatorId() {
// return 1L;
// }

// @Override
// public String getBotToken() {
// return botToken;
// }

// @Override
// public LongPollingSingleThreadUpdateConsumer getUpdatesConsumer() {
// return this;
// }

// @Override
// public void consume(Update update) {
// // AbilityBot logic is triggered via consume()
// super.consume(update);
// }

// public Ability start() {
// return Ability
// .builder()
// .name("start")
// .info("Start the bot and get your chat ID")
// .locality(Locality.ALL)
// .privacy(Privacy.PUBLIC)
// .action(ctx -> {
// String response = "Hello! I am the Rocha Negra Finance Bot. \nYour Chat ID
// is: " + ctx.chatId()
// + "\n\nYou can use this ID to configure backend notifications.";
// silent.send(response, ctx.chatId());
// })
// .build();
// }

// public Ability chatid() {
// return Ability
// .builder()
// .name("chatid")
// .info("Get your current chat ID")
// .locality(Locality.ALL)
// .privacy(Privacy.PUBLIC)
// .action(ctx -> silent.send("Your Chat ID is: " + ctx.chatId(), ctx.chatId()))
// .build();
// }

// public Reply replyToText() {
// BiConsumer<BaseAbilityBot, Update> action = (bot, upd) -> silent.send("Echo:
// " + upd.getMessage().getText(),
// upd.getMessage().getChatId());

// return Reply.of(action, Flag.TEXT, upd ->
// !upd.getMessage().getText().startsWith("/"));
// }

// public Reply replyToMedia() {
// BiConsumer<BaseAbilityBot, Update> action = (bot, upd) -> {
// long chatId = upd.getMessage().getChatId();
// if (upd.getMessage().hasPhoto()) {
// silent.send("I received a photo! In the future, I'll scan this for receipts.
// 📸", chatId);
// } else if (upd.getMessage().hasDocument()) {
// silent.send("I received a document! I can use this to import bank statements
// soon. 📄", chatId);
// } else if (upd.getMessage().hasAudio() || upd.getMessage().hasVoice()) {
// silent.send("I received audio! Maybe one day I'll be able to transcribe your
// voice notes. 🎙️", chatId);
// } else if (upd.getMessage().hasSticker()) {
// silent.send("Nice sticker! I like your style. 🎨", chatId);
// } else {
// silent.send("I received some media, but I'm not sure how to handle it yet!",
// chatId);
// }
// };

// return Reply.of(action, Flag.MESSAGE, upd -> upd.getMessage().hasPhoto() ||
// upd.getMessage().hasDocument() ||
// upd.getMessage().hasAudio() ||
// upd.getMessage().hasVoice() ||
// upd.getMessage().hasSticker());
// }
// }
