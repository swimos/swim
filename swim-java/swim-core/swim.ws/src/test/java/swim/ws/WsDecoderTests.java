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
import org.junit.jupiter.api.Test;
import swim.codec.Base16;
import swim.codec.BinaryInputBuffer;
import swim.codec.Decode;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static swim.ws.WsAssertions.assertDecodes;

public class WsDecoderTests {

  @Test
  public void decodeUnmaskedEmptyTextFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsTextFrame.of(""),
                  Base16.parseByteBuffer("8100").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedEmptyTextFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsTextFrame.of(""),
                  Base16.parseByteBuffer("818037FA213D").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedEmptyBinaryFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8200").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedEmptyBinaryFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("828037FA213D").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedTextFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsTextFrame.of("Hello"),
                  Base16.parseByteBuffer("810548656C6C6F").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedTextFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsTextFrame.of("Hello"),
                  Base16.parseByteBuffer("818537FA213D7F9F4D5158").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedBinaryFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsBinaryFrame.of(Base16.parseByteBuffer("FACEFEED").getNonNullUnchecked()),
                  Base16.parseByteBuffer("8204FACEFEED").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedBinaryFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsBinaryFrame.of(Base16.parseByteBuffer("FACEFEED").getNonNullUnchecked()),
                  Base16.parseByteBuffer("828437FA213DCD34DFD0").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedTextFragments() {
    assertDecodes(Ws.clientDecoder(),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  Base16.parseByteBuffer("011A4142434445464748494A4B4C4D4E4F505152535455565758595A801A6162636465666768696A6B6C6D6E6F707172737475767778797A").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedTextFragments() {
    assertDecodes(Ws.serverDecoder(),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  Base16.parseByteBuffer("019A37FA213D76B8627972BC66757EB06A717AB46E6D66A8726962AC76656EA0809A37FA213D56984259529C46555E904A515A944E4D46885249428C56454E80").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedEmptyPingFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsPingFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8900").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedEmptyPingFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsPingFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("898037FA213D").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedEmptyPongFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsPongFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8A00").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedEmptyPongFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsPongFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8A8037FA213D").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedPingFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsPingFrame.of(Base16.parseByteBuffer("6563686f").getNonNullUnchecked()),
                  Base16.parseByteBuffer("89046563686F").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedPingFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsPingFrame.of(Base16.parseByteBuffer("6563686f").getNonNullUnchecked()),
                  Base16.parseByteBuffer("898437FA213D52994952").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedPongFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsPongFrame.of(Base16.parseByteBuffer("6563686f").getNonNullUnchecked()),
                  Base16.parseByteBuffer("8A046563686F").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedPongFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsPongFrame.of(Base16.parseByteBuffer("6563686f").getNonNullUnchecked()),
                  Base16.parseByteBuffer("8A8437FA213D52994952").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedEmptyCloseFrame() {
    assertDecodes(Ws.clientDecoder(),
                  WsCloseFrame.empty(),
                  Base16.parseByteBuffer("8800").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedEmptyCloseFrame() {
    assertDecodes(Ws.serverDecoder(),
                  WsCloseFrame.empty(),
                  Base16.parseByteBuffer("888037FA213D").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedCloseFrameWithStatusCode() {
    assertDecodes(Ws.clientDecoder(),
                  WsCloseFrame.of(1000),
                  Base16.parseByteBuffer("880203E8").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedCloseFrameWithStatusCode() {
    assertDecodes(Ws.serverDecoder(),
                  WsCloseFrame.of(1000),
                  Base16.parseByteBuffer("888237FA213D3412").getNonNullUnchecked());
  }

  @Test
  public void decodeUnmaskedCloseFrameWithStatusCodeAndReason() {
    assertDecodes(Ws.clientDecoder(),
                  WsCloseFrame.of(1001, "going away"),
                  Base16.parseByteBuffer("880C03E9676F696E672061776179").getNonNullUnchecked());
  }

  @Test
  public void decodeMaskedCloseFrameWithStatusCodeAndReason() {
    assertDecodes(Ws.serverDecoder(),
                  WsCloseFrame.of(1001, "going away"),
                  Base16.parseByteBuffer("888C37FA213D341346525E94461D568D4044").getNonNullUnchecked());
  }

  @Test
  public void decodeLongestTinyUnmaskedFrame() {
    final int headerSize = 2;
    final int payloadSize = 125;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) payloadSize);
    Decode<WsFrame<Object>> decodeFrame = Ws.clientDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeLongestTinyMaskedFrame() {
    final int headerSize = 6;
    final int payloadSize = 125;
    final int maskingKey = 0x37FA213D;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) (0x80 | payloadSize));
    frame.put(2, (byte) (maskingKey >>> 24));
    frame.put(3, (byte) (maskingKey >>> 16));
    frame.put(4, (byte) (maskingKey >>> 8));
    frame.put(5, (byte) maskingKey);
    for (int i = 0; i < payloadSize; i += 1) {
      final int maskShift = 24 - ((i & 0x3) << 3);
      final int maskByte = maskingKey >>> maskShift & 0xFF;
      frame.put(headerSize + i, (byte) maskByte);
    }
    Decode<WsFrame<Object>> decodeFrame = Ws.serverDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeShortestShortUnmaskedFrame() {
    final int headerSize = 4;
    final int payloadSize = 126;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) 126);
    frame.put(2, (byte) (payloadSize >>> 8));
    frame.put(3, (byte) payloadSize);
    Decode<WsFrame<Object>> decodeFrame = Ws.clientDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeShortestShortMaskedFrame() {
    final int headerSize = 8;
    final int payloadSize = 126;
    final int maskingKey = 0x37FA213D;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) (0x80 | 126));
    frame.put(2, (byte) (payloadSize >>> 8));
    frame.put(3, (byte) payloadSize);
    frame.put(4, (byte) (maskingKey >>> 24));
    frame.put(5, (byte) (maskingKey >>> 16));
    frame.put(6, (byte) (maskingKey >>> 8));
    frame.put(7, (byte) maskingKey);
    for (int i = 0; i < payloadSize; i += 1) {
      final int maskShift = 24 - ((i & 0x3) << 3);
      final int maskByte = maskingKey >>> maskShift & 0xFF;
      frame.put(headerSize + i, (byte) maskByte);
    }
    Decode<WsFrame<Object>> decodeFrame = Ws.serverDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeLongestShortUnmaskedFrame() {
    final int headerSize = 4;
    final int payloadSize = (1 << 16) - 1;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) 126);
    frame.put(2, (byte) (payloadSize >>> 8));
    frame.put(3, (byte) payloadSize);
    Decode<WsFrame<Object>> decodeFrame = Ws.clientDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeLongestShortMaskedFrame() {
    final int headerSize = 8;
    final int payloadSize = (1 << 16) - 1;
    final int maskingKey = 0x37FA213D;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) (0x80 | 126));
    frame.put(2, (byte) (payloadSize >>> 8));
    frame.put(3, (byte) payloadSize);
    frame.put(4, (byte) (maskingKey >>> 24));
    frame.put(5, (byte) (maskingKey >>> 16));
    frame.put(6, (byte) (maskingKey >>> 8));
    frame.put(7, (byte) maskingKey);
    for (int i = 0; i < payloadSize; i += 1) {
      final int maskShift = 24 - ((i & 0x3) << 3);
      final int maskByte = maskingKey >>> maskShift & 0xFF;
      frame.put(headerSize + i, (byte) maskByte);
    }
    Decode<WsFrame<Object>> decodeFrame = Ws.serverDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeShortesLongUnmaskedFrame() {
    final int headerSize = 10;
    final int payloadSize = 1 << 16;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) 127);
    frame.put(2, (byte) 0);
    frame.put(3, (byte) 0);
    frame.put(4, (byte) 0);
    frame.put(5, (byte) 0);
    frame.put(6, (byte) (payloadSize >>> 24));
    frame.put(7, (byte) (payloadSize >>> 16));
    frame.put(8, (byte) (payloadSize >>> 8));
    frame.put(9, (byte) payloadSize);
    Decode<WsFrame<Object>> decodeFrame = Ws.clientDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

  @Test
  public void decodeShortesLongMaskedFrame() {
    final int headerSize = 14;
    final int payloadSize = 1 << 16;
    final int maskingKey = 0x37FA213D;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) (0x80 | 127));
    frame.put(2, (byte) 0);
    frame.put(3, (byte) 0);
    frame.put(4, (byte) 0);
    frame.put(5, (byte) 0);
    frame.put(6, (byte) (payloadSize >>> 24));
    frame.put(7, (byte) (payloadSize >>> 16));
    frame.put(8, (byte) (payloadSize >>> 8));
    frame.put(9, (byte) payloadSize);
    frame.put(10, (byte) (maskingKey >>> 24));
    frame.put(11, (byte) (maskingKey >>> 16));
    frame.put(12, (byte) (maskingKey >>> 8));
    frame.put(13, (byte) maskingKey);
    for (int i = 0; i < payloadSize; i += 1) {
      final int maskShift = 24 - ((i & 0x3) << 3);
      final int maskByte = maskingKey >>> maskShift & 0xFF;
      frame.put(headerSize + i, (byte) maskByte);
    }
    Decode<WsFrame<Object>> decodeFrame = Ws.serverDecoder().decodeMessage(WsSubprotocol.generic());
    decodeFrame = decodeFrame.consume(new BinaryInputBuffer(frame)).assertDone();
    assertEquals(WsBinaryFrame.of(ByteBuffer.allocate(payloadSize)), decodeFrame.getUnchecked());
  }

}
