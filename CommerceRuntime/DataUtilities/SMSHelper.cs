using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using System.Xml;
using Confiz.CommerceRuntime.Messages;

namespace Confiz.CommerceRuntime.DataUtilities
{
    public class SMSHelper
    {

        #region Class Members Feilds 

        public string UserID;
        public string Password;
        public string Mask;
        public string Api;
        public string Url;
        public string Message;
        public string Phone;
        public string ReceiptId;
        public RequestContext request;
        public SalesOrder salesOrder { get; set;}

        #endregion Class Members Feilds

        public SMSHelper(RequestContext request)
        {
            this.request = request;
        }

        public async Task getSMSSettings(RequestContext request)
        {
            try
            {
                ParameterSet parameters = new ParameterSet();
                parameters["@DATAAREAID"] = request.GetChannelConfiguration().InventLocationDataAreaId;
                StringBuilder selectQuery = new StringBuilder();
                selectQuery.Append("  SELECT TOP(1) * FROM EXT.CFZSMSSETTING WHERE  DATAAREAID = @DATAAREAID  ");
                DataTable dataTable = await ExecuteCustomQuery(selectQuery.ToString(), parameters, request).ConfigureAwait(false);
                if (dataTable.Rows.Count > 0)
                {
                    this.UserID = Convert.ToString(dataTable.Rows[0]["USERNAME"].ToString());
                    this.Password = Convert.ToString(dataTable.Rows[0]["PASSWORD"].ToString());
                    this.Mask = Convert.ToString(dataTable.Rows[0]["MASK"].ToString());
                    this.Api = Convert.ToString(dataTable.Rows[0]["API"].ToString());
                }
            }
            catch (Exception ex)
            {
            }

        }
        public async Task getMessage(RequestContext request, int type)
        {
            try
            {
                ParameterSet parameters = new ParameterSet();
                parameters["@type"] = type;
                parameters["@DATAAREAID"] = request.GetChannelConfiguration().InventLocationDataAreaId;
                StringBuilder selectQuery = new StringBuilder();
                selectQuery.Append(" Select TOP(1) * from EXT.CFZSMSMESSAGE Where DATAAREAID = @DATAAREAID AND type = @type    ");
                DataTable table = await ExecuteCustomQuery(selectQuery.ToString(), parameters, request).ConfigureAwait(false);
                if (table.Rows.Count > 0)
                {
                    if (table.Rows[0]["MESSAGE"] != DBNull.Value)
                    {
                        this.Message = Convert.ToString(table.Rows[0]["MESSAGE"].ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                this.Message = "Dear Customer,%n%nThank you for shopping";
            }
        }
        public void setSalesMessage(string CustomerName = "", string ReceiptId = "", string TotalSalesAmount = "", string DiscountAmount = "")
        {
            try
            {
                this.Message = this.Message.Replace("%1", CustomerName)
                                           .Replace("%2", ReceiptId)
                                           .Replace("%3", !string.IsNullOrEmpty(TotalSalesAmount) ? TotalSalesAmount.ToString() : this.salesOrder.TotalSalesAmount.ToString())
                                           .Replace("%4", !string.IsNullOrEmpty(DiscountAmount) ? DiscountAmount.ToString() : Convert.ToString(Convert.ToInt16(this.salesOrder.DiscountAmount + this.salesOrder.TotalManualDiscountAmount)))
                                           .Replace("%n", Environment.NewLine);
            }
            catch (Exception ex)
            {
                this.Message = "";
            }
        }

        public string setUrl()
        {
            try
            {
                if (!string.IsNullOrEmpty(this.Api))
                {
                    this.Url = this.Api.Replace("%1", this.Phone)
                        .Replace("%2", this.Message)
                        .Replace("%3", this.UserID)
                        .Replace("%4", this.Password)
                        .Replace("%5", this.Mask);
                }

                return this.Url.ToString();
            }
            catch (Exception ex)
            {
                return ex.Message.ToString();
            }
        }

        public string CfzSendSMS(bool isPrimary)
        {
            string xml = string.Empty;
            try
            {
                if (isPrimary)
                {
                    using (WebClient webClient = new WebClient()) // Implementing using block
                    {
                        xml = webClient.DownloadString(this.Url);
                    }
                    var stringReader = new StringReader(xml);
                    using (XmlReader xmlReader = XmlReader.Create(stringReader, new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit })) // Disable DTD processing
                    {
                        using (System.Data.DataSet dsSet = new System.Data.DataSet()) // Implementing using block
                        {
                            dsSet.ReadXml(xmlReader); // This line reads XML data into the DataSet
                            System.Data.DataTable dt = dsSet.Tables[0]; // Access the first table in the DataSet
                            string Result = dt.Rows[0][2].ToString();
                            return string.IsNullOrEmpty(Result) ? string.Empty : Result;
                        }
                    }
                }
                else
                {
                    return xml.ToString();
                }
            }
            catch (Exception ex)
            {
                return string.IsNullOrEmpty(xml) ? ex.Message.ToString() : xml;
            }
        }

        public string getPhoneNumber(SalesOrder salesOrder, string Phone = null)
        {
            string toPhone = Phone;
            try
            {
                if (string.IsNullOrEmpty(toPhone))
                {
                    var ReasonCodeLines = salesOrder.ReasonCodeLines.Where(p => p.ReasonCodeId.Equals("PhoneSMS")).FirstOrDefault();
                    toPhone = ReasonCodeLines != null ? !string.IsNullOrEmpty(ReasonCodeLines.Information) ? ReasonCodeLines.Information : string.Empty : string.Empty;

                    if (!string.IsNullOrEmpty(toPhone) && (toPhone.Length > 9))
                    {
                        if (toPhone.Contains('-')) { toPhone = toPhone.Replace("-", string.Empty); }
                        if (toPhone.Substring(0, 3) == "+92") { toPhone = toPhone.Replace("+", string.Empty); }
                        if (toPhone.Substring(0, 2) != "92") { toPhone = "92" + toPhone.TrimStart('0'); }
                    }
                    else
                    {
                        toPhone = string.Empty;
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(toPhone) && (toPhone.Length > 9))
                    {
                        if (toPhone.Contains('-')) { toPhone = toPhone.Replace("-", string.Empty); }
                        if (toPhone.Substring(0, 3) == "+92") { toPhone = toPhone.Replace("+", string.Empty); }
                        if (toPhone.Substring(0, 2) != "92") { toPhone = "92" + toPhone.TrimStart('0'); }
                    }
                    else
                    {
                        toPhone = string.Empty;
                    }
                }
            }
            catch (Exception ex)
            {
                toPhone = string.Empty;
            }
            return toPhone;
        }
        public string getCustName(SalesOrder salesOrder)
        {
            string custName = string.Empty;
            try
            {
                var ReasonCodeLines = salesOrder.ReasonCodeLines.Where(p => p.ReasonCodeId.Equals("CustName")).FirstOrDefault();
                custName = ReasonCodeLines != null ? !string.IsNullOrEmpty(ReasonCodeLines.Information) ? ReasonCodeLines.Information : string.Empty : string.Empty;
            }
            catch (Exception ex)
            {
                custName = string.Empty;
            }
            return custName;
        }

        #region ----- Update DB Functions
        public async Task<int> isAlreadyExistAsync(string TRANSACTIONID, int TYPE)
        {
            int queryStatus = 0;

            try
            {
                ParameterSet parameters = new ParameterSet();
                parameters["@TRANSACTIONID"] = TRANSACTIONID;
                parameters["@TYPE"] = TYPE;
                StringBuilder selectQuery = new StringBuilder();
                selectQuery.Append(" Select * from [ext].[CFZSMSLOGHISTORY]");
                selectQuery.AppendLine();
                selectQuery.Append(" WHERE TRANSACTIONID = @TRANSACTIONID AND TYPE = @TYPE ");
                DataTable table = await ExecuteCustomQuery(selectQuery.ToString(), parameters, request).ConfigureAwait(false);
                queryStatus = table.Rows.Count;
            }
            catch (Exception ex)
            {

            }

            return queryStatus;

        }
        public async Task<int> updateStatusAsync(string TRANSACTIONID, string RESPONSE, int TYPE)
        {
            int queryStatus = 0;

            try
            {
                ParameterSet parameters = new ParameterSet();
                parameters["@TRANSACTIONID"] = TRANSACTIONID;
                parameters["@RESPONSE"] = RESPONSE.Length >=50 ? RESPONSE.Substring(0, 49) : RESPONSE;
                parameters["@TYPE"] = TYPE;
                parameters["@MESSAGE"] = this.Url.Length >= 500 ? this.Url.Substring(0, 500) : this.Url; 
                parameters["@DATAAREAID"] = this.request.GetChannelConfiguration().InventLocationDataAreaId;
                StringBuilder selectQuery = new StringBuilder();
                selectQuery.Append(" INSERT INTO [ext].[CFZSMSLOGHISTORY]([ID],[RESPONSE],[TYPE],[MESSAGE],[DATAAREAID])");
                selectQuery.AppendLine();
                selectQuery.Append(" VALUES(@TRANSACTIONID,@RESPONSE,@TYPE,@MESSAGE,@DATAAREAID) ");
                DataTable table = await ExecuteCustomQuery(selectQuery.ToString(), parameters, request).ConfigureAwait(false);
                queryStatus = table.Rows.Count;
            }
            catch (Exception ex)
            {

            }

            return queryStatus;

        }
        public async Task<int> updateStatusExceptionAsync(string TRANSACTIONID, string RESPONSE, int TYPE, SMSRequest request)
        {
            int queryStatus = 0;

            try
            {
                ParameterSet parameters = new ParameterSet();
                parameters["@TRANSACTIONID"] = TRANSACTIONID;
                parameters["@RESPONSE"] = RESPONSE.Length >= 50 ? RESPONSE.Substring(0, 49) : RESPONSE;
                parameters["@TYPE"] = TYPE;
                parameters["@MESSAGE"] = "Issue in Calling";
                parameters["@DATAAREAID"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;
                StringBuilder selectQuery = new StringBuilder();
                selectQuery.Append(" INSERT INTO [ext].[CFZSMSLOGHISTORY]([ID],[RESPONSE],[TYPE],[MESSAGE],[DATAAREAID])");
                selectQuery.AppendLine();
                selectQuery.Append(" VALUES(@TRANSACTIONID,@RESPONSE,@TYPE,@MESSAGE,@DATAAREAID) ");
                DataTable table = await ExecuteCustomQuery(selectQuery.ToString(), parameters, request.RequestContext).ConfigureAwait(false);
                queryStatus = table.Rows.Count;
            }
            catch (Exception ex)
            {

            }

            return queryStatus;

        }
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
        #endregion ----- Update DB Functions
    }
}
