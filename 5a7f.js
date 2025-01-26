const crypto = require('crypto');
const secp256k1 = require('secp256k1');

// Lista de endereços P2PKH a ser comparada
const targetAddresses = [
    "1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9",
    "mr45ZTgmifz4T3vWxjRRJMP28izZhpsG6J",
    "qpeegdam8htdrxp7ve3fchcgcu89ya5nwymjf2rzyp",
    "GUP3gXvjtWA6kQkCB779uCWbBuBhmJ3wde",
    "LVm5XcuczJnrvk94RJSLkTETUwm8tdz3XJ",
    "DFgDofYSD4T6CwdVykSc2CLJ9s8A6Bqt97",
    "XmDy6fFgsMmPpt3V73mGKxrV74yYkcKkiq",
    "t1UQjGk1vsyLQGaVoBbGAcFGcXPawYryGDH",
    "xJqmAHSGBN2qiKYmbe5hucTUVqh6AqDpM7"
];

// Função para gerar chave privada aleatória de 32 bytes (256 bits)
function generatePrivateKey() {
    return crypto.randomBytes(32);
}

// Função para gerar chave pública comprimida a partir da chave privada
function privateKeyToPublicKey(privateKey) {
    // Gerar a chave pública comprimida (33 bytes)
    const publicKey = secp256k1.publicKeyCreate(privateKey, true);
    return publicKey;
}

// Função para calcular o hash da chave pública e gerar o endereço P2PKH
function generateP2PKHAddress(privateKey) {
    const publicKey = privateKeyToPublicKey(privateKey);

    // Passo 1: Hash da chave pública com SHA-256
    const sha256Hash = crypto.createHash('sha256').update(publicKey).digest();

    // Passo 2: Hash com RIPEMD-160
    const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();

    // Passo 3: Adicionar o prefixo (0x00 para Bitcoin Mainnet)
    const prefix = Buffer.from([0x00]);
    const step3 = Buffer.concat([prefix, ripemd160Hash]);

    // Passo 4: Calcular o checksum (os primeiros 4 bytes do SHA-256 da chave pública)
    const checksum = crypto.createHash('sha256').update(step3).digest();
    const checksumFinal = crypto.createHash('sha256').update(checksum).digest().slice(0, 4);

    // Passo 5: Concatenar tudo
    const addressBytes = Buffer.concat([step3, checksumFinal]);

    // Passo 6: Codificar o endereço em Base58
    return base58Encode(addressBytes);
}

// Função para codificar em Base58 (utiliza o padrão Bitcoin Base58Check)
function base58Encode(buffer) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let value = BigInt('0x' + buffer.toString('hex'));
    let encoded = '';

    while (value >= 58) {
        const remainder = value % 58n;
        encoded = ALPHABET[Number(remainder)] + encoded;
        value = value / 58n;
    }

    encoded = ALPHABET[Number(value)] + encoded;

    // Adiciona prefixo de zeros
    let leadingZeros = 0;
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0) {
            leadingZeros++;
        } else {
            break;
        }
    }

    return '1'.repeat(leadingZeros) + encoded;
}

// Função que roda indefinidamente até um endereço coincidir com os alvos
function generateAndCheckAddress() {
    const privateKey = generatePrivateKey();
    const p2pkhAddress = generateP2PKHAddress(privateKey);

    console.log("Gerando Endereço P2PKH:", p2pkhAddress);

    // Verificar se o endereço gerado está na lista de alvos
    if (targetAddresses.includes(p2pkhAddress)) {
        const publicKey = privateKeyToPublicKey(privateKey);
        const hexPublicKey = publicKey.toString('hex');
        console.log("Endereço encontrado:", p2pkhAddress);
        console.log("Chave pública em HEX:", hexPublicKey);
        process.exit(); // Interrompe o programa quando o endereço for encontrado
    }
}

// Continuar gerando endereços até um endereço coincidir com os alvos
setInterval(generateAndCheckAddress, 0);  // Intervalo de 0 ms para rodar continuamente
