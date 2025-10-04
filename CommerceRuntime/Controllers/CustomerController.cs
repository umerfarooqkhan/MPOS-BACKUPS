namespace Confiz.CommerceRuntime.Controllers
{
    using System.Threading.Tasks;
    using Microsoft.Dynamics.Commerce.Runtime.DataModel;
    using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;
    using System;
    using Confiz.CommerceRuntime.Entities.DataModel;
    using Confiz.CommerceRuntime.Messages;

    /// <summary>
    /// CFZ Custom APIs.
    /// </summary>
    [RoutePrefix("CFZCustomer")]
    [BindEntity(typeof(CFZCustomer))]
    public class CustomerController : IController
    {
        /// <summary>
        /// The action to get the Visits.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The discount value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<string> sendSMSDataAction(IEndpointContext context, Cart Cart, string ConStatus)
        {
            SMSRequest SMSRequest = new SMSRequest(Cart, ConStatus);

            SMSResponse response = await context.ExecuteAsync<SMSResponse>(SMSRequest).ConfigureAwait(false);
            return response.Response.ToString();
        }

        /// <summary>
        /// The action to get the FBR.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<string> getTransactionDataAction(IEndpointContext context, Cart Cart, string ConStatus, string CustCNIC)
        {
            try
            {
                FBRRequest FBRRequest = new FBRRequest(Cart, CustCNIC, ConStatus);

                FBRResponse response = await context.ExecuteAsync<FBRResponse>(FBRRequest).ConfigureAwait(false);
                return response.Response;
            }
            catch (Exception ex)
            {
                return ex.Message.ToString();
            }
        }

        /// <summary>
        /// The action to get the Customer.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<string> GetCustDiscountLimitInfo(IEndpointContext context, string CustAccount, bool CheckBalance)
        {
            CustDiscountResponse response = await context.ExecuteAsync<CustDiscountResponse>(new CustDiscountRequest(CustAccount, CheckBalance)).ConfigureAwait(false);
            return response.Result + ";" + response.LimitType + ";" + response.ValidationType + ";" + Convert.ToString(response.RemainingBalance) + ";" + Convert.ToString(response.TotalBalance);
        }

        /// <summary>
        /// The action to get the Customer.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<decimal> GetCustDiscountUsed(IEndpointContext context, string CustAccount, int LimitType, int ValidationType, bool CheckBalance)
        {
            CustDiscountResponse response = await context.ExecuteAsync<CustDiscountResponse>(new CustDiscountRequest(CustAccount, ValidationType, LimitType, CheckBalance)).ConfigureAwait(false);
            return response.DiscAmount;
        }


        /// <summary>
        /// The action to get the Customer.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<string> GetPettyExpenseLimitInfo(IEndpointContext context, Cart Cart, int CheckBalance)
        {
            PettyExpenseResponse response = await context.ExecuteAsync<PettyExpenseResponse>(new PettyExpenseRequest(Cart, CheckBalance)).ConfigureAwait(false);
            return response.Result;
        }

        /// <summary>
        /// The action to get the Customer.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<string> GetPettyExpenseUpdate(IEndpointContext context, Cart Cart, int CheckBalance)
        {
            PettyExpenseResponse response = await context.ExecuteAsync<PettyExpenseResponse>(new PettyExpenseRequest(Cart, CheckBalance)).ConfigureAwait(false);
            return response.Result;
        }

        /// <summary>
        /// The action to get the Customer.
        /// </summary>
        /// <param name="parameters">The OData action parameters.</param>
        /// <returns>The value.</returns>
        [HttpPost]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<string> productCategoryDataAction(IEndpointContext context, string ItemID)
        {
            ProductCategoryResponse response = await context.ExecuteAsync<ProductCategoryResponse>(new ProductCategoryRequest(ItemID)).ConfigureAwait(false);
            return response.Response;
        }
    }
}
