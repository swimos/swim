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

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.util.Murmur3;

public final class Http2Setting implements Debug {

  final int identifier;
  final int value;

  Http2Setting(int identifier, int value) {
    this.identifier = identifier;
    this.value = value;
  }

  public int identifier() {
    return this.identifier;
  }

  public int value() {
    return this.value;
  }

  public Encoder<?, ?> http2Encoder(Http2Encoder http2) {
    return http2.settingEncoder(this.identifier, this.value);
  }

  public Encoder<?, ?> http2Encoder() {
    return this.http2Encoder(Http2.standardEncoder());
  }

  public Encoder<?, ?> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeSetting(output, this.identifier, this.value);
  }

  public Encoder<?, ?> encodeHttp2(OutputBuffer<?> output) {
    return this.encodeHttp2(output, Http2.standardEncoder());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2Setting) {
      final Http2Setting that = (Http2Setting) other;
      return this.identifier == that.identifier && this.value == that.value;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2Setting.hashSeed == 0) {
      Http2Setting.hashSeed = Murmur3.seed(Http2Setting.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Http2Setting.hashSeed,
        this.identifier), this.value));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2Setting").write('.').write("create").write('(')
                   .debug(this.identifier).write(", ").debug(this.value).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Http2Setting create(int identifier, int value) {
    return new Http2Setting(identifier, value);
  }

}
