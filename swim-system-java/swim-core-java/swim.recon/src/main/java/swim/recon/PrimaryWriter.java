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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class PrimaryWriter<I, V> extends Writer<Object, Object> {
  final ReconWriter<I, V> recon;
  final Iterator<I> items;
  final boolean inParens;
  final boolean first;
  final I item;
  final I next;
  final Writer<?, ?> part;
  final int step;

  PrimaryWriter(ReconWriter<I, V> recon, Iterator<I> items, boolean inParens,
                boolean first, I item, I next, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.items = items;
    this.inParens = inParens;
    this.first = first;
    this.item = item;
    this.next = next;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.recon, this.items, this.inParens, this.first,
                 this.item, this.next, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, Iterator<I> items) {
    int size = 0;
    boolean inParens = false;
    boolean first = true;
    I next = null;
    while (next != null || items.hasNext()) {
      final I item;
      if (next == null) {
        item = items.next();
      } else {
        item = next;
        next = null;
      }
      if (items.hasNext()) {
        next = items.next();
      }
      if (!inParens && !first) {
        size += 1; // ' '
      }
      if (recon.isAttr(item)) {
        if (inParens) {
          size += 1; // ')'
          inParens = false;
        }
        size += recon.sizeOfItem(item);
        first = false;
      } else if (inParens) {
        if (!first) {
          size += 1; // ','
        } else {
          first = false;
        }
        size += recon.sizeOfBlockItem(item);
      } else if (recon.isValue(item) && !recon.isRecord(item)
             && (!first && next == null || next != null && recon.isAttr(next))) {
        size += recon.sizeOfItem(item);
      } else {
        size += 1; // '('
        size += recon.sizeOfItem(item);
        inParens = true;
        first = false;
      }
    }
    if (inParens) {
      size += 1; // ')'
    }
    return size;
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             Iterator<I> items, boolean inParens, boolean first,
                                             I item, I next, Writer<?, ?> part, int step) {
    do {
      if (step == 1) {
        if (next == null && !items.hasNext()) {
          step = 5;
          break;
        } else {
          if (next == null) {
            item = items.next();
          } else {
            item = next;
            next = null;
          }
          if (items.hasNext()) {
            next = items.next();
          }
          step = 2;
        }
      }
      if (step == 2 && output.isCont()) {
        if (!inParens && !first) {
          output = output.write(' ');
        }
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        if (recon.isAttr(item)) {
          if (inParens) {
            output = output.write(')');
            inParens = false;
          }
          part = recon.writeItem(item, output);
          first = false;
          step = 4;
        } else if (inParens) {
          if (!first) {
            output = output.write(',');
          } else {
            first = false;
          }
          part = recon.writeBlockItem(item, output);
          step = 4;
        } else if (recon.isValue(item) && !recon.isRecord(item)
               && (!first && next == null || next != null && recon.isAttr(next))) {
          part = recon.writeItem(item, output);
          step = 4;
        } else {
          output = output.write('(');
          part = recon.writeItem(item, output);
          inParens = true;
          first = false;
          step = 4;
        }
      }
      if (step == 4) {
        part = part.pull(output);
        if (part.isDone()) {
          part = null;
          step = 1;
          continue;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      break;
    } while (true);
    if (step == 5) {
      if (inParens) {
        if (output.isCont()) {
          output = output.write(')');
          return done();
        }
      } else {
        return done();
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new PrimaryWriter<I, V>(recon, items, inParens, first, item, next, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             Iterator<I> items) {
    return write(output, recon, items, false, true, null, null, null, 1);
  }
}
