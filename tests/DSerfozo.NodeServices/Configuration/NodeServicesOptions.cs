using Microsoft.AspNetCore.NodeServices.HostingModels;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading;

namespace Microsoft.AspNetCore.NodeServices
{
    public class NodeServicesOptions
    {
        internal const string TimeoutConfigPropertyName = nameof(InvocationTimeoutMilliseconds);

        /// <summary>
        /// Specifies how to construct Node.js instances. An <see cref="INodeInstance"/> encapsulates all details about
        /// how Node.js instances are launched and communicated with. A new <see cref="INodeInstance"/> will be created
        /// automatically if the previous instance has terminated (e.g., because a source file changed).
        /// </summary>
        public Func<INodeInstance> NodeInstanceFactory { get; set; }

        /// <summary>
        /// If set, overrides the path to the root of your application. This path is used when locating Node.js modules relative to your project.
        /// </summary>
        public string ProjectPath { get; set; }

        /// <summary>
        /// If set, the Node.js instance should restart when any matching file on disk within your project changes.
        /// </summary>
        public string[] WatchFileExtensions { get; set; }

        /// <summary>
        /// The Node.js instance's stdout/stderr will be redirected to this <see cref="ILogger"/>.
        /// </summary>
        public ILogger NodeInstanceOutputLogger { get; set; }

        /// <summary>
        /// If true, the Node.js instance will accept incoming V8 debugger connections (e.g., from node-inspector).
        /// </summary>
        public bool LaunchWithDebugging { get; set; }

        /// <summary>
        /// If <see cref="LaunchWithDebugging"/> is true, the Node.js instance will listen for V8 debugger connections on this port.
        /// </summary>
        public int DebuggingPort { get; set; }

        /// <summary>
        /// If set, starts the Node.js instance with the specified environment variables.
        /// </summary>
        public IDictionary<string, string> EnvironmentVariables { get; set; }

        /// <summary>
        /// Specifies the maximum duration, in milliseconds, that your .NET code should wait for Node.js RPC calls to return.
        /// </summary>
        public int InvocationTimeoutMilliseconds { get; set; }

        /// <summary>
        /// A token that indicates when the host application is stopping.
        /// </summary>
        public CancellationToken ApplicationStoppingToken { get; set; }
    }
}
