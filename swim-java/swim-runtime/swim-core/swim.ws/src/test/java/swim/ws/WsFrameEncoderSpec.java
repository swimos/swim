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

import java.nio.ByteBuffer;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Binary;
import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class WsFrameEncoderSpec {

  @Test
  public void encodeUnmaskedEmptyTextFrame() {
    assertEncodes(WsTextFrame.create(""), Data.fromBase16("8100"));
  }

  @Test
  public void encodeUnmaskedEmptyBinaryFrame() {
    assertEncodes(WsBinaryFrame.create(ByteBuffer.allocate(0)), Data.fromBase16("8200"));
  }

  @Test
  public void encodeUnmaskedTextFrame() {
    assertEncodes(WsTextFrame.create("Hello"), Data.fromBase16("810548656c6c6f"));
  }

  @Test
  public void encodeUnmaskedTextFragments() {
    assertEncodes(WsTextFrame.create("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"), Data.fromBase16("011a4142434445464748494a4b4c4d4e4f505152535455565758595a801a6162636465666768696a6b6c6d6e6f707172737475767778797a"), 28, 28);
  }

  @Test
  public void encodeMaskedTextFrame() {
    final byte[] maskingKey = {(byte) 0x37, (byte) 0xfa, (byte) 0x21, (byte) 0x3d};
    assertEncodes(maskingKey, WsTextFrame.create("Hello"), Data.fromBase16("818537fa213d7f9f4d5158"));
  }

  @Test
  public void encodeEmptyPingFrame() {
    assertEncodes(WsPingFrame.empty(), Data.fromBase16("8900"));
  }

  @Test
  public void encodeEmptyPongFrame() {
    assertEncodes(WsPongFrame.empty(), Data.fromBase16("8a00"));
  }

  @Test
  public void encodeCloseFrame() {
    assertEncodes(WsCloseFrame.create(1000), Data.fromBase16("880203e8"));
  }

  @Test
  public void encodeCloseFrameWithReason() {
    assertEncodes(WsCloseFrame.create(1001, "going away"), Data.fromBase16("880c03e9676f696e672061776179"));
  }

  @Test
  public void encodeTinyFrameToShortBuffer() {
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[(1 << 16) - 1]);
    Encoder<?, ?> frameEncoder = new TestWsStandardEncoder(null).frameEncoder(WsTextFrame.create("Hello"));
    frameEncoder = frameEncoder.pull(output);
    assertEquals(Data.wrap(output.bind()), Data.fromBase16("810548656c6c6f"));
  }

  @Test
  public void encodeTinyFrameToLongBuffer() {
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[(1 << 20) - 1]);
    Encoder<?, ?> frameEncoder = new TestWsStandardEncoder(null).frameEncoder(WsTextFrame.create("Hello"));
    frameEncoder = frameEncoder.pull(output);
    assertEquals(Data.wrap(output.bind()), Data.fromBase16("810548656c6c6f"));
  }

  @Test
  public void encodeMaxTinyFrame() {
    final int payloadSize = 125;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 2]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 125);
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[payloadSize + 2]);
    Encoder<?, ?> frameEncoder = new TestWsStandardEncoder(null).frameEncoder(WsBinaryFrame.create(payload.writer()));
    frameEncoder = frameEncoder.pull(output);
    assertEquals(Data.wrap(output.bind()), frame);
  }

  @Test
  public void encodeMinShortFrame() {
    final int payloadSize = 126;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 4]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 126);
    frame.setByte(2, (byte) (payloadSize >>> 8));
    frame.setByte(3, (byte) payloadSize);
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[payloadSize + 4]);
    Encoder<?, ?> frameEncoder = new TestWsStandardEncoder(null).frameEncoder(WsBinaryFrame.create(payload.writer()));
    frameEncoder = frameEncoder.pull(output);
    assertEquals(Data.wrap(output.bind()), frame);
  }

  @Test
  public void encodeMaxShortFrame() {
    final int payloadSize = (1 << 16) - 1;
    final Data payload = Data.wrap(new byte[payloadSize]);
    final Data frame = Data.wrap(new byte[payloadSize + 4]);
    frame.setByte(0, (byte) 0x82);
    frame.setByte(1, (byte) 126);
    frame.setByte(2, (byte) (payloadSize >>> 8));
    frame.setByte(3, (byte) payloadSize);
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[payloadSize + 4]);
    Encoder<?, ?> frameEncoder = new TestWsStandardEncoder(null).frameEncoder(WsBinaryFrame.create(payload.writer()));
    frameEncoder = frameEncoder.pull(output);
    assertEquals(Data.wrap(output.bind()), frame);
  }

  @Test
  public void encodeMinLongFrame() {
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
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[payloadSize + 10]);
    Encoder<?, ?> frameEncoder = new TestWsStandardEncoder(null).frameEncoder(WsBinaryFrame.create(payload.writer()));
    frameEncoder = frameEncoder.pull(output);
    assertEquals(Data.wrap(output.bind()), frame);
  }

  static void assertEncodes(WsEncoder ws, WsFrame<?> frame, Data encoded, int... bufferSizes) {
    final byte[] actual = new byte[encoded.size()];
    int bufferSize = encoded.size();
    Encoder<?, ?> frameEncoder = ws.frameEncoder(frame);
    for (int k = 0, i = 0, n = encoded.size(); i < n; i += bufferSize) {
      if (k < bufferSizes.length) {
        bufferSize = bufferSizes[k];
        k += 1;
      }
      frameEncoder = frameEncoder.pull(Binary.outputBuffer(actual, i, Math.min(bufferSize, actual.length - i))
                                             .isPart(actual.length - i > bufferSize));
      if (frameEncoder.isError()) {
        throw new TestException(frameEncoder.trap());
      }
    }
    assertTrue(frameEncoder.isDone());
    assertEquals(Data.wrap(actual, 0, encoded.size()), encoded);
  }

  static void assertEncodes(WsFrame<?> frame, Data encoded, int... bufferSizes) {
    assertEncodes(new TestWsStandardEncoder(null), frame, encoded, bufferSizes);
  }

  static void assertEncodes(byte[] maskingKey, WsFrame<?> frame, Data encoded, int... bufferSizes) {
    assertEncodes(new TestWsStandardEncoder(maskingKey), frame, encoded, bufferSizes);
  }

}
