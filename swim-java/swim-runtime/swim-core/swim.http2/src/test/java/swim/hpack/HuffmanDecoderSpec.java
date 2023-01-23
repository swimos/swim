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

package swim.hpack;

import java.nio.charset.StandardCharsets;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class HuffmanDecoderSpec {

  @Test
  public void testHuffmanDecoding() {
    assertDecodes(Data.fromBase16("86EDEBF830E2C7932E6CFA34EAD7B36EEDFC38F2FCE7FA38C921659A7374EB45351EBED62136F7F1E7D7B0044CB4DB8EBCFF"),
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
  }

  public static void assertDecodes(Data input, Data expected) {
    for (int i = 0, n = input.size(); i <= n; i += 1) {
      InputBuffer inputBuffer = input.toInputBuffer();
      Output<Data> output = Data.output(expected.size());
      inputBuffer = inputBuffer.index(0).limit(i).isPart(true);
      Input decodedInput = new HuffmanDecodedInput(inputBuffer);
      while (decodedInput.isCont()) {
        output = output.write(decodedInput.head());
        decodedInput = decodedInput.step();
      }
      inputBuffer = inputBuffer.limit(n).isPart(false);
      decodedInput = decodedInput.fork(inputBuffer);
      while (decodedInput.isCont()) {
        output = output.write(decodedInput.head());
        decodedInput = decodedInput.step();
      }
      if (decodedInput.isError()) {
        throw new TestException(decodedInput.trap());
      }
      assertFalse(decodedInput.isCont());
      assertTrue(decodedInput.isDone());
      assertEquals(output.bind(), expected);
    }
  }

  public static void assertDecodes(Data input, String expected) {
    assertDecodes(input, Data.wrap(expected.getBytes(StandardCharsets.UTF_8)));
  }

}
