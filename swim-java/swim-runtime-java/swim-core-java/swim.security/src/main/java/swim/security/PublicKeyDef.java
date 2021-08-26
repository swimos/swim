// Copyright 2015-2021 Swim Inc.
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

import java.security.PublicKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPublicKey;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;

public abstract class PublicKeyDef extends KeyDef {

  public abstract PublicKey publicKey();

  public static PublicKeyDef from(PublicKey key) {
    if (key instanceof ECPublicKey) {
      return EcPublicKeyDef.from((ECPublicKey) key);
    } else if (key instanceof RSAPublicKey) {
      return RsaPublicKeyDef.from((RSAPublicKey) key);
    }
    throw new IllegalArgumentException(key.toString());
  }

  private static Form<PublicKeyDef> publicKeyForm;

  @Kind
  public static Form<PublicKeyDef> publicKeyForm() {
    if (PublicKeyDef.publicKeyForm == null) {
      PublicKeyDef.publicKeyForm = new PublicKeyForm();
    }
    return PublicKeyDef.publicKeyForm;
  }

}

final class PublicKeyForm extends Form<PublicKeyDef> {

  @Override
  public Class<?> type() {
    return PublicKeyDef.class;
  }

  @Override
  public Item mold(PublicKeyDef keyDef) {
    return keyDef.toValue();
  }

  @Override
  public PublicKeyDef cast(Item item) {
    PublicKeyDef keyDef = EcPublicKeyDef.form().cast(item);
    if (keyDef != null) {
      return keyDef;
    }
    keyDef = RsaPublicKeyDef.form().cast(item);
    if (keyDef != null) {
      return keyDef;
    }
    return null;
  }

}
