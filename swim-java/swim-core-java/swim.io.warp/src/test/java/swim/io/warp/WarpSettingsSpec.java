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

package swim.io.warp;

import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.io.ClientAuth;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.io.http.HttpSettings;
import swim.io.ws.WsSettings;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class WarpSettingsSpec {
  void assertDecodes(Value actualValue, WarpSettings expected) {
    final WarpSettings actual = WarpSettings.form().cast(actualValue);
    assertEquals(actual, expected);
  }

  @Test
  public void decodesStandardSettings() {
    assertDecodes(Record.empty(), WarpSettings.standard());
  }

  @Test
  public void decodesWarpWebSocketHttpTlsAndTcpSettings() {
    final WarpSettings settings = WarpSettings.form().cast(
        Record.of(Record.of(Attr.of("websocket"),
                            Slot.of("maxFrameSize", 2),
                            Slot.of("maxMessageSize", 3)),
                  Record.of(Attr.of("http"),
                            Slot.of("maxMessageSize", 5)),
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
                            Slot.of("receiveBufferSize", 7),
                            Slot.of("sendBufferSize", 11),
                            Slot.of("readBufferSize", 13),
                            Slot.of("writeBufferSize", 17))));

    final WsSettings wsSettings = settings.wsSettings();
    assertEquals(wsSettings.maxFrameSize(), 2);
    assertEquals(wsSettings.maxMessageSize(), 3);

    final HttpSettings httpSettings = settings.httpSettings();
    assertEquals(httpSettings.maxMessageSize(), 5);

    final TlsSettings tlsSettings = settings.tlsSettings();
    assertEquals(tlsSettings.clientAuth(), ClientAuth.NEED);
    assertEquals(tlsSettings.cipherSuites(), FingerTrieSeq.of("ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-RSA-AES128-GCM-SHA256"));
    assertEquals(tlsSettings.protocols(), FingerTrieSeq.of("TLSv1.1", "TLSv1.2"));
    assertEquals(tlsSettings.sslContext().getProtocol(), "TLS");

    final TcpSettings tcpSettings = settings.tcpSettings();
    assertEquals(tcpSettings, new TcpSettings(true, true, 7, 11, 13, 17));
  }
}
