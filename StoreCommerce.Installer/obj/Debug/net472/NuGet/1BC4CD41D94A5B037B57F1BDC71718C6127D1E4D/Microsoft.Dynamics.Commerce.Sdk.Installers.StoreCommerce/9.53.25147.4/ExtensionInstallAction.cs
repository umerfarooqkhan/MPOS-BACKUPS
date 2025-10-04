namespace Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce
{
    using CommandLine;
    using Microsoft.Dynamics.Commerce.Installers.Framework;
    using Microsoft.Dynamics.Commerce.Installers.Framework.Attributes;

    /// <summary>
    /// An action to install the Store Commerce extension.
    /// </summary>
    public class StoreCommerceExtensionInstallAction : InstallAction
    {
        /// <summary>
        /// Gets or sets a value indicating whether to close Store Commerce before installation.
        /// </summary>
        [Option(HelpText = "If argument is given, Store Commerce app will be closed if it is open.", Required = false)]
        public bool CloseStoreCommerceApp { get; set; }
    }
}