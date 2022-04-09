import axios from "axios";
import {tba_auth} from "./tba_auth.mjs.js";

'./tba_auth.mjs'

netsuite_callout();

async function netsuite_callout ()
{
    const url = "https://6396621-sb1.suitetalk.api.netsuite.com/services/rest/record/v1/inventoryitem/8095";
    const signature = tba_auth('GET',
        url,
        '9823151e41ecace5bae60780425695ce7893465b62f8a4ae99dd4b75bb45d174',
        'f589ce820be3778a2faadc39f5d071bb6b152317badbdf7d587b4288b6886f15')
    console.log(signature)

    const response = await axios.get(url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": signature,
            "User-Agent" : 'Hello/1.0'
        }
    });
    console.log(`RES: ${JSON.stringify(response.data)}`);
}