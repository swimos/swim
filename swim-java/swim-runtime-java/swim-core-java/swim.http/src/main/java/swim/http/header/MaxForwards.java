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

package swim.http.header;

import swim.codec.Base10;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class MaxForwards extends HttpHeader {

  final int count;

  MaxForwards(int count) {
    this.count = count;
  }

  @Override
  public String lowerCaseName() {
    return "max-forwards";
  }

  @Override
  public String name() {
    return "Max-Forwards";
  }

  public int count() {
    return this.count;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return Base10.writeInt(this.count, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MaxForwards) {
      final MaxForwards that = (MaxForwards) other;
      return this.count == that.count;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MaxForwards.hashSeed == 0) {
      MaxForwards.hashSeed = Murmur3.seed(MaxForwards.class);
    }
    return Murmur3.mash(Murmur3.mix(MaxForwards.hashSeed, this.count));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MaxForwards").write('.').write("create").write('(')
                   .debug(this.count).write(')');
    return output;
  }

  public static MaxForwards create(int count) {
    if (count < 0) {
      throw new IllegalArgumentException(Integer.toString(count));
    }
    return new MaxForwards(count);
  }

  public static Parser<MaxForwards> parseHttpValue(Input input, HttpParser http) {
    return MaxForwardsParser.parse(input);
  }

}
