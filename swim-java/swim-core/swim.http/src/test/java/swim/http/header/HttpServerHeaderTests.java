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

public class HttpServerHeaderTests {

  @Test
  public void parseServerHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Server: swim/5.0\r\n");
    assertInstanceOf(HttpServerHeader.class, headers.getHeader(HttpHeader.SERVER));
    assertEquals(HttpServerHeader.create(HttpProduct.create("swim", "5.0")), headers.getHeader(HttpHeader.SERVER));
    assertEquals("swim/5.0", headers.get(HttpHeader.SERVER));
    assertEquals(FingerTrieList.of(HttpProduct.create("swim", "5.0")), headers.getValue(HttpHeader.SERVER));
  }

  @Test
  public void parseServerHeaders() {
    assertParses(HttpServerHeader.create(HttpProduct.create("swim")), "Server: swim");
    assertParses(HttpServerHeader.create(HttpProduct.create("swim", "5.0")), "Server: swim/5.0");
    assertParses(HttpServerHeader.create(HttpProduct.create("swim", "5.0").withComment("beta").withComment("debug"),
                                         HttpProduct.create("waml").withComment("expr")),
                 "Server: swim/5.0 (beta) (debug) waml (expr)");
  }

  @Test
  public void writeServerHeaders() {
    assertWrites("Server: swim", HttpServerHeader.create(HttpProduct.create("swim")));
    assertWrites("Server: swim/5.0", HttpServerHeader.create(HttpProduct.create("swim", "5.0")));
    assertWrites("Server: swim/5.0 (beta) (debug) waml (expr)",
                 HttpServerHeader.create(HttpProduct.create("swim", "5.0").withComment("beta").withComment("debug"),
                                         HttpProduct.create("waml").withComment("expr")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
