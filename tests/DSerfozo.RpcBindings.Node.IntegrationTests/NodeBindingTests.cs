using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using DSerfozo.RpcBindings.Contract;
using DSerfozo.RpcBindings.Contract.Marshaling;
using DSerfozo.RpcBindings.Extensions;
using DSerfozo.RpcBindings.Json;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.AspNetCore.NodeServices.Sockets;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace DSerfozo.RpcBindings.Node.IntegrationTests
{
    public class NodeBindingTests : IDisposable
    {
        private readonly CancellationTokenSource stopTokenSource = new CancellationTokenSource();
        private readonly INodeServices nodeServices;
        private readonly LineDelimitedJsonConnection connection;
        private readonly JsonRpcBindingHost rpcHost;
        private readonly Task initTask;

        public class TestBound2
        {
            private readonly string str;

            public string Value => str;

            public TestBound2(string str)
            {
                this.str = str;
            }

            public string GetValue()
            {
                return str;
            }
        }

        public delegate Task TestDelegate([BindValue]TestBound2 b);

        public class TestBound
        {
            private string testProp;

            public string TestProp
            {
                get { return testProp; }
                set
                {
                    Thread.Sleep(1000);
                    testProp = value;
                }
            }

            public int TestMethod1(int input)
            {
                return input+1;
            }

            public int TestMethod2(int? val)
            {
                return val.HasValue ? val.Value + 1 : -1;
            }

            [return:BindValue]
            public TestBound2 TestMethod3(string str)
            {
                return new TestBound2(str);
            }

            [return: BindValue]
            public void TestMethod4(TestDelegate del, string str)
            {
                del(new TestBound2(str));
            }

            [return: BindValue(ExtractPropertyValues = true)]
            public TestBound2 TestMethod5(string str)
            {
                return new TestBound2(str);
            }

            public async Task<string> DelegateTest(Func<string, Task<string>> func)
            {
                return await func("test").ConfigureAwait(false);
            }
        }

        public NodeBindingTests()
        {
            var options = new NodeServicesOptions
            {
                ApplicationStoppingToken = stopTokenSource.Token,
                ProjectPath = AppDomain.CurrentDomain.BaseDirectory,
                NodeInstanceOutputLogger = Mock.Of<ILogger>(),
                DebuggingPort = 9000,
                LaunchWithDebugging = true
            };
            options.UseSocketHosting();
            nodeServices = NodeServicesFactory.CreateNodeServices(options);

            rpcHost = new JsonRpcBindingHost(js => new LineDelimitedJsonConnection(js));
            rpcHost.Repository.AddBinding("test", new TestBound());

            var initTask = nodeServices.InvokeExportAsync<Stream>("binding-init", "initialize", rpcHost.Repository.Objects);
            this.initTask = initTask.ContinueWith(t => (rpcHost.Connection as LineDelimitedJsonConnection)?.Initialize(t.Result, t.Result));

        }

        [Fact]
        public async Task SimpleMethodCallWorks()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<int>("binding-test", "testMethod1", 2);

            Assert.Equal(3, result);
        }

        [Fact]
        public async Task NullableInputTypeWorks()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<int>("binding-test", "testMethod2", 2);

            Assert.Equal(3, result);
        }

        [Fact]
        public async Task DynamicObjectMethodCallWorks()
        {
            await initTask;

            rpcHost.ResolvingBoundObject += (s, args) =>
            {
                if (args.Name == "testObj")
                {
                    args.Disposable = false;
                    args.Object = new TestBound();
                }
            };

            var result = await nodeServices.InvokeExportAsync<int>("binding-test", "dynamic", 3);

            Assert.Equal(4, result);
        }

        [Fact]
        public async Task PropertyWorks()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<string>("binding-test", "testProp", "in");

            Assert.Equal("in2", result);
        }

        [Fact]
        public async Task DelegateCallbackBindingWorks()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<string>("binding-test", "delegateTest");
            
            Assert.Equal("test->JS", result);
        }

        [Fact]
        public async Task MethodResultBound()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<bool>("binding-test", "testMethodResult");

            Assert.True(result);
        }

        [Fact]
        public async Task CallbackParameterBound()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<bool>("binding-test", "testCallbackBinding");

            Assert.True(result);
        }

        [Fact]
        public async Task PropertyValueSet()
        {
            await initTask;

            var result = await nodeServices.InvokeExportAsync<bool>("binding-test", "testPropertyValueSet");

            Assert.True(result);
        }

        public void Dispose()
        {
            stopTokenSource.Cancel();
            nodeServices.Dispose();
        }
    }
}
