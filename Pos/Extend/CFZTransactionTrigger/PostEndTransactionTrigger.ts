
import * as Triggers from "PosApi/Extend/Triggers/TransactionTriggers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { CFZCustomer as CFZCustomers } from "../../DataService/DataServiceRequests.g";
import { GetConnectionStatusClientRequest, GetConnectionStatusClientResponse } from "PosApi/Consume/Device";
import CfzGlobalData from "./CFZGlobalData";

export default class PostEndTransactionTrigger extends Triggers.PostEndTransactionTrigger {

    public execute(options: Triggers.IPostEndTransactionTriggerOptions): Promise<void> {

        let cart: ProxyEntities.Cart = CfzGlobalData.selectedCart;
        let isOnline: boolean = false;

        let getConnectionStatusClientRequest: GetConnectionStatusClientRequest<GetConnectionStatusClientResponse> =
            new GetConnectionStatusClientRequest<GetConnectionStatusClientResponse>(this.context.logger.getNewCorrelationId());

        return this.context.runtime.executeAsync(getConnectionStatusClientRequest)
            .then((connectionStatus: ClientEntities.ICancelableDataResult<GetConnectionStatusClientResponse>)
                : Promise<void> => {
                isOnline = connectionStatus.data.result == ClientEntities.ConnectionStatusType.Online ? true : false;
                if (cart != null) {
                    if (cart.CartTypeValue == ProxyEntities.CartType.IncomeExpense) {

                        let CustomRequest: CFZCustomers.GetPettyExpenseUpdateRequest<CFZCustomers.GetPettyExpenseUpdateResponse>
                            = new CFZCustomers.GetPettyExpenseUpdateRequest(cart, 2);

                        return this.context.runtime.executeAsync<CFZCustomers.GetPettyExpenseUpdateResponse>(CustomRequest)
                            .then((response: ClientEntities.ICancelableDataResult<CFZCustomers.GetPettyExpenseUpdateResponse>)
                                : Promise<void> => {

                                return Promise.resolve();
                            });
                    }
                    else {
                        return Promise.resolve();
                    }
                }
                return Promise.resolve();
            })
            .then((): Promise<void> => {
                if (isOnline) {
                    cart = CfzGlobalData.selectedCart;

                    if (cart != null) {
                        if (cart.ReceiptTransactionTypeValue == ProxyEntities.ReceiptTransactionType.Sale) {

                            var Customer: CFZCustomers.sendSMSDataActionRequest<CFZCustomers.sendSMSDataActionResponse> =
                                new CFZCustomers.sendSMSDataActionRequest(cart, "1");
                            this.context.runtime.executeAsync(Customer)
                                .then((Results: ClientEntities.ICancelableDataResult<CFZCustomers.sendSMSDataActionResponse>): Promise<void> => {

                                    var error: string = "";
                                    error = JSON.stringify(Results.data.result);

                                    let extensionErrorLog: ClientEntities.ExtensionError
                                        = new ClientEntities.ExtensionError(error);

                                    return Promise.reject(extensionErrorLog);

                                    //this.context.logger.logWarning("SMS Results : " + JSON.stringify(Results.data.result) + ".");

                                    //return Promise.resolve();
                                }).
                                catch((reason: any) => {
                                    var error: string = "";
                                    error = JSON.stringify(reason);

                                    let extensionErrorLog: ClientEntities.ExtensionError
                                        = new ClientEntities.ExtensionError(error);

                                    return Promise.reject(extensionErrorLog);
                                });
                        }
                    }
                    return Promise.resolve();
                }
                return Promise.resolve();
            });
    }
}