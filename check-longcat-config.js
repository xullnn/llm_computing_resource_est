const https = require('https');

const url = 'https://huggingface.co/meituan-longcat/LongCat-Flash-Chat/raw/main/config.json';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (e) => {
  console.error(e);
});

