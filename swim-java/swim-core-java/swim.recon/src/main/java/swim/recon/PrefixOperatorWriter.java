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
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.codec.WriterException;

final class PrefixOperatorWriter<I, V> extends Writer<Object, Object> {
  final ReconWriter<I, V> recon;
  final String operator;
  final I rhs;
  final int precedence;
  final Writer<?, ?> part;
  final int step;

  PrefixOperatorWriter(ReconWriter<I, V> recon, String operator, I rhs,
                       int precedence, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.operator = operator;
    this.rhs = rhs;
    this.precedence = precedence;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.recon, this.operator, this.rhs,
                 this.precedence, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, String operator, I rhs, int precedence) {
    int size = 0;
    size += Utf8.sizeOf(operator);
    if (recon.precedence(rhs) < precedence) {
      size += 1; // '('
      size += recon.sizeOfItem(rhs);
      size += 1; // ')'
    } else {
      size += recon.sizeOfItem(rhs);
    }
    return size;
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             String operator, I rhs, int precedence,
                                             Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = Unicode.writeString(operator, output);
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
    if (step == 2) {
      if (recon.precedence(rhs) < precedence) {
        if (output.isCont()) {
          output = output.write('(');
          step = 3;
        }
      } else {
        step = 3;
      }
    }
    if (step == 3) {
      if (part == null) {
        part = recon.writeItem(rhs, output);
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
    if (step == 4) {
      if (recon.precedence(rhs) < precedence) {
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
    return new PrefixOperatorWriter<I, V>(recon, operator, rhs, precedence, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             String operator, I rhs, int precedence) {
    return write(output, recon, operator, rhs, precedence, null, 1);
  }
}
