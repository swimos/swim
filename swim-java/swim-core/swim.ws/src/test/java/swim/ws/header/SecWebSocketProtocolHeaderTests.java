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

package swim.ws.header;

import org.junit.jupiter.api.Test;
import swim.collections.FingerTrieList;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.ws.WsAssertions;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class SecWebSocketProtocolHeaderTests {

  @Test
  public void parseSecWebSocketProtocolHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Sec-WebSocket-Protocol: chat\r\n");
    assertInstanceOf(SecWebSocketProtocolHeader.class, headers.getHeader(SecWebSocketProtocolHeader.TYPE));
    assertEquals(SecWebSocketProtocolHeader.of(FingerTrieList.of("chat")),
                 headers.getHeader(SecWebSocketProtocolHeader.TYPE));
    assertEquals("chat",
                 headers.get(SecWebSocketProtocolHeader.TYPE));
    assertEquals(FingerTrieList.of("chat"), headers.getValue(SecWebSocketProtocolHeader.TYPE));
  }

  @Test
  public void parseSecWebSocketProtocolHeaders() {
    assertParses(SecWebSocketProtocolHeader.of(FingerTrieList.of("chat")),
                 "Sec-WebSocket-Protocol: chat");
    assertParses(SecWebSocketProtocolHeader.of(FingerTrieList.of("chat", "superchat")),
                 "Sec-WebSocket-Protocol: chat, superchat");
  }

  @Test
  public void writeSecWebSocketProtocolHeaders() {
    assertWrites("Sec-WebSocket-Protocol: chat",
                 SecWebSocketProtocolHeader.of(FingerTrieList.of("chat")));
    assertWrites("Sec-WebSocket-Protocol: chat, superchat",
                 SecWebSocketProtocolHeader.of(FingerTrieList.of("chat", "superchat")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    WsAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    WsAssertions.assertWrites(expected, header::write);
  }

}
