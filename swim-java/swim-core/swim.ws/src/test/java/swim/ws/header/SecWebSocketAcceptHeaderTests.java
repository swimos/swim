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
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.ws.WsAssertions;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class SecWebSocketAcceptHeaderTests {

  @Test
  public void parseSecWebSocketAcceptHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n");
    assertInstanceOf(SecWebSocketAcceptHeader.class, headers.getHeader(SecWebSocketAcceptHeader.TYPE));
    assertEquals(SecWebSocketAcceptHeader.of("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                 headers.getHeader(SecWebSocketAcceptHeader.TYPE));
    assertEquals("s3pPLMBiTxaQ9kYGzzhZRbK+xOo=",
                 headers.get(SecWebSocketAcceptHeader.TYPE));
    assertArrayEquals(new byte[] {(byte) 0xB3, (byte) 0x7A, (byte) 0x4F, (byte) 0x2C, (byte) 0xC0, (byte) 0x62, (byte) 0x4F, (byte) 0x16, (byte) 0x90, (byte) 0xF6, (byte) 0x46, (byte) 0x6, (byte) 0xCF, (byte) 0x38, (byte) 0x59, (byte) 0x45, (byte) 0xB2, (byte) 0xBE, (byte) 0xC4, (byte) 0xEA},
                      headers.getValue(SecWebSocketAcceptHeader.TYPE));
  }

  @Test
  public void parseSecWebSocketAcceptHeaders() {
    assertParses(SecWebSocketAcceptHeader.of("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                 "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=");
  }

  @Test
  public void writeSecWebSocketAcceptHeaders() {
    assertWrites("Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=",
                 SecWebSocketAcceptHeader.of("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="));
  }

  public static void assertParses(HttpHeader expected, String string) {
    WsAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    WsAssertions.assertWrites(expected, header::write);
  }

}
