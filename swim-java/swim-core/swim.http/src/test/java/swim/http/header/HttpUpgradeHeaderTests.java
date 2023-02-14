// Copyright 2015-2022 Swim.inc
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

package swim.http.header;

import org.junit.jupiter.api.Test;
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.http.HttpProtocol;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpUpgradeHeaderTests {

  @Test
  public void parseUpgradeHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Upgrade: websocket\r\n");
    assertInstanceOf(HttpUpgradeHeader.class, headers.getHeader(HttpHeader.UPGRADE));
    assertEquals(HttpUpgradeHeader.create(HttpProtocol.websocket()), headers.getHeader(HttpHeader.UPGRADE));
    assertEquals("websocket", headers.get(HttpHeader.UPGRADE));
    assertEquals(FingerTrieList.of(HttpProtocol.websocket()), headers.getValue(HttpHeader.UPGRADE));
  }

  @Test
  public void parseUpgradeHeaders() {
    assertParses(HttpUpgradeHeader.create(HttpProtocol.websocket()), "Upgrade: websocket");
    assertParses(HttpUpgradeHeader.create(HttpProtocol.h2c(), HttpProtocol.create("SHTTP", "1.3"), HttpProtocol.create("IRC", "6.9"), HttpProtocol.create("RTA", "x11")),
                 "Upgrade: h2c, SHTTP/1.3, IRC/6.9, RTA/x11");
  }

  @Test
  public void writeUpgradeHeaders() {
    assertWrites("Upgrade: websocket", HttpUpgradeHeader.create(HttpProtocol.websocket()));
    assertWrites("Upgrade: h2c, SHTTP/1.3, IRC/6.9, RTA/x11",
                 HttpUpgradeHeader.create(HttpProtocol.h2c(), HttpProtocol.create("SHTTP", "1.3"), HttpProtocol.create("IRC", "6.9"), HttpProtocol.create("RTA", "x11")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
