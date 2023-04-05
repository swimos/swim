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
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.waml.WamlAttrForm;
import swim.waml.WamlException;
import swim.waml.WamlMarkupForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlMarkup<N> extends Write<Object> {

  final WamlWriter writer;
  final WamlMarkupForm<N, ?, ?> form;
  final Iterator<? extends N> nodes;
  final Iterator<? extends Map.Entry<String, ?>> attrs;
  final @Nullable String text;
  final @Nullable N node;
  final @Nullable Write<?> write;
  final boolean inline;
  final int index;
  final int escape;
  final int step;

  public WriteWamlMarkup(WamlWriter writer, WamlMarkupForm<N, ?, ?> form,
                         Iterator<? extends N> nodes,
                         Iterator<? extends Map.Entry<String, ?>> attrs,
                         @Nullable String text, @Nullable N node,
                         @Nullable Write<?> write, boolean inline,
                         int index, int escape, int step) {
    this.writer = writer;
    this.form = form;
    this.nodes = nodes;
    this.attrs = attrs;
    this.text = text;
    this.node = node;
    this.write = write;
    this.inline = inline;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlMarkup.write(output, this.writer, this.form, this.nodes,
                                 this.attrs, this.text, this.node, this.write,
                                 this.inline, this.index, this.escape, this.step);
  }

  public static <N> Write<Object> write(Output<?> output, WamlWriter writer,
                                        WamlMarkupForm<N, ?, ?> form,
                                        Iterator<? extends N> nodes,
                                        Iterator<? extends Map.Entry<String, ?>> attrs,
                                        @Nullable String text, @Nullable N node,
                                        @Nullable Write<?> write, boolean inline,
                                        int index, int escape, int step) {
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
        if (!inline && writer.options().whitespace()) {
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
        } else {
          step = 3;
          break;
        }
      }
      break;
    } while (true);
    if (step == 3 && output.isCont()) {
      output.write('<');
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output.write('<');
      step = 5;
    }
    do {
      if (step == 5) {
        if (nodes.hasNext()) {
          node = nodes.next();
          try {
            text = form.asText(node);
            if (text != null) {
              node = null;
              step = 6;
            } else if (form.nodeForm().isInline(node)) {
              step = 13;
            } else {
              step = 14;
            }
          } catch (WamlException cause) {
            return Write.error(cause);
          }
        } else {
          step = 19;
          break;
        }
      }
      if (step == 6 && output.isCont()) {
        text = Assume.nonNull(text);
        if (index < text.length()) {
          final int c = text.codePointAt(index);
          index = text.offsetByCodePoints(index, 1);
          if (c == '<' || c == '>' || c == '@' || c == '\\' || c == '{' || c == '}') {
            output.write('\\');
            escape = c;
            step = 7;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 7;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 7;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 7;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 7;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 7;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 8;
          } else {
            output.write(c);
            continue;
          }
        } else {
          text = null;
          index = 0;
          step = 5;
          continue;
        }
      }
      if (step == 7 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 6;
        continue;
      }
      if (step == 8 && output.isCont()) {
        output.write('u');
        step = 9;
      }
      if (step == 9 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 10;
      }
      if (step == 10 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 11;
      }
      if (step == 11 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 12;
      }
      if (step == 12 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 6;
      }
      if (step == 13) {
        if (write == null) {
          write = form.nodeForm().writeInline(output, node, writer);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          node = null;
          step = 5;
          continue;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 14 && output.isCont()) {
        output.write('{');
        step = 15;
      }
      if (step == 15) {
        if (write == null) {
          write = form.nodeForm().write(output, node, writer);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          if (nodes.hasNext()) {
            node = nodes.next();
            try {
              text = form.asText(node);
              if (text != null) {
                node = null;
                step = 18;
              } else if (form.nodeForm().isInline(node)) {
                step = 18;
              } else {
                step = 16;
              }
            } catch (WamlException cause) {
              return Write.error(cause);
            }
          } else {
            node = null;
            step = 18;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 16 && output.isCont()) {
        output.write(',');
        step = 17;
      }
      if (step == 17) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 15;
            continue;
          }
        } else {
          step = 15;
          continue;
        }
      }
      if (step == 18 && output.isCont()) {
        output.write('}');
        if (node != null) {
          step = 13;
        } else if (text != null) {
          step = 6;
        } else {
          step = 5;
        }
        continue;
      }
      break;
    } while (true);
    if (step == 19 && output.isCont()) {
      output.write('>');
      step = 20;
    }
    if (step == 20 && output.isCont()) {
      output.write('>');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlMarkup<N>(writer, form, nodes, attrs, text, node,
                                  write, inline, index, escape, step);
  }

}
