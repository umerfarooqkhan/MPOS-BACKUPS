import ko, { Observable } from "knockout";
import * as Dialogs from "PosApi/Create/Dialogs";
import { ObjectExtensions } from "PosApi/TypeExtensions";

import { CfzICustomerSearchScanResult } from "./CfzICustomerSearchScanResult";

type CustSearchDialogResolve = (value: CfzICustomerSearchScanResult) => void;
type CustSearchDialogReject = (reason: any) => void;

export default class CfzCustomerSearchScan extends Dialogs.ExtensionTemplatedDialogBase {
    public number: Observable<string>;
    private resolve: CustSearchDialogResolve;
    private _automatedEntryInProgress: boolean;

    constructor() {
        super();
        this.number = ko.observable("");

        // Set the onBarcodeScanned property to enable the barcode scanner in a templated dialog.
        this.onBarcodeScanned = (data: string): void => {
            this._automatedEntryInProgress = true;
            this.number(data);
            this._automatedEntryInProgress = false;
        };
    }

    /**
     * The function that is called when the dialog element is ready.
     * @param {HTMLElement} element The element containing the dialog.
     */
    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

    /**
     * Opens the dialog.
     * @returns {Promise<string>} The promise that represents showing the dialog and contains the dialog result.
     */
    public open(cardNumber: string): Promise<CfzICustomerSearchScanResult> {
        this.number(cardNumber);
        let promise: Promise<CfzICustomerSearchScanResult> = new Promise((resolve: CustSearchDialogResolve, reject: CustSearchDialogReject) => {
            this.resolve = resolve;
            let option: Dialogs.ITemplatedDialogOptions = {
                title: "Add privilege card",
                onCloseX: this.onCloseX.bind(this),
                button1: {
                    id: "Button1",
                    label: "OK",
                    isPrimary: true,
                    onClick: this.button1ClickHandler.bind(this)
                },
                button2: {
                    id: "Button2",
                    label: "Cancel",
                    onClick: this.button2ClickHandler.bind(this)
                }
            };

            this.openDialog(option);
        });

        return promise;
    }

    public closeDialogClicked(): void {
        this.closeDialog();
        this.resolvePromise("Closed");
    }

    private onCloseX(): boolean {
        this.resolvePromise("Closed");
        return true;
    }

    private button1ClickHandler(): boolean {
        this.resolvePromise(this.number());
        return true;
    }

    private button2ClickHandler(): boolean {
        this.resolvePromise("Canceled");
        return true;
    }

    private resolvePromise(result: string): void {
        if (ObjectExtensions.isFunction(this.resolve)) {
            this.resolve(<CfzICustomerSearchScanResult>{
                selectedValue: result
            });

            this.resolve = null;
        }
    }
}