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

package swim.uri;

public class UriException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public UriException(String message, Throwable cause) {
    super(message, cause);
  }

  public UriException(String message) {
    super(message);
  }

  public UriException(Throwable cause) {
    super(cause);
  }

  public UriException() {
    super();
  }
}
