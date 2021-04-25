// Copyright 2015-2020 Swim inc.
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
import swim.codec.Binary;
import swim.codec.Encoder;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class WsFrameDeflaterSpec {

  static void assertEncodes(WsEncoder ws, WsFrame<?> frame, Data encoded, int... bufferSizes) {
    final byte[] actual = new byte[encoded.size() + 16];
    int bufferSize = encoded.size() + 16;
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
    assertEncodes(Ws.deflateEncoderUnmasked(), frame, encoded, bufferSizes);
  }

  static void assertEncodes(byte[] maskingKey, WsFrame<?> frame, Data encoded, int... bufferSizes) {
    assertEncodes(new WsDeflateEncoderMaskedTest(maskingKey), frame, encoded, bufferSizes);
  }

  @Test
  public void deflateUnmaskedTextFrame() {
    assertEncodes(WsText.from("Hello"), Data.fromBase16("c107f248cdc9c90700"));
  }

  @Test
  public void deflateUnmaskedTextFragments() {
    assertEncodes(WsText.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"), Data.fromBase16("411E72747276717573F7F0F4F2F6F1F5F30F080C0A0E090D0B8F888C4A4C4A4E8018494D4BCFC8CCCACEC9CDCB2F282C2A2E292D2BAFA8AC02000000"), 32, 32);
  }

  @Test
  public void deflateMaskedTextFrame() {
    final byte[] maskingKey = {(byte) 0x37, (byte) 0xfa, (byte) 0x21, (byte) 0x3d};
    assertEncodes(maskingKey, WsText.from("Hello"), Data.fromBase16("c18737fa213dc5b2ecf4fefd21"));
  }

  @Test
  public void deflateUnmaskedSharedWindow() {
    final WsDeflateEncoder ws = Ws.deflateEncoderUnmasked();
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c107f248cdc9c90700"));
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c105f200110000"));
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c10402130000"));
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c10402130000"));
  }

  @Test
  public void deflateMaskedSharedWindow() {
    final byte[] maskingKey = {(byte) 0x37, (byte) 0xfa, (byte) 0x21, (byte) 0x3d};
    final WsDeflateEncoder ws = new WsDeflateEncoderMaskedTest(maskingKey);
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c18737fa213dc5b2ecf4fefd21"));
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c18537fa213dc5fa303d37"));
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c18437fa213d35e9213d"));
    assertEncodes(ws, WsText.from("Hello"), Data.fromBase16("c18437fa213d35e9213d"));
  }

}
