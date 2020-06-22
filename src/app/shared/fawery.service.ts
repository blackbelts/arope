import { Injectable } from '@angular/core';
import { UIService } from './ui.services';
import { TravelerService } from '../traveler-info/traveler.service';

import * as shajs from 'sha.js';
@Injectable()
export class FaweryService {
    data_info = {
        phone: '',
        full_name: '',
        mail: '',
        address: '',
        total_price: 0,
        package: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        id: '',
        national: 'egyptian',
        Passport: '',
        confirm: false,
        chk: false,
        condition: false
      };
      national = 'egyptian';

    constructor(private uiService: UIService, private travelerService: TravelerService) { }

    async faweryConfig() {
    const data_traveler = JSON.parse(localStorage.getItem('formData'));
    const total_price = localStorage.getItem('total_price');

    const sessionIDLocalStorage = JSON.parse(localStorage.getItem('__arope_order_details')).sesionID;

    if (data_traveler) {
        this.data_info = this.travelerService.getInfoTraveller();
      }
    const secureHash = "e9d6e2ec956e49ca9c3adf78392dbd5c";
    const merchantCode = "1tSa6uxz2nRcB+Yh5O0piw==";
    const orderID = JSON.parse(localStorage.getItem('__arope_order_details')).orderID;
    const signature = this.hashCode(merchantCode, orderID, 1, 1122, total_price, 0, secureHash);

    this.national = this.data_info.national;
    const chargeRequest = {
        "language": "ar-eg",
        "merchantCode": merchantCode,
        "merchantRefNumber": orderID,
        "customer":
          {
            "name": this.data_info.full_name,
            "mobile": this.data_info.phone,
            "email": this.data_info.mail
          },
          "order": {
            "description": this.data_info.package,
            "expiry": "0",
            "orderItems":
              [
                {
                  "productSKU": "1122",
                  "description": this.data_info.package,
                  "price": total_price,
                  "quantity": "1",
                  "width": "0",
                  "height": "0",
                  "length": "0",
                  "weight": "0"
                }
              ]
            },
            "signature":  signature
      };
    console.log(chargeRequest, 'payload data from request');
    const key = JSON.parse(localStorage.getItem('formData')).key;
    let successPageUrl = '';
    if (key === 'travel') {
         successPageUrl = 'http://arp-alb-773417538.eu-west-1.elb.amazonaws.com/arope/traveler-insurance/traveler-info?step=thankyou';
      } else {
        successPageUrl = 'http://arp-alb-773417538.eu-west-1.elb.amazonaws.com/arope/personal-accident/personal-result?step=thankyou';

      }
    const failerPageUrl = '#';

    return {
        charge_request: chargeRequest,
        sucess_page_url : successPageUrl,
        failer_page_url : failerPageUrl
      };
    }



    hashCode(merchantCode, merchantRefNumber, customerProfile, itemCode, price, expire, secureHashKey) {
        const stringToBeHashed = merchantCode + merchantRefNumber + customerProfile + itemCode + price + expire + secureHashKey;
        return shajs('sha256').update({stringToBeHashed}).digest('hex');
    }
}
