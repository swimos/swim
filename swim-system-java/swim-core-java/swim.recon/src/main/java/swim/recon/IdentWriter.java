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

package swim.recon;

import swim.codec.Output;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.codec.WriterException;

final class IdentWriter extends Writer<Object, Object> {
  final String ident;
  final int index;

  IdentWriter(String ident, int index) {
    this.ident = ident;
    this.index = index;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.ident, this.index);
  }

  static int sizeOf(String ident) {
    return Utf8.sizeOf(ident);
  }

  static Writer<Object, Object> write(Output<?> output, String ident, int index) {
    int c;
    final int length = ident.length();
    if (length == 0) {
      return error(new WriterException("empty identifier"));
    }
    if (index == 0 && output.isCont()) {
      c = ident.codePointAt(0);
      if (Recon.isIdentStartChar(c)) {
        output = output.write(c);
        index = ident.offsetByCodePoints(0, 1);
      }
    }
    while (index < length && output.isCont()) {
      c = ident.codePointAt(index);
      if (Recon.isIdentChar(c)) {
        output = output.write(c);
        index = ident.offsetByCodePoints(index, 1);
      } else {
        return error(new WriterException("invalid identifier"));
      }
    }
    if (index >= length) {
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new IdentWriter(ident, index);
  }

  static Writer<Object, Object> write(Output<?> output, String ident) {
    return write(output, ident, 0);
  }
}
