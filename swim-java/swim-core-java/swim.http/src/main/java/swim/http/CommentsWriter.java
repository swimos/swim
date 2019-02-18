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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class CommentsWriter extends Writer<Object, Object> {
  final Iterator<String> comments;
  final String comment;
  final int index;
  final int escape;
  final int step;

  CommentsWriter(Iterator<String> comments, String comment, int index, int escape, int step) {
    this.comments = comments;
    this.comment = comment;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  CommentsWriter(Iterator<String> comments) {
    this(comments, null, 0, 0, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.comments, this.comment, this.index, this.escape, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Iterator<String> comments,
                                      String comment, int index, int escape, int step) {
    do {
      if (step == 1) {
        if (!comments.hasNext()) {
          return done();
        } else if (output.isCont()) {
          output = output.write(' ');
          comment = comments.next();
          index = 0;
          step = 2;
        }
      }
      if (step == 2 && output.isCont()) {
        output = output.write('(');
        step = 3;
      }
      if (step == 3) {
        final int length = comment.length();
        while (index < length && output.isCont()) {
          final int c = comment.codePointAt(index);
          if (Http.isCommentChar(c)) {
            output = output.write(c);
          } else if (Http.isVisibleChar(c)) {
            output = output.write('\\');
            escape = c;
            step = 4;
            break;
          } else {
            return error(new HttpException("invalid comment: " + comment));
          }
          index = comment.offsetByCodePoints(index, 1);
        }
        if (index == length) {
          comment = null;
          index = 0;
          step = 5;
        }
      }
      if (step == 4 && output.isCont()) {
        output = output.write(escape);
        escape = 0;
        step = 3;
        continue;
      } else if (step == 5 && output.isCont()) {
        output = output.write(')');
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new CommentsWriter(comments, comment, index, escape, step);
  }

  public static Writer<Object, Object> write(Output<?> output, Iterator<String> comments) {
    return write(output, comments, null, 0, 0, 1);
  }
}
