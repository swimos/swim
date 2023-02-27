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

package swim.http.header;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class ExpectHeader extends HttpHeader {

  ExpectHeader(String name, String value) {
    super(name, value);
  }

  @Override
  public ExpectHeader withValue(String newValue) {
    return ExpectHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ExpectHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Expect";

  public static final HttpHeaderType<String> TYPE = new ExpectHeaderType();

  public static ExpectHeader of(String name, String value) {
    return new ExpectHeader(name, value);
  }

  public static ExpectHeader of(String value) {
    return new ExpectHeader(NAME, value);
  }

}

final class ExpectHeaderType implements HttpHeaderType<String>, ToSource {

  @Override
  public String name() {
    return ExpectHeader.NAME;
  }

  @Override
  public String getValue(HttpHeader header) {
    return ((ExpectHeader) header).value();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return ExpectHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String value) {
    return this.of(this.name(), value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("ExpectHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
