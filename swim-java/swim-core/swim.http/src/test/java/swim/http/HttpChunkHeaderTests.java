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

public class HttpChunkHeaderTests {

  @Test
  public void parseChunkHeaders() {
    assertParses(HttpChunkHeader.of(0x0L), "0");
    assertParses(HttpChunkHeader.of(0x9L), "9");
    assertParses(HttpChunkHeader.of(0xAL), "A");
    assertParses(HttpChunkHeader.of(0xFL), "F");
    assertParses(HttpChunkHeader.of(0xAL), "a");
    assertParses(HttpChunkHeader.of(0xFL), "f");

    assertParses(HttpChunkHeader.of(0x00L), "00");
    assertParses(HttpChunkHeader.of(0x0FL), "0F");
    assertParses(HttpChunkHeader.of(0xF0L), "F0");
    assertParses(HttpChunkHeader.of(0x7FL), "7F");

    assertParses(HttpChunkHeader.of(0xFFFFFFFFL), "FFFFFFFF");
    assertParses(HttpChunkHeader.of(0x7FFFFFFFFFFFFFFFL), "7FFFFFFFFFFFFFFF");
  }

  @Test
  public void writeChunkHeaders() {
    assertWrites("0", HttpChunkHeader.of(0x0L));
    assertWrites("9", HttpChunkHeader.of(0x9L));
    assertWrites("A", HttpChunkHeader.of(0xAL));
    assertWrites("F", HttpChunkHeader.of(0xFL));

    assertWrites("0", HttpChunkHeader.of(0x00L));
    assertWrites("F", HttpChunkHeader.of(0x0FL));
    assertWrites("F0", HttpChunkHeader.of(0xF0L));
    assertWrites("7F", HttpChunkHeader.of(0x7FL));

    assertWrites("FFFFFFFF", HttpChunkHeader.of(0xFFFFFFFFL));
    assertWrites("7FFFFFFFFFFFFFFF", HttpChunkHeader.of(0x7FFFFFFFFFFFFFFFL));
  }

  @Test
  public void parseChunkHeadersWithWithSingleExts() {
    assertParses(HttpChunkHeader.of(0x0L).withExt("foo"),
                 "0;foo");
    assertParses(HttpChunkHeader.of(0x1L).withExt("foo", "bar"),
                 "1;foo=bar");
    assertParses(HttpChunkHeader.of(0x2L).withExt("foo", "bar baz"),
                 "2;foo=\"bar baz\"");
    assertParses(HttpChunkHeader.of(0x3L).withExt("foo", "bar baz"),
                 "3;foo=\"bar\\ baz\"");
  }

  @Test
  public void writeChunkHeadersWithSingleExts() {
    assertWrites("0;foo",
                 HttpChunkHeader.of(0x0L).withExt("foo"));
    assertWrites("1;foo=bar",
                 HttpChunkHeader.of(0x1L).withExt("foo", "bar"));
    assertWrites("2;foo=\"bar baz\"",
                 HttpChunkHeader.of(0x2L).withExt("foo", "bar baz"));
  }

  @Test
  public void parseChunkHeadersWithWithMultipleExts() {
    assertParses(HttpChunkHeader.of(0xAL).withExt("foo").withExt("bar"),
                 "A;foo;bar");
    assertParses(HttpChunkHeader.of(0xBL).withExt("p", "q=r").withExt("s")
                                             .withExt("t", "u").withExt("v"),
                 "B;p=\"q=r\";s;t=u;v");
  }

  @Test
  public void writeChunkHeadersWithMultipleExts() {
    assertWrites("A;foo;bar",
                 HttpChunkHeader.of(0xAL).withExt("foo").withExt("bar"));
    assertWrites("B;p=\"q=r\";s;t=u;v",
                 HttpChunkHeader.of(0xBL).withExt("p", "q=r").withExt("s")
                                         .withExt("t", "u").withExt("v"));
  }

  public static void assertParses(HttpChunkHeader expected, String string) {
    HttpAssertions.assertParses(HttpChunkHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpChunkHeader chunkHeader) {
    HttpAssertions.assertWrites(expected, chunkHeader::write);
  }

}
