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
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Value;

/**
 * Transformation between a structurally typed {@link Item} and a {@link
 * BigInteger}.
 */
public final class BigIntegerForm extends Form<BigInteger> {
  final BigInteger unit;

  public BigIntegerForm(BigInteger unit) {
    this.unit = unit;
  }

  @Override
  public BigInteger unit() {
    return this.unit;
  }

  @Override
  public Form<BigInteger> unit(BigInteger unit) {
    return new BigIntegerForm(unit);
  }

  @Override
  public Class<BigInteger> type() {
    return BigInteger.class;
  }

  @Override
  public Item mold(BigInteger value) {
    if (value != null) {
      return Num.from(value);
    } else {
      return Item.extant();
    }
  }

  @Override
  public BigInteger cast(Item item) {
    final Value value = item.target();
    try {
      return value.integerValue();
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
}
