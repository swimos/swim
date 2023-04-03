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
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.http.HttpMethod;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class AllowHeaderTests {

  @Test
  public void parseAllowHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Allow: GET\r\n").getNonNull();
    assertInstanceOf(AllowHeader.class, headers.getHeader(AllowHeader.TYPE));
    assertEquals(AllowHeader.of(HttpMethod.GET),
                 headers.getHeader(AllowHeader.TYPE));
    assertEquals("GET",
                 headers.get(AllowHeader.TYPE));
    assertEquals(FingerTrieList.of(HttpMethod.GET),
                 headers.getValue(AllowHeader.TYPE));
  }

  @Test
  public void parseAllowHeaders() {
    assertParses(AllowHeader.of(HttpMethod.GET),
                 "Allow: GET");
    assertParses(AllowHeader.of(HttpMethod.GET, HttpMethod.PUT),
                 "Allow: GET, PUT");
  }

  @Test
  public void writeAllowHeaders() {
    assertWrites("Allow: GET",
                 AllowHeader.of(HttpMethod.GET));
    assertWrites("Allow: GET, PUT",
                 AllowHeader.of(HttpMethod.GET, HttpMethod.PUT));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
