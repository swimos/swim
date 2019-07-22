// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.io.http;

import java.util.concurrent.CountDownLatch;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Utf8;
import swim.concurrent.Theater;
import swim.http.HttpChunked;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.MediaType;
import swim.io.IpServiceRef;
import swim.io.IpSocketRef;
import swim.uri.Uri;
import static org.testng.Assert.assertEquals;

public abstract class HttpSocketBehaviors {
  protected abstract IpServiceRef bind(HttpEndpoint endpoint, HttpService service);

  protected abstract IpSocketRef connect(HttpEndpoint endpoint, HttpClient client);

  @Test
  public void testRequestResponse() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientRequest = new CountDownLatch(1);
    final CountDownLatch clientResponse = new CountDownLatch(1);
    final CountDownLatch serverRequest = new CountDownLatch(1);
    final CountDownLatch serverResponse = new CountDownLatch(1);
    final AbstractHttpRequester<String> requester = new AbstractHttpRequester<String>() {
      @Override
      public void doRequest() {
        writeRequest(HttpRequest.post(Uri.parse("/")).body("clientToServer"));
      }
      @Override
      public void didRequest(HttpRequest<?> request) {
        clientRequest.countDown();
      }
      @Override
      public void didRespond(HttpResponse<String> response) {
        assertEquals(response.entity().get(), "serverToClient");
        clientResponse.countDown();
      }
    };
    final AbstractHttpClient client = new AbstractHttpClient() {
      @Override
      public void didConnect() {
        super.didConnect();
        doRequest(requester);
      }
    };
    final AbstractHttpResponder<String> responder = new AbstractHttpResponder<String>() {
      @Override
      public void doRespond(HttpRequest<String> request) {
        assertEquals(request.entity().get(), "clientToServer");
        serverRequest.countDown();
        writeResponse(HttpResponse.from(HttpStatus.OK).body("serverToClient"));
      }
      @Override
      public void didRespond(HttpResponse<?> response) {
        serverResponse.countDown();
      }
    };
    final AbstractHttpServer server = new AbstractHttpServer() {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> request) {
        return responder;
      }
    };
    final AbstractHttpService service = new AbstractHttpService() {
      @Override
      public HttpServer createServer() {
        return server;
      }
    };
    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientRequest.await();
      clientResponse.await();
      serverRequest.await();
      serverResponse.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testPipelinedRequestResponse() {
    final int requestCount = 10;
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientRequest = new CountDownLatch(requestCount);
    final CountDownLatch clientResponse = new CountDownLatch(requestCount);
    final CountDownLatch serverRequest = new CountDownLatch(requestCount);
    final CountDownLatch serverResponse = new CountDownLatch(requestCount);
    final AbstractHttpClient client = new AbstractHttpClient() {
      @Override
      public void didConnect() {
        super.didConnect();
        for (int i = 0; i < requestCount; i += 1) {
          doRequest(new AbstractHttpRequester<String>() {
            @Override
            public void doRequest() {
              writeRequest(HttpRequest.post(Uri.parse("/")).body("clientToServer"));
            }
            @Override
            public void didRequest(HttpRequest<?> request) {
              clientRequest.countDown();
            }
            @Override
            public void didRespond(HttpResponse<String> response) {
              assertEquals(response.entity().get(), "serverToClient");
              clientResponse.countDown();
            }
          });
        }
      }
    };
    final AbstractHttpServer server = new AbstractHttpServer() {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> request) {
        return new AbstractHttpResponder<String>() {
          @Override
          public void doRespond(HttpRequest<String> request) {
            assertEquals(request.entity().get(), "clientToServer");
            serverRequest.countDown();
            writeResponse(HttpResponse.from(HttpStatus.OK).body("serverToClient"));
          }
          @Override
          public void didRespond(HttpResponse<?> response) {
            serverResponse.countDown();
          }
        };
      }
    };
    final AbstractHttpService service = new AbstractHttpService() {
      @Override
      public HttpServer createServer() {
        return server;
      }
    };
    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientRequest.await();
      clientResponse.await();
      serverRequest.await();
      serverResponse.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testChunkedRequestResponse() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientRequest = new CountDownLatch(1);
    final CountDownLatch clientResponse = new CountDownLatch(1);
    final CountDownLatch serverRequest = new CountDownLatch(1);
    final CountDownLatch serverResponse = new CountDownLatch(1);
    final AbstractHttpRequester<String> requester = new AbstractHttpRequester<String>() {
      @Override
      public void doRequest() {
        writeRequest(HttpRequest.post(Uri.parse("/"))
            .content(HttpChunked.from(Utf8.stringWriter("clientTo").andThen(Utf8.stringWriter("Server")),
                                      MediaType.textPlain())));
      }
      @Override
      public void didRequest(HttpRequest<?> request) {
        clientRequest.countDown();
      }
      @Override
      public void didRespond(HttpResponse<String> response) {
        assertEquals(response.entity().get(), "serverToClient");
        clientResponse.countDown();
      }
    };
    final AbstractHttpClient client = new AbstractHttpClient() {
      @Override
      public void didConnect() {
        super.didConnect();
        doRequest(requester);
      }
    };
    final AbstractHttpResponder<String> responder = new AbstractHttpResponder<String>() {
      @Override
      public void doRespond(HttpRequest<String> request) {
        assertEquals(request.entity().get(), "clientToServer");
        serverRequest.countDown();
        writeResponse(HttpResponse.from(HttpStatus.OK)
            .content(HttpChunked.from(Utf8.stringWriter("serverTo").andThen(Utf8.stringWriter("Client")),
                                       MediaType.textPlain())));
      }
      @Override
      public void didRespond(HttpResponse<?> response) {
        serverResponse.countDown();
      }
    };
    final AbstractHttpServer server = new AbstractHttpServer() {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> request) {
        return responder;
      }
    };
    final AbstractHttpService service = new AbstractHttpService() {
      @Override
      public HttpServer createServer() {
        return server;
      }
    };
    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientRequest.await();
      clientResponse.await();
      serverRequest.await();
      serverResponse.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }
}
