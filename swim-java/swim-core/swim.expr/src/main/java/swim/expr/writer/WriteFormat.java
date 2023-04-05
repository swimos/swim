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

import java.util.Iterator;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.Evaluator;
import swim.expr.ExprWriter;
import swim.expr.Term;
import swim.util.Assume;

@Internal
public final class WriteFormat extends Write<Object> {

  final ExprWriter writer;
  final Evaluator evaluator;
  final Iterator<Object> parts; // Iterator<String | Term>
  final @Nullable Object part; // String | Term | null
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  public WriteFormat(ExprWriter writer, Evaluator evaluator, Iterator<Object> parts,
                     @Nullable Object part, @Nullable Write<?> write,
                     int index, int escape, int step) {
    this.writer = writer;
    this.evaluator = evaluator;
    this.parts = parts;
    this.part = part;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteFormat.write(output, this.writer, this.evaluator,
                             this.parts, this.part, this.write,
                             this.index, this.escape, this.step);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    Evaluator evaluator, Iterator<Object> parts,
                                    @Nullable Object part, @Nullable Write<?> write,
                                    int index, int escape, int step) {
    do {
      if (step == 1) {
        if (parts.hasNext()) {
          part = parts.next();
          if (part instanceof String) {
            step = 2;
          } else if (part instanceof Term) {
            step = 3;
          } else {
            return Write.error(new WriteException("unsupported format part: " + part));
          }
        } else {
          return Write.done();
        }
      }
      if (step == 2) {
        part = Assume.nonNull(part);
        while (index < ((String) part).length() && output.isCont()) {
          output.write(((String) part).codePointAt(index));
          index = ((String) part).offsetByCodePoints(index, 1);
        }
        if (index >= ((String) part).length()) {
          index = 0;
          step = 1;
          continue;
        }
      }
      if (step == 3) {
        if (write == null) {
          final Term term = ((Term) Assume.nonNull(part)).evaluate(evaluator);
          write = term.writeFormat(output);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 1;
          continue;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteFormat(writer, evaluator, parts, part,
                           write, index, escape, step);
  }

}
