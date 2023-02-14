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
import swim.expr.NumberTermForm;

@Public
@Since("5.0")
public interface WamlNumberForm<T> extends WamlForm<T>, NumberTermForm<T> {

  @Override
  default WamlNumberForm<T> numberForm() {
    return this;
  }

  @Override
  @Nullable T integerValue(long value);

  @Override
  @Nullable T hexadecimalValue(long value, int digits);

  @Override
  @Nullable T bigIntegerValue(String value);

  @Override
  @Nullable T decimalValue(String value);

  @Override
  default Parse<T> parse(Input input, WamlParser parser) {
    return parser.parseNumber(input, this);
  }

}
