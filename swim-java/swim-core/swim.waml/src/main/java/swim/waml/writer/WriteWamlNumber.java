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
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.waml.WamlAttrForm;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlNumber extends Write<Object> {

  final WamlWriter writer;
  final WamlForm<?> form;
  final String value;
  final Iterator<? extends Map.Entry<String, ?>> attrs;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  public WriteWamlNumber(WamlWriter writer, WamlForm<?> form, String value,
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
    return WriteWamlNumber.write(output, this.writer, this.form, this.value,
                                 this.attrs, this.write, this.index, this.step);
  }

  public static Write<Object> write(Output<?> output, WamlWriter writer,
                                    WamlForm<?> form, String value,
                                    Iterator<? extends Map.Entry<String, ?>> attrs,
                                    @Nullable Write<?> write, int index, int step) {
    do {
      if (step == 1) {
        if (write == null) {
          if (attrs.hasNext()) {
            final Map.Entry<String, ?> attr = attrs.next();
            final String name = attr.getKey();
            final WamlAttrForm<Object, ?> attrForm;
            try {
              attrForm = Assume.conforms(form.getAttrForm(name));
            } catch (WamlException cause) {
              return Write.error(cause);
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
      while (index < value.length() && output.isCont()) {
        output.write(value.codePointAt(index));
        index = value.offsetByCodePoints(index, 1);
      }
      if (index == value.length()) {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlNumber(writer, form, value, attrs, write, index, step);
  }

}
