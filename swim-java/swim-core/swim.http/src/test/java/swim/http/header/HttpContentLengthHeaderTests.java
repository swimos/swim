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
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpContentLengthHeaderTests {

  @Test
  public void parseContentLengthHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Content-Length: 42\r\n");
    assertInstanceOf(HttpContentLengthHeader.class, headers.getHeader(HttpHeader.CONTENT_LENGTH));
    assertEquals(HttpContentLengthHeader.create(42L), headers.getHeader(HttpHeader.CONTENT_LENGTH));
    assertEquals("42", headers.get(HttpHeader.CONTENT_LENGTH));
    assertEquals(42L, headers.getValue(HttpHeader.CONTENT_LENGTH));
  }

  @Test
  public void parseContentLengthHeaders() {
    assertParses(HttpContentLengthHeader.create(0L), "Content-Length: 0");
    assertParses(HttpContentLengthHeader.create(1L), "Content-Length: 1");
    assertParses(HttpContentLengthHeader.create(10L), "content-length: 10");
    assertParses(HttpContentLengthHeader.create(9223372036854775807L), "CONTENT-LENGTH: 9223372036854775807");
  }

  @Test
  public void writeContentLengthHeaders() {
    assertWrites("Content-Length: 0", HttpContentLengthHeader.create(0L));
    assertWrites("Content-Length: 1", HttpContentLengthHeader.create(1L));
    assertWrites("Content-Length: 10", HttpContentLengthHeader.create(10L));
    assertWrites("Content-Length: 9223372036854775807", HttpContentLengthHeader.create(9223372036854775807L));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
