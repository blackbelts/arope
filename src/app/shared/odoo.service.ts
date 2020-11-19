import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UIService } from './ui.services';
import { Observable } from 'rxjs';

@Injectable()
export class OdooService {

  constructor(private http: HttpClient, private uiService: UIService) { }
  call_odoo_function(modelName, functionName, data): Observable<any>  {
    data = JSON.stringify(data);
    const nwData = {paramlist: data};
    const port = 8069;
    const odooUrl = 'https://3.249.109.211:4000/call_method' + '/' + modelName + '/' + functionName;
    console.log('ay kalam 5');
    return this.http.post(odooUrl, nwData);
  }

  getReport() {
    this.http.get('http://3.249.109.211:8069/report/pdf/smart_travel_agency.policy/46').subscribe(res => console.log('report ', res));
  }

  // getSession() {
  //   const data = {paramlist: {data: {}}};
  //   this.call_odoo_function('get_session', 'online', 'online', 'policy.travel',
  //     'get_individual', data).subscribe(res => {
  //       console.log(res, 'res session');
  //     });
  //   }

}
