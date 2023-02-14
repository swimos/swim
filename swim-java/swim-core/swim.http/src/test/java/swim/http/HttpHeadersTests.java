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

public class HttpHeadersTests {

  @Test
  public void parseEmptyHeaders() {
    assertParses(HttpHeaders.empty(), "");
  }

  @Test
  public void writeEmptyHeaders() {
    assertWrites("", HttpHeaders.empty());
  }

  @Test
  public void parseSingleHeaders() {
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "")), "Foo:\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "Bar")), "Foo:Bar\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "")), "Foo: \r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "Bar")), "Foo: Bar\r\n");
  }

  @Test
  public void writeSingleHeaders() {
    assertWrites("Foo:\r\n", HttpHeaders.of(HttpHeader.of("Foo", "")));
    assertWrites("Foo: Bar\r\n", HttpHeaders.of(HttpHeader.of("Foo", "Bar")));
  }

  @Test
  public void parseMultipleHeaders() {
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", ""),
                                HttpHeader.of("Baz", "")),
                 "Foo:\r\nBaz:\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "Bar"),
                                HttpHeader.of("Baz", "Qux")),
                 "Foo: Bar\r\nBaz: Qux\r\n");
  }

  @Test
  public void writeMultipleHeaders() {
    assertWrites("Foo:\r\nBaz:\r\n",
                 HttpHeaders.of(HttpHeader.of("Foo", ""),
                                HttpHeader.of("Baz", "")));
    assertWrites("Foo: Bar\r\nBaz: Qux\r\n",
                 HttpHeaders.of(HttpHeader.of("Foo", "Bar"),
                                HttpHeader.of("Baz", "Qux")));
  }

  @Test
  public void parseHeadersWithExcessWhitespace() {
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "")), "Foo:  \r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "Bar")), "Foo:  Bar\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "Bar")), "Foo:  Bar  \r\n");
  }

  @Test
  public void parseSingleMultiLineHeaders() {
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo: One\r\n Two\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo:  One \r\n  Two  \r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo: One\r\n \r\n Two\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo:  One \r\n  \r\n  Two  \r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo:\r\n One\r\n Two\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo:  \r\n  One \r\n  Two  \r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo:\r\n \r\n  One\r\n Two\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two")),
                 "Foo:  \r\n  \r\n  One \r\n  Two  \r\n");
  }

  @Test
  public void parseMultipleMultiLineHeaders() {
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two Three"),
                                HttpHeader.of("Bar", "Four Five")),
                 "Foo: One\r\n Two\r\n Three\r\nBar: Four\r\n Five\r\n");
    assertParses(HttpHeaders.of(HttpHeader.of("Foo", "One Two Three"),
                                HttpHeader.of("Bar", "Four Five")),
                 "Foo:  One \r\n  Two  \r\n \r\n Three \r\nBar:  Four  \r\n  Five  \r\n");
  }

  public static void assertParses(HttpHeaders expected, String string) {
    HttpAssertions.assertParses(HttpHeaders.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeaders headers) {
    HttpAssertions.assertWrites(expected, headers::write);
  }

}
