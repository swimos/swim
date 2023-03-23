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

package swim.http;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Thrown for HTTP errors that should cleanly close the connection.
 */
@Public
@Since("5.0")
public class HttpException extends Exception {

  private final @Nullable HttpStatus status;

  public HttpException(@Nullable HttpStatus status, @Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
    this.status = status;
  }

  public HttpException(@Nullable HttpStatus status, @Nullable String message) {
    super(message);
    this.status = status;
  }

  public HttpException(@Nullable HttpStatus status, @Nullable Throwable cause) {
    super(cause);
    this.status = status;
  }

  public HttpException(@Nullable HttpStatus status) {
    super();
    this.status = status;
  }

  public HttpException(@Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
    this.status = null;
  }

  public HttpException(@Nullable String message) {
    super(message);
    this.status = null;
  }

  public HttpException(@Nullable Throwable cause) {
    super(cause);
    this.status = null;
  }

  public HttpException() {
    super();
    this.status = null;
  }

  public @Nullable HttpStatus getStatus() {
    return this.status;
  }

  @Override
  public @Nullable String getMessage() {
    final String message = super.getMessage();
    if (message != null) {
      return message;
    } else if (this.status != null) {
      return this.status.toString();
    } else {
      return null;
    }
  }

  private static final long serialVersionUID = 1L;

}
