// Copyright 2015-2023 Nstream, inc.
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

package swim.http.header;

import java.util.Iterator;
import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.codec.WriterException;
import swim.uri.Uri;

final class OriginHeaderWriter extends Writer<Object, Object> {

  final Iterator<Uri> origins;
  final Uri origin;
  final Writer<?, ?> part;
  final int step;

  OriginHeaderWriter(Iterator<Uri> origins, Uri origin, Writer<?, ?> part, int step) {
    this.origins = origins;
    this.origin = origin;
    this.part = part;
    this.step = step;
  }

  OriginHeaderWriter(Iterator<Uri> origins) {
    this(origins, null, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return OriginHeaderWriter.write(output, this.origins, this.origin, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Iterator<Uri> origins, Uri origin,
                                      Writer<?, ?> part, int step) {
    do {
      if (step == 1) {
        if (part == null) {
          if (!origins.hasNext()) {
            return Writer.done();
          } else {
            origin = origins.next();
            part = Unicode.writeString(output, origin.scheme().toString());
          }
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
        output = output.write(':');
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output = output.write('/');
        step = 4;
      }
      if (step == 4 && output.isCont()) {
        output = output.write('/');
        step = 5;
      }
      if (step == 5) {
        if (part == null) {
          part = Unicode.writeString(output, origin.host().toString());
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          if (origin.port().isDefined()) {
            step = 6;
          } else if (origins.hasNext()) {
            origin = null;
            step = 8;
          } else {
            return Writer.done();
          }
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 6 && output.isCont()) {
        output = output.write(':');
        step = 7;
      }
      if (step == 7) {
        if (part == null) {
          part = Base10.writeInt(output, origin.portNumber());
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          if (origins.hasNext()) {
            origin = null;
            step = 8;
          } else {
            return Writer.done();
          }
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 8 && output.isCont()) {
        output = output.write(' ');
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new OriginHeaderWriter(origins, origin, part, step);
  }

  public static Writer<Object, Object> write(Output<?> output, Iterator<Uri> origins) {
    return OriginHeaderWriter.write(output, origins, null, null, 1);
  }

}
