import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UIService } from 'src/app/shared/ui.services';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.css']
})
export class ThankyouComponent implements OnInit, OnDestroy {
  fullName: string;
  numDoc;
  loadResIdSub: Subscription;
  isLoading: boolean = true;
  isLoadingSubscription: Subscription;
  constructor(private router: Router, private uiService: UIService) { }

  async ngOnInit() {
    this.fullName = localStorage.getItem('fullName');
    this.loadResIdSub = await this.uiService.loadResId.subscribe(res => {
      this.numDoc = res;
      this.uiService.loadingChangedStatus.next(false);
    });

    this.isLoadingSubscription = this.uiService.loadingChangedStatus.subscribe(res => {
      this.isLoading = res;
    });
  }

  back_to_home() {
    this.router.navigate(['/', 'traveler-insurance']).then(() => {
      // let myItem = localStorage.getItem('lang');
      // localStorage.clear();
      // localStorage.setItem('lang', myItem);
      // document.querySelector("#myscript").removeAttribute("data-complete");
    });
  }

  ngOnDestroy() {
    if (this.loadResIdSub) {this.loadResIdSub.unsubscribe(); }
    if (this.isLoadingSubscription) {this.isLoadingSubscription.unsubscribe(); }
  }

}
