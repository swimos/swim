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

package swim.ws;

import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.codec.Utf8;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class WsFrameInflaterSpec {
  @Test
  public void decodeUnmaskedEmptyTextFrame() {
    assertDecodes(Data.fromBase16("8100"), WsValue.from(""));
  }

  @Test
  public void decodeUnmaskedEmptyBinaryFrame() {
    assertDecodes(Data.fromBase16("8200"), WsValue.from(Data.empty()));
  }

  @Test
  public void decodeUnmaskedTextFrame() {
    assertDecodes(Data.fromBase16("810548656c6c6f"), WsValue.from("Hello"));
  }

  @Test
  public void decodeUnmaskedTextFragments() {
    assertDecodes(Data.fromBase16("010348656c80026c6f"), WsValue.from("Hello"));
  }

  @Test
  public void decodeMaskedTextFrame() {
    assertDecodes(Data.fromBase16("818537fa213d7f9f4d5158"), WsValue.from("Hello"));
  }

  @Test
  public void decodeEmptyPingFrame() {
    assertDecodes(Data.fromBase16("8900"), WsPing.from(Data.empty()));
  }

  @Test
  public void decodeEmptyPongFrame() {
    assertDecodes(Data.fromBase16("8a00"), WsPong.from(Data.empty()));
  }

  @Test
  public void decodeCloseFrame() {
    assertDecodes(Data.fromBase16("880203e8"), WsClose.from(1000));
  }

  @Test
  public void decodeCloseFrameWithReason() {
    assertDecodes(Data.fromBase16("880c03e9676f696e672061776179"), WsClose.from(1001, "going away"));
  }

  @Test
  public void inflateUnmaskedTextFrame() {
    assertDecodes(Data.fromBase16("c107f248cdc9c90700"), WsValue.from("Hello"));
  }

  @Test
  public void inflateUnmaskedTextFragments() {
    assertDecodes(Data.fromBase16("4103f248cd8004c9c90700"), WsValue.from("Hello"));
  }

  @Test
  public void inflateMaskedTextFrame() {
    assertDecodes(Data.fromBase16("c18737fa213dc5b2ecf4fefd21"), WsValue.from("Hello"));
  }

  @Test
  public void inflateUnmaskedSharedWindow() {
    final WsDeflateDecoder ws = Ws.deflateDecoder();
    Decoder<WsFrame<String>> frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c107f248cdc9c90700").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
    frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c105f200110000").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
    frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c10402130000").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
    frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c10402130000").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
  }

  @Test
  public void inflateMaskedSharedWindow() {
    final WsDeflateDecoder ws = Ws.deflateDecoder();
    Decoder<WsFrame<String>> frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c18737fa213dc5b2ecf4fefd21").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
    frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c18537fa213dc5fa303d37").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
    frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c18437fa213d35e9213d").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
    frameDecoder = ws.decodeFrame(Utf8.stringParser(), Data.fromBase16("c18437fa213d35e9213d").toInputBuffer().isPart(true));
    assertEquals(frameDecoder.bind(), WsValue.from("Hello"));
  }

  static <T> void assertDecodes(WsDeflateDecoder ws, Decoder<T> content, Data encoded, WsFrame<T> expeced) {
    encoded = encoded.commit();
    for (int i = 0, n = encoded.size(); i <= n; i += 1) {
      final WsDeflateDecoder wsDecoder = ws.clone();
      InputBuffer input = encoded.toInputBuffer();
      Decoder<WsFrame<T>> frameDecoder = wsDecoder.frameDecoder(content);
      assertTrue(frameDecoder.isCont());
      assertFalse(frameDecoder.isDone());
      assertFalse(frameDecoder.isError());

      input = input.index(0).limit(i).isPart(true);
      frameDecoder = frameDecoder.feed(input);
      if (frameDecoder.isDone()) {
        final WsFrame<T> frame = frameDecoder.bind();
        if (frame instanceof WsFragment<?>) {
          frameDecoder = wsDecoder.frameDecoder(((WsFragment<T>) frame).contentDecoder());
        }
      }

      input = input.limit(n).isPart(false);
      frameDecoder = frameDecoder.feed(input);
      if (frameDecoder.isDone()) {
        final WsFrame<T> frame = frameDecoder.bind();
        if (frame instanceof WsFragment<?>) {
          frameDecoder = wsDecoder.frameDecoder(((WsFragment<T>) frame).contentDecoder());
          frameDecoder = frameDecoder.feed(input);
        }
      }

      if (frameDecoder.isError()) {
        throw new TestException(frameDecoder.trap());
      }
      assertFalse(frameDecoder.isCont());
      assertTrue(frameDecoder.isDone());
      assertFalse(frameDecoder.isError());
      assertEquals(frameDecoder.bind(), expeced);
    }
  }

  @SuppressWarnings("unchecked")
  static void assertDecodes(Data encoded, WsFrame<?> expeced) {
    assertDecodes(Ws.deflateDecoder(), new StringOrDataDecoder(), encoded, (WsFrame<Object>) expeced);
  }
}
