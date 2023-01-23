// Copyright 2015-2023 Swim.inc
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

import swim.codec.Output;
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.http.HttpHeader;
import swim.http.HttpWriter;
import swim.uri.Uri;
import swim.util.Murmur3;

public class LocationHeader extends HttpHeader {

  final Uri url;

  LocationHeader(Uri url) {
    this.url = url;
  }

  @Override
  public String lowerCaseName() {
    return "location";
  }

  @Override
  public String name() {
    return "Location";
  }

  public Uri location() {
    return this.url;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return Unicode.writeString(output, this.url);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LocationHeader) {
      final LocationHeader that = (LocationHeader) other;
      return this.url.equals(that.url);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (LocationHeader.hashSeed == 0) {
      LocationHeader.hashSeed = Murmur3.seed(LocationHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(LocationHeader.hashSeed, this.url.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("LocationHeader").write('.').write("create")
         .write('(').write(this.url.toString()).write(')');

    return output;
  }

  public static LocationHeader create(Uri url) {
    return new LocationHeader(url);
  }

}
