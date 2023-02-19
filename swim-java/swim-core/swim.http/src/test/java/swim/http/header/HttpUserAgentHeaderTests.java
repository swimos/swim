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
import swim.http.HttpProduct;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpUserAgentHeaderTests {

  @Test
  public void parseUserAgentHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("User-Agent: swim/5.0\r\n");
    assertInstanceOf(HttpUserAgentHeader.class, headers.getHeader(HttpUserAgentHeader.TYPE));
    assertEquals(HttpUserAgentHeader.of(HttpProduct.of("swim", "5.0")), headers.getHeader(HttpUserAgentHeader.TYPE));
    assertEquals("swim/5.0", headers.get(HttpUserAgentHeader.TYPE));
    assertEquals(FingerTrieList.of(HttpProduct.of("swim", "5.0")), headers.getValue(HttpUserAgentHeader.TYPE));
  }

  @Test
  public void parseUserAgentHeaders() {
    assertParses(HttpUserAgentHeader.of(HttpProduct.of("swim")), "User-Agent: swim");
    assertParses(HttpUserAgentHeader.of(HttpProduct.of("swim", "5.0")), "User-Agent: swim/5.0");
    assertParses(HttpUserAgentHeader.of(HttpProduct.of("swim", "5.0").withComment("beta").withComment("debug"),
                                        HttpProduct.of("waml").withComment("expr")),
                 "User-Agent: swim/5.0 (beta) (debug) waml (expr)");
  }

  @Test
  public void writeUserAgentHeaders() {
    assertWrites("User-Agent: swim", HttpUserAgentHeader.of(HttpProduct.of("swim")));
    assertWrites("User-Agent: swim/5.0", HttpUserAgentHeader.of(HttpProduct.of("swim", "5.0")));
    assertWrites("User-Agent: swim/5.0 (beta) (debug) waml (expr)",
                 HttpUserAgentHeader.of(HttpProduct.of("swim", "5.0").withComment("beta").withComment("debug"),
                                        HttpProduct.of("waml").withComment("expr")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
