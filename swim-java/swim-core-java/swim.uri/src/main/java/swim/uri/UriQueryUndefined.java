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

import java.util.Map;
import java.util.NoSuchElementException;
import swim.codec.Output;

final class UriQueryUndefined extends UriQuery {
  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public Entry<String, String> head() {
    throw new NoSuchElementException();
  }

  @Override
  public String key() {
    throw new NoSuchElementException();
  }

  @Override
  public String value() {
    throw new NoSuchElementException();
  }

  @Override
  public UriQuery tail() {
    throw new UnsupportedOperationException();
  }

  @Override
  protected void setTail(UriQuery tail) {
    throw new UnsupportedOperationException();
  }

  @Override
  protected UriQuery dealias() {
    return this;
  }

  @Override
  public UriQuery updated(String key, String value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return UriQuery.param(key, value, this);
  }

  @Override
  public UriQuery removed(String key) {
    if (key == null) {
      throw new NullPointerException();
    }
    return this;
  }

  @Override
  public UriQuery appended(String value) {
    return UriQuery.param(value, this);
  }

  @Override
  public UriQuery appended(String key, String value) {
    return UriQuery.param(key, value, this);
  }

  @Override
  public UriQuery appended(String... keyValuePairs) {
    return UriQuery.from(keyValuePairs);
  }

  @Override
  public UriQuery appended(Map<? extends String, ? extends String> params) {
    return UriQuery.from(params);
  }

  @Override
  public UriQuery prepended(String value) {
    return UriQuery.param(value, this);
  }

  @Override
  public UriQuery prepended(String key, String value) {
    return UriQuery.param(key, value, this);
  }

  @Override
  public UriQuery prepended(String... keyValuePairs) {
    return UriQuery.from(keyValuePairs);
  }

  @Override
  public UriQuery prepended(Map<? extends String, ? extends String> params) {
    return UriQuery.from(params);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriQuery").write('.').write("undefined").write('(').write(')');
  }

  @Override
  public void display(Output<?> output) {
    // nop
  }

  @Override
  public String toString() {
    return "";
  }
}
