namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.DataModel;
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;

    [DataContract]
    public class SMSRequest : Request
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SMSRequest"/> class.
        /// </summary>
        public SMSRequest(Cart Cart,string Status)
        {
            this.Cart = Cart;
            this.Status = Status;
        }

        /// <summary>
        /// Gets the Status.
        /// </summary>
        [DataMember]
        public string Status { get; set; }

        /// <summary>
        /// Gets the Status.
        /// </summary>
        [DataMember]
        public Cart Cart { get; set; }
    }
}
