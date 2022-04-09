import axios from "axios";
import {tba_auth} from "../ns_authentication/tba_auth.mjs";

module.exports = async function (context, req) {

    console.log('Starting');
    const url = "https://6396621-sb1.suitetalk.api.netsuite.com/services/rest/record/v1/inventoryitem/8095";
    const signature = tba_auth('GET',
        url,
        '9823151e41ecace5bae60780425695ce7893465b62f8a4ae99dd4b75bb45d174',
        'f589ce820be3778a2faadc39f5d071bb6b152317badbdf7d587b4288b6886f15')
    context.log(signature)

    const response = await axios.get(url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": signature,
            "User-Agent" : 'Hello/1.0'
        }
    });
    context.log(`RES: ${JSON.stringify(response.data)}`);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: response.data
    };
}