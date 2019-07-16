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

public class CharacterFormSpec {
  @Test
  public void moldCharacters() {
    assertEquals(Form.forCharacter().mold('*'), Num.from(42));
  }

  @Test
  public void castNumsToCharacters() {
    assertEquals(Form.forCharacter().cast(Num.from(42)), Character.valueOf('*'));
    assertEquals(Form.forCharacter().cast(Num.from(65)), Character.valueOf('A'));
  }

  @Test
  public void castStringsToCharacters() {
    assertEquals(Form.forCharacter().cast(Text.from("*")), Character.valueOf('*'));
    assertEquals(Form.forCharacter().cast(Text.from("A")), Character.valueOf('A'));
  }

  @Test
  public void castAttributedNumsToCharacters() {
    assertEquals(Form.forCharacter().cast(Record.of(Attr.of("test"), (char) 42)), Character.valueOf('*'));
  }
}
