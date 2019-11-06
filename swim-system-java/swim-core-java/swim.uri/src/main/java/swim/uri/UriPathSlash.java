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

final class UriPathSlash extends UriPath {
  UriPath tail;
  String string;

  UriPathSlash(UriPath tail) {
    this.tail = tail;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public boolean isAbsolute() {
    return true;
  }

  @Override
  public boolean isRelative() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public String head() {
    return "/";
  }

  @Override
  public UriPath tail() {
    return this.tail;
  }

  @Override
  void setTail(UriPath tail) {
    this.tail = tail;
  }

  @Override
  UriPath dealias() {
    return new UriPathSlash(this.tail);
  }

  @Override
  public UriPath parent() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      final UriPath next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.slash();
      } else {
        return new UriPathSlash(tail.parent());
      }
    }
  }

  @Override
  public UriPath base() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return this;
    } else {
      return new UriPathSlash(tail.base());
    }
  }

  @Override
  public UriPath body() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      final UriPath next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.slash();
      } else {
        return new UriPathSlash(tail.body());
      }
    }
  }

  @Override
  public UriPath prependedSegment(String segment) {
    return UriPath.segment(segment, this);
  }

  public UriPath merge(UriPath that) {
    if (that == null) {
      throw new NullPointerException();
    }
    return UriPath.merge(this, that);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriPath").write('.').write("parse").write('(').write('"')
        .display(this).write('"').write(')');
  }

  @Override
  public void display(Output<?> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      UriPath.display(this, output);
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
