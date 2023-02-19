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

public class HttpMaxForwardsHeaderTests {

  @Test
  public void parseMaxForwardsHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Max-Forwards: 42\r\n");
    assertInstanceOf(HttpMaxForwardsHeader.class, headers.getHeader(HttpMaxForwardsHeader.TYPE));
    assertEquals(HttpMaxForwardsHeader.of(42), headers.getHeader(HttpMaxForwardsHeader.TYPE));
    assertEquals("42", headers.get(HttpMaxForwardsHeader.TYPE));
    assertEquals(42, headers.getValue(HttpMaxForwardsHeader.TYPE));
  }

  @Test
  public void parseMaxForwardsHeaders() {
    assertParses(HttpMaxForwardsHeader.of(0), "Max-Forwards: 0");
    assertParses(HttpMaxForwardsHeader.of(1), "Max-Forwards: 1");
    assertParses(HttpMaxForwardsHeader.of(15), "Max-Forwards: 15");
  }

  @Test
  public void writeMaxForwardsHeaders() {
    assertWrites("Max-Forwards: 0", HttpMaxForwardsHeader.of(0));
    assertWrites("Max-Forwards: 1", HttpMaxForwardsHeader.of(1));
    assertWrites("Max-Forwards: 15", HttpMaxForwardsHeader.of(15));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
