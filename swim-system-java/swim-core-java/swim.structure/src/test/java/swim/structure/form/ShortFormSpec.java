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

public class ShortFormSpec {
  @Test
  public void moldShortsToNums() {
    assertEquals(Form.forShort().mold((short) 42), Num.from((short) 42));
  }

  @Test
  public void castNumsToShorts() {
    assertEquals(Form.forShort().cast(Num.from(42)), Short.valueOf((short) 42));
    assertEquals(Form.forShort().cast(Num.from(-1)), Short.valueOf((short) -1));
    assertEquals(Form.forShort().cast(Num.from(65537)), Short.valueOf((short) 1));
    assertEquals(Form.forShort().cast(Num.from(2.5)), Short.valueOf((short) 2));
    assertEquals(Form.forShort().cast(Num.from(-2.5f)), Short.valueOf((short) -2));
  }

  @Test
  public void castStringsToShorts() {
    assertEquals(Form.forShort().cast(Text.from("42")), Short.valueOf((short) 42));
    assertEquals(Form.forShort().cast(Text.from("-1")), Short.valueOf((short) -1));
  }

  @Test
  public void castFieldsToShorts() {
    assertEquals(Form.forShort().cast(Attr.of("a", 42)), Short.valueOf((short) 42));
    assertEquals(Form.forShort().cast(Slot.of("a", -1)), Short.valueOf((short) -1));
    assertEquals(Form.forShort().cast(Attr.of("a", "42")), Short.valueOf((short) 42));
    assertEquals(Form.forShort().cast(Slot.of("a", "-1")), Short.valueOf((short) -1));
  }

  @Test
  public void castAttributedNumsToShorts() {
    assertEquals(Form.forShort().cast(Record.of(Attr.of("test"), (short) 42)), Short.valueOf((short) 42));
  }
}
