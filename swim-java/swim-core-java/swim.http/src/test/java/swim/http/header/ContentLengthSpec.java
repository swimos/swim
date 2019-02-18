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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class ContentLengthSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseContentLengthHeaders() {
    assertParses("Content-Length: 0", ContentLength.from(0L));
    assertParses("Content-Length: 1", ContentLength.from(1L));
    assertParses("Content-Length: 10", ContentLength.from(10L));
    assertParses("Content-Length: 9223372036854775807", ContentLength.from(9223372036854775807L));
  }

  @Test
  public void writeContentLengthHeaders() {
    assertWrites(ContentLength.from(0L), "Content-Length: 0");
    assertWrites(ContentLength.from(1L), "Content-Length: 1");
    assertWrites(ContentLength.from(10L), "Content-Length: 10");
    assertWrites(ContentLength.from(9223372036854775807L), "Content-Length: 9223372036854775807");
  }
}
