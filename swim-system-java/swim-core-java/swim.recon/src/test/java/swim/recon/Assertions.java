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

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.fail;

public final class Assertions {
  private Assertions() {
    // static
  }

  static <O> void assertParsed(O actual, O expected, String a, String b, int part) {
    if (!actual.equals(expected)) {
      final Output<String> message = Unicode.stringOutput();
      message.write("when parsing part ").debug(part)
          .write(" of ").debug(a).write(", ").debug(b);
      assertEquals(actual, expected, message.toString());
    }
  }

  static void parseFailed(Throwable cause, String a, String b, int part) {
    final Output<String> message = Unicode.stringOutput();
    message.write("failed to parse part ").debug(part)
        .write(" of ").debug(a).write(", ").debug(b).write(": ").write(cause.getMessage());
    fail(message.toString(), cause);
  }

  public static <O> void assertParses(Parser<O> iteratee, String input, O expected) {
    for (int i = 0, n = input.length(); i <= n; i += 1) {
      final String a = input.substring(0, i);
      final String b = input.substring(i, n);

      Parser<O> parser = iteratee.feed(Unicode.stringInput(a).isPart(true));
      if (parser.isDone()) {
        assertParsed(parser.bind(), expected, a, b, 0);
      } else if (parser.isError()) {
        parseFailed(parser.trap(), a, b, 0);
      }

      parser = parser.feed(Unicode.stringInput(b).isPart(true));
      if (parser.isDone()) {
        assertParsed(parser.bind(), expected, a, b, 1);
      } else if (parser.isError()) {
        parseFailed(parser.trap(), a, b, 1);
      }

      parser = parser.feed(Input.done());
      if (parser.isDone()) {
        assertParsed(parser.bind(), expected, a, b, 2);
      } else if (parser.isError()) {
        parseFailed(parser.trap(), a, b, 2);
      } else {
        final Output<String> message = Unicode.stringOutput();
        message.write("failed to completely parse ").debug(a).write(", ").debug(b);
        fail(message.toString());
      }
    }
  }
}
