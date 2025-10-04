/**
 * SAMPLE CODE NOTICE
 * 
 * THIS SAMPLE CODE IS MADE AVAILABLE AS IS.  MICROSOFT MAKES NO WARRANTIES, WHETHER EXPRESS OR IMPLIED,
 * OF FITNESS FOR A PARTICULAR PURPOSE, OF ACCURACY OR COMPLETENESS OF RESPONSES, OF RESULTS, OR CONDITIONS OF MERCHANTABILITY.
 * THE ENTIRE RISK OF THE USE OR THE RESULTS FROM THE USE OF THIS SAMPLE CODE REMAINS WITH THE USER.
 * NO TECHNICAL SUPPORT IS PROVIDED.  YOU MAY NOT DISTRIBUTE THIS CODE UNLESS YOU HAVE A LICENSE AGREEMENT WITH MICROSOFT THAT ALLOWS YOU TO DO SO.
 */

import * as Triggers from "PosApi/Extend/Triggers/TransactionTriggers";
import { ArrayExtensions, ObjectExtensions, StringExtensions } from "PosApi/TypeExtensions";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { ITextInputDialogOptions, ITextInputDialogResult, ShowTextInputDialogClientRequest, ShowTextInputDialogClientResponse, ShowTextInputDialogError } from "PosApi/Consume/Dialogs";
import { GetConnectionStatusClientRequest, GetConnectionStatusClientResponse, GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { CFZCustomer as CFZCustomers } from "../../DataService/DataServiceRequests.g";
import CfzGlobalData from "./CFZGlobalData";

export default class PreEndTransactionTrigger extends Triggers.PreEndTransactionTrigger {

    public execute(options: Triggers.IPreEndTransactionTriggerOptions): Promise<ClientEntities.ICancelable> {

        let cartLocal: ProxyEntities.Cart;
        cartLocal = options.cart;

        //Update Global Class
        let cfz: CfzGlobalData = new CfzGlobalData();
        //Update Global Class

        var conStatus: string = "";

        if (
            ArrayExtensions.hasElements(cartLocal.CartLines) &&
            cartLocal.CartTypeValue != ProxyEntities.CartType.IncomeExpense &&
            cartLocal.CartTypeValue != ProxyEntities.CartType.AccountDeposit &&
            cartLocal.CartStatusValue != ProxyEntities.CartStatus.Voided &&
            cartLocal.CartStatusValue != ProxyEntities.CartStatus.Suspended
        ) {
            return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
                .then((cartresp: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelable> => {

                    cartLocal = cartresp.data.result;

                    //Update Global Class
                    cfz.SetCart(cartresp.data.result);
                    //Update Global Class


                    let getConnectionStatusClientRequest: GetConnectionStatusClientRequest<GetConnectionStatusClientResponse> =
                        new GetConnectionStatusClientRequest<GetConnectionStatusClientResponse>(this.context.logger.getNewCorrelationId());

                    return this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                        .then((connectionStatus: ClientEntities.ICancelableDataResult<GetConnectionStatusClientResponse>)
                            : Promise<ClientEntities.ICancelable> => {

                            if (connectionStatus.data.result == ClientEntities.ConnectionStatusType.Online) {

                                return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
                                    .then((getCurrentCartClientResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>)
                                        : Promise<ClientEntities.ICancelable> => {

                                        cartLocal = getCurrentCartClientResponse.data.result;


                                        // Execute Customer Discount Previlage Customization
                                        if (cartLocal.DiscountAmount > 0
                                            && (!StringExtensions.isNullOrWhitespace(cartLocal.CustomerId))
                                            && cartLocal.AffiliationLines.length > 0) {

                                            return this.CustomerdiscountAmount(cartLocal);
                                        }
                                        return Promise.resolve({ canceled: false });
                                    });
                            }
                            return Promise.resolve({ canceled: false });
                        })
                        .then((): Promise<ClientEntities.ICancelable> => {


                            return this.context.runtime.executeAsync<GetDeviceConfigurationClientResponse>(new GetDeviceConfigurationClientRequest())
                                .then((deviceConfig: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>): Promise<ClientEntities.ICancelable> => {

                                    if (!Commerce.StringExtensions.isNullOrWhitespace(deviceConfig.data.result.Placement)) {

                                        if (this.calTax(cartLocal.CartLines)) {

                                            let CustomRequest: CFZCustomers.getTransactionDataActionRequest<CFZCustomers.getTransactionDataActionResponse> =
                                                new CFZCustomers.getTransactionDataActionRequest(cartLocal, "PCTCODE", "");

                                            return this.context.runtime.executeAsync<CFZCustomers.getTransactionDataActionResponse>(CustomRequest)
                                                .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.getTransactionDataActionResponse>): Promise<ClientEntities.ICancelable> => {

                                                    if (response.data.result == "true") {

                                                        return this.context.runtime.executeAsync<GetConnectionStatusClientResponse>(new GetConnectionStatusClientRequest())
                                                            .then((connectionStatus: ClientEntities.ICancelableDataResult<GetConnectionStatusClientResponse>): Promise<ClientEntities.ICancelable> => {
                                                                if (connectionStatus.data.result == ClientEntities.ConnectionStatusType.Online) {
                                                                    conStatus = "Online";

                                                                    return this.callFBRFUNC(conStatus, cartLocal.TotalSalesAmount);
                                                                }
                                                                else {
                                                                    if (cartLocal.ExtensionProperties.length == 0) {
                                                                        conStatus = "Offline";
                                                                        return this.callFBRFUNC(conStatus, cartLocal.TotalSalesAmount);
                                                                    }
                                                                    else {
                                                                        return Promise.resolve({ canceled: false });
                                                                    }
                                                                }
                                                            });

                                                    }
                                                    else {
                                                        let error: ShowTextInputDialogError = new ShowTextInputDialogError("FBR PCTCODE is Missing on item", "");
                                                        return Promise.reject(error);
                                                    }
                                                }).catch((reason: any) => {
                                                    this.context.logger.logError("CFZ FBR PCTCODE " + JSON.stringify(reason));
                                                    return Promise.reject(reason);
                                                });
                                        }
                                        else {
                                            let error: ShowTextInputDialogError = new ShowTextInputDialogError("FBR Tax is Missing on item", "");
                                            return Promise.reject(error);
                                        }
                                    }
                                    else {
                                        //let error: ShowTextInputDialogError = new ShowTextInputDialogError("FBR POSID is Missing on Store", "");
                                        //return Promise.reject(error);
                                        return Promise.resolve({ canceled: false });
                                    }
                                });
                        });
                });
        }
        else if ((cartLocal.CartTypeValue == ProxyEntities.CartType.IncomeExpense) &&
            (cartLocal.IncomeExpenseLines[0].AccountTypeValue == ProxyEntities.IncomeExpenseAccountType.Expense)) {

            return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
                .then((cartresp: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelable> => {

                    cartLocal = cartresp.data.result;

                    //Update Global Class
                    cfz.SetCartPettyExpense(cartresp.data.result);
                    //Update Global Classs

                    return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
                        .then((getCurrentCartClientResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>)
                            : Promise<ClientEntities.ICancelable> => {

                            cartLocal = getCurrentCartClientResponse.data.result;

                            // Execute Petty Expense Previlage Customization
                            return this.PettyExpenseAmount(cartLocal);

                        });
                });
        }
        else {
            return Promise.resolve({ canceled: false });
        }
    }

    //#region FBR Code

    private callFBRFUNC(connectionStatus: string, totalAmount: number): Promise<ClientEntities.ICancelable> {
        return this.context.runtime.executeAsync<Commerce.GetChannelConfigurationClientResponse>(new Commerce.GetChannelConfigurationClientRequest())
            .then((DataAreaId: ClientEntities.ICancelableDataResult<Commerce.GetChannelConfigurationClientResponse>): Promise<ClientEntities.ICancelable> => {
                if (totalAmount >= 100000) {
                    return this.sendTransactiontoFBRWithCNIC(connectionStatus);
                }
                else {
                    return this.sendTransactiontoFBRWithoutCNIC(connectionStatus);
                }

            });

    }

    private sendTransactiontoFBRWithCNIC(connectionStatus: string): Promise<ClientEntities.ICancelable> {
        var custCNIC: string;
        custCNIC = "";

        let cartLocalFBR: ProxyEntities.Cart;


        //Gets the current Cart.
        return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
            .then((getCurrentCartClientResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelable> => {

                cartLocalFBR = getCurrentCartClientResponse.data.result;

                if (!ObjectExtensions.isNullOrUndefined(cartLocalFBR)) {


                    let textInputDialogOptions: ITextInputDialogOptions = {
                        title: "Enter CNIC in this format ", // string that denotes the optional title on the text dialog
                        subTitle: "xxxxxxxxxxxxx", // string that denotes the optional subtitle under the title
                        label: "",
                        defaultText: "",
                        onBeforeClose: this.onBeforeClose.bind(this)
                    };

                    let dialogRequest: ShowTextInputDialogClientRequest<ShowTextInputDialogClientResponse> =
                        new ShowTextInputDialogClientRequest<ShowTextInputDialogClientResponse>(textInputDialogOptions);

                    return this.context.runtime.executeAsync(dialogRequest)

                        .then((result: ClientEntities.ICancelableDataResult<ShowTextInputDialogClientResponse>): Promise<ClientEntities.ICancelable> => {
                            if (!result.canceled) {

                                custCNIC = result.data.result.value.trim();
                                this.context.logger.logInformational("Text Entered in Box: " + result.data.result.value);

                            }
                            else {
                                return Promise.reject("");
                            }

                            let CustomRequest: CFZCustomers.getTransactionDataActionRequest<CFZCustomers.getTransactionDataActionResponse> =
                                new CFZCustomers.getTransactionDataActionRequest(cartLocalFBR, connectionStatus, custCNIC);


                            return this.context.runtime.executeAsync<CFZCustomers.getTransactionDataActionResponse>(CustomRequest)
                                .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.getTransactionDataActionResponse>): Promise<ClientEntities.ICancelable> => {

                                    this.context.logger.logWarning("Triger  CNIC " + custCNIC + "  " + response.data.result);

                                    if (StringExtensions.isNullOrWhitespace(response.data.result)) {

                                        var ext = [{
                                            Key: "FBRID",
                                            Value: { StringValue: "true" }
                                        }];

                                        return this.context.runtime.executeAsync<Commerce.SaveExtensionPropertiesOnCartClientResponse>(new Commerce.SaveExtensionPropertiesOnCartClientRequest(ext))
                                            .then((response: ClientEntities.ICancelableDataResult<Commerce.SaveExtensionPropertiesOnCartClientResponse>)
                                                : Promise<ClientEntities.ICancelable> => {

                                                return Promise.resolve({ canceled: false });
                                            });

                                    }
                                    else {

                                        return Promise.resolve({ canceled: false });
                                    }

                                }).catch((reason: any) => {
                                    this.context.logger.logError("CFZ FBR Data.FBR Dialog: " + JSON.stringify(reason));
                                    return Promise.reject(reason);
                                });

                        }).catch((reason: any) => {
                            this.context.logger.logInformational("CNIC Exception" + JSON.stringify(reason));
                            return Promise.reject(reason);
                        });
                }

                return Promise.resolve({ canceled: false });
            });
    }
    private sendTransactiontoFBRWithoutCNIC(connectionStatus: string): Promise<ClientEntities.ICancelable> {
        var custCNIC: string;

        custCNIC = "";
        let cartLocalFBR: ProxyEntities.Cart;


        //Gets the current Cart.
        return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
            .then((getCurrentCartClientResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelable> => {

                cartLocalFBR = getCurrentCartClientResponse.data.result;


                if (!ObjectExtensions.isNullOrUndefined(cartLocalFBR)) {

                    let CustomRequest: CFZCustomers.getTransactionDataActionRequest<CFZCustomers.getTransactionDataActionResponse> =
                        new CFZCustomers.getTransactionDataActionRequest(cartLocalFBR, connectionStatus, custCNIC);

                    return this.context.runtime.executeAsync<CFZCustomers.getTransactionDataActionResponse>(CustomRequest)
                        .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.getTransactionDataActionResponse>): Promise<ClientEntities.ICancelable> => {

                           if (!StringExtensions.isNullOrWhitespace(response.data.result)) {

                                var ext = [{
                                    Key: "FBRID",
                                    Value: { StringValue: "true" }
                                }];

                                return this.context.runtime.executeAsync<Commerce.SaveExtensionPropertiesOnCartClientResponse>(new Commerce.SaveExtensionPropertiesOnCartClientRequest(ext))
                                    .then((response: ClientEntities.ICancelableDataResult<Commerce.SaveExtensionPropertiesOnCartClientResponse>)
                                        : Promise<ClientEntities.ICancelable> => {

                                        return Promise.resolve({ canceled: false });
                                    });
                           }
                           else {

                                return Promise.resolve({ canceled: false });
                           }
                        }).catch((reason: any) => {
                            this.context.logger.logError("CFZ FBR Data.FBR Dialog: " + JSON.stringify(reason));
                            return Promise.reject(reason);
                            //return Promise.resolve({ canceled: false });

                        }).catch((reason: any) => {
                            this.context.logger.logError("FBR Error" + JSON.stringify(reason));
                            return Promise.reject(reason);
                        });
                }

                return Promise.resolve({ canceled: false });
            });
    }

    private onBeforeClose(result: ClientEntities.ICancelableDataResult<ITextInputDialogResult>): Promise<void> {
        if (!result.canceled) {
            if (!ObjectExtensions.isNullOrUndefined(result.data)) {
                if (result.data.value === "") {
                    let error: ShowTextInputDialogError = new ShowTextInputDialogError("CNIC is Required",
                        "" /* new default value */);
                    return Promise.reject(error);
                } else {
                    if (result.data.value.trim().length == 13) {
                        return Promise.resolve();
                    }
                    else {
                        let error: ShowTextInputDialogError = new ShowTextInputDialogError("Invalid CNIC: " + result.data.value + " Please Enter Valid CNIC and try again ",
                            "" /* new default value */);
                        return Promise.reject(error);
                    }
                }
            } else {
                return Promise.reject("");
            }
        } else {
            return Promise.resolve();
        }
    }

    private calTax(salesline: ProxyEntities.CartLine[]): boolean {
        let checkTax: boolean = true;
        //salesline.forEach(function (line) {
        //    if (line.ItemId !='99999' && line.TaxAmount == 0 && !line.IsVoided) {
        //        checkTax = false;
        //    }
        //});

        return checkTax;
    }

    //#endregion FBR Code

    // #region Customer Discount Previlage Card

    private CustomerdiscountAmount(cartLocal: ProxyEntities.Cart): Promise<ClientEntities.ICancelable> {

        var errorOccurred: boolean = false;
        var limitType: number = 0;
        var i: number = 0;
        var validationType: number = 0;
        var remainingBalance: number = 0;
        var TotalBalance: number = 0;
        var error: string = "";
        var msg: string = "";
        var employeeDiscountAmount: number = 0;

        let CustDiscountInfoRequest: CFZCustomers.GetCustDiscountLimitInfoRequest<CFZCustomers.GetCustDiscountLimitInfoResponse> =
            new CFZCustomers.GetCustDiscountLimitInfoRequest(cartLocal.CustomerId, true);
        return this.context.runtime.executeAsync<CFZCustomers.GetCustDiscountLimitInfoResponse>(CustDiscountInfoRequest)
            .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.GetCustDiscountLimitInfoResponse>): Promise<ClientEntities.ICancelable> => {
                var splitted: string[];
                var result: string = response.data.result.toString();
                result = result.replace(/,/g, '');
                splitted = result.split(";");



                cartLocal.CartLines.forEach(function (line) {
                    line.DiscountLines.forEach(function (Disline) {
                        if (Disline.OfferName == "Employee Discount") {
                            employeeDiscountAmount = employeeDiscountAmount + Disline.EffectiveAmount;
                        }
                    });
                });


                if (splitted) {
                    msg = splitted[0];
                    limitType = parseInt(splitted[1]);
                    validationType = parseInt(splitted[2]);
                    remainingBalance = parseFloat(splitted[3]);
                    TotalBalance = parseFloat(splitted[4]);

                    if (remainingBalance == 0 && employeeDiscountAmount > 0) {
                        errorOccurred = true;
                        error = "Employee discount limit is zero, so discount cannot be given.";
                    }
                    this.context.logger.logError("Result " + JSON.stringify(remainingBalance));
                }

                if (!errorOccurred && remainingBalance > 0) {
                    let CustDiscountUsedRequest: CFZCustomers.GetCustDiscountUsedRequest<CFZCustomers.GetCustDiscountUsedResponse> =
                        new CFZCustomers.GetCustDiscountUsedRequest(cartLocal.CustomerId, limitType, validationType, false);

                    return this.context.runtime.executeAsync<CFZCustomers.GetCustDiscountUsedResponse>(CustDiscountUsedRequest)
                        .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.GetCustDiscountUsedResponse>): Promise<ClientEntities.ICancelable> => {
                            var result: number = response.data.result;
                            var totalDiscount: number = 0;
                            var currDiscount: number = 0;
                            var DiscAmt = employeeDiscountAmount;

                            if (validationType == 0) {
                                result = result * -1;
                                currDiscount = DiscAmt * -1;
                                totalDiscount = result + currDiscount;
                            }
                            else if (validationType == 1) {
                                for (i = 0; i < cartLocal.CartLines.length; i++) {
                                    if (!cartLocal.CartLines[i].IsVoided) {
                                        currDiscount += cartLocal.CartLines[i].Quantity;
                                    }
                                }

                                currDiscount = currDiscount * -1;
                                totalDiscount = result + currDiscount;
                            }


                            if (currDiscount < 0) {
                                if (Math.abs(totalDiscount) > TotalBalance) {

                                    errorOccurred = true;
                                    error += "Employee Discount on this transaction is " + Math.abs((totalDiscount - result)).toString() + ", whereas remaining limit is " + (Math.abs(TotalBalance) - Math.abs(result)).toFixed(2);
                                }
                            }
                            if (errorOccurred) {
                                this.context.logger.logError("Error in trigger.");
                                let extensionErrorLog: ClientEntities.ExtensionError
                                    = new ClientEntities.ExtensionError(error);

                                return Promise.reject(extensionErrorLog);
                            }
                            else {

                                return Promise.resolve({ canceled: false });
                            }
                        })
                        .catch((reason: any) => {
                            this.context.logger.logError("Discount Message: " + JSON.stringify(reason));
                            return Promise.reject(reason);
                        });

                }
                else {
                    let extensionErrorLog: ClientEntities.ExtensionError
                        = new ClientEntities.ExtensionError(error);

                    return Promise.reject(extensionErrorLog);
                }

            }).catch((reason: any) => {
                this.context.logger.logError("Discount Message: " + JSON.stringify(reason));
                return Promise.reject(reason);
            });

    }

    // #endregion Customer Discount Previlage Card

    // #region Petty Expense

    private PettyExpenseAmount(cartLocal: ProxyEntities.Cart): Promise<ClientEntities.ICancelable> {

        let CustDiscountInfoRequest: CFZCustomers.GetPettyExpenseLimitInfoRequest<CFZCustomers.GetPettyExpenseLimitInfoResponse> =
            new CFZCustomers.GetPettyExpenseLimitInfoRequest(cartLocal, 1);
        return this.context.runtime.executeAsync<CFZCustomers.GetPettyExpenseLimitInfoResponse>(CustDiscountInfoRequest)
            .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.GetPettyExpenseLimitInfoResponse>): Promise<ClientEntities.ICancelable> => {
                var result: string = response.data.result.toString();

                if (StringExtensions.isNullOrWhitespace(result)) {

                    return Promise.resolve({ canceled: false });
                }
                else {
                    let extensionErrorLog: ClientEntities.ExtensionError
                        = new ClientEntities.ExtensionError(result);

                    return Promise.reject(extensionErrorLog);
                }

            }).catch((reason: any) => {
                return Promise.reject(reason);
            });

    }
}