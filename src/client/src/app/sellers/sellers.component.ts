import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastsManager } from "ng2-toastr";

import { SellerModalComponent } from "./../modals/seller-modal/seller-modal.component";

import { StoreService } from "./../store.service";

import { Seller } from "./../../interfaces/seller";

@Component({
    selector: "app-sellers",
    templateUrl: "./sellers.component.html",
    styleUrls: ["./sellers.component.scss"]
})
export class SellersComponent implements OnInit {

    sellers: Seller[];

    constructor(
        private storeService: StoreService,
        private router: Router,
        private modalService: NgbModal,
        private toastr: ToastsManager,
        vcr: ViewContainerRef
    ) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.getSellers();
    }

    onRow(id: number, event: any) {
        // Do not go to details page if the Edit button was pushed
        if (event.target.tagName !== "BUTTON") {
            this.router.navigate(["sellers", id]);
        }
    }

    onAdd() {
        const modalRef = this.modalService.open(SellerModalComponent);
        modalRef.componentInstance.toastr = this.toastr; // Pass toastr
        modalRef.componentInstance.editing = false; // Set editing to false

        modalRef.componentInstance.success.subscribe(added => {
            this.toastr.success(
                "Seller was added",
                "Added!");

            this.getSellers(); // Refresh sellers list
        });
    }

    onEdit(id: number) {
        this.storeService.getSeller(id).subscribe(seller => {
            const modalRef = this.modalService.open(SellerModalComponent);
            modalRef.componentInstance.toastr = this.toastr; // Pass toastr
            modalRef.componentInstance.editing = true; // Set editing to true

            // Pass seller info
            modalRef.componentInstance.id = seller.id;
            modalRef.componentInstance.name = seller.name;
            modalRef.componentInstance.category = seller.category;
            modalRef.componentInstance.imagePath = seller.imagePath;

            modalRef.componentInstance.success.subscribe(added => {
                this.toastr.success(
                    "Seller was edited",
                    "Edited!");

                this.getSellers(); // Refresh sellers list
            });
        }, error => {
            // 404 error
            if (error.status === 404) {
                this.toastr.error(
                    "404 Not Found",
                    "Seller not found");
            } else {
                // Unknown error (most likely server error)
                this.toastr.error(
                    "See console for details",
                    "Fatal error");

                console.log(error);
            }
        });
    }

    private getSellers() {
        this.storeService.getSellers().subscribe(sellers => {
            this.sellers = sellers;
        }, error => {
            // Unknown error (most likely server error)
            this.toastr.error(
                "See console for details",
                "Fatal error");

            console.log(error);
        });
    }
}
