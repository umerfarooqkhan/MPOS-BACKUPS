import { ObjectExtensions } from "PosApi/TypeExtensions";
import { SetCustomerOnCartOperationRequest, SetCustomerOnCartOperationResponse } from "PosApi/Consume/Cart";
//import { GetCustomerClientRequest, GetCustomerClientResponse } from "PosApi/Consume/Customer";
import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import CfzCustomerSearchOperationRequest from "./CfzCustomerSearchOperationRequest";
import CfzCustomerSearchOperationResponse from "./CfzCustomerSearchOperationResponse";
import { ClientEntities } from "PosApi/Entities";
import CfzCustomerSearchScan from "../Dialog/CfzCustomerSearchScan";
import { CfzICustomerSearchScanResult } from "../Dialog/CfzICustomerSearchScanResult";
import ko, { Observable } from "knockout";

/**
 * Request handler for the CfzCustomerSearchOperationRequest class.
 */
export default class CfzCustomerSearchOperationRequestHandler<TResponse extends CfzCustomerSearchOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {
    public dialogResult: Observable<string>;
    /**
     * Gets the supported request type.
     * @return {RequestType<TResponse>} The supported request type.
     */
    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return CfzCustomerSearchOperationRequest;
    }

    /**
     * Executes the request handler asynchronously.
     * @param {SkipFiscalizationOperationRequest<TResponse>} request The request.
     * @return {Promise<ICancelableDataResult<TResponse>>} The cancelable async result containing the response.
     */
    public executeAsync(request: CfzCustomerSearchOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let customerSearchScanDialog: CfzCustomerSearchScan = new CfzCustomerSearchScan();
        this.dialogResult = ko.observable("");
        return customerSearchScanDialog.open("").then((resultDialog: CfzICustomerSearchScanResult): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {
            if (!ObjectExtensions.isNullOrUndefined(resultDialog)) {
                this.dialogResult(resultDialog.selectedValue);
                this.context.logger.logInformational("Text Entered in Box: " + resultDialog.selectedValue);
                if (resultDialog.selectedValue != 'Canceled') {
                    return this.context.runtime.executeAsync<SetCustomerOnCartOperationResponse>(new SetCustomerOnCartOperationRequest(request.correlationId, resultDialog.selectedValue))
                        .then((result: ClientEntities.ICancelableDataResult<SetCustomerOnCartOperationResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {
                            if (!result.canceled && !ObjectExtensions.isNullOrUndefined(result)) {

                                return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerSearchOperationResponse("") });
                            }
                            return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerSearchOperationResponse("") });
                        });
                }
            }
            return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerSearchOperationResponse("") });
        }).catch((reason: any) => {
            this.context.logger.logError(JSON.stringify(reason));
            return Promise.resolve({ canceled: false, data: <TResponse>new CfzCustomerSearchOperationResponse("") });
        });
    }
}