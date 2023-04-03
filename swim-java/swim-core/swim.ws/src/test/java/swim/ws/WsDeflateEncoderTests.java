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
import static swim.ws.WsAssertions.assertEncodes;

public class WsDeflateEncoderTests {

  @Test
  public void deflateUnmaskedEmptyTextFrame() {
    assertEncodes(WsTestDeflateEncoder.server(WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("C10100").getNonNullUnchecked(),
                  WsTextFrame.of(""),
                  7);
  }

  @Test
  public void deflateMaskedEmptyTextFrame() {
    assertEncodes(WsTestDeflateEncoder.client(0x37FA213D, WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("C18137FA213D37").getNonNullUnchecked(),
                  WsTextFrame.of(""),
                  11);
  }

  @Test
  public void deflateUnmaskedEmptyBinaryFrame() {
    assertEncodes(WsTestDeflateEncoder.server(WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("C20100").getNonNullUnchecked(),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  7);
  }

  @Test
  public void deflateMaskedEmptyBinaryFrame() {
    assertEncodes(WsTestDeflateEncoder.client(0x37FA213D, WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("C28137FA213D37").getNonNullUnchecked(),
                  WsBinaryFrame.of(ByteBuffer.allocate(0)),
                  11);
  }

  @Test
  public void deflateUnmaskedTextFrames() {
    assertEncodes(WsTestDeflateEncoder.server(WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("C107F248CDC9C90700").getNonNullUnchecked(),
                  WsTextFrame.of("Hello"),
                  13);
  }

  @Test
  public void deflateMaskedTextFrames() {
    assertEncodes(WsTestDeflateEncoder.client(0x37FA213D, WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("C18737FA213DC5B2ECF4FEFD21").getNonNullUnchecked(),
                  WsTextFrame.of("Hello"),
                  17);
  }

  @Test
  public void deflateUnmaskedTextFragments() {
    assertEncodes(WsTestDeflateEncoder.server(WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("411C72747276717573F7F0F4F2F6F1F5F30F080C0A0E090D0B8F888C4A4C801A4A4E494D4BCFC8CCCACEC9CDCB2F282C2A2E292D2BAFA8AC0200").getNonNullUnchecked(),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  30, 32);
  }

  @Test
  public void deflateMaskedTextFragments() {
    assertEncodes(WsTestDeflateEncoder.client(0x37FA213D, WsOptions.defaultCompression()),
                  Base16.parseByteBuffer("419C37FA213D458E534B468F52CAC70ED3CBC60FD2323FF62B333EF72AB2BF766B71809A37FA213D7DB468707C35E9F1FD34E8F0FCD509111DD408101C55899135FA").getNonNullUnchecked(),
                  WsTextFrame.of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
                  34, 36);
  }

  @Test
  public void deflateUnmaskedSharedWindow() {
    final WsTestDeflateEncoder encoder = WsTestDeflateEncoder.server(WsOptions.defaultCompression());
    assertEncodes(encoder, Base16.parseByteBuffer("C107F248CDC9C90700").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
    assertEncodes(encoder, Base16.parseByteBuffer("C105F200110000").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
    assertEncodes(encoder, Base16.parseByteBuffer("C10402130000").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
    assertEncodes(encoder, Base16.parseByteBuffer("C10402130000").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
  }

  @Test
  public void deflateMaskedSharedWindow() {
    final WsDeflateEncoder encoder = WsTestDeflateEncoder.client(0x37FA213D, WsOptions.defaultCompression());
    assertEncodes(encoder, Base16.parseByteBuffer("C18737FA213DC5B2ECF4FEFD21").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
    assertEncodes(encoder, Base16.parseByteBuffer("C18537FA213DC5FA303D37").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
    assertEncodes(encoder, Base16.parseByteBuffer("C18437FA213D35E9213D").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
    assertEncodes(encoder, Base16.parseByteBuffer("C18437FA213D35E9213D").getNonNullUnchecked(), WsTextFrame.of("Hello"), 128);
  }

}
