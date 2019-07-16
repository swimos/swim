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

import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class HttpVersionWriter extends Writer<Object, Object> {
  final int major;
  final int minor;
  final int step;

  HttpVersionWriter(int major, int minor, int step) {
    this.major = major;
    this.minor = minor;
    this.step = step;
  }

  HttpVersionWriter(int major, int minor) {
    this(major, minor, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.major, this.minor, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, int major, int minor, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('H');
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write('T');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output = output.write('T');
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output = output.write('P');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write('/');
      step = 6;
    }
    if (step == 6 && output.isCont()) {
      output = output.write(Base10.encodeDigit(major % 10));
      step = 7;
    }
    if (step == 7 && output.isCont()) {
      output = output.write('.');
      step = 8;
    }
    if (step == 8 && output.isCont()) {
      output = output.write(Base10.encodeDigit(minor % 10));
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpVersionWriter(major, minor, step);
  }

  static Writer<Object, Object> write(Output<?> output, int major, int minor) {
    return write(output, major, minor, 1);
  }
}
