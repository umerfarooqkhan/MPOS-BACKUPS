
import * as Triggers from "PosApi/Extend/Triggers/OperationTriggers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { CFZCustomer as CFZCustomers } from "../../DataService/DataServiceRequests.g";
import { ObjectExtensions, ArrayExtensions, StringExtensions } from "PosApi/TypeExtensions";
import { GetConnectionStatusClientRequest, GetConnectionStatusClientResponse } from "PosApi/Consume/Device";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import CfzGlobalData from "./CfzGlobalData";

export default class PostOperationTrigger extends Triggers.PostOperationTrigger {

    public execute(options: Triggers.IPostOperationTriggerOptions): Promise<void> {

        let cart: ProxyEntities.Cart;

        if (options.operationRequest.operationId === 311) {
            let isOnline: boolean = false;
           
            let getConnectionStatusClientRequest: GetConnectionStatusClientRequest<GetConnectionStatusClientResponse> =
                new GetConnectionStatusClientRequest<GetConnectionStatusClientResponse>(this.context.logger.getNewCorrelationId());

            return this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                .then((connectionStatus: ClientEntities.ICancelableDataResult<GetConnectionStatusClientResponse>)
                    : Promise<void> => {
                    isOnline = connectionStatus.data.result == ClientEntities.ConnectionStatusType.Online ? true : false;

                    return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
                        .then((cartresp: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>)
                            : Promise<void> => {

                            var cart = cartresp.data.result;

                            if (!StringExtensions.isNullOrWhitespace(cart.CustomerId) && isOnline &&  cart.TotalManualDiscountAmount == 0) {

                                let CustDiscountInfoRequest: CFZCustomers.GetCustDiscountLimitInfoRequest<CFZCustomers.GetCustDiscountLimitInfoResponse> =
                                    new CFZCustomers.GetCustDiscountLimitInfoRequest(cart.CustomerId, true);
                                return this.context.runtime.executeAsync<CFZCustomers.GetCustDiscountLimitInfoResponse>(CustDiscountInfoRequest)
                                    .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.GetCustDiscountLimitInfoResponse>)
                                        : Promise<void> => {

                                        let discountAmount = CfzGlobalData.totalDiscount;

                                        let discountLimit: string = response.data.result;

                                        
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
                                            let CustDiscountUsedRequest: CFZCustomers.GetCustDiscountUsedRequest<CFZCustomers.GetCustDiscountUsedResponse> =
                                                new CFZCustomers.GetCustDiscountUsedRequest(cart.CustomerId, limitType, validationType, false);

                                            return this.context.runtime.executeAsync<CFZCustomers.GetCustDiscountUsedResponse>(CustDiscountUsedRequest)
                                                .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.GetCustDiscountUsedResponse>): Promise<void> => {
                                                    var result: number = response.data.result;
                                                    discAmt = (Math.abs(TotalBalance) - Math.abs(result));
                                                    if (discountAmount > discAmt)
                                                    {
                                                        if (discAmt > 0)
                                                        {
                                                            let lineDiscRequest: Commerce.TotalDiscountAmountOperationRequest<Commerce.TotalDiscountAmountOperationResponse> =
                                                                new Commerce.TotalDiscountAmountOperationRequest<Commerce.TotalDiscountAmountOperationResponse>(cart, this.context.logger.getNewCorrelationId(), discAmt);

                                                            return this.context.runtime.executeAsync(lineDiscRequest)
                                                                .then((result: ClientEntities.ICancelableDataResult<Commerce.LineDiscountPercentOperationResponse>): Promise<void> => {

                                                                    return Promise.resolve();
                                                                });
                                                        }
                                                        else
                                                        {
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                    else
                                                    {
                                                        return Promise.resolve();
                                                    }
                                                })
                                                .catch((reason: any) => {
                                                    return Promise.reject(reason);
                                                });
                                        }
                                        
                                        return Promise.resolve();

                                    }).catch((reason: any) => {
                                        return Promise.reject(reason);
                                    });
                            }
                            return Promise.resolve();
                        });
                });
        }

        return Promise.resolve();
    }
}