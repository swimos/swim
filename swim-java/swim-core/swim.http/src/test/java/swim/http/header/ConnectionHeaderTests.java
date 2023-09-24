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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class ConnectionHeaderTests {

  @Test
  public void parseConnectionHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Connection: Upgrade\r\n").getNonNull();
    assertInstanceOf(ConnectionHeader.class, headers.getHeader(ConnectionHeader.TYPE));
    assertEquals(ConnectionHeader.of(FingerTrieList.of("Upgrade")),
                 headers.getHeader(ConnectionHeader.TYPE));
    assertEquals("Upgrade",
                 headers.get(ConnectionHeader.TYPE));
    assertEquals(FingerTrieList.of("Upgrade"),
                 headers.getValue(ConnectionHeader.TYPE));
  }

  @Test
  public void parseConnectionHeaders() {
    assertParses(ConnectionHeader.of(FingerTrieList.of("close")),
                 "Connection: close");
    assertParses(ConnectionHeader.of(FingerTrieList.of("Upgrade")),
                 "Connection: Upgrade");
    assertParses(ConnectionHeader.of(FingerTrieList.of("Upgrade", "HTTP2-Settings")),
                 "Connection: Upgrade, HTTP2-Settings");
  }

  @Test
  public void writeConnectionHeaders() {
    assertWrites("Connection: close",
                 ConnectionHeader.of(FingerTrieList.of("close")));
    assertWrites("Connection: Upgrade",
                 ConnectionHeader.of(FingerTrieList.of("Upgrade")));
    assertWrites("Connection: Upgrade, HTTP2-Settings",
                 ConnectionHeader.of(FingerTrieList.of("Upgrade", "HTTP2-Settings")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
