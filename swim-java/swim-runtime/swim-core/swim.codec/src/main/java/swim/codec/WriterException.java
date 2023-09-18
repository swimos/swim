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

package swim.codec;

/**
 * Thrown when a {@link Writer} attempts to write invalid syntax.
 */
public class WriterException extends RuntimeException {

  public WriterException(String message, Throwable cause) {
    super(message, cause);
  }

  public WriterException(String message) {
    super(message);
  }

  public WriterException(Throwable cause) {
    super(cause);
  }

  public WriterException() {
    super();
  }

  private static final long serialVersionUID = 1L;

}
