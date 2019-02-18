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

package swim.security;

import java.math.BigInteger;
import java.security.spec.ECField;
import java.security.spec.ECFieldF2m;
import java.security.spec.ECFieldFp;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Value;

public abstract class EcFieldDef {
  public abstract ECField toECField();

  public abstract Value toValue();

  private static Form<EcFieldDef> form;

  public static EcFieldDef from(ECField field) {
    if (field instanceof ECFieldFp) {
      return EcPrimeFieldDef.from((ECFieldFp) field);
    } else if (field instanceof ECFieldF2m) {
      return EcCharacteristic2FieldDef.from((ECFieldF2m) field);
    } else {
      throw new IllegalArgumentException(field.toString());
    }
  }

  @Kind
  public static Form<EcFieldDef> form() {
    if (form == null) {
      form = new EcFieldForm();
    }
    return form;
  }
}

final class EcFieldForm extends Form<EcFieldDef> {
  @Override
  public String tag() {
    return "ECField";
  }

  @Override
  public Class<?> type() {
    return EcFieldDef.class;
  }

  @Override
  public Item mold(EcFieldDef fieldDef) {
    return fieldDef.toValue();
  }

  @Override
  public EcFieldDef cast(Item item) {
    final Value value = item.toValue();
    final Value header = value.getAttr(tag());
    if (header.isDefined()) {
      final BigInteger prime = value.get("prime").integerValue(null);
      if (prime != null) {
        return new EcPrimeFieldDef(prime);
      }
      final int size = header.get("size").intValue(0);
      final BigInteger basis = value.get("basis").integerValue(null);
      if (size > 0 && basis != null) {
        return new EcCharacteristic2FieldDef(size, basis);
      }
    }
    return null;
  }
}
