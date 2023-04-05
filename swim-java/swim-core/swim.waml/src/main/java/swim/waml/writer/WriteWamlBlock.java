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
import swim.waml.WamlTupleForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlBlock<L, P> extends Write<Object> {

  final WamlWriter writer;
  final WamlTupleForm<L, P, ?, ?> form;
  final Iterator<? extends Map.Entry<L, P>> params;
  final @Nullable L label;
  final @Nullable P param;
  final @Nullable Write<?> write;
  final int step;

  public WriteWamlBlock(WamlWriter writer, WamlTupleForm<L, P, ?, ?> form,
                        Iterator<? extends Map.Entry<L, P>> params,
                        @Nullable L label, @Nullable P param,
                        @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.form = form;
    this.params = params;
    this.label = label;
    this.param = param;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlBlock.write(output, this.writer, this.form, this.params,
                                this.label, this.param, this.write, this.step);
  }

  public static <L, P> Write<Object> write(Output<?> output, WamlWriter writer,
                                           WamlTupleForm<L, P, ?, ?> form,
                                           Iterator<? extends Map.Entry<L, P>> params,
                                           @Nullable L label, @Nullable P param,
                                           @Nullable Write<?> write, int step) {
    do {
      if (step == 1) {
        if (params.hasNext()) {
          final Map.Entry<L, P> entry = params.next();
          label = entry.getKey();
          param = entry.getValue();
          if (label != null) {
            step = 2;
          } else {
            step = 5;
          }
        } else {
          return Write.done();
        }
      }
      if (step == 2) {
        if (write == null) {
          write = form.labelForm().write(output, label, writer);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          label = null;
          write = null;
          step = 3;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(':');
        step = 4;
      }
      if (step == 4) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 5;
          }
        } else {
          step = 5;
        }
      }
      if (step == 5) {
        if (write == null) {
          write = form.paramForm().write(output, param, writer);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          param = null;
          write = null;
          if (params.hasNext()) {
            step = 6;
          } else {
            return Write.done();
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 6 && output.isCont()) {
        output.write(',');
        step = 7;
      }
      if (step == 7) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 1;
            continue;
          }
        } else {
          step = 1;
          continue;
        }
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlBlock<L, P>(writer, form, params, label,
                                    param, write, step);
  }

}
