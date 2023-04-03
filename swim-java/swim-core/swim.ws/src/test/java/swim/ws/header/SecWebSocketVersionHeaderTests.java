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
import swim.codec.ParseException;
import swim.collections.FingerTrieList;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.ws.WsAssertions;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class SecWebSocketVersionHeaderTests {

  @Test
  public void parseSecWebSocketVersionHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Sec-WebSocket-Version: 13\r\n").getNonNull();
    assertInstanceOf(SecWebSocketVersionHeader.class, headers.getHeader(SecWebSocketVersionHeader.TYPE));
    assertEquals(SecWebSocketVersionHeader.of(13),
                 headers.getHeader(SecWebSocketVersionHeader.TYPE));
    assertEquals("13",
                 headers.get(SecWebSocketVersionHeader.TYPE));
    assertEquals(FingerTrieList.of(13), headers.getValue(SecWebSocketVersionHeader.TYPE));
  }

  @Test
  public void parseSecWebSocketVersionHeaders() {
    assertParses(SecWebSocketVersionHeader.of(13),
                 "Sec-WebSocket-Version: 13");
    assertParses(SecWebSocketVersionHeader.of(13, 0),
                 "Sec-WebSocket-Version: 13, 0");
    assertParses(SecWebSocketVersionHeader.of(0, 13),
                 "Sec-WebSocket-Version: 0, 13");
    assertParses(SecWebSocketVersionHeader.of(13, 25),
                 "Sec-WebSocket-Version: 13, 25");
    assertParses(SecWebSocketVersionHeader.of(13, 8, 255),
                 "Sec-WebSocket-Version: 13, 8, 255");
  }

  @Test
  public void writeSSecWebSocketVersionHeaders() {
    assertWrites("Sec-WebSocket-Version: 13",
                 SecWebSocketVersionHeader.of(13));
    assertWrites("Sec-WebSocket-Version: 13, 0",
                 SecWebSocketVersionHeader.of(13, 0));
    assertWrites("Sec-WebSocket-Version: 0, 13",
                 SecWebSocketVersionHeader.of(0, 13));
    assertWrites("Sec-WebSocket-Version: 13, 25",
                 SecWebSocketVersionHeader.of(13, 25));
    assertWrites("Sec-WebSocket-Version: 13, 8, 255",
                 SecWebSocketVersionHeader.of(13, 8, 255));
  }

  public static void assertParses(HttpHeader expected, String string) {
    WsAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    WsAssertions.assertWrites(expected, header::write);
  }

}
