// Copyright 2015-2023 Nstream, inc.
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

public class FloatFormSpec {

  @Test
  public void moldFloatsToNums() {
    assertEquals(Form.forFloat().mold(2.5F), Num.from(2.5F));
  }

  @Test
  public void castNumsToFloats() {
    assertEquals(Form.forFloat().cast(Num.from(42)), Float.valueOf(42f));
    assertEquals(Form.forFloat().cast(Num.from(-1)), Float.valueOf(-1f));
    assertEquals(Form.forFloat().cast(Num.from(2.5)), Float.valueOf(2.5f));
  }

  @Test
  public void castStringsToFloats() {
    assertEquals(Form.forFloat().cast(Text.from("42")), Float.valueOf(42f));
    assertEquals(Form.forFloat().cast(Text.from("-1")), Float.valueOf(-1f));
  }

  @Test
  public void castFieldsToFloats() {
    assertEquals(Form.forFloat().cast(Attr.of("a", 42)), Float.valueOf(42f));
    assertEquals(Form.forFloat().cast(Slot.of("a", -1)), Float.valueOf(-1f));
    assertEquals(Form.forFloat().cast(Attr.of("a", "42")), Float.valueOf(42f));
    assertEquals(Form.forFloat().cast(Slot.of("a", "-1")), Float.valueOf(-1f));
  }

  @Test
  public void castAttributedNumsToFloats() {
    assertEquals(Form.forFloat().cast(Record.of(Attr.of("test"), 42)), Float.valueOf(42f));
  }

}
