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
import swim.http.HttpProduct;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class ServerHeaderTests {

  @Test
  public void parseServerHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Server: swim/5.0\r\n").getNonNull();
    assertInstanceOf(ServerHeader.class, headers.getHeader(ServerHeader.TYPE));
    assertEquals(ServerHeader.of(HttpProduct.of("swim", "5.0")),
                 headers.getHeader(ServerHeader.TYPE));
    assertEquals("swim/5.0",
                 headers.get(ServerHeader.TYPE));
    assertEquals(FingerTrieList.of(HttpProduct.of("swim", "5.0")),
                 headers.getValue(ServerHeader.TYPE));
  }

  @Test
  public void parseServerHeaders() {
    assertParses(ServerHeader.of(HttpProduct.of("swim")),
                 "Server: swim");
    assertParses(ServerHeader.of(HttpProduct.of("swim", "5.0")),
                 "Server: swim/5.0");
    assertParses(ServerHeader.of(HttpProduct.of("swim", "5.0").withComment("beta").withComment("debug"),
                                 HttpProduct.of("waml").withComment("expr")),
                 "Server: swim/5.0 (beta) (debug) waml (expr)");
  }

  @Test
  public void writeServerHeaders() {
    assertWrites("Server: swim",
                 ServerHeader.of(HttpProduct.of("swim")));
    assertWrites("Server: swim/5.0",
                 ServerHeader.of(HttpProduct.of("swim", "5.0")));
    assertWrites("Server: swim/5.0 (beta) (debug) waml (expr)",
                 ServerHeader.of(HttpProduct.of("swim", "5.0").withComment("beta").withComment("debug"),
                                 HttpProduct.of("waml").withComment("expr")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
