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

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class RawHeader extends HttpHeader {

  final String lowerCaseName;
  final String name;
  final String value;

  RawHeader(String lowerCaseName, String name, String value) {
    this.lowerCaseName = lowerCaseName;
    this.name = name;
    this.value = value;
  }

  @Override
  public boolean isBlank() {
    return this.value.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return this.lowerCaseName;
  }

  @Override
  public String name() {
    return this.name;
  }

  @Override
  public String value() {
    return this.value;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeField(output, this.value);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof RawHeader) {
      final RawHeader that = (RawHeader) other;
      return this.name.equals(that.name) && this.value.equals(that.value);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (RawHeader.hashSeed == 0) {
      RawHeader.hashSeed = Murmur3.seed(RawHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(RawHeader.hashSeed,
        this.name.hashCode()), this.value.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("RawHeader").write('.').write("create").write('(')
                   .debug(this.name).write(", ").debug(this.value).write(')');
    return output;
  }

  public static RawHeader create(String lowerCaseName, String name, String value) {
    return new RawHeader(lowerCaseName, name, value);
  }

  public static RawHeader create(String name, String value) {
    return new RawHeader(name.toLowerCase(), name, value);
  }

  public static Parser<RawHeader> parseHeaderValue(Input input, HttpParser http,
                                                   String lowerCaseName, String name) {
    return RawHeaderParser.parse(input, lowerCaseName, name);
  }

}
