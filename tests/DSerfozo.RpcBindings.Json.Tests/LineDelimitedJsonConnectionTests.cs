using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using DSerfozo.RpcBindings.Contract.Communication.Model;
using DSerfozo.RpcBindings.Execution.Model;
using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Xunit;

namespace DSerfozo.RpcBindings.Json.Tests
{
    public class LineDelimitedJsonConnectionTests
    {
        [Fact]
        public void MessageRead()
        {
            var connection = new LineDelimitedJsonConnection(new JsonSerializer());
            using (var memStream = new MemoryStream())
            using (var writer = new StreamWriter(memStream))
            {
                writer.Write(@"{""CallbackResult"":{Success: true}}\n");
                writer.Flush();
                memStream.Seek(0, SeekOrigin.Begin);

                var ev = new ManualResetEvent(false);
                RpcResponse<JToken> resp = null;
                connection.Subscribe(response =>
                {
                    resp = response;
                    ev.Set();
                });
                connection.Initialize(memStream, null);

                ev.WaitOne();
                Assert.True(resp.CallbackResult.Success);
            }
        }

        [Fact]
        public void MessageWritten()
        {
            var connection = new LineDelimitedJsonConnection(new JsonSerializer());
            using (var memStreamInput = new MemoryStream())
            using (var memStreamOutput = new MemoryStream())
            using (var streamReader = new StreamReader(memStreamOutput))
            {
                connection.Initialize(memStreamInput, memStreamOutput);

                connection.Send(new RpcRequest<JToken>
                {
                    DeleteCallback = new DeleteCallback
                    {
                        FunctionId = 1
                    }
                });

                memStreamOutput.Seek(0, SeekOrigin.Begin);

                var line = streamReader.ReadLine();
                Assert.Equal(@"{""MethodResult"":null,""CallbackExecution"":null,""DeleteCallback"":{""FunctionId"":1},""PropertyResult"":null,""DynamicObjectResult"":null}", line);
            }
        }
    }
}
