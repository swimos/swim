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
import swim.codec.Codec;
import swim.codec.Encode;
import swim.codec.MediaType;
import swim.codec.OutputBuffer;

@Public
@Since("5.0")
public abstract class HttpPayload<T> {

  HttpPayload() {
    // sealed
  }

  /**
   * Returns {@code true} if this payload is delimited by the end of the stream.
   */
  public abstract boolean isCloseDelimited();

  public abstract @Nullable T get();

  public abstract Codec<T> codec();

  public MediaType contentType() {
    return this.codec().mediaType();
  }

  public abstract HttpHeaders injectHeaders(HttpHeaders headers);

  public HttpHeaders headers() {
    return this.injectHeaders(HttpHeaders.of());
  }

  public abstract HttpHeaders trailers();

  public abstract Encode<? extends HttpPayload<T>> encode(OutputBuffer<?> output);

  public abstract Encode<? extends HttpPayload<T>> encode();

}
