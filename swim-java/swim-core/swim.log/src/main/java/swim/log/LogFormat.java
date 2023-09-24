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

package swim.log;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.ParseException;
import swim.codec.Write;
import swim.codec.Writer;
import swim.expr.FormatExpr;
import swim.term.Evaluator;
import swim.util.Notation;
import swim.waml.Waml;
import swim.waml.WamlParserOptions;

@Public
@Since("5.0")
public class LogFormat implements Writer<LogEvent> {

  protected final FormatExpr formatExpr;

  public LogFormat(FormatExpr formatExpr) {
    this.formatExpr = formatExpr;
  }

  public final FormatExpr formatExpr() {
    return this.formatExpr;
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable LogEvent event) {
    if (event == null) {
      return Write.done();
    }
    final Evaluator evaluator = new Evaluator(LogEnv.TERM, event);
    return this.formatExpr.writeFormat(output, evaluator);
  }

  static final String DEFAULT_FORMAT = "{time}{topic ? \" \" : \"\"}{topic}{focus ? \" \" : \"\"}{focus}{scope ? \" \" : \"\"}{scope} {level}: {message}{detail ? \"; \" : \"\"}{detail ? $::toWamlBlock(detail) : \"\"}{cause ? \"; \" : \"\"}{cause ? cause : \"\"}";

  private static @Nullable LogFormat provider;

  public static LogFormat provider() {
    if (LogFormat.provider == null) {
      final String formatString = System.getProperty("swim.log.format");
      FormatExpr formatExpr = null;
      if (formatString != null) {
        try {
          formatExpr = FormatExpr.parse(formatString, Waml.metaCodec(), WamlParserOptions.expressions()).getNonNull();
        } catch (ParseException cause) {
          System.err.println(Notation.of("invalid swim.log.format: ")
                                     .appendSource(formatString)
                                     .toString());
        }
      }
      if (formatExpr == null) {
        formatExpr = FormatExpr.parse(DEFAULT_FORMAT, Waml.metaCodec(), WamlParserOptions.expressions()).assertDone().getNonNullUnchecked();
      }
      LogFormat.provider = new LogFormat(formatExpr);
    }
    return LogFormat.provider;
  }

}
