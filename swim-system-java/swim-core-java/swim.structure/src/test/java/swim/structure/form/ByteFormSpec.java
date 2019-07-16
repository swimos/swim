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

package swim.structure.form;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import static org.testng.Assert.assertEquals;

public class ByteFormSpec {
  @Test
  public void moldBytesToNums() {
    assertEquals(Form.forByte().mold((byte) 42), Num.from(42));
  }

  @Test
  public void castNumsToBytes() {
    assertEquals(Form.forByte().cast(Num.from(42)), Byte.valueOf((byte) 42));
    assertEquals(Form.forByte().cast(Num.from(-1)), Byte.valueOf((byte) -1));
    assertEquals(Form.forByte().cast(Num.from(257)), Byte.valueOf((byte) 1));
    assertEquals(Form.forByte().cast(Num.from(2.5)), Byte.valueOf((byte) 2));
    assertEquals(Form.forByte().cast(Num.from(-2.5f)), Byte.valueOf((byte) -2));
  }

  @Test
  public void castTextToBytes() {
    assertEquals(Form.forByte().cast(Text.from("42")), Byte.valueOf((byte) 42));
    assertEquals(Form.forByte().cast(Text.from("-1")), Byte.valueOf((byte) -1));
  }

  @Test
  public void castFieldsToBytes() {
    assertEquals(Form.forByte().cast(Attr.of("a", 42)), Byte.valueOf((byte) 42));
    assertEquals(Form.forByte().cast(Slot.of("a", -1)), Byte.valueOf((byte) -1));
    assertEquals(Form.forByte().cast(Attr.of("a", "42")), Byte.valueOf((byte) 42));
    assertEquals(Form.forByte().cast(Slot.of("a", "-1")), Byte.valueOf((byte) -1));
  }

  @Test
  public void castAttributedNumsToBytes() {
    assertEquals(Form.forByte().cast(Record.of(Attr.of("test"), (byte) 42)), Byte.valueOf((byte) 42));
  }
}
