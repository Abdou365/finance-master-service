const { writeFile } = require('fs');

const { generateKeyPairSync } = require('crypto');

function generateRSAKeys(fileNames) {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  fileNames.forEach((fileName) => {
    writeFile(`./keys/${fileName}Key.pem`, privateKey, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`${fileName} private key generated successfully`);
    });

    writeFile(`./keys/${fileName}Key.pub`, publicKey, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`${fileName} public key generated successfully`);
    });
  });
}

generateRSAKeys(['access', 'refresh', 'recovery', 'confirm']);
