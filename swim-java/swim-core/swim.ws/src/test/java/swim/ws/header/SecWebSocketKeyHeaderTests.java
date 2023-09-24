// Copyright 2015-2023 Nstream, inc.
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
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.ws.WsAssertions;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class SecWebSocketKeyHeaderTests {

  @Test
  public void parseSecWebSocketKeyHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n").getNonNull();
    assertInstanceOf(SecWebSocketKeyHeader.class, headers.getHeader(SecWebSocketKeyHeader.TYPE));
    assertEquals(SecWebSocketKeyHeader.of("dGhlIHNhbXBsZSBub25jZQ=="),
                 headers.getHeader(SecWebSocketKeyHeader.TYPE));
    assertEquals("dGhlIHNhbXBsZSBub25jZQ==",
                 headers.get(SecWebSocketKeyHeader.TYPE));
    assertArrayEquals(new byte[] {(byte) 0x74, (byte) 0x68, (byte) 0x65, (byte) 0x20, (byte) 0x73, (byte) 0x61, (byte) 0x6D, (byte) 0x70, (byte) 0x6C, (byte) 0x65, (byte) 0x20, (byte) 0x6E, (byte) 0x6F, (byte) 0x6E, (byte) 0x63, (byte) 0x65},
                      headers.getValue(SecWebSocketKeyHeader.TYPE));
  }

  @Test
  public void parseSecWebSocketKeyHeaders() {
    assertParses(SecWebSocketKeyHeader.of("dGhlIHNhbXBsZSBub25jZQ=="),
                 "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==");
  }

  @Test
  public void writeSecWebSocketKeyHeaders() {
    assertWrites("Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==",
                 SecWebSocketKeyHeader.of("dGhlIHNhbXBsZSBub25jZQ=="));
  }

  public static void assertParses(HttpHeader expected, String string) {
    WsAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    WsAssertions.assertWrites(expected, header::write);
  }

}
