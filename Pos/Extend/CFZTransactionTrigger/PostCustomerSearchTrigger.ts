
import * as Triggers from "PosApi/Extend/Triggers/CustomerTriggers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { StringExtensions } from "PosApi/TypeExtensions";

export default class PostCustomerSearchTrigger extends Triggers.PostCustomerSearchTrigger {

    public indexssToRemoved: number[];
    public execute(options: Triggers.IPostCustomerSearchTriggerOptions): Promise<void> {

        this.indexssToRemoved = [];

        if (options.customers.length > 0) {

            return this.updateCustomer(options.customers).then((): Promise<void> => {

                var newIndex = 0;

                this.indexssToRemoved.forEach((index) => {
                    index = index - newIndex;
                    options.customers.splice(index, 1);
                    newIndex++;
                });

                return Promise.resolve();
            });   
        }
        else {
            return Promise.resolve();
        }
    }

    private async updateCustomer(_list: ProxyEntities.GlobalCustomer[]): Promise<void> {
        var i = 0;

        for (i = 0; i < _list.length; i++) {
            await this.getList(_list[i].AccountNumber,i);
        }
    }

    private async getList(_custAccount: string, _index: number): Promise<void> {
        let lineDiscRequest: Commerce.GetCustomerClientRequest<Commerce.GetCustomerClientResponse> =
            new Commerce.GetCustomerClientRequest<Commerce.GetCustomerClientResponse>(_custAccount, this.context.logger.getNewCorrelationId());

        return this.context.runtime.executeAsync(lineDiscRequest)
            .then((response: ClientEntities.ICancelableDataResult<Commerce.GetCustomerClientResponse>): Promise<void> => {

                if (response.data.result != null) {

                    var result: string = response.data.result.CustomerGroup;

                    if (!StringExtensions.isNullOrWhitespace(result)) {
                        if (result.toUpperCase() == "CG008" || result.toUpperCase() == "30") {
                            this.indexssToRemoved.push(_index);
                        }
                    } 
                }

                return Promise.resolve();
            });
    }
}                                                          