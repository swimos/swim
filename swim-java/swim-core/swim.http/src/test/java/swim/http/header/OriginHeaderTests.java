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
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.uri.Uri;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class OriginHeaderTests {

  @Test
  public void parseOriginHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Origin: http://www.example.com\r\n").getNonNull();
    assertInstanceOf(OriginHeader.class, headers.getHeader(OriginHeader.TYPE));
    assertEquals(OriginHeader.of(Uri.parse("http://www.example.com").getNonNull()),
                 headers.getHeader(OriginHeader.TYPE));
    assertEquals("http://www.example.com",
                 headers.get(OriginHeader.TYPE));
    assertEquals(FingerTrieList.of(Uri.parse("http://www.example.com").getNonNull()),
                 headers.getValue(OriginHeader.TYPE));
  }

  @Test
  public void parseOriginHeaders() throws ParseException {
    assertParses(OriginHeader.of(Uri.parse("http://www.example.com").getNonNull()),
                 "Origin: http://www.example.com");
    assertParses(OriginHeader.of(Uri.parse("https://www.example.com:443").getNonNull()),
                 "Origin: https://www.example.com:443");
    assertParses(OriginHeader.of(Uri.parse("http://example1.com").getNonNull(),
                                 Uri.parse("http://example2.com").getNonNull()),
                 "Origin: http://example1.com http://example2.com");
    assertParses(OriginHeader.of(Uri.parse("http://example1.com:8080").getNonNull(),
                                 Uri.parse("http://example2.com:8081").getNonNull()),
                 "Origin: http://example1.com:8080 http://example2.com:8081");
    assertParses(OriginHeader.empty(),
                 "Origin: null");
  }

  @Test
  public void writeOriginHeaders() throws ParseException {
    assertWrites("Origin: http://www.example.com",
                 OriginHeader.of(Uri.parse("http://www.example.com").getNonNull()));
    assertWrites("Origin: https://www.example.com:443",
                 OriginHeader.of(Uri.parse("https://www.example.com:443").getNonNull()));
    assertWrites("Origin: http://example1.com http://example2.com",
                 OriginHeader.of(Uri.parse("http://example1.com").getNonNull(),
                                 Uri.parse("http://example2.com").getNonNull()));
    assertWrites("Origin: http://example1.com:8080 http://example2.com:8081",
                 OriginHeader.of(Uri.parse("http://example1.com:8080").getNonNull(),
                                 Uri.parse("http://example2.com:8081").getNonNull()));
    assertWrites("Origin: null",
                 OriginHeader.empty());
  }

  @Test
  public void writeOriginHeadersOmittingPath() throws ParseException {
    assertWrites("Origin: http://www.example.com",
                 OriginHeader.of(Uri.parse("http://www.example.com/").getNonNull()));
  }

  @Test
  public void parseOriginHeadersWithTrailingNullFails() throws ParseException {
    final OriginHeader header = (OriginHeader) HttpHeader.parse("Origin: http://www.example.com null").getNonNull();
    assertThrows(HttpException.class, () -> {
      header.origins();
    });
  }

  @Test
  public void parseOriginHeadersWithNoSchemeFails() throws ParseException {
    final OriginHeader header = (OriginHeader) HttpHeader.parse("Origin: www.example.com").getNonNull();
    assertThrows(HttpException.class, () -> {
      header.origins();
    });
  }

  @Test
  public void parseOriginHeadersWithPathsFails() throws ParseException {
    final OriginHeader header = (OriginHeader) HttpHeader.parse("Origin: http://www.example.com/").getNonNull();
    assertThrows(HttpException.class, () -> {
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
