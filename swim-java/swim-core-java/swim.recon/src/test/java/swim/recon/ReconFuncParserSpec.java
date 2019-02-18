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

package swim.recon;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Text;
import swim.structure.Value;
import static swim.recon.ReconParserSpec.assertParses;

public class ReconFuncParserSpec {
  @Test
  public void parseFreeLambdaFunc() {
    assertParses("() => 0", Value.extant().lambda(Num.from(0)));
  }

  @Test
  public void parseValueBindingConstantLambdaFunc() {
    assertParses("x => 0", Text.from("x").lambda(Num.from(0)));
  }

  @Test
  public void parseValueBindingSelectorLambdaFunc() {
    assertParses("x => $x", Text.from("x").lambda(Selector.identity().get("x")));
  }

  @Test
  public void parseValueBindingBlockLambdaFunc() {
    assertParses("x => {$x + $x}", Text.from("x").lambda(Record.of(Selector.identity().get("x").plus(Selector.identity().get("x")))));
  }

  @Test
  public void parseParamBindingConstantLambdaFunc() {
    assertParses("(x) => 0", Text.from("x").lambda(Num.from(0)));
  }

  @Test
  public void parseParamBindingSelectorLambdaFunc() {
    assertParses("(x) => $x", Text.from("x").lambda(Selector.identity().get("x")));
  }

  @Test
  public void parseParamBindingBlockLambdaFunc() {
    assertParses("(x) => {$x + $x}", Text.from("x").lambda(Record.of(Selector.identity().get("x").plus(Selector.identity().get("x")))));
  }

  @Test
  public void parseParamsBindingConstantLambdaFunc() {
    assertParses("(x, y) => 0", Record.of("x", "y").lambda(Num.from(0)));
  }

  @Test
  public void parseParamsBindingSelectorLambdaFunc() {
    assertParses("(x, y) => $x + $y", Record.of("x", "y").lambda(Selector.identity().get("x").plus(Selector.identity().get("y"))));
  }

  @Test
  public void parseParamsBindingRecordLambdaFunc() {
    assertParses("(x, y) => {$x + $y}", Record.of("x", "y").lambda(Record.of(Selector.identity().get("x").plus(Selector.identity().get("y")))));
  }

  @Test
  public void parsePrefixAttributedValueBindingSelectorLambdaFunc() {
    assertParses("@pure x => $x", Record.of(Attr.of("pure"), "x").lambda(Selector.identity().get("x")));
  }

  @Test
  public void parsePrefixAttributedParamBindingSelectorLambdaFunc() {
    assertParses("@pure (x) => $x", Record.of(Attr.of("pure"), "x").lambda(Selector.identity().get("x")));
  }

  @Test
  public void parsePrefixAttributedParamsBindingSelectorLambdaFunc() {
    assertParses("@pure (x, y) => $x + $y", Record.of(Attr.of("pure"), "x", "y").lambda(Selector.identity().get("x").plus(Selector.identity().get("y"))));
  }

  @Test
  public void parsePostfixAttributedValueBindingSelectorLambdaFunc() {
    assertParses("x @pure => $x", Record.of("x", Attr.of("pure")).lambda(Selector.identity().get("x")));
  }
}
