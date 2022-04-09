/** @module tba_auth */
import {base_string_builder} from "./base_string_builder.mjs"
let crypto;
try {
    crypto = await import('crypto');
} catch (err) {
    console.log('crypto support is disabled!');
}

export const tba_auth = (httpMethod, url, consumerKey, tokenKey, nonce, timestamp) =>
{
    const signatureMethod = 'HMAC-SHA256';
    const oauth_version = '1.0';
    timestamp = Math.floor(Date.now()/1000);
    //timestamp = '1649419056';
    nonce = crypto.randomBytes(16).toString('base64');
    //nonce='Vi2VSzDLE84';
    let ns_account = '6396621_SB1';

    const base_string = base_string_builder(httpMethod,url,consumerKey,tokenKey,nonce,timestamp,oauth_version,signatureMethod)
    const key= encodeURI('dc6ea057b2e7113830763ca2e1d09fd294991b6e1378f6748cf81a50dda999c7')+'&'+encodeURI('ef7ba4ab14aa1fa329c82628a84ca8af54131bcd9107de8b1588b93e837ee169');

    const base64signature = encodeURIComponent(crypto.createHmac('sha256', key)
        .update(base_string)
        .digest('base64'));

    const oauth_header =
        'OAuth realm="'+ ns_account+
        '",oauth_consumer_key="'+ consumerKey+
        '",oauth_token="'+ tokenKey+
        '",oauth_signature_method="'+ signatureMethod+
        '",oauth_timestamp="'+ timestamp+
        '",oauth_nonce="'+ nonce+
        '",oauth_version="'+ oauth_version+
        '",oauth_signature="'+ base64signature+
        '"';

    console.log(oauth_header);
    return oauth_header;
}