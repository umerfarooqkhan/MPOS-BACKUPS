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
    using Microsoft.Dynamics.Commerce.Runtime.DataModel;
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    [DataContract]
    public class FBRRequest : Request
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FBRRespuest"/> class.
        /// </summary>
        public FBRRequest(Cart Cart, string CNIC, string Status)
        {
            this.Cart = Cart;
            this.CNIC = CNIC;
            this.Status = Status;

        }

        /// <summary>
        /// Gets the Status.
        /// </summary>
        [DataMember]
        public string Status { get; set; }

        /// <summary>
        /// Gets the CNIC.
        /// </summary>
        [DataMember]
        public string CNIC { get; set; }

        /// <summary>
        /// Gets the Status.
        /// </summary>
        [DataMember]
        public Cart Cart { get; set; }
    }
}