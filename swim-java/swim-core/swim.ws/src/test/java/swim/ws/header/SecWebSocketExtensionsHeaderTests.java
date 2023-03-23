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

package swim.ws.header;

import org.junit.jupiter.api.Test;
import swim.collections.ArrayMap;
import swim.collections.FingerTrieList;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.ws.WsAssertions;
import swim.ws.WsExtension;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class SecWebSocketExtensionsHeaderTests {

  @Test
  public void parseSecWebSocketExtensionsHeaderType() throws HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Sec-WebSocket-Extensions: permessage-deflate\r\n");
    assertInstanceOf(SecWebSocketExtensionsHeader.class, headers.getHeader(SecWebSocketExtensionsHeader.TYPE));
    assertEquals(SecWebSocketExtensionsHeader.of(WsExtension.permessageDeflate(false, false, 15, 15)),
                 headers.getHeader(SecWebSocketExtensionsHeader.TYPE));
    assertEquals("permessage-deflate",
                 headers.get(SecWebSocketExtensionsHeader.TYPE));
    assertEquals(FingerTrieList.of(WsExtension.permessageDeflate(false, false, 15, 15)),
                 headers.getValue(SecWebSocketExtensionsHeader.TYPE));
  }

  @Test
  public void parseSecWebSocketExtensionsHeaders() {
    assertParses(SecWebSocketExtensionsHeader.of(WsExtension.permessageDeflate(false, false, 15, 15)),
                 "Sec-WebSocket-Extensions: permessage-deflate");
    assertParses(SecWebSocketExtensionsHeader.of(WsExtension.xWebkitDeflateFrame(false, false, 15, 15)),
                 "Sec-WebSocket-Extensions: x-webkit-deflate-frame");
    assertParses(SecWebSocketExtensionsHeader.of(WsExtension.permessageDeflate(true, true, 10, 10)),
                 "Sec-WebSocket-Extensions: permessage-deflate; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10");
    assertParses(SecWebSocketExtensionsHeader.of(WsExtension.xWebkitDeflateFrame(true, true, 10, 10)),
                 "Sec-WebSocket-Extensions: x-webkit-deflate-frame; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10");
    assertParses(SecWebSocketExtensionsHeader.of(WsExtension.of("mux", ArrayMap.of("max-channels", "(inf)", "flow-control", null)), WsExtension.of("deflate-stream")),
                 "Sec-WebSocket-Extensions: mux; max-channels=\"(inf)\"; flow-control, deflate-stream");
  }

  @Test
  public void writeSecWebSocketExtensionsHeaders() {
    assertWrites("Sec-WebSocket-Extensions: permessage-deflate",
                 SecWebSocketExtensionsHeader.of(WsExtension.permessageDeflate(false, false, 15, 15)));
    assertWrites("Sec-WebSocket-Extensions: x-webkit-deflate-frame",
                 SecWebSocketExtensionsHeader.of(WsExtension.xWebkitDeflateFrame(false, false, 15, 15)));
    assertWrites("Sec-WebSocket-Extensions: permessage-deflate; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10",
                 SecWebSocketExtensionsHeader.of(WsExtension.permessageDeflate(true, true, 10, 10)));
    assertWrites("Sec-WebSocket-Extensions: x-webkit-deflate-frame; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10",
                 SecWebSocketExtensionsHeader.of(WsExtension.xWebkitDeflateFrame(true, true, 10, 10)));
    assertWrites("Sec-WebSocket-Extensions: mux; max-channels=\"(inf)\"; flow-control, deflate-stream",
                 SecWebSocketExtensionsHeader.of(WsExtension.of("mux", ArrayMap.of("max-channels", "(inf)", "flow-control", null)), WsExtension.of("deflate-stream")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    WsAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    WsAssertions.assertWrites(expected, header::write);
  }

}
