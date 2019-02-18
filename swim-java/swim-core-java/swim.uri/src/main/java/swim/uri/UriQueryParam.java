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

import swim.codec.Format;
import swim.codec.Output;

final class UriQueryParam extends UriQuery {
  final String key;
  final String value;
  UriQuery tail;
  String string;

  UriQueryParam(String key, String value, UriQuery tail) {
    this.key = key;
    this.value = value;
    this.tail = tail;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public Entry<String, String> head() {
    return new UriQueryEntry(this.key, this.value);
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public String value() {
    return this.value;
  }

  @Override
  public UriQuery tail() {
    return this.tail;
  }

  @Override
  protected void setTail(UriQuery tail) {
    this.tail = tail;
  }

  @Override
  protected UriQuery dealias() {
    return new UriQueryParam(this.key, this.value, this.tail);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriQuery").write('.').write("parse").write('(').write('"')
        .display(this).write('"').write(')');
  }

  @Override
  public void display(Output<?> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      UriQuery.display(this, output);
    }
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = Format.display(this);
    }
    return this.string;
  }
}
