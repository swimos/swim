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

package swim.http;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.http.header.ConnectionHeader;
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public abstract class HttpMessage<T> implements WriteSource, WriteString {

  HttpMessage() {
    // sealed
  }

  public boolean isClosing() {
    if (this.payload().isCloseDelimited()) {
      return true;
    }
    final ConnectionHeader connectionHeader = this.headers().getHeader(ConnectionHeader.TYPE);
    return connectionHeader != null && connectionHeader.contains("close");
  }

  public abstract HttpVersion version();

  public abstract HttpHeaders headers();

  public abstract HttpMessage<T> withHeaders(HttpHeaders headers);

  public abstract HttpMessage<T> withHeaders(HttpHeader... headers);

  public abstract HttpPayload<T> payload();

  public abstract <T2> HttpMessage<T2> withPayload(HttpPayload<T2> payload);

  public abstract Write<? extends HttpMessage<T>> write(Output<?> output);

  public abstract Write<? extends HttpMessage<T>> write();

}
