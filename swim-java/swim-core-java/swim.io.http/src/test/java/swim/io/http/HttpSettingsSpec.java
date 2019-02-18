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

import java.util.Arrays;
import org.testng.annotations.Test;
import swim.io.ClientAuth;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class HttpSettingsSpec {
  void assertDecodes(Value actualValue, HttpSettings expected) {
    final HttpSettings actual = HttpSettings.form().cast(actualValue);
    assertEquals(actual, expected);
  }

  @Test
  public void decodesStandardSettings() {
    assertDecodes(Record.empty(), HttpSettings.standard());
  }

  @Test
  public void decodesStandardHttpSettings() {
    assertDecodes(Record.of(Record.of(Attr.of("http"))), HttpSettings.standard());
  }

  @Test
  public void decodesHttpSettings() {
    assertDecodes(Record.of(Record.of(Attr.of("http"),
                                      Slot.of("maxMessageSize", 2))),
                  HttpSettings.standard().maxMessageSize(2));
  }

  @Test
  public void decodesHttpAndTlsAndTcpSettings() {
    final HttpSettings settings = HttpSettings.form().cast(
        Record.of(Record.of(Attr.of("http"),
                            Slot.of("maxMessageSize", 2)),
                  Record.of(Attr.of("tls", Record.of(Slot.of("protocol", "TLS"))),
                            Slot.of("clientAuth", "need"),
                            Slot.of("cipherSuites", Record.of("ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-RSA-AES128-GCM-SHA256")),
                            Slot.of("protocols", Record.of("TLSv1.1", "TLSv1.2")),
                            Record.of(Attr.of("keyStore", Record.of(Slot.of("type", "jks"))),
                                      Slot.of("resource", "keystore.jks"),
                                      Slot.of("password", "default")),
                            Record.of(Attr.of("trustStore", Record.of(Slot.of("type", "jks"))),
                                      Slot.of("resource", "cacerts.jks"),
                                      Slot.of("password", "default"))),
                  Record.of(Attr.of("tcp"),
                            Slot.of("keepAlive", true),
                            Slot.of("noDelay", true),
                            Slot.of("receiveBufferSize", 3),
                            Slot.of("sendBufferSize", 5),
                            Slot.of("readBufferSize", 7),
                            Slot.of("writeBufferSize", 11))));
    assertEquals(settings.maxMessageSize(), 2);

    final TlsSettings tlsSettings = settings.tlsSettings();
    assertEquals(tlsSettings.clientAuth(), ClientAuth.NEED);
    assertEquals(tlsSettings.cipherSuites(), Arrays.asList("ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-RSA-AES128-GCM-SHA256"));
    assertEquals(tlsSettings.protocols(), Arrays.asList("TLSv1.1", "TLSv1.2"));
    assertEquals(tlsSettings.sslContext().getProtocol(), "TLS");

    final TcpSettings tcpSettings = settings.tcpSettings();
    assertEquals(tcpSettings, new TcpSettings(true, true, 3, 5, 7, 11));
  }
}
