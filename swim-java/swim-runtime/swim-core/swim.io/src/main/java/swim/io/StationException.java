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

package swim.io;

/**
 * Thrown when a {@link Station} encounters an error.
 */
public class StationException extends RuntimeException {

  public StationException(String message, Throwable cause) {
    super(message, cause);
  }

  public StationException(String message) {
    super(message);
  }

  public StationException(Throwable cause) {
    super(cause);
  }

  public StationException() {
    super();
  }

  private static final long serialVersionUID = 1L;

}
