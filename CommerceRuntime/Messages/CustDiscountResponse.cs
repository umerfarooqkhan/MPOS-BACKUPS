namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;

    [DataContract]
    public class CustDiscountResponse : Response
    {

        // <summary>
        /// Initializes a new instance of the <see cref="CustDiscountResponse"/> class.
        /// </summary>

        public CustDiscountResponse()
        {

        }

        [DataMember]
        public string Result { get; set; }

        [DataMember]
        public int LimitType { get; set; }
        /// <summary>
        /// Gets the return value(if any).
        /// </summary>
        [DataMember]
        public int ValidationType { get; set; }

        [DataMember]
        public decimal RemainingBalance { get; set; }

        [DataMember]
        public decimal TotalBalance { get; set; }

        [DataMember]
        public decimal DiscAmount { get; set; }
    }
}
