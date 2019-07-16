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

package swim.math;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Record;
import static org.testng.Assert.assertEquals;

public class TensorArraySpec {
  @SuppressWarnings("checkstyle:ConstantName")
  static final TensorArraySpace<TensorArray<VectorR2, Double>, VectorR2, Double> R2x2 = TensorArray.space(R2.space(), 2);
  @SuppressWarnings("checkstyle:ConstantName")
  static final TensorForm<TensorArray<VectorR2, Double>> R2x2_FORM = R2x2.form(VectorR2.form());

  @Test
  public void testMold() {
    assertEquals(R2x2_FORM.mold(R2x2.of(VectorR2.of(2.0, 0.5), VectorR2.of(4.0, -1.0))),
                 Record.of(Attr.of("tensor", Record.of(Record.of(Attr.of("vector", Record.of(2.0, 0.5))),
                                                       Record.of(Attr.of("vector", Record.of(4.0, -1.0)))))));
  }

  @Test
  public void testCast() {
    assertEquals(R2x2_FORM.cast(Record.of(Attr.of("tensor", Record.of(Record.of(Attr.of("vector", Record.of(2.0, 0.5))),
                                                                      Record.of(Attr.of("vector", Record.of(4.0, -1.0))))))),
                 R2x2.of(VectorR2.of(2.0, 0.5), VectorR2.of(4.0, -1.0)));
  }

  @Test
  public void testAdd() {
    assertEquals(R2x2.add(R2x2.of(VectorR2.of(2.0, 0.5), VectorR2.of(4.0, -1.0)),
                          R2x2.of(VectorR2.of(4.0, 1.0), VectorR2.of(8.0, -2.0))),
                 R2x2.of(VectorR2.of(6.0, 1.5), VectorR2.of(12.0, -3.0)));
  }
}
