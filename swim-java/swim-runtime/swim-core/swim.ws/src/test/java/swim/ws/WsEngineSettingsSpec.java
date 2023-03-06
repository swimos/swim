// Copyright 2015-2023 Swim.inc
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

import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.http.WebSocketExtension;
import swim.http.WebSocketParam;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.fail;

public class WsEngineSettingsSpec {

  @Test
  public void decodeStandardEngineSettings() {
    assertDecodes(Record.empty(), WsEngineSettings.standard());
  }

  @Test
  public void decodeCustomEngineSettings() {
    assertDecodes(Record.of(Slot.of("maxFrameSize", 2048),
                            Slot.of("maxMessageSize", 4096),
                            Slot.of("serverCompressionLevel", 7),
                            Slot.of("clientCompressionLevel", 9),
                            Slot.of("serverNoContextTakeover", true),
                            Slot.of("clientNoContextTakeover", true),
                            Slot.of("serverMaxWindowBits", 11),
                            Slot.of("clientMaxWindowBits", 13),
                            Slot.of("autoClose", true)),
                  WsEngineSettings.standard()
                                  .maxFrameSize(2048)
                                  .maxMessageSize(4096)
                                  .serverCompressionLevel(7)
                                  .clientCompressionLevel(9)
                                  .serverNoContextTakeover(true)
                                  .clientNoContextTakeover(true)
                                  .serverMaxWindowBits(11)
                                  .clientMaxWindowBits(13)
                                  .autoClose(true));
  }

  @Test
  public void wsExtensions() {
    final WsEngineSettings wsEngineSettings = WsEngineSettings.standard()
                                                              .maxFrameSize(2048)
                                                              .maxMessageSize(4096)
                                                              .serverCompressionLevel(7)
                                                              .clientCompressionLevel(9)
                                                              .serverNoContextTakeover(true)
                                                              .clientNoContextTakeover(true)
                                                              .serverMaxWindowBits(11)
                                                              .clientMaxWindowBits(15)
                                                              .autoClose(true);

    final FingerTrieSeq<WebSocketExtension> requestExtensions = FingerTrieSeq.of(WebSocketExtension.permessageDeflate(false, false, 10, 10));
    final FingerTrieSeq<WebSocketExtension> responseExtensions = wsEngineSettings.acceptExtensions(requestExtensions);

    assertEquals(responseExtensions.size(), 1);
    final WebSocketExtension responseDeflateExtension = responseExtensions.get(0);
    final WebSocketExtension expected = WebSocketExtension.create("permessage-deflate",
                                                                  WebSocketParam.create("server_no_context_takeover"),
                                                                  WebSocketParam.create("client_no_context_takeover"),
                                                                  WebSocketParam.create("server_max_window_bits", "10"),
                                                                  WebSocketParam.create("client_max_window_bits", "10")
    );

    assertEquals(responseDeflateExtension, expected);
  }

  @Test
  public void invalidMaxWindowBits() {
    final WsEngineSettings wsEngineSettings = WsEngineSettings.standard()
                                                              .maxFrameSize(2048)
                                                              .maxMessageSize(4096)
                                                              .serverCompressionLevel(7)
                                                              .clientCompressionLevel(9)
                                                              .serverNoContextTakeover(true)
                                                              .clientNoContextTakeover(true)
                                                              .serverMaxWindowBits(15)
                                                              .clientMaxWindowBits(15)
                                                              .autoClose(true);

    try {
      final FingerTrieSeq<WebSocketExtension> requestExtensions = FingerTrieSeq.of(WebSocketExtension.permessageDeflate(false, false, 15, 1));
      wsEngineSettings.acceptExtensions(requestExtensions);
      fail();
    } catch (WsException e) {
      assertEquals(e.getLocalizedMessage(), "invalid permessage-deflate parameter: client_max_window_bits; client_max_window_bits=1");
    }

    try {
      final FingerTrieSeq<WebSocketExtension> requestExtensions = FingerTrieSeq.of(WebSocketExtension.permessageDeflate(false, false, 1, 15));
      wsEngineSettings.acceptExtensions(requestExtensions);
      fail();
    } catch (WsException e) {
      assertEquals(e.getLocalizedMessage(), "invalid permessage-deflate parameter: server_max_window_bits; server_max_window_bits=1");
    }

  }

  static void assertDecodes(Value actualValue, WsEngineSettings expected) {
    final WsEngineSettings actual = WsEngineSettings.engineForm().cast(actualValue);
    assertEquals(actual, expected);
  }

}
