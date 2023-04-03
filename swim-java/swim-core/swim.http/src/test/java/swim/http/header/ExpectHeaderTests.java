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
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class ExpectHeaderTests {

  @Test
  public void parseExpectHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Expect: 100-continue\r\n").getNonNull();
    assertInstanceOf(ExpectHeader.class, headers.getHeader(ExpectHeader.TYPE));
    assertEquals(ExpectHeader.of("100-continue"),
                 headers.getHeader(ExpectHeader.TYPE));
    assertEquals("100-continue",
                 headers.get(ExpectHeader.TYPE));
    assertEquals("100-continue",
                 headers.getValue(ExpectHeader.TYPE));
  }

  @Test
  public void parseExpectHeaders() {
    assertParses(ExpectHeader.of("100-continue"),
                 "Expect: 100-continue");
  }

  @Test
  public void writeExpectHeaders() {
    assertWrites("Expect: 100-continue",
                 ExpectHeader.of("100-continue"));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
