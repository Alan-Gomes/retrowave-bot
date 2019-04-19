const gerador = require('./gerador');
const fs = require('fs');

gerador.criaImagem('eu vo ve e te aviso').then(buf => {
  const stream = fs.createWriteStream('text.png');
  stream.write(buf);
  stream.end();
});
