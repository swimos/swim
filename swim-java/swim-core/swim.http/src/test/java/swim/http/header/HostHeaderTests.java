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
import swim.uri.UriAuthority;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class HostHeaderTests {

  @Test
  public void parseHostHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Host: www.example.com\r\n").getNonNull();
    assertInstanceOf(HostHeader.class, headers.getHeader(HostHeader.TYPE));
    assertEquals(HostHeader.of(UriAuthority.parse("www.example.com").getNonNull()),
                 headers.getHeader(HostHeader.TYPE));
    assertEquals("www.example.com",
                 headers.get(HostHeader.TYPE));
    assertEquals(UriAuthority.parse("www.example.com").getNonNull(),
                 headers.getValue(HostHeader.TYPE));
  }

  @Test
  public void parseHostHeaders() throws ParseException {
    assertParses(HostHeader.of(UriAuthority.parse("example.com").getNonNull()),
                 "Host: example.com");
    assertParses(HostHeader.of(UriAuthority.parse("example.com:80").getNonNull()),
                 "Host: example.com:80");
    assertParses(HostHeader.of(UriAuthority.parse("127.0.0.1").getNonNull()),
                 "Host: 127.0.0.1");
    assertParses(HostHeader.of(UriAuthority.parse("127.0.0.1:8080").getNonNull()),
                 "Host: 127.0.0.1:8080");
  }

  @Test
  public void writeHostHeaders() throws ParseException {
    assertWrites("Host: example.com",
                 HostHeader.of(UriAuthority.parse("example.com").getNonNull()));
    assertWrites("Host: example.com:80",
                 HostHeader.of(UriAuthority.parse("example.com:80").getNonNull()));
    assertWrites("Host: 127.0.0.1",
                 HostHeader.of(UriAuthority.parse("127.0.0.1").getNonNull()));
    assertWrites("Host: 127.0.0.1:8080",
                 HostHeader.of(UriAuthority.parse("127.0.0.1:8080").getNonNull()));
  }

  @Test
  public void writeHostHeadersOmittingUser() throws ParseException {
    assertWrites("Host: www.example.com:8080",
                 HostHeader.of(UriAuthority.parse("user:pass@www.example.com:8080").getNonNull()));
  }

  @Test
  public void parseHostHeadersWithSchemesFails() throws ParseException {
    final HostHeader header = (HostHeader) HttpHeader.parse("Host: http://www.example.com").getNonNull();
    assertThrows(HttpException.class, () -> {
      header.authority();
    });
  }

  @Test
  public void parseHostHeadersWithPathsFails() throws ParseException {
    final HostHeader header = (HostHeader) HttpHeader.parse("Host: www.example.com/").getNonNull();
    assertThrows(HttpException.class, () -> {
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
