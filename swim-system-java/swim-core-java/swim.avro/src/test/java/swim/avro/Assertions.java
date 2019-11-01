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

package swim.avro;

import org.testng.TestException;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public final class Assertions {
  private Assertions() {
    // static
  }

  public static <T> void assertDecodes(Decoder<T> decodee, InputBuffer input, T expected) {
    for (int i = 0, n = input.remaining(); i <= n; i += 1) {
      Decoder<?> decoder = decodee;
      assertTrue(decoder.isCont());
      assertFalse(decoder.isDone());
      assertFalse(decoder.isError());
      input = input.index(0).limit(i).isPart(true);
      decoder = decoder.feed(input);
      input = input.limit(n).isPart(false);
      decoder = decoder.feed(input);
      if (decoder.isError()) {
        throw new TestException(decoder.trap());
      }
      assertFalse(decoder.isCont());
      assertTrue(decoder.isDone());
      assertFalse(decoder.isError());
      assertEquals(decoder.bind(), expected);
    }
  }

  public static <T> void assertDecodes(Decoder<T> decodee, Data input, T expected) {
    assertDecodes(decodee, Binary.inputBuffer(input.toByteBuffer()), expected);
  }
}
