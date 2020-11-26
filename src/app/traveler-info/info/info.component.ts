import { WelcomeService } from './../../welcome/welcome.service';
import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators, AbstractControl } from '@angular/forms';
import { SiteSettingsService } from 'src/app/shared/site_settings.service';
import { OdooService } from 'src/app/shared/odoo.service';
import { TravelerService } from '../traveler.service';
import { ValidationService } from 'src/app/shared/validation.service';
import { saveAs } from 'file-saver';
// FORMATE DATE
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../date.adapter';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UIService } from 'src/app/shared/ui.services';
import 'rxjs/add/operator/catch';
import { PaymentService } from 'src/app/shared/payment.service';
import { FaweryService } from 'src/app/shared/fawery.service';

declare let Checkout: any;
declare let FawryPay: any;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class InfoComponent implements OnInit, AfterViewInit {
  isLoading = false;
  constructor(
    private setting: SiteSettingsService,
    private odoo: OdooService,
    private welService: WelcomeService,
    private travelerService: TravelerService,
    private validation: ValidationService,
    private dateAdapter: DateAdapter<Date>,
    private router: Router,
    private routerActivated: ActivatedRoute,
    private uiService: UIService,
    private http: HttpClient,
    private paymentService: PaymentService,
    private ui: UIService,
    private faweyService: FaweryService
    // private save: saveAs
  ) {
  }
  @ViewChild('fInfo', { static: false }) customForm: NgForm;
  sessionID: string;
  // @ViewChild('fInfo', {static: true}) form: NgForm;
  numOfTravelers = [];
  types = [
    { value: 'spouse', viewValue: 'Spouse' },
    { value: 'kid', viewValue: 'Kid' },
    { value: 'brother', viewValue: 'Brother' },
    { value: 'sister', viewValue: 'Sister' },
    { value: 'parent', viewValue: 'Parent' },
    { value: 'grandparents', viewValue: 'Grandparents' },

  ];
  numberPattern = '^(\d|\w)+$';
  minDateKid;
  maxDateKid;
  dataJson;
  typesList;
  datesList;
  checked;
  check = true;
  isValidFormSubmitted = false;
  isConfrim = false;
  mail: boolean;
  type;
  date;
  indi;
  cid: boolean;
  breakpoint: number;
  breakpoint2: number;
  // isFirstPolicy = true;
  national = 'egyptian';
  isEgyptian = true;
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
  payment_method;
  matcher = new MyErrorStateMatcher();
  @Output() changeStatus = new EventEmitter();
  qnbConfig;
  addScript = false;

  ngOnInit() {



    this.breakpoint = window.innerWidth <= 700 ? 1 : 2;
    this.breakpoint2 = window.innerWidth <= 700 ? 1 : 3;

    // start qnp config
    // this.initQnpConfig();
    // end qnp config
    // params query
    this.routerActivated.queryParamMap.subscribe(param => {

      // start code
      if (param.has('step')) {
        console.log('text', param.get('step'));
        localStorage.setItem('stepper', 'true');
        this.changeStatus.emit(true);
        const formData = JSON.parse(localStorage.getItem('formData'));
        // let s_covers = [];
        // if (localStorage.getItem("s_covers") !== "") {
        //   s_covers = localStorage.getItem("s_covers").split(",");
        //   s_covers.forEach((cover, index) => {
        //     s_covers[index] = parseInt(cover);
        //   });
        // }
        // formData.data.s_covers = s_covers;
        const data = { paramlist: { data: formData.data } };
        console.log('data', data);
        if (formData.key === 'travel') {
          // setup download file
          let headers = new HttpHeaders();
          headers = headers.set('Accept', 'application/pdf');


          this.odoo.call_odoo_function(
            'travel.front',
            'create_policy',
            data
          )
            .subscribe(res => {
              console.log('ressss', res);
              this.uiService.loadResId.next(res[1]);
              // this.testDownload();

              // download file
              this.http.get('http://online.aropeegypt.com.eg:8069/report/' + res[0], { headers, responseType: 'blob' }).subscribe(res => {
                console.log(res);
                saveAs(res, `Policy (AROPE).pdf`);
                // return this.http.get('http://207.154.195.214:8070/Terms/');
                // const link = document.createElement('a');
                // link.href = '207.154.195.214/TravelWording.pdf';
                // link.download = 'file.pdf';
                // link.dispatchEvent(new MouseEvent('click'));
                window.open('http://arp-alb-773417538.eu-west-1.elb.amazonaws.com/TravelWording_General_Conditions.pdf', '_blank');
                this.downloadTerms('http://arp-alb-773417538.eu-west-1.elb.amazonaws.com/TravelWording_General_Conditions.pdf');
              });


            });
        }

      }

    });


    this.type = localStorage.getItem('type');
    if (this.type === 'individual') {
      this.indi = true;
      this.date = localStorage.getItem('date');
    } else {
      const fJson = JSON.parse(localStorage.getItem('typesDates'));
      this.dataJson = JSON.parse(fJson);
      this.typesList = this.dataJson.types;
      this.datesList = this.dataJson.dates;
      console.log('DateList', this.datesList);
    }
    if (this.lang === 'en') {
      this.dateAdapter.setLocale('en');
    } else if (this.lang === 'ar') {
      this.dateAdapter.setLocale('ar');
    }
    this.minDateKid = this.setting.getDateInYears(18);
    this.maxDateKid = this.welService.getMinDateBefore30Days();
    const emptyArr = new Array(
      parseInt(localStorage.getItem('numOfTraveler'))
    );
    for (let i = 0; i < emptyArr.length; i++) {

      this.numOfTravelers.push(i);
    }

    // this.loadStripe();
    // this.loadData();
    // this.mail = false;
    // this.checkMail('ahmednourelhalaby@gmail.com');
  }
  downloadTerms(url) {
    let header = new HttpHeaders();
    header = header.set('Accept', 'application/pdf');
    this.http.get(url, { headers: header, responseType: 'blob' }).subscribe(res => {
      console.log(res);
      saveAs(res, `Terms&Conditions.pdf`);
    });
  }


  ngAfterViewInit() {
    const script = document.querySelector('#myscript');
    // script.setAttribute('data-complete', 'http://207.154.195.214:4000/complete/travel/test');
  }

  async initQnpConfig() {
    const data_traveler = JSON.parse(localStorage.getItem('formData'));
    const total_price = localStorage.getItem('total_price');

    // await this.uiService.loadPriceTotal.subscribe(total => {
    //   total_price = total;
    // });


    const sessionIDLocalStorage = JSON.parse(localStorage.getItem('__arope_order_details')).sesionID;

    if (data_traveler) {
      this.data_info = this.travelerService.getInfoTraveller();
    }
    let merchant = "";
    if (this.payment_method === "nbe") {
      merchant = "TESTNBETEST";
    } else if (this.payment_method === "qnb") {
      merchant = "TESTQNBAATEST001";
    }
    console.log(merchant);
    this.national = this.data_info.national;
    // qnp config
    this.qnbConfig = {
      merchant,
      session: {
        id: sessionIDLocalStorage
      },
      order: {
        amount() {
          // Dynamic calculation of amount
          return Number(total_price);
        },
        currency: 'EGP',
        description: this.data_info.package

      },
      interaction: {
        /* operation: 'PURCHASE', */
        merchant: {
          name: 'شركة أروب مصر',
          address: {
            line1: '30, Msadak, Ad Doqi Giza 12411'
          },
          phone: '02 33323299',

          logo: 'https://aropeegypt.com.eg/Property/wp-content/uploads/2019/10/Logoz-3.jpg'
        },
        locale: 'ar_EG',
        theme: 'default',
        displayControl: {
          billingAddress: 'HIDE',
          customerEmail: 'HIDE',
          orderSummary: 'HIDE',
          shipping: 'HIDE'
        }
      }
    };


    Checkout.configure(this.qnbConfig);
  }


  get lang() { return localStorage.getItem('lang'); }


  fullNameText(firstName, middleName, LastName) {
    return firstName + ' ' + middleName + ' ' + LastName;
  }
  goEmptyDate() {
    const selectElement = document.querySelector('.selectOptionType');
    selectElement.addEventListener('change', (event) => {
      console.log('show event value', event);
    });

  }

  setLocale(val) {

    this.dateAdapter.setLocale(val);
  }

  onResize(event) {

    this.breakpoint = event.target.innerWidth <= 700 ? 1 : 2;
    this.breakpoint2 = event.target.innerWidth <= 700 ? 1 : 3;
  }


  submitTravelerInfo(form: NgForm) {


    this.isValidFormSubmitted = false;
    const age = this.setting.convertDate(form.value.dateBirth);
    const when = this.setting.convertDate(localStorage.getItem('when'));
    const till = this.setting.convertDate(localStorage.getItem('till'));
    const prod = Number(localStorage.getItem('product'));

    const fullName = this.fullNameText(form.value.firstName, form.value.middleName, form.value.lastName);
    localStorage.setItem('fullName', fullName);
    // console.log(this.emailFormControl);
    if (localStorage.getItem('type') === 'individual') {



      const formData = {
        data: {
          source: 'online',
          package: localStorage.getItem('type'),
          c_name: this.fullNameText(form.value.firstName, form.value.middleName, form.value.lastName),
          add: form.value.address,
          pass: form.value.Passport,
          dob: age,
          gender: form.value.gender,
          phone: form.value.phoneNumber,
          zone: localStorage.getItem('zone'),
          p_from: when,
          p_to: till,
          family: [],
          id: form.value.id,
          mail: form.value.emailAddress,
          national: form.value.national,
          confirm: true,
          chk: true,
          condition: true
        }, key: 'travel'
      };
      localStorage.setItem('formData', JSON.stringify(formData));
      const data = {
        paramlist: {
          data: {
            z: localStorage.getItem('zone'), d: [age],
            p_from: when, p_to: till, product : prod
          }
        }
      };
      this.odoo.call_odoo_function('policy.travel',
        'get_individual', data).subscribe(res => {
          const x = res.gross.toFixed(2);
          localStorage.setItem('total_price', parseInt(x.toString(), 10).toString());
          this.changeShowValue();


          this.onClickAfterSubmit(form.value.payment_method);
        });
      const caching = {
        fname: form.value.firstName,

        lname: form.value.lastName,
        gender: form.value.gender,
        email: form.value.emailAddress,
        phone: form.value.phoneNumber,

      };
      // this.welService.sendQuoteResult('get_individual', data);
    } else {
      const object = form.value.additionalTravelers;
      console.log('hhhhhhhhhhhhhhhh', object);
      const objectKeys = Object.keys(object);
      const objectKeysLen = objectKeys.length / 8;
      let index = 1;
      const emptyArr = [];
      const kidAges = [];
      while (index <= objectKeysLen) {
        const types = object['type' + index];
        const firstName = object['tfirstName' + index];
        const middleName = object['tmiddleName' + index];
        const lastName = object['tlastName' + index];
        const dateBirth = object['tbirthDate' + index];
        const passports = object['tpassport' + index];
        const genders = object['tgender' + index];
        const fullName = ''.concat(' ', firstName, ' ', middleName, ' ', lastName);
        const jsonData = {
          name: fullName,
          dob: dateBirth,
          type: types,
          passport_num: passports,
          gender: genders
        };
        emptyArr.push(jsonData);
        if (types === 'kid') {
          kidAges.push(dateBirth);
        }

        index++;
      }
      const data = {
        paramlist: {
          data: {
            z: localStorage.getItem('zone'), p_from: when,
            p_to: till, kid_dob: kidAges, product : prod
          }
        }
      };
      const familyD = emptyArr;
      const formData = {
        data: {
          source: 'online',
          package: localStorage.getItem('type'),
          c_name: this.fullNameText(form.value.firstName, form.value.middleName, form.value.lastName),
          add: form.value.address,
          pass: form.value.Passport,
          gender: form.value.gender,
          phone: form.value.phoneNumber,
          dob: age,
          zone: localStorage.getItem('zone'),
          p_from: when,
          p_to: till,
          family: familyD,
          mail: form.value.emailAddress,
          id: form.value.id,
          confirm: true,
          national: form.value.national,
          chk: true,
          condition: true

        }, key: 'travel'
      };
      localStorage.setItem('formData', JSON.stringify(formData));
      this.odoo.call_odoo_function('policy.travel',
        'get_family', data).subscribe(res => {
          const x = res.gross.toString();
          console.log(x);
          // console.log(res);
          localStorage.setItem('total_price', x);
          this.changeShowValue();


          this.onClickAfterSubmit(form.value.payment_method);
        });
      this.welService.sendQuoteResult('get_family', data);
    }
    this.isValidFormSubmitted = true;
  }

  paymentChange(event) {
    if (event.value !== "fawry") {
      this.isLoading = true;
      const paymentScript = document.querySelector("#payment");
      const iframe = document.querySelector("iframe");
      if (paymentScript != null) {
        paymentScript.remove();
      }
      if (iframe != null) {
        iframe.remove();
      }
      const script = document.createElement("script");
      script.id = "payment";
      if (event.value === 'qnb') {
        script.src = 'https://qnbalahli.test.gateway.mastercard.com/checkout/version/43/checkout.js';
      } else if (event.value === 'nbe') {
        script.src = 'https://nbe.gateway.mastercard.com/checkout/version/57/checkout.js';
      }
      script.setAttribute("data-cancel", "cancelCallback");
      script.setAttribute("data-error", "errorCallback");
      script.setAttribute("data-complete", "completeCallback");
      script.type = 'text/javascript';
      document.head.appendChild(script);
      script.onload = (event) => {
        this.isLoading = false;
        // this.initQnpConfig();
        console.log("loadddddddddddddddd");
        console.log(event);

      };

      // Set script src depend on condition

      /*  script.setAttribute("data-cancel", "cancel")
       script.setAttribute("data-beforeRedirect", "cancel")
       script.setAttribute("data-afterRedirect", "cancel") */
      // Append

    }

  }
  async onClickAfterSubmit(payment_method) {
    const total_price = localStorage.getItem('total_price');

    await this.paymentService.qnpGetSession(total_price, payment_method).subscribe(response => {
      console.log(response, 'session');
      const key1 = 'sesionID';
      const key2 = 'orderID';
      const dataSaved = { sesionID: response[key1], orderID: response[key2] };
      localStorage.setItem('__arope_order_details', JSON.stringify(dataSaved));
      if (payment_method === 'qnb') {
        this.initQnpConfig();
        // console.log('data start', this.data_info);
        Checkout.showLightbox();
      } else if (payment_method === 'nbe') {
        this.initQnpConfig();
        // console.log('data start', this.data_info);
        Checkout.showLightbox();
      }
    });
    this.payment_method = payment_method;

    if (payment_method === 'fawry') {
      const returnData = this.faweyService.faweryConfig();
      console.log(returnData, 'return data');
      FawryPay.checkout((await returnData).charge_request, (await returnData).sucess_page_url, (await returnData).failer_page_url);
    }

    this.ui.loadingChangedStatus.next(true);
  }

  changeShowValue() {
    this.travelerService.changeStatusShowValue();

  }

  convertDate(dateAge) {
    let d = new Date(dateAge),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }
  checkId() {
    const dob = this.convertDate(this.customForm.value.dateBirth);
    const id = this.customForm.value.id.toString();
    const dyear = dob.substring(2, 4);
    const idYear = id.substring(1, 3);
    const dmonth = dob.substring(5, 7);
    const dday = dob.substring(8, 10);
    const idMonth = id.substring(3, 5);
    const idDay = id.substring(5, 7);
    if (idYear !== dyear || idMonth !== dmonth || idDay !== dday) {
      this.cid = false;
    } else {
      this.cid = true;

    }

  }
  showField(event) {
    const valueField = event.value;
    if (valueField === 'egyptian') {
      this.isEgyptian = true;

    } else {
      this.isEgyptian = false;
    }
  }

}
