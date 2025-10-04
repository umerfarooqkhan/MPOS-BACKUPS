using Confiz.CommerceRuntime.Messages;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.RealtimeServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Confiz.StoreCommercePackagingSample.CommerceRuntime.RequestHandlers
{
    public class CustDiscountService : SingleAsyncRequestHandler<CustDiscountRequest>
    {
        protected override async Task<Response> Process(CustDiscountRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }

            if (await RunRealtimeServiceHealthCheckAsync(request).ConfigureAwait(false) == true)
            {
                if (request.CheckDiscBalance)
                {
                    return await this.checkDiscountBalance(request).ConfigureAwait(false);
                }
                else
                {
                    return await getDiscountUsedAsync(request).ConfigureAwait(false);
                }
            }
            else
            {
                CustDiscountResponse response = new CustDiscountResponse();
                response.Result = "RTS Down";
                return response;
            }
        }

        #region Realtime service health check

        /// <summary>
        /// Performs realtime service health check.
        /// </summary>
        /// <param name="request">Service request.</param>
        /// <returns>Boolean value that indicates if the check succeeded.</returns>
        private async Task<bool> RunRealtimeServiceHealthCheckAsync(CustDiscountRequest request)
        {
            try
            {
                var healthCheckResponse = await request.RequestContext.ExecuteAsync<RunHealthCheckRealtimeResponse>(new RunHealthCheckRealtimeRequest()).ConfigureAwait(false);
                return healthCheckResponse.IsSuccess;
            }
            catch (HeadquarterTransactionServiceException ex)
            {
                return false;
            }
            catch (Exception ex)
            {
                return false;
            }

        }

        #endregion Realtime service health check

        #region Check Discount Amount

        /// <summary>
        /// checkDiscountBalance
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private async Task<CustDiscountResponse> checkDiscountBalance(CustDiscountRequest request)
        {
            CustDiscountResponse response = new CustDiscountResponse();

            try
            {
                
                response = await this.CheckDiscountBalance(request).ConfigureAwait(false);
            }

            catch (Exception ex)
            {
                response.Result += "checkDiscountBalance Test calling :" + ex.Message.ToString();
            }
            return response;
        }

        /// <summary>
        /// CheckDiscountBalance
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<CustDiscountResponse> CheckDiscountBalance(CustDiscountRequest request)
        {

            CustDiscountResponse Discresponse = new CustDiscountResponse();
            try
            {   
                InvokeExtensionMethodRealtimeRequest extensionRequest = new InvokeExtensionMethodRealtimeRequest(
                    "GetDiscountBalance",
                      request.CustAccount);

                InvokeExtensionMethodRealtimeResponse response = await request.RequestContext.ExecuteAsync<InvokeExtensionMethodRealtimeResponse>(extensionRequest).ConfigureAwait(false);
                ReadOnlyCollection<object> results = response.Result;

                if (results.Count > 0)
                {

                    if ((bool)results[0] == true)
                    {
                        Discresponse.Result = "Discount found";
                        Discresponse.RemainingBalance = (decimal)results[1]; //REMAININGBALANCE
                        Discresponse.TotalBalance = (decimal)results[2]; //TOTALBALANCE
                        Discresponse.LimitType = (int)results[3];            //LIMITTYPE
                        Discresponse.ValidationType = (int)results[4];       //VALIDATIONTYPE
                    }
                    else
                    {
                        Discresponse.Result = "Discount not found !";
                    }
                }
                else
                {
                    Discresponse.Result = "Discount not found !";
                }
            }
            catch (HeadquarterTransactionServiceException ex)
            {
                Discresponse.Result = "Issue in RTS Calling !";
            }
            catch (Exception ex)
            {
                Discresponse.Result = "Issue in RTS Calling !";
            }

            return Discresponse;
        }

        #endregion Check Discount Amount

        #region Get Used Discount Amount

        /// <summary>
        /// getDiscountUsed
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private async Task<CustDiscountResponse> getDiscountUsedAsync(CustDiscountRequest request)
        {
            CustDiscountResponse response = new CustDiscountResponse();
            try
            {
                response = await GetDiscountUsed(request).ConfigureAwait(false);

                if (response.Result == "Done" && response.LimitType >= 0)
                {
                    ParameterSet parameters = new ParameterSet();
                    parameters["@CustAccount"] = request.CustAccount;
                    parameters["@dataArea"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;
                    parameters["@LimitType"] = request.LimitType;
                    parameters["@ValidationType"] = request.ValidationType;
                    parameters["@REPLICATIONCOUNTERFROMORIGIN"] = response.LimitType;

                    DataTable table = await ExecuteCustomQuery(discountUsedquery(), parameters, request.RequestContext).ConfigureAwait(false);

                    if (table.Rows.Count > 0)
                    {
                        response.DiscAmount = response.DiscAmount + Convert.ToDecimal(table.Rows[0]["DISCOUNT"]);
                    } 

                    ParameterSet parameters2 = new ParameterSet();
                    parameters2["@CustAccount"] = request.CustAccount;
                    parameters2["@dataArea"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;
                    parameters2["@LimitType"] = request.LimitType;
                    parameters2["@ValidationType"] = request.ValidationType;
                    parameters2["@REPLICATIONCOUNTERFROMORIGIN"] = response.LimitType;

                    DataTable table2 = await ExecuteCustomQuery(discountUsedqueryManual(), parameters2, request.RequestContext).ConfigureAwait(false);

                    if (table2.Rows.Count > 0)
                    {
                        response.DiscAmount = response.DiscAmount + Convert.ToDecimal(table2.Rows[0]["DISCOUNT"]);
                    } 

                }
            }
            catch (Exception ex)
            {
                response.Result += "checkDiscountBalance Test calling :" + ex.Message.ToString();
            }
            return response;
        }

        /// <summary>
        /// GetDiscountUsed
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<CustDiscountResponse> GetDiscountUsed(CustDiscountRequest request)
        {
            CustDiscountResponse Discresponse = new CustDiscountResponse();
            try
            {   
                InvokeExtensionMethodRealtimeRequest extensionRequest = new InvokeExtensionMethodRealtimeRequest(
                     "GetDiscountUsed",
                     request.CustAccount,
                     request.LimitType,
                     request.ValidationType);

                InvokeExtensionMethodRealtimeResponse response = await request.RequestContext.ExecuteAsync<InvokeExtensionMethodRealtimeResponse>(extensionRequest).ConfigureAwait(false);
                ReadOnlyCollection<object> results = response.Result;

                if (results.Count > 0)
                {
                    if ((bool)results[0] == true)
                    {
                        Discresponse.LimitType = (int)results[1]; //Replication Counter from Orign
                        Discresponse.DiscAmount = (decimal)results[2];
                        Discresponse.Result = "Done";
                    }
                    else
                    {
                        Discresponse.Result = "Discount not found !";
                    }
                }
                else
                {
                    Discresponse.Result = "Discount not found !";
                }
            }
            catch (HeadquarterTransactionServiceException ex)
            {
                Discresponse.Result = "Issue in RTS Calling !";
            }
            catch (Exception ex)
            {
                Discresponse.Result = "Issue in RTS Calling !";
            }

            return Discresponse;
        }

        #endregion Get Used Discount Amount

        #region DB Repository
        public string discountUsedquery()
        {
                        return @"

                        DECLARE @discount       numeric(32,6)
                        DECLARE @filterDate     date
                        DECLARE @currYear       int
                        DECLARE @currMonth      nvarchar(5)
                        DECLARE @transMonth     nvarchar(5)
                        DECLARE @transYear      int
                        DECLARE @transDay       nvarchar(5)


                        set @currYear = YEAR(getdate())
                        set @currMonth = Case WHEN MONTH(getdate()) >= 10 Then CAST(MONTH(getdate()) as nvarchar)  ELse '0'+ CAST(MONTH(getdate()) as varchar)  END

	                if(@LimitType = 0)
	                begin
		                --set @transMonth = MONTH(getdate())

                        set @filterDate = CAST(
                                CAST(@currYear AS NVARCHAR(4)) + CAST(@currMonth AS NVARCHAR(2)) + CAST('01' AS NVARCHAR(2))
                                AS date)

                    end

	                else if(@LimitType = 1)
	                begin
                        set @transYear	= YEAR(getdate()-30)
		                set @transMonth = Case WHEN MONTH(getdate()-30) >= 10 Then CAST(MONTH(getdate()-30) as nvarchar)  ELse '0'+ CAST(MONTH(getdate()-30) as varchar)  END
                     set @transDay	= Case WHEN  DAY(getdate()-30) >= 10 Then CAST(DAY(getdate()-30) as nvarchar)  Else '0'+ CAST(DAY(getdate()-30) as varchar)  END 
		
		                if(@transMonth<> @currMonth and @transMonth = 12)

                        begin
                            set @filterDate = CAST(
                                CAST(@currYear AS NVARCHAR(4)) + CAST(@currMonth AS NVARCHAR(2)) +  CAST('01' AS NVARCHAR(2))
                                AS date)

                        end

		                else
		                begin
                            set @filterDate = CAST(
                                CAST(@transYear AS NVARCHAR(4)) + CAST(@transMonth AS NVARCHAR(2)) +  CAST(@transDay AS NVARCHAR(2))
                                AS date)

                        end
                    end

	                if(@ValidationType = 0)
	                begin
                        set @discount = (select sum(cdl.AMOUNT) from
                            [ext].[CFZCUSTDISCOUNTUSED] cdl
                            where cdl.CUSTACCOUNT = @CustAccount
                                and cdl.TRANSDATE >= @filterDate
                                and cdl.DATAAREAID = @dataArea
                                and cdl.REPLICATIONCOUNTERFROMORIGIN > @REPLICATIONCOUNTERFROMORIGIN)
                    end
	                else if(@ValidationType = 1)
                    begin
                        set @discount = (select sum(cdl.QTY) from
                            [ext].[CFZCUSTDISCOUNTUSED] cdl
                            where cdl.CUSTACCOUNT = @CustAccount
                                and cdl.TRANSDATE >= @filterDate
                                and cdl.DATAAREAID = @dataArea
                                and cdl.REPLICATIONCOUNTERFROMORIGIN > @REPLICATIONCOUNTERFROMORIGIN)
                    end
                    set @discount = ISNULL(@discount, 0)
                    set @discount = round(@discount, 2)
                    select @discount as DISCOUNT";
        }



        public string discountUsedqueryManual()
        {
            return @"

                        DECLARE @discount       numeric(32,6)
                        DECLARE @filterDate     date
                        DECLARE @currYear       int
                        DECLARE @currMonth      nvarchar(5)
                        DECLARE @transMonth     nvarchar(5)
                        DECLARE @transYear      int
                        DECLARE @transDay       nvarchar(5)


                        set @currYear = YEAR(getdate())
                        set @currMonth = Case WHEN MONTH(getdate()) >= 10 Then CAST(MONTH(getdate()) as nvarchar)  ELse '0'+ CAST(MONTH(getdate()) as varchar)  END

	                if(@LimitType = 0)
	                begin
		                --set @transMonth = MONTH(getdate())

                        set @filterDate = CAST(
                                CAST(@currYear AS NVARCHAR(4)) + CAST(@currMonth AS NVARCHAR(2)) + CAST('01' AS NVARCHAR(2))
                                AS date)

                    end

	                else if(@LimitType = 1)
	                begin
                        set @transYear	= YEAR(getdate()-30)
		                set @transMonth = Case WHEN MONTH(getdate()-30) >= 10 Then CAST(MONTH(getdate()-30) as nvarchar)  ELse '0'+ CAST(MONTH(getdate()-30) as varchar)  END
                     set @transDay	= Case WHEN  DAY(getdate()-30) >= 10 Then CAST(DAY(getdate()-30) as nvarchar)  Else '0'+ CAST(DAY(getdate()-30) as varchar)  END 
		
		                if(@transMonth<> @currMonth and @transMonth = 12)

                        begin
                            set @filterDate = CAST(
                                CAST(@currYear AS NVARCHAR(4)) + CAST(@currMonth AS NVARCHAR(2)) +  CAST('01' AS NVARCHAR(2))
                                AS date)

                        end

		                else
		                begin
                            set @filterDate = CAST(
                                CAST(@transYear AS NVARCHAR(4)) + CAST(@transMonth AS NVARCHAR(2)) +  CAST(@transDay AS NVARCHAR(2))
                                AS date)

                        end
                    end

	                if(@ValidationType = 0)
	                begin
                        set @discount = (select sum(cdl.AMOUNT) from
                            [ext].[CFZCUSTDISCOUNTUSEDMANUAL] cdl
                            where cdl.CUSTACCOUNT = @CustAccount
                                and cdl.TRANSDATE >= @filterDate
                                and cdl.DATAAREAID = @dataArea
                                and cdl.REPLICATIONCOUNTERFROMORIGIN > @REPLICATIONCOUNTERFROMORIGIN)
                    end
	                else if(@ValidationType = 1)
                    begin
                        set @discount = (select sum(cdl.QTY) from
                            [ext].[CFZCUSTDISCOUNTUSEDMANUAL] cdl
                            where cdl.CUSTACCOUNT = @CustAccount
                                and cdl.TRANSDATE >= @filterDate
                                and cdl.DATAAREAID = @dataArea
                                and cdl.REPLICATIONCOUNTERFROMORIGIN > @REPLICATIONCOUNTERFROMORIGIN)
                    end
                    set @discount = ISNULL(@discount, 0)
                    set @discount = round(@discount, 2)
                    select @discount as DISCOUNT";
        }

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
