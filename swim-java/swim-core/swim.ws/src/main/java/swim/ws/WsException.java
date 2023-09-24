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

package swim.ws;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Thrown for WebSocket errors that should cleanly close the connection.
 */
@Public
@Since("5.0")
public class WsException extends Exception {

  private final @Nullable WsStatus status;

  public WsException(@Nullable WsStatus status, @Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
    this.status = status;
  }

  public WsException(@Nullable WsStatus status, @Nullable String message) {
    super(message);
    this.status = status;
  }

  public WsException(@Nullable WsStatus status, @Nullable Throwable cause) {
    super(cause);
    this.status = status;
  }

  public WsException(@Nullable WsStatus status) {
    super();
    this.status = status;
  }

  public WsException(@Nullable String message, @Nullable Throwable cause) {
    super(message, cause);
    this.status = null;
  }

  public WsException(@Nullable String message) {
    super(message);
    this.status = null;
  }

  public WsException(@Nullable Throwable cause) {
    super(cause);
    this.status = null;
  }

  public WsException() {
    super();
    this.status = null;
  }

  public @Nullable WsStatus getStatus() {
    return this.status;
  }

  @Override
  public @Nullable String getMessage() {
    final String message = super.getMessage();
    if (message != null) {
      return message;
    } else if (this.status != null) {
      return this.status.toString();
    }
    return null;
  }

  private static final long serialVersionUID = 1L;

}
