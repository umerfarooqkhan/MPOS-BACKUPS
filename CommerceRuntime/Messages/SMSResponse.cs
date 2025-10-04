namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;

    [DataContract]
    public class SMSResponse : Response
    {
        // <summary>
        /// Initializes a new instance of the <see cref="FBRResponse"/> class.
        /// </summary>

        public SMSResponse(string Response)
        {
            this.Response = Response;
        }

        [DataMember]
        public string Response { get; set; }
    }
}
