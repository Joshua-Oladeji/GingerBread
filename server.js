require('dotenv').config();
const express = require('express');
const GingerBread = require('./gingerbread.js');
const axios = require('axios');
const PORT = process.env.PORT || 4001;
const app = express();
const telegramApiEndpoint = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const telegramBotEndpoint = `${process.env.SERVER_URL}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
const guests = []; // - chatIds of to be notified when there's a successful trade



// -> ARBITRAGE BOT
const wavaxJoe = new GingerBread(
  { symbol: 'WAVAX', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', volume: 1000 },
  { symbol: 'JOE', address: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', volume: 100000 }
);
wavaxJoe.bake();
// wavaxJoe.serve(telegramApiEndpoint);




// -> TELEGRAM BOT (LOGGER)
const initTelgramBot = async () => {
  try {
    const res = await axios.get(`${telegramApiEndpoint}/setWebhook`, { 'params': { 'url': telegramBotEndpoint } });
    console.log(res.data);
  }
  catch (err) {
    console.log(new Error(err.message));
  }
}

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 'Gingerbread': 'a bot for arbitraging trades using flashswaps' });
});

app.post('/webhook/' + process.env.TELEGRAM_BOT_TOKEN, async (req, res) => {
  const chatId = update['message']['chat']['id'];
  const message = update['message']['text'];
  let outputText;

  if (message.toLowerCase() === '/subscribe') {
    guests.includes(!chatId) ? guests.push(chatId) : null;
    wavaxJoe.diners(guests); // update the trade notificatoion subscribers
    outputText = 'You\'ll be notified when an arbitrage is successful ✔';
  }
  else if (message.toLowerCase() === '/unsubscribe') {
    const guestIndex = guests.findIndex((guest) => guest === chatId);
    guestIndex && guests.splice(guestIndex, 1);
    wavaxJoe.diners(guests); // update the trade notificatoion subscribers
    outputText = 'You\'ve been removed from arbitrage subscribers ✔';
  }
  else {
    outputText = 'Hi, I serve Gingerbreads 🍪';
  }
  
  try {
    await axios.post(`${telegramApiEndpoint}/sendMessage`, { 'chat_id': chatId, 'text': outputText });
    return res.status(200).json({});
  }
  catch (err) {
    console.log(new Error(err.message));
    return res.status(500).send(err.message);
  }
});

app.listen(PORT, async () => {
  console.log('server running on http://localhost:' + PORT);
  await initTelgramBot();
});