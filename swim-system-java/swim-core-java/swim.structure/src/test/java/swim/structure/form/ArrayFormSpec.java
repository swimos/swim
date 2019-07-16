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
import swim.structure.Form;
import swim.structure.Num;
import swim.structure.Record;
import static org.testng.Assert.assertEquals;

public class ArrayFormSpec {
  @Test
  public void moldArray() {
    final int[] array = {1, 2, 3};
    assertEquals(Form.forArray(Integer.TYPE, Form.forInteger()).mold(array), Record.of(1, 2, 3));
  }

  @Test
  public void castRecordToArray() {
    final int[] intArray = {1, 2, 3};
    assertEquals(Form.forArray(Integer.TYPE, Form.forInteger()).cast(Record.of(1, "2", 3)), intArray);
    assertEquals(Form.forArray(Integer.TYPE, Form.forInteger()).cast(Record.of(1, "2", "true", 3)), intArray);

    final double[] doubleArray = {1.0, 2.0, 3.0};
    assertEquals(Form.forArray(Double.TYPE, Form.forDouble()).cast(Record.of(1, "2", 3)), doubleArray);
    assertEquals(Form.forArray(Double.TYPE, Form.forDouble()).cast(Record.of(1, "2", "true", 3)), doubleArray);

    final String[] stringArray = {"1", "2", "3"};
    assertEquals(Form.forArray(String.class, Form.forString()).cast(Record.of(1, "2", 3)), stringArray);
  }

  @Test
  public void castValueToUnaryArray() {
    final int[] array = {1};
    assertEquals(Form.forArray(Integer.TYPE, Form.forInteger()).cast(Num.from(1)), array);
  }
}
