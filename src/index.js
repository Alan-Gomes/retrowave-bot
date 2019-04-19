const Twitter = require('twitter');
const RetroText = require('retrotext');
require('dotenv').config();

const TWITTER_USER = '@retrotextbot';
const BACKGROUNDS = ['basicRainbow', 'colorRainbow', 'palmTri', 'palmCircle', 'outlineTri'];
const TEXT_STYLES = ['cyan', 'redOutlined', 'redOutlinedThick', 'chrome'];

const app = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.TOKEN_KEY,
  access_token_secret: process.env.TOKEN_SECRET
});

function extraiConteudo(tweet) {
  const extended = tweet.extended_tweet;
  const text = (extended && extended.full_text) || tweet.text;
  const range = (extended && extended.display_text_range) || tweet.display_text_range;
  return range ? text.substring(range[0], range[1]) : text;
}

async function geraImagem(texto) {
  const [topo, meio, baixo] = texto.split('\n').map(str => str.trim()).filter(Boolean);
  const text = new RetroText();

  topo  && text.setLine(1, topo);
  meio  && text.setLine(2, meio);
  baixo && text.setLine(3, baixo);

  text.setBackgroundStyle(BACKGROUNDS[~~(Math.random() * BACKGROUNDS.length)]);
  text.setTextStyle(TEXT_STYLES[~~(Math.random() * TEXT_STYLES.length)]);
  return text.fetchBuffer();
}

async function respondeMeme(display, tweet) {
  try {
    console.log(`gerando para tweet: ${display}`);
    const index = display.indexOf(TWITTER_USER) + TWITTER_USER.length;
    let texto = display.substring(index).trim();
    if (!texto) return;

    const options = {
      in_reply_to_status_id: tweet.id_str,
      auto_populate_reply_metadata: true
    };
    await app.post('favorites/create', { id: tweet.id_str });
    const image = await geraImagem(texto);
    const media = await app.post('media/upload', { media: image });
    await app.post('statuses/update', {
      ...options,
      media_ids: media.media_id_string
    });

  } catch (error) {
    console.error(error);
  }
}

app.stream('statuses/filter', { track: TWITTER_USER }, stream => {
  console.log('Serviço iniciado');
  stream.on('data', tweet => {
    if (tweet) {
      const display = extraiConteudo(tweet);
      if (display.includes(TWITTER_USER)) {
        respondeMeme(display, tweet);
      }
    }
  });

  stream.on('error', error => console.log(error));
});
