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
import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;
import static swim.deflate.DeflateUtil.readResource;

public class DeflateSpec {

  @Test
  public void deflateFixed() {
    assertDeflates("Hello",
        byteArray(0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00, 0x00, 0x00, 0xff, 0xff),
        Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH);
  }

  @Test
  public void deflateLencode() {
    assertDeflates("HelloHelloHello",
        byteArray(0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0xf7, 0x80, 0x13, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff),
        Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH);
  }

  @Test
  public void deflateLorem() {
    //writeDeflatedFile(readResource("/lorem.txt"),
    //                  "lorem.txt.deflate",
    //                  Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH);
    assertDeflates(readResource("/lorem.txt", true),
        readResource("/lorem.txt.deflate", false),
        Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH);
  }

  @Test
  public void deflateLoremIncrementally() {
    assertDeflates(readResource("/lorem.txt", true),
        readResource("/lorem.txt.deflate", false),
        Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH, 128);
  }

  @Test
  public void deflateImage() {
    //writeDeflatedFile(readResource("/image.tiff"),
    //                  "image.tiff.deflate",
    //                  Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH);
    assertDeflates(readResource("/image.tiff", false),
        readResource("/image.tiff.deflate", false),
        Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH);
  }

  @Test
  public void deflateImageIncrementally() {
    assertDeflates(readResource("/image.tiff", false),
        readResource("/image.tiff.deflate", false),
        Deflate.Z_NO_WRAP, Deflate.MAX_WBITS, Deflate.Z_SYNC_FLUSH, 1024);
  }

  @Test
  public void gzipImage() {
    //writeDeflatedFile(readResource("/image.tiff"),
    //                  "image.tiff.gz",
    //                  Deflate.Z_WRAP_GZIP, Deflate.MAX_WBITS, Z_FINISH);
    assertDeflates(readResource("/image.tiff", false),
        readResource("/image.tiff.gz", false),
        Deflate.Z_WRAP_GZIP, Deflate.MAX_WBITS, Deflate.Z_FINISH);
  }

  static void assertDeflates(byte[] inflated, byte[] deflated, int wrap, int windowBits, int flush, int bufferSize) {
    final byte[] actual = new byte[deflated.length];
    Encoder<?, byte[]> deflater = new Deflate<>(Binary.byteArrayWriter(inflated), wrap, Deflate.Z_DEFAULT_COMPRESSION, windowBits).flush(flush);
    for (int i = 0; i < actual.length; i += bufferSize) {
      deflater = deflater.pull(Binary.outputBuffer(actual, i, Math.min(bufferSize, actual.length - i)).isPart(actual.length - i > bufferSize));

      if (deflater.isError()) {
        throw new TestException(deflater.trap());
      }
    }

    assertTrue(deflater.isDone());

    for (int i = 0, n = deflated.length; i < n; i += 1) {
      if ((actual[i] & 0xff) != (deflated[i] & 0xff)) {
        fail("expected 0x" + Integer.toHexString(deflated[i] & 0xff)
            + ", but found 0x" + Integer.toHexString(actual[i] & 0xff)
            + " at index " + i);
      }
    }
  }

  static void assertDeflates(String inflated, byte[] deflated, int wrap, int windowBits, int flush) {
    assertDeflates(inflated.getBytes(Charset.forName("UTF-8")), deflated, wrap, windowBits, flush);
  }

  static void assertDeflates(String inflated, byte[] deflated, int wrap, int windowBits, int flush, int bufferSize) {
    assertDeflates(inflated.getBytes(Charset.forName("UTF-8")), deflated, wrap, windowBits, flush, bufferSize);
  }

  static void assertDeflates(byte[] inflated, byte[] deflated, int wrap, int windowBits, int flush) {
    assertDeflates(inflated, deflated, wrap, windowBits, flush, deflated.length);
  }

  static byte[] byteArray(int... bytes) {
    final int n = bytes.length;
    final byte[] array = new byte[n];
    for (int i = 0; i < n; i += 1) {
      array[i] = (byte) bytes[i];
    }
    return array;
  }

  static void writeDeflatedFile(byte[] inflated, String path, int wrap, int windowBits, int flush) {
    final byte[] deflated = new byte[inflated.length];
    final OutputBuffer<?> deflatedBuffer = Binary.outputBuffer(deflated);
    final Deflate<byte[]> deflate = new Deflate<byte[]>(Binary.byteArrayWriter(inflated), wrap, Deflate.Z_DEFAULT_COMPRESSION, windowBits).flush(flush);
    final Encoder<?, byte[]> encoder = deflate.pull(deflatedBuffer);
    if (encoder.isError()) {
      throw new TestException(encoder.trap());
    }
    assertTrue(encoder.isDone());
    try (FileOutputStream output = new FileOutputStream(path)) {
      output.write(deflated, 0, deflatedBuffer.index());
    } catch (IOException cause) {
      throw new TestException(cause);
    }
  }

}
