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
import swim.codec.MediaType;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class ContentTypeHeaderTests {

  @Test
  public void parseContentTypeHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Content-Type: application/json\r\n");
    assertInstanceOf(ContentTypeHeader.class, headers.getHeader(ContentTypeHeader.TYPE));
    assertEquals(ContentTypeHeader.of(MediaType.of("application", "json")),
                 headers.getHeader(ContentTypeHeader.TYPE));
    assertEquals("application/json",
                 headers.get(ContentTypeHeader.TYPE));
    assertEquals(MediaType.of("application", "json"),
                 headers.getValue(ContentTypeHeader.TYPE));
  }

  @Test
  public void parseContentTypeHeaders() {
    assertParses(ContentTypeHeader.of(MediaType.of("text", "plain")),
                 "Content-Type: text/plain");
    assertParses(ContentTypeHeader.of(MediaType.of("text", "html").withParam("charset", "UTF-8")),
                 "Content-Type: text/html; charset=UTF-8");
  }

  @Test
  public void writeContentTypeHeaders() {
    assertWrites("Content-Type: text/plain",
                 ContentTypeHeader.of(MediaType.of("text", "plain")));
    assertWrites("Content-Type: text/html; charset=UTF-8",
                 ContentTypeHeader.of(MediaType.of("text", "html").withParam("charset", "UTF-8")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
