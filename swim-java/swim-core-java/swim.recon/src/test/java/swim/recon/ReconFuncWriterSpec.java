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
import static swim.recon.ReconWriterSpec.assertWrites;

public class ReconFuncWriterSpec {
  @Test
  public void writeFreeLambdaFunc() {
    assertWrites(Value.extant().lambda(Num.from(0)), "() => 0");
  }

  @Test
  public void writeValueBindingConstantLambdaFunc() {
    assertWrites(Text.from("x").lambda(Num.from(0)), "x => 0");
  }

  @Test
  public void writeValueBindingSelectorLambdaFunc() {
    assertWrites(Text.from("x").lambda(Selector.identity().get("x")), "x => $x");
  }

  @Test
  public void writeValueBindingBlockLambdaFunc() {
    assertWrites(Text.from("x").lambda(Record.of(Selector.identity().get("x").plus(Selector.identity().get("x")))), "x => {$x + $x}");
  }

  @Test
  public void writeParamBindingConstantLambdaFunc() {
    assertWrites(Record.of("x").lambda(Num.from(0)), "(x) => 0");
  }

  @Test
  public void writeParamBindingSelectorLambdaFunc() {
    assertWrites(Record.of("x").lambda(Selector.identity().get("x")), "(x) => $x");
  }

  @Test
  public void writeParamBindingBlockLambdaFunc() {
    assertWrites(Record.of("x").lambda(Record.of(Selector.identity().get("x").plus(Selector.identity().get("x")))), "(x) => {$x + $x}");
  }

  @Test
  public void writeParamsBindingConstantLambdaFunc() {
    assertWrites(Record.of("x", "y").lambda(Num.from(0)), "(x,y) => 0");
  }

  @Test
  public void writeParamsBindingSelectorLambdaFunc() {
    assertWrites(Record.of("x", "y").lambda(Selector.identity().get("x").plus(Selector.identity().get("y"))), "(x,y) => $x + $y");
  }

  @Test
  public void writeParamsBindingRecordLambdaFunc() {
    assertWrites(Record.of("x", "y").lambda(Record.of(Selector.identity().get("x").plus(Selector.identity().get("y")))), "(x,y) => {$x + $y}");
  }

  @Test
  public void writePrefixAttributedValueBindingSelectorLambdaFunc() {
    assertWrites(Record.of(Attr.of("pure"), "x").lambda(Selector.identity().get("x")), "@pure x => $x");
  }

  @Test
  public void writePrefixAttributedParamBindingSelectorLambdaFunc() {
    assertWrites(Record.of(Attr.of("pure"), Record.of("x")).lambda(Selector.identity().get("x")), "@pure ({x}) => $x");
  }

  @Test
  public void writePrefixAttributedParamsBindingSelectorLambdaFunc() {
    assertWrites(Record.of(Attr.of("pure"), "x", "y").lambda(Selector.identity().get("x").plus(Selector.identity().get("y"))), "@pure (x,y) => $x + $y");
  }

  @Test
  public void writePostfixAttributedValueBindingSelectorLambdaFunc() {
    assertWrites(Record.of("x", Attr.of("pure")).lambda(Selector.identity().get("x")), "x@pure => $x");
  }
}
