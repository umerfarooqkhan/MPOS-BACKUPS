using Confiz.CommerceRuntime.Messages;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Confiz.StoreCommercePackagingSample.CommerceRuntime.RequestHandlers
{
    public class PettyExpenseService : SingleAsyncRequestHandler<PettyExpenseRequest>
    {
        protected override async Task<Response> Process(PettyExpenseRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }

            if (request.CheckGetUpdate == 1)//CheckExpenseBalance
            {
                var reponse = await this.checkExpenseBalance(request).ConfigureAwait(false);
                return reponse;
            }
            else //UpdateExpense
            {
                return await UpdatePettyExpenseAsync(request).ConfigureAwait(false);
            }
        }

        #region Check Expense Amount

        /// <summary>
        /// checkExpenseBalance
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private async Task<PettyExpenseResponse> checkExpenseBalance(PettyExpenseRequest request)
        {
            PettyExpenseResponse response = new PettyExpenseResponse();

            try
            {
                
                response = await this.CheckExpenseBalance(request).ConfigureAwait(false);
            }

            catch (Exception ex)
            {
                response.Result += "checkExpensetBalance Test calling :" + ex.Message.ToString();
            }
            return response;
        }

        /// <summary>
        /// CheckExpenseBalance
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<PettyExpenseResponse> CheckExpenseBalance(PettyExpenseRequest request)
        {

            PettyExpenseResponse Expresponse = new PettyExpenseResponse();
            try
            {
                if (request.Cart.IncomeExpenseTotalAmount != 0)
                {
                    ParameterSet parameter = new ParameterSet();
                    parameter["@STORENUM"] = request.RequestContext.GetDeviceConfiguration().StoreNumber;
                    parameter["@ACCOUNTNUM"] = request.Cart.IncomeExpenseLines.Select(x=>x.IncomeExpenseAccount).FirstOrDefault();
                    parameter["@DATAAREAID"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;

                    string CheckExpensetBalanceQuery = @"SELECT [MESSAGELINE1],[MESSAGELINE2],[SLIPTEXT1],[SLIPTEXT2] from [ext].[CFZRETAILINCOMEEXPENSEACCOUNTTABLEVIEW] WHERE STOREID = @STORENUM AND ACCOUNTNUM = @ACCOUNTNUM AND DATAAREAID = @DATAAREAID";

                    DataTable table = await ExecuteCustomQuery(CheckExpensetBalanceQuery, parameter, request.RequestContext).ConfigureAwait(false);

                    if (table.Rows.Count > 0)
                    {
                        var _amount    = Math.Abs(request.Cart.IncomeExpenseTotalAmount);
                        var _remainAmt = Convert.ToDecimal(table.Rows[0]["MESSAGELINE2"]);

                        if (_amount > _remainAmt)
                        {
                            Expresponse.Result = "Expense Limit not found !";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Expresponse.Result = "You can not perform this transaction right now!";
            }

            return Expresponse;
        }

        #endregion Check Expense Amount

        #region Get Used Expense Amount

        /// <summary>
        /// getExpenseUsed
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private async Task<PettyExpenseResponse> UpdatePettyExpenseAsync(PettyExpenseRequest request)
        {
            PettyExpenseResponse Expresponse = new PettyExpenseResponse();
            try
            {
                if (request.Cart.IncomeExpenseTotalAmount != 0)
                {
                    ParameterSet parameter = new ParameterSet();
                    parameter["@STORENUM"] = request.RequestContext.GetDeviceConfiguration().StoreNumber;
                    parameter["@ACCOUNTNUM"] = request.Cart.IncomeExpenseLines.Select(x => x.IncomeExpenseAccount).FirstOrDefault();
                    parameter["@DATAAREAID"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;

                    string CheckExpensetBalanceQuery = @"SELECT [MESSAGELINE1],[MESSAGELINE2],[SLIPTEXT1],[SLIPTEXT2] from [ext].[CFZRETAILINCOMEEXPENSEACCOUNTTABLEVIEW] WHERE STOREID = @STORENUM AND ACCOUNTNUM = @ACCOUNTNUM AND DATAAREAID = @DATAAREAID";

                    DataTable table = await ExecuteCustomQuery(CheckExpensetBalanceQuery, parameter, request.RequestContext).ConfigureAwait(false);

                    if (table.Rows.Count > 0)
                    {
                        decimal _remaining;
                        decimal _used;
                        if (table.Rows[0]["MESSAGELINE2"] != null && table.Rows[0]["MESSAGELINE2"].ToString() != "")
                            _remaining = Convert.ToDecimal(table.Rows[0]["MESSAGELINE2"]) - Math.Abs(request.Cart.IncomeExpenseTotalAmount);
                        else
                            _remaining = Math.Abs(request.Cart.IncomeExpenseTotalAmount);
                        if (table.Rows[0]["SLIPTEXT1"] != null && table.Rows[0]["SLIPTEXT1"].ToString() != "")
                            _used = Convert.ToDecimal(table.Rows[0]["SLIPTEXT1"]) + Math.Abs(request.Cart.IncomeExpenseTotalAmount);
                        else
                            _used = Math.Abs(request.Cart.IncomeExpenseTotalAmount);
                        ParameterSet parameterTwo = new ParameterSet();
                        parameter["@STORENUM"] = request.RequestContext.GetDeviceConfiguration().StoreNumber;
                        parameter["@ACCOUNTNUM"] = request.Cart.IncomeExpenseLines.Select(x => x.IncomeExpenseAccount).FirstOrDefault();
                        parameter["@DATAAREAID"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;
                        parameter["@MESSAGELINE2"] = _remaining.ToString();
                        parameter["@SLIPTEXT1"] = _used.ToString();



                        string CheckExpensetBalanceQueryTwo = @"Update [ext].[CFZRETAILINCOMEEXPENSEACCOUNTTABLEVIEW] SET MESSAGELINE2= @MESSAGELINE2, SLIPTEXT1 = @SLIPTEXT1 WHERE STOREID = @STORENUM AND ACCOUNTNUM = @ACCOUNTNUM AND DATAAREAID = @DATAAREAID";

                        DataTable tableTwo = await ExecuteCustomQuery(CheckExpensetBalanceQueryTwo, parameter, request.RequestContext).ConfigureAwait(false);
                    }
                }
            }
            catch (Exception ex)
            {
                Expresponse.Result = "You can not perform this transaction right now!";
            }

            return Expresponse;
        }

        #endregion Get Used Expense Amount

        #region DB Repository

        /// <summary>
        /// ExecuteCustomQuery
        /// </summary>
        /// <param name="query"></param>
        /// <param name="parameters"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        public static async Task<DataTable> ExecuteCustomQuery(string query, ParameterSet parameters, RequestContext context)
        {
            try
            {
                using (DatabaseContext sqlServerDatabaseContext = new DatabaseContext(context))
                {
                    DataSet ds = await sqlServerDatabaseContext.ExecuteQueryDataSetAsync(query, parameters).ConfigureAwait(false);

                    if (ds != null)
                    {
                        DataTable table = ds.Tables[0]; // Define and assign table inside the using block

                        // Process the DataTable here...

                        return table; // Return the DataTable from inside the using block
                    }
                }

                return null; // Return null or handle the case where ds is null
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion DB Repository

    }
}
