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
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class ValueFormSpec {
  @Test
  public void moldValuesToValues() {
    assertEquals(Form.forValue().mold(Num.from(42)), Num.from(42));
    assertEquals(Form.forValue().mold(Num.from(2.5)), Num.from(2.5));
    assertEquals(Form.forValue().mold(Text.from("test")), Text.from("test"));
    assertEquals(Form.forValue().mold(Value.extant()), Value.extant());
    assertEquals(Form.forValue().mold(Value.absent()), Value.absent());
  }

  @Test
  public void castValuesToValues() {
    assertEquals(Form.forValue().cast(Num.from(42)), Num.from(42));
    assertEquals(Form.forValue().cast(Num.from(2.5)), Num.from(2.5));
    assertEquals(Form.forValue().cast(Text.from("test")), Text.from("test"));
    assertEquals(Form.forValue().cast(Value.extant()), Value.extant());
    assertEquals(Form.forValue().cast(Value.absent()), Value.absent());
  }

  @Test
  public void castFieldsToValues() {
    assertEquals(Form.forValue().cast(Attr.of("a", 1)), Num.from(1));
    assertEquals(Form.forValue().cast(Slot.of("a", 1)), Num.from(1));
  }
}
