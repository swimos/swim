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
import swim.structure.Text;
import static org.testng.Assert.assertEquals;

public class StringFormSpec {
  @Test
  public void moldStrings() {
    assertEquals(Form.forString().mold("test"), Text.from("test"));
  }

  @Test
  public void castTextToStrings() {
    assertEquals(Form.forString().cast(Text.from("test")), "test");
  }

  @Test
  public void castNumsToStrings() {
    assertEquals(Form.forString().cast(Num.from(42)), "42");
  }

  @Test
  public void castAttributedStringsToStrings() {
    assertEquals(Form.forString().cast(Record.of(Attr.of("test"), "foo")), "foo");
  }
}
