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

package swim.warp;

import swim.structure.Form;
import swim.structure.Kind;
import swim.structure.Value;

public final class AuthedResponse extends HostAddressed {
  public AuthedResponse(Value body) {
    super(body);
  }

  public AuthedResponse() {
    this(Value.absent());
  }

  @Override
  public String tag() {
    return "authed";
  }

  @Override
  public Form<AuthedResponse> form() {
    return FORM;
  }

  @Override
  public AuthedResponse body(Value body) {
    return new AuthedResponse(body);
  }

  @Kind
  public static final Form<AuthedResponse> FORM = new AuthedResponseForm();
}

final class AuthedResponseForm extends HostAddressedForm<AuthedResponse> {
  @Override
  public String tag() {
    return "authed";
  }

  @Override
  public Class<?> type() {
    return AuthedResponse.class;
  }

  @Override
  public AuthedResponse from(Value body) {
    return new AuthedResponse(body);
  }
}
