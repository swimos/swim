package swim.io.http;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.concurrent.Theater;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.header.Host;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import static org.testng.Assert.assertEquals;

public class SecureHttpClientSpec {

  @Test
  public void testGithub() {
    connectExternalServer("https://github.com/swimos");
  }

  @Test
  public void testGoogleJwks() {
    connectExternalServer("https://www.googleapis.com/oauth2/v3/certs");
  }

  @Test
  public void testGoogleOpenId() {
    connectExternalServer("https://accounts.google.com/.well-known/openid-configuration");
  }

  @Test
  public void testSwimOS() {
    connectExternalServer("https://www.swimos.org/");
  }

  private void connectExternalServer(String url) {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientRequest = new CountDownLatch(1);
    final CountDownLatch clientWillRespond = new CountDownLatch(1);
    final CountDownLatch clientDidRespond = new CountDownLatch(1);
    final Uri uri = Uri.parse(url);
    final AbstractHttpRequester<String> requester = new AbstractHttpRequester<String>() {
      @Override
      public void doRequest() {
        final Uri requestUri = Uri.from(uri.path());
        final HttpRequest<?> request = HttpRequest.get(requestUri, Host.from(uri.authority()));
        writeRequest(request);
      }

      @Override
      public void didRequest(HttpRequest<?> request) {
        clientRequest.countDown();
      }

      @Override
      public void willRespond(HttpResponse<?> response) {
        clientWillRespond.countDown();
      }

      @Override
      public void didRespond(HttpResponse<String> response) {
        assertEquals(response.status(), HttpStatus.OK);
        clientDidRespond.countDown();
      }
    };
    final AbstractHttpClient client = new AbstractHttpClient() {
      @Override
      public void didConnect() {
        super.didConnect();
        doRequest(requester);
      }

    };
    try {
      stage.start();
      endpoint.start();
      final UriAuthority authority = uri.authority();
      final String address = authority.hostAddress();
      int port = authority.portNumber();
      if (port == 0) {
        port = 443;
      }
      endpoint.connectHttps(address, port, client, HttpSettings.standard());
      clientRequest.await(2, TimeUnit.SECONDS);
      clientWillRespond.await(2, TimeUnit.SECONDS);
      clientDidRespond.await(5, TimeUnit.SECONDS);
      assertEquals(clientRequest.getCount(), 0, "Client didRequest not invoked");
      assertEquals(clientDidRespond.getCount(), 0, "Client didRespond not invoked");
      assertEquals(clientWillRespond.getCount(), 0, "Client wilLRespond not invoked");
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      endpoint.stop();
      stage.stop();
    }
  }

}
