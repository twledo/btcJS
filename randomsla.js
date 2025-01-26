const crypto = require('crypto');

// Função para gerar um número aleatório dentro do intervalo especificado
function gerarNumeroAleatorio() {
  // Definindo os limites em hexadecimal como BigInt
  const min = BigInt("0x4000000000000000");
  const max = BigInt("0x7ffffffffffffffff");

  // Gerando um número aleatório dentro do intervalo
  const numeroAleatorio = min + BigInt(Math.floor(Math.random() * Number(max - min + BigInt(1))));

  // Convertendo o número para hexadecimal e retornando
  return numeroAleatorio.toString(16);
}

// Função para gerar o endereço P2PKH a partir de uma chave pública
function gerarEnderecoP2PKH(chavePublicaHex) {
  // Convertendo a chave pública de hexadecimal para um buffer
  const chavePublicaBuffer = Buffer.from(chavePublicaHex, 'hex');

  // Passo 1: SHA256 da chave pública
  const sha256Hash = crypto.createHash('sha256').update(chavePublicaBuffer).digest();

  // Passo 2: RIPEMD160 do SHA256 (gerar o hash da chave pública)
  const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();

  // Passo 3: Prefixo 0x00 para P2PKH (endereços padrão Bitcoin mainnet)
  const prefixo = Buffer.from([0x00]);

  // Passo 4: Concatenar o prefixo ao hash RIPEMD160
  const comPrefixo = Buffer.concat([prefixo, ripemd160Hash]);

  // Passo 5: Gerar o checksum (SHA256 duas vezes)
  const checksum = crypto.createHash('sha256').update(comPrefixo).digest();
  const checksumFinal = crypto.createHash('sha256').update(checksum).digest().slice(0, 4);

  // Passo 6: Concatenar o checksum ao final
  const comChecksum = Buffer.concat([comPrefixo, checksumFinal]);

  // Passo 7: Codificar o resultado em Base58
  const base58 = base58Encode(comChecksum);
  return base58;
}

// Função para codificar em Base58
function base58Encode(buffer) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  let num = BigInt('0x' + buffer.toString('hex'));

  while (num > 0) {
    const remainder = num % 58n;
    result = alphabet[Number(remainder)] + result;
    num = num / 58n;
  }

  // Adicionar '1' para cada byte 0 no início do buffer (prefixo 0x00)
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result = '1' + result;
  }

  return result;
}

// Loop infinito que gera números aleatórios e seus respectivos endereços P2PKH
while (true) {
  // Gerando um número aleatório
  const numeroHex = gerarNumeroAleatorio();

  // Criando a chave pública a partir do número aleatório (como se fosse uma chave privada)
  const chavePrivadaBuffer = Buffer.from(numeroHex, 'hex');

  // Gerando a chave pública (note que estamos simplificando o processo aqui)
  const chavePublica = crypto.createECDH('secp256k1');
  chavePublica.setPrivateKey(chavePrivadaBuffer);
  const chavePublicaHex = chavePublica.getPublicKey().toString('hex');

  // Gerando o endereço P2PKH a partir da chave pública
  const enderecoP2PKH = gerarEnderecoP2PKH(chavePublicaHex);

  // Verificando se o endereço gerado é igual ao especificado
  if (enderecoP2PKH === '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9') {
    console.log(`Encontrei o endereço correspondente!`);
    console.log(`Número Hex: ${numeroHex}`);
    console.log(`Endereço P2PKH: ${enderecoP2PKH}`);
    break;  // Interrompe o programa
  }

  // Exibindo o número hexadecimal e o endereço P2PKH
  console.log(`Número Hex: ${numeroHex}`);
  console.log(`Endereço P2PKH: ${enderecoP2PKH}`);
  console.log('-----------------------------');
}
