// Copyright 2015-2023 Nstream, inc.
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
import swim.term.TermException;

/**
 * Thrown when a waml error occurs.
 */
@Public
@Since("5.0")
public class WamlException extends TermException {

  public WamlException(@Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
  }

  public WamlException(@Nullable String message) {
    super(message);
  }

  public WamlException(@Nullable Throwable cause) {
    super(cause);
  }

  public WamlException() {
    super();
  }

  private static final long serialVersionUID = 1L;

}
