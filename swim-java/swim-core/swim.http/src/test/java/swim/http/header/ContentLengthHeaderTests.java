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

package swim.http.header;

import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import swim.http.HttpAssertions;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class ContentLengthHeaderTests {

  @Test
  public void parseContentLengthHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Content-Length: 42\r\n").getNonNull();
    assertInstanceOf(ContentLengthHeader.class, headers.getHeader(ContentLengthHeader.TYPE));
    assertEquals(ContentLengthHeader.of(42L),
                 headers.getHeader(ContentLengthHeader.TYPE));
    assertEquals("42",
                 headers.get(ContentLengthHeader.TYPE));
    assertEquals(42L,
                 headers.getValue(ContentLengthHeader.TYPE));
  }

  @Test
  public void parseContentLengthHeaders() {
    assertParses(ContentLengthHeader.of(0L),
                 "Content-Length: 0");
    assertParses(ContentLengthHeader.of(1L),
                 "Content-Length: 1");
    assertParses(ContentLengthHeader.of(10L),
                 "content-length: 10");
    assertParses(ContentLengthHeader.of(9223372036854775807L),
                 "CONTENT-LENGTH: 9223372036854775807");
  }

  @Test
  public void writeContentLengthHeaders() {
    assertWrites("Content-Length: 0",
                 ContentLengthHeader.of(0L));
    assertWrites("Content-Length: 1",
                 ContentLengthHeader.of(1L));
    assertWrites("Content-Length: 10",
                 ContentLengthHeader.of(10L));
    assertWrites("Content-Length: 9223372036854775807",
                 ContentLengthHeader.of(9223372036854775807L));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
