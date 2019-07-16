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

public final class DeauthedResponse extends HostAddressed {
  public DeauthedResponse(Value body) {
    super(body);
  }

  public DeauthedResponse() {
    this(Value.absent());
  }

  @Override
  public String tag() {
    return "deauthed";
  }

  @Override
  public Form<DeauthedResponse> form() {
    return FORM;
  }

  @Override
  public DeauthedResponse body(Value body) {
    return new DeauthedResponse(body);
  }

  @Kind
  public static final Form<DeauthedResponse> FORM = new DeauthedResponseForm();
}

final class DeauthedResponseForm extends HostAddressedForm<DeauthedResponse> {
  @Override
  public String tag() {
    return "deauthed";
  }

  @Override
  public Class<?> type() {
    return DeauthedResponse.class;
  }

  @Override
  public DeauthedResponse from(Value body) {
    return new DeauthedResponse(body);
  }
}
