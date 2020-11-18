import { Component, OnInit, OnDestroy } from '@angular/core';
import { TravelerService } from '../traveler.service';
import { Subscription } from 'rxjs';
import { UIService } from '../../shared/ui.services';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.css']
})
export class QuoteComponent implements OnInit, OnDestroy {
  loadBenefitsSub: Subscription;
  displayedColumns: string[] = ['cover', 'limit'];
  transactions = [];
  isLoading = false;
  isLoadingSubs: Subscription;
  resObjExcess;
  s_covers = [];
  typeCheck: string;

  constructor(private travelerService: TravelerService, private uiService: UIService) {
  }

  ngOnInit() {
    this.typeCheck = localStorage.getItem('type');
    // this.s_covers = localStorage.getItem("s_covers").split(",");
    // this.s_covers.forEach((cover, index) => {
    //   this.s_covers[index] = parseInt(cover);
    // });
    // console.log(this.s_covers);
    this.loadBenefitsSub = this.travelerService.loadListBenefits.subscribe(
      result => {
        this.transactions = result;
        console.log(result);
      }
    );
    this.isLoadingSubs = this.uiService.loadingChangedStatus.subscribe(res => {
      this.isLoading = res;
    });
    this.getAllTransaction();

    this.uiService.loadingChangedStatus.subscribe(res => {
      this.isLoading = res;
    });
  }



  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }

  getAllTransaction() {
    this.travelerService.fetchfetchBenefits();
  }

  ngOnDestroy() {
    if (this.loadBenefitsSub) { this.loadBenefitsSub.unsubscribe(); }
    if (this.isLoadingSubs) { this.isLoadingSubs.unsubscribe(); }
  }

}
