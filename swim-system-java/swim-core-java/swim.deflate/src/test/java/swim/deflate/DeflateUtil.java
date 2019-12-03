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
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

class DeflateUtil {

  /**
   * Reads a given resources by its name removing carriage returns as requested
   *
   * @param resource name of the desired resource
   * @param removeCr whether or not to strip carriage returns
   * @return the requested resource as a byte array
   */
  static byte[] readResource(String resource, boolean removeCr) {
    try (InputStream input = DeflateSpec.class.getResourceAsStream(resource)) {
      final byte[] buffer = new byte[4096];
      ByteArrayOutputStream output = new ByteArrayOutputStream();
      int count;

      while (true) {
        count = input.read(buffer);
        if (count <= 0) {
          break;
        }
        output.write(buffer, 0, count);
      }

      return removeCarriageReturns(output, removeCr);
    } catch (IOException cause) {
      throw new TestException(cause);
    }
  }

  /**
   * Strips carriage returns from the given BAOS if strip is true
   *
   * @param output as a byte array
   * @param strip  whether or not to strip carriage returns
   * @return the stripped BAOS or the original BAOS
   */
  private static byte[] removeCarriageReturns(ByteArrayOutputStream output, boolean strip) {
    if (!strip) {
      return output.toByteArray();
    }

    String str = new String(output.toByteArray());
    return str.replace("\r", "").getBytes();
  }

}
