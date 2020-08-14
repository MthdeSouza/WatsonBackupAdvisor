var fs = require('fs');

if (!process.env.VCAP_APPLICATION) {
    var appHost = "localhost:9345";
    var xmlCert = fs.readFileSync('./certs/local.pem', 'utf-8');
    var urlSSO = "w3id.alpha.sso.ibm.com";
} else {
    var appHost = JSON.parse(process.env.VCAP_APPLICATION).application_uris[0] || 'askcelly.w3ibm.mybluemix.net';
    var xmlCert = process.env.XML_CERT || fs.readFileSync('./certs/prod.pem', 'utf-8');
    var urlSSO = "w3id.sso.ibm.com";
}

module.exports = {
    "dev" : {
        passport: {
            strategy : 'saml',
            saml : {
                issuer:                 "https://" + appHost + "/",  //  "https://your-app.w3ibm.mybluemix.net/"
                callbackUrl:            "https://" + appHost + "/login/callback/postResponse",

                // Your SAML private signing key. Mellon script generates PKCS#8 key, make sure your key's header matches the ----BEGIN * PRIVATE KEY----- header here
                privateCert:            "-----BEGIN PRIVATE KEY-----\n" +
                                        xmlCert.match(/.{1,64}/g).join('\n') +
                                        "\n-----END PRIVATE KEY-----\n",
                signatureAlgorithm:     'sha256',

                // List groups that permit access to the application
                // blueGroupCheck:         [],

                // Some SSO templates return blueGroups attribute as JSON
                // attributesAsJson:       {"blueGroups": true},

                passive:                        false,
                identifierFormat:               "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
                skipRequestCompression:         false,
                disableRequestedAuthnContext:   true,

                // Update IDP attributes according to the service used
                entryPoint:     'https://' + urlSSO + "/auth/sps/samlidp/saml20/login", //"https://w3id.alpha.sso.ibm.com/auth/sps/samlidp/saml20/login ",
                entryPointBase: 'https://' + urlSSO +"/auth/sps/samlidp/saml20/login", //"https://w3id.alpha.sso.ibm.com/auth/sps/samlidp/saml20/login ",
                logoutUrl:      'https://' + urlSSO +"/auth/sps/samlidp/saml20/slo", //"https://w3id.alpha.sso.ibm.com/auth/sps/samlidp/saml20/slo",
                cert:           fs.readFileSync('./certs/'+ urlSSO +'.pem', 'utf-8')

            },
            sessionSecret: xmlCert
        }
    }
};
