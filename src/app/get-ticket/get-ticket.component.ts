import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OdooService } from '../shared/odoo.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CarInsuranceService } from '../car-insurance/car-insurance.service';

@Component({
  selector: 'app-get-ticket',
  templateUrl: './get-ticket.component.html',
  styleUrls: ['./get-ticket.component.css']
})
export class GetTicketComponent implements OnInit {
  breakpoint;
  isLoading = false;
  planType: string;
  @Output() clicked = new EventEmitter();
  brandCar: string;
  product: string;
  price: number;
  type: string;
  planTypeCar: string;
  @Input('plan') plan: string;
  constructor(private carService: CarInsuranceService , private odoo: OdooService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(param => {
      console.log('params', param);
      this.brandCar = param.get('brandCar');
      this.product = param.get('product');
      this.price = Number(param.get('price'));
      this.type = localStorage.getItem('medicalType');
      console.log(this.brandCar, this.product, this.price);
    });



    this.breakpoint = window.innerWidth <= 700 ? 1 : 3;
    this.planType = localStorage.getItem('planType');
    this.planTypeCar = localStorage.getItem('planTypeCar');
  }
  get lang() { return localStorage.getItem('lang'); }

  submitForm(form: NgForm) {
    this.isLoading = true;
    let obj;
    const groups = JSON.parse(localStorage.getItem('groupMembers'));
    if (this.planType) {
      console.log('HERE1');
      obj = {
        type: this.type,
        product: this.planType,
        name: form.value.name,
        phone: form.value.prefixNum + form.value.phoneNumber,
        mail: form.value.emailAddress
      };
      this.getTicketMedicalIsurance(obj);
    } else if (this.brandCar && this.price) {
      console.log('HERE2');
      obj = {
        name: form.value.name,
        phone: form.value.prefixNum + form.value.phoneNumber,
        mail: form.value.emailAddress,
        price: this.price,
        brand: this.brandCar,
        // // product: this.planTypeCar
      };

      this.getTicketCar(obj);
    } else {
      console.log('HERE3');
      obj = {
        group: groups,
        type: 'travel',
        name: form.value.name,
        phone: form.value.prefixNum + form.value.phoneNumber,
        mail: form.value.emailAddress
      };
      this.getTicketGroup(obj);
    }




  }
  getTicketCar(data) {
    console.log('ticket data', data);
    this.carService.getTicketCar(data).subscribe(res => {
      if (res) {
        // this.router.navigate(["/thanks"]);
        console.log('res', res);
        this.isLoading = false;
        this.clicked.emit('true');
      }
    }, error => console.log(error));

    localStorage.setItem('planTypeCar', '');
  }

  getTicketGroup(dataList) {
    const data = {
      paramlist: {
        data: {
          data: dataList
        }
      }
    };

    this.odoo
      .call_odoo_function(
        'travel.front',
        'create_travel_ticket',
        data
      )
      .subscribe(res => {
        console.log(res);
        this.isLoading = false;
        this.clicked.emit('true');
      });
  }

  getTicketMedicalIsurance(dataList) {
    const data = {
      paramlist: {
        data: dataList
      }
    };
    this.odoo
      .call_odoo_function(
        'medical.api',
        'create_medical_ticket',
        data
      )
      .subscribe(res => {
        console.log(res);
        this.isLoading = false;
        this.clicked.emit('true');

        localStorage.setItem('planType', '');
      });
  }

  onResize(event) {

    this.breakpoint = event.target.innerWidth <= 700 ? 1 : 3;
  }

}
