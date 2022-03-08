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

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class ContentLengthHeaderSpec {

  @Test
  public void parseContentLengthHeaders() {
    assertParses("Content-Length: 0", ContentLengthHeader.create(0L));
    assertParses("Content-Length: 1", ContentLengthHeader.create(1L));
    assertParses("Content-Length: 10", ContentLengthHeader.create(10L));
    assertParses("Content-Length: 9223372036854775807", ContentLengthHeader.create(9223372036854775807L));
  }

  @Test
  public void writeContentLengthHeaders() {
    assertWrites(ContentLengthHeader.create(0L), "Content-Length: 0");
    assertWrites(ContentLengthHeader.create(1L), "Content-Length: 1");
    assertWrites(ContentLengthHeader.create(10L), "Content-Length: 10");
    assertWrites(ContentLengthHeader.create(9223372036854775807L), "Content-Length: 9223372036854775807");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
