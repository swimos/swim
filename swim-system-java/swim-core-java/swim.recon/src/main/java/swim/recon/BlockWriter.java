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

final class BlockWriter<I, V> extends Writer<Object, Object> {
  final ReconWriter<I, V> recon;
  final Iterator<I> items;
  final boolean inBlock;
  final boolean inMarkup;
  final boolean inBraces;
  final boolean inBrackets;
  final boolean first;
  final boolean markupSafe;
  final I item;
  final I next;
  final Writer<?, ?> part;
  final int step;

  BlockWriter(ReconWriter<I, V> recon, Iterator<I> items, boolean inBlock, boolean inMarkup,
              boolean inBraces, boolean inBrackets, boolean first, boolean markupSafe,
              I item, I next, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.items = items;
    this.inBlock = inBlock;
    this.inMarkup = inMarkup;
    this.inBraces = inBraces;
    this.inBrackets = inBrackets;
    this.first = first;
    this.markupSafe = markupSafe;
    this.item = item;
    this.next = next;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.recon, this.items, this.inBlock, this.inMarkup,
                 this.inBraces, this.inBrackets, this.first, this.markupSafe,
                 this.item, this.next, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, Iterator<I> items,
                           boolean inBlock, boolean inMarkup) {
    int size = 0;
    boolean inBraces = false;
    boolean inBrackets = false;
    boolean first = true;
    boolean markupSafe = true;
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
      if (recon.isExpression(item)) {
        markupSafe = false;
      }
      if (inBrackets && recon.isAttr(item)) {
        if (inBraces) {
          size += 1; // '}'
          inBraces = false;
        }
        size += 1; // ']'
        inBrackets = false;
      }
      if (recon.isAttr(item)) {
        if (inBraces) {
          size += 1; // '}'
          inBraces = false;
        } else if (inBrackets) { // FIXME: case already covered?
          size += 1; // ']'
          inBrackets = false;
        }
        size += recon.sizeOfItem(item);
        first = false;
      } else if (inBrackets && recon.isText(item)) {
        if (inBraces) {
          size += 1; // '}'
          inBraces = false;
        }
        size += recon.sizeOfMarkupText(item);
      } else if (inBraces) {
        if (!first) {
          size += 1; // ','
        } else {
          first = false;
        }
        size += sizeOfBlockItem(recon, item);
      } else if (inBrackets) {
        if (recon.isRecord(item) && recon.isMarkupSafe(recon.items(item))) {
          size += recon.sizeOfBlock(recon.items(item), false, true);
          if (next != null && recon.isText(next)) {
            size += recon.sizeOfMarkupText(next);
            next = null;
          } else if (next != null && !recon.isAttr(next)) {
            size += 1; // '{'
            inBraces = true;
            first = true;
          } else {
            size += 1; // ']'
            inBrackets = false;
          }
        } else {
          size += 1; // '{'
          size += recon.sizeOfItem(item);
          inBraces = true;
          first = false;
        }
      } else if (markupSafe && recon.isText(item) && next != null && !recon.isField(next)
              && !recon.isText(next) && !recon.isBool(next)) {
        size += 1; // '['
        size += recon.sizeOfMarkupText(item);
        inBrackets = true;
      } else if (inBlock && !inBraces) {
        if (!first) {
          size += 1; // ','
        } else {
          first = false;
        }
        size += sizeOfBlockItem(recon, item);
      } else if (inMarkup && recon.isText(item) && next == null) {
        size += 1; // '['
        size += recon.sizeOfMarkupText(item);
        size += 1; // ']'
      } else if (!inMarkup && recon.isValue(item) && !recon.isRecord(item)
             && (!first && next == null || next != null && recon.isAttr(next))) {
        if (!first && (recon.isText(item) && recon.isIdent(item)
                    || recon.isNum(item) || recon.isBool(item))) {
          size += 1; // ' '
        }
        size += recon.sizeOfItem(item);
      } else {
        size += 1; // '{'
        size += recon.sizeOfItem(item);
        inBraces = true;
        first = false;
      }
    }
    if (inBraces) {
      size += 1; // '}'
    }
    if (inBrackets) {
      size += 1; // ']'
    }
    return size;
  }

  static <I, V> int sizeOfBlockItem(ReconWriter<I, V> recon, I item) {
    int size = 0;
    if (recon.isField(item)) {
      size += recon.sizeOfSlot(recon.key(item), recon.value(item));
    } else {
      size += recon.sizeOfItem(item);
    }
    return size;
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon, Iterator<I> items,
                                             boolean inBlock, boolean inMarkup, boolean inBraces,
                                             boolean inBrackets, boolean first, boolean markupSafe,
                                             I item, I next, Writer<?, ?> part, int step) {
    do {
      if (step == 1) {
        if (next == null && !items.hasNext()) {
          step = 10;
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
          if (recon.isExpression(item)) {
            markupSafe = false;
          }
          step = 2;
        }
      }
      if (step == 2 && output.isCont()) {
        if (inBrackets && recon.isAttr(item)) {
          if (inBraces) {
            output = output.write('}');
            inBraces = false;
          }
          step = 3;
        } else {
          step = 4;
        }
      }
      if (step == 3 && output.isCont()) {
        output = output.write(']');
        inBrackets = false;
        step = 4;
      }
      if (step == 4 && output.isCont()) {
        if (recon.isAttr(item)) {
          if (inBraces) {
            output = output.write('}');
            inBraces = false;
          } else if (inBrackets) {
            output = output.write(']');
            inBrackets = false;
          }
          part = recon.writeItem(item, output);
          first = false;
          step = 7;
        } else if (inBrackets && recon.isText(item)) {
          if (inBraces) {
            output = output.write('}');
            inBraces = false;
          }
          part = recon.writeMarkupText(item, output);
          step = 7;
        } else if (inBraces) {
          if (!first) {
            output = output.write(',');
          } else {
            first = false;
          }
          part = writeItem(output, recon, item);
          step = 7;
        } else if (inBrackets) {
          if (recon.isRecord(item) && recon.isMarkupSafe(recon.items(item))) {
            part = recon.writeBlock(recon.items(item), output, false, true);
            step = 5;
          } else {
            output = output.write('{');
            part = recon.writeItem(item, output);
            inBraces = true;
            first = false;
            step = 7;
          }
        } else if (markupSafe && recon.isText(item) && next != null && !recon.isField(next)
                && !recon.isText(next) && !recon.isBool(next)) {
          output = output.write('[');
          part = recon.writeMarkupText(item, output);
          inBrackets = true;
          step = 7;
        } else if (inBlock && !inBraces) {
          if (!first) {
            output = output.write(',');
          } else {
            first = false;
          }
          part = writeItem(output, recon, item);
          step = 7;
        } else if (inMarkup && recon.isText(item) && next == null) {
          output = output.write('[');
          part = recon.writeMarkupText(item, output);
          step = 8;
        } else if (!inMarkup && recon.isValue(item) && !recon.isRecord(item)
               && (!first && next == null || next != null && recon.isAttr(next))) {
          if (!first && (recon.isText(item) && recon.isIdent(item)
                      || recon.isNum(item) || recon.isBool(item))) {
            output = output.write(' ');
          }
          part = recon.writeItem(item, output);
          step = 7;
        } else {
          output = output.write('{');
          part = recon.writeItem(item, output);
          inBraces = true;
          first = false;
          step = 7;
        }
      }
      if (step == 5) {
        part = part.pull(output);
        if (part.isDone()) {
          part = null;
          step = 6;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 6 && output.isCont()) {
        if (next != null && recon.isText(next)) {
          part = recon.writeMarkupText(next, output);
          next = null;
          step = 7;
        } else if (next != null && !recon.isAttr(next)) {
          output = output.write('{');
          inBraces = true;
          first = true;
          step = 1;
          continue;
        } else {
          output = output.write(']');
          inBrackets = false;
          step = 1;
          continue;
        }
      }
      if (step == 7) {
        part = part.pull(output);
        if (part.isDone()) {
          part = null;
          step = 1;
          continue;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 8) {
        part = part.pull(output);
        if (part.isDone()) {
          part = null;
          step = 9;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 9 && output.isCont()) {
        output = output.write(']');
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (step == 10) {
      if (inBraces) {
        if (output.isCont()) {
          output = output.write('}');
          step = 11;
        }
      } else {
        step = 11;
      }
    }
    if (step == 11) {
      if (inBrackets) {
        if (output.isCont()) {
          output = output.write(']');
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
    return new BlockWriter<I, V>(recon, items, inBlock, inMarkup, inBraces, inBrackets,
                                 first, markupSafe, item, next, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             Iterator<I> items, boolean inBlock, boolean inMarkup) {
    return write(output, recon, items, inBlock, inMarkup, false, false, true, true, null, null, null, 1);
  }

  static <I, V> Writer<?, ?> writeItem(Output<?> output, ReconWriter<I, V> recon, I item) {
    if (recon.isField(item)) {
      return recon.writeSlot(recon.key(item), recon.value(item), output);
    } else {
      return recon.writeItem(item, output);
    }
  }
}
