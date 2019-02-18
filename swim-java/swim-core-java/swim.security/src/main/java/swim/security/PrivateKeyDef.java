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

import java.security.PrivateKey;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.RSAPrivateKey;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;

public abstract class PrivateKeyDef extends KeyDef {
  public abstract PrivateKey privateKey();

  private static Form<PrivateKeyDef> privateKeyForm;

  public static PrivateKeyDef from(PrivateKey key) {
    if (key instanceof ECPrivateKey) {
      return EcPrivateKeyDef.from((ECPrivateKey) key);
    } else if (key instanceof RSAPrivateKey) {
      return RsaPrivateKeyDef.from((RSAPrivateKey) key);
    }
    throw new IllegalArgumentException(key.toString());
  }

  @Kind
  public static Form<PrivateKeyDef> privateKeyForm() {
    if (privateKeyForm == null) {
      privateKeyForm = new PrivateKeyForm();
    }
    return privateKeyForm;
  }
}

final class PrivateKeyForm extends Form<PrivateKeyDef> {
  @Override
  public Class<?> type() {
    return PrivateKeyDef.class;
  }

  @Override
  public Item mold(PrivateKeyDef keyDef) {
    return keyDef.toValue();
  }

  @Override
  public PrivateKeyDef cast(Item item) {
    PrivateKeyDef keyDef = EcPrivateKeyDef.form().cast(item);
    if (keyDef != null) {
      return keyDef;
    }
    keyDef = RsaPrivateKeyDef.form().cast(item);
    if (keyDef != null) {
      return keyDef;
    }
    return null;
  }
}
