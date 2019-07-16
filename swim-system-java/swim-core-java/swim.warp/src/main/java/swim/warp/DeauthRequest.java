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

public final class DeauthRequest extends HostAddressed {
  public DeauthRequest(Value body) {
    super(body);
  }

  public DeauthRequest() {
    this(Value.absent());
  }

  @Override
  public String tag() {
    return "deauth";
  }

  @Override
  public Form<DeauthRequest> form() {
    return FORM;
  }

  @Override
  public DeauthRequest body(Value body) {
    return new DeauthRequest(body);
  }

  @Kind
  public static final Form<DeauthRequest> FORM = new DeauthRequestForm();
}

final class DeauthRequestForm extends HostAddressedForm<DeauthRequest> {
  @Override
  public String tag() {
    return "deauth";
  }

  @Override
  public Class<?> type() {
    return DeauthRequest.class;
  }

  @Override
  public DeauthRequest from(Value body) {
    return new DeauthRequest(body);
  }
}
