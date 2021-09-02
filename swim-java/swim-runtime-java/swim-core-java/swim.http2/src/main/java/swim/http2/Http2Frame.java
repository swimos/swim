// Copyright 2015-2021 Swim Inc.
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

package swim.http2;

import swim.codec.Encoder;
import swim.codec.OutputBuffer;

public abstract class Http2Frame<T> {

  public abstract int frameType();

  public abstract int frameFlags();

  public abstract int streamIdentifier();

  public abstract Encoder<?, ?> http2Encoder(Http2Encoder http);

  public Encoder<?, ?> http2Encoder() {
    return this.http2Encoder(Http2.standardEncoder());
  }

  public abstract Encoder<?, ?> encodeHttp2(OutputBuffer<?> output, Http2Encoder http);

  public Encoder<?, ?> encodeHttp2(OutputBuffer<?> output) {
    return this.encodeHttp2(output, Http2.standardEncoder());
  }

}
