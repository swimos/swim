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
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.uri.UriAuthority;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class HttpHostHeaderTests {

  @Test
  public void parseHostHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Host: www.example.com\r\n");
    assertInstanceOf(HttpHostHeader.class, headers.getHeader(HttpHeader.HOST));
    assertEquals(HttpHostHeader.create(UriAuthority.parse("www.example.com")), headers.getHeader(HttpHeader.HOST));
    assertEquals("www.example.com", headers.get(HttpHeader.HOST));
    assertEquals(UriAuthority.parse("www.example.com"), headers.getValue(HttpHeader.HOST));
  }

  @Test
  public void parseHostHeaders() {
    assertParses(HttpHostHeader.create(UriAuthority.parse("example.com")), "Host: example.com");
    assertParses(HttpHostHeader.create(UriAuthority.parse("example.com:80")), "Host: example.com:80");
    assertParses(HttpHostHeader.create(UriAuthority.parse("127.0.0.1")), "Host: 127.0.0.1");
    assertParses(HttpHostHeader.create(UriAuthority.parse("127.0.0.1:8080")), "Host: 127.0.0.1:8080");
  }

  @Test
  public void writeHostHeaders() {
    assertWrites("Host: example.com", HttpHostHeader.create(UriAuthority.parse("example.com")));
    assertWrites("Host: example.com:80", HttpHostHeader.create(UriAuthority.parse("example.com:80")));
    assertWrites("Host: 127.0.0.1", HttpHostHeader.create(UriAuthority.parse("127.0.0.1")));
    assertWrites("Host: 127.0.0.1:8080", HttpHostHeader.create(UriAuthority.parse("127.0.0.1:8080")));
  }

  @Test
  public void writeHostHeadersOmittingUser() {
    assertWrites("Host: www.example.com:8080",
                 HttpHostHeader.create(UriAuthority.parse("user:pass@www.example.com:8080")));
  }

  @Test
  public void parseHostHeadersWithSchemesFails() {
    final HttpHostHeader header = (HttpHostHeader) HttpHeader.parse("Host: http://www.example.com");
    assertThrows(ParseException.class, () -> {
      header.authority();
    });
  }

  @Test
  public void parseHostHeadersWithPathsFails() {
    final HttpHostHeader header = (HttpHostHeader) HttpHeader.parse("Host: www.example.com/");
    assertThrows(ParseException.class, () -> {
      header.authority();
    });
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
