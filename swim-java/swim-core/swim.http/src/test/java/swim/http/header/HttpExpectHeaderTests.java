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

public class HttpExpectHeaderTests {

  @Test
  public void parseExpectHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Expect: 100-continue\r\n");
    assertInstanceOf(HttpExpectHeader.class, headers.getHeader(HttpHeader.EXPECT));
    assertEquals(HttpExpectHeader.create("100-continue"), headers.getHeader(HttpHeader.EXPECT));
    assertEquals("100-continue", headers.get(HttpHeader.EXPECT));
    assertEquals("100-continue", headers.getValue(HttpHeader.EXPECT));
  }

  @Test
  public void parseExpectHeaders() {
    assertParses(HttpExpectHeader.create("100-continue"), "Expect: 100-continue");
  }

  @Test
  public void writeExpectHeaders() {
    assertWrites("Expect: 100-continue", HttpExpectHeader.create("100-continue"));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
