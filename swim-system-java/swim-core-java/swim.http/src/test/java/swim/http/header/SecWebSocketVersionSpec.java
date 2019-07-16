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

public class SecWebSocketVersionSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseSecWebSocketVersionHeaders() {
    assertParses("Sec-WebSocket-Version: 13", SecWebSocketVersion.from(13));
    assertParses("Sec-WebSocket-Version: 13,0", SecWebSocketVersion.from(13, 0));
    assertParses("Sec-WebSocket-Version: 0, 13", SecWebSocketVersion.from(0, 13));
    assertParses("Sec-WebSocket-Version: 13 , 25", SecWebSocketVersion.from(13, 25));
    assertParses("Sec-WebSocket-Version: 13, 8, 7", SecWebSocketVersion.from(13, 8, 7));
  }

  @Test
  public void writeSecWebSocketVersionHeaders() {
    assertWrites(SecWebSocketVersion.from(13), "Sec-WebSocket-Version: 13");
    assertWrites(SecWebSocketVersion.from(13, 0), "Sec-WebSocket-Version: 13, 0");
    assertWrites(SecWebSocketVersion.from(0, 13), "Sec-WebSocket-Version: 0, 13");
    assertWrites(SecWebSocketVersion.from(13, 25), "Sec-WebSocket-Version: 13, 25");
    assertWrites(SecWebSocketVersion.from(13, 8, 7), "Sec-WebSocket-Version: 13, 8, 7");
  }
}
