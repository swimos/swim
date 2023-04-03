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

package swim.codec;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Thrown when reading invalid input.
 */
@Public
@Since("5.0")
public class InputException extends CodecException {

  public InputException(@Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
  }

  public InputException(@Nullable String message) {
    super(message);
  }

  public InputException(@Nullable Throwable cause) {
    super(cause);
  }

  public InputException() {
    super();
  }

  private static final long serialVersionUID = 1L;

}
