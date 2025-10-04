import { ObjectExtensions, StringExtensions } from "PosApi/TypeExtensions";
import { SetCustomerOnCartOperationRequest, SetCustomerOnCartOperationResponse } from "PosApi/Consume/Cart";
//import { GetCustomerClientRequest, GetCustomerClientResponse } from "PosApi/Consume/Customer";
import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import CfzCustomerBalanceOperationRequest from "./CfzCustomerBalanceOperationRequest";
import CfzCustomerBalanceOperationResponse from "./CfzCustomerBalanceOperationResponse";
import { ClientEntities } from "PosApi/Entities";
import CfzCustomerBalance from "../Dialog/CfzCustomerBalance";
import { CfzICustomerBalanceResult } from "../Dialog/CfzICustomerBalanceResult";
import { GetConnectionStatusClientRequest, GetConnectionStatusClientResponse } from "PosApi/Consume/Device";
import { CFZCustomer } from "../DataService/DataServiceRequests.g";
import { ShowTextInputDialogError } from "PosApi/Consume/Dialogs";
import MessageDialog from "../Dialog/MessageDialog";
import ko, { Observable } from "knockout";

/**
 * Request handler for the CfzCustomerSearchOperationRequest class.
 */
export default class CfzCustomerBalanceOperationRequestHandler<TResponse extends CfzCustomerBalanceOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {
    public dialogResult: Observable<string>;
    /**
     * Gets the supported request type.
     * @return {RequestType<TResponse>} The supported request type.
     */
    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return CfzCustomerBalanceOperationRequest;
    }

    /**
     * Executes the request handler asynchronously.
     * @param {SkipFiscalizationOperationRequest<TResponse>} request The request.
     * @return {Promise<ICancelableDataResult<TResponse>>} The cancelable async result containing the response.
     */
    public executeAsync(request: CfzCustomerBalanceOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let customerSearchScanDialog: CfzCustomerBalance = new CfzCustomerBalance();
        this.dialogResult = ko.observable("");
        return customerSearchScanDialog.open("").then((resultDialog: CfzICustomerBalanceResult): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {
            if (!ObjectExtensions.isNullOrUndefined(resultDialog)) {
                this.dialogResult(resultDialog.selectedValue);
                this.context.logger.logInformational("Text Entered in Box: " + resultDialog.selectedValue);
                if (resultDialog.selectedValue != 'Canceled') {

                    let isOnline: boolean = false;

                    let getConnectionStatusClientRequest: GetConnectionStatusClientRequest<GetConnectionStatusClientResponse> =
                        new GetConnectionStatusClientRequest<GetConnectionStatusClientResponse>(this.context.logger.getNewCorrelationId());

                    return this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                        .then((connectionStatus: ClientEntities.ICancelableDataResult<GetConnectionStatusClientResponse>)
                            : Promise<ClientEntities.ICancelableDataResult<TResponse>> => {
                            isOnline = connectionStatus.data.result == ClientEntities.ConnectionStatusType.Online ? true : false;

                            if (!StringExtensions.isNullOrWhitespace(resultDialog.selectedValue) && isOnline) {

                                let CustDiscountInfoRequest: CFZCustomer.GetCustDiscountLimitInfoRequest<CFZCustomer.GetCustDiscountLimitInfoResponse> =
                                    new CFZCustomer.GetCustDiscountLimitInfoRequest(resultDialog.selectedValue, true);
                                return this.context.runtime.executeAsync<CFZCustomer.GetCustDiscountLimitInfoResponse>(CustDiscountInfoRequest)
                                    .then((response: ClientEntities.ICancelableDataResult<CFZCustomer.GetCustDiscountLimitInfoResponse>)
                                        : Promise<ClientEntities.ICancelableDataResult<TResponse>> => {

                                        var splitted: string[];
                                        var result: string = response.data.result.toString();


                                        var TotalBalance: number = 0;
                                        var discAmt: number = 0;
                                        var limitType: number = 0;
                                        var validationType: number = 0;
                                        result = result.replace(/,/g, '');
                                        splitted = result.split(";");

                                        if (splitted) {
                                            limitType = parseInt(splitted[1]);
                                            validationType = parseInt(splitted[2]);
                                            TotalBalance = parseFloat(splitted[4]);
                                        }

                                        if (TotalBalance != 0) {
                                            let CustDiscountUsedRequest: CFZCustomer.GetCustDiscountUsedRequest<CFZCustomer.GetCustDiscountUsedResponse> =
                                                new CFZCustomer.GetCustDiscountUsedRequest(resultDialog.selectedValue, limitType, validationType, false);

                                            return this.context.runtime.executeAsync<CFZCustomer.GetCustDiscountUsedResponse>(CustDiscountUsedRequest)
                                                .then((response: ClientEntities.ICancelableDataResult<CFZCustomer.GetCustDiscountUsedResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {
                                                    var result: number = response.data.result;
                                                    discAmt = (Math.abs(TotalBalance) - Math.abs(result));

                                                    let lineDiscRequest: Commerce.GetCustomerClientRequest<Commerce.GetCustomerClientResponse> =
                                                        new Commerce.GetCustomerClientRequest<Commerce.GetCustomerClientResponse>(resultDialog.selectedValue, this.context.logger.getNewCorrelationId());

                                                    return this.context.runtime.executeAsync(lineDiscRequest)
                                                        .then((response: ClientEntities.ICancelableDataResult<Commerce.GetCustomerClientResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {

                                                            if (!StringExtensions.isNullOrWhitespace(response.data.result.Name)) {
                                                                MessageDialog.show(this.context, StringExtensions.format("{0} remaining discount limit is {1}.", response.data.result.Name, discAmt), "Discount Limit");
                                                                return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerBalanceOperationResponse("") });
                                                            }
                                                            else {
                                                                MessageDialog.show(this.context, StringExtensions.format("Customer's Remaining discount limit is {0}.", discAmt), "Discount Limit");
                                                                return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerBalanceOperationResponse("") });
                                                            }
                                                        });
                                                    
                                                })
                                                .catch((reason: any) => {
                                                    let error: ShowTextInputDialogError = new ShowTextInputDialogError("Something went wrong while fetching the limit", "");
                                                    return Promise.reject(error);
                                                });
                                        }

                                        return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerBalanceOperationResponse("") });

                                    }).catch((reason: any) => {
                                        let error: ShowTextInputDialogError = new ShowTextInputDialogError("Something went wrong while fetching the limit", "");
                                        return Promise.reject(error);
                                    });
                            }
                            return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerBalanceOperationResponse("") });
                        });
                }
            }
            return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerBalanceOperationResponse("") });
        }).catch((reason: any) => {
            this.context.logger.logError(JSON.stringify(reason));
            return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerBalanceOperationResponse("") });
        });
    }
}