import {
  Component,
  OnInit,
  Output,
  AfterViewChecked,
  EventEmitter,
  Renderer2,
  Inject
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";
import { NgForm, NgModel } from "@angular/forms";
import { OdooService } from "src/app/shared/odoo.service";
import { TravelerService } from "../traveler.service";
import { PaymentModel } from "../payment.model";

export const MY_FORMATS = {
  parse: {
    dateInput: "MM/YYYY"
  },
  display: {
    dateInput: "MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})

export class PaymentComponent implements OnInit, AfterViewChecked {
  paymentForm: PaymentModel;
  loadAPI: Promise<any>;
  addScript: boolean = false;

  @Output() paymentStatus = new EventEmitter();
  qnbConfig ;
  constructor(
    private odoo: OdooService,
    private travelerService: TravelerService,
    private _render2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngOnInit() {
    //amount, name, adress, email, phone
 
    this.paymentForm = this.travelerService.paymentForm;
    console.log("", this.paymentForm);

    
    // let script = this._render2.createElement('script');
    // script.type = `application/ld+json`;
    // script.src = "https://qnbalahli.test.gateway.mastercard.com/checkout/version/55/checkout.js";
  }
  


    ngAfterViewChecked() {
     
      
    }

  
  submitPayment(form: NgForm) {
    
    if (form.valid) {
      console.log("ay kalam 1");
      const formData = JSON.parse(localStorage.getItem("formData"));
      // let s_covers = []
      // if (localStorage.getItem("s_covers") != "") {
      //   s_covers = localStorage.getItem("s_covers").split(",")
      //   s_covers.forEach((cover, index) => {
      //     s_covers[index] = parseInt(cover)
      //   })
      // }
      // formData.data.s_covers=s_covers
      const data = { paramlist: formData };
      this.odoo
        .call_odoo_function(
          "travel.front",
          "create_policy",
          data
        )
        .subscribe(res => {
        
          this.paymentStatus.emit(true);
        });
    }
  }
}
