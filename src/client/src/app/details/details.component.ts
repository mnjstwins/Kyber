import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastsManager } from "ng2-toastr";
import { ActivatedRoute } from "@angular/router";

import { StoreService } from "./../store.service";

import { ProductModalComponent } from "./../modals/product-modal/product-modal.component";

import { Seller } from "./../../interfaces/seller";
import { Product } from "./../../interfaces/product";

@Component({
    selector: "app-details",
    templateUrl: "./details.component.html",
    styleUrls: ["./details.component.scss"]
})
export class DetailsComponent implements OnInit {
    id: number;

    seller: Seller = {
        id: 0,
        name: "",
        category: "",
        imagePath: ""
    };

    products: Product[] = [];
    topProducts: Product[] = [];

    constructor(
        private storeService: StoreService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        public toastr: ToastsManager,
        vcr: ViewContainerRef
    ) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.id = this.route.snapshot.params["id"];

        this.storeService.getSeller(this.id).subscribe(seller => {
            this.seller = seller;
        });

        this.storeService.getProducts(this.id).subscribe(products => {
            this.products = products;
            this.populateTopTen();
        });
    }

    onAdd() {
        const modalRef = this.modalService.open(ProductModalComponent);
        modalRef.componentInstance.toastr = this.toastr;
        modalRef.componentInstance.editing = false;

        modalRef.componentInstance.sellerID = this.id;

        modalRef.componentInstance.success.subscribe(added => {
            if (added) {
                this.toastr.success(
                    "Product was added",
                    "Added!");

                this.storeService.getProducts(this.id).subscribe(products => {
                    this.products = products;
                    this.populateTopTen();
                });
            }
        });
    }

    onEdit(id: number) {
        let product: Product = undefined;

        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].id === id) {
                product = this.products[i];
            }
        }

        if (product !== undefined) {
            const modalRef = this.modalService.open(ProductModalComponent);
            modalRef.componentInstance.toastr = this.toastr;
            modalRef.componentInstance.editing = true;

            modalRef.componentInstance.sellerID = this.id;

            modalRef.componentInstance.id = product.id;
            modalRef.componentInstance.name = product.name;
            modalRef.componentInstance.price = product.price;
            modalRef.componentInstance.quantityInStock = product.quantityInStock;
            modalRef.componentInstance.imagePath = product.imagePath;

            modalRef.componentInstance.success.subscribe(added => {
                if (added) {
                    this.toastr.success(
                        "Product was edited",
                        "Edited!");

                    this.storeService.getProducts(this.id).subscribe(products => {
                        this.products = products;
                        this.populateTopTen();
                    });
                }
            });
        }
    }

    private populateTopTen() {
        let sortedProducts = this.products.slice();
        sortedProducts = sortedProducts.sort((p1, p2) => {
            if (p1.quantitySold < p2.quantitySold) {
                return 1;
            } else if (p2.quantitySold < p1.quantitySold) {
                return -1;
            } else {
                return 0;
            }
        });

        this.topProducts = sortedProducts.slice(0, 10);
    }
}
