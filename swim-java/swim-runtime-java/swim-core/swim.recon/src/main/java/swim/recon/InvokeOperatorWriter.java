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

package swim.recon;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class InvokeOperatorWriter<I, V> extends Writer<Object, Object> {

  final ReconWriter<I, V> recon;
  final V func;
  final V args;
  final Writer<?, ?> part;
  final int step;

  InvokeOperatorWriter(ReconWriter<I, V> recon, V func, V args, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.func = func;
    this.args = args;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return InvokeOperatorWriter.write(output, this.recon, this.func, this.args, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, V func, V args) {
    int size = 0;
    size += recon.sizeOfValue(func);
    size += 1; // '('
    size += recon.sizeOfBlockValue(args);
    size += 1; // ')'
    return size;
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             V func, V args, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = recon.writeValue(output, func);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 2;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write('(');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = recon.writeBlockValue(output, args);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 4;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 4 && output.isCont()) {
      output = output.write(')');
      return Writer.done();
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new InvokeOperatorWriter<I, V>(recon, func, args, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon, V func, V args) {
    return InvokeOperatorWriter.write(output, recon, func, args, null, 1);
  }

}
