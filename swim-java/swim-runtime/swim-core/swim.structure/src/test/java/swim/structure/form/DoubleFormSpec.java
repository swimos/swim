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

public class DoubleFormSpec {

  @Test
  public void moldDoublesToNums() {
    assertEquals(Form.forDouble().mold(2.5), Num.from(2.5));
  }

  @Test
  public void castNumsToDoubles() {
    assertEquals(Form.forDouble().cast(Num.from(42)), Double.valueOf(42.));
    assertEquals(Form.forDouble().cast(Num.from(-1)), Double.valueOf(-1.));
    assertEquals(Form.forDouble().cast(Num.from(2.5)), Double.valueOf(2.5));
  }

  @Test
  public void castStringsToDoubles() {
    assertEquals(Form.forDouble().cast(Text.from("42")), Double.valueOf(42.));
    assertEquals(Form.forDouble().cast(Text.from("-1")), Double.valueOf(-1.));
  }

  @Test
  public void castFieldsToDoubles() {
    assertEquals(Form.forDouble().cast(Attr.of("a", 42)), Double.valueOf(42.));
    assertEquals(Form.forDouble().cast(Slot.of("a", -1)), Double.valueOf(-1.));
    assertEquals(Form.forDouble().cast(Attr.of("a", "42")), Double.valueOf(42.));
    assertEquals(Form.forDouble().cast(Slot.of("a", "-1")), Double.valueOf(-1.));
  }

  @Test
  public void castAttributedNumsToDoubles() {
    assertEquals(Form.forDouble().cast(Record.of(Attr.of("test"), 42)), Double.valueOf(42.));
  }

}
