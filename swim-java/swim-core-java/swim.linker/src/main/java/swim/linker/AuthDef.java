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

package swim.linker;

import swim.api.auth.Authenticator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.PolicyDirective;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Value;

public abstract class AuthDef implements Authenticator {
  protected AuthenticatorContext context;

  public AuthenticatorContext getContext() {
    return this.context;
  }

  public void setContext(AuthenticatorContext context) {
    this.context = context;
  }

  public abstract PolicyDirective<Identity> authenticate(Credentials credentials);

  public abstract Value toValue();

  private static Form<AuthDef> authForm;

  @Kind
  public static Form<AuthDef> authForm() {
    if (authForm == null) {
      authForm = new AuthForm();
    }
    return authForm;
  }
}

final class AuthForm extends Form<AuthDef> {
  @Override
  public Class<?> type() {
    return AuthDef.class;
  }

  @Override
  public Item mold(AuthDef authDef) {
    if (authDef != null) {
      return authDef.toValue();
    } else {
      return Item.extant();
    }
  }

  @Override
  public AuthDef cast(Item value) {
    AuthDef authDef = GoogleIdAuthDef.form().cast(value);
    if (authDef != null) {
      return authDef;
    }
    authDef = OpenIdAuthDef.form().cast(value);
    if (authDef != null) {
      return authDef;
    }
    return null;
  }
}
