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

package swim.auth;

import swim.api.auth.Authenticator;
import swim.api.auth.AuthenticatorDef;
import swim.kernel.KernelProxy;
import swim.structure.Item;
import swim.structure.Value;

public class AuthenticatorKernel extends KernelProxy {
  final double kernelPriority;

  public AuthenticatorKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public AuthenticatorKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public AuthenticatorDef defineAuthenticator(Item authenticatorConfig) {
    AuthenticatorDef authenticatorDef = GoogleIdAuthenticatorDef.form().cast(authenticatorConfig);
    if (authenticatorDef == null) {
      authenticatorDef = OpenIdAuthenticatorDef.form().cast(authenticatorConfig);
    }
    return authenticatorDef != null ? authenticatorDef : super.defineAuthenticator(authenticatorConfig);
  }

  @Override
  public Authenticator createAuthenticator(AuthenticatorDef authenticatorDef, ClassLoader classLoader) {
    if (authenticatorDef instanceof GoogleIdAuthenticatorDef) {
      return new GoogleIdAuthenticator((GoogleIdAuthenticatorDef) authenticatorDef);
    } else if (authenticatorDef instanceof OpenIdAuthenticatorDef) {
      return new OpenIdAuthenticator((OpenIdAuthenticatorDef) authenticatorDef);
    } else {
      return super.createAuthenticator(authenticatorDef, classLoader);
    }
  }

  private static final double KERNEL_PRIORITY = 0.9;

  public static AuthenticatorKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || AuthenticatorKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new AuthenticatorKernel(kernelPriority);
    }
    return null;
  }
}
