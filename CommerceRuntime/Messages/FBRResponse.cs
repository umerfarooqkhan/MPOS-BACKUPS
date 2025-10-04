/**
 * SAMPLE CODE NOTICE
 * 
 * THIS SAMPLE CODE IS MADE AVAILABLE AS IS.  MICROSOFT MAKES NO WARRANTIES, WHETHER EXPRESS OR IMPLIED,
 * OF FITNESS FOR A PARTICULAR PURPOSE, OF ACCURACY OR COMPLETENESS OF RESPONSES, OF RESULTS, OR CONDITIONS OF MERCHANTABILITY.
 * THE ENTIRE RISK OF THE USE OR THE RESULTS FROM THE USE OF THIS SAMPLE CODE REMAINS WITH THE USER.
 * NO TECHNICAL SUPPORT IS PROVIDED.  YOU MAY NOT DISTRIBUTE THIS CODE UNLESS YOU HAVE A LICENSE AGREEMENT WITH MICROSOFT THAT ALLOWS YOU TO DO SO.
 */

namespace Confiz.CommerceRuntime.Messages
{
    using System.Runtime.Serialization;
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    [DataContract]
    public class FBRResponse : Response
    {
        // <summary>
        /// Initializes a new instance of the <see cref="FBRResponse"/> class.
        /// </summary>

        public FBRResponse(string Response)
        {
            this.Response = Response;
            this.Code = string.Empty;
            this.InvoiceNumber = string.Empty;
        }

        public FBRResponse()
        {
        }

        [DataMember]
        public string InvoiceNumber { get; set; }

        [DataMember]
        public string Code { get; set; }

        [DataMember]
        public string Response { get; set; }


    }
}