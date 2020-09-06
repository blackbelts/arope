import { TravelerService } from './../traveler-info/traveler.service';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewChecked
} from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  NgModelGroup
} from '@angular/forms';
import { SiteSettingsService } from '../shared/site_settings.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { ValidationService } from 'src/app/shared/validation.service';
// FORMATE DATE
import {
  NativeDateAdapter,
  DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../date.adapter';
// import { saveAs } from 'file-saver';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { OdooService } from '../shared/odoo.service';
import { UIService } from '../shared/ui.services';
import { FaweryService } from '../shared/fawery.service';
import { PaymentService } from '../shared/payment.service';
declare let Checkout: any;
declare let FawryPay: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    }
  ]
})
export class PersonalInfoComponent implements OnInit, AfterViewChecked {
  isValidFormSubmitted = false;
  isConfrim = false;
  mail: boolean;
  cRate: boolean = true;
  cid: boolean;
  element: number[] = [0];
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  constructor(
    private setting: SiteSettingsService,
    private travelerService: TravelerService,
    private odoo: OdooService,
    private validation: ValidationService,
    private routerActivated: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private uiService: UIService,
    private paymentService: PaymentService,
    private faweryService: FaweryService
  ) {}
  @ViewChild('fInfo', { static: false }) customForm: NgForm;
  @ViewChild('others', { static: false }) ngModelGroup: NgModelGroup;
  matcher = new MyErrorStateMatcher();
  maxDate: Date;
  minDate: Date;
  date;
  othere;
  countries;
  others;
  confirm;
  conditions;
  policyLang = "ar";
  addScript = false;
  data_info = {
    phone: '',
    full_name: '',
    mail: '',
    address: '',
    national: null,
    city: '',
    total_price: 0,
    package: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: null,
    id: '',
    othere: '',
    after_die: 'true',
    language: ''
  };
  chkOther = false;
  qnbConfig;
  breakpoint: number;
  breakpoint2: number;
  @Output() changeStatus = new EventEmitter();
  ngOnInit() {
    this.breakpoint = window.innerWidth <= 700 ? 1 : 2;
    this.breakpoint2 = window.innerWidth <= 700 ? 1 : 3;

    const data = {paramlist: {filter: [],
      need: []}};
    this.odoo.call_odoo_function(
  'res.country', 'search_read', data ).subscribe(res => {
    this.countries = res;
    console.log(this.countries);
  });

    this.setting.getSession();


    if (!this.data_info.othere) {
      this.chkOther = false;
    } else {
      this.chkOther = true;
    }
    // params query
    this.routerActivated.queryParamMap.subscribe(param => {
      // start code
    // start code
    if (param.has('step')) {
      console.log('text', param.get('step'));
      localStorage.setItem('stepper', 'true');
      this.changeStatus.emit(true);
      const formData = JSON.parse(localStorage.getItem('formData'));

      const data = { paramlist: {data: formData.data} };
      console.log('data', typeof(formData.data));
      if (formData.key === 'personal') {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        console.log('personal==> ', data);
        this.odoo.call_odoo_function(
        'personal.front', 'create_policy', data ).subscribe(res => {
          console.log(res);
          this.uiService.loadResId.next(res[1]);
          this.http.get('http://3.249.109.211:8069/report/personal/' + res[0], { headers, responseType: 'blob' }).subscribe(res => {
            console.log(res);
            saveAs(res, `Policy (AROPE).pdf`);
            this.downloadTerms('http://207.154.195.214/PA_General_Conditions.pdf');
            window.open('http://207.154.195.214/PA_General_Conditions.pdf', '_blank');
          });

        });
        }

    }

    });

    /* max and min date */
    this.maxDate = this.setting.getDateInYears(75);
    this.minDate = this.setting.getDateInYears(18);
    /* end max and min date */
    this.date = localStorage.getItem('date');
    console.log('this date', this.date);
  }
  fullNameText(firstName, middleName, LastName) {
    return firstName + ' ' + middleName + ' ' + LastName;
  }
  downloadTerms(url) {
    let header = new HttpHeaders();
    header = header.set('Accept', 'application/pdf');
    this.http.get(url, { headers: header, responseType: 'blob' }).subscribe(res => {
      console.log(res);
      saveAs(res, `Terms&Conditions.pdf`);
    });
  }

  onResize(event) {

    this.breakpoint = event.target.innerWidth <= 700 ? 1 : 2;
    this.breakpoint2 = event.target.innerWidth <= 700 ? 1 : 3;
  }

  submitPersonalInfo(form: NgForm) {
    // console.log(form.value);
    const data = JSON.parse(localStorage.getItem('personalAccData'));
    const sum = data.sum_insured;
    const Job = data.job_id;
    const coversData = JSON.parse(localStorage.getItem('covers'));
    const coversId = coversData.id;
    const full_name = this.fullNameText(
      form.value.firstName,
      form.value.middleName,
      form.value.lastName
    );
    let othere;
    let bool_after_die;
    localStorage.setItem('fullName', full_name);

    if (!form.value.others) {
      othere = '';
    } else {
      othere = Object.values(form.value.others);
    }
    if (form.value.after_die === 'true') {
      bool_after_die = true;
    } else {
      bool_after_die = false;
    }

    const formData = {
      data: {
        c_name: this.fullNameText(
          form.value.firstName,
          form.value.middleName,
          form.value.lastName
        ),
        mail: form.value.emailAddress,
        phone: form.value.phoneNumber,
        id: form.value.id,
        sum_insured: sum,
        job: Job,
        cover: coversId,
        address: form.value.address,
        national: form.value.national,
        city: form.value.city,
        elig_bool: bool_after_die,
        othere,
        gender: form.value.gender,
        language: form.value.policyLang
      },
      key: 'personal'
    };

    console.log('form data', formData);
    localStorage.setItem('formData', JSON.stringify(formData));
    this.changeShowValue();
    // this.changeStatus.emit(true);
    this.isValidFormSubmitted = true;
    // form.resetForm();
    this.onClickAfterSubmit(form.value.payment_method);
  }


  async onClickAfterSubmit(payment_method) {
    const total_price = localStorage.getItem('total_price');

    await this.paymentService.qnpGetSession(total_price).subscribe(response => {
      console.log(response , 'session');
      const key1 =  'sesionID';
      const key2 =  'orderID';
      const dataSaved = {sesionID: response[key1], orderID: response[key2]};
      localStorage.setItem('__arope_order_details', JSON.stringify(dataSaved));

    });

    if (payment_method === 'qnp') {
      this.initQnpConfig();
      // console.log('data start', this.data_info);
      Checkout.showLightbox();
    } else if (payment_method === 'fawery') {
      const returnData = this.faweryService.faweryConfig();
      console.log(returnData, 'return data');
      FawryPay.checkout((await returnData).charge_request, (await returnData).sucess_page_url, (await returnData).failer_page_url);
    }

    this.uiService.loadingChangedStatus.next(true);
  }
  changeShowValue() {
    this.travelerService.changeStatusShowValue();
  }
  // checkMail() {
  //   // let result = true;
  //   const email = this.customForm.value.emailAddress;
  //   this.validation.checkMail(email).subscribe(res => {
  //     const key = 'smtp_check';
  //     this.mail = res[key];
  //   });
  // }
  get lang() {
    return localStorage.getItem('lang');
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
    const dob = this.convertDate(this.customForm.value.indAge);
    const id = this.customForm.value.id.toString();
    const dyear = dob.substring(2, 4);
    const idYear = id.substring(1, 3);
    const dmonth = dob.substring(5, 7);
    const dday = dob.substring(8, 10);
    const idMonth = id.substring(3, 5);
    const idDay = id.substring(5, 7);
    console.log(dob.substring(2, 4), dob.substring(5, 7), dob.substring(8, 10));
    if (idYear !== dyear || idMonth !== dmonth || idDay !== dday) {
      this.cid = false;
    } else {
      this.cid = true;
    }
  }

  deleteElement(index: number) {
    const ele = document.getElementById('field-' + index);
    ele.parentNode.removeChild(ele);
    // this.ngModelGroup.reset(delete this.ngModelGroup.value[index]);
    this.checkRate();
  }
  checkRate() {
    const others = Object.values(this.customForm.value.others);
    let x = 0;
    for (const other of others) {
      const key = 'rate';
      x += Number(other[key]);
    }
    if (x !== 100) {
      this.cRate = false;
    } else {
      this.cRate = true;
    }

  }
  ngAfterViewChecked() {

  }
  increaseElement() {
    this.element.push(this.element.length);
  }


  initQnpConfig() {
    const data_traveler = JSON.parse(localStorage.getItem('formData'));
    const sessionIDLocalStorage =  JSON.parse(localStorage.getItem('__arope_order_details')).sesionID;
    const total_price = localStorage.getItem('total_price');

    if (data_traveler) {
      console.log('data traveler', data_traveler);
      this.data_info = this.travelerService.getInfoPersonal();
      console.log('data-info', this.data_info);
      if (this.data_info.othere) {
        this.othere = this.data_info.othere;
        console.log('otheres ', this.othere);
        if (this.data_info.othere.length > 1) {
          for (
            let i = 0;
            i < Object.keys(this.data_info.othere).length - 1;
            i++
          ) {
            this.element.push(this.element.length);
          }
        }
      }
    }

    // qnp config
    this.qnbConfig = {
      merchant: 'TESTQNBAATEST001',
      session: {
        id: sessionIDLocalStorage
      },
      order: {
        amount() {
          // Dynamic calculation of amount
          return Number(total_price);
        },
        currency: 'EGP',
        description: this.data_info.package,
        // id: session_id
      },
      interaction: {
        merchant: {
          name: 'شركة أروب مصر',
          address: {
            line1: '30, Msadak, Ad Doqi Giza 12411'
          },
          phone: '02 33323299',

          logo:
            'https://aropeegypt.com.eg/Property/wp-content/uploads/2019/10/Logoz-3.jpg'
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
}
