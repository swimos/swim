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

package swim.ws;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static swim.ws.WsAssertions.assertTranscodes;
import static swim.ws.WsAssertions.assertTranscodesRandom;

public class WsEngineTests {

  @Test
  public void transcodeUnmaskedMessages() {
    final WsEncoder encoder = WsTestEncoder.server();
    final WsDecoder decoder = Ws.clientDecoder();
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("HelloHello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("HelloHelloHello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("HelloHelloHelloHello"));
  }

  @Test
  public void transcodeMaskedMessages() {
    final WsEncoder encoder = WsTestEncoder.client();
    final WsDecoder decoder = Ws.serverDecoder();
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("HelloHello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("HelloHelloHello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("HelloHelloHelloHello"));
  }

  @Test
  public void transcodeUnmaskedMessageSequences() {
    final WsEncoder encoder = WsTestEncoder.server();
    final WsDecoder decoder = Ws.clientDecoder();
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"), WsTextFrame.of("Hello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"), WsTextFrame.of("Hello"), WsTextFrame.of("Hello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"), WsTextFrame.of("Hello"), WsTextFrame.of("Hello"), WsTextFrame.of("Hello"));
  }

  @Test
  public void transcodeMaskedMessageSequences() {
    final WsEncoder encoder = WsTestEncoder.client();
    final WsDecoder decoder = Ws.serverDecoder();
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"), WsTextFrame.of("Hello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"), WsTextFrame.of("Hello"), WsTextFrame.of("Hello"));
    assertTranscodes(encoder, decoder, 4096, WsTextFrame.of("Hello"), WsTextFrame.of("Hello"), WsTextFrame.of("Hello"), WsTextFrame.of("Hello"));
  }

  @Test
  public void transcodeUnmaskedFragmentedMessages() {
    final WsEncoder encoder = WsTestEncoder.server();
    final WsDecoder decoder = Ws.clientDecoder();
    for (int bufferSize = 16; bufferSize <= 128; bufferSize *= 2) {
      assertTranscodes(encoder, decoder, bufferSize, WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."));
      assertTranscodes(encoder, decoder, bufferSize, WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."));
    }
  }

  @Test
  public void transcodeMaskedFragmentedMessages() {
    final WsEncoder encoder = WsTestEncoder.client();
    final WsDecoder decoder = Ws.serverDecoder();
    for (int bufferSize = 16; bufferSize <= 128; bufferSize *= 2) {
      assertTranscodes(encoder, decoder, bufferSize, WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."));
      assertTranscodes(encoder, decoder, bufferSize, WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."));
    }
  }

  @Test
  public void transcodeUnmaskedFragmentedMessageSequences() {
    final WsEncoder encoder = WsTestEncoder.server();
    final WsDecoder decoder = Ws.clientDecoder();
    for (int bufferSize = 16; bufferSize <= 128; bufferSize *= 2) {
      assertTranscodes(encoder, decoder, bufferSize, WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."),
                                                     WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."));
    }
  }

  @Test
  public void transcodeMaskedFragmentedMessageSequences() {
    final WsEncoder encoder = WsTestEncoder.client();
    final WsDecoder decoder = Ws.serverDecoder();
    for (int bufferSize = 16; bufferSize <= 128; bufferSize *= 2) {
      assertTranscodes(encoder, decoder, bufferSize, WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."),
                                                     WsTextFrame.of("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."));
    }
  }

  @Test
  public void transcodeUnmaskedShortRandomHighEntropyFrames() {
    final WsEncoder encoder = Ws.serverEncoder();
    final WsDecoder decoder = Ws.clientDecoder();
    final int bufferSize = 4096;
    final int entropy = 0xFF;
    final int minMessageSize = 0;
    final int maxMessageSize = 8192;
    final int messageCount = 10000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  public void transcodeMaskedShortRandomHighEntropyFrames() {
    final WsEncoder encoder = Ws.clientEncoder();
    final WsDecoder decoder = Ws.serverDecoder();
    final int bufferSize = 4096;
    final int entropy = 0xFF;
    final int minMessageSize = 0;
    final int maxMessageSize = 8192;
    final int messageCount = 10000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  public void transcodeUnmaskedShortRandomLowEntopyFrames() {
    final WsEncoder encoder = Ws.serverEncoder();
    final WsDecoder decoder = Ws.clientDecoder();
    final int bufferSize = 4096;
    final int entropy = 0x78;
    final int minMessageSize = 0;
    final int maxMessageSize = 8192;
    final int messageCount = 1000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  public void transcodeMaskedShortRandomLowEntopyFrames() {
    final WsEncoder encoder = Ws.clientEncoder();
    final WsDecoder decoder = Ws.serverDecoder();
    final int bufferSize = 4096;
    final int entropy = 0x78;
    final int minMessageSize = 0;
    final int maxMessageSize = 8192;
    final int messageCount = 1000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  @Tag("slow")
  public void transcodeUnmaskedLongRandomHighEntropyFrames() {
    final WsEncoder encoder = Ws.serverEncoder();
    final WsDecoder decoder = Ws.clientDecoder();
    final int bufferSize = 1 << 18;
    final int entropy = 0xFF;
    final int minMessageSize = 1 << 15;
    final int maxMessageSize = 1 << 19;
    final int messageCount = 1000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  @Tag("slow")
  public void transcodeMaskedLongRandomHighEntropyFrames() {
    final WsEncoder encoder = Ws.clientEncoder();
    final WsDecoder decoder = Ws.serverDecoder();
    final int bufferSize = 1 << 18;
    final int entropy = 0xFF;
    final int minMessageSize = 1 << 15;
    final int maxMessageSize = 1 << 19;
    final int messageCount = 1000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  @Tag("slow")
  public void transcodeUnmaskedLongRandomLowEntropyFrames() {
    final WsEncoder encoder = Ws.serverEncoder();
    final WsDecoder decoder = Ws.clientDecoder();
    final int bufferSize = 1 << 18;
    final int entropy = 0x78;
    final int minMessageSize = 1 << 15;
    final int maxMessageSize = 1 << 19;
    final int messageCount = 1000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

  @Test
  @Tag("slow")
  public void transcodeMaskedLongRandomLowEntropyFrames() {
    final WsEncoder encoder = Ws.clientEncoder();
    final WsDecoder decoder = Ws.serverDecoder();
    final int bufferSize = 1 << 18;
    final int entropy = 0x78;
    final int minMessageSize = 1 << 15;
    final int maxMessageSize = 1 << 19;
    final int messageCount = 1000;
    assertTranscodesRandom(encoder, decoder, bufferSize, entropy,
                           minMessageSize, maxMessageSize, messageCount);
  }

}
