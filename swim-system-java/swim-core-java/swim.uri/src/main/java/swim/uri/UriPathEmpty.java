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

import java.util.Collection;
import java.util.NoSuchElementException;
import swim.codec.Output;

final class UriPathEmpty extends UriPath {
  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public boolean isAbsolute() {
    return false;
  }

  @Override
  public boolean isRelative() {
    return true;
  }

  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public String head() {
    throw new NoSuchElementException();
  }

  @Override
  public UriPath tail() {
    throw new UnsupportedOperationException();
  }

  @Override
  void setTail(UriPath tail) {
    throw new UnsupportedOperationException();
  }

  @Override
  UriPath dealias() {
    return this;
  }

  @Override
  public UriPath parent() {
    return this;
  }

  @Override
  public UriPath base() {
    return this;
  }

  @Override
  public UriPath body() {
    return this;
  }

  @Override
  public UriPath appended(Collection<? extends String> components) {
    return UriPath.from(components);
  }

  @Override
  public UriPath appendedSlash() {
    return UriPath.slash();
  }

  @Override
  public UriPath appendedSegment(String segment) {
    return UriPath.segment(segment);
  }

  @Override
  public UriPath prepended(Collection<? extends String> components) {
    return UriPath.from(components);
  }

  @Override
  public UriPath prependedSlash() {
    return UriPath.slash();
  }

  @Override
  public UriPath prependedSegment(String segment) {
    return UriPath.segment(segment);
  }

  @Override
  public UriPath removeDotSegments() {
    return this;
  }

  @Override
  public UriPath merge(UriPath that) {
    if (that == null) {
      throw new NullPointerException();
    }
    return that;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriPath").write('.').write("empty").write('(').write(')');
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
