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

import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.io.ClientAuth;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.io.http.HttpSettings;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class WsSettingsSpec {
  @Test
  public void decodeStandardSettings() {
    assertDecodes(Record.empty(), WsSettings.standard());
    assertDecodes(Record.of(Record.of(Attr.of("websocket"))), WsSettings.standard());
  }

  @Test
  public void decodeCustomSettings() {
    assertDecodes(Record.of(Record.of(Attr.of("websocket"),
                                      Slot.of("maxFrameSize", 2048),
                                      Slot.of("maxMessageSize", 4096),
                                      Slot.of("serverCompressionLevel", 7),
                                      Slot.of("clientCompressionLevel", 9),
                                      Slot.of("serverNoContextTakeover", true),
                                      Slot.of("clientNoContextTakeover", true),
                                      Slot.of("serverMaxWindowBits", 11),
                                      Slot.of("clientMaxWindowBits", 13))),
                  WsSettings.standard().maxFrameSize(2048)
                                       .maxMessageSize(4096)
                                       .serverCompressionLevel(7)
                                       .clientCompressionLevel(9)
                                       .serverNoContextTakeover(true)
                                       .clientNoContextTakeover(true)
                                       .serverMaxWindowBits(11)
                                       .clientMaxWindowBits(13));
  }

  @Test
  public void decodesWsHttpTlsAndTcpSettings() {
    final WsSettings settings = WsSettings.form().cast(
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
    assertEquals(settings.maxFrameSize(), 2);
    assertEquals(settings.maxMessageSize(), 3);

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

  static void assertDecodes(Value actualValue, WsSettings expected) {
    final WsSettings actual = WsSettings.form().cast(actualValue);
    assertEquals(actual, expected);
  }
}
