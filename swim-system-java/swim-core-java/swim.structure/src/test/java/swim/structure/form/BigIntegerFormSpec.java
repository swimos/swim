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

import java.math.BigInteger;
import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import static org.testng.Assert.assertEquals;

public class BigIntegerFormSpec {

  private static final BigInteger POS = BigInteger.valueOf(Long.MAX_VALUE)
      .add(BigInteger.valueOf(Long.MAX_VALUE >> 4));
  private static final BigInteger NEG = BigInteger.valueOf(Long.MIN_VALUE)
      .subtract(BigInteger.valueOf(Long.MAX_VALUE >> 4));

  @Test
  public void moldBigIntegersToNums() {
    assertEquals(Form.forBigInteger().mold(POS), Num.from(POS));
    assertEquals(Form.forBigInteger().mold(NEG), Num.from(NEG));
  }

  @Test
  public void castNumsToBigIntegers() {
    assertEquals(Form.forBigInteger().cast(Num.from(42)), BigInteger.valueOf(42L));
    assertEquals(Form.forBigInteger().cast(Num.from(-1)), BigInteger.valueOf(-1L));
    assertEquals(Form.forBigInteger().cast(Num.from(2.5)), BigInteger.valueOf(2L));
    assertEquals(Form.forBigInteger().cast(Num.from(-2.5f)), BigInteger.valueOf(-2));
  }

  @Test
  public void castStringsToBigIntegers() {
    assertEquals(Form.forBigInteger().cast(Text.from("9799832789158199294")), POS);
    assertEquals(Form.forBigInteger().cast(Text.from("-9799832789158199295")), NEG);
  }

  @Test
  public void castFieldsToBigIntegers() {
    assertEquals(Form.forBigInteger().cast(Attr.of("a", Num.from(POS))), POS);
    assertEquals(Form.forBigInteger().cast(Slot.of("a", Num.from(NEG))), NEG);
    assertEquals(Form.forBigInteger().cast(Attr.of("a", Num.from(POS))), POS);
    assertEquals(Form.forBigInteger().cast(Slot.of("a", Num.from(NEG))), NEG);
  }

  @Test
  public void castAttributedNumsToIntegers() {
    assertEquals(Form.forBigInteger().cast(Record.of(Attr.of("test"), Num.from(POS))), POS);
  }
}
