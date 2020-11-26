import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UIService } from './ui.services';
import { Observable } from 'rxjs';
import { OdooService } from './odoo.service';

@Injectable()
export class PaymentService {

  constructor(private http: HttpClient, private odoo: OdooService) { }

  qnpGetSession(amount, paymentType) {
    return this.http.get(`http://online.aropeegypt.com.eg:4000/get_session/${amount}/${paymentType}`);

  }

  qnpComplete(mode: 'traveler' | 'personal') {
    const formData = JSON.parse(localStorage.getItem('formData'));
    const orderDetails = JSON.parse(localStorage.getItem('__arope_order_details'));
    let s_covers = []
    if (localStorage.getItem("s_covers") != "") {
      s_covers = localStorage.getItem("s_covers").split(",")
      s_covers.forEach((cover, index) => {
        s_covers[index] = parseInt(cover)
      })
    }
    formData.data.s_covers = s_covers
    formData.data.orderID = orderDetails.orderID;

    const data = { paramlist: { data: formData.data } };


    console.log('data send', data);
    // headers
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    if (mode === 'traveler') {

      this.odoo.call_odoo_function(
        'travel.front',
        'create_policy',
        data
      )
        .subscribe(res => {
          console.log('ressss', res);
          // doc_id, numb er

          // download file
          this.http.get('http://online.aropeegypt.com.eg:8069/report/' + res[0], { headers, responseType: 'blob' }).subscribe(res => {
            console.log(res);
            saveAs(res, `Policy (AROPE).pdf`);
            window.open('http://207.154.195.214/TravelWording_General_Conditions.pdf', '_blank');
            this.downloadTerms('http://207.154.195.214/TravelWording_General_Conditions.pdf');

          });

        });

    }

  }


  downloadTerms(url) {
    let header = new HttpHeaders();
    header = header.set('Accept', 'application/pdf');
    this.http.get(url, { headers: header, responseType: 'blob' }).subscribe(res => {
      console.log(res);
      saveAs(res, `Terms&Conditions.pdf`);
    });
  }
}
