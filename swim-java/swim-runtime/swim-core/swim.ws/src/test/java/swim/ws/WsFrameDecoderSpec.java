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

import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class WsFrameDecoderSpec {

  @Test
  public void decodeUnmaskedEmptyTextFrame() {
    assertDecodes(Data.fromBase16("8100"), WsTextFrame.create(""));
  }

  @Test
  public void decodeUnmaskedEmptyBinaryFrame() {
    assertDecodes(Data.fromBase16("8200"), WsBinaryFrame.create(Data.empty()));
  }

  @Test
  public void decodeUnmaskedTextFrame() {
    assertDecodes(Data.fromBase16("810548656c6c6f"), WsTextFrame.create("Hello"));
  }

  @Test
  public void decodeUnmaskedTextFragments() {
    assertDecodes(Data.fromBase16("010348656c80026c6f"), WsTextFrame.create("Hello"));
  }

  @Test
  public void decodeMaskedTextFrame() {
    assertDecodes(Data.fromBase16("818537fa213d7f9f4d5158"), WsTextFrame.create("Hello"));
  }

  @Test
  public void decodeEmptyPingFrame() {
    assertDecodes(Data.fromBase16("8900"), WsPingFrame.create(Data.empty()));
  }

  @Test
  public void decodeEmptyPongFrame() {
    assertDecodes(Data.fromBase16("8a00"), WsPongFrame.create(Data.empty()));
  }

  @Test
  public void decodeCloseFrame() {
    assertDecodes(Data.fromBase16("880203e8"), WsCloseFrame.create(1000));
  }

  @Test
  public void decodeCloseFrameWithReason() {
    assertDecodes(Data.fromBase16("880c03e9676f696e672061776179"), WsCloseFrame.create(1001, "going away"));
  }

  @Test
  public void decodeEmptyCloseFrame() {
    assertDecodes(Data.fromBase16("8800"), WsCloseFrame.empty());
  }

  @Test
  public void decodeMaxTinyFrame() {
    final int payloadSize = 125;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 2]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 125);
    Decoder<WsFrame<Object>> frameDecoder = Ws.standardDecoder().messageDecoder(new StringOrDataDecoder());
    frameDecoder = frameDecoder.feed(frame.toInputBuffer());
    assertTrue(frameDecoder.isDone());
    assertEquals(frameDecoder.bind(), WsBinaryFrame.create(payload));
  }

  @Test
  public void decodeMinShortFrame() {
    final int payloadSize = 126;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 4]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 126);
    frame.setByte(2, (byte) (payloadSize >>> 8));
    frame.setByte(3, (byte) payloadSize);
    Decoder<WsFrame<Object>> frameDecoder = Ws.standardDecoder().messageDecoder(new StringOrDataDecoder());
    frameDecoder = frameDecoder.feed(frame.toInputBuffer());
    assertTrue(frameDecoder.isDone());
    assertEquals(frameDecoder.bind(), WsBinaryFrame.create(payload));
  }

  @Test
  public void decodeMaxShortFrame() {
    final int payloadSize = (1 << 16) - 1;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 4]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 126);
    frame.setByte(2, (byte) (payloadSize >>> 8));
    frame.setByte(3, (byte) payloadSize);
    Decoder<WsFrame<Object>> frameDecoder = Ws.standardDecoder().messageDecoder(new StringOrDataDecoder());
    frameDecoder = frameDecoder.feed(frame.toInputBuffer());
    assertTrue(frameDecoder.isDone());
    assertEquals(frameDecoder.bind(), WsBinaryFrame.create(payload));
  }

  @Test
  public void decodeMinLongFrame() {
    final int payloadSize = 1 << 16;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 10]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 127);
    frame.setByte(2, (byte) 0);
    frame.setByte(3, (byte) 0);
    frame.setByte(4, (byte) 0);
    frame.setByte(5, (byte) 0);
    frame.setByte(6, (byte) (payloadSize >>> 24));
    frame.setByte(7, (byte) (payloadSize >>> 16));
    frame.setByte(8, (byte) (payloadSize >>> 8));
    frame.setByte(9, (byte) payloadSize);
    Decoder<WsFrame<Object>> frameDecoder = Ws.standardDecoder().messageDecoder(new StringOrDataDecoder());
    frameDecoder = frameDecoder.feed(frame.toInputBuffer());
    assertTrue(frameDecoder.isDone());
    assertEquals(frameDecoder.bind(), WsBinaryFrame.create(payload));
  }

  static <T> void assertDecodes(WsDecoder ws, Decoder<T> payloadDecoder, Data encoded, WsFrame<T> expected) {
    encoded = encoded.commit();
    for (int i = 0, n = encoded.size(); i <= n; i += 1) {
      InputBuffer input = encoded.toInputBuffer();
      Decoder<WsFrame<T>> frameDecoder = ws.messageDecoder(payloadDecoder);
      assertTrue(frameDecoder.isCont());
      assertFalse(frameDecoder.isDone());
      assertFalse(frameDecoder.isError());

      input = input.index(0).limit(i).isPart(true);
      frameDecoder = frameDecoder.feed(input);
      if (frameDecoder.isDone()) {
        final WsFrame<T> frame = frameDecoder.bind();
        if (frame instanceof WsFragmentFrame<?>) {
          final WsFragmentFrame<T> fragment = (WsFragmentFrame<T>) frame;
          frameDecoder = ws.continuationDecoder(fragment.frameType(), fragment.payloadDecoder());
        }
      }

      input = input.limit(n).isPart(false);
      frameDecoder = frameDecoder.feed(input);
      if (frameDecoder.isDone()) {
        final WsFrame<T> frame = frameDecoder.bind();
        if (frame instanceof WsFragmentFrame<?>) {
          final WsFragmentFrame<T> fragment = (WsFragmentFrame<T>) frame;
          frameDecoder = ws.continuationDecoder(fragment.frameType(), fragment.payloadDecoder());
          frameDecoder = frameDecoder.feed(input);
        }
      }

      if (frameDecoder.isError()) {
        throw new TestException(frameDecoder.trap());
      }
      assertFalse(frameDecoder.isCont());
      assertTrue(frameDecoder.isDone());
      assertFalse(frameDecoder.isError());
      assertEquals(frameDecoder.bind(), expected);
    }
  }

  @SuppressWarnings("unchecked")
  static void assertDecodes(Data encoded, WsFrame<?> expected) {
    assertDecodes(Ws.standardDecoder(), new StringOrDataDecoder(), encoded, (WsFrame<Object>) expected);
  }

}
