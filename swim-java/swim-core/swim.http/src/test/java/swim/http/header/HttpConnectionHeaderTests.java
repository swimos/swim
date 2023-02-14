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
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpConnectionHeaderTests {

  @Test
  public void parseConnectionHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Connection: Upgrade\r\n");
    assertInstanceOf(HttpConnectionHeader.class, headers.getHeader(HttpHeader.CONNECTION));
    assertEquals(HttpConnectionHeader.create("Upgrade"), headers.getHeader(HttpHeader.CONNECTION));
    assertEquals("Upgrade", headers.get(HttpHeader.CONNECTION));
    assertEquals(FingerTrieList.of("Upgrade"), headers.getValue(HttpHeader.CONNECTION));
  }

  @Test
  public void parseConnectionHeaders() {
    assertParses(HttpConnectionHeader.create("close"), "Connection: close");
    assertParses(HttpConnectionHeader.create("Upgrade"), "Connection: Upgrade");
    assertParses(HttpConnectionHeader.create("Upgrade", "HTTP2-Settings"), "Connection: Upgrade, HTTP2-Settings");
  }

  @Test
  public void writeConnectionHeaders() {
    assertWrites("Connection: close", HttpConnectionHeader.create("close"));
    assertWrites("Connection: Upgrade", HttpConnectionHeader.create("Upgrade"));
    assertWrites("Connection: Upgrade, HTTP2-Settings", HttpConnectionHeader.create("Upgrade", "HTTP2-Settings"));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
