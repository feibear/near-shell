
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { KeyPair, utils } = require('nearlib');

module.exports = {
    command: 'create_account <accountId>',
    desc: 'create a new developer account',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Unique identifier for the newly created account',
            type: 'string',
            required: true
        })
        .option('masterAccount', {
            desc: 'Account used to create requested account.',
            type: 'string',
            required: true
        })
        .option('publicKey', {
            desc: 'Public key to initialize the account with',
            type: 'string',
            required: false
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to newly created account',
            type: 'string',
            default: '0.1'
        }),
    handler: exitOnError(createAccount)
};

async function createAccount(options) {
    options.initialBalance = utils.format.parseNearAmount(options.initialBalance);
    // NOTE: initialBalance is passed as part of config here
    let near = await connect(options);
    let keyPair;
    let publicKey;
    if (options.publicKey) {
        publicKey = options.publicKey;
    } else {
        keyPair = await KeyPair.fromRandom('ed25519');
        publicKey = keyPair.getPublicKey();
    }
    await near.createAccount(options.accountId, publicKey);
    if (keyPair) {
        await near.connection.signer.keyStore.setKey(options.networkId, options.accountId, keyPair);
    }
    console.log(`Account ${options.accountId} for network "${options.networkId}" was created.`);
}