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

package swim.io;

import java.util.concurrent.CountDownLatch;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.concurrent.Theater;
import static org.testng.Assert.assertEquals;

public abstract class SecureIpModemBehaviors extends IpModemBehaviors {
  @Test
  public void testSecure() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientSecure = new CountDownLatch(1);
    final CountDownLatch serverSecure = new CountDownLatch(1);
    final CountDownLatch serverBind = new CountDownLatch(1);
    final AbstractIpModem<Object, Object> client = new AbstractIpModem<Object, Object>() {
      @Override
      public void didSecure() {
        clientSecure.countDown();
      }
    };
    final AbstractIpModem<Object, Object> server = new AbstractIpModem<Object, Object>() {
      @Override
      public void didSecure() {
        serverSecure.countDown();
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
      @Override
      public void didBind() {
        serverBind.countDown();
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      serverBind.await();
      connect(endpoint, client);
      serverSecure.await();
      clientSecure.await();
      assertEquals(client.securityProtocol(), server.securityProtocol());
      assertEquals(client.cipherSuite(), server.cipherSuite());
      assertEquals(client.localPrincipal(), server.remotePrincipal());
      assertEquals(client.localCertificates(), server.remoteCertificates());
      assertEquals(client.remotePrincipal(), server.localPrincipal());
      assertEquals(client.remoteCertificates(), server.localCertificates());
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }
}
