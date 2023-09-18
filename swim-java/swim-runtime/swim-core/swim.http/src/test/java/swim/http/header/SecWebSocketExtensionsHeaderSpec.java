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

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class SecWebSocketExtensionsHeaderSpec {

  @Test
  public void parseSecWebSocketExtensionsHeaders() {
    assertParses("Sec-WebSocket-Extensions: foo",
                 SecWebSocketExtensionsHeader.create("foo"));
    assertParses("Sec-WebSocket-Extensions: bar;baz=2",
                 SecWebSocketExtensionsHeader.create("bar; baz=2"));
    assertParses("Sec-WebSocket-Extensions: foo , bar ; baz = 2",
                 SecWebSocketExtensionsHeader.create("foo", "bar; baz=2"));
    assertParses("Sec-WebSocket-Extensions: mux; max-channels=\"inf\"; flow-control, deflate-stream",
                 SecWebSocketExtensionsHeader.create("mux; max-channels=inf; flow-control", "deflate-stream"));
  }

  @Test
  public void writeSecWebSocketExtensionsHeaders() {
    assertWrites(SecWebSocketExtensionsHeader.create("foo"),
                 "Sec-WebSocket-Extensions: foo");
    assertWrites(SecWebSocketExtensionsHeader.create("bar; baz=2"),
                 "Sec-WebSocket-Extensions: bar; baz=2");
    assertWrites(SecWebSocketExtensionsHeader.create("foo", "bar; baz=2"),
                 "Sec-WebSocket-Extensions: foo, bar; baz=2");
    assertWrites(SecWebSocketExtensionsHeader.create("mux; max-channels=\"inf\"; flow-control", "deflate-stream"),
                 "Sec-WebSocket-Extensions: mux; max-channels=inf; flow-control, deflate-stream");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
