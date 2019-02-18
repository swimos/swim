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

package swim.http;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class QValueWriter extends Writer<Object, Object> {
  final int weight;
  final int step;

  QValueWriter(int weight, int step) {
    this.weight = weight;
    this.step = step;
  }

  QValueWriter(float weight) {
    if (weight < 0f || weight > 1f) {
      throw new HttpException("invalid qvalue: " + weight);
    }
    this.weight = (int) (weight * 1000f);
    this.step = 1;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.weight, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, int weight, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write(';');
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write(' ');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output = output.write('q');
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output = output.write('=');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write('0' + (weight / 1000));
      weight %= 1000;
      if (weight == 0) {
        return done();
      } else {
        step = 6;
      }
    }
    if (step == 6 && output.isCont()) {
      output = output.write('.');
      step = 7;
    }
    if (step == 7 && output.isCont()) {
      output = output.write('0' + (weight / 100));
      weight %= 100;
      if (weight == 0) {
        return done();
      } else {
        step = 8;
      }
    }
    if (step == 8 && output.isCont()) {
      output = output.write('0' + (weight / 10));
      weight %= 10;
      if (weight == 0) {
        return done();
      } else {
        step = 9;
      }
    }
    if (step == 9 && output.isCont()) {
      output = output.write('0' + weight);
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new QValueWriter(weight, step);
  }

  static Writer<Object, Object> write(Output<?> output, float weight) {
    if (weight >= 0f && weight <= 1f) {
      return write(output, (int) (weight * 1000f), 1);
    } else {
      return error(new HttpException("invalid qvalue: " + weight));
    }
  }
}
