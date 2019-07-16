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
 * Thrown when a {@link Parser} parses invdalid syntax.
 */
public class ParserException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  private final Diagnostic diagnostic;

  public ParserException(Diagnostic diagnostic) {
    super(diagnostic.message());
    this.diagnostic = diagnostic;
  }

  public ParserException(String message, Throwable cause) {
    super(message, cause);
    this.diagnostic = null;
  }

  public ParserException(String message) {
    super(message);
    this.diagnostic = null;
  }

  public ParserException(Throwable cause) {
    super(cause);
    this.diagnostic = null;
  }

  public ParserException() {
    super();
    this.diagnostic = null;
  }

  public Diagnostic getDiagnostic() {
    return this.diagnostic;
  }

  @Override
  public String toString() {
    if (this.diagnostic != null) {
      return this.diagnostic.toString();
    } else {
      return super.toString();
    }
  }
}
