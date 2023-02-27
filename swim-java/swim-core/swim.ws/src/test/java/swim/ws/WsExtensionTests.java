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

package swim.ws;

import org.junit.jupiter.api.Test;
import swim.collections.ArrayMap;

public class WsExtensionTests {

  @Test
  public void parseWebSocketExtensions() {
    assertParses(WsExtension.of("foo"), "foo");
    assertParses(WsExtension.permessageDeflate(false, false, 15, 15), "permessage-deflate");
    assertParses(WsExtension.xWebkitDeflateFrame(false, false, 15, 15), "x-webkit-deflate-frame");
  }

  @Test
  public void writeWebSocketExtensions() {
    assertWrites("foo", WsExtension.of("foo"));
    assertWrites("permessage-deflate", WsExtension.permessageDeflate(false, false, 15, 15));
    assertWrites("x-webkit-deflate-frame", WsExtension.xWebkitDeflateFrame(false, false, 15, 15));
  }

  @Test
  public void parseWebSocketExtensionsWithParams() {
    assertParses(WsExtension.of("foo").withParam("bar", "baz"),
                 "foo;bar=baz");
    assertParses(WsExtension.of("mux", ArrayMap.of("max-channels", "(inf)", "flow-control", null)),
                 "mux; max-channels=\"(inf)\"; flow-control");
    assertParses(WsExtension.permessageDeflate(true, true, 10, 10),
                 "permessage-deflate; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10");
    assertParses(WsExtension.xWebkitDeflateFrame(true, true, 10, 10),
                 "x-webkit-deflate-frame; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10");
  }

  @Test
  public void writeWebSocketExtensionsWithParams() {
    assertWrites("foo; bar=baz",
                 WsExtension.of("foo").withParam("bar", "baz"));
    assertWrites("mux; max-channels=\"(inf)\"; flow-control",
                 WsExtension.of("mux", ArrayMap.of("max-channels", "(inf)", "flow-control", null)));
    assertWrites("permessage-deflate; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10",
                 WsExtension.permessageDeflate(true, true, 10, 10));
    assertWrites("x-webkit-deflate-frame; server_no_context_takeover; client_no_context_takeover; server_max_window_bits=10; client_max_window_bits=10",
                 WsExtension.xWebkitDeflateFrame(true, true, 10, 10));
  }

  public static void assertParses(WsExtension expected, String string) {
    WsAssertions.assertParses(WsExtension.parse(), expected, string);
  }

  public static void assertWrites(String expected, WsExtension extension) {
    WsAssertions.assertWrites(expected, extension::write);
  }

}
