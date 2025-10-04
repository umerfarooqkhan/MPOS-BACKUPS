using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Confiz.CommerceRuntime.DataUtilities
{
    public class FBRQuries
    {

        public static string FBRPOSIDquery = @"SELECT LOCATION FROM ext.CFZRETAILTERMINALTABLEVIEW WHERE TERMINALID = @TerminalId";
        public static string FBRItemNamequery = @"SELECT [PCTCode] CFZPCTCODE,[DATAAREAID] FROM [ext].[CFZINVENTTABLEVIEW] WHERE ITEMID = @ITEMID AND DATAAREAID = @DATAAREAID";
        public static string FBRIDquery = @"SELECT top 1  FBRID , custCNIC FROM ext.CFZFBRResponse  WHERE TRANSACTIONID = @TRANSACTIONID";
        public static string FBRAPIQuery = @"SELECT TOP(1) CFZFBRAPI,CFZFBRAPITOKEN,CFZFBRAPITYPE FROM Ext.CFZFBRAPIURL WHERE DATAAREAID = @DATAAREAID";
        public static string FBRDataLogDquery = @"SELECT top 1  TRANSACTIONID , TransJson FROM ext.CFZFBRMPOSTRANSDATALOGS  WHERE TRANSACTIONID = @TRANSACTIONID";
        public static string AJKFBRIDquery = @"SELECT top 1  INVOICEID , custCNIC FROM ext.CFZAJKFBRResponse  WHERE TRANSACTIONID = @TRANSACTIONID";
        public static string AJKFBRAPIQuery = @"SELECT TOP(1) CFZAJKFBRAPI,CFZAJKFBRAPITOKEN,CFZAJKFBRAPITYPE FROM Ext.CFZAJKFBRAPIURL WHERE DATAAREAID = @DATAAREAID";
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
        public static async Task<int> GetFBRPOSID(string terminalId, RequestContext context)
        {
            try
            {
                ParameterSet parameter = new ParameterSet();
                int POSID = 0;
                parameter["@TerminalId"] = terminalId;

                DataTable table = await ExecuteCustomQuery(FBRPOSIDquery, parameter, context).ConfigureAwait(false);

                if (table.Rows.Count > 0)
                {
                    int.TryParse(Convert.ToString(table.Rows[0]["LOCATION"]), out POSID);
                }

                return POSID == 0 ? 0 : POSID;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        public static async Task<string> GetAJKINVOICEIdAsync(string Id, RequestContext context)
        {
            try
            {
                ParameterSet parameter = new ParameterSet();
                string FBRID = string.Empty;
                parameter["@TRANSACTIONID"] = Id;

                DataTable table = await FBRQuries.ExecuteCustomQuery(FBRQuries.AJKFBRIDquery, parameter, context).ConfigureAwait(false);

                if (table.Rows.Count > 0)
                {
                    FBRID = Convert.ToString(table.Rows[0]["FBRID"]);
                }

                return FBRID;
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        public static async Task InserAJKFBRIDAsync(string transactionId, string fbrInvoiceId, string custCNIC, RequestContext RequestContext)
        {
            using (DatabaseContext databaseContext = new DatabaseContext(RequestContext))
            {
                ParameterSet parameters = new ParameterSet();

                parameters["@TRANSACTIONID"] = transactionId;
                parameters["@FBRInvoiceId "] = fbrInvoiceId;
                parameters["@custCNIC "] = custCNIC;
                parameters["@dATAAREAID "] = RequestContext.GetChannelConfiguration().InventLocationDataAreaId;

                StringBuilder selectQuery = new StringBuilder();

                selectQuery.Append("        INSERT INTO [ext].[CFZAJKFBRResponse] ");
                selectQuery.AppendLine();
                selectQuery.Append("       (TRANSACTIONID,INVOICEID,custCNIC,DATAAREAID) ");
                selectQuery.AppendLine();
                selectQuery.Append("            VALUES ");
                selectQuery.AppendLine();
                selectQuery.Append("       (@TRANSACTIONID ,@FBRInvoiceId ,@custCNIC,@dATAAREAID) ");

                var sqlQuery = new SqlQuery(selectQuery.ToString(), parameters);
                await databaseContext.ExecuteNonQueryAsync(sqlQuery).ConfigureAwait(false);
            }
        }
        public static async Task InserAJKFBRTransLogAsync(string TRANSID, string TransJson, string TERMINALID, string POSID, string ResponseJson, string DATAAREAID, RequestContext RequestContext)
        {
            using (DatabaseContext databaseContext = new DatabaseContext(RequestContext))
            {
                ParameterSet parameters = new ParameterSet();

                parameters["@TRANSACTIONID"] = TRANSID;
                parameters["@TransJson"] = TransJson;
                parameters["@TERMINALID"] = TERMINALID;
                parameters["@POSID"] = POSID;
                parameters["@ResponseJson"] = ResponseJson;
                parameters["@DATAAREAID"] = DATAAREAID;

                StringBuilder selectQuery = new StringBuilder();

                selectQuery.Append("        INSERT INTO [ext].[CFZAJKFBRMPOSTRANSDATALOGS] ");
                selectQuery.AppendLine();
                selectQuery.Append("       (TRANSACTIONID,TransJson , TERMINALID,POSID,ResponseJson,DATAAREAID) ");
                selectQuery.AppendLine();
                selectQuery.Append("            VALUES ");
                selectQuery.AppendLine();
                selectQuery.Append("          (@TRANSACTIONID,@TransJson , @TERMINALID,@POSID,@ResponseJson,@DATAAREAID) ");

                var sqlQuery = new SqlQuery(selectQuery.ToString(), parameters);
                await databaseContext.ExecuteNonQueryAsync(sqlQuery).ConfigureAwait(false);
            }
        }
        public static async Task<DataTable> GetAJKFBRAPIURLAsync(RequestContext context)
        {
            try
            {
                ParameterSet parameterSet = new ParameterSet();
                parameterSet["@DATAAREAID"] = context.GetChannelConfiguration().InventLocationDataAreaId;

                FBRQuries quries = new FBRQuries();

                DataTable dt = await ExecuteCustomQuery(AJKFBRAPIQuery, parameterSet, context).ConfigureAwait(false);

                return dt;
            }
            catch (Exception ex)
            {
                //CFZFBRAPI = "http://221.120.210.213:8050";
                return new DataTable();
            }
        }
        public static async Task<string> GetItemPCTCode(string itemid, RequestContext context)
        {
            try
            {
                ParameterSet parameter = new ParameterSet();
                string PCTCode = string.Empty;
                parameter["@ITEMID"] = itemid;
                parameter["@DATAAREAID"] = context.GetChannelConfiguration().InventLocationDataAreaId;

                DataTable table = await ExecuteCustomQuery(FBRItemNamequery, parameter, context).ConfigureAwait(false);

                if (table.Rows.Count > 0)
                {
                    PCTCode = Convert.ToString(table.Rows[0]["CFZPCTCODE"]);
                }

                return string.IsNullOrEmpty(PCTCode) ? string.Empty : PCTCode;
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }
        public static async Task<DataTable> GetFBRAPIURL(RequestContext context)
        {
            try
            {
                ParameterSet parameterSet = new ParameterSet();
                parameterSet["@DATAAREAID"] = context.GetChannelConfiguration().InventLocationDataAreaId;

                FBRQuries quries = new FBRQuries();

                DataTable dt = await ExecuteCustomQuery(FBRAPIQuery, parameterSet, context).ConfigureAwait(false);

                return dt;
            }
            catch (Exception ex)
            {
                //CFZFBRAPI = "http://221.120.210.213:8050";
                return new DataTable();
            }
        }
        public static string GetPaymentMode(List<TenderLine> tenderLineItem)
        {
            string Payment = string.Empty;
            IEnumerable<string> list = tenderLineItem.Select(x => x.TenderTypeId).Distinct().ToList();
            if (list.Count() > 1)
            {
                Payment = "5";
            }
            else
            {
                Payment = list.FirstOrDefault();
                if (Payment == "2" || Payment == "4")
                {
                    Payment = "2";  //Pay Card
                }
                else if (Payment == "3")
                {
                    Payment = "3";  //Loyalty Card
                }
                else
                {
                    Payment = "1"; //Cash
                }


            }

            return Payment;
        }
        public static void InserFBRTransLog(string TRANSID, string TransJson, string TERMINALID, string POSID, string ResponseJson, string DATAAREAID, RequestContext RequestContext)
        {
            using (DatabaseContext databaseContext = new DatabaseContext(RequestContext))
            {
                ParameterSet parameters = new ParameterSet();

                parameters["@TRANSACTIONID"] = TRANSID;
                parameters["@TransJson"] = TransJson;
                parameters["@TERMINALID"] = TERMINALID;
                parameters["@POSID"] = POSID;
                parameters["@ResponseJson"] = ResponseJson;
                parameters["@DATAAREAID"] = DATAAREAID;

                StringBuilder selectQuery = new StringBuilder();

                selectQuery.Append("        INSERT INTO [ext].[CFZFBRMPOSTRANSDATALOGS] ");
                selectQuery.AppendLine();
                selectQuery.Append("       (TRANSACTIONID,TransJson , TERMINALID,POSID,ResponseJson,DATAAREAID) ");
                selectQuery.AppendLine();
                selectQuery.Append("            VALUES ");
                selectQuery.AppendLine();
                selectQuery.Append("          (@TRANSACTIONID,@TransJson , @TERMINALID,@POSID,@ResponseJson,@DATAAREAID) ");

                var sqlQuery = new SqlQuery(selectQuery.ToString(), parameters);
                databaseContext.ExecuteNonQueryAsync(sqlQuery);
            }
        }
        public static void InserFBRID(string transactionId, string fbrInvoiceId, string custCNIC, RequestContext RequestContext)
        {
            using (DatabaseContext databaseContext = new DatabaseContext(RequestContext))
            {
                ParameterSet parameters = new ParameterSet();

                parameters["@TRANSACTIONID"] = transactionId;
                parameters["@FBRInvoiceId "] = fbrInvoiceId;
                parameters["@custCNIC "] = custCNIC;
                parameters["@dATAAREAID "] = RequestContext.GetChannelConfiguration().InventLocationDataAreaId;

                StringBuilder selectQuery = new StringBuilder();

                selectQuery.Append("        INSERT INTO [ext].[CFZFBRResponse] ");
                selectQuery.AppendLine();
                selectQuery.Append("       (TRANSACTIONID,FBRID,custCNIC,DATAAREAID) ");
                selectQuery.AppendLine();
                selectQuery.Append("            VALUES ");
                selectQuery.AppendLine();
                selectQuery.Append("       (@TRANSACTIONID ,@FBRInvoiceId ,@custCNIC,@dATAAREAID) ");

                var sqlQuery = new SqlQuery(selectQuery.ToString(), parameters);
                databaseContext.ExecuteNonQueryAsync(sqlQuery);
            }
        }
        public static async Task<string> GetFBRId(string Id, RequestContext context)
        {
            try
            {
                ParameterSet parameter = new ParameterSet();
                string FBRID = string.Empty;
                parameter["@TRANSACTIONID"] = Id;

                DataTable table = await ExecuteCustomQuery(FBRIDquery, parameter, context).ConfigureAwait(false);

                if (table.Rows.Count > 0)
                {
                    FBRID = Convert.ToString(table.Rows[0]["FBRID"]);
                }

                return FBRID;
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        public static async Task<string> GetFBRDataLogs(string Id, RequestContext context)
        {
            try
            {
                ParameterSet parameter = new ParameterSet();
                string TransId = string.Empty;
                parameter["@TRANSACTIONID"] = Id;

                DataTable table = await ExecuteCustomQuery(FBRDataLogDquery, parameter, context).ConfigureAwait(false);

                if (table.Rows.Count > 0)
                {
                    TransId = Convert.ToString(table.Rows[0]["TransJson"]);
                }

                return TransId;
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }
    }
}
