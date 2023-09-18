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

package swim.http;

import org.testng.annotations.Test;
import swim.http.header.RawHeader;
import static swim.http.HttpAssertions.assertWrites;

public class HttpChunkTrailerSpec {

  @Test
  public void parseEmptyChunkTrailer() {
    assertParses("\r\n", HttpChunkTrailer.empty());
  }

  @Test
  public void parseChunkTrailersWithASingleHeader() {
    assertParses("Key: Value\r\n\r\n", HttpChunkTrailer.create(RawHeader.create("Key", "Value")));
  }

  @Test
  public void parseChunkTrailersWithMultipleHeaders() {
    assertParses("Key: Value\r\n"
               + "Foo: Bar\r\n"
               + "\r\n",
                 HttpChunkTrailer.create(RawHeader.create("Key", "Value"),
                                         RawHeader.create("Foo", "Bar")));
  }

  @Test
  public void writeEmptyChunkTrailer() {
    assertWrites(HttpChunkTrailer.empty(), "\r\n");
  }

  @Test
  public void writeChunkTrailersWithASingleHeader() {
    assertWrites(HttpChunkTrailer.create(RawHeader.create("Key", "Value")), "Key: Value\r\n\r\n");
  }

  @Test
  public void writeChunkTrailersWithMultipleHeaders() {
    assertWrites(HttpChunkTrailer.create(RawHeader.create("Key", "Value"),
                                         RawHeader.create("Foo", "Bar")),
                 "Key: Value\r\n"
               + "Foo: Bar\r\n"
               + "\r\n");
  }

  public static void assertParses(String string, HttpChunkTrailer chunkTrailer) {
    HttpAssertions.assertParses(Http.standardParser().chunkTrailerParser(), string, chunkTrailer);
  }

}
