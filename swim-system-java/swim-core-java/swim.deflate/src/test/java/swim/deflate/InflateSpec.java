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

package swim.deflate;

import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.Output;
import java.nio.charset.Charset;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;
import static swim.deflate.DeflateUtil.readResource;

public class InflateSpec {

  @Test
  public void inflateFixed() {
    assertInflates(byteArray(0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00, 0x00, 0x00, 0xff, 0xff),
        "Hello",
        Inflate.Z_NO_WRAP, Inflate.DEF_WBITS);
  }

  @Test
  public void inflateLencode() {
    assertInflates(byteArray(0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0xf7, 0x80, 0x13, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff),
        "HelloHelloHello",
        Inflate.Z_NO_WRAP, Inflate.DEF_WBITS);
  }

  @Test
  public void inflateLorem() {
    assertInflates(
        readResource("/lorem.txt.deflate", false),
        readResource("/lorem.txt", true),
        Inflate.Z_NO_WRAP, Inflate.DEF_WBITS);
  }


  @Test
  public void inflateImage() {
    assertInflates(readResource("/image.tiff.deflate", false),
        readResource("/image.tiff", false),
        Inflate.Z_NO_WRAP, Inflate.DEF_WBITS);
  }

  @Test
  public void inflateImageIncrementally() {
    assertInflates(readResource("/image.tiff.deflate", false),
        readResource("/image.tiff", false),
        Inflate.Z_NO_WRAP, Inflate.DEF_WBITS, 1024);
  }

  @Test
  public void gunzipImage() {
    assertInflates(readResource("/image.tiff.gz", false),
        readResource("/image.tiff", false),
        Inflate.Z_WRAP_GZIP, Inflate.DEF_WBITS);
  }

  @Test
  public void gunzipImageIncrementally() {
    assertInflates(readResource("/image.tiff.gz", false),
        readResource("/image.tiff", false),
        Inflate.Z_WRAP_GZIP, Inflate.DEF_WBITS, 1024);
  }

  @Test
  public void inflateLoremIncrementally() {
    assertInflates(
        readResource("/lorem.txt.deflate", false),
        readResource("/lorem.txt", true),
        Inflate.Z_NO_WRAP, Inflate.DEF_WBITS, 128);
  }

  public byte[] writeLorem(byte[] deflated, int wrap, int windowBits, int bufferSize) {
    final Output<byte[]> output = Binary.byteArrayOutput(deflated.length);
    Decoder<byte[]> inflater = new Inflate<>(Binary.outputParser(output), wrap, windowBits);
    for (int i = 0; i < deflated.length; i += bufferSize) {
      inflater = inflater.feed(Binary.inputBuffer(deflated, i, Math.min(bufferSize, deflated.length - i)).isPart(deflated.length - i > bufferSize));
      if (inflater.isError()) {
        throw new TestException(inflater.trap());
      }
    }

    assertTrue(inflater.isDone());

    return output.bind();
  }


  static void assertInflates(byte[] deflated, byte[] inflated, int wrap, int windowBits, int bufferSize) {
    final Output<byte[]> output = Binary.byteArrayOutput(inflated.length);
    Decoder<byte[]> inflater = new Inflate<byte[]>(Binary.outputParser(output), wrap, windowBits);
    for (int i = 0; i < deflated.length; i += bufferSize) {
      inflater = inflater.feed(Binary.inputBuffer(deflated, i, Math.min(bufferSize, deflated.length - i)).isPart(deflated.length - i > bufferSize));
      if (inflater.isError()) {
        throw new TestException(inflater.trap());
      }
    }


    assertTrue(inflater.isDone());
    final byte[] actual = output.bind();
    assertEquals(actual.length, inflated.length);
    for (int i = 0, n = inflated.length; i < n; i += 1) {
      if ((actual[i] & 0xff) != (inflated[i] & 0xff)) {
        fail("expected 0x" + Integer.toHexString(inflated[i] & 0xff)
            + ", but found 0x" + Integer.toHexString(actual[i] & 0xff)
            + " at index " + i);
      }
    }
  }

  static void assertInflates(byte[] deflated, String inflated, int wrap, int windowBits) {
    assertInflates(deflated, inflated.getBytes(Charset.forName("UTF-8")), wrap, windowBits);
  }

  static void assertInflates(byte[] deflated, String inflated, int wrap, int windowBits, int bufferSize) {
    assertInflates(deflated, inflated.getBytes(Charset.forName("UTF-8")), wrap, windowBits, bufferSize);
  }

  static void assertInflates(byte[] deflated, byte[] inflated, int wrap, int windowBits) {
    assertInflates(deflated, inflated, wrap, windowBits, deflated.length);
  }

  static byte[] byteArray(int... bytes) {
    final int n = bytes.length;
    final byte[] array = new byte[n];
    for (int i = 0; i < n; i += 1) {
      array[i] = (byte) bytes[i];
    }
    return array;
  }

}
