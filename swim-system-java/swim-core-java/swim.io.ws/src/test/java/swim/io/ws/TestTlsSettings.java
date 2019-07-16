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

package swim.io.ws;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.SecureRandom;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import swim.io.ClientAuth;
import swim.io.IpSettings;
import swim.io.StationException;
import swim.io.TlsSettings;
import swim.io.http.HttpSettings;

public final class TestTlsSettings {
  private TestTlsSettings() {
    // stub
  }

  private static TlsSettings tlsSettings;
  private static IpSettings ipSettings;
  private static HttpSettings httpSettings;
  private static WsSettings wsSettings;

  public static TlsSettings tlsSettings() {
    if (tlsSettings == null) {
      try {
        final KeyStore keystore = KeyStore.getInstance("jks");
        final InputStream keystoreStream = TestTlsSettings.class.getResourceAsStream("/keystore.jks");
        final char[] keystorePassword = "default".toCharArray();
        try {
          keystore.load(keystoreStream, keystorePassword);
        } finally {
          keystoreStream.close();
        }

        final KeyStore cacerts = KeyStore.getInstance("jks");
        final InputStream cacertsStream = TestTlsSettings.class.getResourceAsStream("/cacerts.jks");
        final char[] cacertsPassword = "default".toCharArray();
        try {
          cacerts.load(cacertsStream, cacertsPassword);
        } finally {
          cacertsStream.close();
        }

        final KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance("SunX509");
        keyManagerFactory.init(keystore, keystorePassword);

        final TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance("SunX509");
        trustManagerFactory.init(cacerts);

        final SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(keyManagerFactory.getKeyManagers(), trustManagerFactory.getTrustManagers(), new SecureRandom());

        tlsSettings = new TlsSettings(sslContext, ClientAuth.NONE, null, null);
      } catch (IOException | GeneralSecurityException error) {
        throw new StationException(error);
      }
    }
    return tlsSettings;
  }

  public static IpSettings ipSettings() {
    if (ipSettings == null) {
      ipSettings = IpSettings.from(tlsSettings());
    }
    return ipSettings;
  }

  public static HttpSettings httpSettings() {
    if (httpSettings == null) {
      httpSettings = HttpSettings.from(ipSettings());
    }
    return httpSettings;
  }

  public static WsSettings wsSettings() {
    if (wsSettings == null) {
      wsSettings = WsSettings.from(httpSettings());
    }
    return wsSettings;
  }
}
