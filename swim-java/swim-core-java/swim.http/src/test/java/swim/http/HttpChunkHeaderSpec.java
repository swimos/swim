// Copyright 2015-2019 SWIM.AI inc.
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

import org.testng.annotations.Test;
import static swim.http.HttpAssertions.assertWrites;

public class HttpChunkHeaderSpec {
  public void assertParses(String string, HttpChunkHeader chunkHeader) {
    HttpAssertions.assertParses(Http.standardParser().chunkHeaderParser(), string, chunkHeader);
  }

  @Test
  public void parseChunkHeaders() {
    assertParses("0\r\n", HttpChunkHeader.from(0x0L));
    assertParses("9\r\n", HttpChunkHeader.from(0x9L));
    assertParses("A\r\n", HttpChunkHeader.from(0xaL));
    assertParses("F\r\n", HttpChunkHeader.from(0xfL));
    assertParses("a\r\n", HttpChunkHeader.from(0xaL));
    assertParses("f\r\n", HttpChunkHeader.from(0xfL));

    assertParses("00\r\n", HttpChunkHeader.from(0x00L));
    assertParses("0F\r\n", HttpChunkHeader.from(0x0fL));
    assertParses("F0\r\n", HttpChunkHeader.from(0xf0L));
    assertParses("7F\r\n", HttpChunkHeader.from(0x7fL));

    assertParses("FFFFFFFF\r\n", HttpChunkHeader.from(0xffffffffL));
    assertParses("7FFFFFFFFFFFFFFF\r\n", HttpChunkHeader.from(0x7fffffffffffffffL));
  }

  @Test
  public void parseChunkHeadersWithExtensions() {
    assertParses("0;foo\r\n", HttpChunkHeader.from(0x0L, ChunkExtension.from("foo")));
    assertParses("1;foo=bar\r\n", HttpChunkHeader.from(0x1L, ChunkExtension.from("foo", "bar")));
    assertParses("2;foo=\"bar baz\"\r\n", HttpChunkHeader.from(0x2L, ChunkExtension.from("foo", "bar baz")));
    assertParses("3;foo=\"bar\\ baz\"\r\n", HttpChunkHeader.from(0x3L, ChunkExtension.from("foo", "bar baz")));

    assertParses("A;foo;bar\r\n", HttpChunkHeader.from(0xAL, ChunkExtension.from("foo"), ChunkExtension.from("bar")));
    assertParses("B;p=\"q=r\";s;t=u;v\r\n", HttpChunkHeader.from(0xBL, ChunkExtension.from("p", "q=r"), ChunkExtension.from("s"), ChunkExtension.from("t", "u"), ChunkExtension.from("v")));
  }

  @Test
  public void writeChunkHeaders() {
    assertWrites(HttpChunkHeader.from(0x0L), "0\r\n");
    assertWrites(HttpChunkHeader.from(0x9L), "9\r\n");
    assertWrites(HttpChunkHeader.from(0xaL), "A\r\n");
    assertWrites(HttpChunkHeader.from(0xfL), "F\r\n");

    assertWrites(HttpChunkHeader.from(0x00L), "0\r\n");
    assertWrites(HttpChunkHeader.from(0x0fL), "F\r\n");
    assertWrites(HttpChunkHeader.from(0xf0L), "F0\r\n");
    assertWrites(HttpChunkHeader.from(0x7fL), "7F\r\n");

    assertWrites(HttpChunkHeader.from(0xffffffffL), "FFFFFFFF\r\n");
    assertWrites(HttpChunkHeader.from(0x7fffffffffffffffL), "7FFFFFFFFFFFFFFF\r\n");
  }

  @Test
  public void writeChunkHeadersWithExtensions() {
    assertWrites(HttpChunkHeader.from(0x0L, ChunkExtension.from("foo")), "0;foo\r\n");
    assertWrites(HttpChunkHeader.from(0x1L, ChunkExtension.from("foo", "bar")), "1;foo=bar\r\n");
    assertWrites(HttpChunkHeader.from(0x2L, ChunkExtension.from("foo", "bar baz")), "2;foo=\"bar baz\"\r\n");

    assertWrites(HttpChunkHeader.from(0xaL, ChunkExtension.from("foo"), ChunkExtension.from("bar")), "A;foo;bar\r\n");
    assertWrites(HttpChunkHeader.from(0xbL, ChunkExtension.from("p", "q=r"), ChunkExtension.from("s"), ChunkExtension.from("t", "u"), ChunkExtension.from("v")), "B;p=\"q=r\";s;t=u;v\r\n");
  }
}
