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

public class IntegerFormSpec {
  @Test
  public void moldIntegersToNums() {
    assertEquals(Form.forInteger().mold(42), Num.from(42));
  }

  @Test
  public void castNumsToIntegers() {
    assertEquals(Form.forInteger().cast(Num.from(42)), Integer.valueOf(42));
    assertEquals(Form.forInteger().cast(Num.from(-1)), Integer.valueOf(-1));
    assertEquals(Form.forInteger().cast(Num.from(4294967297L)), Integer.valueOf(1));
    assertEquals(Form.forInteger().cast(Num.from(2.5)), Integer.valueOf(2));
    assertEquals(Form.forInteger().cast(Num.from(-2.5f)), Integer.valueOf(-2));
  }

  @Test
  public void castStringsToIntegers() {
    assertEquals(Form.forInteger().cast(Text.from("42")), Integer.valueOf(42));
    assertEquals(Form.forInteger().cast(Text.from("-1")), Integer.valueOf(-1));
  }

  @Test
  public void castFieldsToIntegers() {
    assertEquals(Form.forInteger().cast(Attr.of("a", 42)), Integer.valueOf(42));
    assertEquals(Form.forInteger().cast(Slot.of("a", -1)), Integer.valueOf(-1));
    assertEquals(Form.forInteger().cast(Attr.of("a", "42")), Integer.valueOf(42));
    assertEquals(Form.forInteger().cast(Slot.of("a", "-1")), Integer.valueOf(-1));
  }

  @Test
  public void castAttributedNumsToIntegers() {
    assertEquals(Form.forInteger().cast(Record.of(Attr.of("test"), 42)), Integer.valueOf(42));
  }
}
