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

package swim.waml.writer;

import java.util.Iterator;
import java.util.Map;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.waml.WamlAttrForm;
import swim.waml.WamlForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlInteger extends Write<Object> {

  final WamlWriter writer;
  final WamlForm<?> form;
  final long value;
  final Iterator<? extends Map.Entry<String, ?>> attrs;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  public WriteWamlInteger(WamlWriter writer, WamlForm<?> form, long value,
                          Iterator<? extends Map.Entry<String, ?>> attrs,
                          @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.form = form;
    this.value = value;
    this.attrs = attrs;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlInteger.write(output, this.writer, this.form, this.value,
                                  this.attrs, this.write, this.index, this.step);
  }

  public static Write<Object> write(Output<?> output, WamlWriter writer,
                                    WamlForm<?> form, long value,
                                    Iterator<? extends Map.Entry<String, ?>> attrs,
                                    @Nullable Write<?> write, int index, int step) {
    do {
      if (step == 1) {
        if (write == null) {
          if (attrs.hasNext()) {
            final Map.Entry<String, ?> attr = attrs.next();
            final String name = attr.getKey();
            final WamlAttrForm<Object, ?> attrForm = Assume.conformsNullable(form.getAttrForm(name));
            if (attrForm == null) {
              return Write.error(new WriteException("Unsupported attribute: " + name));
            }
            write = writer.writeAttr(output, attrForm, name, attr.getValue());
          } else {
            step = 3;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 2;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 2) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            if (attrs.hasNext()) {
              step = 1;
              continue;
            } else {
              step = 3;
              break;
            }
          }
        } else if (attrs.hasNext()) {
          step = 1;
          continue;
        } else if (output.isCont()) {
          output.write(' ');
          step = 3;
          break;
        }
      }
      break;
    } while (true);
    if (step == 3) {
      if (value < 0L) {
        if (output.isCont()) {
          output.write('-');
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step == 4 && output.isCont()) {
      if (-10L < value && value < 10L) {
        output.write(Base10.encodeDigit(Math.abs((int) value)));
        return Write.done();
      } else {
        final int[] digits = new int[19];
        long x = value;
        int i = 18;
        while (x != 0L) {
          digits[i] = Math.abs((int) (x % 10L));
          x /= 10L;
          i -= 1;
        }
        i += 1 + index;
        while (i < 19 && output.isCont()) {
          output.write(Base10.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 19) {
          return Write.done();
        }
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlInteger(writer, form, value, attrs, write, index, step);
  }

}
