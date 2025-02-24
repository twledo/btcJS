const EC = require('elliptic').ec;
const crypto = require('crypto');
const bs58 = require('bs58');

const ec = new EC('secp256k1');

function privateKeyToP2PKH(hexPrivKey, compressed = true) {
    const keyPair = ec.keyFromPrivate(hexPrivKey, 'hex');
    let pubKey = keyPair.getPublic();

    if (compressed) {
        const x = pubKey.getX().toArrayLike(Buffer, 'be', 32);
        const y = pubKey.getY().toArrayLike(Buffer, 'be', 32);
        const prefix = (y[y.length - 1] % 2 === 0) ? Buffer.from([0x02]) : Buffer.from([0x03]);
        pubKey = Buffer.concat([prefix, x]);
    } else {
        pubKey = Buffer.concat([Buffer.from([0x04]), pubKey.encode(null, false)]);
    }

    const sha256PubKey = crypto.createHash('sha256').update(pubKey).digest();
    const ripemd160 = crypto.createHash('ripemd160').update(sha256PubKey).digest();
    const versionedPayload = Buffer.concat([Buffer.from([0x00]), ripemd160]);
    const checksum = crypto.createHash('sha256').update(
        crypto.createHash('sha256').update(versionedPayload).digest()
    ).digest().slice(0, 4);
    
    return bs58.encode(Buffer.concat([versionedPayload, checksum]));
}

const inicio = BigInt('0x80000000000000000');
const fim = BigInt('0xfffffffffffffffff');
const enderecoAlvo = '1MVDYgVaSN6iKKEsbzRUAYFrYJadLYZvvZ';
const maxIterations = 1e18;
let count = 0;

while (count < maxIterations) {
    const n = inicio + BigInt(Math.floor(Math.random() * Number(fim - inicio)));
    const hexPrivKey = n.toString(16).padStart(64, '0');
    const address = privateKeyToP2PKH(hexPrivKey, true);
    
    if (address === enderecoAlvo) {
        console.log(`Correspondência encontrada!\nChave privada (hex): ${hexPrivKey}\nEndereço P2PKH: ${address}`);
        break;
    }
    
    if (count % 100000 === 0) {
        console.log(`Iteração ${count}`);
    }
    count++;
}

console.log("Nenhuma correspondência encontrada no intervalo especificado.");
