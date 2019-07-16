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

package swim.codec;

/**
 * Thrown when an {@link Encoder} encodes invalid data.
 */
public class EncoderException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public EncoderException(String message, Throwable cause) {
    super(message, cause);
  }

  public EncoderException(String message) {
    super(message);
  }

  public EncoderException(Throwable cause) {
    super(cause);
  }

  public EncoderException() {
    super();
  }
}
