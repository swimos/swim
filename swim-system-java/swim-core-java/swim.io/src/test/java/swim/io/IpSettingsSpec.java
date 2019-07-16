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

import java.util.Arrays;
import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class IpSettingsSpec {
  void assertDecodes(Value actualValue, IpSettings expected) {
    final IpSettings actual = IpSettings.form().cast(actualValue);
    assertEquals(actual, expected);
  }

  @Test
  public void decodesStandardSettings() {
    assertDecodes(Record.empty(), IpSettings.standard());
  }

  @Test
  public void decodesStandardTcpSettings() {
    assertDecodes(Record.of(Record.of(Attr.of("tcp"))), IpSettings.standard());
  }

  @Test
  public void decodesTcpSettings() {
    assertDecodes(Record.of(Record.of(Attr.of("tcp"),
                                      Slot.of("keepAlive", true),
                                      Slot.of("noDelay", true),
                                      Slot.of("receiveBufferSize", 2),
                                      Slot.of("sendBufferSize", 3),
                                      Slot.of("readBufferSize", 5),
                                      Slot.of("writeBufferSize", 7))),
                  IpSettings.from(new TcpSettings(true, true, 2, 3, 5, 7)));
  }

  @Test
  public void decodesStandardTlsSettings() {
    final IpSettings settings = IpSettings.form().cast(Record.of(Record.of(Attr.of("tls"))));
    assertEquals(settings.tcpSettings(), TcpSettings.standard());
  }

  @Test
  public void decodesTlsAndTcpSettings() {
    final IpSettings settings = IpSettings.form().cast(
        Record.of(Record.of(Attr.of("tls", Record.of(Slot.of("protocol", "TLS"))),
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
                            Slot.of("receiveBufferSize", 2),
                            Slot.of("sendBufferSize", 3),
                            Slot.of("readBufferSize", 5),
                            Slot.of("writeBufferSize", 7))));

    final TlsSettings tlsSettings = settings.tlsSettings();
    assertEquals(tlsSettings.clientAuth(), ClientAuth.NEED);
    assertEquals(tlsSettings.cipherSuites(), Arrays.asList(new String[] {"ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-RSA-AES128-GCM-SHA256"}));
    assertEquals(tlsSettings.protocols(), Arrays.asList(new String[] {"TLSv1.1", "TLSv1.2"}));
    assertEquals(tlsSettings.sslContext().getProtocol(), "TLS");

    final TcpSettings tcpSettings = settings.tcpSettings();
    assertEquals(tcpSettings, new TcpSettings(true, true, 2, 3, 5, 7));
  }
}
