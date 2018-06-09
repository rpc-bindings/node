using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using DSerfozo.RpcBindings.Json;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.AspNetCore.NodeServices.Sockets;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace DSerfozo.RpcBindings.Node.IntegrationTests
{
    public class NodeBuiltinModuleTests
    {
        [Fact]
        public async Task BuiltInModuleResolved()
        {
            var stopTokenSource = new CancellationTokenSource();
            var options = new NodeServicesOptions
            {
                ApplicationStoppingToken = stopTokenSource.Token,
                ProjectPath = AppDomain.CurrentDomain.BaseDirectory,
                NodeInstanceOutputLogger = Mock.Of<ILogger>(),
            };
            options.UseSocketHosting();

            using (var services = NodeServicesFactory.CreateNodeServices(options))
            using (var builtinModule = new StringAsTempFile("exports.add = function(a, b) {return a+b;}", stopTokenSource.Token))
            {
                await services.InvokeExportAsync<object>("builtin-modules-init", "initialize",
                    new Dictionary<string, string>()
                    {
                        {"builtin", builtinModule.FileName}
                    });

                var result = await services.InvokeExportAsync<int>("builtin-modules-test", "test", 1, 2);

                stopTokenSource.Cancel();

                Assert.Equal(3, result);
            }
        }
    }
}
