/** @module base_string_builder */

export const base_string_builder = (httpMethod, url, consumerKey, tokenKey, nonce, timestamp, version, signatureMethod) =>
{
    //http method must be upper case
    let baseString = httpMethod.toUpperCase()+'&';

    //include url without parameters, schema and hostname must be lower case
    let baseUrl;
    let getParams;
    if(url.indexOf('?')>-1){
        baseUrl = url.substr(0,url.indexOf('?'));
        getParams = url.substr(url.indexOf('?')+1);
    }
    else{
        baseUrl = url;
        getParams = '';
    }

    const hostname = (baseUrl.substr(0, baseUrl.indexOf('/', 10))).toLowerCase();
    const path = baseUrl.substr(baseUrl.indexOf('/', 10));
    baseUrl = hostname + path;
    baseString += (encodeURIComponent(baseUrl) + '&');

    //all oauth and get params. First they are decoded, next alphabetically sorted,
    //next each key and values is encoded and finally whole parameters are encoded

    const params = {
        'oauth_consumer_key': new Array(consumerKey),
        'oauth_nonce': new Array(nonce),
        'oauth_signature_method': new Array(signatureMethod),
        'oauth_timestamp': [timestamp],
        'oauth_token': new Array(tokenKey),
        'oauth_version': new Array(version)
    };

    getParams.split('&').forEach(function(param){
        const parsed = param.split('=');
        if(parsed[0]!==''){
            const value = typeof parsed[1] !== 'undefined' ? decodeURI(parsed[1]):'';
            if(typeof params[decodeURI(parsed[0])] !== 'undefined'){
                params[decodeURI(parsed[0])].push(value);
            }else{
                params[decodeURI(parsed[0])] = new Array(value);
            }
        }
    });

    //all parameters and values must be alphabetically sorted
    let paramString = '';
    Object.keys(params).sort().forEach(function(key) {
        params[key].sort().forEach(function(value){
            paramString += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
        });
    });

    baseString += encodeURIComponent(paramString.substring(0, paramString.length-1));
    return baseString;
}