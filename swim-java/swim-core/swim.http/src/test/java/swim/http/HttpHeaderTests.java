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

package swim.http;

import org.junit.jupiter.api.Test;

public class HttpHeaderTests {

  @Test
  public void parseHeaders() {
    assertParses(HttpHeader.of("Foo", ""), "Foo:");
    assertParses(HttpHeader.of("Foo", "Bar"), "Foo:Bar");
    assertParses(HttpHeader.of("Foo", ""), "Foo: ");
    assertParses(HttpHeader.of("Foo", "Bar"), "Foo: Bar");
  }

  @Test
  public void writeHeaders() {
    assertWrites("Foo:", HttpHeader.of("Foo", ""));
    assertWrites("Foo: Bar", HttpHeader.of("Foo", "Bar"));
  }

  @Test
  public void parseHeadersWithExcessWhitespace() {
    assertParses(HttpHeader.of("Foo", ""), "Foo:  ");
    assertParses(HttpHeader.of("Foo", "Bar"), "Foo:  Bar");
    assertParses(HttpHeader.of("Foo", "Bar"), "Foo:  Bar  ");
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
