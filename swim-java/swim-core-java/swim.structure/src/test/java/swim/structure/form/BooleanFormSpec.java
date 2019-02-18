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
import swim.structure.Bool;
import swim.structure.Form;
import swim.structure.Record;
import swim.structure.Text;
import static org.testng.Assert.assertEquals;

public class BooleanFormSpec {
  @Test
  public void moldBooleans() {
    assertEquals(Form.forBoolean().mold(Boolean.TRUE), Bool.from(true));
    assertEquals(Form.forBoolean().mold(Boolean.FALSE), Bool.from(false));
  }

  @Test
  public void castBoolsToBooleans() {
    assertEquals(Form.forBoolean().cast(Bool.from(true)), Boolean.TRUE);
    assertEquals(Form.forBoolean().cast(Bool.from(false)), Boolean.FALSE);
  }

  @Test
  public void castStringsToBooleans() {
    assertEquals(Form.forBoolean().cast(Text.from("true")), Boolean.TRUE);
    assertEquals(Form.forBoolean().cast(Text.from("false")), Boolean.FALSE);
  }

  @Test
  public void castAttributedBoolToBoolean() {
    assertEquals(Form.forBoolean().cast(Record.of(Attr.of("test"), Bool.from(true))), Boolean.TRUE);
    assertEquals(Form.forBoolean().cast(Record.of(Attr.of("test"), Bool.from(false))), Boolean.FALSE);
  }
}
