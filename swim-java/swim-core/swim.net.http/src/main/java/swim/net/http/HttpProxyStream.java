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

package swim.net.http;

import java.nio.ByteBuffer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.InputFuture;
import swim.codec.OutputBuffer;
import swim.codec.OutputFuture;

@Public
@Since("5.0")
public final class HttpProxyStream {

  final ByteBuffer buffer;
  final DecodeHttpProxyStream decode;
  final EncodeHttpProxyStream encode;

  public HttpProxyStream(ByteBuffer buffer) {
    this.buffer = buffer;
    this.decode = new DecodeHttpProxyStream(this);
    this.encode = new EncodeHttpProxyStream(this);
  }

  public Decode<?> decode() {
    return this.decode;
  }

  public Encode<?> encode() {
    return this.encode;
  }

}

final class DecodeHttpProxyStream extends Decode<Object> {

  final HttpProxyStream stream;
  @Nullable InputFuture future;

  DecodeHttpProxyStream(HttpProxyStream stream) {
    this.stream = stream;
    this.future = null;
  }

  @Override
  public Decode<Object> consume(InputBuffer input) {
    // TODO
    return this;
  }

  @Override
  public boolean backoff(InputFuture future) {
    this.future = future;
    return true;
  }

}

final class EncodeHttpProxyStream extends Encode<Object> {

  final HttpProxyStream stream;
  @Nullable OutputFuture future;

  EncodeHttpProxyStream(HttpProxyStream stream) {
    this.stream = stream;
    this.future = null;
  }

  @Override
  public Encode<Object> produce(OutputBuffer<?> output) {
    // TODO
    return this;
  }

  @Override
  public boolean backoff(OutputFuture future) {
    this.future = future;
    return true;
  }

}
