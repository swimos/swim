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
 * Thrown when parsing invalid input.
 */
@Public
@Since("5.0")
public class ParseException extends DecodeException {

  private final @Nullable Diagnostic diagnostic;

  public ParseException(@Nullable Diagnostic diagnostic, @Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
    this.diagnostic = diagnostic;
  }

  public ParseException(@Nullable Diagnostic diagnostic, @Nullable String message) {
    super(message);
    this.diagnostic = diagnostic;
  }

  public ParseException(@Nullable Diagnostic diagnostic, @Nullable Throwable cause) {
    super(cause);
    this.diagnostic = diagnostic;
  }

  public ParseException(@Nullable Diagnostic diagnostic) {
    super();
    this.diagnostic = diagnostic;
  }

  public ParseException(@Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
    this.diagnostic = null;
  }

  public ParseException(@Nullable String message) {
    super(message);
    this.diagnostic = null;
  }

  public ParseException(@Nullable Throwable cause) {
    super(cause);
    this.diagnostic = null;
  }

  public ParseException() {
    super();
    this.diagnostic = null;
  }

  public @Nullable Diagnostic getDiagnostic() {
    return this.diagnostic;
  }

  @Override
  public @Nullable String getMessage() {
    final String message = super.getMessage();
    if (message != null) {
      return message;
    } else if (this.diagnostic != null) {
      return this.diagnostic.message();
    } else {
      return null;
    }
  }

  private static final long serialVersionUID = 1L;

}
