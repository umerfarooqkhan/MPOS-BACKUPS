namespace Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;
    using Microsoft.Dynamics.Commerce.Installers.Framework;
    using Microsoft.Dynamics.Commerce.Sdk.Installers;
    using Microsoft.Extensions.Configuration;

    /// <summary>
    /// Class representing a Store Commerce extension package installer setup.
    /// </summary>
    public sealed class StoreCommerceExtensionPackageInstallerSetup : ExtensionPackageInstallerSetup
    {
        private const string StoreCommerceAppProcessName = "Microsoft.Dynamics.Commerce.StoreCommerce";
        private const string StoreCommerceHardwareStationProcessName = "Microsoft.Dynamics.Commerce.StoreCommerce.HardwareStationServer";

        /// <summary>
        /// Initializes a new instance of the <see cref="StoreCommerceExtensionPackageInstallerSetup"/> class.
        /// </summary>
        public StoreCommerceExtensionPackageInstallerSetup() : base(Assembly.GetExecutingAssembly())
        {
            this.InstallerCommandLineOption = new object();

            this.CorePreInstallSteps = new List<IInstallerStep>()
            {
                new DynamicStep(async (context) =>
                {
                    string closeStoreCommerceStringValue = context.Configuration[nameof(StoreCommerceExtensionInstallAction.CloseStoreCommerceApp)];
                    if (bool.TryParse(closeStoreCommerceStringValue, out bool closeStoreCommerce) && closeStoreCommerce)
                    {
                        KillProcess killStoreCommerceProcessStep = new KillProcess(StoreCommerceAppProcessName);
                        KillProcess killHardwareStationProcessStep = new KillProcess(StoreCommerceHardwareStationProcessName);

                        await killStoreCommerceProcessStep.Run(context).ConfigureAwait(false);
                        await killHardwareStationProcessStep.Run(context).ConfigureAwait(false);
                    }
                })
            };

            this.CoreInstallSteps = new List<IInstallerStep>()
            {
                new InstallOfflineDatabaseExtensionsStep(),
            };

            this.CoreUninstallSteps = new List<IInstallerStep>();
        }

        /// <summary>
        /// Gets the value for the installer name.
        /// </summary>
        public override string InstallerName { get; } = "Store Commerce";

        /// <inheritdoc/>
        public override string ExtensionName => "CFZ.Sapphire.Commerce";

        /// <summary>
        /// Gets the configuration sources.
        /// </summary>
        public IEnumerable<IConfigurationSource> InstallerConfigurationSources { get; }

        /// <summary>
        /// Gets the command line options for Store Commerce extension installer.
        /// </summary>
        public object InstallerCommandLineOption { get; }

        /// <inheritdoc/>
        public override IEnumerable<Operation> Operations => new Operation[]
        {
            new Operation(
                typeof(StoreCommerceExtensionInstallAction),
                this.InstallSteps.Select(step => new StepDefinition(step)).ToArray()),
            new Operation(
                typeof(UninstallAction),
                this.UninstallSteps.Select(step => new StepDefinition(step)).ToArray()),
        };

        /// <summary>
        /// Gets a set of Installer Step Context Configuration properties to be persisted once installation is completed.
        /// </summary>
        public override IEnumerable<string> ConfigurationPropertiesToPersist
        {
            get
            {
                return Array.Empty<string>();
            }
        }

        /// <summary>
        /// Gets the core/stock install steps for the Store Commerce extension installer.
        /// </summary>
        protected override IReadOnlyCollection<IInstallerStep> CoreInstallSteps { get; }

        /// <summary>
        /// Gets the core/stock uninstall steps for the Store Commerce extension installer.
        /// </summary>
        protected override IReadOnlyCollection<IInstallerStep> CoreUninstallSteps { get; }

        /// <summary>
        /// Gets the core/stock pre-install steps for the Store Commerce extension installer.
        /// </summary>
        protected override IReadOnlyCollection<IInstallerStep> CorePreInstallSteps { get; }
    }
}