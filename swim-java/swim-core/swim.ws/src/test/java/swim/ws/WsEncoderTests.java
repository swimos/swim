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

import java.nio.ByteBuffer;
import org.junit.jupiter.api.Test;
import swim.codec.Base16;
import swim.codec.BinaryOutputBuffer;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static swim.ws.WsAssertions.assertEncodes;

public class WsEncoderTests {

  @Test
  public void encodeUnmaskedEmptyTextFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8100"),
                  WsTextFrame.of(""));
  }

  @Test
  public void encodeMaskedEmptyTextFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("818037FA213D"),
                  WsTextFrame.of(""));
  }

  @Test
  public void encodeUnmaskedEmptyBinaryFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8200"),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)));
  }

  @Test
  public void encodeMaskedEmptyBinaryFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("828037FA213D"),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)));
  }

  @Test
  public void encodeUnmaskedTextFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("810548656C6C6F"),
                  WsTextFrame.of("Hello"));
  }

  @Test
  public void encodeMaskedTextFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("818537FA213D7F9F4D5158"),
                  WsTextFrame.of("Hello"));
  }

  @Test
  public void encodeUnmaskedBinaryFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8204FACEFEED"),
                  WsBinaryFrame.of(Base16.parseByteBuffer("FACEFEED")));
  }

  @Test
  public void encodeMaskedBinaryFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("828437FA213DCD34DFD0"),
                  WsBinaryFrame.of(Base16.parseByteBuffer("FACEFEED")));
  }

  @Test
  public void encodeUnmaskedTextFragments() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("011A4142434445464748494A4B4C4D4E4F505152535455565758595A801A6162636465666768696A6B6C6D6E6F707172737475767778797A"),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  28, 28);
  }

  @Test
  public void encodeMaskedTextFragments() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("019A37FA213D76B8627972BC66757EB06A717AB46E6D66A8726962AC76656EA0809A37FA213D56984259529C46555E904A515A944E4D46885249428C56454E80"),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  32, 32);
  }

  @Test
  public void encodeUnmaskedEmptyPingFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8900"),
                  WsPingFrame.empty());
  }

  @Test
  public void encodeMaskedEmptyPingFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("898037FA213D"),
                  WsPingFrame.empty());
  }

  @Test
  public void encodeUnmaskedEmptyPongFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8A00"),
                  WsPongFrame.empty());
  }

  @Test
  public void encodeMaskedEmptyPongFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("8A8037FA213D"),
                  WsPongFrame.empty());
  }

  @Test
  public void encodeUnmaskedPingFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("89046563686F"),
                  WsPingFrame.of("echo"));
  }

  @Test
  public void encodeMaskedPingFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("898437FA213D52994952"),
                  WsPingFrame.of("echo"));
  }

  @Test
  public void encodeUnmaskedPongFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8A046563686F"),
                  WsPongFrame.of("echo"));
  }

  @Test
  public void encodeMaskedPongFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("8A8437FA213D52994952"),
                  WsPongFrame.of("echo"));
  }

  @Test
  public void encodeUnmaskedEmptyCloseFrame() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("8800"),
                  WsCloseFrame.empty());
  }

  @Test
  public void encodeMaskedEmptyCloseFrame() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("888037FA213D"),
                  WsCloseFrame.empty());
  }

  @Test
  public void encodeUnmaskedCloseFrameWithStatusCode() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("880203E8"),
                  WsCloseFrame.of(1000));
  }

  @Test
  public void encodeMaskedCloseFrameWithStatusCode() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("888237FA213D3412"),
                  WsCloseFrame.of(1000));
  }

  @Test
  public void encodeUnmaskedCloseFrameWithStatusCodeAndReason() {
    assertEncodes(WsTestEncoder.server(),
                  Base16.parseByteBuffer("880C03E9676F696E672061776179"),
                  WsCloseFrame.of(1001, "going away"));
  }

  @Test
  public void encodeMaskedCloseFrameWithStatusCodeAndReason() {
    assertEncodes(WsTestEncoder.client(0x37FA213D),
                  Base16.parseByteBuffer("888C37FA213D341346525E94461D568D4044"),
                  WsCloseFrame.of(1001, "going away"));
  }

  @Test
  public void encodeUnmaskedTinyFrameToTinyBuffer() {
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(127));
    WsTestEncoder.server().encodeMessage(output, WsTextFrame.of("Hello")).checkDone();
    assertEquals(Base16.parseByteBuffer("810548656C6C6F"), output.get());
  }

  @Test
  public void encodeMaskedTinyFrameToTinyBuffer() {
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(131));
    WsTestEncoder.client(0x37FA213D).encodeMessage(output, WsTextFrame.of("Hello")).checkDone();
    assertEquals(Base16.parseByteBuffer("818537FA213D7F9F4D5158"), output.get());
  }

  @Test
  public void encodeUnmaskedTinyFrameToShortBuffer() {
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(128));
    WsTestEncoder.server().encodeMessage(output, WsTextFrame.of("Hello")).checkDone();
    assertEquals(Base16.parseByteBuffer("810548656C6C6F"), output.get());
  }

  @Test
  public void encodeMaskedTinyFrameToShortBuffer() {
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(132));
    WsTestEncoder.client(0x37FA213D).encodeMessage(output, WsTextFrame.of("Hello")).checkDone();
    assertEquals(Base16.parseByteBuffer("818537FA213D7F9F4D5158"), output.get());
  }

  @Test
  public void encodeUnmaskedTinyFrameToLongBuffer() {
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate((1 << 16) + 4));
    WsTestEncoder.server().encodeMessage(output, WsTextFrame.of("Hello")).checkDone();
    assertEquals(Base16.parseByteBuffer("810548656C6C6F"), output.get());
  }

  @Test
  public void encodeMaskedTinyFrameToLongBuffer() {
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate((1 << 16) + 8));
    WsTestEncoder.client(0x37FA213D).encodeMessage(output, WsTextFrame.of("Hello")).checkDone();
    assertEquals(Base16.parseByteBuffer("818537FA213D7F9F4D5158"), output.get());
  }

  @Test
  public void encodeLongestTinyUnmaskedFrame() {
    final int headerSize = 2;
    final int payloadSize = 125;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) payloadSize);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.server().encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeLongestTinyMaskedFrame() {
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
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.client(maskingKey).encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeShortestShortUnmaskedFrame() {
    final int headerSize = 4;
    final int payloadSize = 126;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) 126);
    frame.put(2, (byte) (payloadSize >>> 8));
    frame.put(3, (byte) payloadSize);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.server().encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeShortestShortMaskedFrame() {
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
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.client(maskingKey).encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeLongestShortUnmaskedFrame() {
    final int headerSize = 4;
    final int payloadSize = (1 << 16) - 1;
    final ByteBuffer frame = ByteBuffer.allocate(headerSize + payloadSize);
    frame.put(0, (byte) 0x82);
    frame.put(1, (byte) 126);
    frame.put(2, (byte) (payloadSize >>> 8));
    frame.put(3, (byte) payloadSize);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.server().encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeLongestShortMaskedFrame() {
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
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.client(maskingKey).encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeShortestLongUnmaskedFrame() {
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
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.server().encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

  @Test
  public void encodeShortestLongMaskedFrame() {
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
    final BinaryOutputBuffer output = new BinaryOutputBuffer(ByteBuffer.allocate(headerSize + payloadSize));
    WsTestEncoder.client(maskingKey).encodeMessage(output, WsBinaryFrame.of(ByteBuffer.allocate(payloadSize))).checkDone();
    assertEquals(frame, output.get());
  }

}
