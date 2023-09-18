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

package swim.concurrent;

/**
 * Thrown when performing an invalid operation on a {@link TaskFunction}.
 */
public class TaskException extends RuntimeException {

  public TaskException(String message, Throwable cause) {
    super(message, cause);
  }

  public TaskException(String message) {
    super(message);
  }

  public TaskException(Throwable cause) {
    super(cause);
  }

  public TaskException() {
    super();
  }

  private static final long serialVersionUID = 1L;

}
