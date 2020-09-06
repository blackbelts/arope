import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CarInsuranceService } from '../car-insurance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/shared/ui.services';
import { HttpClient } from '@angular/common/http';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-insurance-info',
  templateUrl: './insurance-info.component.html',
  styleUrls: ['./insurance-info.component.css']
})
export class InsuranceInfoComponent implements OnInit, OnDestroy {
  objCovers;
  loadResObjExcessSub;
  isLoading = false;
  isLoadingSubs: Subscription;
  totalPrice;
  loadPriceSub;
  brand;
  price;
  brandCar;
  direction: 'rtl' | 'ltr';
  infoStatus = false;
  infoStatus1 = false;
  travelerInfoStatus = false;

  displayedColumns1: string[] = ['cover', 'comprehensive_1', 'comprehensive_2', 'total_loss_only'];
  displayedColumns2: string[] = ['cover', 'comprehensive', 'total_loss_only'];

  objCarInfo;
  @ViewChild('stepper', {static: false}) stepper: MatStepper;

  constructor(private http: HttpClient , private carService: CarInsuranceService, private route: ActivatedRoute, private router: Router, private uiService: UIService) { }

  ngOnInit() {


    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('brand') && !paramMap.has('product') && !paramMap.has('price'))  {
        this.router.navigate(['car-insurance']);
        return;
      }
      this.brandCar = paramMap.get('brandCar');
      this.brand = paramMap.get('brand');
      this.price = paramMap.get('price');
      

    });
    this.isLoadingSubs = this.uiService.loadingChangedStatus.subscribe(res => {
      this.isLoading = res;
      
    });

    this.loadPriceSub = this.carService.loadPrice.subscribe(res => {

      this.objCarInfo = res;
      console.log('res', res);
    });

    const data = {
      paramlist: {
        data: {brand: this.brand, lang: this.lang, price: parseInt(this.price)}
      }
    };
    this.carService.sendPriceAndGetPrice(data);
  

    if (this.lang === 'en') {
      this.direction = 'ltr';
    } else {
      this.direction = 'rtl';
    }
  }

  get lang() { return localStorage.getItem('lang'); }



  chkIfTrueOrFalse(val) {
    if(val == 'true' || val == 'false') {
      

      if(val == 'true') {
        return true;
      } else {
        return false;
      }

    } else if(val == '') {
      return 'ـــ';
    } else {
      return val;
    }
  }

  goForwardToPayment(stepper: MatStepper, event) {
 
    this.infoStatus1 = true;
    setTimeout(() => {
      if (this.infoStatus1) { this.stepper.next(); }
    }, 100);

  }

  goToNextStepper(type, plan, stepper: MatStepper) {
   localStorage.setItem('planTypeCar', plan);
    this.infoStatus = true;

    setTimeout(() => {
      if (this.infoStatus) { this.stepper.next(); }
    }, 100);

  }

  convertObjectToKeys(obj) {
    return Object.keys(obj);
  }

  convertObjectToValues(obj) {
    return Object.values(obj);
  }





  ngOnDestroy() {
    if (this.loadPriceSub) { this.loadPriceSub.unsubscribe(); }
    if (this.isLoadingSubs) { this.isLoadingSubs.unsubscribe(); }
  }

}
