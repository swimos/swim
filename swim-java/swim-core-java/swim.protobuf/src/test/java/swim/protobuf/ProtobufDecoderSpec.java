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

package swim.protobuf;

import org.testng.annotations.Test;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;

public class ProtobufDecoderSpec {
  public static void assertDecodes(Data data, Value value) {
    Assertions.assertDecodes(Protobuf.structureDecoder().payloadDecoder(), data, value);
  }

  @Test
  public void decodeVarintFields() {
    assertDecodes(Data.fromBase16("089601"), Record.of(Slot.of(Num.from(1), 150)));
  }

  @Test
  public void decodeTextFields() {
    assertDecodes(Data.fromBase16("120774657374696E67"),
                  Record.of(Slot.of(Num.from(2), "testing")));
  }

  @Test
  public void decodeMessageFields() {
    assertDecodes(Data.fromBase16("1A03089601"),
                  Record.of(Slot.of(Num.from(3), Record.of(Slot.of(Num.from(1), 150)))));
  }
}
