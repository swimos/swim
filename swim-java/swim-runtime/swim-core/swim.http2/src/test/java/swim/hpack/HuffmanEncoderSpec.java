// Copyright 2015-2022 Swim.inc
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
import org.testng.annotations.Test;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;

public class HuffmanEncoderSpec {

  @Test
  public void testHuffmanEncoding() {
    assertEncodes("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                  Data.fromBase16("86EDEBF830E2C7932E6CFA34EAD7B36EEDFC38F2FCE7FA38C921659A7374EB45351EBED62136F7F1E7D7B0044CB4DB8EBCFF"));
  }

  public static void assertEncodes(Data input, Data expected) {
    InputBuffer inputBuffer = input.toInputBuffer();
    Output<Data> encodedOutput = new HuffmanEncodedOutput<Data>(Data.output(expected.size()));
    while (inputBuffer.isCont()) {
      encodedOutput = encodedOutput.write(inputBuffer.head());
      inputBuffer = inputBuffer.step();
    }
    encodedOutput = encodedOutput.flush();
    assertEquals(encodedOutput.bind(), expected);
  }

  public static void assertEncodes(String input, Data expected) {
    assertEncodes(Data.wrap(input.getBytes(StandardCharsets.UTF_8)), expected);
  }

}
