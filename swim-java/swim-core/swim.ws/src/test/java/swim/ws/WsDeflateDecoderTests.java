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
import swim.codec.BinaryInputBuffer;
import swim.codec.Decode;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static swim.ws.WsAssertions.assertDecodes;

public class WsDeflateDecoderTests {

  @Test
  public void decodeUnmaskedEmptyTextFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of(""),
                  Base16.parseByteBuffer("8100"));
  }

  @Test
  public void decodeMaskedEmptyTextFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of(""),
                  Base16.parseByteBuffer("818037FA213D"));
  }

  @Test
  public void decodeUnmaskedEmptyBinaryFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8200"));
  }

  @Test
  public void decodeMaskedEmptyBinaryFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("828037FA213D"));
  }

  @Test
  public void decodeUnmaskedTextFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("Hello"),
                  Base16.parseByteBuffer("810548656C6C6F"));
  }

  @Test
  public void decodeMaskedTextFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("Hello"),
                  Base16.parseByteBuffer("818537FA213D7F9F4D5158"));
  }

  @Test
  public void decodeUnmaskedBinaryFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsBinaryFrame.of(Base16.parseByteBuffer("FACEFEED")),
                  Base16.parseByteBuffer("8204FACEFEED"));
  }

  @Test
  public void decodeMaskedBinaryFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsBinaryFrame.of(Base16.parseByteBuffer("FACEFEED")),
                  Base16.parseByteBuffer("828437FA213DCD34DFD0"));
  }

  @Test
  public void decodeUnmaskedTextFragments() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  Base16.parseByteBuffer("011A4142434445464748494A4B4C4D4E4F505152535455565758595A801A6162636465666768696A6B6C6D6E6F707172737475767778797A"));
  }

  @Test
  public void decodeMaskedTextFragments() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  Base16.parseByteBuffer("019A37FA213D76B8627972BC66757EB06A717AB46E6D66A8726962AC76656EA0809A37FA213D56984259529C46555E904A515A944E4D46885249428C56454E80"));
  }

  @Test
  public void decodeUnmaskedEmptyPingFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsPingFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8900"));
  }

  @Test
  public void decodeMaskedEmptyPingFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsPingFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("898037FA213D"));
  }

  @Test
  public void decodeUnmaskedEmptyPongFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsPongFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8A00"));
  }

  @Test
  public void decodeMaskedEmptyPongFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsPongFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("8A8037FA213D"));
  }

  @Test
  public void decodeUnmaskedPingFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsPingFrame.of(Base16.parseByteBuffer("6563686f")),
                  Base16.parseByteBuffer("89046563686F"));
  }

  @Test
  public void decodeMaskedPingFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsPingFrame.of(Base16.parseByteBuffer("6563686f")),
                  Base16.parseByteBuffer("898437FA213D52994952"));
  }

  @Test
  public void decodeUnmaskedPongFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsPongFrame.of(Base16.parseByteBuffer("6563686f")),
                  Base16.parseByteBuffer("8A046563686F"));
  }

  @Test
  public void decodeMaskedPongFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsPongFrame.of(Base16.parseByteBuffer("6563686f")),
                  Base16.parseByteBuffer("8A8437FA213D52994952"));
  }

  @Test
  public void decodeUnmaskedEmptyCloseFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsCloseFrame.empty(),
                  Base16.parseByteBuffer("8800"));
  }

  @Test
  public void decodeMaskedEmptyCloseFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsCloseFrame.empty(),
                  Base16.parseByteBuffer("888037FA213D"));
  }

  @Test
  public void decodeUnmaskedCloseFrameWithStatusCode() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsCloseFrame.of(1000),
                  Base16.parseByteBuffer("880203E8"));
  }

  @Test
  public void decodeMaskedCloseFrameWithStatusCode() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsCloseFrame.of(1000),
                  Base16.parseByteBuffer("888237FA213D3412"));
  }

  @Test
  public void decodeUnmaskedCloseFrameWithStatusCodeAndReason() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsCloseFrame.of(1001, "going away"),
                  Base16.parseByteBuffer("880C03E9676F696E672061776179"));
  }

  @Test
  public void decodeMaskedCloseFrameWithStatusCodeAndReason() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsCloseFrame.of(1001, "going away"),
                  Base16.parseByteBuffer("888C37FA213D341346525E94461D568D4044"));
  }

  @Test
  public void inflateUnmaskedEmptyTextFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of(""),
                  Base16.parseByteBuffer("C10100"));
  }

  @Test
  public void inflateMaskedEmptyTextFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of(""),
                  Base16.parseByteBuffer("C18137FA213D37"));
  }

  @Test
  public void inflateUnmaskedEmptyBinaryFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("C20100"));
  }

  @Test
  public void inflateMaskedEmptyBinaryFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  Base16.parseByteBuffer("C28137FA213D37"));
  }

  @Test
  public void inflateUnmaskedTextFrame() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("Hello"),
                  Base16.parseByteBuffer("C107F248CDC9C90700"));
  }

  @Test
  public void inflateMaskedTextFrame() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("Hello"),
                  Base16.parseByteBuffer("C18737FA213DC5B2ECF4FEFD21"));
  }

  @Test
  public void inflateUnmaskedTextFragments() {
    assertDecodes(Ws.deflateClientDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  Base16.parseByteBuffer("411C72747276717573F7F0F4F2F6F1F5F30F080C0A0E090D0B8F888C4A4C801A4A4E494D4BCFC8CCCACEC9CDCB2F282C2A2E292D2BAFA8AC0200"));
  }

  @Test
  public void inflateMaskedTextFragments() {
    assertDecodes(Ws.deflateServerDecoder(WsEngineOptions.standard()),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  Base16.parseByteBuffer("419C37FA213D458E534B468F52CAC70ED3CBC60FD2323FF62B333EF72AB2BF766B71809A37FA213D7DB468707C35E9F1FD34E8F0FCD509111DD408101C55899135FA"));
  }

  @Test
  public void inflateUnmaskedSharedWindow() {
    final WsDeflateDecoder decoder = Ws.deflateClientDecoder(WsEngineOptions.standard());
    Decode<WsFrame<String>> frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C107F248CDC9C90700")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
    frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C105F200110000")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
    frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C10402130000")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
    frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C10402130000")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
  }

  @Test
  public void inflateMaskedSharedWindow() {
    final WsDeflateDecoder decoder = Ws.deflateServerDecoder(WsEngineOptions.standard());
    Decode<WsFrame<String>> frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C18737FA213DC5B2ECF4FEFD21")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
    frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C18537FA213DC5FA303D37")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
    frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C18437FA213D35E9213D")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
    frameDecoder = decoder.decodeMessage(new BinaryInputBuffer(Base16.parseByteBuffer("C18437FA213D35E9213D")).asLast(false), Ws.stringCodec());
    assertEquals(WsTextFrame.of("Hello"), frameDecoder.get());
  }

}
