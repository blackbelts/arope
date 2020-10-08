import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MedicalService } from '../medical.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-medical-info',
  templateUrl: './medical-info.component.html',
  styleUrls: ['./medical-info.component.css']
})
export class MedicalInfoComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  infoStatus = false;
  travelerInfoStatus = false;
  displayedColumns: string[] = [];
  loadMedicalInfoSub: Subscription;
  loadMedicalNotesSub: Subscription;
  type: string;
  date: string;
  objMedicalInfo;
  lang;
  notes: [];
  @ViewChild('stepper', {static: true}) stepper: MatStepper;
  constructor(private medicalService: MedicalService, private router: Router, private activatedParam: ActivatedRoute) {
  }

  ngOnInit() {
    this.lang = localStorage.getItem('lang');
    this.activatedParam.queryParamMap.subscribe(param => {
        this.type = param.get('type');
        localStorage.setItem('medicalType', this.type);
        this.date = param.get('date');
        console.log('type => ', this.type);
        this.loadMedicalNotesSub = this.medicalService.loadMedicalNotes.subscribe(note => {
          this.notes = note;
          console.log(this.notes);

        });
        this.loadMedicalInfoSub = this.medicalService.loadMedicalInfo.subscribe(info => {
          this.objMedicalInfo = info.data;
          this.displayedColumns.push('cover');
          const all = info.column;
          // all =  info.columns;
          for (const rec of all) {
            this.displayedColumns.push(rec);
          }
          this.displayedColumns = this.displayedColumns.filter((value, index, array) =>
          !array.filter((v, i) => JSON.stringify(value) === JSON.stringify(v) && i < index).length);
          console.log(this.displayedColumns);
        });

        if (this.type === 'individual') {
          this.medicalService.getTabels(this.type, this.date);
        } else if (this.type === 'family') {
          const date_arr = this.date.split(',');
          console.log('data', date_arr);
          this.medicalService.getTabels(this.type, date_arr);
        } else if (this.type === 'smes') {
          const new_arr = this.date.split('-');
          const new_arr2 = [];
          new_arr.map(function(val) {
            new_arr2.push(JSON.parse(val));
          });

          this.medicalService.getTabels(this.type, new_arr2);
        }
        this.medicalService.get_notes(this.type);
      });
  }

  chkIfTrueOrFalse(val) {
    if (typeof(val) === 'boolean') {

      if (val === true) {
        return true;
      } else {
        return false;
      }

    } else if (val === '') {
      return 'ـــ';
    } else {
      return val;
    }
  }

  onClick(type) {
    this.medicalService.onClickPlan(type);
  }

  goToNextStepper(page: string, planType: string, stepper: MatStepper) {
    localStorage.setItem('planType', planType);
    console.log('HERE', planType);
    this.infoStatus = true;

    setTimeout(() => {
      if (this.infoStatus) { stepper.next(); }
    }, 100);

  }



  goForwardToPayment(stepper: MatStepper, event) {

    this.travelerInfoStatus = true;
    setTimeout(() => {
      if (this.travelerInfoStatus) { stepper.next(); }
    }, 100);

  }

  ngOnDestroy() {
    if (this.loadMedicalInfoSub) { this.loadMedicalInfoSub.unsubscribe(); }
  }

}
