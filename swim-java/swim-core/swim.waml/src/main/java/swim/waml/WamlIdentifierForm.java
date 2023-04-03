// Copyright 2015-2022 Swim.inc
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

package swim.waml;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ExprParser;
import swim.expr.IdentifierTermForm;

/**
 * A transcoder between WAML identifier literals and values of type {@code T}.
 *
 * @param <T> the type of values transcoded by this {@code WamlIdentifierForm}
 */
@Public
@Since("5.0")
public interface WamlIdentifierForm<T> extends WamlForm<T>, IdentifierTermForm<T> {

  @Override
  default WamlIdentifierForm<? extends T> identifierForm() throws WamlException {
    return this;
  }

  @Override
  @Nullable T identifierValue(String value, ExprParser parser) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParser parser) {
    return parser.parseIdentifier(input, this);
  }

}
