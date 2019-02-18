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

package swim.io;

import swim.codec.Debug;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Text;
import swim.structure.Value;

/**
 * Transport-layer security client authentication configuration.
 */
public enum ClientAuth implements Debug {
  /**
   * Client authentication disabled.
   */
  NONE,

  /**
   * Client authentication requested.
   */
  WANT,

  /**
   * Client authentication required.
   */
  NEED;

  @Override
  public void debug(Output<?> output) {
    output = output.write("ClientAuth").write('.').write(name());
  }

  private static Form<ClientAuth> form = new ClientAuthForm();

  /**
   * Returns the {@code ClientAuth} with the given case-insensitive {@code
   * name}, one of <em>none</em>, <em>want</em>, or <em>need</em>.
   *
   * @throws IllegalArgumentException if {@code name} is not a valid {@code
   *         ClientAuth} token.
   */
  public static ClientAuth from(String name) {
    if ("none".equalsIgnoreCase(name)) {
      return NONE;
    } else if ("want".equalsIgnoreCase(name)) {
      return WANT;
    } else if ("need".equalsIgnoreCase(name)) {
      return NEED;
    } else {
      throw new IllegalArgumentException(name);
    }
  }

  /**
   * Returns the structural {@code Form} of {@code ClientAuth}.
   */
  @Kind
  public static Form<ClientAuth> form() {
    if (form == null) {
      form = new ClientAuthForm();
    }
    return form;
  }
}

final class ClientAuthForm extends Form<ClientAuth> {
  @Override
  public Class<?> type() {
    return ClientAuth.class;
  }

  @Override
  public ClientAuth unit() {
    return ClientAuth.NONE;
  }

  @Override
  public Item mold(ClientAuth clientAuth) {
    if (clientAuth != null) {
      switch (clientAuth) {
        case NONE: return Text.from("none");
        case WANT: return Text.from("want");
        case NEED: return Text.from("need");
        default: return Item.absent();
      }
    } else {
      return Item.extant();
    }
  }

  @Override
  public ClientAuth cast(Item item) {
    final Value value = item.target();
    final String string = value.stringValue(null);
    if ("none".equalsIgnoreCase(string)) {
      return ClientAuth.NONE;
    } else if ("want".equalsIgnoreCase(string)) {
      return ClientAuth.WANT;
    } else if ("need".equalsIgnoreCase(string)) {
      return ClientAuth.NEED;
    } else {
      return null;
    }
  }
}
