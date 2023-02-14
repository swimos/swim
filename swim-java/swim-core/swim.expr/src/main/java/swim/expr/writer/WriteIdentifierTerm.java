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

package swim.expr.writer;

import swim.annotations.Internal;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.ExprWriter;

@Internal
public final class WriteIdentifierTerm extends Write<Object> {

  final ExprWriter writer;
  final String identifier;
  final int index;

  public WriteIdentifierTerm(ExprWriter writer, String identifier, int index) {
    this.writer = writer;
    this.identifier = identifier;
    this.index = index;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteIdentifierTerm.write(output, this.writer, this.identifier, this.index);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    String identifier, int index) {
    int c;
    if (identifier.length() == 0) {
      return Write.error(new WriteException("Blank Identifier"));
    }
    if (index == 0 && output.isCont()) {
      c = identifier.codePointAt(0);
      if (writer.isIdentifierStartChar(c)) {
        output.write(c);
        index = identifier.offsetByCodePoints(0, 1);
      }
    }
    while (index < identifier.length() && output.isCont()) {
      c = identifier.codePointAt(index);
      if (writer.isIdentifierChar(c)) {
        output.write(c);
        index = identifier.offsetByCodePoints(index, 1);
      } else {
        return Write.error(new WriteException("Invalid identifier"));
      }
    }
    if (index >= identifier.length()) {
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteIdentifierTerm(writer, identifier, index);
  }

}
