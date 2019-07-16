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

import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Value;

public abstract class KeyDef {
  public abstract Key key();

  public abstract Value toValue();

  private static Form<KeyDef> keyForm;

  public static KeyDef from(Key key) {
    if (key instanceof PublicKey) {
      return PublicKeyDef.from((PublicKey) key);
    } else if (key instanceof PrivateKey) {
      return PrivateKeyDef.from((PrivateKey) key);
    }
    throw new IllegalArgumentException(key.toString());
  }

  @Kind
  public static Form<KeyDef> keyForm() {
    if (keyForm == null) {
      keyForm = new KeyForm();
    }
    return keyForm;
  }
}

final class KeyForm extends Form<KeyDef> {
  @Override
  public Class<?> type() {
    return KeyDef.class;
  }

  @Override
  public Item mold(KeyDef keyDef) {
    return keyDef.toValue();
  }

  @Override
  public KeyDef cast(Item item) {
    KeyDef keyDef = PublicKeyDef.publicKeyForm().cast(item);
    if (keyDef != null) {
      return keyDef;
    }
    keyDef = PrivateKeyDef.privateKeyForm().cast(item);
    if (keyDef != null) {
      return keyDef;
    }
    return null;
  }
}
