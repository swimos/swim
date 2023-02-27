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
import swim.codec.ParseException;
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.uri.Uri;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class OriginHeaderTests {

  @Test
  public void parseOriginHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Origin: http://www.example.com\r\n");
    assertInstanceOf(OriginHeader.class, headers.getHeader(OriginHeader.TYPE));
    assertEquals(OriginHeader.of(Uri.parse("http://www.example.com")),
                 headers.getHeader(OriginHeader.TYPE));
    assertEquals("http://www.example.com",
                 headers.get(OriginHeader.TYPE));
    assertEquals(FingerTrieList.of(Uri.parse("http://www.example.com")),
                 headers.getValue(OriginHeader.TYPE));
  }

  @Test
  public void parseOriginHeaders() {
    assertParses(OriginHeader.of(Uri.parse("http://www.example.com")),
                 "Origin: http://www.example.com");
    assertParses(OriginHeader.of(Uri.parse("https://www.example.com:443")),
                 "Origin: https://www.example.com:443");
    assertParses(OriginHeader.of(Uri.parse("http://example1.com"), Uri.parse("http://example2.com")),
                 "Origin: http://example1.com http://example2.com");
    assertParses(OriginHeader.of(Uri.parse("http://example1.com:8080"), Uri.parse("http://example2.com:8081")),
                 "Origin: http://example1.com:8080 http://example2.com:8081");
    assertParses(OriginHeader.empty(),
                 "Origin: null");
  }

  @Test
  public void writeOriginHeaders() {
    assertWrites("Origin: http://www.example.com",
                 OriginHeader.of(Uri.parse("http://www.example.com")));
    assertWrites("Origin: https://www.example.com:443",
                 OriginHeader.of(Uri.parse("https://www.example.com:443")));
    assertWrites("Origin: http://example1.com http://example2.com",
                 OriginHeader.of(Uri.parse("http://example1.com"), Uri.parse("http://example2.com")));
    assertWrites("Origin: http://example1.com:8080 http://example2.com:8081",
                 OriginHeader.of(Uri.parse("http://example1.com:8080"), Uri.parse("http://example2.com:8081")));
    assertWrites("Origin: null",
                 OriginHeader.empty());
  }

  @Test
  public void writeOriginHeadersOmittingPath() {
    assertWrites("Origin: http://www.example.com",
                 OriginHeader.of(Uri.parse("http://www.example.com/")));
  }

  @Test
  public void parseOriginHeadersWithTrailingNullFails() {
    final OriginHeader header = (OriginHeader) HttpHeader.parse("Origin: http://www.example.com null");
    assertThrows(ParseException.class, () -> {
      header.origins();
    });
  }

  @Test
  public void parseOriginHeadersWithNoSchemeFails() {
    final OriginHeader header = (OriginHeader) HttpHeader.parse("Origin: www.example.com");
    assertThrows(ParseException.class, () -> {
      header.origins();
    });
  }

  @Test
  public void parseOriginHeadersWithPathsFails() {
    final OriginHeader header = (OriginHeader) HttpHeader.parse("Origin: http://www.example.com/");
    assertThrows(ParseException.class, () -> {
      header.origins();
    });
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
